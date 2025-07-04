import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Key, Settings, Shield, Zap, BarChart3, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Layout } from '@/components/Layout';
import { useWallet } from '@/hooks/useWallet';
import { 
  setPerplexityApiKey, 
  getPerplexityApiKey, 
  isPerplexityConfigured 
} from '@/utils/aiAnalysisUtils';

export const AISettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    isConnected,
    accountAddress,
    networkName,
    handleConnectWallet,
    handleDisconnectWallet
  } = useWallet();

  useEffect(() => {
    const currentKey = getPerplexityApiKey();
    if (currentKey) {
      setApiKey(currentKey);
    }
    setIsConfigured(isPerplexityConfigured());
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid Perplexity API key",
        variant: "destructive"
      });
      return;
    }

    try {
      setPerplexityApiKey(apiKey.trim());
      setIsConfigured(true);
      toast({
        title: "API Key Saved",
        description: "Perplexity AI features are now enabled",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save API key",
        variant: "destructive"
      });
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('perplexity_api_key');
    setApiKey('');
    setIsConfigured(false);
    toast({
      title: "API Key Cleared",
      description: "AI features have been disabled",
      variant: "default"
    });
  };

  return (
    <Layout 
      isConnected={isConnected}
      accountAddress={accountAddress}
      networkName={networkName}
      onConnect={handleConnectWallet}
      onDisconnect={handleDisconnectWallet}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure AI features and manage your Perplexity API integration
              </p>
            </div>
          </div>
          <Badge 
            variant={isConfigured ? "default" : "secondary"}
            className={isConfigured 
              ? "bg-green-500/20 text-green-700 border-green-500/30" 
              : "bg-amber-500/20 text-amber-700 border-amber-500/30"
            }
          >
            {isConfigured ? "AI Enabled" : "Setup Required"}
          </Badge>
        </div>

        <div className="space-y-6">
      <Card className="professional-card">
        <CardHeader className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 border-b border-border/50">
          <CardTitle className="text-foreground flex items-center text-xl">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
              <Brain className="h-4 w-4 text-white" />
            </div>
            AI Configuration
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure Perplexity AI to enable intelligent file analysis and insights
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-primary" />
              <span className="font-medium">API Status:</span>
            </div>
            <Badge 
              variant={isConfigured ? "default" : "destructive"}
              className={isConfigured ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {isConfigured ? "Configured" : "Not Configured"}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-sm font-medium">
                Perplexity API Key
              </Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  placeholder="pplx-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="professional-input flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowKey(!showKey)}
                  className="px-3"
                >
                  {showKey ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from{" "}
                <a 
                  href="https://www.perplexity.ai/settings/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Perplexity Settings
                </a>
              </p>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="professional-button"
              >
                Save API Key
              </Button>
              {isConfigured && (
                <Button 
                  variant="outline"
                  onClick={handleClearApiKey}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Clear Key
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            AI Features
          </CardTitle>
          <CardDescription>
            Available AI-powered capabilities for your files
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Content Analysis</h4>
                    <p className="text-sm text-blue-700">
                      Automatic summarization, categorization, and tagging of uploaded files
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <Settings className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Smart Organization</h4>
                    <p className="text-sm text-green-700">
                      AI-powered file organization and duplicate detection
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Risk Assessment</h4>
                    <p className="text-sm text-red-700">
                      Analyze security risks before sharing files
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Key className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">Access Control</h4>
                    <p className="text-sm text-orange-700">
                      Smart recommendations for file sharing permissions
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="search" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Natural Language Search</h4>
                    <p className="text-sm text-purple-700">
                      Find files using natural language queries like "documents from last month"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
                  <Settings className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-indigo-900">Content-Based Search</h4>
                    <p className="text-sm text-indigo-700">
                      Search by file content, not just filename
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-cyan-50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-cyan-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-cyan-900">Usage Analytics</h4>
                    <p className="text-sm text-cyan-700">
                      Comprehensive reports on storage patterns and optimization opportunities
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-teal-50 rounded-lg">
                  <Zap className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-teal-900">Cost Optimization</h4>
                    <p className="text-sm text-teal-700">
                      AI recommendations for reducing IPFS and blockchain costs
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
        </div>
      </div>
    </Layout>
  );
};