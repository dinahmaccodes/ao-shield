// AO Shield Injected Script - Deep Web3 Protection

(function () {
  "use strict";

  console.log("AO Shield: Protection layer injected");

  // Create a secure namespace
  const AOShield = {
    version: "1.0.0",
    protectionLevel: "high",
    detectedThreats: [],
  };

  // Ethereum provider protection
  if (window.ethereum) {
    protectEthereumProvider();
  }

  // Web3 provider protection
  if (window.web3) {
    protectWeb3Provider();
  }

  // Arweave protection
  if (window.arweave) {
    protectArweaveProvider();
  }

  // Generic wallet protection
  protectWalletConnections();

  function protectEthereumProvider() {
    const originalRequest = window.ethereum.request;
    const originalSend = window.ethereum.send;
    const originalSendAsync = window.ethereum.sendAsync;

    // Intercept ethereum.request
    window.ethereum.request = function (args) {
      const result = analyzeEthereumRequest(args);

      if (result.block) {
        console.warn("AO Shield: Blocked suspicious Ethereum request:", args);
        AOShield.detectedThreats.push({
          type: "ethereum_request",
          method: args.method,
          reason: result.reason,
          timestamp: Date.now(),
        });

        // Show user warning
        showThreatWarning(result.reason);

        return Promise.reject(
          new Error("Request blocked by AO Shield: " + result.reason)
        );
      }

      return originalRequest.call(this, args);
    };

    // Intercept ethereum.send (legacy)
    if (originalSend) {
      window.ethereum.send = function (method, params) {
        const args = { method, params };
        const result = analyzeEthereumRequest(args);

        if (result.block) {
          console.warn("AO Shield: Blocked suspicious Ethereum send:", args);
          throw new Error("Request blocked by AO Shield: " + result.reason);
        }

        return originalSend.call(this, method, params);
      };
    }

    // Intercept ethereum.sendAsync (legacy)
    if (originalSendAsync) {
      window.ethereum.sendAsync = function (payload, callback) {
        const result = analyzeEthereumRequest(payload);

        if (result.block) {
          console.warn(
            "AO Shield: Blocked suspicious Ethereum sendAsync:",
            payload
          );
          callback(new Error("Request blocked by AO Shield: " + result.reason));
          return;
        }

        return originalSendAsync.call(this, payload, callback);
      };
    }
  }

  function analyzeEthereumRequest(args) {
    const method = args.method;
    const params = args.params || [];

    // High-risk methods that require extra scrutiny
    const highRiskMethods = [
      "eth_sendTransaction",
      "eth_signTransaction",
      "eth_sign",
      "personal_sign",
      "eth_signTypedData",
      "eth_signTypedData_v3",
      "eth_signTypedData_v4",
    ];

    if (highRiskMethods.includes(method)) {
      // Analyze transaction parameters
      if (
        method === "eth_sendTransaction" ||
        method === "eth_signTransaction"
      ) {
        const transaction = params[0];
        return analyzeTransaction(transaction);
      }

      // Analyze signing requests
      if (method.includes("sign")) {
        return analyzeSignRequest(args);
      }
    }

    return { block: false };
  }

  function analyzeTransaction(tx) {
    if (!tx) return { block: false };

    // Check for suspicious patterns
    const suspiciousPatterns = [
      // Unlimited token approvals
      {
        condition:
          tx.data &&
          tx.data.includes(
            "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          ),
        reason: "Unlimited token approval detected",
      },
      // Large value transfers
      {
        condition: tx.value && parseInt(tx.value, 16) > 1e18, // > 1 ETH
        reason: "Large value transfer detected",
      },
      // Suspicious contract addresses (simplified check)
      {
        condition: tx.to && isBlacklistedAddress(tx.to),
        reason: "Transaction to known malicious contract",
      },
      // Empty recipient (contract creation)
      {
        condition: !tx.to && tx.data,
        reason: "Contract deployment detected",
      },
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.condition) {
        return { block: true, reason: pattern.reason };
      }
    }

    return { block: false };
  }

  function analyzeSignRequest(args) {
    const method = args.method;
    const params = args.params || [];

    // Check for suspicious signing patterns
    if (method === "personal_sign" || method === "eth_sign") {
      const message = params[0];

      // Look for suspicious content in the message
      const suspiciousKeywords = [
        "private key",
        "seed phrase",
        "mnemonic",
        "backup",
        "recovery",
        "wallet.dat",
        "keystore",
      ];

      if (typeof message === "string") {
        const decodedMessage = tryDecodeMessage(message);
        const lowerMessage = decodedMessage.toLowerCase();

        for (const keyword of suspiciousKeywords) {
          if (lowerMessage.includes(keyword)) {
            return {
              block: true,
              reason: `Suspicious signing request containing "${keyword}"`,
            };
          }
        }
      }
    }

    return { block: false };
  }

  function tryDecodeMessage(message) {
    try {
      // Try to decode hex message
      if (message.startsWith("0x")) {
        const hex = message.slice(2);
        let result = "";
        for (let i = 0; i < hex.length; i += 2) {
          result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return result;
      }
    } catch (e) {
      // If decoding fails, return original
    }

    return message;
  }

  function isBlacklistedAddress(address) {
    // Simplified blacklist check
    // In a real implementation, this would check against a comprehensive database
    const knownMaliciousAddresses = [
      "0x0000000000000000000000000000000000000000",
      // Add more known malicious addresses
    ];

    return knownMaliciousAddresses.includes(address.toLowerCase());
  }

  function protectWeb3Provider() {
    // Similar protection for Web3.js provider
    if (window.web3 && window.web3.currentProvider) {
      const originalSend = window.web3.currentProvider.send;

      window.web3.currentProvider.send = function (payload, callback) {
        const result = analyzeEthereumRequest(payload);

        if (result.block) {
          console.warn("AO Shield: Blocked suspicious Web3 request:", payload);
          callback(new Error("Request blocked by AO Shield: " + result.reason));
          return;
        }

        return originalSend.call(this, payload, callback);
      };
    }
  }

  function protectArweaveProvider() {
    // Arweave-specific protection
    if (window.arweave) {
      const originalCreateTransaction = window.arweave.createTransaction;

      window.arweave.createTransaction = function (attributes, jwk) {
        // Analyze Arweave transaction
        if (attributes.target && isBlacklistedArAddress(attributes.target)) {
          console.warn(
            "AO Shield: Blocked transaction to suspicious Arweave address"
          );
          showThreatWarning(
            "Transaction to potentially malicious Arweave address"
          );
          return Promise.reject(new Error("Transaction blocked by AO Shield"));
        }

        return originalCreateTransaction.call(this, attributes, jwk);
      };
    }
  }

  function isBlacklistedArAddress(address) {
    // Simplified Arweave address blacklist
    const suspiciousPatterns = [
      /^0+$/, // All zeros
      /^1+$/, // All ones
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(address));
  }

  function protectWalletConnections() {
    // Monitor for wallet connection attempts
    const originalAddEventListener = window.addEventListener;

    window.addEventListener = function (type, listener, options) {
      if (
        type === "ethereum#initialized" ||
        type === "eip6963:announceProvider"
      ) {
        console.log("AO Shield: Wallet connection event detected");

        // Wrap the listener to analyze wallet connections
        const wrappedListener = function (event) {
          analyzeWalletConnection(event);
          return listener.apply(this, arguments);
        };

        return originalAddEventListener.call(
          this,
          type,
          wrappedListener,
          options
        );
      }

      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  function analyzeWalletConnection(event) {
    // Log wallet connection for analysis
    console.log("AO Shield: Wallet connection analyzed:", event.type);

    // Check for suspicious wallet providers
    if (event.detail && event.detail.info) {
      const walletInfo = event.detail.info;

      if (isKnownMaliciousWallet(walletInfo)) {
        showThreatWarning("Potentially malicious wallet detected");
        event.stopPropagation();
        event.preventDefault();
      }
    }
  }

  function isKnownMaliciousWallet(walletInfo) {
    // Check against known malicious wallet signatures
    const suspiciousNames = [
      "fake metamask",
      "metamask clone",
      "free coins",
      "crypto giveaway",
    ];

    const walletName = (walletInfo.name || "").toLowerCase();
    return suspiciousNames.some((name) => walletName.includes(name));
  }

  function showThreatWarning(message) {
    // Create and show warning overlay
    const overlay = document.createElement("div");
    overlay.id = "ao-shield-warning";
    overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #ef4444;
                color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 14px;
                max-width: 400px;
                text-align: center;
            ">
                <div style="font-weight: bold; margin-bottom: 10px;">
                    🛡️ AO Shield Warning
                </div>
                <div style="margin-bottom: 15px;">
                    ${message}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: white;
                    color: #ef4444;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    Understood
                </button>
            </div>
        `;

    document.body.appendChild(overlay);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 10000);
  }

  // Monitor for suspicious DOM modifications
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check for fake wallet interfaces
          if (
            node.querySelector &&
            node.querySelector('[class*="metamask"], [class*="wallet"]')
          ) {
            analyzeFakeWalletInterface(node);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  function analyzeFakeWalletInterface(element) {
    const elementText = element.textContent.toLowerCase();
    const suspiciousPhases = [
      "enter your seed phrase",
      "backup your private key",
      "verify your wallet",
      "claim your tokens",
      "connect wallet to claim",
    ];

    if (suspiciousPhases.some((phrase) => elementText.includes(phrase))) {
      console.warn("AO Shield: Potential phishing interface detected");

      // Mark element as suspicious
      element.style.border = "3px solid #ef4444";
      element.style.background = "rgba(239, 68, 68, 0.1)";

      showThreatWarning("Potential phishing interface detected on this page");
    }
  }

  // Expose AOShield for debugging (in development)
  if (typeof window !== "undefined") {
    window.AOShield = AOShield;
  }
})();
