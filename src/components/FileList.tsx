import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff, Loader, Trash, User, Upload, Share, Brain, Shield, Sparkles, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { FileInterface } from '@/types/file';

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
  const { analyzeFile, analyzeFileSecurityRisk, batchAnalyzeFiles, isAnalyzing, isConfigured } = useAIAnalysis();

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

  const handleAnalyzeFile = async (file: FileInterface) => {
    await analyzeFile(file);
  };

  const handleSecurityAnalysis = async (file: FileInterface) => {
    await analyzeFileSecurityRisk(file);
  };

  const handleBatchAnalyze = async () => {
    const allFiles = [...ownedFiles, ...sharedFiles];
    await batchAnalyzeFiles(allFiles);
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderFileItem = (file: FileInterface, isShared: boolean = false) => (
    <div key={file.id} className="p-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-300 group border-l-4 border-transparent hover:border-primary rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mr-3">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{file.name}</h3>
                {file.analysis && (
                  <Badge variant="outline" className={`text-xs ${getSensitivityColor(file.analysis.sensitivity)}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {file.analysis.sensitivity}
                  </Badge>
                )}
              </div>
              <div className="flex items-center mt-1 gap-2">
                {isOwner(file.owner) ? (
                  <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary text-xs">
                    <User className="mr-1 h-3 w-3" /> Owner
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-600 text-xs">
                    <Eye className="mr-1 h-3 w-3" /> Shared
                  </Badge>
                )}
                {file.analysis && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                    {file.analysis.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* AI Analysis Summary */}
          {file.analysis && (
            <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
              <p className="text-sm text-gray-700 mb-2">{file.analysis.summary}</p>
              <div className="flex flex-wrap gap-1">
                {file.analysis.tags.slice(0, 4).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {file.analysis.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{file.analysis.tags.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Security Analysis */}
          {file.securityAnalysis && (
            <div className={`mb-3 p-3 rounded-lg border ${
              file.securityAnalysis.riskLevel === 'high' 
                ? 'bg-red-50 border-red-200' 
                : file.securityAnalysis.riskLevel === 'medium'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`h-4 w-4 ${
                  file.securityAnalysis.riskLevel === 'high' ? 'text-red-600' :
                  file.securityAnalysis.riskLevel === 'medium' ? 'text-amber-600' : 'text-green-600'
                }`} />
                <span className="text-sm font-medium">Security Risk: {file.securityAnalysis.riskLevel}</span>
              </div>
              {file.securityAnalysis.concerns.length > 0 && (
                <p className="text-xs text-gray-600">
                  {file.securityAnalysis.concerns[0]}
                </p>
              )}
            </div>
          )}
          
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
        
        <div className="flex flex-col space-y-2">
          {/* AI Analysis Actions */}
          {isConfigured && (
            <div className="flex space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 card-hover"
                    onClick={() => handleAnalyzeFile(file)}
                    disabled={isAnalyzing}
                  >
                    <Brain className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Analysis</p>
                </TooltipContent>
              </Tooltip>

              {isOwner(file.owner) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 card-hover"
                      onClick={() => handleSecurityAnalysis(file)}
                      disabled={isAnalyzing}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Security Analysis</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Main Actions */}
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
                {isConfigured && (
                  <Badge variant="secondary" className="ml-3 bg-purple-500/20 text-purple-600 border-purple-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />