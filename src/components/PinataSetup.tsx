
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PinataSetup = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('PINATA_API_KEY');
    const savedApiSecret = localStorage.getItem('PINATA_API_SECRET');
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedApiSecret) setApiSecret(savedApiSecret);
  }, []);

  const handleSave = () => {
    if (!apiKey || !apiSecret) {
      toast({
        title: "Error",
        description: "Please enter both API key and API secret",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('PINATA_API_KEY', apiKey);
    localStorage.setItem('PINATA_API_SECRET', apiSecret);

    toast({
      title: "Success",
      description: "Pinata credentials saved successfully",
    });

    // To ensure proper state refresh and auto-detection of credentials
    window.location.href = '/';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Pinata API Setup
          </CardTitle>
          <CardDescription>
            Enter your Pinata API credentials to enable file storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <h3 className="font-semibold mb-2">How to get your Pinata API Keys:</h3>
              <ol className="list-decimal ml-4 space-y-2">
                <li>Go to <a href="https://app.pinata.cloud/developers/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Pinata API Keys page</a></li>
                <li>Click on "New Key" button</li>
                <li>Give your key a name (e.g., "DecenData App")</li>
                <li>Enable the following Admin permissions:
                  <ul className="list-disc ml-4 mt-1">
                    <li>pinFileToIPFS</li>
                    <li>unpin</li>
                  </ul>
                </li>
                <li>Click "Create Key" to generate your API credentials</li>
                <li>Copy both the API Key and API Secret to the fields below</li>
              </ol>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Pinata API key"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="apiSecret" className="text-sm font-medium">
                API Secret
              </label>
              <Input
                id="apiSecret"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your Pinata API secret"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full gap-4">
            <Button onClick={handleSave} className="flex-1">
              Save Credentials
            </Button>
            {window.location.pathname === '/pinata-setup' && (
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                Back to Home
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
