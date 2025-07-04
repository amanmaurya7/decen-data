interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface FileAnalysisResult {
  summary: string;
  tags: string[];
  category: string;
  sensitivity: 'low' | 'medium' | 'high';
  insights: string[];
  recommendations: string[];
}

export interface SecurityAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  concerns: string[];
  recommendations: string[];
  shouldEncrypt: boolean;
}

export interface StorageInsight {
  duplicateRisk: number;
  archiveRecommendation: boolean;
  optimalSharing: string[];
  usagePattern: string;
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Helper function to get API key from environment or local storage
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || localStorage.getItem('perplexity_api_key');
  if (!apiKey) {
    throw new Error('Perplexity API key not found. Please set it in environment or local storage.');
  }
  return apiKey;
};

// Generic function to call Perplexity API
const callPerplexityAPI = async (prompt: string, model: string = 'llama-3.1-sonar-small-128k-online'): Promise<string> => {
  try {
    const apiKey = getApiKey();
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    throw error;
  }
};

// Analyze file content and metadata
export const analyzeFileContent = async (
  fileName: string, 
  fileType: string, 
  fileSize: number,
  fileContent?: string
): Promise<FileAnalysisResult> => {
  const prompt = `
Analyze this file and provide insights in JSON format:

File Details:
- Name: ${fileName}
- Type: ${fileType}
- Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB
${fileContent ? `- Content Preview: ${fileContent.substring(0, 1000)}...` : ''}

Please respond with a JSON object containing:
{
  "summary": "Brief 2-3 sentence summary of the file",
  "tags": ["relevant", "tags", "for", "categorization"],
  "category": "document/image/video/code/data/other",
  "sensitivity": "low/medium/high",
  "insights": ["key insights about the file"],
  "recommendations": ["suggestions for handling this file"]
}

Focus on practical insights for decentralized file storage management.
`;

  try {
    const response = await callPerplexityAPI(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing file content:', error);
    // Return fallback analysis
    return {
      summary: `${fileType} file: ${fileName}`,
      tags: [fileType, 'unanalyzed'],
      category: 'other',
      sensitivity: 'medium',
      insights: ['Analysis unavailable'],
      recommendations: ['Standard encryption recommended']
    };
  }
};

// Analyze security implications for file sharing
export const analyzeFileSecurity = async (
  fileName: string, 
  fileType: string, 
  viewers: string[],
  fileAnalysis?: FileAnalysisResult
): Promise<SecurityAnalysis> => {
  const prompt = `
Analyze the security implications of this file sharing scenario:

File: ${fileName} (${fileType})
Current viewers: ${viewers.length} addresses
File sensitivity: ${fileAnalysis?.sensitivity || 'unknown'}
File category: ${fileAnalysis?.category || 'unknown'}

Provide security analysis in JSON format:
{
  "riskLevel": "low/medium/high",
  "concerns": ["potential security concerns"],
  "recommendations": ["security recommendations"],
  "shouldEncrypt": true/false
}

Consider blockchain transparency, IPFS permanence, and decentralized storage security.
`;

  try {
    const response = await callPerplexityAPI(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing file security:', error);
    return {
      riskLevel: 'medium',
      concerns: ['Analysis unavailable'],
      recommendations: ['Use standard encryption', 'Limit sharing to trusted addresses'],
      shouldEncrypt: true
    };
  }
};

// Generate storage optimization insights
export const generateStorageInsights = async (
  files: Array<{
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    viewers: string[];
  }>
): Promise<StorageInsight[]> => {
  const prompt = `
Analyze this file storage collection for optimization opportunities:

Files (${files.length} total):
${files.map(f => `- ${f.name} (${f.type}, ${(f.size / (1024 * 1024)).toFixed(2)}MB, ${f.viewers.length} viewers, uploaded ${f.uploadDate.toDateString()})`).join('\n')}

For each file, provide optimization insights in JSON format:
[
  {
    "duplicateRisk": 0-100,
    "archiveRecommendation": true/false,
    "optimalSharing": ["suggestions for who should have access"],
    "usagePattern": "description of usage pattern"
  }
]

Focus on IPFS storage costs, blockchain efficiency, and access patterns.
`;

  try {
    const response = await callPerplexityAPI(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating storage insights:', error);
    return files.map(() => ({
      duplicateRisk: 0,
      archiveRecommendation: false,
      optimalSharing: ['Current sharing is optimal'],
      usagePattern: 'Unknown pattern'
    }));
  }
};

// Natural language file search
export const searchFilesNaturally = async (
  query: string,
  files: Array<{
    name: string;
    type: string;
    analysis?: FileAnalysisResult;
  }>
): Promise<string[]> => {
  const prompt = `
Search through these files based on natural language query: "${query}"

Available files:
${files.map(f => `- ${f.name} (${f.type}) - ${f.analysis?.summary || 'No analysis'} - Tags: ${f.analysis?.tags?.join(', ') || 'none'}`).join('\n')}

Return a JSON array of file names that match the query, ordered by relevance:
["file1.pdf", "file2.doc", ...]

If no files match, return an empty array.
`;

  try {
    const response = await callPerplexityAPI(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error in natural language search:', error);
    return [];
  }
};

// Generate analytics report
export const generateAnalyticsReport = async (
  files: Array<{
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    viewers: string[];
    analysis?: FileAnalysisResult;
  }>
): Promise<string> => {
  const prompt = `
Generate a comprehensive analytics report for this decentralized file storage system:

Storage Statistics:
- Total files: ${files.length}
- Total size: ${(files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024 * 1024)).toFixed(2)} GB
- Average file size: ${(files.reduce((sum, f) => sum + f.size, 0) / files.length / (1024 * 1024)).toFixed(2)} MB
- Most common types: ${[...new Set(files.map(f => f.type))].slice(0, 5).join(', ')}

File Categories:
${[...new Set(files.map(f => f.analysis?.category).filter(Boolean))].map(cat => 
  `- ${cat}: ${files.filter(f => f.analysis?.category === cat).length} files`
).join('\n')}

Sharing Patterns:
- Average viewers per file: ${(files.reduce((sum, f) => sum + f.viewers.length, 0) / files.length).toFixed(1)}
- Most shared file: ${files.sort((a, b) => b.viewers.length - a.viewers.length)[0]?.name}

Provide insights on:
1. Storage optimization opportunities
2. Security recommendations
3. Sharing pattern analysis
4. Trends and predictions
5. Cost optimization suggestions for IPFS/blockchain usage

Write in a professional, actionable format suitable for a dashboard.
`;

  try {
    return await callPerplexityAPI(prompt);
  } catch (error) {
    console.error('Error generating analytics report:', error);
    return 'Analytics report generation failed. Please check your API configuration.';
  }
};

// Check if API key is configured
export const isPerplexityConfigured = (): boolean => {
  try {
    getApiKey();
    return true;
  } catch {
    return false;
  }
};

// Set API key in local storage
export const setPerplexityApiKey = (apiKey: string): void => {
  localStorage.setItem('perplexity_api_key', apiKey);
};

// Get API key from local storage
export const getPerplexityApiKey = (): string | null => {
  return localStorage.getItem('perplexity_api_key');
};