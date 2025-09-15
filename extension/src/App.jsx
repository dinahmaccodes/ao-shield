import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/NavBar";
import Header from "./components/Header";
import ConnectWallet from "./pages/ConnectWallet";
import Alerts from "./pages/Alerts";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
// import { WalletProvider } from "./providers/WalletProvider";
// import { useConnection } from "@arweave-wallet-kit/react";

// Component that uses wallet connection inside the provider
const AppContent = () => {
  // const { connected } = useConnection();
  const [connected, setConnected] = useState(false); // Track connection state
  const [activePage, setActivePage] = useState("alerts");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleConnectWallet = () => {
    // TODO: Implement actual wallet connection logic
    setConnected(true); // For now, just set connected to true
    setActivePage("alerts");
    console.log("Wallet connected - implement actual connection logic");
  };

  const renderPage = () => {
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
      {/* Show connect wallet page as full-screen when not connected */}
      {!connected ? (
        <ConnectWallet onConnect={handleConnectWallet} />
      ) : (
        <>
          {/* Only show header and navbar when connected */}
          <Header
            showBackButton={!!selectedAlert}
            onBack={() => setSelectedAlert(null)}
          />

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAlert ? "dashboard" : activePage}
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

          {/* Only show navbar when connected and not viewing alert details */}
          {!selectedAlert && (
            <Navbar activePage={activePage} setActivePage={setActivePage} />
          )}
        </>
      )}
    </div>
  );
};

function App() {
  return (
    // Temporarily remove WalletProvider wrapper
    <AppContent />
    // <WalletProvider>
    //   <AppContent />
    // </WalletProvider>
  );
}

export default App;
