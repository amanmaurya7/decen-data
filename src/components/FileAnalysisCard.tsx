import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, AlertTriangle, TrendingUp, Loader, Sparkles } from "lucide-react";
import { FileAnalysisResult, SecurityAnalysis } from '@/utils/aiAnalysisUtils';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';

interface FileAnalysisCardProps {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  viewers: string[];
  analysis?: FileAnalysisResult;
  onAnalyze?: () => void;
}

export const FileAnalysisCard: React.FC<FileAnalysisCardProps> = ({
  fileId,
  fileName,
  fileType,
  fileSize,
  viewers,
  analysis,
  onAnalyze
}) => {
  const { analyzeFile, analyzeFileSecurityRisk, isAnalyzing, isConfigured } = useAIAnalysis();
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null);
  const [isAnalyzingSecurity, setIsAnalyzingSecurity] = useState(false);

  const handleAnalyze = async () => {
    if (!isConfigured) return;
    
    try {
      await analyzeFile({ id: fileId, name: fileName, type: fileType, size: fileSize });
      onAnalyze?.();
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleSecurityAnalysis = async () => {
    if (!isConfigured) return;
    
    setIsAnalyzingSecurity(true);
    try {
      const result = await analyzeFileSecurityRisk({
        id: fileId,
        name: fileName,
        type: fileType,
        size: fileSize,
        owner: '',
        ipfsHash: '',
        uploadDate: new Date(),
        viewers,
        analysis
      });
      setSecurityAnalysis(result);
    } catch (error) {
      console.error('Security analysis failed:', error);
    } finally {
      setIsAnalyzingSecurity(false);
    }
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  if (!isConfigured) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="pt-6">
          <div className="text-center">
            <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">AI Analysis Unavailable</p>
            <p className="text-xs text-gray-400 mt-1">Configure Perplexity API to enable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="professional-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mr-3">
            <Brain className="h-4 w-4 text-white" />
          </div>
          AI Analysis
          <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-600 border-purple-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </CardTitle>
        {analysis && (
          <CardDescription>
            Intelligent insights about {fileName}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-6">
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="professional-button"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze File
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                Summary
              </h4>
              <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                {analysis.summary}
              </p>
            </div>

            {/* Category & Sensitivity */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Category:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {analysis.category}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium">Sensitivity:</span>
                <Badge variant="outline" className={`ml-2 capitalize ${getSensitivityColor(analysis.sensitivity)}`}>
                  {analysis.sensitivity}
                </Badge>
              </div>
            </div>

            {/* Tags */}
            {analysis.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {analysis.insights.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key Insights</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.insights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Security Analysis */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-500" />
                  Security Analysis
                </h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSecurityAnalysis}
                  disabled={isAnalyzingSecurity}
                >
                  {isAnalyzingSecurity ? (
                    <Loader className="h-3 w-3 animate-spin" />
                  ) : (
                    'Analyze Security'
                  )}
                </Button>
              </div>
              
              {securityAnalysis && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Level:</span>
                    <Badge variant="outline" className={`capitalize ${getRiskColor(securityAnalysis.riskLevel)}`}>
                      {securityAnalysis.riskLevel}
                    </Badge>
                  </div>
                  
                  {securityAnalysis.concerns.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-1 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
                        Security Concerns
                      </h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {securityAnalysis.concerns.map((concern, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {securityAnalysis.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-1">Security Recommendations</h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {securityAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
