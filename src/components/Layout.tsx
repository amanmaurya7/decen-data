
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
    </div>
  );
};
