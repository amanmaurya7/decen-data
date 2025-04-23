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
    <Card className="bg-card border border-blockchain-purple/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blockchain-darkBlue to-blockchain-darkPurple/50">
        <CardTitle className="text-white flex items-center">
          <Upload className="mr-2" size={20} /> Upload File
        </CardTitle>
        <CardDescription className="text-gray-300">
          Files are encrypted and stored on decentralized storage
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          className={`file-drop-area ${isDragging ? "border-blockchain-purple bg-blockchain-purple/10" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="text-center">
              <p className="text-lg font-medium text-white mb-2">{selectedFile.name}</p>
              <p className="text-sm text-gray-400 mb-1">
                {selectedFile.type || "Unknown type"}
              </p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <>
              <p className="text-lg font-medium text-center mb-2">Drag & Drop File</p>
              <p className="text-sm text-gray-400 text-center mb-4">or</p>
              <label className="cursor-pointer bg-blockchain-purple/10 hover:bg-blockchain-purple/20 text-blockchain-purple border border-blockchain-purple/30 px-4 py-2 rounded-md transition-colors">
                Browse Files
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t border-gray-800 bg-card/50 p-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-blockchain-purple hover:bg-blockchain-darkPurple text-white"
            >
              {isUploading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload to Blockchain
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload file to decentralized storage</p>
          </TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};

export default FileUpload;
