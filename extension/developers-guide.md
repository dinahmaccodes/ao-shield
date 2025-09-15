# AO Shield Extension - Developers Guide

## 🎯 Table of Contents

1. [Extension Architecture Overview](#extension-architecture-overview)
2. [Core Logic Flow](#core-logic-flow)
3. [Security Engine Deep Dive](#security-engine-deep-dive)
4. [Wallet Integration System](#wallet-integration-system)
5. [Notification & Alert System](#notification--alert-system)
6. [File Structure & Responsibilities](#file-structure--responsibilities)
7. [Making Changes - Developer Guide](#making-changes---developer-guide)
8. [AI Agent Integration Guidelines](#ai-agent-integration-guidelines)
9. [Debugging & Troubleshooting](#debugging--troubleshooting)

---

## Extension Architecture Overview

### Core Architecture Pattern

AO Shield follows a **service worker-based architecture** using Chrome Extension Manifest V3:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Content       │    │   Background    │    │   Popup/UI      │
│   Scripts       │◄──►│   Service       │◄──►│   Interface     │
│   (content_ao.js)│    │   Worker        │    │   (React App)   │
│                 │    │   (background.js)│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Pages     │    │   Chrome APIs   │    │   User Actions  │
│   (AO/Arweave)  │    │   Storage/Tabs  │    │   Wallet Ops    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Design Principles

1. **Security First**: All operations prioritize user safety
2. **Non-Intrusive**: Minimal impact on user browsing experience
3. **Real-Time Protection**: Immediate threat detection and response
4. **Persistent State**: Wallet connections survive browser restarts
5. **Modular Design**: Components can be modified independently

---

## Core Logic Flow

### 1. Extension Initialization

```javascript
// background.js - Service Worker Startup
chrome.runtime.onStartup.addListener(() => {
  console.log("AO Shield started");
  initializeExtension();
});

function initializeExtension() {
  // 1. Load threat patterns
  loadThreatDatabase();

  // 2. Setup request interceptors
  setupNetworkMonitoring();

  // 3. Initialize storage
  initializeStorage();
}
```

### 2. Request Interception Pipeline

The extension intercepts web requests through a **4-stage pipeline**:

```javascript
// Stage 1: Request Analysis
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    return analyzeRequest(details);
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Pipeline Stages:
// 1. URL Pattern Matching → Check against threat database
// 2. Header Analysis → Examine request headers for anomalies
// 3. Payload Inspection → Scan POST data for malicious content
// 4. Risk Assessment → Calculate threat score and take action
```

### 3. Threat Detection Algorithm

```javascript
function handleThreatDetection(requestDetails) {
  const threatScore = calculateThreatScore(requestDetails);

  if (threatScore > THREAT_THRESHOLD) {
    // Block request
    blockMaliciousRequest(requestDetails);

    // Notify user
    showSecurityAlert(threatScore, requestDetails);

    // Log incident
    logSecurityEvent(requestDetails, threatScore);

    // Update UI badge
    updateExtensionBadge(threatScore);
  }
}
```

---

## Security Engine Deep Dive

### Threat Detection Mechanisms

#### 1. **URL Pattern Matching**

```javascript
// Malicious pattern database
const THREAT_PATTERNS = {
  phishing: [/ar\.weave.*\.scam/, /ao-.*\.fake/, /metamask.*\.phish/],
  malware: [
    /\.exe$|\.bat$|\.scr$/,
    /javascript:.*eval/,
    /data:.*base64.*script/,
  ],
  aoSpecific: [/ao\..*\.malicious/, /arweave.*\.fake.*wallet/],
};

function checkUrlPatterns(url) {
  for (const [category, patterns] of Object.entries(THREAT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return { threat: true, category, pattern };
      }
    }
  }
  return { threat: false };
}
```

#### 2. **Content Analysis Engine**

```javascript
// content_ao.js - Page content scanner
function scanPageContent() {
  const scripts = document.querySelectorAll("script");
  const links = document.querySelectorAll("a[href]");

  // Check for malicious scripts
  scripts.forEach((script) => {
    if (containsMaliciousCode(script.textContent)) {
      reportThreat("malicious-script", script);
    }
  });

  // Validate external links
  links.forEach((link) => {
    if (isPhishingLink(link.href)) {
      markSuspiciousLink(link);
    }
  });
}
```

#### 3. **Transaction Monitoring**

```javascript
function monitorTransaction(txData) {
  const riskFactors = {
    highValue: txData.amount > SUSPICIOUS_AMOUNT,
    unknownRecipient: !isKnownAddress(txData.recipient),
    rapidFrequency: checkTransactionFrequency(txData.sender),
    suspiciousContract: analyzeContractCode(txData.contractId),
  };

  const riskScore = calculateRiskScore(riskFactors);

  if (riskScore > RISK_THRESHOLD) {
    showTransactionWarning(txData, riskScore);
  }
}
```

---

## Wallet Integration System

### Enhanced Wallet Provider Architecture

```typescript
// EnhancedWalletProvider.tsx
interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: WalletType;
  lastConnected: number;
  autoReconnect: boolean;
}

class EnhancedWalletProvider extends ArweaveWalletKit {
  private state: WalletState;
  private persistenceManager: WalletStorage;

  async connect(walletType: WalletType) {
    try {
      const result = await super.connect(walletType);

      // Save state for persistence
      await this.persistenceManager.saveWalletState({
        isConnected: true,
        address: result.address,
        walletType,
        lastConnected: Date.now(),
        autoReconnect: true,
      });

      return result;
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  async autoRestore() {
    const savedState = await this.persistenceManager.getWalletState();

    if (savedState && savedState.autoReconnect) {
      // Attempt to restore connection
      return this.connect(savedState.walletType);
    }
  }
}
```

### Wallet Storage Implementation

```typescript
// walletStorage.ts
export class WalletStorage {
  private static readonly STORAGE_KEY = "ao_shield_wallet_state";
  private static readonly EXPIRY_HOURS = 24;

  async saveWalletState(state: WalletState): Promise<void> {
    const expiryTime = Date.now() + this.EXPIRY_HOURS * 60 * 60 * 1000;

    const storageData = {
      state,
      expiryTime,
      version: "1.0",
    };

    await chrome.storage.local.set({
      [this.STORAGE_KEY]: storageData,
    });
  }

  async getWalletState(): Promise<WalletState | null> {
    const data = await chrome.storage.local.get([this.STORAGE_KEY]);
    const stored = data[this.STORAGE_KEY];

    if (!stored || Date.now() > stored.expiryTime) {
      await this.clearWalletState();
      return null;
    }

    return stored.state;
  }
}
```

---

## Notification & Alert System

### Notification Architecture

The notification system operates through **4 trigger points**:

```javascript
// background.js - Notification system

// 1. Real-time threat detection
function handleImmediateThreat(threatData) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/shield-alert.png",
    title: "🛡️ AO Shield - Security Alert",
    message: `Blocked ${threatData.type}: ${threatData.description}`,
    priority: 2,
  });
}

// 2. Transaction warnings
function showTransactionAlert(txData) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/shield-warning.png",
    title: "⚠️ Transaction Warning",
    message: `High-risk transaction detected. Amount: ${txData.amount} AR`,
    requireInteraction: true,
  });
}

// 3. Wallet security events
function notifyWalletEvent(event) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/wallet.png",
    title: "🔐 Wallet Security",
    message: event.message,
    buttons: [{ title: "Review" }, { title: "Dismiss" }],
  });
}

// 4. System status updates
function updateSystemStatus(status) {
  chrome.action.setBadgeText({
    text: status.threatCount > 0 ? status.threatCount.toString() : "",
  });

  chrome.action.setBadgeBackgroundColor({
    color: status.threatLevel === "high" ? "#ff4444" : "#44ff44",
  });
}
```

### Notification State Management

```javascript
class NotificationManager {
    private activeNotifications = new Map();
    private notificationHistory = [];

    async showNotification(type, data) {
        const notificationId = await chrome.notifications.create({
            type: 'basic',
            iconUrl: this.getIconForType(type),
            title: this.getTitleForType(type),
            message: this.formatMessage(type, data),
            buttons: this.getButtonsForType(type)
        });

        // Track active notification
        this.activeNotifications.set(notificationId, {
            type,
            data,
            timestamp: Date.now()
        });

        // Add to history
        this.notificationHistory.push({
            id: notificationId,
            type,
            data,
            timestamp: Date.now()
        });

        return notificationId;
    }

    // Handle user interaction
    onNotificationClicked(notificationId) {
        const notification = this.activeNotifications.get(notificationId);

        if (notification) {
            this.handleNotificationAction(notification);
        }
    }
}
```

---

## Pin Feature Implementation

### Window Management System

```javascript
---

## File Structure & Responsibilities
```

### Pin State Persistence

```javascript
// Restore pin state on extension startup
async function restorePinState() {
  const data = await chrome.storage.local.get(["pinned", "pinnedWindowId"]);

  if (data.pinned && data.pinnedWindowId) {
    // Check if window still exists
    try {
      await chrome.windows.get(data.pinnedWindowId);
      pinManager.isPinned = true;
      pinManager.pinnedWindowId = data.pinnedWindowId;
    } catch (error) {
      // Window no longer exists, clear state
      await chrome.storage.local.remove(["pinned", "pinnedWindowId"]);
    }
  }
}
```

---

## File Structure & Responsibilities

### Core Files Breakdown

```
extension/
├── manifest.json           # Extension configuration & permissions
├── background.js          # Service worker - core logic (1,200+ lines)
├── content_ao.js          # Content script - page scanning
├── popup.html             # Extension popup entry point
├── src/
│   ├── App.jsx           # Main React application router
│   ├── main.jsx          # React entry point
│   ├── components/       # Reusable UI components
│   │   ├── Header.tsx    # Extension header with status indicators
│   │   └── ...
│   ├── pages/            # Main application pages
│   │   ├── ConnectWallet.tsx  # Primary landing page
│   │   ├── Dashboard.tsx      # Main dashboard view
│   │   ├── History.tsx        # Transaction history
│   │   └── Settings.tsx       # User preferences
│   ├── providers/        # React context providers
│   │   └── EnhancedWalletProvider.tsx  # Wallet integration
│   ├── utils/            # Utility functions
│   │   ├── walletStorage.ts    # Wallet persistence
│   │   └── ...
│   └── wallet/           # Wallet-specific utilities
└── icons/                # Extension icons and assets
```

#### File Responsibilities Deep Dive

**1. `background.js` (Service Worker)**

```javascript
// Primary responsibilities:
- Network request interception and analysis
- Threat detection and blocking
- Notification management
- Storage operations
- Extension lifecycle management

// Key functions:
handleThreatDetection()     // Core threat analysis
showNotification()          // User alerts
interceptRequest()          // Network monitoring
updateBadge()              // UI indicators
```

**2. `EnhancedWalletProvider.tsx`**

```typescript
// Responsibilities:
- Wallet connection management
- State persistence across sessions
- Auto-reconnection logic
- Multi-wallet support coordination
- Connection status monitoring

// Key features:
- Extends ArweaveWalletKit
- Automatic state restoration
- Error handling and recovery
- Cross-session synchronization
```

**3. `walletStorage.ts`**

```typescript
// Responsibilities:
- Chrome storage API abstraction
- Wallet state serialization/deserialization
- Expiration management
- Data validation and cleanup

// Core functions:
saveWalletState()          // Persist connection data
getWalletState()           // Restore saved state
clearWalletState()         // Clean expired data
validateStoredData()       // Data integrity checks
```

**4. `content_ao.js`**

```javascript
// Responsibilities:
- Page content scanning
- DOM manipulation for security warnings
- Real-time threat detection on pages
- Communication with background script

// Key operations:
scanForThreats()           // Page analysis
markSuspiciousElements()   // Visual warnings
reportFindings()           // Send to background
monitorPageChanges()       // Dynamic content
```

---

## Making Changes - Developer Guide

### Adding New Threat Detection Patterns

**1. Update Threat Database:**

```javascript
// In background.js, add to THREAT_PATTERNS object
const THREAT_PATTERNS = {
  // Existing patterns...
  newThreatType: [/your-new-pattern-here/, /another-pattern/],
};
```

**2. Implement Detection Logic:**

```javascript
function detectNewThreatType(requestDetails) {
  const url = requestDetails.url;
  const patterns = THREAT_PATTERNS.newThreatType;

  for (const pattern of patterns) {
    if (pattern.test(url)) {
      return {
        threat: true,
        type: "newThreatType",
        severity: "high",
        description: "Description of the threat",
      };
    }
  }

  return { threat: false };
}
```

**3. Integrate with Main Detection:**

```javascript
function handleThreatDetection(details) {
  // Existing checks...

  const newThreatResult = detectNewThreatType(details);
  if (newThreatResult.threat) {
    blockRequest(details);
    showNotification("security-alert", newThreatResult);
    logThreatEvent(newThreatResult);
  }
}
```

### Adding New UI Components

**1. Create Component File:**

```typescript
// src/components/NewComponent.tsx
import React from "react";

interface NewComponentProps {
  data: any;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  data,
  onAction,
}) => {
  return <div className="new-component">{/* Component content */}</div>;
};
```

**2. Add to Router:**

```jsx
// src/App.jsx
import { NewComponent } from "./components/NewComponent";

function App() {
  return (
    <Router>
      {/* Existing routes */}
      <Route path="/new-feature" component={NewComponent} />
    </Router>
  );
}
```

### Modifying Wallet Integration

**1. Extend Wallet Provider:**

```typescript
// src/providers/EnhancedWalletProvider.tsx
export class EnhancedWalletProvider {
  async newWalletFeature() {
    try {
      // Your new wallet functionality
      const result = await this.performNewOperation();

      // Update state
      this.updateWalletState(result);

      // Persist changes
      await this.walletStorage.saveWalletState(this.state);

      return result;
    } catch (error) {
      this.handleWalletError(error);
    }
  }
}
```

**2. Update Storage Schema:**

```typescript
// src/utils/walletStorage.ts
interface WalletState {
  // Existing fields...
  newField: string;
  newFeatureData: any;
}
```

### Adding New Notifications

**1. Define Notification Type:**

```javascript
// background.js
const NOTIFICATION_TYPES = {
  // Existing types...
  NEW_ALERT_TYPE: {
    icon: "icons/new-icon.png",
    title: "New Alert Title",
    priority: 1,
  },
};
```

**2. Create Notification Handler:**

```javascript
function showNewAlertType(data) {
  const config = NOTIFICATION_TYPES.NEW_ALERT_TYPE;

  chrome.notifications.create({
    type: "basic",
    iconUrl: config.icon,
    title: config.title,
    message: formatNewAlertMessage(data),
    priority: config.priority,
  });
}
```

---

## AI Agent Integration Guidelines

### For AI Agents Working on This Codebase

#### Quick Orientation Checklist

**1. Essential Files to Understand First:**

```
□ background.js - Core logic (start here)
□ manifest.json - Permissions and configuration
□ src/App.jsx - UI flow and routing
□ EnhancedWalletProvider.tsx - Wallet integration
□ walletStorage.ts - State persistence
```

**2. Common Modification Patterns:**

**Security Enhancement:**

```javascript
// Location: background.js
// Pattern: Add to handleThreatDetection()
if (newThreatCondition) {
  return { action: "block", reason: "New threat type detected" };
}
```

**UI Feature Addition:**

```typescript
// Location: src/components/
// Pattern: Create new component, add to App.jsx router
export const NewFeature = () => {
  // Component logic
};
```

**Wallet Feature:**

```typescript
// Location: EnhancedWalletProvider.tsx
// Pattern: Add method, update storage schema
async newWalletMethod() {
    // Implementation
    await this.walletStorage.saveWalletState(newState);
}
```

#### AI Agent Code Navigation Map

```javascript
// Critical functions and their locations:

// Threat Detection Entry Point
background.js:handleThreatDetection() // Line ~150

// Wallet Connection Logic
EnhancedWalletProvider.tsx:connect() // Line ~45

// Storage Operations
walletStorage.ts:saveWalletState() // Line ~20

// UI State Management
App.jsx:App() // Line ~15

// Pin Feature
background.js:managePinState() // Line ~800

// Notification System
background.js:showNotification() // Line ~300
```

#### Common AI Agent Tasks & Solutions

**Task: Add new threat pattern**

```javascript
// 1. Find: THREAT_PATTERNS object in background.js
// 2. Add: new pattern to appropriate category
// 3. Test: handleThreatDetection() picks it up automatically
```

**Task: Modify wallet behavior**

```typescript
// 1. Find: EnhancedWalletProvider.tsx
// 2. Modify: connect() or disconnect() methods
// 3. Update: walletStorage.ts if schema changes
```

**Task: Change UI flow**

```jsx
// 1. Find: App.jsx router configuration
// 2. Modify: route conditions or add new routes
// 3. Update: component imports as needed
```

**Task: Debug extension issues**

```javascript
// 1. Check: Chrome DevTools > Extensions > Service Worker
// 2. Look: console.log statements in background.js
// 3. Inspect: chrome.storage.local data
// 4. Verify: manifest.json permissions
```

### Development Environment Setup for AI Agents

**1. Required Tools:**

- Node.js 16+ for build system
- Chrome browser for testing
- VS Code with extension development tools

**2. Essential Commands:**

```bash
npm install          # Install dependencies
npm run dev         # Development server
npm run build       # Production build
npm run test        # Run tests
```

**3. Testing Workflow:**

```bash
# 1. Build extension
npm run build

# 2. Load unpacked in Chrome
# Go to chrome://extensions/
# Enable Developer Mode
# Click "Load unpacked" → select dist folder

# 3. Test functionality
# Check background script console
# Verify UI components work
# Test wallet connections
```

---

## Debugging & Troubleshooting

### Common Issues & Solutions

#### 1. **Extension Not Loading**

**Symptoms:**

- Extension appears in Chrome but doesn't activate
- Service worker not running

**Debug Steps:**

```javascript
// Check manifest.json syntax
{
    "manifest_version": 3,
    "permissions": ["storage", "notifications", "tabs"],
    "background": {
        "service_worker": "background.js"
    }
}

// Verify in Chrome DevTools:
// 1. Go to chrome://extensions/
// 2. Click "Details" on AO Shield
// 3. Click "Inspect views: service worker"
// 4. Check console for errors
```

#### 2. **Wallet Connection Issues**

**Symptoms:**

- Wallets not connecting
- State not persisting

**Debug Steps:**

```typescript
// Check wallet storage
chrome.storage.local.get(["ao_shield_wallet_state"], (result) => {
  console.log("Stored wallet state:", result);
});

// Verify ArweaveWalletKit initialization
// In EnhancedWalletProvider.tsx
console.log("Available wallets:", this.wallets);
console.log("Connection status:", this.connected);
```

#### 3. **Notifications Not Showing**

**Symptoms:**

- Security alerts not appearing
- Badge not updating

**Debug Steps:**

```javascript
// Check notification permissions
chrome.notifications.getPermissionLevel((level) => {
  console.log("Notification permission:", level);
});

// Test notification manually
chrome.notifications.create({
  type: "basic",
  iconUrl: "icons/icon48.png",
  title: "Test",
  message: "Test notification",
});
```

### Performance Monitoring

```javascript
// Add performance tracking to background.js
const performanceMonitor = {
  threats_detected: 0,
  requests_processed: 0,
  notifications_sent: 0,

  logMetric(metric, value) {
    this[metric] = (this[metric] || 0) + value;
    console.log(`Performance: ${metric} = ${this[metric]}`);
  },
};

// Use in threat detection
function handleThreatDetection(details) {
  const startTime = performance.now();

  // Threat detection logic...

  const endTime = performance.now();
  performanceMonitor.logMetric("detection_time_ms", endTime - startTime);
}
```

### Extension Health Checks

```javascript
// Add to background.js for system health monitoring
function performHealthCheck() {
  const health = {
    service_worker: "running",
    storage_available: false,
    notifications_enabled: false,
    wallet_provider_ready: false,
  };

  // Check storage
  chrome.storage.local.get(null, (items) => {
    health.storage_available = !chrome.runtime.lastError;
  });

  // Check notifications
  chrome.notifications.getPermissionLevel((level) => {
    health.notifications_enabled = level === "granted";
  });

  console.log("Extension Health:", health);
  return health;
}

// Run health check every 5 minutes
setInterval(performHealthCheck, 5 * 60 * 1000);
```

---

## 🔄 Version Control & Deployment

### Git Workflow for Changes

```bash
# 1. Create feature branch
git checkout -b feature/new-security-pattern

# 2. Make changes following guidelines above
# 3. Test thoroughly in development

# 4. Build and test production version
npm run build
# Load unpacked extension and test

# 5. Commit changes
git add .
git commit -m "feat: add new security pattern for XYZ threats"

# 6. Push and create PR
git push origin feature/new-security-pattern
```

### Release Checklist

- [ ] All tests passing
- [ ] Extension builds without errors
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Version number bumped in manifest.json
- [ ] Security audit completed

---

This comprehensive guide provides the technical foundation for understanding, modifying, and extending the AO Shield extension. Use it as your primary reference when working on the codebase.
