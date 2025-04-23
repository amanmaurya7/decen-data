
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { FileInterface } from '@/types/file';
import { shareFileAccess, revokeFileAccess } from '@/utils/blockchainUtils';
import { saveFilesToLocalStorage } from '@/utils/fileStorage';

export const useFileSharing = (
  files: FileInterface[],
  setFiles: React.Dispatch<React.SetStateAction<FileInterface[]>>,
  isConnected: boolean,
  isCorrectNetwork: boolean
) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentlySharedFile, setCurrentlySharedFile] = useState<string | null>(null);
  const [isShareProcessing, setIsShareProcessing] = useState(false);
  const { toast } = useToast();

  const handleOpenShareModal = (fileId: string) => {
    setCurrentlySharedFile(fileId);
    setShareModalOpen(true);
  };

  const handleShareAccess = async (address: string) => {
    if (!currentlySharedFile || !isConnected || !isCorrectNetwork) {
      return;
    }
    
    // Normalize the address for consistent comparison
    const normalizedAddress = address.toLowerCase();
    
    setIsShareProcessing(true);
    
    try {
      const currentFile = files.find(f => f.id === currentlySharedFile);
      if (!currentFile) {
        throw new Error("File not found");
      }
      
      // Check if the user is trying to share with themselves (owner)
      if (normalizedAddress === currentFile.owner.toLowerCase()) {
        throw new Error("You already own this file");
      }
      
      // Check if the file is already shared with this address
      if (currentFile.viewers.some(v => v.toLowerCase() === normalizedAddress)) {
        throw new Error("File is already shared with this address");
      }
      
      const success = await shareFileAccess(currentlySharedFile, address);
      
      if (success) {
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.map(file => 
            file.id === currentlySharedFile 
              ? { ...file, viewers: [...file.viewers, address] } 
              : file
          );
          saveFilesToLocalStorage(updatedFiles);
          return updatedFiles;
        });
        
        toast({
          title: "Access Granted",
          description: `Access granted to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      } else {
        throw new Error("Failed to grant access");
      }
    } catch (error: any) {
      toast({
        title: "Failed to Grant Access",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsShareProcessing(false);
    }
  };

  const handleRevokeAccess = async (address: string) => {
    if (!currentlySharedFile || !isConnected || !isCorrectNetwork) {
      return;
    }
    
    setIsShareProcessing(true);
    
    try {
      const success = await revokeFileAccess(currentlySharedFile, address);
      
      if (success) {
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.map(file => 
            file.id === currentlySharedFile 
              ? { ...file, viewers: file.viewers.filter(v => v !== address) } 
              : file
          );
          saveFilesToLocalStorage(updatedFiles);
          return updatedFiles;
        });
        
        toast({
          title: "Access Revoked",
          description: `Access revoked from ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      } else {
        throw new Error("Failed to revoke access");
      }
    } catch (error: any) {
      toast({
        title: "Failed to Revoke Access",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsShareProcessing(false);
    }
  };

  return {
    shareModalOpen,
    setShareModalOpen,
    currentlySharedFile,
    isShareProcessing,
    handleOpenShareModal,
    handleShareAccess,
    handleRevokeAccess,
  };
};
