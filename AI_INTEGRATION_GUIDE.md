# AI Integration Guide - DecenData

## Overview

DecenData features a comprehensive AI integration powered by Perplexity AI, providing intelligent file analysis, security assessments, storage optimization, and natural language search capabilities.

## Features

### 🧠 File Analysis

- **Content Summarization**: Automatic generation of file summaries
- **Smart Categorization**: AI-powered file type classification
- **Tag Generation**: Automatic extraction of relevant tags
- **Sensitivity Assessment**: Privacy and security risk evaluation

### 🔍 Natural Language Search

- **Semantic Search**: Find files using natural language queries
- **Contextual Understanding**: Search based on content, not just file names
- **Smart Filtering**: AI-powered result ranking and relevance

### 🛡️ Security Analysis

- **Risk Assessment**: Evaluate security implications of file sharing
- **Privacy Recommendations**: Suggestions for optimal access control
- **Blockchain Security**: Decentralized storage security analysis

### 📊 Analytics & Insights

- **Storage Optimization**: AI recommendations for efficient storage
- **Usage Pattern Analysis**: Insights into file access patterns
- **Cost Optimization**: Suggestions for reducing IPFS and blockchain costs
- **Comprehensive Reports**: Detailed analytics dashboards

## Setup Guide

### 1. Get Perplexity API Key

1. Go to [Perplexity AI Settings](https://www.perplexity.ai/settings/api)
2. Create an account or log in
3. Generate a new API key
4. Copy the API key (starts with `pplx-`)

### 2. Configure in DecenData

#### Option A: Through the UI

1. Connect your wallet
2. Click "AI Features" in the navigation
3. Enter your Perplexity API key
4. Click "Save API Key"

#### Option B: Environment Variable

1. Create a `.env` file in your project root
2. Add: `VITE_PERPLEXITY_API_KEY=your_api_key_here`
3. Restart the development server

### 3. Enable AI Features

Once configured, you'll have access to:

- AI Search tab in the main interface
- AI Analytics dashboard
- Batch file analysis tools
- Individual file AI insights

## Usage Examples

### Basic File Analysis

```typescript
import { useAIAnalysis } from "@/hooks/useAIAnalysis";

const { analyzeFile, getFileAnalysis } = useAIAnalysis();

// Analyze a single file
const analysis = await analyzeFile({
  id: "file-id",
  name: "document.pdf",
  type: "application/pdf",
  size: 1024000,
});

// Get cached analysis
const cachedAnalysis = getFileAnalysis("file-id");
```

### Natural Language Search

```typescript
const { searchWithNaturalLanguage, searchResults } = useAIAnalysis();

// Search with natural language
await searchWithNaturalLanguage("documents from last month", files);

// Results are automatically populated in searchResults
console.log(searchResults); // Array of matching file names
```

### Batch Analysis

```typescript
const { batchAnalyzeFiles } = useAIAnalysis();

const fileData = files.map((file) => ({
  id: file.id,
  name: file.name,
  size: file.size,
  type: file.type,
}));

const results = await batchAnalyzeFiles(fileData);
```

### Security Analysis

```typescript
const { analyzeFileSecurityRisk } = useAIAnalysis();

const securityAnalysis = await analyzeFileSecurityRisk({
  id: "file-id",
  name: "sensitive-doc.pdf",
  type: "application/pdf",
  size: 1024000,
  viewers: ["0x123...", "0x456..."],
  analysis: existingAnalysis,
});
```

## API Reference

### Core Hook: `useAIAnalysis()`

#### State

- `isAnalyzing: boolean` - Whether AI operations are in progress
- `searchResults: string[]` - Results from natural language search
- `analyticsReport: string` - Generated analytics report
- `isConfigured: boolean` - Whether AI is properly configured

#### Methods

- `analyzeFile(file)` - Analyze a single file
- `batchAnalyzeFiles(files)` - Analyze multiple files
- `searchWithNaturalLanguage(query, files)` - Search files with natural language
- `analyzeFileSecurityRisk(file)` - Perform security analysis
- `generateOptimizationInsights(files)` - Generate storage optimization insights
- `generateInsightReport(files)` - Create comprehensive analytics report
- `getFileAnalysis(fileId)` - Retrieve cached analysis
- `clearAnalysisCache()` - Clear all cached data

### Utility Functions

```typescript
import {
  isPerplexityConfigured,
  setPerplexityApiKey,
  getPerplexityApiKey,
} from "@/utils/aiAnalysisUtils";

// Check if AI is configured
const isConfigured = isPerplexityConfigured();

// Set API key programmatically
setPerplexityApiKey("pplx-your-key");

// Get current API key
const apiKey = getPerplexityApiKey();
```

## Components

### AISearch

Smart search interface with natural language processing.

```tsx
<AISearch
  files={files}
  onFileSelect={(fileId) => console.log("Selected:", fileId)}
/>
```

### AIAnalytics

Comprehensive analytics dashboard with insights and reports.

```tsx
<AIAnalytics files={files} />
```

### AIToolbar

Quick access toolbar for batch AI operations.

```tsx
<AIToolbar
  files={files}
  onAnalysisComplete={() => console.log("Analysis done")}
/>
```

### FileAnalysisCard

Individual file analysis display component.

```tsx
<FileAnalysisCard
  fileId={file.id}
  fileName={file.name}
  fileType={file.type}
  fileSize={file.size}
  viewers={file.viewers}
  analysis={file.analysis}
  onAnalyze={() => handleAnalyze()}
/>
```

## Best Practices

### Performance

- Use batch analysis for multiple files to avoid rate limits
- Cache results are automatically managed
- Implement debouncing for search queries

### Security

- API keys are stored securely in localStorage
- Never expose API keys in client-side code
- Use environment variables for server-side operations

### User Experience

- Show loading states during AI operations
- Provide fallback content when AI is not configured
- Use progressive enhancement for AI features

## Troubleshooting

### Common Issues

**"AI Analysis Unavailable"**

- Check if Perplexity API key is configured
- Verify API key is valid and has sufficient credits
- Ensure network connectivity

**Analysis Taking Too Long**

- Large files may take longer to analyze
- Batch operations are rate-limited for API protection
- Check Perplexity API status if issues persist

**Search Not Working**

- Ensure files have been analyzed first
- Check if natural language query is specific enough
- Verify search components are properly integrated

### Error Handling

The AI integration includes comprehensive error handling:

- Network errors are caught and displayed to users
- API rate limits are handled gracefully
- Fallback content is shown when AI features are unavailable

## Advanced Configuration

### Custom Models

You can specify different Perplexity models by modifying the `callPerplexityAPI` function:

```typescript
const response = await callPerplexityAPI(
  prompt,
  "llama-3.1-sonar-large-128k-online"
);
```

### Rate Limiting

Batch operations include built-in rate limiting:

- 3 files analyzed simultaneously
- 1-second delay between batches
- Automatic retry on rate limit errors

### Analytics Customization

The analytics system can be extended with custom metrics:

```typescript
// Add custom analysis metrics to FileAnalysisResult interface
interface CustomFileAnalysis extends FileAnalysisResult {
  customMetric: string;
  specialInsight: boolean;
}
```

## Contributing

To contribute to the AI integration:

1. Follow the existing patterns in `src/utils/aiAnalysisUtils.ts`
2. Add proper TypeScript types for new features
3. Include error handling and loading states
4. Update this documentation with new features
5. Test with various file types and sizes

## Support

For AI integration support:

- Check the browser console for detailed error messages
- Verify API key configuration in AI Settings
- Review Perplexity API documentation for limits and usage
- Open an issue with reproduction steps if problems persist
