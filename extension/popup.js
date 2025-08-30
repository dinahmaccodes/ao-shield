// AO Shield Extension Popup JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializePopup();
});

function initializePopup() {
  // Load stored data
  loadStats();
  loadRecentActivity();

  // Set up event listeners
  setupEventListeners();

  // Update status
  updateSecurityStatus();
}

function setupEventListeners() {
  // Scan current page button
  const scanPageBtn = document.getElementById("scanPage");
  scanPageBtn.addEventListener("click", scanCurrentPage);

  // Settings button
  const settingsBtn = document.getElementById("viewSettings");
  settingsBtn.addEventListener("click", openSettings);

  // Footer links
  const reportThreatBtn = document.getElementById("reportThreat");
  const learnMoreBtn = document.getElementById("learnMore");

  reportThreatBtn.addEventListener("click", reportThreat);
  learnMoreBtn.addEventListener("click", learnMore);
}

async function loadStats() {
  try {
    const result = await chrome.storage.local.get([
      "threatsBlocked",
      "scansToday",
    ]);

    document.getElementById("threatsBlocked").textContent =
      result.threatsBlocked || 0;
    document.getElementById("scansToday").textContent = result.scansToday || 0;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

async function loadRecentActivity() {
  try {
    const result = await chrome.storage.local.get(["recentActivity"]);
    const activities = result.recentActivity || [];

    const activityList = document.getElementById("activityList");

    if (activities.length === 0) {
      activityList.innerHTML = `
                <div class="activity-item safe">
                    <div class="activity-icon">✓</div>
                    <div class="activity-content">
                        <div class="activity-title">AO Shield Active</div>
                        <div class="activity-time">Protection enabled</div>
                    </div>
                </div>
            `;
      return;
    }

    activityList.innerHTML = activities
      .map(
        (activity) => `
            <div class="activity-item ${activity.type}">
                <div class="activity-icon">${getActivityIcon(
                  activity.type
                )}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${formatTime(
                      activity.timestamp
                    )}</div>
                </div>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error loading recent activity:", error);
  }
}

function getActivityIcon(type) {
  switch (type) {
    case "safe":
      return "✓";
    case "warning":
      return "⚠️";
    case "danger":
      return "⛔";
    default:
      return "ℹ️";
  }
}

function formatTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now - time) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440)
    return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

async function updateSecurityStatus() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Check if current page has been scanned
    const result = await chrome.storage.local.get(["pageScans"]);
    const pageScans = result.pageScans || {};
    const currentPageScan = pageScans[tab.url];

    const statusDot = document.querySelector(".status-dot");
    const statusText = document.querySelector(".status-text");

    if (currentPageScan) {
      if (currentPageScan.threats > 0) {
        statusDot.className = "status-dot danger";
        statusText.textContent = "Threats Detected";
        statusText.style.color = "#ef4444";
      } else if (currentPageScan.warnings > 0) {
        statusDot.className = "status-dot warning";
        statusText.textContent = "Warnings Found";
        statusText.style.color = "#f59e0b";
      } else {
        statusDot.className = "status-dot active";
        statusText.textContent = "Protected";
        statusText.style.color = "#22c55e";
      }
    } else {
      statusDot.className = "status-dot active";
      statusText.textContent = "Protected";
      statusText.style.color = "#22c55e";
    }
  } catch (error) {
    console.error("Error updating security status:", error);
  }
}

async function scanCurrentPage() {
  const scanBtn = document.getElementById("scanPage");
  const originalText = scanBtn.innerHTML;

  // Show loading state
  scanBtn.innerHTML = '<span class="btn-icon">⏳</span>Scanning...';
  scanBtn.disabled = true;

  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Send message to content script to start scan
    await chrome.tabs.sendMessage(tab.id, { action: "scanPage" });

    // Simulate scan delay
    setTimeout(async () => {
      // Update scan count
      const result = await chrome.storage.local.get(["scansToday"]);
      const newCount = (result.scansToday || 0) + 1;
      await chrome.storage.local.set({ scansToday: newCount });

      // Add activity
      await addActivity({
        type: "safe",
        title: "Page Scan Completed",
        timestamp: Date.now(),
      });

      // Refresh popup data
      loadStats();
      loadRecentActivity();
      updateSecurityStatus();

      // Reset button
      scanBtn.innerHTML = originalText;
      scanBtn.disabled = false;
    }, 2000);
  } catch (error) {
    console.error("Error scanning page:", error);
    scanBtn.innerHTML = originalText;
    scanBtn.disabled = false;
  }
}

async function addActivity(activity) {
  try {
    const result = await chrome.storage.local.get(["recentActivity"]);
    const activities = result.recentActivity || [];

    // Add new activity at the beginning
    activities.unshift(activity);

    // Keep only last 5 activities
    const trimmedActivities = activities.slice(0, 5);

    await chrome.storage.local.set({ recentActivity: trimmedActivities });
  } catch (error) {
    console.error("Error adding activity:", error);
  }
}

function openSettings() {
  // Open options page
  chrome.runtime.openOptionsPage();
}

function reportThreat() {
  // Open threat reporting form
  chrome.tabs.create({
    url: "https://github.com/your-repo/ao-shield/issues/new?template=threat-report.md",
  });
}

function learnMore() {
  // Open AO Shield documentation
  chrome.tabs.create({
    url: "https://your-website.com/docs",
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updatePopup") {
    loadStats();
    loadRecentActivity();
    updateSecurityStatus();
  }
});
