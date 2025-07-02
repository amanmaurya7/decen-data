
import React from 'react';
import Header from '@/components/Header';

interface LayoutProps {
  children: React.ReactNode;
  isConnected: boolean;
  accountAddress: string;
  networkName: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Layout = ({ 
  children, 
  isConnected, 
  accountAddress, 
  networkName,
  onConnect,
  onDisconnect
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blockchain-darkBlue via-slate-900 to-blockchain-darkBlue flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blockchain-purple/10 via-transparent to-blockchain-teal/5"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      
      <Header 
        onConnect={onConnect}
        isConnected={isConnected}
        accountAddress={accountAddress}
        networkName={networkName}
        onDisconnect={onDisconnect}
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 flex flex-col gap-8 relative z-10">
        {children}
      </main>
      
      <footer className="w-full py-8 px-4 border-t border-blockchain-purple/20 glass-effect relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blockchain-purple to-blockchain-teal flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-gray-300 font-medium">DecenData</p>
                <p className="text-xs text-gray-500">Decentralized File Storage Platform</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Developed by{' '}
                <a 
                  href="https://www.amanengineer.me/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blockchain-purple hover:text-blockchain-teal transition-colors font-medium"
                >
                  Aman Maurya
                </a>
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a 
                href="https://github.com/amanmaurya7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blockchain-purple transition-colors text-sm font-medium"
              >
                GitHub
              </a>
              <a 
                href="https://www.linkedin.com/in/amanmaurya-me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blockchain-teal transition-colors text-sm font-medium"
              >
                LinkedIn
              </a>
              <a 
                href="https://www.amanengineer.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blockchain-purple transition-colors text-sm font-medium"
              >
                Website
              </a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-blockchain-purple/10 text-center">
            <p className="text-xs text-gray-500">
              © 2024 DecenData. Built with blockchain technology for secure, decentralized file storage.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
