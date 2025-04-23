
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
    <div className="min-h-screen bg-blockchain-darkBlue flex flex-col">
      <Header 
        onConnect={onConnect}
        isConnected={isConnected}
        accountAddress={accountAddress}
        networkName={networkName}
        onDisconnect={onDisconnect}
      />
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 flex flex-col gap-8">
        {children}
      </main>
      <footer className="w-full py-6 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">Developed by <a href="https://www.amanengineer.me/" target="_blank" rel="noopener noreferrer" className="text-blockchain-purple hover:text-blockchain-teal transition-colors">Aman Maurya</a></p>
          <div className="flex justify-center space-x-4 mt-2">
            <a 
              href="https://github.com/amanmaurya7" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blockchain-purple transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/amanmaurya-me/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blockchain-purple transition-colors"
            >
              LinkedIn
            </a>
            <a 
              href="https://www.amanengineer.me/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blockchain-purple transition-colors"
            >
              Website
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
