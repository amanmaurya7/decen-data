
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
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'glass-morphism professional-shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 relative mr-4 floating-animation">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl opacity-90 rotate-animation shadow-lg"></div>
            <div className="absolute inset-1 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full pulse-glow"></div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              DecenData
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Decentralized File Storage</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Navigation showPinataSetup={isConnected} />
          
          {isConnected ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center professional-card rounded-full pl-4 pr-5 py-2.5 card-hover">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mr-3 animate-pulse shadow-lg"></div>
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground font-medium">{networkName}</p>
                  <p className="text-sm text-foreground font-mono">{`${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}`}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 shadow-sm card-hover"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={onConnect}
              className="professional-button px-6 py-2 font-semibold shadow-lg card-hover"
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
