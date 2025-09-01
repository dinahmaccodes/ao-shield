import React from "react";
import { motion } from "framer-motion";

interface ConnectWalletProps {
  onConnect: () => void;
}

const ConnectWallet = ({ onConnect }: ConnectWalletProps) => {
  const features = [
    {
      id: "shield",
      title: "Real-time Protection",
      description: "Monitor transactions in real-time",
    },
    {
      id: "lock",
      title: "Secure Transactions",
      description: "Advanced fraud detection",
    },
    {
      id: "monitor",
      title: "Blockchain Monitor",
      description: "Track wallet activity",
    },
    {
      id: "analytics",
      title: "Risk Analytics",
      description: "AI-powered threat analysis",
    },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-start p-6 pt-8 text-center overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6 w-full max-w-sm"
      >
        {/* AO Shield Landing Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <img
            src="/assets/images/aoshieldlanding.svg"
            alt="AO Shield Landing"
            className="w-24 h-24 mx-auto mb-4"
          />
        </motion.div>

        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-lg font-semibold leading-tight">
            Secure your browsing with AO Shield
          </h1>
          <p className="text-gray-400 text-xs leading-relaxed">
            Advanced protection for your crypto transactions and wallet
            interactions
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="grid grid-cols-2 gap-2 w-full max-w-xs mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
              whileHover={{
                scale: 1.05,
                rotate: 5,
                transition: { duration: 0.2 },
              }}
              className="bg-[#111] border border-white/10 rounded-lg p-2 hover:border-cyan-400/30 transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:bg-cyan-500/30 transition-colors">
                <div className="w-3 h-3 bg-cyan-400 rounded-sm"></div>
              </div>
              <h3 className="text-xs font-medium mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-tight">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Connect Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConnect}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/25"
        >
          Connect Wallet
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="text-xs text-gray-500 mt-2"
        >
          Your wallet stays secure. We never store your private keys.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ConnectWallet;
