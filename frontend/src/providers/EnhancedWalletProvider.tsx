import React, { useEffect } from 'react';
import { ArweaveWalletKit, useActiveAddress } from '@arweave-wallet-kit/react';
import WanderStrategy from '@arweave-wallet-kit/wander-strategy';
import OthentStrategy from '@arweave-wallet-kit/othent-strategy';
import BrowserWalletStrategy from '@arweave-wallet-kit/browser-wallet-strategy';
import WebWalletStrategy from '@arweave-wallet-kit/webwallet-strategy';
import { config } from '../config/index';
import {
    sendWalletAddressToExtension,
    removeWalletAddressFromExtension,
} from '../utils/extensionCommunication';

interface WalletProviderProps {
    children: React.ReactNode;
}

// Component to handle wallet address changes and communicate with extension
const WalletSync: React.FC = () => {
    const activeAddress = useActiveAddress();

    useEffect(() => {
        const syncAddressWithExtension = async () => {
            try {
                if (activeAddress) {
                    await sendWalletAddressToExtension(activeAddress);
                    console.log(
                        'Wallet address sent to extension:',
                        activeAddress
                    );
                } else {
                    await removeWalletAddressFromExtension();
                    console.log('Wallet address removed from extension');
                }
            } catch (error) {
                console.error(
                    'Failed to sync wallet address with extension:',
                    error
                );
            }
        };

        syncAddressWithExtension();
    }, [activeAddress]);

    return null; // This component doesn't render anything
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
    return (
        <ArweaveWalletKit
            config={{
                permissions: [
                    'ACCESS_ADDRESS',
                    'ACCESS_PUBLIC_KEY',
                    'SIGN_TRANSACTION',
                    'DISPATCH',
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
            <WalletSync />
            {children}
        </ArweaveWalletKit>
    );
};
