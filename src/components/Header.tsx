
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
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'glass-effect shadow-2xl' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 relative mr-4 floating-animation">
            <div className="absolute inset-0 bg-gradient-to-br from-blockchain-purple to-blockchain-teal rounded-full opacity-90 rotate-animation"></div>
            <div className="absolute inset-1 bg-blockchain-darkBlue rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-blockchain-purple to-blockchain-teal rounded-full pulse-glow"></div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blockchain-purple via-white to-blockchain-teal bg-clip-text text-transparent">
              DecenData
            </h1>
            <p className="text-xs text-gray-400 mt-1">Decentralized File Storage</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Navigation showPinataSetup={isConnected} />
          
          {isConnected ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center glass-effect rounded-full pl-4 pr-5 py-2.5 card-hover">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mr-3 animate-pulse shadow-lg"></div>
                <div className="flex flex-col">
                  <p className="text-xs text-gray-400 font-medium">{networkName}</p>
                  <p className="text-sm text-white font-mono">{`${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}`}</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDisconnect}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 shadow-lg card-hover"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={onConnect}
              className="glow-effect bg-gradient-to-r from-blockchain-purple via-blockchain-darkPurple to-blockchain-teal border-0 hover:opacity-90 px-6 py-2 text-white font-semibold shadow-xl card-hover"
            >
              <span className="relative z-10">Connect Wallet</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
