import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Brain, Loader, Sparkles } from "lucide-react";
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { FileInterface } from '@/types/file';

interface AISearchProps {
  files: FileInterface[];
  onFileSelect: (fileId: string) => void;
}

export const AISearch: React.FC<AISearchProps> = ({ files, onFileSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { searchWithNaturalLanguage, searchResults, isConfigured } = useAIAnalysis();

  const handleSearch = async () => {
    if (!searchQuery.trim() || !isConfigured) return;
    
    setIsSearching(true);
    try {
      await searchWithNaturalLanguage(searchQuery, files);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getMatchingFiles = () => {
    return files.filter(file => searchResults.includes(file.name));
  };

  const searchExamples = [
    "documents from last month",
    "images smaller than 5MB",
    "files shared with multiple people",
    "sensitive documents",
    "code files",
    "presentations about blockchain"
  ];

  return (
    <Card className="professional-card">
      <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20 border-b border-border/50">
        <CardTitle className="text-foreground flex items-center text-xl">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3">
            <Brain className="h-4 w-4 text-white" />
          </div>
          AI Search
          <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-600 border-purple-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Search your files using natural language queries
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {!isConfigured ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Configure your Perplexity API key to enable AI search
            </p>
          </div>
        ) : (
          <>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Try: 'Find all documents from last week' or 'Show me images'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="professional-input pl-10"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="professional-button px-6"
              >
                {isSearching ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Searching
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {searchExamples.map((example, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors"
                    onClick={() => setSearchQuery(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Search Results</h3>
                  <Badge variant="secondary">
                    {searchResults.length} file{searchResults.length !== 1 ? 's' : ''} found
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {getMatchingFiles().map((file) => (
                    <div
                      key={file.id}
                      className="p-4 border border-border/50 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                      onClick={() => onFileSelect(file.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {file.name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>{file.type}</span>
                            <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                            <span>{file.uploadDate.toLocaleDateString()}</span>
                          </div>
                          {file.analysis && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {file.analysis.summary}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {file.analysis.tags.slice(0, 3).map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {file.analysis.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{file.analysis.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {file.analysis && (
                            <Badge
                              variant={
                                file.analysis.sensitivity === 'high' ? 'destructive' :
                                file.analysis.sensitivity === 'medium' ? 'secondary' : 'default'
                              }
                              className="text-xs"
                            >
                              {file.analysis.sensitivity} sensitivity
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {file.analysis?.category || 'uncategorized'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No files found matching your query. Try a different search term.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};