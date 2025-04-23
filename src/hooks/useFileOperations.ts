
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { FileInterface } from '@/types/file';
import { uploadToIPFS, downloadFromIPFS, unpinFromIPFS } from '@/utils/ipfsUtils';
import { encryptFile, decryptFile } from '@/utils/encryptionUtils';
import { 
  uploadFileToBlockchain, 
  downloadFileFromBlockchain,
  deleteFile as deleteFileFromBlockchain
} from '@/utils/blockchainUtils';
import { saveFilesToLocalStorage } from '@/utils/fileStorage';

export const useFileOperations = (
  files: FileInterface[],
  setFiles: React.Dispatch<React.SetStateAction<FileInterface[]>>,
  setTotalStorage: React.Dispatch<React.SetStateAction<number>>,
  accountAddress: string,
  isConnected: boolean,
  isCorrectNetwork: boolean
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const { toast } = useToast();

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
        
        setFiles(prevFiles => {
          const updatedFiles = [newFile, ...prevFiles];
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
      const success = await deleteFileFromBlockchain(fileId);
      
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
        
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.filter(f => f.id !== fileId);
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

  return {
    isLoading,
    loadingFileId,
    handleFileUpload,
    handleFileDownload,
    handleFileDelete,
  };
};
