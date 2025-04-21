
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import ShareModal from '@/components/ShareModal';
import NetworkStatus from '@/components/NetworkStatus';
import MetricsCard from '@/components/MetricsCard';
import { useToast } from "@/hooks/use-toast";
import { 
  connectWallet, 
  getNetworkName, 
  isTestNetwork, 
  switchToLocalNetwork 
} from '@/utils/blockchainUtils';
import { uploadToIPFS, downloadFromIPFS } from '@/utils/ipfsUtils';
import { encryptFile, decryptFile } from '@/utils/encryptionUtils';
import { 
  uploadFileToBlockchain, 
  downloadFileFromBlockchain,
  shareFileAccess,
  revokeFileAccess,
  deleteFile
} from '@/utils/blockchainUtils';
import { File, Folder, Lock, Upload, Check } from 'lucide-react';

interface FileInterface {
  id: string;
  name: string;
  size: number;
  type: string;
  owner: string;
  ipfsHash: string;
  uploadDate: Date;
  viewers: string[];
}

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [networkName, setNetworkName] = useState('Not Connected');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [files, setFiles] = useState<FileInterface[]>([]);
  const [totalStorage, setTotalStorage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentlySharedFile, setCurrentlySharedFile] = useState<string | null>(null);
  const [isShareProcessing, setIsShareProcessing] = useState(false);
  
  const toast = useToast();

  // Initialize blockchain connection
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccountAddress(accounts[0]);
            setIsConnected(true);
            
            // Get network information
            const network = await getNetworkName();
            setNetworkName(network);
            
            const onTestNetwork = await isTestNetwork();
            setIsCorrectNetwork(onTestNetwork);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
            if (newAccounts.length === 0) {
              setIsConnected(false);
              setAccountAddress('');
            } else {
              setAccountAddress(newAccounts[0]);
              setIsConnected(true);
            }
          });
          
          // Listen for network changes
          window.ethereum.on('chainChanged', async () => {
            const network = await getNetworkName();
            setNetworkName(network);
            
            const onTestNetwork = await isTestNetwork();
            setIsCorrectNetwork(onTestNetwork);
            
            // Reload the page on network change as recommended by MetaMask
            window.location.reload();
          });
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };
    
    checkConnection();
    
    // Mock data for demonstration
    const mockFiles: FileInterface[] = [
      {
        id: "file-1",
        name: "important-document.pdf",
        size: 2.5 * 1024 * 1024, // 2.5 MB
        type: "application/pdf",
        owner: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        ipfsHash: "QmX7gXYuT9XmZ9Td8eeifkLwMwJyc6pAGMmgMvYmLFo4v6",
        uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        viewers: ["0x71C7656EC7ab88b098defB751B7401B5f6d8976F"]
      },
      {
        id: "file-2",
        name: "confidential-report.docx",
        size: 1.8 * 1024 * 1024, // 1.8 MB
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        owner: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        viewers: [
          "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", 
          "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
        ]
      }
    ];
    
    setFiles(mockFiles);
    
    // Calculate total storage
    const total = mockFiles.reduce((acc, file) => acc + file.size, 0);
    setTotalStorage(total);
    
    return () => {
      // Clean up event listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setAccountAddress(address);
      setIsConnected(true);
      
      const network = await getNetworkName();
      setNetworkName(network);
      
      const onTestNetwork = await isTestNetwork();
      setIsCorrectNetwork(onTestNetwork);
      
      toast.toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      toast.toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };
  
  // Handle network switching
  const handleSwitchNetwork = async () => {
    try {
      await switchToLocalNetwork();
      
      // Update network status
      const network = await getNetworkName();
      setNetworkName(network);
      
      const onTestNetwork = await isTestNetwork();
      setIsCorrectNetwork(onTestNetwork);
      
      toast.toast({
        title: "Network Switched",
        description: `Connected to ${network}`,
      });
    } catch (error: any) {
      toast.toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch network",
        variant: "destructive"
      });
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!isConnected) {
      toast.toast({
        title: "Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    
    if (!isCorrectNetwork) {
      toast.toast({
        title: "Wrong Network",
        description: "Please switch to Hardhat or Localhost network",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Generate a unique ID for the file
      const fileId = uuidv4();
      
      // Step 2: Encrypt the file (simulated)
      toast.toast({ title: "Encrypting file..." });
      const encryptedData = await encryptFile(file);
      
      // Step 3: Upload to IPFS (simulated)
      toast.toast({ title: "Uploading to decentralized storage..." });
      const ipfsHash = await uploadToIPFS(file);
      
      // Step 4: Store metadata on blockchain (simulated)
      toast.toast({ title: "Recording on blockchain..." });
      const success = await uploadFileToBlockchain(fileId, file.name, ipfsHash, file.size);
      
      if (success) {
        // Add file to the list
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
        
        setFiles(prev => [newFile, ...prev]);
        setTotalStorage(prev => prev + file.size);
        
        toast.toast({
          title: "Upload Complete",
          description: "File has been securely stored",
          variant: "default"
        });
      } else {
        throw new Error("Failed to store on blockchain");
      }
    } catch (error: any) {
      toast.toast({
        title: "Upload Failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file download
  const handleFileDownload = async (fileId: string) => {
    if (!isConnected || !isCorrectNetwork) {
      toast.toast({
        title: "Cannot Download",
        description: "Please connect to the correct network",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setLoadingFileId(fileId);
    
    try {
      // Find the file in our list
      const file = files.find(f => f.id === fileId);
      if (!file) {
        throw new Error("File not found");
      }
      
      // Step 1: Get file metadata from blockchain (simulated)
      toast.toast({ title: "Retrieving file metadata from blockchain..." });
      const metadata = await downloadFileFromBlockchain(fileId);
      
      if (!metadata) {
        throw new Error("Failed to retrieve file metadata");
      }
      
      // Step 2: Download from IPFS (simulated)
      toast.toast({ title: "Downloading from decentralized storage..." });
      const encryptedData = await downloadFromIPFS(file.ipfsHash);
      
      // Step 3: Decrypt the file (simulated)
      toast.toast({ title: "Decrypting file..." });
      const decryptedData = await decryptFile(await encryptedData.arrayBuffer(), file.name);
      
      // Step 4: Create download link
      const url = URL.createObjectURL(decryptedData);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.toast({
        title: "Download Complete",
        description: `${file.name} has been decrypted and downloaded`,
      });
    } catch (error: any) {
      toast.toast({
        title: "Download Failed",
        description: error.message || "An error occurred during download",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingFileId(null);
    }
  };
  
  // Handle file deletion
  const handleFileDelete = async (fileId: string) => {
    if (!isConnected || !isCorrectNetwork) {
      toast.toast({
        title: "Cannot Delete",
        description: "Please connect to the correct network",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setLoadingFileId(fileId);
    
    try {
      // Find the file in our list
      const file = files.find(f => f.id === fileId);
      if (!file) {
        throw new Error("File not found");
      }
      
      // Delete from blockchain (simulated)
      toast.toast({ title: "Removing file reference from blockchain..." });
      const success = await deleteFile(fileId);
      
      if (success) {
        // Remove file from the list
        setFiles(prev => prev.filter(f => f.id !== fileId));
        setTotalStorage(prev => prev - file.size);
        
        toast.toast({
          title: "File Deleted",
          description: `${file.name} has been removed from your files`,
        });
      } else {
        throw new Error("Failed to delete from blockchain");
      }
    } catch (error: any) {
      toast.toast({
        title: "Deletion Failed",
        description: error.message || "An error occurred during deletion",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingFileId(null);
    }
  };
  
  // Handle opening share modal
  const handleOpenShareModal = (fileId: string) => {
    setCurrentlySharedFile(fileId);
    setShareModalOpen(true);
  };
  
  // Handle sharing file access
  const handleShareAccess = async (address: string) => {
    if (!currentlySharedFile || !isConnected || !isCorrectNetwork) {
      return;
    }
    
    setIsShareProcessing(true);
    
    try {
      // Share access on blockchain (simulated)
      const success = await shareFileAccess(currentlySharedFile, address);
      
      if (success) {
        // Update the file's viewers list
        setFiles(prev => 
          prev.map(file => 
            file.id === currentlySharedFile 
              ? { ...file, viewers: [...file.viewers.filter(v => v !== address), address] } 
              : file
          )
        );
        
        toast.toast({
          title: "Access Granted",
          description: `Access granted to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      } else {
        throw new Error("Failed to grant access");
      }
    } catch (error: any) {
      toast.toast({
        title: "Failed to Grant Access",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsShareProcessing(false);
    }
  };
  
  // Handle revoking file access
  const handleRevokeAccess = async (address: string) => {
    if (!currentlySharedFile || !isConnected || !isCorrectNetwork) {
      return;
    }
    
    setIsShareProcessing(true);
    
    try {
      // Revoke access on blockchain (simulated)
      const success = await revokeFileAccess(currentlySharedFile, address);
      
      if (success) {
        // Update the file's viewers list
        setFiles(prev => 
          prev.map(file => 
            file.id === currentlySharedFile 
              ? { ...file, viewers: file.viewers.filter(v => v !== address) } 
              : file
          )
        );
        
        toast.toast({
          title: "Access Revoked",
          description: `Access revoked from ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      } else {
        throw new Error("Failed to revoke access");
      }
    } catch (error: any) {
      toast.toast({
        title: "Failed to Revoke Access",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsShareProcessing(false);
    }
  };
  
  // Calculate metrics
  const totalFiles = files.length;
  const formattedStorage = (totalStorage / (1024 * 1024)).toFixed(2);
  const currentFileViewers = files.find(f => f.id === currentlySharedFile)?.viewers.filter(
    v => v.toLowerCase() !== accountAddress.toLowerCase()
  ) || [];

  return (
    <div className="min-h-screen bg-blockchain-darkBlue">
      <Header 
        onConnect={handleConnectWallet} 
        isConnected={isConnected}
        accountAddress={accountAddress}
        networkName={networkName}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <NetworkStatus 
            isConnected={isConnected}
            connectedNetwork={networkName}
            isCorrectNetwork={isCorrectNetwork}
            onSwitchNetwork={handleSwitchNetwork}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricsCard 
            title="Total Files" 
            value={totalFiles} 
            description="Securely stored files"
            icon={<File className="h-4 w-4" />} 
          />
          <MetricsCard 
            title="Storage Used" 
            value={`${formattedStorage} MB`} 
            description="Encrypted storage space"
            icon={<Folder className="h-4 w-4" />} 
          />
          <MetricsCard 
            title="Security Status" 
            value="Encrypted" 
            description="End-to-end encryption"
            icon={<Lock className="h-4 w-4" />} 
            className="bg-gradient-to-br from-blockchain-darkBlue to-blockchain-purple/30"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <FileUpload onUpload={handleFileUpload} isUploading={isLoading} />
          </div>
          
          <div className="lg:col-span-2">
            <FileList 
              files={files}
              connectedAccount={accountAddress}
              onDownload={handleFileDownload}
              onDelete={handleFileDelete}
              onShareAccess={handleOpenShareModal}
              isLoading={isLoading}
              loadingFileId={loadingFileId}
            />
          </div>
        </div>
      </main>
      
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShare={handleShareAccess}
        onRevoke={handleRevokeAccess}
        currentViewers={currentFileViewers}
        isProcessing={isShareProcessing}
      />
    </div>
  );
};

export default Index;
