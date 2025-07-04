import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  BarChart3, 
  Shield, 
  Zap, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Users,
  HardDrive,
  Loader
} from "lucide-react";
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { StorageInsight, SecurityAnalysis } from '@/utils/aiAnalysisUtils';
import { FileInterface } from '@/types/file';

interface AIAnalyticsProps {
  files: FileInterface[];
}

export const AIAnalytics: React.FC<AIAnalyticsProps> = ({ files }) => {
  const { 
    analyzeFile,
    batchAnalyzeFiles,
    generateOptimizationInsights,
    generateInsightReport,
    getFileAnalysis,
    isAnalyzing,
    analyticsReport,
    isConfigured
  } = useAIAnalysis();

  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [optimizationInsights, setOptimizationInsights] = useState<StorageInsight[]>([]);
  const [securityRisks, setSecurityRisks] = useState<SecurityAnalysis[]>([]);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<Date | null>(null);

  // Calculate analysis statistics
  const analyzedFiles = files.filter(file => getFileAnalysis(file.id));
  const analysisCompleteness = files.length > 0 ? (analyzedFiles.length / files.length) * 100 : 0;

  // Categorize files by AI analysis
  const fileCategories = analyzedFiles.reduce((acc, file) => {
    const analysis = getFileAnalysis(file.id);
    if (analysis?.category) {
      acc[analysis.category] = (acc[analysis.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Security risk assessment
  const securityStats = analyzedFiles.reduce((acc, file) => {
    const analysis = getFileAnalysis(file.id);
    if (analysis?.sensitivity) {
      acc[analysis.sensitivity] = (acc[analysis.sensitivity] || 0) + 1;
    }
    return acc;
  }, { low: 0, medium: 0, high: 0 });

  // Storage insights
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const averageFileSize = files.length > 0 ? totalSize / files.length : 0;

  const handleBatchAnalysis = async () => {
    if (!isConfigured || files.length === 0) return;
    
    try {
      const fileData = files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      const results = await batchAnalyzeFiles(fileData);
      setAnalysisProgress(100);
      setLastAnalysisDate(new Date());
    } catch (error) {
      console.error('Batch analysis failed:', error);
    }
  };

  const handleGenerateInsights = async () => {
    if (!isConfigured || analyzedFiles.length === 0) return;
    
    try {
      const insights = await generateOptimizationInsights(analyzedFiles as any);
      setOptimizationInsights(insights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!isConfigured || analyzedFiles.length === 0) return;
    
    try {
      await generateInsightReport(analyzedFiles as any);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  useEffect(() => {
    setAnalysisProgress(analysisCompleteness);
  }, [analysisCompleteness]);

  if (!isConfigured) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">AI Analytics Not Available</h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure your Perplexity API key to enable advanced analytics
        </p>
        <Button variant="outline" onClick={() => window.location.href = '/ai-settings'}>
          Configure AI Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Analysis Progress</p>
                <p className="text-2xl font-bold">{Math.round(analysisProgress)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={analysisProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Files Analyzed</p>
                <p className="text-2xl font-bold">{analyzedFiles.length}</p>
                <p className="text-xs text-muted-foreground">of {files.length} total</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk Files</p>
                <p className="text-2xl font-bold text-red-500">{securityStats.high}</p>
                <p className="text-xs text-muted-foreground">require attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{(totalSize / (1024 * 1024 * 1024)).toFixed(1)}GB</p>
                <p className="text-xs text-muted-foreground">across {files.length} files</p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Categories */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                  File Categories
                </CardTitle>
                <CardDescription>
                  Distribution of file types in your storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(fileCategories).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize text-sm font-medium">{category}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{count}</Badge>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / analyzedFiles.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  AI-powered file management actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleBatchAnalysis}
                  disabled={isAnalyzing || files.length === 0}
                  className="w-full professional-button"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Files...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze All Files
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleGenerateInsights}
                  disabled={isAnalyzing || analyzedFiles.length === 0}
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleGenerateReport}
                  disabled={isAnalyzing || analyzedFiles.length === 0}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {lastAnalysisDate && (
            <Card className="professional-card">
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  Last analysis completed: {lastAnalysisDate.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-500" />
                Security Risk Assessment
              </CardTitle>
              <CardDescription>
                AI analysis of file security and privacy risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{securityStats.low}</div>
                  <div className="text-sm text-green-600">Low Risk</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{securityStats.medium}</div>
                  <div className="text-sm text-yellow-600">Medium Risk</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{securityStats.high}</div>
                  <div className="text-sm text-red-600">High Risk</div>
                </div>
              </div>

              {securityStats.high > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-medium text-red-700">
                      {securityStats.high} files require immediate attention
                    </span>
                  </div>
                  <p className="text-sm text-red-600 mt-2">
                    Consider encrypting or restricting access to high-risk files.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                Storage Optimization
              </CardTitle>
              <CardDescription>
                AI recommendations for improving storage efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationInsights.length > 0 ? (
                <div className="space-y-4">
                  {optimizationInsights.map((insight, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Optimization Opportunity</span>
                        <Badge variant={insight.archiveRecommendation ? "destructive" : "default"}>
                          {insight.archiveRecommendation ? "Archive" : "Optimize"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Usage Pattern: {insight.usagePattern}
                      </p>
                      <div className="text-sm">
                        <strong>Recommendations:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {insight.optimalSharing.map((rec: string, i: number) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Generate optimization insights to see recommendations here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Analytics Report
              </CardTitle>
              <CardDescription>
                Comprehensive AI-generated insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsReport ? (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{analyticsReport}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    No analytics report generated yet
                  </p>
                  <Button onClick={handleGenerateReport} disabled={isAnalyzing || analyzedFiles.length === 0}>
                    Generate Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
