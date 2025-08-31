import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/NavBar";
import Header from "./components/Header";
import ConnectWallet from "./pages/ConnectWallet";
import Alerts from "./pages/Alerts";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [activePage, setActivePage] = useState("alerts");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleConnectWallet = () => {
    setIsWalletConnected(true);
    setActivePage("alerts");
  };

  const renderPage = () => {
    if (!isWalletConnected) {
      return <ConnectWallet onConnect={handleConnectWallet} />;
    }

    if (selectedAlert) {
      return (
        <Dashboard
          alert={selectedAlert}
          onBack={() => setSelectedAlert(null)}
        />
      );
    }

    switch (activePage) {
      case "alerts":
        return <Alerts onViewDashboard={setSelectedAlert} />;
      case "history":
        return <History />;
      case "settings":
        return <Settings />;
      default:
        return <Alerts onViewDashboard={setSelectedAlert} />;
    }
  };

  return (
    <div className="w-[380px] h-[500px] bg-[#0A0A0A] text-white flex flex-col font-sans overflow-hidden">
      {isWalletConnected && (
        <Header
          showBackButton={!!selectedAlert}
          onBack={() => setSelectedAlert(null)}
        />
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={
              !isWalletConnected
                ? "connect"
                : selectedAlert
                ? "dashboard"
                : activePage
            }
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {isWalletConnected && !selectedAlert && (
        <Navbar activePage={activePage} setActivePage={setActivePage} />
      )}
    </div>
  );
}

export default App;
