import React from 'react';
import { ArrowLeft, Shield, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton, onBack }) => {
  const handleOpenFullView = () => {
    try {
      // Try to open as browser extension
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        window.open(chrome.runtime.getURL("index.html"), "_blank", "width=900,height=700");
      } else {
        // Fallback for development
        console.log("Open full view");
        window.open(window.location.href, "_blank", "width=900,height=700");
      }
    } catch (error) {
      console.log("Open full view");
    }
  };

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
              src="/src/assets/images/aologo.svg" 
              alt="AO Shield" 
              className="w-6 h-6"
            />
            <span className="text-lg font-semibold">AO Shield</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
            Protected
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenFullView}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
          title="Open Full View"
        >
          <ExternalLink size={16} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
        </motion.button>
      </div>
    </div>
  );
};

export default Header;