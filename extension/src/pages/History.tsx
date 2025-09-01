import React from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/Card';

const History: React.FC = () => {
  const historyItems = [
    {
      id: 1,
      type: 'Transaction',
      status: 'blocked',
      amount: '0.5 ETH',
      to: '0x4343...bcc',
      timestamp: '2 hours ago',
      risk: 'High'
    },
    {
      id: 2,
      type: 'Transaction',
      status: 'approved',
      amount: '0.2 ETH',
      to: '0x7432...def',
      timestamp: '5 hours ago',
      risk: 'Low'
    },
    {
      id: 3,
      type: 'Transaction',
      status: 'blocked',
      amount: '0.8 ETH',
      to: '0x9876...abc',
      timestamp: '1 day ago',
      risk: 'High'
    },
    {
      id: 4,
      type: 'Transaction',
      status: 'approved',
      amount: '0.1 ETH',
      to: '0x5432...xyz',
      timestamp: '2 days ago',
      risk: 'Low'
    },
    {
      id: 5,
      type: 'Transaction',
      status: 'blocked',
      amount: '0.3 ETH',
      to: '0x8765...abc',
      timestamp: '3 days ago',
      risk: 'Medium'
    },
    {
      id: 6,
      type: 'Transaction',
      status: 'approved',
      amount: '0.15 ETH',
      to: '0x2468...def',
      timestamp: '4 days ago',
      risk: 'Low'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'blocked':
        return <XCircle size={16} className="text-red-400" />;
      case 'approved':
        return <CheckCircle size={16} className="text-green-400" />;
      default:
        return <AlertTriangle size={16} className="text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked':
        return 'text-red-400';
      case 'approved':
        return 'text-green-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className="h-full">
      <div className="overflow-y-auto h-full scrollbar-hide pb-20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-gray-400" />
            <h2 className="text-lg font-semibold">Transaction History</h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {historyItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-800 ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>Amount: {item.amount}</div>
                          <div>To: {item.to}</div>
                          <div>Risk: {item.risk}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {item.timestamp}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {historyItems.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Clock size={48} className="text-gray-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No history yet</h3>
              <p className="text-gray-400 text-sm text-center">
                Your transaction history will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;