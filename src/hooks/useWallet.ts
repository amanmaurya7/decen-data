
import { useState, useEffect } from 'react';
import { connectWallet, getNetworkName, isTestNetwork, switchToLocalNetwork } from '@/utils/blockchainUtils';
import { useToast } from "@/hooks/use-toast";

export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [networkName, setNetworkName] = useState('Not Connected');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts && accounts.length > 0) {
            setAccountAddress(accounts[0]);
            setIsConnected(true);
            
            const network = await getNetworkName();
            setNetworkName(network);
            
            const onTestNetwork = await isTestNetwork();
            setIsCorrectNetwork(onTestNetwork);
          }
          
          window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
            if (newAccounts.length === 0) {
              setIsConnected(false);
              setAccountAddress('');
            } else {
              setAccountAddress(newAccounts[0]);
              setIsConnected(true);
            }
          });
          
          window.ethereum.on('chainChanged', async () => {
            const network = await getNetworkName();
            setNetworkName(network);
            
            const onTestNetwork = await isTestNetwork();
            setIsCorrectNetwork(onTestNetwork);
            
            window.location.reload();
          });
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };
    
    checkConnection();
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setAccountAddress(address);
      setIsConnected(true);
      
      const network = await getNetworkName();
      setNetworkName(network);
      
      const onTestNetwork = await isTestNetwork();
      setIsCorrectNetwork(onTestNetwork);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectWallet = () => {
    setIsConnected(false);
    setAccountAddress('');
    setNetworkName('Not Connected');
    setIsCorrectNetwork(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToLocalNetwork();
      
      const network = await getNetworkName();
      setNetworkName(network);
      
      const onTestNetwork = await isTestNetwork();
      setIsCorrectNetwork(onTestNetwork);
      
      toast({
        title: "Network Switched",
        description: `Connected to ${network}`,
      });
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch network",
        variant: "destructive"
      });
    }
  };

  return {
    isConnected,
    accountAddress,
    networkName,
    isCorrectNetwork,
    handleConnectWallet,
    handleDisconnectWallet,
    handleSwitchNetwork
  };
};
