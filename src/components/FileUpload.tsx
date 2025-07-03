import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, Upload, Brain, Sparkles, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const FileUpload = ({ onUpload, isUploading }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [filePreview, setFilePreview] = useState<any>(null);
  const toast = useToast();
  const { analyzeFile, isAnalyzing, isConfigured } = useAIAnalysis();
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    setSelectedFile(file);
    setFilePreview(null);

    // Auto-analyze if enabled and AI is configured
    if (autoAnalyze && isConfigured) {
      try {
        const mockFileForAnalysis = {
          id: 'temp-' + Date.now(),
          name: file.name,
          size: file.size,
          type: file.type
        };
        
        const analysis = await analyzeFile(mockFileForAnalysis);
        if (analysis) {
          setFilePreview(analysis);
        }
      } catch (error) {
        console.error('Preview analysis failed:', error);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive"
      });
      return;
    }

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="professional-card card-hover overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-b border-border/50">
        <CardTitle className="text-foreground flex items-center text-xl">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
            <Upload className="h-4 w-4 text-white" />
          </div>
          Upload File
          {isConfigured && (
            <Badge variant="secondary" className="ml-3 bg-purple-500/20 text-purple-600 border-purple-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Ready
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Files are encrypted and stored on IPFS with blockchain metadata
          {isConfigured && " • AI analysis available"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {/* AI Settings */}
        {isConfigured && (
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <Label htmlFor="auto-analyze" className="text-sm font-medium text-purple-800">
                Auto-analyze on upload
              </Label>
            </div>
            <Switch
              id="auto-analyze"
              checked={autoAnalyze}
              onCheckedChange={setAutoAnalyze}
            />
          </div>
        )}

        <div
          className={`file-drop-area relative overflow-hidden ${isDragging ? "border-primary bg-gradient-to-br from-primary/20 to-blue-500/10" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-50"></div>
          <div className="relative z-10">
            {selectedFile ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-xl font-semibold text-foreground">{selectedFile.name}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <span className="px-3 py-1 bg-muted rounded-full">
                    {selectedFile.type || "Unknown type"}
                  </span>
                  <span className="px-3 py-1 bg-muted rounded-full">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                {/* AI Preview Analysis */}
                {isAnalyzing && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm text-purple-700">AI analyzing file...</span>
                    </div>
                  </div>
                )}

                {filePreview && !isAnalyzing && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100 text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">AI Preview Analysis</span>
                      <Badge variant="outline" className={`text-xs ${getSensitivityColor(filePreview.sensitivity)}`}>
                        {filePreview.sensitivity} sensitivity
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{filePreview.summary}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="text-xs text-purple-600 font-medium">Category:</span>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                        {filePreview.category}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-purple-600 font-medium mr-2">Tags:</span>
                      {filePreview.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {filePreview.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{filePreview.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {filePreview.sensitivity === 'high' && (
                      <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-red-700 font-medium">
                            High sensitivity detected - consider encryption
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-6 floating-animation">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground mb-2">Drag & Drop Your File</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Supports all file types up to 100MB
                    {isConfigured && " • AI analysis included"}
                  </p>
                </div>
                <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/10 to-blue-500/10 hover:from-primary/20 hover:to-blue-500/20 text-primary border border-primary/30 rounded-xl transition-all duration-300 card-hover font-medium">
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-border/50 bg-muted/30 p-6">
        {selectedFile && filePreview && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Brain className="h-3 w-3 mr-1 text-purple-600" />
            AI analysis will be saved with your file
          </div>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || isAnalyzing}
              className="professional-button px-6 py-2 shadow-lg card-hover disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                  <span>Processing...</span>
                </>
              ) : isAnalyzing ? (
                <>
                  <Brain className="mr-2 h-4 w-4" /> 
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> 
                  <span>Upload to Blockchain</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload file to decentralized storage with blockchain verification</p>
          </TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};

export default FileUpload;
