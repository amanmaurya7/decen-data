import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff, Loader, Trash, User, Upload, Share } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface FileListProps {
  ownedFiles: FileInterface[];
  sharedFiles: FileInterface[];
  connectedAccount: string;
  onDownload: (fileId: string) => Promise<void>;
  onDelete: (fileId: string) => Promise<void>;
  onShareAccess: (fileId: string) => void;
  onSaveShared: (fileId: string) => Promise<boolean>;
  isLoading: boolean;
  loadingFileId: string | null;
}

const FileList = ({
  ownedFiles,
  sharedFiles,
  connectedAccount,
  onDownload,
  onDelete,
  onShareAccess,
  onSaveShared,
  isLoading,
  loadingFileId
}: FileListProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const isOwner = (fileOwner: string) => {
    return fileOwner.toLowerCase() === connectedAccount.toLowerCase();
  };

  const hasAccess = (file: FileInterface) => {
    if (isOwner(file.owner)) return true;
    return file.viewers.some(viewer => 
      viewer.toLowerCase() === connectedAccount.toLowerCase()
    );
  };
   const renderFileItem = (file: FileInterface, isShared: boolean = false) => (
    <div key={file.id} className="p-6 hover:bg-gradient-to-r hover:from-blockchain-purple/5 hover:to-blockchain-teal/5 transition-all duration-300 group border-l-4 border-transparent hover:border-blockchain-purple">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blockchain-purple/20 to-blockchain-teal/20 flex items-center justify-center mr-3">
              <Upload className="h-5 w-5 text-blockchain-purple" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-blockchain-purple transition-colors">{file.name}</h3>
              <div className="flex items-center mt-1">
                {isOwner(file.owner) ? (
                  <Badge variant="outline" className="border-blockchain-purple/50 bg-blockchain-purple/10 text-blockchain-purple text-xs mr-2">
                    <User className="mr-1 h-3 w-3" /> Owner
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-blockchain-teal/50 bg-blockchain-teal/10 text-blockchain-teal text-xs mr-2">
                    <Eye className="mr-1 h-3 w-3" /> Shared
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-400 mb-3 space-x-4">
            <span className="px-2 py-1 bg-blockchain-darkBlue/30 rounded-md">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <span className="px-2 py-1 bg-blockchain-darkBlue/30 rounded-md">
              {file.type || "Unknown type"}
            </span>
            <span className="px-2 py-1 bg-blockchain-darkBlue/30 rounded-md">
              {formatDate(file.uploadDate)}
            </span>
          </div>
          
          <div className="flex items-center text-xs space-x-4">
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Owner:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-blockchain-purple font-mono bg-blockchain-purple/10 px-2 py-1 rounded">
                    {truncateAddress(file.owner)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono">{file.owner}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">IPFS:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-blockchain-teal font-mono bg-blockchain-teal/10 px-2 py-1 rounded">
                    {file.ipfsHash.substring(0, 12)}...
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono break-all max-w-xs">{file.ipfsHash}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-blockchain-purple/30 text-blockchain-purple hover:bg-blockchain-purple/10 hover:border-blockchain-purple card-hover"
                onClick={() => onDownload(file.id)}
                disabled={isLoading && loadingFileId === file.id}
              >
                {isLoading && loadingFileId === file.id ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download file</p>
            </TooltipContent>
          </Tooltip>

          {isShared && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blockchain-teal/30 text-blockchain-teal hover:bg-blockchain-teal/10 hover:border-blockchain-teal card-hover"
                  onClick={() => onSaveShared(file.id)}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save to my files</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {isOwner(file.owner) && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blockchain-teal/30 text-blockchain-teal hover:bg-blockchain-teal/10 hover:border-blockchain-teal card-hover"
                    onClick={() => onShareAccess(file.id)}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share file</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500 card-hover"
                    onClick={() => onDelete(file.id)}
                    disabled={isLoading && loadingFileId === file.id}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete file</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="border border-blockchain-purple/20 bg-card">
      <Tabs defaultValue="owned">
        <CardHeader className="bg-gradient-to-r from-blockchain-darkBlue to-blockchain-darkPurple/50 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white">Your Files</CardTitle>
              <CardDescription className="text-gray-300 mb-4">
                Securely stored on decentralized storage
              </CardDescription>
            </div>
            <TabsList className="bg-blockchain-darkBlue/70">
              <TabsTrigger value="owned" className="data-[state=active]:bg-blockchain-purple">My Files</TabsTrigger>
              <TabsTrigger value="shared" className="data-[state=active]:bg-blockchain-teal">
                Shared Files
                {sharedFiles.length > 0 && (
                  <Badge variant="destructive" className="ml-2 bg-blockchain-teal text-white">{sharedFiles.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        
        <TabsContent value="owned" className="m-0">
          <CardContent className="p-0">
            {ownedFiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No files found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Upload your first file to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {ownedFiles.map(file => renderFileItem(file))}
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="shared" className="m-0">
          <CardContent className="p-0">
            {sharedFiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No shared files found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Files shared with you will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {sharedFiles.map(file => renderFileItem(file, true))}
              </div>
            )}
          </CardContent>
          {sharedFiles.length > 0 && (
            <CardFooter className="bg-blockchain-darkBlue/30 p-3 text-xs text-gray-400">
              <p>Files shared with you can be saved to your account by clicking the upload icon</p>
            </CardFooter>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default FileList;
