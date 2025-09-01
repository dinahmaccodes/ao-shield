import React from "react";
import { motion } from "framer-motion";
import { useConnection } from "@arweave-wallet-kit/react";

interface ConnectWalletProps {
  onConnect: () => void;
}

const ConnectWallet = ({ onConnect }: ConnectWalletProps) => {
  const { connect, connected } = useConnection();

  const handleConnect = async () => {
    try {
      await connect();
      if (connected) {
        onConnect();
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };
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
          {/* <h1 className="text-2xl font-semibold text-white">Shield</h1> */}
        </motion.div>

        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4 mb-8"
        >
          <p className="text-gray-400 leading-relaxed max-w-xs mx-auto font-inter text-21">
            Welcome to AO Shield your AI-Powered Security Extension.
          </p>
        </motion.div>

        {/* Connect Wallet SVG Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="cursor-pointer"
          onClick={handleConnect}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src="/assets/images/connectwallet.svg"
            alt="Connect Wallet"
            className="mx-auto hover:opacity-90 transition-opacity"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ConnectWallet;
