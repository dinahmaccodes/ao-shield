import React from 'react';
import { useConnection, useActiveAddress } from '@arweave-wallet-kit/react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface WalletStatusProps {
    className?: string;
}

const WalletStatus: React.FC<WalletStatusProps> = ({ className = '' }) => {
    const { connected, disconnect } = useConnection();
    const activeAddress = useActiveAddress();
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = async () => {
        if (activeAddress) {
            try {
                await navigator.clipboard.writeText(activeAddress);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Failed to copy address:', error);
            }
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (!connected || !activeAddress) {
        return null;
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg border border-green-500/30">
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">
                    {formatAddress(activeAddress)}
                </span>
                <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-green-500/20 rounded transition-colors"
                    title="Copy address"
                >
                    {copied ? (
                        <Check className="w-3 h-3" />
                    ) : (
                        <Copy className="w-3 h-3" />
                    )}
                </button>
            </div>

            <button
                onClick={disconnect}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg border border-transparent hover:border-red-500/30 transition-colors"
                title="Disconnect wallet"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
    );
};

export default WalletStatus;
