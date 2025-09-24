// Communication utilities for frontend to extension messaging

// Declare chrome global for TypeScript
declare global {
    interface Window {
        chrome?: any;
    }
}

export const sendWalletAddressToExtension = async (walletAddress: string) => {
    try {
        const chromeObj = (window as any).chrome;
        // Check if we're in a browser with chrome.runtime available
        if (
            typeof chromeObj !== 'undefined' &&
            chromeObj.runtime &&
            chromeObj.runtime.sendMessage
        ) {
            return new Promise((resolve, reject) => {
                chromeObj.runtime.sendMessage(
                    'your-extension-id', // Replace with actual extension ID
                    {
                        type: 'WALLET_ADDRESS_UPDATE',
                        walletAddress: walletAddress,
                        timestamp: Date.now(),
                    },
                    (response: any) => {
                        if (chromeObj.runtime.lastError) {
                            reject(chromeObj.runtime.lastError);
                        } else {
                            resolve(response);
                        }
                    }
                );
            });
        } else {
            // Alternative: Use localStorage for communication when extension is not available
            localStorage.setItem(
                'aoShieldWalletAddress',
                JSON.stringify({
                    address: walletAddress,
                    timestamp: Date.now(),
                })
            );
            return Promise.resolve({ success: true, method: 'localStorage' });
        }
    } catch (error) {
        console.error('Failed to send wallet address to extension:', error);
        throw error;
    }
};

export const removeWalletAddressFromExtension = async () => {
    try {
        const chromeObj = (window as any).chrome;
        if (
            typeof chromeObj !== 'undefined' &&
            chromeObj.runtime &&
            chromeObj.runtime.sendMessage
        ) {
            return new Promise((resolve, reject) => {
                chromeObj.runtime.sendMessage(
                    'your-extension-id', // Replace with actual extension ID
                    {
                        type: 'WALLET_ADDRESS_REMOVE',
                        timestamp: Date.now(),
                    },
                    (response: any) => {
                        if (chromeObj.runtime.lastError) {
                            reject(chromeObj.runtime.lastError);
                        } else {
                            resolve(response);
                        }
                    }
                );
            });
        } else {
            localStorage.removeItem('aoShieldWalletAddress');
            return Promise.resolve({ success: true, method: 'localStorage' });
        }
    } catch (error) {
        console.error('Failed to remove wallet address from extension:', error);
        throw error;
    }
};

export const getWalletAddressFromStorage = (): string | null => {
    try {
        const stored = localStorage.getItem('aoShieldWalletAddress');
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.address;
        }
        return null;
    } catch (error) {
        console.error('Failed to get wallet address from storage:', error);
        return null;
    }
};
