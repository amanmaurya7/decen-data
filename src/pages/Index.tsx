import { useWallet } from '@/hooks/useWallet';
import { useFileManagement } from '@/hooks/useFileManagement';
import { Layout } from '@/components/Layout';
import { MetricsSection } from '@/components/MetricsSection';
import NetworkStatus from '@/components/NetworkStatus';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import ShareModal from '@/components/ShareModal';
import { PinataSetup } from '@/components/PinataSetup';
import { AISearch } from '@/components/AISearch';
import { AIAnalytics } from '@/components/AIAnalytics';
import { arePinataCredentialsSet } from '@/utils/ipfsUtils';
import { isPerplexityConfigured } from '@/utils/aiAnalysisUtils';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, Upload, Search } from "lucide-react";

const Index = () => {
  const [isPinataSetup, setIsPinataSetup] = useState(false);
  const [isAIConfigured, setIsAIConfigured] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  
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
    ownedFiles,
    sharedFiles,
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
    handleRevokeAccess,
    saveSharedFileToOwned
  } = useFileManagement(accountAddress, isConnected, isCorrectNetwork);

  useEffect(() => {
    setIsPinataSetup(arePinataCredentialsSet());
    setIsAIConfigured(isPerplexityConfigured());
  }, []);

  const currentFileViewers = files.find(f => f.id === currentlySharedFile)?.viewers.filter(
    v => v.toLowerCase() !== accountAddress.toLowerCase()
  ) || [];

  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId);
    // Scroll to file or highlight it
    const fileElement = document.getElementById(`file-${fileId}`);
    if (fileElement) {
      fileElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fileElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        fileElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 3000);
    }
  };

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
        ownedFiles={ownedFiles.length}
        sharedFiles={sharedFiles.length}
        totalStorage={totalStorage}
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Upload Section */}
        <div className="xl:col-span-1">
          <FileUpload 
            onUpload={handleFileUpload} 
            isUploading={isLoading} 
          />
        </div>
        
        {/* AI Search Section */}
        <div className="xl:col-span-2">
          {isAIConfigured ? (
            <AISearch 
              files={[...ownedFiles, ...sharedFiles]}
              onFileSelect={handleFileSelect}
            />
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center p-8">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">AI Search Unavailable</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure your Perplexity API key to enable intelligent file search
                </p>
                <Badge variant="outline" className="text-gray-500">
                  Visit AI Settings to get started
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced File Management Section */}
      <div className="space-y-6">
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              File Management
              <Badge variant="secondary" className="ml-1">
                {files.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2" disabled={!isAIConfigured}>
              <Search className="h-4 w-4" />
              Smart Search
              {isAIConfigured && (
                <Badge variant="secondary" className="ml-1 bg-purple-500/20 text-purple-600">
                  AI
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="hidden lg:flex items-center gap-2" disabled={!isAIConfigured}>
              <Brain className="h-4 w-4" />
              AI Insights
              {isAIConfigured && (
                <Badge variant="secondary" className="ml-1 bg-green-500/20 text-green-600">
                  Pro
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="mt-6">
            <FileList 
              ownedFiles={ownedFiles}
              sharedFiles={sharedFiles}
              connectedAccount={accountAddress}
              onDownload={handleFileDownload}
              onDelete={handleFileDelete}
              onShareAccess={handleOpenShareModal}
              onSaveShared={saveSharedFileToOwned}
              isLoading={isLoading}
              loadingFileId={loadingFileId}
            />
          </TabsContent>
          
          <TabsContent value="search" className="mt-6">
            {isAIConfigured ? (
              <AISearch 
                files={[...ownedFiles, ...sharedFiles]}
                onFileSelect={handleFileSelect}
              />
            ) : (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">AI Search Not Available</h3>
                <p className="text-sm text-gray-500">
                  Configure your Perplexity API key to enable this feature
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            {isAIConfigured ? (
              <div className="grid gap-6">
                {/* Analytics content would go here - placeholder for now */}
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">AI Analytics Dashboard</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Comprehensive AI-powered insights about your file storage patterns
                  </p>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    Coming Soon
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">AI Analytics Not Available</h3>
                <p className="text-sm text-gray-500">
                  Configure your Perplexity API key to enable advanced analytics
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
