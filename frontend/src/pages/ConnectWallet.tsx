import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import WalletDashboard from '../components/WalletDashboard';

interface ConnectWalletProps {
    onConnect: () => void;
}

const ConnectWallet = ({ onConnect }: ConnectWalletProps) => {
    const {
        connected,
        isConnecting,
        activeAddress,
        connectionError,
        connect,
        disconnect,
        shortAddress,
    } = useWallet();

    // Call onConnect when wallet is successfully connected
    useEffect(() => {
        if (connected && activeAddress) {
            onConnect();
        }
    }, [connected, activeAddress, onConnect]);

    // If wallet is connected, show the dashboard
    if (connected && activeAddress) {
        return <WalletDashboard />;
    }
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center overflow-y-auto custom-scrollbar">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8 w-full max-w-sm"
            >
                {/* AO Shield Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-6"
                >
                    <img
                        src="/assets/images/aoshieldlanding.svg"
                        alt="AO Shield"
                        className="w-32 h-32 mx-auto mb-4"
                    />
                </motion.div>

                {connected && activeAddress ? (
                    // Connected State
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="p-3 bg-green-500/20 rounded-full">
                                    <svg
                                        className="w-8 h-8 text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold text-white">
                                Wallet Connected!
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Connected to: {shortAddress}
                            </p>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                Your wallet is now connected to AO Shield. You
                                can start using our AI-powered security
                                features.
                            </p>
                        </div>

                        <motion.button
                            onClick={disconnect}
                            className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-600/30"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Disconnect Wallet
                        </motion.button>
                    </motion.div>
                ) : (
                    // Connection State
                    <>
                        {/* Title and Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="space-y-4 mb-8"
                        >
                            <p className="text-gray-400 leading-relaxed max-w-xs mx-auto font-inter text-21">
                                Welcome to AO Shield your AI-Powered Security
                                Extension.
                            </p>
                        </motion.div>

                        {/* Connect Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                        >
                            <motion.button
                                onClick={connect}
                                disabled={isConnecting}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
                                whileHover={
                                    !isConnecting ? { scale: 1.02 } : {}
                                }
                                whileTap={!isConnecting ? { scale: 0.98 } : {}}
                            >
                                {isConnecting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                        Connect Arweave Wallet
                                    </>
                                )}
                            </motion.button>
                        </motion.div>

                        {/* Error Message */}
                        {connectionError && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                            >
                                {connectionError}
                            </motion.div>
                        )}

                        {/* Supported Wallets Info */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="text-xs text-gray-500 text-center pt-4 border-t border-white/5"
                        >
                            <p className="mb-2">Supported wallets:</p>
                            <div className="flex justify-center gap-4 text-gray-400">
                                <span>ArConnect</span>
                                <span>•</span>
                                <span>Othent</span>
                                <span>•</span>
                                <span>Arweave.app</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ConnectWallet;
