// AO Shield Content Script - Web3 Detection and Protection

(function () {
  "use strict";

  let isInitialized = false;
  let settings = {};

  // Initialize content script
  init();

  async function init() {
    if (isInitialized) return;
    isInitialized = true;

    console.log("AO Shield: Initializing protection...");

    // Get settings
    settings = await getSettings();

    if (!settings.enabled) {
      console.log("AO Shield: Protection disabled");
      return;
    }

    // Detect Web3 environment
    detectWeb3Environment();

    // Start monitoring
    if (settings.realTimeScanning) {
      startRealTimeMonitoring();
    }

    // Inject protection script
    injectProtectionScript();

    console.log("AO Shield: Protection active");
  }

  function detectWeb3Environment() {
    const web3Indicators = {
      ethereum: !!window.ethereum,
      web3: !!window.web3,
      metamask: !!(window.ethereum && window.ethereum.isMetaMask),
      walletConnect: !!window.WalletConnect,
      arweave: !!window.arweave,
      solana: !!window.solana,
    };

    const detectedWallets = Object.keys(web3Indicators).filter(
      (key) => web3Indicators[key]
    );

    if (detectedWallets.length > 0) {
      console.log("AO Shield: Web3 environment detected:", detectedWallets);
      sendMessage("web3Detected", { wallets: detectedWallets });
    }
  }

  function startRealTimeMonitoring() {
    // Monitor for new script injections
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for suspicious scripts
            if (node.tagName === "SCRIPT") {
              analyzeScript(node);
            }

            // Check for Web3 transaction elements
            if (
              node.querySelector &&
              node.querySelector(
                '[class*="transaction"], [class*="approve"], [class*="sign"]'
              )
            ) {
              analyzeTransactionElement(node);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Monitor Web3 provider changes
    if (window.ethereum) {
      monitorEthereumProvider();
    }
  }

  function analyzeScript(scriptElement) {
    const src = scriptElement.src;
    const content = scriptElement.textContent;

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /eval\s*\(/,
      /document\.write\s*\(/,
      /window\.location\s*=/,
      /\.innerHTML\s*=/,
      /fromCharCode/,
      /atob\s*\(/,
      /btoa\s*\(/,
      /crypto.*private/i,
      /seed.*phrase/i,
      /mnemonic/i,
    ];

    const dangerousPatterns = [
      /private.*key/i,
      /\.send\s*\(\s*\{.*value/,
      /transfer.*all/i,
      /approve.*unlimited/i,
      /setApprovalForAll/i,
    ];

    let riskLevel = "safe";
    let detectedPatterns = [];

    // Check content for patterns
    const textToCheck = content || src || "";

    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(textToCheck)) {
        riskLevel = "warning";
        detectedPatterns.push(`Suspicious pattern ${index + 1}`);
      }
    });

    dangerousPatterns.forEach((pattern, index) => {
      if (pattern.test(textToCheck)) {
        riskLevel = "danger";
        detectedPatterns.push(`Dangerous pattern ${index + 1}`);
      }
    });

    if (riskLevel !== "safe") {
      console.warn("AO Shield: Suspicious script detected:", {
        src,
        riskLevel,
        patterns: detectedPatterns,
      });

      sendMessage("scriptThreatDetected", {
        type: "suspicious_script",
        riskLevel,
        patterns: detectedPatterns,
        src,
      });
    }
  }

  function analyzeTransactionElement(element) {
    // Look for transaction-related elements
    const transactionKeywords = [
      "approve",
      "sign",
      "confirm",
      "transaction",
      "transfer",
      "send",
      "swap",
      "bridge",
      "stake",
      "unstake",
    ];

    const elementText = element.textContent.toLowerCase();
    const hasTransactionKeywords = transactionKeywords.some((keyword) =>
      elementText.includes(keyword)
    );

    if (hasTransactionKeywords) {
      // Check for suspicious amounts or unlimited approvals
      const suspiciousIndicators = [
        /unlimited/i,
        /∞/,
        /999999999/,
        /0xfff/i,
        /max/i,
      ];

      const hasSuspiciousIndicators = suspiciousIndicators.some((pattern) =>
        pattern.test(elementText)
      );

      if (hasSuspiciousIndicators) {
        console.warn("AO Shield: Suspicious transaction element detected");

        // Highlight element with warning
        highlightSuspiciousElement(element);

        sendMessage("transactionThreatDetected", {
          type: "suspicious_transaction",
          riskLevel: "warning",
          elementText: elementText.slice(0, 200), // Limit text length
        });
      }
    }
  }

  function monitorEthereumProvider() {
    if (!window.ethereum) return;

    // Intercept transaction requests
    const originalRequest = window.ethereum.request;

    window.ethereum.request = function (args) {
      if (
        args.method === "eth_sendTransaction" ||
        args.method === "eth_signTransaction"
      ) {
        console.log("AO Shield: Transaction request intercepted:", args);
        analyzeTransaction(args.params[0]);
      }

      return originalRequest.apply(this, arguments);
    };
  }

  function analyzeTransaction(transactionData) {
    if (!transactionData) return;

    const risks = [];

    // Check for high value transactions
    if (transactionData.value) {
      const valueInWei = parseInt(transactionData.value, 16);
      const valueInEth = valueInWei / Math.pow(10, 18);

      if (valueInEth > 1) {
        // More than 1 ETH
        risks.push(`High value transaction: ${valueInEth.toFixed(4)} ETH`);
      }
    }

    // Check for contract interactions
    if (
      transactionData.to &&
      transactionData.data &&
      transactionData.data !== "0x"
    ) {
      risks.push("Contract interaction detected");

      // Check for approval functions
      if (transactionData.data.startsWith("0x095ea7b3")) {
        risks.push("Token approval transaction");
      }
    }

    if (risks.length > 0) {
      console.warn("AO Shield: Transaction risks detected:", risks);

      sendMessage("transactionRiskDetected", {
        type: "transaction_analysis",
        risks,
        transaction: transactionData,
      });
    }
  }

  function highlightSuspiciousElement(element) {
    element.style.cssText += `
            border: 2px solid #ef4444 !important;
            background-color: rgba(239, 68, 68, 0.1) !important;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.3) !important;
        `;

    // Add warning tooltip
    const warning = document.createElement("div");
    warning.innerHTML = "⚠️ AO Shield: Potentially risky transaction";
    warning.style.cssText = `
            position: absolute;
            background: #ef4444;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
        `;

    element.style.position = "relative";
    element.appendChild(warning);

    // Remove warning after 5 seconds
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 5000);
  }

  function injectProtectionScript() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injected.js");
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  async function getSettings() {
    try {
      const response = await sendMessage("getSettings");
      return (
        response || {
          enabled: true,
          realTimeScanning: true,
          warningLevel: "medium",
          notifications: true,
        }
      );
    } catch (error) {
      console.error("AO Shield: Error getting settings:", error);
      return { enabled: true, realTimeScanning: true };
    }
  }

  function sendMessage(action, data = {}) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action, data }, resolve);
    });
  }

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case "scanPage":
        performPageScan().then(sendResponse);
        return true; // Keep message channel open
      case "updateSettings":
        settings = message.settings;
        break;
    }
  });

  async function performPageScan() {
    console.log("AO Shield: Performing page scan...");

    const scanResults = {
      threats: 0,
      warnings: 0,
      safe: 0,
      details: [],
    };

    // Scan for suspicious scripts
    const scripts = document.querySelectorAll("script");
    scripts.forEach((script) => {
      // Simple heuristic-based detection
      const content = script.textContent + script.src;

      if (/eval|document\.write|atob|btoa/i.test(content)) {
        scanResults.warnings++;
        scanResults.details.push("Potentially obfuscated script detected");
      }

      if (/private.*key|seed.*phrase|mnemonic/i.test(content)) {
        scanResults.threats++;
        scanResults.details.push("Script accessing private key information");
      }
    });

    // Scan for Web3 interactions
    const web3Elements = document.querySelectorAll(
      '[class*="connect"], [class*="wallet"], [class*="metamask"]'
    );
    if (web3Elements.length > 0) {
      scanResults.safe++;
      scanResults.details.push(
        `Found ${web3Elements.length} Web3 interface elements`
      );
    }

    // Check page reputation (simplified)
    const isHttps = window.location.protocol === "https:";
    if (!isHttps && (window.ethereum || window.web3)) {
      scanResults.warnings++;
      scanResults.details.push("Web3 detected on non-HTTPS site");
    }

    console.log("AO Shield: Scan completed:", scanResults);

    sendMessage("pageScanned", scanResults);

    return scanResults;
  }
})();
