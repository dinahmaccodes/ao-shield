# Installation Guide

This guide will walk you through installing AO Shield in your browser. AO Shield is available for all major browsers and works seamlessly with your existing Web3 setup.

## Supported Browsers

AO Shield supports the following browsers:

- **Chrome** (recommended) - Version 88+
- **Edge** - Version 88+

---

## Quick Installation

### Option 1: Chrome Web Store (Recommended)

1. **Open Chrome Web Store**
   - Visit: `https://chromewebstore.google.com/`
   - Search for "AO Shield"

2. **Install the Extension**
   - Click "Add to Chrome"
   - Click "Add extension" in the confirmation dialog

3. **Verify Installation**
   - Look for the AO Shield icon in your browser toolbar
   - The icon should appear as a shield 🛡️

### Option 2: Manual Installation (For Developers/Testing)

If you're installing from source or testing a development build:

#### Step 1: Download the Extension

```bash
# Clone the repository
git clone https://github.com/your-org/ao-shield.git
cd ao-shield/extension

# Install dependencies
npm install

# Build the extension
npm run build
```

#### Step 2: Load in Chrome

1. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Or click the three-dot menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

3. **Load Unpacked Extension**
   - Click "Load unpacked"
   - Select the `extension/dist` folder
   - Click "Select Folder"

4. **Verify Installation**
   - AO Shield should appear in your extensions list
   - The extension icon should appear in your toolbar

---

## 🔧 Post-Installation Setup

### Step 1: Initial Configuration

1. **Click the AO Shield Icon**
   - Click the shield icon 🛡️ in your browser toolbar

2. **Connect Your Wallet**
   - Click "Connect Wallet" in the popup
   - Choose your preferred Web3 wallet (MetaMask, Trust Wallet, etc.)
   - Approve the connection in your wallet

3. **Grant Permissions**
   - AO Shield will request necessary permissions:
     - Access to your current tab
     - Web request monitoring
     - Storage access
   - Click "Allow" for each permission

### Step 2: Security Settings

1. **Open Settings**
   - Click the gear icon ⚙️ in the AO Shield popup

2. **Configure Protection Level**
   - Choose from three protection levels:
     - **Basic**: Essential protection only
     - **Standard** (recommended): Balanced security and usability
     - **Maximum**: Highest security (may show more alerts)

3. **Enable Notifications** (Optional)
   - Toggle "Enable Notifications" to receive alerts
   - Choose notification preferences

---

## Testing Your Installation

### Verify AO Shield is Working

1. **Open a Web3 Website**
   - Visit any DeFi platform (Uniswap, PancakeSwap, etc.)
   - Or visit an NFT marketplace (OpenSea, etc.)

2. **Check for AO Shield Activity**
   - The AO Shield icon should show activity
   - Click the icon to see current tab analysis

3. **Test Wallet Connection**
   - Try connecting your wallet to a dApp
   - AO Shield should monitor the connection

### Expected Behavior

✅ **Green Shield Icon**: Site appears safe
🟡 **Yellow Shield Icon**: Potential security concerns detected
🔴 **Red Shield Icon**: High-risk activity detected
⚪ **Gray Shield Icon**: Extension not active or analyzing

---

## Updating AO Shield

### Automatic Updates (Web Store Installation)

- AO Shield updates automatically through the Chrome Web Store
- You'll see a notification when updates are available

### Manual Updates (Developer Installation)

```bash
# Pull latest changes
git pull origin main

# Rebuild the extension
npm run build

# Reload in browser
# Go to chrome://extensions/
# Click the refresh icon on AO Shield
```

---

## Troubleshooting Installation

### Extension Not Loading

**Problem**: Extension doesn't appear after installation

**Solutions**:
1. **Check Browser Compatibility**: Ensure you're using a supported browser version
2. **Reload Extensions**: Go to `chrome://extensions/` and click the refresh icon
3. **Restart Browser**: Close and reopen your browser
4. **Check Console**: Open DevTools (F12) and check for errors

### Wallet Connection Issues

**Problem**: Can't connect wallet to AO Shield

**Solutions**:
1. **Refresh the Page**: Reload the webpage
2. **Check Wallet**: Ensure your Web3 wallet is unlocked
3. **Clear Cache**: Clear browser cache and cookies
4. **Reconnect**: Disconnect and reconnect your wallet

### Permissions Not Granted

**Problem**: Extension requests permissions repeatedly

**Solutions**:
1. **Grant All Permissions**: Click "Allow" for all permission requests
2. **Check Settings**: Ensure AO Shield has necessary permissions in extension settings
3. **Reinstall**: Remove and reinstall the extension

---


*Note: Full mobile app development is planned for future releases.*

---

## Security Best Practices

### After Installation

1. **Regular Updates**: Keep AO Shield updated for latest security features
2. **Review Alerts**: Pay attention to security alerts and understand their meaning
3. **Backup Settings**: Export your AO Shield settings periodically
4. **Monitor Activity**: Regularly check the extension's activity logs

### Safe Usage

1. **Verify Websites**: Always double-check website URLs before connecting wallets
2. **Review Transactions**: Carefully review all transaction details
3. **Use Hardware Wallets**: For maximum security, use hardware wallets
4. **Stay Informed**: Keep up with Web3 security best practices

---

## Need Help?

If you encounter issues during installation:

- **Check our FAQ**: Visit our [Frequently Asked Questions](../resources/faq.md)
- **Community Support**: Join our [Discord](https://discord.gg/6XqdBUDD)
- **Documentation**: Browse our complete [technical documentation](../README.md)

---

## Next Steps

Once AO Shield is installed and configured:


1. **[Protect Your First Transaction](./first-transaction.md)** - Get hands-on experience
2. **[Learn Advanced Features](../user-guide/how-it-works.md)** - Understand how AO Shield works
3. **[Customize Settings](../user-guide/README.md)** - Tailor AO Shield to your needs

**Your Web3 experience is now protected by AI-powered security!** 
