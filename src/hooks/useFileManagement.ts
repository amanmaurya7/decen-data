
import { useState, useEffect } from 'react';
import { FileInterface } from '@/types/file';
import { loadFilesFromLocalStorage } from '@/utils/fileStorage';
import { useFileOperations } from './useFileOperations';
import { useFileSharing } from './useFileSharing';

export const useFileManagement = (accountAddress: string, isConnected: boolean, isCorrectNetwork: boolean) => {
  const [files, setFiles] = useState<FileInterface[]>([]);
  const [totalStorage, setTotalStorage] = useState(0);

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

  return {
    files,
    totalStorage,
    ...fileOperations,
    ...fileSharing
  };
};

export type { FileInterface };
