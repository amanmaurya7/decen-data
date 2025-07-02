
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PinataSetup } from "./components/PinataSetup";

const queryClient = new QueryClient();

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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pinata-setup" element={<PinataSetup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
