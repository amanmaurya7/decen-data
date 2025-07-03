import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  analyzeFileContent, 
  analyzeFileSecurity, 
  generateStorageInsights,
  searchFilesNaturally,
  generateAnalyticsReport,
  isPerplexityConfigured,
  FileAnalysisResult,
  SecurityAnalysis,
  StorageInsight
} from '@/utils/aiAnalysisUtils';

interface FileWithAnalysis {
  id: string;
  name: string;
  size: number;
  type: string;
  owner: string;
  ipfsHash: string;
  uploadDate: Date;
  viewers: string[];
  analysis?: FileAnalysisResult;
  securityAnalysis?: SecurityAnalysis;
  storageInsight?: StorageInsight;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCache, setAnalysisCache] = useState<Map<string, FileAnalysisResult>>(new Map());
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [analyticsReport, setAnalyticsReport] = useState<string>('');
  const { toast } = useToast();

  // Analyze a single file
  const analyzeFile = useCallback(async (
    file: { id: string; name: string; size: number; type: string }
  ): Promise<FileAnalysisResult | null> => {
    if (!isPerplexityConfigured()) {
      toast({
        title: "AI Analysis Unavailable",
        description: "Please configure your Perplexity API key first",
        variant: "destructive"
      });
      return null;
    }

    // Check cache first
    const cached = analysisCache.get(file.id);
    if (cached) {
      return cached;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeFileContent(file.name, file.type, file.size);
      
      // Update cache
      setAnalysisCache(prev => new Map(prev.set(file.id, analysis)));
      
      toast({
        title: "File Analyzed",
        description: `AI analysis completed for ${file.name}`,
        variant: "default"
      });
      
      return analysis;
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze file",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisCache, toast]);

  // Analyze security for file sharing
  const analyzeFileSecurityRisk = useCallback(async (
    file: FileWithAnalysis
  ): Promise<SecurityAnalysis | null> => {
    if (!isPerplexityConfigured()) {
      toast({
        title: "Security Analysis Unavailable",
        description: "Please configure your Perplexity API key first",
        variant: "destructive"
      });
      return null;
    }

    setIsAnalyzing(true);
    try {
      const securityAnalysis = await analyzeFileSecurity(
        file.name, 
        file.type, 
        file.viewers,
        file.analysis
      );
      
      toast({
        title: "Security Analysis Complete",
        description: `Risk level: ${securityAnalysis.riskLevel}`,
        variant: securityAnalysis.riskLevel === 'high' ? "destructive" : "default"
      });
      
      return securityAnalysis;
    } catch (error: any) {
      toast({
        title: "Security Analysis Failed",
        description: error.message || "Failed to analyze security",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Batch analyze multiple files
  const batchAnalyzeFiles = useCallback(async (
    files: Array<{ id: string; name: string; size: number; type: string }>
  ): Promise<Map<string, FileAnalysisResult>> => {
    if (!isPerplexityConfigured()) {
      toast({
        title: "AI Analysis Unavailable",
        description: "Please configure your Perplexity API key first",
        variant: "destructive"
      });
      return new Map();
    }

    setIsAnalyzing(true);
    const newAnalyses = new Map<string, FileAnalysisResult>();
    
    try {
      toast({
        title: "Analyzing Files",
        description: `Starting analysis of ${files.length} files...`,
        variant: "default"
      });

      // Analyze files in batches to avoid rate limits
      const batchSize = 3;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (file) => {
          // Skip if already cached
          if (analysisCache.has(file.id)) {
            newAnalyses.set(file.id, analysisCache.get(file.id)!);
            return;
          }
          
          try {
            const analysis = await analyzeFileContent(file.name, file.type, file.size);
            newAnalyses.set(file.id, analysis);
          } catch (error) {
            console.error(`Failed to analyze ${file.name}:`, error);
          }
        });
        
        await Promise.all(batchPromises);
        
        // Small delay between batches
        if (i + batchSize < files.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Update cache
      setAnalysisCache(prev => new Map([...prev, ...newAnalyses]));
      
      toast({
        title: "Batch Analysis Complete",
        description: `Analyzed ${newAnalyses.size} files successfully`,
        variant: "default"
      });
      
    } catch (error: any) {
      toast({
        title: "Batch Analysis Failed",
        description: error.message || "Failed to analyze files",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
    
    return newAnalyses;
  }, [analysisCache, toast]);

  // Generate storage optimization insights
  const generateOptimizationInsights = useCallback(async (
    files: FileWithAnalysis[]
  ): Promise<StorageInsight[]> => {
    if (!isPerplexityConfigured()) {
      toast({
        title: "Optimization Analysis Unavailable",
        description: "Please configure your Perplexity API key first",
        variant: "destructive"
      });
      return [];
    }

    setIsAnalyzing(true);
    try {
      const insights = await generateStorageInsights(files);
      
      toast({
        title: "Optimization Analysis Complete",
        description: "Storage optimization insights generated",
        variant: "default"
      });
      
      return insights;
    } catch (error: any) {
      toast({
        title: "Optimization Analysis Failed",
        description: error.message || "Failed to generate insights",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Natural language search
  const searchWithNaturalLanguage = useCallback(async (
    query: string,
    files: FileWithAnalysis[]
  ): Promise<string[]> => {
    if (!isPerplexityConfigured()) {
      toast({
        title: "AI Search Unavailable",
        description: "Please configure your Perplexity API key first",
        variant: "destructive"
      });
      return [];
    }

    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsAnalyzing(true);
    try {
      const results = await searchFilesNaturally(query, files);
      setSearchResults(results);
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} matching files`,
        variant: "default"
      });
      
      return results;
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search files",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Generate comprehensive analytics report
  const generateInsightReport = useCallback(async (
    files: FileWithAnalysis[]
  ): Promise<string> => {
    if (!isPerplexityConfigured()) {
      toast({
        title: "Analytics Unavailable",
        description: "Please configure your Perplexity API key first",
        variant: "destructive"
      });
      return '';
    }

    setIsAnalyzing(true);
    try {
      const report = await generateAnalyticsReport(files);
      setAnalyticsReport(report);
      
      toast({
        title: "Analytics Report Generated",
        description: "Comprehensive insights ready",
        variant: "default"
      });
      
      return report;
    } catch (error: any) {
      toast({
        title: "Analytics Generation Failed",
        description: error.message || "Failed to generate report",
        variant: "destructive"
      });
      return '';
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Get analysis for a file from cache
  const getFileAnalysis = useCallback((fileId: string): FileAnalysisResult | null => {
    return analysisCache.get(fileId) || null;
  }, [analysisCache]);

  // Clear analysis cache
  const clearAnalysisCache = useCallback(() => {
    setAnalysisCache(new Map());
    setSearchResults([]);
    setAnalyticsReport('');
    toast({
      title: "Cache Cleared",
      description: "All AI analysis data has been cleared",
      variant: "default"
    });
  }, [toast]);

  return {
    // State
    isAnalyzing,
    searchResults,
    analyticsReport,
    
    // Actions
    analyzeFile,
    analyzeFileSecurityRisk,
    batchAnalyzeFiles,
    generateOptimizationInsights,
    searchWithNaturalLanguage,
    generateInsightReport,
    getFileAnalysis,
    clearAnalysisCache,
    
    // Utilities
    isConfigured: isPerplexityConfigured()
  };
};