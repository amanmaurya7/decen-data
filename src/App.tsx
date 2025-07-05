
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import { useAuth } from '@/hooks/useApi';
import AuthCard from '@/components/AuthCard';
import FileDashboard from '@/components/FileDashboard';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PinataSetup } from "./components/PinataSetup";
import { AISettings } from "./components/AISettings";
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading DecenData...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user ? <FileDashboard /> : (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <AuthCard />
            </div>
          )
        } 
      />
      <Route 
        path="/legacy" 
        element={<Index />} 
      />
      <Route path="/setup" element={<PinataSetup />} />
      <Route path="/ai-settings" element={<AISettings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  useEffect(() => {
    // Force light mode by removing dark class and adding light styling
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '#f8fafc';
    document.documentElement.style.color = '#111827';
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#111827';
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
