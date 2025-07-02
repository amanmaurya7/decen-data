import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { savePinataCredentials } from "@/utils/ipfsUtils";

export const PinataSetup = () => {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [gateway, setGateway] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('PINATA_API_KEY');
    const savedApiSecret = localStorage.getItem('PINATA_API_SECRET');
    const savedGateway = localStorage.getItem('PINATA_GATEWAY');
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedApiSecret) setApiSecret(savedApiSecret);
    if (savedGateway) setGateway(savedGateway);
  }, []);

  const handleSave = () => {
    if (!apiKey || !apiSecret || !gateway) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      savePinataCredentials(apiKey, apiSecret, gateway);
      toast({
        title: "Success",
        description: "Pinata credentials saved successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="gradient-border glass-effect card-hover">
        <CardHeader className="bg-gradient-to-r from-blockchain-purple/10 via-blockchain-darkPurple/10 to-blockchain-teal/10 border-b border-blockchain-purple/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blockchain-purple/20 to-blockchain-teal/20 flex items-center justify-center">
              <Key className="h-6 w-6 text-blockchain-purple" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Pinata API Setup
              </CardTitle>
              <CardDescription className="text-gray-300 mt-1">
                Enter your Pinata API credentials to enable secure IPFS file storage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <Alert className="gradient-border glass-effect">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-3">
              <Key className="h-4 w-4 text-blue-400" />
            </div>
            <AlertDescription className="text-gray-300">
              <h3 className="font-semibold mb-3 text-white">How to get your Pinata API Keys:</h3>
              <ol className="list-decimal ml-4 space-y-3 text-sm leading-relaxed">
                <li>
                  Go to{' '}
                  <a 
                    href="https://app.pinata.cloud/developers/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blockchain-purple hover:text-blockchain-teal transition-colors font-medium underline"
                  >
                    Pinata API Keys page
                  </a>
                </li>
                <li>Click on "New Key" button</li>
                <li>Give your key a name (e.g., "DecenData App")</li>
                <li>
                  Enable the following Admin permissions:
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li className="text-blockchain-teal">pinFileToIPFS</li>
                    <li className="text-blockchain-teal">unpin</li>
                  </ul>
                </li>
                <li>Click "Create Key" to generate your API credentials</li>
                <li>Copy both the API Key and API Secret to the fields below</li>
              </ol>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="apiKey" className="text-sm font-semibold text-gray-300 flex items-center">
                <div className="w-4 h-4 rounded bg-blockchain-purple/20 flex items-center justify-center mr-2">
                  <Key className="h-2 w-2 text-blockchain-purple" />
                </div>
                API Key
              </label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Pinata API key"
                className="glass-effect border-blockchain-purple/30 text-white placeholder:text-gray-500 focus:border-blockchain-purple card-hover"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="apiSecret" className="text-sm font-semibold text-gray-300 flex items-center">
                <div className="w-4 h-4 rounded bg-blockchain-purple/20 flex items-center justify-center mr-2">
                  <Key className="h-2 w-2 text-blockchain-purple" />
                </div>
                API Secret
              </label>
              <Input
                id="apiSecret"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your Pinata API secret"
                className="glass-effect border-blockchain-purple/30 text-white placeholder:text-gray-500 focus:border-blockchain-purple card-hover"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="gateway" className="text-sm font-semibold text-gray-300 flex items-center">
                <div className="w-4 h-4 rounded bg-blockchain-teal/20 flex items-center justify-center mr-2">
                  <Key className="h-2 w-2 text-blockchain-teal" />
                </div>
                Gateway
              </label>
              <Input
                id="gateway"
                type="text"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                placeholder="e.g., https://gateway.pinata.cloud"
                className="glass-effect border-blockchain-teal/30 text-white placeholder:text-gray-500 focus:border-blockchain-teal card-hover"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="glass-effect border-t border-blockchain-purple/20 p-6">
          <div className="flex w-full gap-4">
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-gradient-to-r from-blockchain-purple to-blockchain-darkPurple hover:from-blockchain-darkPurple hover:to-blockchain-purple card-hover shadow-lg"
            >
              <Key className="mr-2 h-4 w-4" />
              Save Credentials
            </Button>
            {window.location.pathname === '/pinata-setup' && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="flex-1 glass-effect border-blockchain-teal/30 text-blockchain-teal hover:bg-blockchain-teal/10 card-hover"
              >
                Back to Home
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
