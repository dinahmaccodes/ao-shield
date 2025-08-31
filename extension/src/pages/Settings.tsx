import React, { useState } from 'react';
import { Settings as SettingsIcon, Wallet, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/Card';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    aiAgent: true,
    autoConnection: true,
    blockchainMonitor: true,
    sound: false
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all ${
        enabled ? 'bg-cyan-500' : 'bg-gray-600'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-5 h-5 bg-white rounded-full absolute top-0.5"
      />
    </motion.button>
  );

  return (
    <div className="h-full">
      <div className="overflow-y-auto h-full scrollbar-hide pb-20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon size={20} className="text-gray-400" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Wallet Stats */}
            <Card hover={false}>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Wallet size={16} />
                Wallet Stats
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Quick actions</div>
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between">
                      <span>Approved</span>
                      <span className="text-green-400">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blocked</span>
                      <span className="text-red-400">91</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Other actions</div>
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between">
                      <span>Bin</span>
                      <span>23</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved</span>
                      <span className="text-green-400">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blocked</span>
                      <span className="text-red-400">15</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Settings Options */}
            <Card hover={false}>
              <h3 className="font-medium mb-4">Other actions</h3>
              <div className="space-y-4">
                {[
                  { key: 'aiAgent', label: 'AI Agent' },
                  { key: 'autoConnection', label: 'Arweave Connection' },
                  { key: 'blockchainMonitor', label: 'Blockchain monitor' },
                  { key: 'notifications', label: 'Notifications' },
                  { key: 'sound', label: 'Sound' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <Toggle
                      enabled={settings[item.key as keyof typeof settings]}
                      onChange={() => toggleSetting(item.key)}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* About Section */}
            <Card hover={false}>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <img 
                    src="/src/assets/images/aologo.svg" 
                    alt="AO Shield" 
                    className="w-8 h-8"
                  />
                </div>
                <p className="text-red-400 text-sm mb-2">You are not registered with the extension</p>
                <p className="text-gray-400 text-xs">
                  Create an account to sync your settings across devices
                </p>
              </div>
            </Card>

            {/* Links */}
            <div className="space-y-2 pt-2">
              <button className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                <ExternalLink size={14} />
                Documentation
              </button>
              <button className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                <ExternalLink size={14} />
                Support
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;