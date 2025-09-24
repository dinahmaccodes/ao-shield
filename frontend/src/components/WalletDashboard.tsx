import React from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Activity,
    Database,
    Settings,
    ExternalLink,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

const WalletDashboard: React.FC = () => {
    const { activeAddress, shortAddress, disconnect } = useWallet();

    const features = [
        {
            id: 'protection',
            title: 'Real-Time Protection',
            description: 'Monitor your transactions for threats in real-time',
            icon: <Shield className="w-6 h-6" />,
            status: 'Active',
            statusColor: 'text-green-400',
        },
        {
            id: 'activity',
            title: 'Transaction History',
            description: 'View your protected transaction history',
            icon: <Activity className="w-6 h-6" />,
            status: 'Available',
            statusColor: 'text-blue-400',
        },
        {
            id: 'intelligence',
            title: 'Threat Intelligence',
            description: 'Access decentralized threat database',
            icon: <Database className="w-6 h-6" />,
            status: 'Connected',
            statusColor: 'text-purple-400',
        },
        {
            id: 'settings',
            title: 'Security Settings',
            description: 'Customize your protection preferences',
            icon: <Settings className="w-6 h-6" />,
            status: 'Configure',
            statusColor: 'text-gray-400',
        },
    ];

    if (!activeAddress) {
        return null;
    }

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            AO Shield Dashboard
                        </h1>
                        <p className="text-gray-400">
                            Connected: {shortAddress}
                        </p>
                    </div>
                    <button
                        onClick={disconnect}
                        className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30 hover:border-red-500/50"
                    >
                        Disconnect
                    </button>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-semibold">
                            Protection Active
                        </span>
                    </div>
                    <p className="text-gray-300 text-sm">
                        Your wallet is now protected by AO Shield's AI-powered
                        security system.
                    </p>
                </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-4 sm:grid-cols-2 mb-8"
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 bg-white/10 rounded-lg text-white">
                                {feature.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {feature.description}
                                </p>
                            </div>
                            <span
                                className={`text-sm font-medium ${feature.statusColor}`}
                            >
                                {feature.status}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
            >
                <h2 className="text-lg font-semibold text-white mb-4">
                    Quick Actions
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                    <button className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg text-left transition-colors group">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">
                                    View Extension
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Open AO Shield browser extension
                                </p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        </div>
                    </button>

                    <button className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg text-left transition-colors group">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">
                                    Check Threats
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Review recent threat detections
                                </p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default WalletDashboard;
