import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  ArrowLeft,
  History,
} from "lucide-react";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [isProtected, setIsProtected] = useState(true);
  const [activeView, setActiveView] = useState("alerts"); // alerts, settings, history
  const [stats, setStats] = useState({
    threatsBlocked: 0,
    scansToday: 0,
    walletAddress: "0x1234...5678",
  });

  // Sample alert data based on your mobile design
  const sampleAlerts = [
    {
      id: 1,
      type: "Fraud Alert",
      risk: "98%",
      amount: "0.9 ETH",
      to: "0x4343...bcc",
      description: "Address matches 20 drain reports",
      severity: "high",
      timestamp: "4s",
    },
    {
      id: 2,
      type: "Security Alert",
      risk: "85%",
      amount: "0.4 ETH",
      to: "0x4343...bcc",
      description: "Address matches 15 drain reports",
      severity: "medium",
      timestamp: "1m",
    },
  ];

  useEffect(() => {
    // Load initial data
    setAlerts(sampleAlerts);
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Check if chrome.storage is available (extension environment)
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get([
          "threatsBlocked",
          "scansToday",
        ]);
        setStats((prev) => ({
          ...prev,
          threatsBlocked: result.threatsBlocked || 12,
          scansToday: result.scansToday || 5,
        }));
      } else {
        // Development environment - use mock data
        setStats((prev) => ({
          ...prev,
          threatsBlocked: 12,
          scansToday: 5,
        }));
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      // Fallback to mock data
      setStats((prev) => ({
        ...prev,
        threatsBlocked: 12,
        scansToday: 5,
      }));
    }
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const removeAlert = (alertId) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
  };

  const blockTransaction = (alertId) => {
    removeAlert(alertId);
    // Logic to block transaction
  };

  const allowTransaction = (alertId) => {
    removeAlert(alertId);
    // Logic to allow transaction
  };

  if (activeView === "settings") {
    return (
      <div className="w-[380px] min-h-[600px] bg-background text-text font-inter flex flex-col">
        {/* Settings Header */}
        <header className="p-4 border-b border-border-primary">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => setActiveView("alerts")}
              className="text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </header>

        {/* Settings Content */}
        <main className="flex-1 p-4">
          {/* Wallet Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Wallet Status</span>
              <button className="text-xs text-accent">🔗</button>
            </div>
            <div className="text-sm font-mono">{stats.walletAddress}</div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Quick actions</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bin</span>
                <span className="text-sm text-text-secondary">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Approved</span>
                <span className="text-sm text-text-secondary">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Blocked</span>
                <span className="text-sm text-text-secondary">0</span>
              </div>
            </div>
          </div>

          {/* Other Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Other actions</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Notification</span>
                <div className="w-10 h-5 bg-accent rounded-full relative">
                  <div className="w-4 h-4 bg-background rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sound</span>
                <div className="w-10 h-5 bg-border-primary rounded-full relative">
                  <div className="w-4 h-4 bg-text-secondary rounded-full absolute top-0.5 left-0.5"></div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Navigation */}
        <nav className="flex border-t border-border-primary">
          <button
            onClick={() => setActiveView("alerts")}
            className="flex-1 flex flex-col items-center py-3 text-text-secondary"
          >
            <Shield className="w-5 h-5 mb-1" />
            <span className="text-xs">Alerts</span>
          </button>
          <button
            onClick={() => setActiveView("history")}
            className="flex-1 flex flex-col items-center py-3 text-text-secondary"
          >
            <History className="w-5 h-5 mb-1" />
            <span className="text-xs">History</span>
          </button>
          <button className="flex-1 flex flex-col items-center py-3 text-accent">
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs">Settings</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="w-[380px] min-h-[600px] bg-background text-text font-inter flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-border-primary">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-accent font-bold text-sm">a</span>
            </div>
            <h1 className="text-lg font-semibold">Shield</h1>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isProtected
                ? "bg-success/20 text-success border border-success/30"
                : "bg-danger/20 text-danger border border-danger/30"
            }`}
          >
            {isProtected ? "Protected" : "Disconnected"}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Action Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">{alerts.length} Active</span>
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="text-xs text-text-secondary hover:text-text transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Alerts Section */}
        <div className="space-y-3 mb-6">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No active alerts yet.
              </h3>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-card-bg border border-border-primary rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-danger/20 rounded-full flex items-center justify-center">
                      <span className="text-danger text-xs font-bold">
                        {alert.timestamp}
                      </span>
                    </div>
                    <span className="font-medium text-sm">{alert.type}</span>
                  </div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-text-secondary hover:text-text transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-text-secondary">Amount:</span>
                    <span className="text-sm font-medium">{alert.amount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-text-secondary">To:</span>
                    <span className="text-sm font-mono">{alert.to}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">
                      Risk Score:
                    </span>
                    <span className="text-sm font-medium text-danger">
                      {alert.risk}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-text-secondary mb-1">
                    Why this is risky:
                  </div>
                  <div className="text-xs text-text-secondary">
                    • {alert.description}
                  </div>
                </div>

                <div className="w-full bg-danger h-1 rounded-full mb-4"></div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => blockTransaction(alert.id)}
                    className="flex-1 bg-danger hover:bg-danger/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Block now
                  </button>
                  <button
                    onClick={() => allowTransaction(alert.id)}
                    className="flex-1 bg-card-bg border border-border-primary hover:border-accent text-accent font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Allow anyway
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Navigation */}
      <nav className="flex border-t border-border-primary">
        <button className="flex-1 flex flex-col items-center py-3 text-accent">
          <Shield className="w-5 h-5 mb-1" />
          <span className="text-xs">Alerts</span>
        </button>
        <button
          onClick={() => setActiveView("history")}
          className="flex-1 flex flex-col items-center py-3 text-text-secondary"
        >
          <History className="w-5 h-5 mb-1" />
          <span className="text-xs">History</span>
        </button>
        <button
          onClick={() => setActiveView("settings")}
          className="flex-1 flex flex-col items-center py-3 text-text-secondary"
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-xs">Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
