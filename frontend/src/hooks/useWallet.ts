import { useConnection, useActiveAddress } from '@arweave-wallet-kit/react';
import { useState, useCallback } from 'react';

export const useWallet = () => {
    const { connect, connected, disconnect } = useConnection();
    const activeAddress = useActiveAddress();
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const handleConnect = useCallback(async () => {
        try {
            setConnectionError(null);
            setIsConnecting(true);
            await connect();
            return true;
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to connect wallet';
            setConnectionError(errorMessage);
            return false;
        } finally {
            setIsConnecting(false);
        }
    }, [connect]);

    const handleDisconnect = useCallback(async () => {
        try {
            setConnectionError(null);
            await disconnect();
            return true;
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to disconnect wallet';
            setConnectionError(errorMessage);
            return false;
        }
    }, [disconnect]);

    const formatAddress = useCallback((address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }, []);

    const clearError = useCallback(() => {
        setConnectionError(null);
    }, []);

    return {
        // Connection state
        connected,
        isConnecting,
        activeAddress,
        connectionError,

        // Actions
        connect: handleConnect,
        disconnect: handleDisconnect,
        clearError,

        // Utilities
        formatAddress,
        shortAddress: activeAddress ? formatAddress(activeAddress) : null,
    };
};
