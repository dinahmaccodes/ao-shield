import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Wallet,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface WalletConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
    isOpen,
    onClose,
}) => {
    const {
        connected,
        isConnecting,
        connectionError,
        connect,
        disconnect,
        shortAddress,
    } = useWallet();

    const handleConnect = async () => {
        const success = await connect();
        if (success) {
            // Close modal after successful connection with a delay
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    const handleDisconnect = async () => {
        await disconnect();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative z-10 w-full max-w-md mx-4 p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">
                            {connected ? 'Wallet Connected' : 'Connect Wallet'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {connected ? (
                            // Connected State
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-4"
                            >
                                <div className="flex justify-center">
                                    <div className="p-4 bg-green-500/20 rounded-full">
                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                    </div>
                                </div>
                                <p className="text-gray-300">
                                    Your wallet is successfully connected to AO
                                    Shield
                                </p>
                                {shortAddress && (
                                    <p className="text-gray-400 text-sm">
                                        Address: {shortAddress}
                                    </p>
                                )}
                                <button
                                    onClick={handleDisconnect}
                                    className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-600/30"
                                >
                                    Disconnect Wallet
                                </button>
                            </motion.div>
                        ) : (
                            // Connection State
                            <div className="space-y-4">
                                {/* AO Shield Logo */}
                                <div className="flex justify-center mb-6">
                                    <img
                                        src="/Shield.svg"
                                        alt="AO Shield"
                                        className="w-16 h-16"
                                    />
                                </div>

                                <div className="text-center mb-6">
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Connect your Arweave wallet to start
                                        using AO Shield's AI-powered security
                                        features
                                    </p>
                                </div>

                                {/* Connect Button */}
                                <button
                                    onClick={handleConnect}
                                    disabled={isConnecting}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
                                >
                                    {isConnecting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="w-5 h-5" />
                                            Connect Arweave Wallet
                                        </>
                                    )}
                                </button>

                                {/* Error Message */}
                                {connectionError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {connectionError}
                                    </motion.div>
                                )}

                                {/* Supported Wallets Info */}
                                <div className="text-xs text-gray-500 text-center pt-4 border-t border-white/5">
                                    <p className="mb-2">Supported wallets:</p>
                                    <div className="flex justify-center gap-4 text-gray-400">
                                        <span>ArConnect</span>
                                        <span>•</span>
                                        <span>Othent</span>
                                        <span>•</span>
                                        <span>Arweave.app</span>
                                    </div>
                                </div>

                                {/* Learn More Link */}
                                <div className="text-center pt-2">
                                    <a
                                        href="https://docs.arweave.org/developers/wallets"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                                    >
                                        Don't have a wallet? Learn more
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WalletConnectionModal;
