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
    <div key={file.id} className="p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-300 group border-l-4 border-transparent hover:border-primary rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mr-3">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{file.name}</h3>
              <div className="flex items-center mt-1">
                {isOwner(file.owner) ? (
                  <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary text-xs mr-2">
                    <User className="mr-1 h-3 w-3" /> Owner
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-600 text-xs mr-2">
                    <Eye className="mr-1 h-3 w-3" /> Shared
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-4">
            <span className="px-2 py-1 bg-muted rounded-md">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <span className="px-2 py-1 bg-muted rounded-md">
              {file.type || "Unknown type"}
            </span>
            <span className="px-2 py-1 bg-muted rounded-md">
              {formatDate(file.uploadDate)}
            </span>
          </div>
          
          <div className="flex items-center text-xs space-x-4">
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">Owner:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-primary font-mono bg-primary/10 px-2 py-1 rounded">
                    {truncateAddress(file.owner)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono">{file.owner}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">IPFS:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-blue-600 font-mono bg-blue-500/10 px-2 py-1 rounded">
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
                className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary card-hover"
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
                  className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500 card-hover"
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
                    className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500 card-hover"
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
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 card-hover"
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
    <Card className="professional-card card-hover">
      <Tabs defaultValue="owned">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-b border-border/50 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-foreground text-2xl font-bold flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                Your Files
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Securely stored on IPFS with blockchain verification
              </CardDescription>
            </div>
            <TabsList className="professional-card border border-border/50">
              <TabsTrigger 
                value="owned" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-primary-foreground font-medium"
              >
                My Files
                {ownedFiles.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-primary/30">
                    {ownedFiles.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="shared" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-medium"
              >
                Shared Files
                {sharedFiles.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-600 border-blue-500/30">
                    {sharedFiles.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        
        <TabsContent value="owned" className="m-0">
          <CardContent className="p-0">
            {ownedFiles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-6">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <p className="text-xl font-semibold text-foreground mb-2">No files found</p>
                <p className="text-sm text-muted-foreground">
                  Upload your first file to get started with decentralized storage
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {ownedFiles.map(file => renderFileItem(file))}
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="shared" className="m-0">
          <CardContent className="p-0">
            {sharedFiles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-6">
                  <Eye className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-xl font-semibold text-foreground mb-2">No shared files found</p>
                <p className="text-sm text-muted-foreground">
                  Files shared with you will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {sharedFiles.map(file => renderFileItem(file, true))}
              </div>
            )}
          </CardContent>
          {sharedFiles.length > 0 && (
            <CardFooter className="bg-muted/30 border-t border-border/50 p-4">
              <div className="flex items-center text-xs text-muted-foreground">
                <Eye className="h-4 w-4 mr-2 text-blue-600" />
                <p>Files shared with you can be saved to your account by clicking the upload icon</p>
              </div>
            </CardFooter>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default FileList;
