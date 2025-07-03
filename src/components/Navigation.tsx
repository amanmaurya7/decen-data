import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Settings, Brain, Sparkles } from "lucide-react";
import { isPerplexityConfigured } from '@/utils/aiAnalysisUtils';
import { useState, useEffect } from 'react';

interface NavigationProps {
  showPinataSetup?: boolean;
  showAISettings?: boolean;
}

export const Navigation = ({ showPinataSetup, showAISettings }: NavigationProps) => {
  const [isAIConfigured, setIsAIConfigured] = useState(false);

  useEffect(() => {
    setIsAIConfigured(isPerplexityConfigured());
  }, []);

  if (!showPinataSetup && !showAISettings) return null;

  return (
    <div className="flex items-center space-x-3">
      {showPinataSetup && (
        <Button variant="ghost" asChild className="mr-4 card-hover glass-effect border border-blockchain-purple/20">
          <Link to="/pinata-setup" className="flex items-center gap-2 px-4 py-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blockchain-purple/20 to-blockchain-teal/20 flex items-center justify-center">
              <Key className="h-3 w-3 text-blockchain-purple" />
            </div>
            <span className="font-medium">Pinata Settings</span>
          </Link>
        </Button>
      )}
      
      {showAISettings && (
        <Button variant="ghost" asChild className="card-hover glass-effect border border-purple-500/20 relative">
          <Link to="/ai-settings" className="flex items-center gap-2 px-4 py-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Brain className="h-3 w-3 text-purple-600" />
            </div>
            <span className="font-medium">AI Features</span>
            <Badge 
              variant={isAIConfigured ? "default" : "secondary"}
              className={`text-xs ${isAIConfigured 
                ? "bg-green-500/20 text-green-700 border-green-500/30" 
                : "bg-amber-500/20 text-amber-700 border-amber-500/30"
              }`}
            >
              {isAIConfigured ? (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                "Setup"
              )}
            </Badge>
          </Link>
        </Button>
      )}
    </div>
  );
};
