import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const FileUpload = ({ onUpload, isUploading }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();
  
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
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
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
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <Card className="glass-effect gradient-border card-hover overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blockchain-purple/20 via-blockchain-darkPurple/20 to-blockchain-teal/20 border-b border-blockchain-purple/20">
        <CardTitle className="text-white flex items-center text-xl">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blockchain-purple to-blockchain-teal flex items-center justify-center mr-3">
            <Upload className="h-4 w-4 text-white" />
          </div>
          Upload File
        </CardTitle>
        <CardDescription className="text-gray-300">
          Files are encrypted and stored on IPFS with blockchain metadata
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          className={`file-drop-area relative overflow-hidden ${isDragging ? "border-blockchain-purple bg-gradient-to-br from-blockchain-purple/20 to-blockchain-teal/10" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blockchain-purple/5 to-blockchain-teal/5 opacity-50"></div>
          <div className="relative z-10">
            {selectedFile ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blockchain-purple/20 to-blockchain-teal/20 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-blockchain-purple" />
                </div>
                <p className="text-xl font-semibold text-white">{selectedFile.name}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <span className="px-3 py-1 bg-blockchain-darkBlue/50 rounded-full">
                    {selectedFile.type || "Unknown type"}
                  </span>
                  <span className="px-3 py-1 bg-blockchain-darkBlue/50 rounded-full">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blockchain-purple/20 to-blockchain-teal/20 flex items-center justify-center mb-6 floating-animation">
                  <Upload className="h-10 w-10 text-blockchain-purple" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white mb-2">Drag & Drop Your File</p>
                  <p className="text-sm text-gray-400 mb-6">Supports all file types up to 100MB</p>
                </div>
                <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-blockchain-purple/20 to-blockchain-teal/20 hover:from-blockchain-purple/30 hover:to-blockchain-teal/30 text-blockchain-purple border border-blockchain-purple/30 rounded-xl transition-all duration-300 card-hover font-medium">
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t border-blockchain-purple/10 glass-effect p-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-gradient-to-r from-blockchain-purple to-blockchain-darkPurple hover:from-blockchain-darkPurple hover:to-blockchain-purple text-white px-6 py-2 shadow-lg card-hover disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                  <span>Processing...</span>
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
