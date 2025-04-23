
import { useWallet } from '@/hooks/useWallet';
import { useFileManagement } from '@/hooks/useFileManagement';
import { Layout } from '@/components/Layout';
import { MetricsSection } from '@/components/MetricsSection';
import NetworkStatus from '@/components/NetworkStatus';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import ShareModal from '@/components/ShareModal';
import { PinataSetup } from '@/components/PinataSetup';
import { arePinataCredentialsSet } from '@/utils/ipfsUtils';
import { useState, useEffect } from 'react';

const Index = () => {
  const [isPinataSetup, setIsPinataSetup] = useState(false);
  
  const {
    isConnected,
    accountAddress,
    networkName,
    isCorrectNetwork,
    handleConnectWallet,
    handleDisconnectWallet,
    handleSwitchNetwork
  } = useWallet();

  const {
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
  } = useFileManagement(accountAddress, isConnected, isCorrectNetwork);

  useEffect(() => {
    setIsPinataSetup(arePinataCredentialsSet());
  }, []);

  const currentFileViewers = files.find(f => f.id === currentlySharedFile)?.viewers.filter(
    v => v.toLowerCase() !== accountAddress.toLowerCase()
  ) || [];

  if (!isPinataSetup) {
    return (
      <Layout 
        isConnected={isConnected}
        accountAddress={accountAddress}
        networkName={networkName}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      >
        <div className="mb-8">
          <NetworkStatus 
            isConnected={isConnected}
            connectedNetwork={networkName}
            isCorrectNetwork={isCorrectNetwork}
            onSwitchNetwork={handleSwitchNetwork}
          />
        </div>
        <PinataSetup />
      </Layout>
    );
  }

  return (
    <Layout 
      isConnected={isConnected}
      accountAddress={accountAddress}
      networkName={networkName}
      onConnect={handleConnectWallet}
      onDisconnect={handleDisconnectWallet}
    >
      <div className="mb-4 sm:mb-6">
        <NetworkStatus 
          isConnected={isConnected}
          connectedNetwork={networkName}
          isCorrectNetwork={isCorrectNetwork}
          onSwitchNetwork={handleSwitchNetwork}
        />
      </div>

      <MetricsSection 
        totalFiles={files.length}
        totalStorage={totalStorage}
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <FileUpload 
            onUpload={handleFileUpload} 
            isUploading={isLoading} 
          />
        </div>
        
        <div className="w-full lg:w-2/3">
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
      
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShare={handleShareAccess}
        onRevoke={handleRevokeAccess}
        currentViewers={currentFileViewers}
        isProcessing={isShareProcessing}
      />
    </Layout>
  );
};

export default Index;
