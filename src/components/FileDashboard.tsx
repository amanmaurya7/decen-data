import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  Share, 
  Eye, 
  Trash2, 
  Search, 
  Filter,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Loader2
} from 'lucide-react';
import { useFiles, useAuth } from '@/hooks/useApi';

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
  if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
  if (mimeType.startsWith('text/') || mimeType.includes('document')) return <FileText className="h-4 w-4" />;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileDashboard = () => {
  const { user, logout } = useAuth();
  const { 
    files, 
    isLoading, 
    error, 
    uploadFile, 
    getMyFiles, 
    getSharedFiles, 
    getPublicFiles,
    deleteFile 
  } = useFiles();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [publicFiles, setPublicFiles] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadFiles();
      loadSharedFiles();
      loadPublicFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    try {
      await getMyFiles({ search: searchQuery });
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const loadSharedFiles = async () => {
    try {
      const response = await getSharedFiles();
      setSharedFiles(response.files);
    } catch (error) {
      console.error('Failed to load shared files:', error);
    }
  };

  const loadPublicFiles = async () => {
    try {
      const response = await getPublicFiles();
      setPublicFiles(response.files);
    } catch (error) {
      console.error('Failed to load public files:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      await uploadFile(file, {
        description: `Uploaded ${file.name}`,
        tags: [],
        isPublic: false
      });
      
      setUploadProgress(100);
      await loadFiles();
      
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(fileId);
        await loadFiles();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleDownload = (fileId: string, fileName: string) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://decen-data.onrender.com';
    const downloadUrl = `${backendUrl}/api/files/${fileId}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = async () => {
    await getMyFiles({ search: searchQuery });
  };

  if (!user) {
    return null; // Auth component will handle this
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DecenData Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Files
            </CardTitle>
            <CardDescription>
              Upload your files to decentralized storage with AI-powered analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  multiple
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-lg font-medium text-gray-700">
                    Click to upload files
                  </p>
                  <p className="text-sm text-gray-500">
                    Or drag and drop files here
                  </p>
                </label>
              </div>
              
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Tabs */}
        <Tabs defaultValue="my-files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-files">My Files ({files.length})</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me ({sharedFiles.length})</TabsTrigger>
            <TabsTrigger value="public">Public Files ({publicFiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="my-files">
            <Card>
              <CardHeader>
                <CardTitle>Your Files</CardTitle>
                <CardDescription>
                  Files you've uploaded to DecenData
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-red-600 text-center py-4">
                    Error: {error}
                  </div>
                )}
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading your files...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No files uploaded yet</p>
                    <p className="text-sm">Upload your first file to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {files.map((file) => (
                      <Card key={file.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.mimeType)}
                              <span className="font-medium text-sm truncate">
                                {file.name}
                              </span>
                            </div>
                            <Badge variant={file.isPublic ? "default" : "secondary"}>
                              {file.isPublic ? "Public" : "Private"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>Size: {formatFileSize(file.size)}</p>
                            <p>Downloads: {file.downloadCount}</p>
                            <p>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</p>
                          </div>

                          {file.tags && file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {file.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-1 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(file.id, file.name)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared">
            <Card>
              <CardHeader>
                <CardTitle>Shared with Me</CardTitle>
                <CardDescription>
                  Files other users have shared with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sharedFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Share className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No files shared with you yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sharedFiles.map((file) => (
                      <Card key={file.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.mimeType)}
                              <span className="font-medium text-sm truncate">
                                {file.name}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>Size: {formatFileSize(file.size)}</p>
                            <p>Owner: {file.owner.email}</p>
                            <p>Shared: {new Date(file.shareInfo.sharedAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex gap-1 mt-3">
                            {file.canDownload && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(file.id, file.name)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                            {file.canView && (
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="public">
            <Card>
              <CardHeader>
                <CardTitle>Public Files</CardTitle>
                <CardDescription>
                  Publicly accessible files from the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                {publicFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No public files available</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {publicFiles.map((file) => (
                      <Card key={file.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.mimeType)}
                              <span className="font-medium text-sm truncate">
                                {file.name}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>Size: {formatFileSize(file.size)}</p>
                            <p>Owner: {file.owner.email}</p>
                            <p>Downloads: {file.downloadCount}</p>
                          </div>

                          <div className="flex gap-1 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(file.id, file.name)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FileDashboard;
