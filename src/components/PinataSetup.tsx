
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Key } from "lucide-react";

export const PinataSetup = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const { toast } = useToast();

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
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Pinata API Setup
        </CardTitle>
        <CardDescription>
          Enter your Pinata API credentials to enable file storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="w-full">
          Save Credentials
        </Button>
      </CardFooter>
    </Card>
  );
};

