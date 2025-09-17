// Content script for AO Shield extension
class AOShieldContent {
    constructor() {
        this.threatPatterns = [
            // AO-specific malicious patterns
            /Process\.spawn\s*\(\s*["']malicious/gi,
            /loadstring\s*\(\s*base64/gi,
            /debug\.getinfo\s*\(/gi,
            /dofile\s*\(\s*["'][^"']*malicious/gi,
            // Arweave-specific suspicious patterns
            /arweave\.transactions\.sign\s*\(\s*[^,]*,\s*stolen_wallet/gi,
            /createTransaction\s*\(\s*{\s*data:\s*["']malicious/gi,
            // Traditional malicious script patterns
            /eval\s*\(\s*atob\s*\(/gi,
            /document\.write\s*\(\s*unescape\s*\(/gi,
            /String\.fromCharCode\s*\(/gi,
            /fromCharCode\s*\(\s*\d+/gi,
            // Suspicious iframe patterns
            /iframe.*src=["'][^"']*bit\.ly/gi,
            /iframe.*src=["'][^"']*tinyurl/gi,
            // Crypto mining patterns
            /coinhive|cryptoloot|minergate|jsecoin/gi,
            // Phishing patterns specific to AO ecosystem
            /connect.*wallet.*ao\.arweave/gi,
            /verify.*arweave.*wallet/gi,
            /urgent.*ao.*process.*action/gi,
            /suspended.*arweave.*account/gi
        ];
        
        this.isScanning = false;
        this.detectedThreats = [];
        this.aoProcesses = new Set();
        this.arweaveTransactions = new Set();
        this.init();
    }

    async init() {
        // Start scanning when page is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startScanning());
        } else {
            this.startScanning();
        }

        // Listen for messages from popup and background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;
        });

        // Monitor for dynamic content changes
        this.observeChanges();
        
        // Monitor for AO processes and Arweave transactions
        this.monitorAOEcosystem();
    }

    async handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'checkThreats':
                await this.scanForThreats();
                sendResponse({ threats: this.detectedThreats.length });
                break;
            
            case 'getDetectedThreats':
                sendResponse({ threats: this.detectedThreats });
                break;
                
            case 'getAOProcesses':
                sendResponse({ processes: Array.from(this.aoProcesses) });
                break;
                
            case 'getArweaveTransactions':
                sendResponse({ transactions: Array.from(this.arweaveTransactions) });
                break;
                
            default:
                sendResponse({ error: 'Unknown action' });
        }
    }

    async startScanning() {
        if (this.isScanning) return;
        this.isScanning = true;

        try {
            await this.scanForThreats();
            
            if (this.detectedThreats.length > 0) {
                // Report each threat to the background script
                for (const threat of this.detectedThreats) {
                    chrome.runtime.sendMessage({
                        action: 'threatDetected',
                        details: threat // Send the full threat object
                    });
                }
            }
        } catch (error) {
            console.error('AO Shield scanning error:', error);
        }

        this.isScanning = false;
    }

    async scanForThreats() {
        this.detectedThreats = [];

        this.scanTextContent();
        this.scanScriptTags();
        this.scanIframes();
        this.scanForms();
        // The following are more complex and will be implemented fully later
        // await this.scanAOProcesses();
        // await this.scanArweaveTransactions();
    }

    scanTextContent() {
        const textContent = document.body ? document.body.innerText : '';
        if (!textContent) return;

        for (const pattern of this.threatPatterns) {
            if (pattern.test(textContent)) {
                const threat = {
                    id: `${Date.now()}-text-${pattern.toString()}`,
                    title: 'Suspicious Text Detected',
                    riskLevel: 'Medium',
                    riskScore: 50,
                    message: `Found text matching the malicious pattern: ${pattern.toString()}`,
                    source: window.location.href,
                    timestamp: Date.now(),
                    type: 'Content',
                    details: {
                        pattern: pattern.toString(),
                        content: textContent.substring(0, 200) + '...'
                    },
                };
                this.detectedThreats.push(threat);
                break; // Move to next pattern type after one match
            }
        }
    }

    scanScriptTags() {
        const scripts = document.querySelectorAll('script');
        
        scripts.forEach((script) => {
            const scriptContent = script.innerHTML || script.src || '';
            if (!scriptContent) return;

            for (const pattern of this.threatPatterns) {
                if (pattern.test(scriptContent)) {
                    const threat = {
                        id: `${Date.now()}-script-${pattern.toString()}`,
                        title: 'Suspicious Script Detected',
                        riskLevel: 'High',
                        riskScore: 90,
                        message: `A script on this page matches a known malicious pattern: ${pattern.toString()}`,
                        source: window.location.href,
                        timestamp: Date.now(),
                        type: 'Content',
                        details: {
                            pattern: pattern.toString(),
                            content: scriptContent.substring(0, 200) + '...',
                        },
                    };
                    this.detectedThreats.push(threat);
                    
                    if (script.innerHTML && !script.src) {
                        script.type = 'text/blocked';
                        script.innerHTML = '// Script blocked by AO Shield';
                    }
                    break; 
                }
            }
        });
    }

    scanIframes() {
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach((iframe) => {
            const src = iframe.src || '';
            if (this.isSuspiciousUrl(src)) {
                const threat = {
                    id: `${Date.now()}-iframe-${src}`,
                    title: 'Suspicious Iframe Detected',
                    riskLevel: 'High',
                    riskScore: 80,
                    message: `An iframe with a suspicious source was detected: ${src}`,
                    source: window.location.href,
                    timestamp: Date.now(),
                    type: 'Content',
                    details: {
                        content: `<iframe src="${src}">`,
                    },
                };
                this.detectedThreats.push(threat);
                
                iframe.src = 'about:blank';
                iframe.style.display = 'none';
            }
        });
    }

    isSuspiciousUrl(url) {
        if (!url) return false;
        const suspiciousDomains = [
            'bit.ly', 'tinyurl', 'goo.gl',
            'fake-arweave.com', 'phishing-ao.net'
        ];
        
        return suspiciousDomains.some(domain => url.includes(domain)) ||
               /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
    }

    scanForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form) => {
            const action = form.action || '';
            
            if (this.isSuspiciousUrl(action)) {
                const threat = {
                    id: `${Date.now()}-form-${action}`,
                    title: 'Suspicious Form Action',
                    riskLevel: 'High',
                    riskScore: 95,
                    message: `A form on this page submits data to a suspicious URL: ${action}`,
                    source: window.location.href,
                    timestamp: Date.now(),
                    type: 'Content',
                    details: {
                        content: form.outerHTML.substring(0, 300) + '...'
                    },
                };
                this.detectedThreats.push(threat);
            }

            const walletInputs = form.querySelectorAll('input[name*="wallet"], input[placeholder*="wallet"]');
            if (walletInputs.length > 0 && window.location.protocol !== 'https:') {
                const threat = {
                    id: `${Date.now()}-insecure-form`,
                    title: 'Insecure Wallet Form',
                    riskLevel: 'Medium',
                    riskScore: 65,
                    message: 'A form is asking for wallet information on an insecure (non-HTTPS) page.',
                    source: window.location.href,
                    timestamp: Date.now(),
                    type: 'Content',
                    details: {
                        content: form.outerHTML.substring(0, 300) + '...'
                    },
                };
                this.detectedThreats.push(threat);
            }
        });
    }

    // The following methods are placeholders for future, more complex validation
    async scanAOProcesses() { return; }
    async scanArweaveTransactions() { return; }
    isValidAOProcessId(id) { return false; }
    isValidArweaveTransactionId(id) { return false; }
    getTransactionContext(txId) { return ''; }
    isSuspiciousTransactionContext(context) { return false; }
    async validateProcessSecurity(processId) { return { isValid: true }; }

    monitorAOEcosystem() {
        // Monitor for AO-specific events
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'AO_PROCESS_EVENT') {
                this.handleAOProcessEvent(event.data);
            }
            
            if (event.data && event.data.type === 'ARWEAVE_TRANSACTION_EVENT') {
                this.handleArweaveTransactionEvent(event.data);
            }
        });
    }

    handleAOProcessEvent(eventData) {
        if (eventData.processId && eventData.action && /kill|destroy|hack/i.test(eventData.action)) {
            const threat = {
                id: `${Date.now()}-ao-event-${eventData.processId}`,
                title: 'Suspicious AO Process Event',
                riskLevel: 'High',
                riskScore: 90,
                message: `A suspicious action (${eventData.action}) was detected on an AO process.`,
                source: window.location.href,
                timestamp: Date.now(),
                type: 'Transaction', // Categorizing as transaction-like
                details: {
                    content: JSON.stringify(eventData),
                },
            };
            this.detectedThreats.push(threat);
            this.startScanning(); // Re-scan and report
        }
    }

    handleArweaveTransactionEvent(eventData) {
        if (eventData.txId && eventData.suspicious) {
            const threat = {
                id: `${Date.now()}-ar-event-${eventData.txId}`,
                title: 'Suspicious Arweave Transaction Event',
                riskLevel: 'Medium',
                riskScore: 70,
                message: `A suspicious Arweave transaction was detected: ${eventData.reason}`,
                source: window.location.href,
                timestamp: Date.now(),
                type: 'Transaction',
                details: {
                    content: JSON.stringify(eventData),
                },
            };
            this.detectedThreats.push(threat);
            this.startScanning(); // Re-scan and report
        }
    }

    observeChanges() {
        // Monitor for dynamically added content
        const observer = new MutationObserver((mutations) => {
            let shouldRescan = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node;
                            if (element.tagName === 'SCRIPT' || 
                                element.tagName === 'IFRAME' ||
                                element.querySelector('script, iframe')) {
                                shouldRescan = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldRescan) {
                // Debounce rescanning
                clearTimeout(this.rescanTimeout);
                this.rescanTimeout = setTimeout(() => {
                    this.startScanning();
                }, 1000);
            }
        });

        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize content script
try {
    new AOShieldContent();
} catch (error) {
    console.error('AO Shield content script error:', error);
}
