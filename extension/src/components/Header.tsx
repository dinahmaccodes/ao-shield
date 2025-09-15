import React from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton, onBack }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0A] relative z-10">
      <div className="flex items-center gap-3">
        {showBackButton ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
        ) : (
          <div className="flex items-center gap-2">
            <img
              src="/assets/images/aologo.svg"
              alt="Shield"
              className="w-6 h-6"
            />
            <span className="text-lg font-semibold">Shield</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse bg-green-400"></div>
          <span className="text-xs px-2 py-1 rounded-full text-gray-400 bg-gray-800">
            Protected
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
