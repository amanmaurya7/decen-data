import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Search, 
  BarChart3, 
  Shield, 
  Loader,
  Sparkles,
  Settings
} from "lucide-react";
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { FileInterface } from '@/types/file';
import { useToast } from "@/hooks/use-toast";

interface AIToolbarProps {
  files: FileInterface[];
  selectedFiles?: string[];
  onAnalysisComplete?: () => void;
}

export const AIToolbar: React.FC<AIToolbarProps> = ({ 
  files, 
  selectedFiles = [], 
  onAnalysisComplete 
}) => {
  const { 
    batchAnalyzeFiles, 
    generateOptimizationInsights,
    generateInsightReport,
    isAnalyzing, 
    isConfigured 
  } = useAIAnalysis();
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleBatchAnalysis = async () => {
    if (!isConfigured || files.length === 0) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your Perplexity API key first",
        variant: "destructive"
      });
      return;
    }

    setActiveAction('analyze');
    try {
      const fileData = files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      await batchAnalyzeFiles(fileData);
      onAnalysisComplete?.();
      
      toast({
        title: "Batch Analysis Complete",
        description: `Successfully analyzed ${files.length} files`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleOptimizationInsights = async () => {
    if (!isConfigured || files.length === 0) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your Perplexity API key first",
        variant: "destructive"
      });
      return;
    }

    setActiveAction('optimize');
    try {
      const fileData = files.map(file => ({
        ...file,
        analysis: file.analysis
      }));
      
      await generateOptimizationInsights(fileData);
      
      toast({
        title: "Optimization Complete",
        description: "Storage optimization insights generated",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to generate optimization insights",
        variant: "destructive"
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleGenerateReport = async () => {
    if (!isConfigured || files.length === 0) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your Perplexity API key first",
        variant: "destructive"
      });
      return;
    }

    setActiveAction('report');
    try {
      const fileData = files.map(file => ({
        ...file,
        analysis: file.analysis
      }));
      
      await generateInsightReport(fileData);
      
      toast({
        title: "Report Generated",
        description: "Comprehensive analytics report is ready",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate analytics report",
        variant: "destructive"
      });
    } finally {
      setActiveAction(null);
    }
  };

  const analyzedFiles = files.filter(file => file.analysis);
  const analysisProgress = files.length > 0 ? (analyzedFiles.length / files.length) * 100 : 0;

  if (!isConfigured) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">AI Features Unavailable</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/ai-settings'}>
          <Settings className="h-4 w-4 mr-2" />
          Configure AI
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 p-4 rounded-lg border border-purple-200/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mr-3">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-600">
                {analyzedFiles.length} of {files.length} files analyzed ({Math.round(analysisProgress)}%)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className="bg-green-500/20 text-green-700 border-green-500/30"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Active
            </Badge>
            {files.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {files.length} files
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchAnalysis}
            disabled={isAnalyzing || files.length === 0}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            {activeAction === 'analyze' ? (
              <>
                <Loader className="h-3 w-3 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-3 w-3 mr-2" />
                Analyze All
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimizationInsights}
            disabled={isAnalyzing || analyzedFiles.length === 0}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {activeAction === 'optimize' ? (
              <>
                <Loader className="h-3 w-3 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-2" />
                Optimize
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            disabled={isAnalyzing || analyzedFiles.length === 0}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            {activeAction === 'report' ? (
              <>
                <Loader className="h-3 w-3 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BarChart3 className="h-3 w-3 mr-2" />
                Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
