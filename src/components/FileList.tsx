
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff, Loader, Trash, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  files: FileInterface[];
  connectedAccount: string;
  onDownload: (fileId: string) => Promise<void>;
  onDelete: (fileId: string) => Promise<void>;
  onShareAccess: (fileId: string) => void;
  isLoading: boolean;
  loadingFileId: string | null;
}

const FileList = ({
  files,
  connectedAccount,
  onDownload,
  onDelete,
  onShareAccess,
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

  return (
    <Card className="border border-blockchain-purple/20 bg-card">
      <CardHeader className="bg-gradient-to-r from-blockchain-darkBlue to-blockchain-darkPurple/50">
        <CardTitle className="text-white">Your Files</CardTitle>
        <CardDescription className="text-gray-300">
          Securely stored on decentralized storage
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {files.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No files found</p>
            <p className="text-sm text-gray-500 mt-2">
              Upload your first file to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {files.map((file) => (
              <div key={file.id} className="p-4 hover:bg-blockchain-darkBlue/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h3 className="text-lg font-medium mr-2">{file.name}</h3>
                      {isOwner(file.owner) ? (
                        <Badge variant="outline" className="border-blockchain-purple text-blockchain-purple text-xs">
                          <User className="mr-1 h-3 w-3" /> Owner
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-blockchain-teal text-blockchain-teal text-xs">
                          <Eye className="mr-1 h-3 w-3" /> Shared
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span className="mx-2">•</span>
                      <span>{file.type || "Unknown type"}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(file.uploadDate)}</span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className="text-gray-500">Owner: </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 text-blockchain-purple">
                            {truncateAddress(file.owner)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{file.owner}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <span className="mx-2 text-gray-600">|</span>
                      
                      <span className="text-gray-500">IPFS: </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 text-blockchain-teal">
                            {file.ipfsHash.substring(0, 10)}...
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{file.ipfsHash}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {hasAccess(file) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blockchain-purple text-blockchain-purple hover:bg-blockchain-purple/10"
                        onClick={() => onDownload(file.id)}
                        disabled={isLoading && loadingFileId === file.id}
                      >
                        {isLoading && loadingFileId === file.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    {isOwner(file.owner) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blockchain-teal text-blockchain-teal hover:bg-blockchain-teal/10"
                          onClick={() => onShareAccess(file.id)}
                        >
                          {file.viewers.length > 1 ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                          onClick={() => onDelete(file.id)}
                          disabled={isLoading && loadingFileId === file.id}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileList;
