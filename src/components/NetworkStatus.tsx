
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
      <div className="professional-card rounded-xl p-6 card-hover">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mr-4">
            <Info className="text-primary h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Connect your Ethereum wallet to access decentralized storage features and manage your files securely on the blockchain
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 card-hover">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mr-4">
            <Info className="text-amber-600 dark:text-amber-400 h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">Wrong Network</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Connected to <span className="font-semibold text-amber-600 dark:text-amber-400">{connectedNetwork}</span> but this app requires Hardhat or Localhost network for development.
            </p>
            <button 
              onClick={handleSwitchNetwork}
              className="mt-4 px-4 py-2 text-sm bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-lg transition-all duration-300 card-hover font-medium"
            >
              Switch Network
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6 card-hover">
      <div className="flex items-start">
        <div className="relative mr-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-green-500/30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">Connected to Network</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            You're connected to <span className="font-semibold text-green-600 dark:text-green-400">{connectedNetwork}</span> network and ready to use decentralized storage features.
          </p>
          <div className="flex items-center mt-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Ready for blockchain operations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
