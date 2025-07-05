import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Zap, 
  Search, 
  BarChart3, 
  Shield, 
  FileText,
  Loader,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { FileInterface } from '@/types/file';
import { AISearch } from './AISearch';
import { AIAnalytics } from './AIAnalytics';
import { AIToolbar } from './AIToolbar';

interface AIDemoProps {
  files: FileInterface[];
}

interface DemoResults {
  analysis?: {
    filesAnalyzed: number;
    insights: number;
    recommendations: number;
    securityAlerts: number;
  };
  search?: {
    query: string;
    results: string[];
    confidence: number;
  };
  security?: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    recommendations: string[];
  };
  optimization?: {
    duplicateFiles: number;
    archiveCandidates: number;
    storageEfficiency: number;
    costSavings: string;
  };
}

export const AIDemo: React.FC<AIDemoProps> = ({ files }) => {
  const { 
    analyzeFile,
    batchAnalyzeFiles,
    searchWithNaturalLanguage,
    generateOptimizationInsights,
    generateInsightReport,
    getFileAnalysis,
    isAnalyzing,
    searchResults,
    analyticsReport,
    isConfigured
  } = useAIAnalysis();

  const [currentDemo, setCurrentDemo] = useState<string>('overview');
  const [demoResults, setDemoResults] = useState<DemoResults>({});

  const sampleFiles: FileInterface[] = [
    {
      id: '1',
      name: 'quarterly-report-2024.pdf',
      size: 2400000,
      type: 'application/pdf',
      owner: '0x123...abc',
      ipfsHash: 'QmXxx...123',
      uploadDate: new Date('2024-01-15'),
      viewers: ['0x456...def', '0x789...ghi'],
      analysis: {
        summary: 'Comprehensive quarterly financial report with revenue, expenses, and growth metrics for Q4 2024.',
        tags: ['financial', 'quarterly', 'report', 'revenue', 'business'],
        category: 'document',
        sensitivity: 'high',
        insights: [
          'Contains sensitive financial information',
          'Includes revenue projections and strategic planning',
          'Multiple stakeholder access required'
        ],
        recommendations: [
          'Restrict access to authorized personnel only',
          'Consider encryption for blockchain storage',
          'Regular access audit recommended'
        ]
      }
    },
    {
      id: '2',
      name: 'team-photo-2024.jpg',
      size: 1200000,
      type: 'image/jpeg',
      owner: '0x123...abc',
      ipfsHash: 'QmYyy...456',
      uploadDate: new Date('2024-02-01'),
      viewers: ['0x456...def'],
      analysis: {
        summary: 'Team photograph from company retreat showing 12 team members in outdoor setting.',
        tags: ['team', 'photo', 'company', 'retreat', 'personnel'],
        category: 'image',
        sensitivity: 'medium',
        insights: [
          'Contains personal identifying information',
          'Suitable for internal company use',
          'Good for company culture documentation'
        ],
        recommendations: [
          'Obtain consent before external sharing',
          'Suitable for company website with permission',
          'Archive for company history records'
        ]
      }
    },
    {
      id: '3',
      name: 'smart-contract-audit.sol',
      size: 45000,
      type: 'text/plain',
      owner: '0x123...abc',
      ipfsHash: 'QmZzz...789',
      uploadDate: new Date('2024-01-20'),
      viewers: [],
      analysis: {
        summary: 'Solidity smart contract code with security audit annotations and optimization recommendations.',
        tags: ['blockchain', 'smart-contract', 'solidity', 'audit', 'security'],
        category: 'code',
        sensitivity: 'high',
        insights: [
          'Critical security audit findings included',
          'Contains proprietary blockchain logic',
          'Requires technical expertise to review'
        ],
        recommendations: [
          'Limit access to development team only',
          'Implement version control tracking',
          'Regular security review required'
        ]
      }
    }
  ];

  const demoScenarios = [
    {
      id: 'analysis',
      title: 'File Analysis Demo',
      description: 'See how AI analyzes different file types',
      icon: Brain,
      action: 'Analyze Sample Files'
    },
    {
      id: 'search',
      title: 'Natural Language Search',
      description: 'Search files using plain English',
      icon: Search,
      action: 'Try Smart Search'
    },
    {
      id: 'security',
      title: 'Security Assessment',
      description: 'AI-powered security risk evaluation',
      icon: Shield,
      action: 'Run Security Scan'
    },
    {
      id: 'optimization',
      title: 'Storage Optimization',
      description: 'Get AI recommendations for better storage',
      icon: TrendingUp,
      action: 'Generate Insights'
    }
  ];

  const runDemo = async (scenario: string) => {
    setCurrentDemo(scenario);
    
    switch (scenario) {
      case 'analysis':
        // Simulate file analysis
        setDemoResults({
          analysis: {
            filesAnalyzed: 3,
            insights: 8,
            recommendations: 6,
            securityAlerts: 2
          }
        });
        break;
        
      case 'search':
        // Simulate search results
        setDemoResults({
          search: {
            query: 'financial documents from this year',
            results: ['quarterly-report-2024.pdf'],
            confidence: 95
          }
        });
        break;
        
      case 'security':
        // Simulate security analysis
        setDemoResults({
          security: {
            highRisk: 2,
            mediumRisk: 1,
            lowRisk: 0,
            recommendations: [
              'Enable encryption for sensitive documents',
              'Review access permissions for financial files',
              'Implement regular security audits'
            ]
          }
        });
        break;
        
      case 'optimization':
        // Simulate optimization insights
        setDemoResults({
          optimization: {
            duplicateFiles: 0,
            archiveCandidates: 1,
            storageEfficiency: 87,
            costSavings: '$12.50/month'
          }
        });
        break;
    }
  };

  if (!isConfigured) {
    return (
      <Card className="border-dashed border-amber-300 bg-amber-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Brain className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-800 mb-2">AI Demo Unavailable</h3>
            <p className="text-amber-700 mb-4">
              Configure your Perplexity API key to see the AI features in action
            </p>
            <Button onClick={() => window.location.href = '/ai-settings'}>
              Configure AI Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mr-3">
              <Brain className="h-5 w-5 text-white" />
            </div>
            AI Features Interactive Demo
          </CardTitle>
          <CardDescription>
            Experience the power of AI-driven file management with real examples
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={currentDemo} onValueChange={setCurrentDemo} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoScenarios.map((scenario) => (
                  <Card key={scenario.id} className="cursor-pointer hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <scenario.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{scenario.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                          <Button 
                            size="sm" 
                            onClick={() => runDemo(scenario.id)}
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <Loader className="h-3 w-3 mr-2 animate-spin" />
                            ) : (
                              <scenario.icon className="h-3 w-3 mr-2" />
                            )}
                            {scenario.action}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Sample Files Preview */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Sample Files for Demo</h4>
                <div className="space-y-2">
                  {sampleFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-sm">{file.name}</span>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(1)} MB • {file.analysis?.category}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          file.analysis?.sensitivity === 'high' 
                            ? 'border-red-200 text-red-700'
                            : file.analysis?.sensitivity === 'medium'
                            ? 'border-yellow-200 text-yellow-700'
                            : 'border-green-200 text-green-700'
                        }
                      >
                        {file.analysis?.sensitivity} sensitivity
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">File Analysis Results</h4>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Analysis Complete
                  </Badge>
                </div>
                
                {demoResults.analysis && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{demoResults.analysis.filesAnalyzed}</div>
                      <div className="text-sm text-blue-600">Files Analyzed</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{demoResults.analysis.insights}</div>
                      <div className="text-sm text-green-600">AI Insights</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{demoResults.analysis.recommendations}</div>
                      <div className="text-sm text-purple-600">Recommendations</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{demoResults.analysis.securityAlerts}</div>
                      <div className="text-sm text-red-600">Security Alerts</div>
                    </div>
                  </div>
                )}
                
                <AIToolbar files={sampleFiles} />
              </div>
            </TabsContent>
            
            <TabsContent value="search" className="mt-6">
              <AISearch files={sampleFiles} onFileSelect={(fileId) => console.log('Selected:', fileId)} />
              
              {demoResults.search && (
                <Card className="mt-4 border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Search Results Demo
                    </h4>
                    <p className="text-sm mb-2">
                      <strong>Query:</strong> "{demoResults.search.query}"
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Results:</strong> {demoResults.search.results.join(', ')}
                    </p>
                    <p className="text-sm">
                      <strong>Confidence:</strong> {demoResults.search.confidence}%
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="insights" className="mt-6">
              <AIAnalytics files={sampleFiles} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
