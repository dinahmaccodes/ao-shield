// Background script for AO Shield extension
class AOShieldBackground {
    constructor() {
        this.isProtected = true;
        this.enableNotifications = true;
        this.enableTracking = true;
        this.threatPatterns = [
            // AO-specific malicious patterns
            /Process\.spawn\s*\(\s*["']malicious/i,
            /loadstring\s*\(\s*base64/i,
            /debug\.getinfo\s*\(/i,
            /dofile\s*\(\s*["'][^"']*malicious/i,
            // Arweave-specific suspicious patterns
            /arweave\.transactions\.sign\s*\(\s*[^,]*,\s*stolen_wallet/i,
            /createTransaction\s*\(\s*{\s*data:\s*["']malicious/i,
            // Traditional malicious script patterns
            /eval\s*\(\s*atob\s*\(/i,
            /document\.write\s*\(\s*unescape\s*\(/i,
            /String\.fromCharCode\s*\(/i,
            // Suspicious URLs
            /bit\.ly|tinyurl|goo\.gl/i,
            // Crypto mining patterns
            /coinhive|cryptoloot|miner/i,
            // AO ecosystem phishing patterns
            /urgent.*ao.*process.*action/i,
            /verify.*arweave.*wallet.*immediately/i,
            /suspicious.*ao.*transaction/i,
        ];
        this.aoSDK = null;
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupListeners();
        this.startDailyReset();
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get([
                'isProtected',
                'enableNotifications',
                'enableTracking',
            ]);

            this.isProtected = result.isProtected !== false;
            this.enableNotifications = result.enableNotifications !== false;
            this.enableTracking = result.enableTracking !== false;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    setupListeners() {
        // Listen for extension installation
        chrome.runtime.onInstalled.addListener(() => {
            this.initializeExtension();
        });

        // Listen for messages from popup and content scripts
        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => {
                this.handleMessage(message, sender, sendResponse);
                return true; // Keep message channel open for async response
            }
        );

        // Listen for tab updates to check for threats
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (
                changeInfo.status === 'complete' &&
                tab.url &&
                this.isProtected
            ) {
                this.checkTabSecurity(tab);
            }
        });

        // Listen for web requests to block malicious content
        if (chrome.webRequest) {
            chrome.webRequest.onBeforeRequest.addListener(
                (details) => this.checkRequest(details),
                { urls: ['<all_urls>'] },
                ['blocking']
            );
        }
    }

    async initializeExtension() {
        // Set default values
        await chrome.storage.local.set({
            alertCount: 0,
            isProtected: true,
            enableNotifications: true,
            enableTracking: true,
            protectionHistory: [],
        });

        // Show welcome notification
        if (this.enableNotifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'AO Shield Activated',
                message: 'Your browser is now protected against threats.',
            });
        }
    }

    async handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'toggleProtection':
                this.isProtected = message.enabled;
                await chrome.storage.local.set({ isProtected: message.enabled });
                sendResponse({ success: true });
                break;

            case 'toggleTrackingProtection':
                this.enableTracking = message.enabled;
                await chrome.storage.local.set({ enableTracking: message.enabled });
                sendResponse({ success: true });
                break;

            case 'threatDetected':
                await this.handleThreatDetection(message.details, sender.tab);
                sendResponse({ success: true });
                break;

            case 'checkThreats':
                const threats = await this.scanTabForThreats(sender.tab);
                sendResponse({ threats: threats });
                break;

            case 'validateAOProcess':
                const processValidation = await this.validateAOProcess(message.processId);
                sendResponse(processValidation);
                break;

            case 'validateArweaveTransaction':
                const txValidation = await this.validateArweaveTransaction(message.txId);
                sendResponse(txValidation);
                break;

            case 'getAOProcessInfo':
                const processInfo = await this.getAOProcessInfo(message.processId);
                sendResponse(processInfo);
                break;

            default:
                sendResponse({ error: 'Unknown action' });
        }
    }

    async checkTabSecurity(tab) {
        if (!this.isProtected || !tab.url) return;

        try {
            // Check URL against known threat patterns
            const urlThreats = this.checkUrlThreats(tab.url);

            if (urlThreats > 0) {
                await this.handleThreatDetection(
                    `Suspicious URL detected: ${tab.url}`,
                    tab
                );
            }

            // Inject content script to scan page content
            chrome.scripting
                .executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js'],
                })
                .catch(() => {
                    // Ignore errors for pages where content scripts can't be injected
                });
        } catch (error) {
            console.error('Error checking tab security:', error);
        }
    }

    checkUrlThreats(url) {
        let threatCount = 0;

        // Check against known malicious patterns
        for (const pattern of this.threatPatterns) {
            if (pattern.test(url)) {
                threatCount++;
            }
        }

        // Check for suspicious domain characteristics
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;

            // Check for suspicious domain patterns
            if (
                domain.includes('xn--') || // Punycode
                domain.split('.').length > 4 || // Too many subdomains
                /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain)
            ) {
                // IP address
                threatCount++;
            }
        } catch (error) {
            // Invalid URL
        }

        return threatCount;
    }

    async scanTabForThreats(tab) {
        if (!tab || !tab.url) return 0;

        let threatCount = 0;

        // URL-based threat detection
        threatCount += this.checkUrlThreats(tab.url);

        return threatCount;
    }

    checkRequest(details) {
        if (!this.isProtected) return {};

        const url = details.url;

        // Block known tracking domains if tracking protection is enabled
        if (this.enableTracking) {
            const trackingDomains = [
                'google-analytics.com',
                'googletagmanager.com',
                'facebook.com/tr',
                'doubleclick.net',
                'googlesyndication.com',
            ];

            for (const domain of trackingDomains) {
                if (url.includes(domain)) {
                    this.handleThreatDetection(
                        `Blocked tracking request to ${domain}`,
                        null
                    );
                    return { cancel: true };
                }
            }
        }

        // Check for malicious patterns in URLs
        for (const pattern of this.threatPatterns) {
            if (pattern.test(url)) {
                this.handleThreatDetection(
                    `Blocked malicious request: ${url}`,
                    null
                );
                return { cancel: true };
            }
        }

        return {};
    }

    async handleThreatDetection(details, tab) {
        // Increment alert count
        const result = await chrome.storage.local.get(['alertCount']);
        const alertCount = (result.alertCount || 0) + 1;
        await chrome.storage.local.set({ alertCount: alertCount });

        // Add to history
        const historyItem = {
            time: new Date().toLocaleString(),
            action: details,
            id: Date.now(),
        };

        const historyResult = await chrome.storage.local.get([
            'protectionHistory',
        ]);
        const history = historyResult.protectionHistory || [];
        history.unshift(historyItem);

        // Keep only last 50 items
        if (history.length > 50) {
            history.splice(50);
        }

        await chrome.storage.local.set({ protectionHistory: history });

        // Show notification if enabled
        if (this.enableNotifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'AO Shield - Threat Blocked',
                message: details,
            });
        }

        // Update badge
        chrome.action.setBadgeText({
            text: alertCount.toString(),
            tabId: tab ? tab.id : undefined,
        });

        chrome.action.setBadgeBackgroundColor({
            color: '#ff4444',
        });
    }

    startDailyReset() {
        // Reset alert count daily at midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        setTimeout(() => {
            this.resetDailyCounters();
            // Set up daily interval
            setInterval(() => {
                this.resetDailyCounters();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    async resetDailyCounters() {
        await chrome.storage.local.set({ alertCount: 0 });
        chrome.action.setBadgeText({ text: '' });
    }

    // AO ecosystem validation methods
    async validateAOProcess(processId) {
        try {
            // Basic validation for AO process ID format
            if (!processId || processId.length !== 43 || !/^[a-zA-Z0-9_-]+$/.test(processId)) {
                return {
                    isValid: false,
                    threats: [{ type: 'invalid_process_id', severity: 'low' }],
                    processId: processId
                };
            }

            // Check against known malicious process patterns
            const knownMaliciousPatterns = [
                /malicious/i,
                /hack/i,
                /steal/i,
                /phishing/i
            ];

            const threats = [];
            for (const pattern of knownMaliciousPatterns) {
                if (pattern.test(processId)) {
                    threats.push({
                        type: 'suspicious_process_name',
                        pattern: pattern.toString(),
                        severity: 'high'
                    });
                }
            }

            // Try to query AO gateway for process information
            try {
                const response = await fetch(`https://ao.arweave.net/processes/${processId}`, {
                    method: 'GET',
                    timeout: 5000
                });

                if (response.ok) {
                    const processData = await response.json();
                    const analysisThreats = this.analyzeProcessData(processData);
                    threats.push(...analysisThreats);
                }
            } catch (error) {
                // Process might not exist or network issue
                threats.push({
                    type: 'process_not_found',
                    severity: 'medium',
                    message: 'Could not validate process existence'
                });
            }

            return {
                isValid: threats.length === 0 || !threats.some(t => t.severity === 'high'),
                threats: threats,
                processId: processId,
                score: Math.max(0, 100 - threats.length * 20)
            };

        } catch (error) {
            console.error('Error validating AO process:', error);
            return {
                isValid: false,
                threats: [{ type: 'validation_error', message: error.message }],
                processId: processId
            };
        }
    }

    async validateArweaveTransaction(txId) {
        try {
            // Basic validation for Arweave transaction ID format
            if (!txId || txId.length !== 43 || !/^[a-zA-Z0-9_-]+$/.test(txId)) {
                return {
                    isValid: false,
                    threats: [{ type: 'invalid_transaction_id', severity: 'low' }],
                    txId: txId
                };
            }

            const threats = [];

            // Try to query Arweave gateway for transaction information
            try {
                const response = await fetch(`https://arweave.net/tx/${txId}`, {
                    method: 'GET',
                    timeout: 5000
                });

                if (response.ok) {
                    const txData = await response.json();
                    const analysisThreats = this.analyzeTransactionData(txData);
                    threats.push(...analysisThreats);
                } else if (response.status === 404) {
                    threats.push({
                        type: 'transaction_not_found',
                        severity: 'medium',
                        message: 'Transaction not found on Arweave network'
                    });
                }
            } catch (error) {
                threats.push({
                    type: 'validation_network_error',
                    severity: 'low',
                    message: 'Could not validate transaction'
                });
            }

            return {
                isValid: threats.length === 0 || !threats.some(t => t.severity === 'high'),
                threats: threats,
                txId: txId,
                score: Math.max(0, 100 - threats.length * 15)
            };

        } catch (error) {
            console.error('Error validating Arweave transaction:', error);
            return {
                isValid: false,
                threats: [{ type: 'validation_error', message: error.message }],
                txId: txId
            };
        }
    }

    async getAOProcessInfo(processId) {
        try {
            const response = await fetch(`https://ao.arweave.net/processes/${processId}`, {
                method: 'GET',
                timeout: 5000
            });

            if (response.ok) {
                return await response.json();
            } else {
                return { error: 'Process not found', processId: processId };
            }
        } catch (error) {
            return { error: error.message, processId: processId };
        }
    }

    analyzeProcessData(processData) {
        const threats = [];

        // Check for suspicious process metadata
        if (processData.metadata) {
            const metadata = JSON.stringify(processData.metadata);
            const suspiciousPatterns = [
                /malware/i,
                /virus/i,
                /hack/i,
                /steal/i,
                /phishing/i
            ];

            for (const pattern of suspiciousPatterns) {
                if (pattern.test(metadata)) {
                    threats.push({
                        type: 'suspicious_metadata',
                        pattern: pattern.toString(),
                        severity: 'high'
                    });
                }
            }
        }

        // Check for excessive permissions
        if (processData.permissions && Array.isArray(processData.permissions)) {
            const dangerousPermissions = ['admin', 'root', 'system', 'unrestricted'];
            for (const permission of processData.permissions) {
                if (dangerousPermissions.includes(permission.toLowerCase())) {
                    threats.push({
                        type: 'excessive_permissions',
                        permission: permission,
                        severity: 'medium'
                    });
                }
            }
        }

        return threats;
    }

    analyzeTransactionData(txData) {
        const threats = [];

        // Check transaction tags for suspicious content
        if (txData.tags) {
            for (const tag of txData.tags) {
                // Check for suspicious app names
                if (tag.name === 'App-Name' && /malware|virus|hack|steal/i.test(tag.value)) {
                    threats.push({
                        type: 'suspicious_app_name',
                        appName: tag.value,
                        severity: 'high'
                    });
                }

                // Check for executable content types
                if (tag.name === 'Content-Type' && /executable|binary/i.test(tag.value)) {
                    threats.push({
                        type: 'executable_content',
                        contentType: tag.value,
                        severity: 'medium'
                    });
                }
            }
        }

        // Check for suspicious data size (unusually large)
        if (txData.data_size && txData.data_size > 10 * 1024 * 1024) { // 10MB
            threats.push({
                type: 'large_data_size',
                size: txData.data_size,
                severity: 'low'
            });
        }

        return threats;
    }

    // Enhanced request checking for AO ecosystem
}

// Initialize background script
new AOShieldBackground();
