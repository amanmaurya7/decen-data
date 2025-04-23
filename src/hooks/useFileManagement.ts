
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { uploadToIPFS, downloadFromIPFS, unpinFromIPFS } from '@/utils/ipfsUtils';
import { encryptFile, decryptFile } from '@/utils/encryptionUtils';
import { 
  uploadFileToBlockchain, 
  downloadFileFromBlockchain,
  shareFileAccess,
  revokeFileAccess,
  deleteFile
} from '@/utils/blockchainUtils';

export interface FileInterface {
  id: string;
  name: string;
  size: number;
  type: string;
  owner: string;
  ipfsHash: string;
  uploadDate: Date;
  viewers: string[];
}

// Helper function to save files to localStorage
const saveFilesToLocalStorage = (files: FileInterface[]) => {
  try {
    // Convert Date objects to strings for JSON serialization
    const filesForStorage = files.map(file => ({
      ...file,
      uploadDate: file.uploadDate.toISOString()
    }));
    localStorage.setItem('decendata_files', JSON.stringify(filesForStorage));
  } catch (error) {
    console.error("Error saving files to localStorage:", error);
  }
};

// Helper function to load files from localStorage
const loadFilesFromLocalStorage = (): FileInterface[] => {
  try {
    const filesString = localStorage.getItem('decendata_files');
    if (!filesString) return [];
    
    // Convert date strings back to Date objects
    const files = JSON.parse(filesString);
    return files.map((file: any) => ({
      ...file,
      uploadDate: new Date(file.uploadDate)
    }));
  } catch (error) {
    console.error("Error loading files from localStorage:", error);
    return [];
  }
};

export const useFileManagement = (accountAddress: string, isConnected: boolean, isCorrectNetwork: boolean) => {
  const [files, setFiles] = useState<FileInterface[]>([]);
  const [totalStorage, setTotalStorage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentlySharedFile, setCurrentlySharedFile] = useState<string | null>(null);
  const [isShareProcessing, setIsShareProcessing] = useState(false);

  const { toast } = useToast();

  // Load files from localStorage when the component mounts or when wallet connects
  useEffect(() => {
    if (isConnected && accountAddress) {
      const allFiles = loadFilesFromLocalStorage();
      
      // Filter files that are owned by or shared with the current account
      const relevantFiles = allFiles.filter(file => 
        file.owner.toLowerCase() === accountAddress.toLowerCase() ||
        file.viewers.some(viewer => viewer.toLowerCase() === accountAddress.toLowerCase())
      );
      
      setFiles(relevantFiles);
      
      // Calculate total storage
      const totalSize = relevantFiles.reduce((sum, file) => sum + file.size, 0);
      setTotalStorage(totalSize);
    } else {
      // Clear files when disconnected
      setFiles([]);
      setTotalStorage(0);
    }
  }, [isConnected, accountAddress]);

  const handleFileUpload = async (file: File) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    
    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Hardhat or Localhost network",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const fileId = uuidv4();
      
      toast({ title: "Encrypting file..." });
      const encryptedData = await encryptFile(file);
      
      toast({ title: "Uploading to decentralized storage..." });
      const ipfsHash = await uploadToIPFS(file);
      
      toast({ title: "Recording on blockchain..." });
      const success = await uploadFileToBlockchain(fileId, file.name, ipfsHash, file.size);
      
      if (success) {
        const newFile: FileInterface = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          owner: accountAddress,
          ipfsHash,
          uploadDate: new Date(),
          viewers: [accountAddress]
        };
        
        // Update state
        setFiles(prevFiles => {
          const updatedFiles = [newFile, ...prevFiles];
          
          // Save to localStorage
          saveFilesToLocalStorage(updatedFiles);
          
          return updatedFiles;
        });
        
        setTotalStorage(prev => prev + file.size);
        
        toast({
          title: "Upload Complete",
          description: "File has been securely stored",
          variant: "default"
        });
      } else {
        throw new Error("Failed to store on blockchain");
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDownload = async (fileId: string) => {
    if (!isConnected || !isCorrectNetwork) {
      toast({
        title: "Cannot Download",
        description: "Please connect to the correct network",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setLoadingFileId(fileId);
    
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) {
        throw new Error("File not found");
      }
      
      toast({ title: "Retrieving file metadata from blockchain..." });
      const metadata = await downloadFileFromBlockchain(fileId);
      
      if (!metadata) {
        throw new Error("Failed to retrieve file metadata");
      }
      
      toast({ title: "Downloading from decentralized storage..." });
      const encryptedData = await downloadFromIPFS(file.ipfsHash);
      
      toast({ title: "Decrypting file..." });
      const decryptedData = await decryptFile(await encryptedData.arrayBuffer(), file.name);
      
      const url = URL.createObjectURL(decryptedData);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: `${file.name} has been decrypted and downloaded`,
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "An error occurred during download",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingFileId(null);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!isConnected || !isCorrectNetwork) {
      toast({
        title: "Cannot Delete",
        description: "Please connect to the correct network",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setLoadingFileId(fileId);
    
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) {
        throw new Error("File not found");
      }
      
      toast({ title: "Removing file reference from blockchain..." });
      const success = await deleteFile(fileId);
      
      if (success) {
        toast({ title: "Deleting from decentralized storage..." });
        try {
          await unpinFromIPFS(file.ipfsHash);
        } catch (error: any) {
          toast({
            title: "Pinata Deletion Failed",
            description: error?.message || "File deleted from blockchain but failed to unpin from storage",
            variant: "destructive",
          });
        }
        
        // Update state
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.filter(f => f.id !== fileId);
          
          // Save to localStorage
          saveFilesToLocalStorage(updatedFiles);
          
          return updatedFiles;
        });
        
        setTotalStorage(prev => prev - file.size);
        
        toast({
          title: "File Deleted",
          description: `${file.name} has been removed from your files`,
        });
      } else {
        throw new Error("Failed to delete from blockchain");
      }
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "An error occurred during deletion",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingFileId(null);
    }
  };

  const handleOpenShareModal = (fileId: string) => {
    setCurrentlySharedFile(fileId);
    setShareModalOpen(true);
  };

  const handleShareAccess = async (address: string) => {
    if (!currentlySharedFile || !isConnected || !isCorrectNetwork) {
      return;
    }
    
    setIsShareProcessing(true);
    
    try {
      const success = await shareFileAccess(currentlySharedFile, address);
      
      if (success) {
        // Update state
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.map(file => 
            file.id === currentlySharedFile 
              ? { ...file, viewers: [...file.viewers.filter(v => v !== address), address] } 
              : file
          );
          
          // Save to localStorage
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
        // Update state
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.map(file => 
            file.id === currentlySharedFile 
              ? { ...file, viewers: file.viewers.filter(v => v !== address) } 
              : file
          );
          
          // Save to localStorage
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
    files,
    totalStorage,
    isLoading,
    loadingFileId,
    shareModalOpen,
    setShareModalOpen,
    currentlySharedFile,
    isShareProcessing,
    handleFileUpload,
    handleFileDownload,
    handleFileDelete,
    handleOpenShareModal,
    handleShareAccess,
    handleRevokeAccess
  };
};
