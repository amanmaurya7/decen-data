export interface FileInterface {
  id: string;
  name: string;
  size: number;
  type: string;
  owner: string;
  ipfsHash: string;
  uploadDate: Date;
  viewers: string[];
  // AI Analysis fields
  analysis?: {
    summary: string;
    tags: string[];
    category: string;
    sensitivity: 'low' | 'medium' | 'high';
    insights: string[];
    recommendations: string[];
  };
  securityAnalysis?: {
    riskLevel: 'low' | 'medium' | 'high';
    concerns: string[];
    recommendations: string[];
    shouldEncrypt: boolean;
  };
  storageInsight?: {
    duplicateRisk: number;
    archiveRecommendation: boolean;
    optimalSharing: string[];
    usagePattern: string;
  };
}
