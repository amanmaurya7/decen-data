
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onShare: (address: string) => Promise<void>;
  onRevoke: (address: string) => Promise<void>;
  currentViewers: string[];
  isProcessing: boolean;
}

const ShareModal = ({ 
  open, 
  onClose, 
  onShare, 
  onRevoke, 
  currentViewers, 
  isProcessing 
}: ShareModalProps) => {
  const [address, setAddress] = useState("");
  
  const handleAddViewer = async () => {
    if (!address.trim()) return;
    await onShare(address);
    setAddress("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border border-blockchain-purple/30 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Share Access</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add Ethereum addresses to grant access to this file.
            Users with access can view and download this file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-end gap-2 mt-2">
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-1 block">
              Ethereum Address
            </label>
            <Input
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-blockchain-darkBlue border-blockchain-purple/20 text-white"
            />
          </div>
          <Button 
            className="bg-blockchain-purple hover:bg-blockchain-darkPurple"
            onClick={handleAddViewer}
            disabled={!address || isProcessing}
          >
            Add
          </Button>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Current Viewers</h4>
          {currentViewers.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No viewers added yet</p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
              {currentViewers.map((viewer) => (
                <div 
                  key={viewer} 
                  className="flex items-center justify-between bg-blockchain-darkBlue/50 rounded-md p-2 border border-blockchain-purple/10"
                >
                  <span className="text-sm text-gray-300 truncate max-w-[220px]">
                    {viewer}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRevoke(viewer)}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-400"
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
