# Development Setup Guide

This comprehensive guide will help you set up your development environment for AO Shield. Whether you're fixing bugs, adding features, or exploring the codebase, this guide covers everything you need to get started.

## Prerequisites

Before setting up the development environment, ensure you have:

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (included with Node.js)
- **Git**: For version control
- **Browser**: Chrome (recommended) or Edge

### Recommended Tools
- **VS Code**: Recommended IDE with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - TypeScript Importer
  - Auto Rename Tag
  - Bracket Pair Colorizer
- **GitHub Desktop**: GUI for Git operations (optional)

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space
- **Internet**: Stable connection for package downloads

---

## Quick Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/dinahmaccodes/ao-shield.git

# Navigate to the project directory
cd ao-shield

# Switch to the extension directory
cd extension
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm --version
node --version
```

### Step 3: Start Development Server

```bash
# Start the development server
npm run dev

# The server will start on http://localhost:5173
```

### Step 4: Build the Extension

```bash
# Build for production
npm run build

# The built extension will be in the 'dist' folder
```

---

## Project Structure

Understanding the codebase structure is crucial for effective development:

```
ao-shield/extension/
├── src/                          # React application source
│   ├── components/              # Reusable UI components
│   │   ├── Card.tsx            # Card component
│   │   ├── Header.tsx          # Header component
│   │   ├── NavBar.tsx          # Navigation bar
│   │   └── ...
│   ├── pages/                   # Page components
│   │   ├── Alerts.tsx          # Alerts page
│   │   ├── Dashboard.tsx       # Dashboard page
│   │   ├── ConnectWallet.tsx   # Wallet connection page
│   │   └── ...
│   ├── providers/              # Context providers
│   ├── utils/                  # Utility functions
│   │   └── tabUtils.js         # Tab management utilities
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
│   └── assets/
│       └── images/             # Images and icons
├── dist/                       # Built extension (generated)
├── manifest.json               # Extension manifest
├── background.js               # Background service worker
├── content_ao.js              # Content script
├── ao-sdk.js                  # AO ecosystem SDK
├── popup.html                 # Extension popup HTML
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

---

## 🛠️ Development Workflow

### Daily Development Cycle

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Make Changes**
   - Edit files in `src/` directory
   - Test changes in browser
   - Use hot reload for instant feedback

5. **Build and Test**
   ```bash
   npm run build
   # Load the dist/ folder in browser extensions
   ```

6. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Loading Extension in Browser

#### For Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. The extension will appear in your toolbar

#### For Firefox:
1. Go to `about:debugging`
2. Click "This Firefox" → "Load Temporary Add-on"
3. Select `extension/dist/manifest.json`
4. The extension will be temporarily installed

---

## Testing Your Changes

### Manual Testing

1. **Load the Extension**
   - Follow the loading steps above
   - Open the extension popup

2. **Test Core Features**
   - Connect a Web3 wallet
   - Navigate to DeFi websites
   - Check for security alerts
   - Verify tab information display

3. **Test Different Scenarios**
   - Safe websites (should show green status)
   - Suspicious websites (should trigger alerts)
   - Wallet connection flows
   - Settings configuration

### Automated Testing

```bash
# Run tests (when available)
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

---

## 🔧 Development Tools

### Essential VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intention",
    "ms-vscode.vscode-json"
  ]
}
```

### Browser Development Tools

1. **Chrome DevTools**
   - Console for debugging
   - Network tab for API calls
   - Application tab for extension storage

2. **Extension Debugging**
   - Right-click extension icon → "Inspect popup"
   - Background page: `chrome://extensions/` → "Inspect views: background page"
   - Content scripts: Use regular DevTools on web pages

---

## UI Development

### Component Structure

AO Shield uses a component-based architecture:

```jsx
// Example component structure
import React from 'react';

interface ComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, onAction }) => {
  return (
    <div className="component-container">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default MyComponent;
```

### Styling Guidelines

- **Tailwind CSS**: Primary styling framework
- **Component Classes**: Use descriptive class names
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Consistent dark theme throughout

### State Management

- **React Hooks**: useState, useEffect for local state
- **Context API**: For global application state
- **Chrome Storage**: For persistent extension data

---

## Browser Extension APIs

### Core APIs Used

1. **Tabs API**
   ```javascript
   // Get current tab
   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
     const currentTab = tabs[0];
     console.log('Current URL:', currentTab.url);
   });
   ```

2. **Storage API**
   ```javascript
   // Store data
   chrome.storage.local.set({ key: 'value' });

   // Retrieve data
   chrome.storage.local.get(['key'], (result) => {
     console.log('Value:', result.key);
   });
   ```

3. **Runtime API**
   ```javascript
   // Send message to background script
   chrome.runtime.sendMessage({ action: 'doSomething', data: payload });
   ```

### Permissions

The extension requires these permissions (defined in `manifest.json`):

- `activeTab`: Access current tab information
- `storage`: Store extension data
- `tabs`: Query and manipulate tabs
- `notifications`: Show security alerts
- `webRequest`: Monitor network requests

---

## Deployment

### Building for Production

```bash
# Create production build
npm run build

# The extension package will be in extension/dist/
# Ready for upload to Chrome Web Store or manual distribution
```

### Version Management

1. **Update Version**
   ```json
   // package.json
   {
     "version": "1.0.1"
   }

   // manifest.json
   {
     "version": "1.0.1"
   }
   ```

2. **Create Release**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

---

## Debugging

### Common Issues

1. **Extension Not Loading**
   - Check console for errors
   - Verify manifest.json syntax
   - Ensure all required files are in dist/

2. **Hot Reload Not Working**
   - Restart the development server
   - Check for TypeScript errors
   - Clear browser cache

3. **API Calls Failing**
   - Verify permissions in manifest.json
   - Check network tab for failed requests
   - Ensure correct API endpoints

### Debug Logging

```javascript
// Add debug logging
console.log('Debug info:', { variable, state, props });

// Use extension-specific logging
chrome.runtime.sendMessage({
  action: 'log',
  level: 'debug',
  message: 'Debug message'
});
```

---

##  Learning Resources

### Official Documentation

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Community Resources

- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [Web3 Developer Community](https://ethereum.org/en/developers/)
- [AO Ecosystem Documentation](https://docs.ao.arweave.net/)

---

## Contributing

### Code Style

- **ESLint**: Follow the project's linting rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict type checking enabled
- **Conventional Commits**: Use conventional commit messages

### Pull Request Process

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Write clear, concise code
   - Add tests for new features
   - Update documentation

4. **Test Thoroughly**
   - Manual testing in multiple browsers
   - Verify no breaking changes
   - Check performance impact

5. **Submit Pull Request**
   - Provide clear description
   - Reference related issues
   - Request review from maintainers

---

## Support

### Getting Help

- **Documentation**: Check this guide and related docs
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our developer community

### Reporting Bugs

When reporting bugs, include:

- Browser and version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors or logs

---

## Next Steps

Now that your development environment is set up:

1. **[Explore the Codebase](../developers/README.md)** - Learn about our architecture
2. **[Try the Quick Demo](../getting-started/quick-demo.md)** - See AO Shield in action
3. **[Contribute](../resources/contributing.md)** - Start making your first contribution
4. **[Join the Community](https://discord.gg/6XqdBUDD)** - Connect with other developers

