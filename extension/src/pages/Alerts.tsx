import React, { useState, useEffect } from "react";
import { AlertTriangle, Shield, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Card from "../components/Card";
import { Threat } from "../types";

interface AlertsProps {
  onViewDashboard: (alert: Threat) => void;
}

const Alerts: React.FC<AlertsProps> = ({ onViewDashboard }) => {
  const [alerts, setAlerts] = useState<Threat[]>([]);

  useEffect(() => {
    const fetchAlerts = () => {
      chrome.storage.local.get("protectionHistory", (result) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }
        if (result.protectionHistory) {
          setAlerts(result.protectionHistory);
        }
      });
    };

    fetchAlerts();

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      if (area === "local" && changes.protectionHistory) {
        setAlerts(changes.protectionHistory.newValue || []);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-red-400 bg-red-400/10";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/10";
      case "Low":
        return "text-green-400 bg-green-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Shield size={48} className="mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-medium mb-2">No active alerts yet.</h3>
          <p className="text-gray-400 text-sm">
            Your wallet is secure and protected.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="overflow-y-auto h-full scrollbar-hide pb-20">
        <div className="p-4 space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card onClick={() => onViewDashboard(alert)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-red-400" />
                        <h3 className="font-medium">{alert.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getRiskColor(
                            alert.riskLevel
                          )}`}
                        >
                          {alert.riskLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {alert.message}
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>Source: {new URL(alert.source).hostname}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 mt-2" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <button
              onClick={() => onViewDashboard(alerts[0])}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              View Threats
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
