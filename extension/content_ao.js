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
                const threatCount = await this.scanForThreats();
                sendResponse({ threats: threatCount });
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
            const threatCount = await this.scanForThreats();
            
            if (threatCount > 0) {
                // Report threats to background script
                chrome.runtime.sendMessage({
                    action: 'threatDetected',
                    details: `Detected ${threatCount} potential AO ecosystem threats on ${window.location.hostname}`
                });
            }
        } catch (error) {
            console.error('AO Shield scanning error:', error);
        }

        this.isScanning = false;
    }

    async scanForThreats() {
        let threatCount = 0;
        this.detectedThreats = [];

        // Scan page text content
        threatCount += this.scanTextContent();
        
        // Scan script tags for AO-specific threats
        threatCount += this.scanScriptTags();
        
        // Scan iframe sources
        threatCount += this.scanIframes();
        
        // Scan for suspicious forms
        threatCount += this.scanForms();
        
        // Scan for AO process interactions
        threatCount += await this.scanAOProcesses();
        
        // Scan for Arweave transaction threats
        threatCount += await this.scanArweaveTransactions();

        return threatCount;
    }

    scanTextContent() {
        let threatCount = 0;
        const textContent = document.body ? document.body.innerText : '';
        
        for (const pattern of this.threatPatterns) {
            const matches = textContent.match(pattern);
            if (matches) {
                threatCount += matches.length;
                this.detectedThreats.push({
                    type: 'suspicious_text',
                    pattern: pattern.toString(),
                    matches: matches.length,
                    ecosystem: 'ao'
                });
            }
        }

        return threatCount;
    }

    scanScriptTags() {
        let threatCount = 0;
        const scripts = document.querySelectorAll('script');
        
        scripts.forEach((script, index) => {
            const scriptContent = script.innerHTML || script.src || '';
            
            // Check for AO-specific patterns
            for (const pattern of this.threatPatterns) {
                if (pattern.test(scriptContent)) {
                    threatCount++;
                    this.detectedThreats.push({
                        type: 'suspicious_script',
                        element: `script[${index}]`,
                        content: scriptContent.substring(0, 100) + '...',
                        ecosystem: 'ao'
                    });
                    
                    // Block suspicious inline scripts
                    if (script.innerHTML && !script.src) {
                        script.type = 'text/blocked';
                        script.innerHTML = '// Script blocked by AO Shield';
                    }
                }
            }

            // Check for AO process interactions
            if (this.containsAOProcessCode(scriptContent)) {
                threatCount++;
                this.detectedThreats.push({
                    type: 'ao_process_interaction',
                    element: `script[${index}]`,
                    reason: 'Contains AO process interaction code'
                });
            }

            // Check for Arweave wallet interactions
            if (this.containsArweaveWalletCode(scriptContent)) {
                const isSecure = this.validateArweaveWalletCode(scriptContent);
                if (!isSecure) {
                    threatCount++;
                    this.detectedThreats.push({
                        type: 'suspicious_wallet_interaction',
                        element: `script[${index}]`,
                        reason: 'Potentially malicious wallet interaction'
                    });
                }
            }
        });

        return threatCount;
    }

    containsAOProcessCode(code) {
        const aoPatterns = [
            /Process\.(send|spawn|kill)/i,
            /ao\.connect/i,
            /createProcess/i,
            /sendMessage.*process/i
        ];
        
        return aoPatterns.some(pattern => pattern.test(code));
    }

    containsArweaveWalletCode(code) {
        const walletPatterns = [
            /arweave\.wallets/i,
            /createTransaction/i,
            /wallet\.sign/i,
            /connectWallet/i
        ];
        
        return walletPatterns.some(pattern => pattern.test(code));
    }

    validateArweaveWalletCode(code) {
        // Check for suspicious wallet operations
        const suspiciousPatterns = [
            /wallet.*private.*key/i,
            /steal.*wallet/i,
            /export.*secret/i,
            /keyfile.*copy/i
        ];
        
        return !suspiciousPatterns.some(pattern => pattern.test(code));
    }

    scanIframes() {
        let threatCount = 0;
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach((iframe, index) => {
            const src = iframe.src || '';
            
            // Check for suspicious iframe sources
            if (this.isSuspiciousUrl(src)) {
                threatCount++;
                this.detectedThreats.push({
                    type: 'suspicious_iframe',
                    element: `iframe[${index}]`,
                    src: src,
                    ecosystem: 'ao'
                });
                
                // Block suspicious iframe
                iframe.src = 'about:blank';
                iframe.style.display = 'none';
            }
        });

        return threatCount;
    }

    isSuspiciousUrl(url) {
        const suspiciousDomains = [
            'bit.ly', 'tinyurl', 'goo.gl',
            'fake-arweave.com', 'phishing-ao.net'
        ];
        
        return suspiciousDomains.some(domain => url.includes(domain)) ||
               /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
    }

    scanForms() {
        let threatCount = 0;
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, index) => {
            const action = form.action || '';
            
            // Check for forms submitting to suspicious URLs
            if (this.isSuspiciousUrl(action)) {
                threatCount++;
                this.detectedThreats.push({
                    type: 'suspicious_form',
                    element: `form[${index}]`,
                    action: action,
                    ecosystem: 'ao'
                });
            }

            // Check for wallet connection forms on non-HTTPS pages
            const walletInputs = form.querySelectorAll('input[name*="wallet"], input[placeholder*="wallet"]');
            if (walletInputs.length > 0 && window.location.protocol !== 'https:') {
                threatCount++;
                this.detectedThreats.push({
                    type: 'insecure_wallet_form',
                    element: `form[${index}]`,
                    reason: 'Wallet form on non-HTTPS page'
                });
            }
        });

        return threatCount;
    }

    async scanAOProcesses() {
        let threatCount = 0;
        
        // Extract AO process IDs from page content
        const processIdPattern = /[a-zA-Z0-9_-]{43}/g;
        const pageContent = document.documentElement.innerHTML;
        const matches = pageContent.match(processIdPattern) || [];
        
        for (const match of matches) {
            // Basic validation for AO process ID format
            if (this.isValidAOProcessId(match)) {
                this.aoProcesses.add(match);
                
                // Validate process if we have access to background script
                try {
                    const validation = await this.validateProcessSecurity(match);
                    if (!validation.isValid) {
                        threatCount++;
                        this.detectedThreats.push({
                            type: 'malicious_ao_process',
                            processId: match,
                            threats: validation.threats,
                            ecosystem: 'ao'
                        });
                    }
                } catch (error) {
                    console.warn('Could not validate AO process:', match, error);
                }
            }
        }

        return threatCount;
    }

    async scanArweaveTransactions() {
        let threatCount = 0;
        
        // Extract Arweave transaction IDs from page content
        const txIdPattern = /[a-zA-Z0-9_-]{43}/g;
        const pageContent = document.documentElement.innerHTML;
        const matches = pageContent.match(txIdPattern) || [];
        
        for (const match of matches) {
            // Basic validation for Arweave transaction ID format
            if (this.isValidArweaveTransactionId(match)) {
                this.arweaveTransactions.add(match);
                
                // Basic validation for suspicious transaction patterns
                const context = this.getTransactionContext(match);
                if (this.isSuspiciousTransactionContext(context)) {
                    threatCount++;
                    this.detectedThreats.push({
                        type: 'suspicious_arweave_transaction',
                        txId: match,
                        context: context,
                        ecosystem: 'arweave'
                    });
                }
            }
        }

        return threatCount;
    }

    isValidAOProcessId(id) {
        return id && id.length === 43 && /^[a-zA-Z0-9_-]+$/.test(id);
    }

    isValidArweaveTransactionId(id) {
        return id && id.length === 43 && /^[a-zA-Z0-9_-]+$/.test(id);
    }

    getTransactionContext(txId) {
        const pageContent = document.documentElement.innerHTML;
        const index = pageContent.indexOf(txId);
        if (index === -1) return '';
        
        const start = Math.max(0, index - 100);
        const end = Math.min(pageContent.length, index + 143);
        return pageContent.substring(start, end);
    }

    isSuspiciousTransactionContext(context) {
        const suspiciousPatterns = [
            /malicious/i,
            /hack/i,
            /steal/i,
            /phishing/i,
            /scam/i
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(context));
    }

    async validateProcessSecurity(processId) {
        // Send validation request to background script
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: 'validateAOProcess',
                processId: processId
            }, (response) => {
                resolve(response || { isValid: true, threats: [] });
            });
        });
    }

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
        if (eventData.processId) {
            this.aoProcesses.add(eventData.processId);
            
            // Check for suspicious process events
            if (eventData.action && /kill|destroy|hack/i.test(eventData.action)) {
                this.detectedThreats.push({
                    type: 'suspicious_ao_process_event',
                    processId: eventData.processId,
                    action: eventData.action,
                    ecosystem: 'ao'
                });
                
                chrome.runtime.sendMessage({
                    action: 'threatDetected',
                    details: `Suspicious AO process event: ${eventData.action} on ${eventData.processId}`
                });
            }
        }
    }

    handleArweaveTransactionEvent(eventData) {
        if (eventData.txId) {
            this.arweaveTransactions.add(eventData.txId);
            
            // Check for suspicious transaction events
            if (eventData.suspicious) {
                this.detectedThreats.push({
                    type: 'suspicious_arweave_transaction_event',
                    txId: eventData.txId,
                    reason: eventData.reason,
                    ecosystem: 'arweave'
                });
                
                chrome.runtime.sendMessage({
                    action: 'threatDetected',
                    details: `Suspicious Arweave transaction: ${eventData.reason}`
                });
            }
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
