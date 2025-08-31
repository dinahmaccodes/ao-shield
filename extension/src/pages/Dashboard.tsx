import React from 'react';
import { AlertTriangle, TrendingUp, Shield, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/Card';

interface DashboardProps {
  alert: any;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ alert, onBack }) => {
  const stats = [
    { label: 'Threats Blocked', value: '247', icon: Shield, color: 'text-green-400' },
    { label: 'Active Sessions', value: '3', icon: Eye, color: 'text-blue-400' },
    { label: 'Risk Score', value: `${alert?.riskScore || 98}%`, icon: TrendingUp, color: 'text-red-400' },
  ];

  return (
    <div className="h-full">
      <div className="overflow-y-auto h-full scrollbar-hide pb-6">
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Alert Details */}
            <Card hover={false}>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={32} className="text-red-400" />
                </div>
                <h2 className="text-xl font-semibold mb-1">{alert?.title || 'Fraud Alert'}</h2>
                <span className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-full">
                  {alert?.riskScore || 98}%
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span>{alert?.amount || '0.5 ETH'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">To:</span>
                  <span className="font-mono">{alert?.to || '0x4343...bcc'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Score:</span>
                  <span className="text-red-400">{alert?.riskScore || 98}%</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-xs">
                  ⚠ Address matches 20 scam reports
                </p>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card hover={false} className="text-center p-3">
                      <Icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Chart Placeholder */}
            <Card hover={false}>
              <h3 className="font-medium mb-3">Risk Analysis</h3>
              <div className="h-24 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">Risk Chart Visualization</span>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-medium transition-all"
              >
                Block now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 py-3 rounded-xl font-medium transition-all"
              >
                Allow anyway
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;