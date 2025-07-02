
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X, Eye } from "lucide-react";

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
      <DialogContent className="professional-card text-foreground sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Share Access</DialogTitle>
          <DialogDescription className="text-muted-foreground leading-relaxed">
            Add Ethereum addresses to grant access to this file. Users with access can view and download this file securely.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-end gap-3 mt-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Ethereum Address
            </label>
            <Input
              placeholder="0x742d35Cc6eC34567890abcde..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="professional-input"
            />
          </div>
          <Button 
            className="professional-button card-hover px-6"
            onClick={handleAddViewer}
            disabled={!address || isProcessing}
          >
            Add
          </Button>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
            <Eye className="h-4 w-4 mr-2 text-blue-600" />
            Current Viewers
          </h4>
          {currentViewers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center mb-3">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No viewers added yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Add Ethereum addresses to share access</p>
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
              {currentViewers.map((viewer, index) => (
                <div 
                  key={viewer} 
                  className="flex items-center justify-between professional-card rounded-lg p-3 card-hover group"
                >
                  <div className="flex items-center flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-primary/20 flex items-center justify-center mr-3">
                      <span className="text-xs font-mono text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm text-foreground truncate max-w-[200px] font-mono">
                      {viewer}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRevoke(viewer)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-all"
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="card-hover flex-1"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
