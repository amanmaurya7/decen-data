
import { useState, useEffect } from 'react';
import { FileInterface } from '@/types/file';
import { loadFilesFromLocalStorage } from '@/utils/fileStorage';
import { useFileOperations } from './useFileOperations';
import { useFileSharing } from './useFileSharing';

export const useFileManagement = (accountAddress: string, isConnected: boolean, isCorrectNetwork: boolean) => {
  const [files, setFiles] = useState<FileInterface[]>([]);
  const [ownedFiles, setOwnedFiles] = useState<FileInterface[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileInterface[]>([]);
  const [totalStorage, setTotalStorage] = useState(0);

  // Load files from localStorage when the component mounts or when wallet connects
  useEffect(() => {
    if (isConnected && accountAddress) {
      const allFiles = loadFilesFromLocalStorage();
      
      // Separate files into owned and shared
      const owned = allFiles.filter(file => 
        file.owner.toLowerCase() === accountAddress.toLowerCase()
      );
      
      const shared = allFiles.filter(file => 
        file.owner.toLowerCase() !== accountAddress.toLowerCase() && 
        file.viewers.some(viewer => viewer.toLowerCase() === accountAddress.toLowerCase())
      );
      
      setOwnedFiles(owned);
      setSharedFiles(shared);
      
      // Combine both for total files
      const relevantFiles = [...owned, ...shared];
      setFiles(relevantFiles);
      
      // Calculate total storage
      const totalSize = relevantFiles.reduce((sum, file) => sum + file.size, 0);
      setTotalStorage(totalSize);
    } else {
      // Clear files when disconnected
      setFiles([]);
      setOwnedFiles([]);
      setSharedFiles([]);
      setTotalStorage(0);
    }
  }, [isConnected, accountAddress]);

  const fileOperations = useFileOperations(
    files,
    setFiles,
    setTotalStorage,
    accountAddress,
    isConnected,
    isCorrectNetwork
  );

  const fileSharing = useFileSharing(
    files,
    setFiles,
    isConnected,
    isCorrectNetwork
  );

  // Add a method to save shared files to the user's own account
  const saveSharedFileToOwned = async (fileId: string) => {
    if (!isConnected || !isCorrectNetwork) {
      return false;
    }
    
    try {
      const fileToSave = files.find(f => f.id === fileId);
      if (!fileToSave) {
        throw new Error("File not found");
      }
      
      // Only allow saving shared files (not owned files)
      if (fileToSave.owner.toLowerCase() === accountAddress.toLowerCase()) {
        throw new Error("You already own this file");
      }
      
      // Create a new file entry with the same IPFS hash but new ownership
      const newFileId = fileOperations.handleSaveSharedFile(fileToSave);
      return !!newFileId;
    } catch (error) {
      console.error("Error saving shared file:", error);
      return false;
    }
  };
  
  return {
    files,
    ownedFiles,
    sharedFiles,
    totalStorage,
    ...fileOperations,
    ...fileSharing,
    saveSharedFileToOwned
  };
};

export type { FileInterface };
