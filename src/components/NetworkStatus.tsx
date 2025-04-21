
import { Info, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NetworkStatusProps {
  isConnected: boolean;
  connectedNetwork: string | null;
  isCorrectNetwork: boolean;
  onSwitchNetwork: () => Promise<void>;
}

const NetworkStatus = ({ 
  isConnected, 
  connectedNetwork, 
  isCorrectNetwork,
  onSwitchNetwork 
}: NetworkStatusProps) => {
  const toast = useToast();
  
  const handleSwitchNetwork = async () => {
    try {
      await onSwitchNetwork();
    } catch (error) {
      toast.toast({
        title: "Network Switch Failed",
        description: "Unable to switch network. Please try manually in your wallet.",
        variant: "destructive"
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-blockchain-darkBlue/50 border border-blockchain-purple/10 rounded-md p-4">
        <div className="flex items-start">
          <Info className="text-blockchain-purple mr-3 h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-medium text-white">Connect Your Wallet</h3>
            <p className="text-sm text-gray-400 mt-1">
              Connect your Ethereum wallet to access decentralized storage features
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-md p-4">
        <div className="flex items-start">
          <Info className="text-yellow-500 mr-3 h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-medium text-white">Wrong Network</h3>
            <p className="text-sm text-gray-300 mt-1">
              Connected to <span className="font-medium">{connectedNetwork}</span> but this app requires Hardhat or Localhost network.
            </p>
            <button 
              onClick={handleSwitchNetwork}
              className="mt-2 px-3 py-1 text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-md transition-colors"
            >
              Switch Network
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-900/10 border border-green-700/30 rounded-md p-4">
      <div className="flex items-start">
        <div className="relative mr-3 mt-0.5">
          <div className="h-5 w-5 rounded-full border-2 border-green-500/30"></div>
          <div className="absolute inset-1 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-white">Connected to Network</h3>
          <p className="text-sm text-gray-300 mt-1">
            You're connected to <span className="font-medium text-green-400">{connectedNetwork}</span> network and ready to use decentralized storage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
