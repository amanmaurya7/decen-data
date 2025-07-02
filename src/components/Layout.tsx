
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      
      {/* Floating elements for visual appeal */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl floating-animation"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-xl floating-animation" style={{animationDelay: '3s'}}></div>
      
      <Header 
        onConnect={onConnect}
        isConnected={isConnected}
        accountAddress={accountAddress}
        networkName={networkName}
        onDisconnect={onDisconnect}
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative z-10">
        <div className="animate-fadeInUp">
          {children}
        </div>
      </main>
      
      <footer className="w-full py-12 px-4 border-t border-border/50 glass-morphism relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold text-lg text-foreground">DecenData</p>
                <p className="text-sm text-muted-foreground">Decentralized File Storage Platform</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                Developed by{' '}
                <a 
                  href="https://www.amanengineer.me/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
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
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                GitHub
              </a>
              <a 
                href="https://www.linkedin.com/in/amanmaurya-me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                LinkedIn
              </a>
              <a 
                href="https://www.amanengineer.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                Website
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 DecenData. Built with modern web technologies for secure, decentralized file storage.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
