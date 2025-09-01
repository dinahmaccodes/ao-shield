// AO SDK wrapper for AO Shield extension
class AOSDKWrapper {
    constructor() {
        this.arweaveConfig = {
            host: 'arweave.net',
            port: 443,
            protocol: 'https',
            timeout: 20000,
            logging: false
        };
        this.aoGatewayUrl = 'https://ao.arweave.net';
        this.init();
    }

    async init() {
        try {
            // Import arweave dynamically for browser environment
            if (typeof window !== 'undefined') {
                this.arweave = await this.loadArweave();
            }
        } catch (error) {
            console.error('Failed to initialize AO SDK:', error);
        }
    }

    async loadArweave() {
        // Load Arweave from CDN for browser extension
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/arweave@1.14.4/bundles/web.bundle.min.js';
            script.onload = () => {
                const arweave = window.Arweave.init(this.arweaveConfig);
                resolve(arweave);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // AO Process interaction methods
    async sendMessageToProcess(processId, data, tags = []) {
        try {
            if (!this.arweave) {
                throw new Error('Arweave not initialized');
            }

            const messageData = {
                process: processId,
                data: JSON.stringify(data),
                tags: [
                    { name: 'Action', value: 'Message' },
                    { name: 'Data-Protocol', value: 'ao' },
                    { name: 'Type', value: 'Message' },
                    { name: 'Variant', value: 'ao.TN.1' },
                    ...tags
                ]
            };

            const transaction = await this.arweave.createTransaction({
                data: messageData.data,
                tags: messageData.tags
            });

            // Note: In a real implementation, you'd need proper wallet integration
            // For now, we'll return the transaction structure
            return {
                id: transaction.id,
                processId: processId,
                data: messageData,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('Error sending message to AO process:', error);
            throw error;
        }
    }

    async queryProcessState(processId) {
        try {
            const response = await fetch(`${this.aoGatewayUrl}/processes/${processId}`);
            if (!response.ok) {
                throw new Error(`Failed to query process: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error querying AO process state:', error);
            throw error;
        }
    }

    async getProcessMessages(processId, limit = 50) {
        try {
            const response = await fetch(`${this.aoGatewayUrl}/processes/${processId}/messages?limit=${limit}`);
            if (!response.ok) {
                throw new Error(`Failed to get messages: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting process messages:', error);
            throw error;
        }
    }

    // Security validation methods for AO ecosystem
    async validateProcessSecurity(processId) {
        try {
            const state = await this.queryProcessState(processId);
            const messages = await this.getProcessMessages(processId, 10);
            
            const securityMetrics = {
                processId: processId,
                isValid: true,
                threats: [],
                warnings: [],
                score: 100
            };

            // Check for suspicious patterns in process messages
            if (messages && messages.length > 0) {
                for (const message of messages) {
                    const threats = this.analyzeMessageSecurity(message);
                    if (threats.length > 0) {
                        securityMetrics.threats.push(...threats);
                        securityMetrics.score -= threats.length * 10;
                    }
                }
            }

            // Validate process configuration
            if (state) {
                const configThreats = this.analyzeProcessConfiguration(state);
                if (configThreats.length > 0) {
                    securityMetrics.threats.push(...configThreats);
                    securityMetrics.score -= configThreats.length * 15;
                }
            }

            securityMetrics.isValid = securityMetrics.score > 50;
            return securityMetrics;

        } catch (error) {
            console.error('Error validating process security:', error);
            return {
                processId: processId,
                isValid: false,
                threats: [{ type: 'validation_error', message: error.message }],
                warnings: [],
                score: 0
            };
        }
    }

    analyzeMessageSecurity(message) {
        const threats = [];
        const suspiciousPatterns = [
            // Lua injection patterns
            /loadstring\s*\(/i,
            /dofile\s*\(/i,
            /debug\.getinfo/i,
            // AO-specific suspicious patterns
            /Process\.kill/i,
            /Process\.spawn.*malicious/i,
            // General malicious patterns
            /eval\s*\(/i,
            /exec\s*\(/i,
            /system\s*\(/i
        ];

        const messageContent = JSON.stringify(message);
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(messageContent)) {
                threats.push({
                    type: 'suspicious_code',
                    pattern: pattern.toString(),
                    severity: 'high',
                    location: 'message_content'
                });
            }
        }

        // Check for suspicious tags
        if (message.tags) {
            for (const tag of message.tags) {
                if (tag.name === 'Action' && /delete|destroy|kill/i.test(tag.value)) {
                    threats.push({
                        type: 'destructive_action',
                        action: tag.value,
                        severity: 'medium',
                        location: 'message_tags'
                    });
                }
            }
        }

        return threats;
    }

    analyzeProcessConfiguration(processState) {
        const threats = [];

        // Check for processes with overly broad permissions
        if (processState.permissions && Array.isArray(processState.permissions)) {
            const dangerousPermissions = ['admin', 'root', 'system', 'all'];
            for (const permission of processState.permissions) {
                if (dangerousPermissions.includes(permission.toLowerCase())) {
                    threats.push({
                        type: 'excessive_permissions',
                        permission: permission,
                        severity: 'high',
                        location: 'process_config'
                    });
                }
            }
        }

        // Check for suspicious process metadata
        if (processState.metadata) {
            const metadata = JSON.stringify(processState.metadata);
            if (/malware|virus|exploit/i.test(metadata)) {
                threats.push({
                    type: 'suspicious_metadata',
                    severity: 'medium',
                    location: 'process_metadata'
                });
            }
        }

        return threats;
    }

    // Arweave transaction validation
    async validateArweaveTransaction(txId) {
        try {
            if (!this.arweave) {
                throw new Error('Arweave not initialized');
            }

            const transaction = await this.arweave.transactions.get(txId);
            const status = await this.arweave.transactions.getStatus(txId);

            const validation = {
                txId: txId,
                isValid: status.confirmed && status.confirmed.block_height > 0,
                confirmed: status.confirmed,
                blockHeight: status.confirmed ? status.confirmed.block_height : null,
                threats: [],
                warnings: []
            };

            // Analyze transaction data for threats
            if (transaction.data) {
                try {
                    const data = await this.arweave.transactions.getData(txId, { decode: true });
                    const threats = this.analyzeTransactionData(data);
                    validation.threats.push(...threats);
                } catch (error) {
                    validation.warnings.push({
                        type: 'data_read_error',
                        message: 'Could not read transaction data'
                    });
                }
            }

            // Analyze transaction tags
            if (transaction.tags) {
                const tagThreats = this.analyzeTransactionTags(transaction.tags);
                validation.threats.push(...tagThreats);
            }

            return validation;

        } catch (error) {
            console.error('Error validating Arweave transaction:', error);
            return {
                txId: txId,
                isValid: false,
                threats: [{ type: 'validation_error', message: error.message }],
                warnings: []
            };
        }
    }

    analyzeTransactionData(data) {
        const threats = [];
        if (!data) return threats;

        const dataString = typeof data === 'string' ? data : data.toString();
        
        // Check for malicious patterns in transaction data
        const maliciousPatterns = [
            /javascript:/i,
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /eval\s*\(/i,
            /document\.write/i,
            /window\.location/i
        ];

        for (const pattern of maliciousPatterns) {
            if (pattern.test(dataString)) {
                threats.push({
                    type: 'malicious_content',
                    pattern: pattern.toString(),
                    severity: 'high',
                    location: 'transaction_data'
                });
            }
        }

        return threats;
    }

    analyzeTransactionTags(tags) {
        const threats = [];
        
        for (const tag of tags) {
            // Check for suspicious app names or types
            if (tag.name === 'App-Name' && /malware|virus|exploit/i.test(tag.value)) {
                threats.push({
                    type: 'suspicious_app',
                    appName: tag.value,
                    severity: 'high',
                    location: 'transaction_tags'
                });
            }

            // Check for suspicious content types
            if (tag.name === 'Content-Type' && /application\/x-executable/i.test(tag.value)) {
                threats.push({
                    type: 'executable_content',
                    contentType: tag.value,
                    severity: 'medium',
                    location: 'transaction_tags'
                });
            }
        }

        return threats;
    }

    // Utility methods
    generateProcessAlert(processId, threats) {
        return {
            type: 'ao_process_threat',
            processId: processId,
            threats: threats,
            timestamp: Date.now(),
            severity: threats.some(t => t.severity === 'high') ? 'high' : 'medium'
        };
    }

    generateTransactionAlert(txId, threats) {
        return {
            type: 'arweave_transaction_threat',
            txId: txId,
            threats: threats,
            timestamp: Date.now(),
            severity: threats.some(t => t.severity === 'high') ? 'high' : 'medium'
        };
    }
}

// Export for use in other parts of the extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AOSDKWrapper;
} else if (typeof window !== 'undefined') {
    window.AOSDKWrapper = AOSDKWrapper;
}
