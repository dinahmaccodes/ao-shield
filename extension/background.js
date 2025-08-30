// AO Shield Background Service Worker

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  console.log("AO Shield Extension installed");

  // Set default values
  chrome.storage.local.set({
    threatsBlocked: 0,
    scansToday: 0,
    recentActivity: [],
    settings: {
      enabled: true,
      realTimeScanning: true,
      warningLevel: "medium",
      notifications: true,
    },
  });

  // Create daily reset alarm
  chrome.alarms.create("dailyReset", {
    delayInMinutes: getMinutesUntilMidnight(),
    periodInMinutes: 24 * 60,
  });
});

// Handle daily reset
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyReset") {
    chrome.storage.local.set({ scansToday: 0 });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "threatDetected":
      handleThreatDetected(message.data, sender.tab);
      break;
    case "pageScanned":
      handlePageScanned(message.data, sender.tab);
      break;
    case "getSettings":
      getSettings().then(sendResponse);
      return true; // Keep message channel open for async response
    default:
      break;
  }
});

async function handleThreatDetected(threatData, tab) {
  try {
    // Update threat count
    const result = await chrome.storage.local.get(["threatsBlocked"]);
    const newCount = (result.threatsBlocked || 0) + 1;
    await chrome.storage.local.set({ threatsBlocked: newCount });

    // Add to recent activity
    await addActivity({
      type: "danger",
      title: `Threat Blocked: ${threatData.type}`,
      timestamp: Date.now(),
      url: tab.url,
    });

    // Show notification if enabled
    const settings = await getSettings();
    if (settings.notifications) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "AO Shield - Threat Detected",
        message: `Blocked ${threatData.type} on ${new URL(tab.url).hostname}`,
      });
    }

    // Update badge
    updateBadge(tab.id, "danger");
  } catch (error) {
    console.error("Error handling threat detection:", error);
  }
}

async function handlePageScanned(scanData, tab) {
  try {
    // Store scan results
    const result = await chrome.storage.local.get(["pageScans"]);
    const pageScans = result.pageScans || {};
    pageScans[tab.url] = {
      ...scanData,
      timestamp: Date.now(),
    };
    await chrome.storage.local.set({ pageScans });

    // Update badge based on scan results
    if (scanData.threats > 0) {
      updateBadge(tab.id, "danger");
    } else if (scanData.warnings > 0) {
      updateBadge(tab.id, "warning");
    } else {
      updateBadge(tab.id, "safe");
    }

    // Notify popup to update
    chrome.runtime.sendMessage({ action: "updatePopup" });
  } catch (error) {
    console.error("Error handling page scan:", error);
  }
}

async function getSettings() {
  try {
    const result = await chrome.storage.local.get(["settings"]);
    return (
      result.settings || {
        enabled: true,
        realTimeScanning: true,
        warningLevel: "medium",
        notifications: true,
      }
    );
  } catch (error) {
    console.error("Error getting settings:", error);
    return {};
  }
}

async function addActivity(activity) {
  try {
    const result = await chrome.storage.local.get(["recentActivity"]);
    const activities = result.recentActivity || [];

    activities.unshift(activity);
    const trimmedActivities = activities.slice(0, 10); // Keep last 10

    await chrome.storage.local.set({ recentActivity: trimmedActivities });
  } catch (error) {
    console.error("Error adding activity:", error);
  }
}

function updateBadge(tabId, status) {
  let badgeText = "";
  let badgeColor = "#22c55e"; // Green for safe

  switch (status) {
    case "danger":
      badgeText = "!";
      badgeColor = "#ef4444"; // Red
      break;
    case "warning":
      badgeText = "?";
      badgeColor = "#f59e0b"; // Yellow
      break;
    case "safe":
      badgeText = "";
      badgeColor = "#22c55e"; // Green
      break;
  }

  chrome.action.setBadgeText({ text: badgeText, tabId });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId });
}

// Tab change listener to update badge
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const result = await chrome.storage.local.get(["pageScans"]);
    const pageScans = result.pageScans || {};
    const scanData = pageScans[tab.url];

    if (scanData) {
      if (scanData.threats > 0) {
        updateBadge(tab.id, "danger");
      } else if (scanData.warnings > 0) {
        updateBadge(tab.id, "warning");
      } else {
        updateBadge(tab.id, "safe");
      }
    } else {
      updateBadge(tab.id, "safe");
    }
  } catch (error) {
    console.error("Error updating badge on tab change:", error);
  }
});

function getMinutesUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return Math.ceil((midnight - now) / (1000 * 60));
}

// Periodic cleanup of old data
setInterval(async () => {
  try {
    const result = await chrome.storage.local.get(["pageScans"]);
    const pageScans = result.pageScans || {};
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Remove scans older than 1 day
    Object.keys(pageScans).forEach((url) => {
      if (pageScans[url].timestamp < oneDayAgo) {
        delete pageScans[url];
      }
    });

    await chrome.storage.local.set({ pageScans });
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}, 60 * 60 * 1000); // Run every hour
