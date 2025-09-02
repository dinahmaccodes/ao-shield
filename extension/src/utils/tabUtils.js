// Utility functions for handling tab operations in the extension

export class TabUtils {
  /**
   * Get the currently active tab
   * @returns {Promise<chrome.tabs.Tab>} The active tab object
   */
  static async getCurrentTab() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (tabs && tabs.length > 0) {
          resolve(tabs[0]);
        } else {
          reject(new Error('No active tab found'));
        }
      });
    });
  }

  /**
   * Get the URL of the currently active tab
   * @returns {Promise<string>} The URL of the active tab
   */
  static async getCurrentTabUrl() {
    try {
      const tab = await this.getCurrentTab();
      return tab.url || '';
    } catch (error) {
      console.error('Error getting current tab URL:', error);
      return '';
    }
  }

  /**
   * Extract domain from URL
   * @param {string} url - The URL to extract domain from
   * @returns {string} The domain (e.g., 'example.com')
   */
  static extractDomain(url) {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error('Error extracting domain:', error);
      return '';
    }
  }

  /**
   * Check if URL is secure (HTTPS)
   * @param {string} url - The URL to check
   * @returns {boolean} True if HTTPS, false otherwise
   */
  static isSecure(url) {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get security status information for a URL
   * @param {string} url - The URL to analyze
   * @returns {Object} Security status object
   */
  static getSecurityStatus(url) {
    if (!url) {
      return {
        isSecure: false,
        protocol: 'unknown',
        domain: '',
        warnings: ['No URL provided']
      };
    }

    try {
      const urlObj = new URL(url);
      const isSecure = urlObj.protocol === 'https:';
      const domain = urlObj.hostname;

      const warnings = [];
      if (!isSecure) {
        warnings.push('Not using HTTPS');
      }
      if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
        warnings.push('Local development environment');
      }

      return {
        isSecure,
        protocol: urlObj.protocol.replace(':', ''),
        domain,
        warnings
      };
    } catch (error) {
      return {
        isSecure: false,
        protocol: 'invalid',
        domain: '',
        warnings: ['Invalid URL format']
      };
    }
  }
}
