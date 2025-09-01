import React from "react";
import { Bell, Clock, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: "alerts", icon: Bell, label: "Alerts" },
    { id: "history", icon: Clock, label: "History" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="border-t border-white/5 bg-[#0A0A0A] p-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              isActive
                ? "text-gray-500 bg-white/10"
                : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              <span className="text-xs">{item.label}</span>
              {isActive && (
              <motion.div
                layoutId="activeTab"
                className="w-full h-0.5 bg-white rounded-full mt-1"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
