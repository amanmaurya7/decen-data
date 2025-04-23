
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Navigation } from "./Navigation";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onConnect: () => void;
  isConnected: boolean;
  accountAddress: string;
  networkName: string;
  onDisconnect?: () => void;
}

const Header = ({ onConnect, isConnected, accountAddress, networkName, onDisconnect }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully",
      });
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-blockchain-darkBlue/95 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 relative mr-3">
            <div className="absolute inset-0 bg-gradient-to-br from-blockchain-purple to-blockchain-teal rounded-full opacity-80 rotate-animation"></div>
            <div className="absolute inset-1 bg-blockchain-darkBlue rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-blockchain-purple rounded-full"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blockchain-purple to-blockchain-teal bg-clip-text text-transparent">
            DecenData
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Navigation showPinataSetup={isConnected} />
          
          {isConnected ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-blockchain-darkBlue border border-blockchain-purple/30 rounded-full pl-3 pr-4 py-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                <div className="flex flex-col">
                  <p className="text-xs text-gray-400">{networkName}</p>
                  <p className="text-sm text-gray-200">{`${accountAddress.slice(0, 5)}...${accountAddress.slice(-4)}`}</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDisconnect}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={onConnect}
              className="glow-effect bg-gradient-to-r from-blockchain-purple to-blockchain-darkPurple border-0 hover:opacity-90"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
