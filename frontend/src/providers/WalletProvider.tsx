import { ArweaveWalletKit } from "@arweave-wallet-kit/react";
import WanderStrategy from "@arweave-wallet-kit/wander-strategy";
import OthentStrategy from "@arweave-wallet-kit/othent-strategy";
import BrowserWalletStrategy from "@arweave-wallet-kit/browser-wallet-strategy";
import WebWalletStrategy from "@arweave-wallet-kit/webwallet-strategy";
import { config } from "../config/index";

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <ArweaveWalletKit
      config={{
        permissions: [
          "ACCESS_ADDRESS",
          "ACCESS_PUBLIC_KEY",
          "SIGN_TRANSACTION",
          "DISPATCH",
        ],
        ensurePermissions: true,
        strategies: [
          new WanderStrategy(),
          new OthentStrategy(),
          new BrowserWalletStrategy(),
          new WebWalletStrategy(),
        ],
        appInfo: {
          name: config.appName,
          logo: config.appLogo,
        },
        // gatewayConfig: {
        //   host: "arweave.net",
        //   port: 443,
        //   protocol: "https",
        // },
      }}
    >
      {children}
    </ArweaveWalletKit>
  );
};