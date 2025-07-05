const express = require('express');
const axios = require('axios');
const File = require('../models/File');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to call Perplexity AI
const callPerplexityAI = async (prompt, model = 'llama-3.1-sonar-small-128k-online') => {
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant specializing in file analysis, security assessment, and data management. Provide concise, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity AI error:', error.response?.data || error.message);
    throw new Error('AI analysis failed');
  }
};

// Analyze file content/metadata
router.post('/analyze/:fileId', auth, async (req, res) => {
  try {
    const { analysisType = 'general' } = req.body;
    
    const file = await File.findById(req.params.fileId)
      .populate('owner', 'email name');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permissions
    const isOwner = file.owner._id.toString() === req.user.id;
    const isSharedWith = file.sharedWith.some(
      share => share.user.toString() === req.user.id && share.status === 'accepted'
    );

    if (!isOwner && !isSharedWith && !file.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build analysis prompt based on file metadata
    let prompt = '';
    switch (analysisType) {
      case 'security':
        prompt = `Analyze the security implications of this file:
        - File name: ${file.name}
        - File type: ${file.mimeType}
        - File size: ${file.size} bytes
        - Description: ${file.description || 'No description'}
        - Tags: ${file.tags.join(', ') || 'No tags'}
        - Is public: ${file.isPublic}
        - Shared with ${file.sharedWith.length} users
        
        Provide security recommendations, potential risks, and best practices for sharing this type of file.`;
        break;
        
      case 'optimization':
        prompt = `Analyze storage optimization for this file:
        - File name: ${file.name}
        - File type: ${file.mimeType}
        - File size: ${file.size} bytes
        - Download count: ${file.downloadCount}
        - Last accessed: ${file.lastAccessed || 'Never'}
        - Tags: ${file.tags.join(', ') || 'No tags'}
        
        Suggest optimization strategies for storage costs, access patterns, and organization.`;
        break;
        
      case 'categorization':
        prompt = `Suggest better categorization for this file:
        - File name: ${file.name}
        - File type: ${file.mimeType}
        - Current description: ${file.description || 'No description'}
        - Current tags: ${file.tags.join(', ') || 'No tags'}
        
        Suggest improved tags, categories, and a better description to make this file more discoverable.`;
        break;
        
      default: // general
        prompt = `Provide a comprehensive analysis of this file:
        - File name: ${file.name}
        - File type: ${file.mimeType}
        - File size: ${file.size} bytes
        - Description: ${file.description || 'No description'}
        - Tags: ${file.tags.join(', ') || 'No tags'}
        - Upload date: ${file.uploadDate}
        - Download count: ${file.downloadCount}
        - Sharing status: ${file.isPublic ? 'Public' : 'Private'}, shared with ${file.sharedWith.length} users
        
        Provide insights about content type, potential uses, organization suggestions, and sharing recommendations.`;
    }

    // Get AI analysis
    const analysis = await callPerplexityAI(prompt);

    // Store analysis in database
    if (!file.aiAnalysis) {
      file.aiAnalysis = {};
    }
    
    file.aiAnalysis[analysisType] = {
      content: analysis,
      timestamp: new Date(),
      model: 'llama-3.1-sonar-small-128k-online',
    };

    // For security analysis, also update the securityAnalysis field
    if (analysisType === 'security') {
      file.securityAnalysis = {
        riskLevel: extractRiskLevel(analysis),
        recommendations: extractRecommendations(analysis),
        analyzedAt: new Date(),
        summary: analysis.substring(0, 200) + '...',
      };
    }

    await file.save();

    res.json({
      message: 'Analysis completed successfully',
      analysis: {
        type: analysisType,
        content: analysis,
        timestamp: new Date(),
        fileId: file._id,
        fileName: file.name,
      },
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze file' });
  }
});

// Search files using natural language
router.post('/search', auth, async (req, res) => {
  try {
    const { query, includePublic = false, limit = 20 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build database query to get user's files and optionally public files
    const dbQuery = {
      $or: [
        { owner: req.user.id },
        { 'sharedWith.user': req.user.id, 'sharedWith.status': 'accepted' },
      ]
    };

    if (includePublic) {
      dbQuery.$or.push({ isPublic: true });
    }

    // Get all accessible files
    const files = await File.find(dbQuery)
      .populate('owner', 'email name')
      .limit(100); // Limit to prevent too much data being sent to AI

    if (files.length === 0) {
      return res.json({
        results: [],
        message: 'No files found in your library',
        searchQuery: query,
      });
    }

    // Prepare file information for AI analysis
    const fileInfos = files.map(file => ({
      id: file._id.toString(),
      name: file.name,
      description: file.description,
      tags: file.tags,
      mimeType: file.mimeType,
      size: file.size,
      uploadDate: file.uploadDate,
      owner: file.owner.email,
      isPublic: file.isPublic,
    }));

    // Create AI prompt for semantic search
    const searchPrompt = `
    User search query: "${query}"
    
    Available files:
    ${fileInfos.map((file, index) => 
      `${index + 1}. ID: ${file.id}
      Name: ${file.name}
      Description: ${file.description || 'No description'}
      Tags: ${file.tags.join(', ') || 'No tags'}
      Type: ${file.mimeType}
      Size: ${file.size} bytes
      Owner: ${file.owner}
      `
    ).join('\n')}
    
    Based on the user's search query, rank and return the most relevant files. 
    Consider file names, descriptions, tags, file types, and semantic meaning.
    Return a JSON array with file IDs in order of relevance, along with a brief explanation of why each file matches.
    
    Format: [{"id": "file_id", "relevance": 0.9, "reason": "explanation"}]
    Return maximum ${limit} results.
    `;

    const aiResponse = await callPerplexityAI(searchPrompt);

    // Parse AI response
    let rankedResults = [];
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        rankedResults = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: simple text search
        const searchTerm = query.toLowerCase();
        rankedResults = files
          .filter(file => 
            file.name.toLowerCase().includes(searchTerm) ||
            file.description.toLowerCase().includes(searchTerm) ||
            file.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          )
          .slice(0, limit)
          .map(file => ({
            id: file._id.toString(),
            relevance: 0.7,
            reason: 'Text match in file metadata'
          }));
      }
    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      // Fallback to simple search
      const searchTerm = query.toLowerCase();
      rankedResults = files
        .filter(file => 
          file.name.toLowerCase().includes(searchTerm) ||
          file.description.toLowerCase().includes(searchTerm) ||
          file.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
        .slice(0, limit)
        .map(file => ({
          id: file._id.toString(),
          relevance: 0.5,
          reason: 'Fallback text search match'
        }));
    }

    // Get full file details for ranked results
    const results = rankedResults.map(result => {
      const file = files.find(f => f._id.toString() === result.id);
      if (!file) return null;

      const isOwner = file.owner._id.toString() === req.user.id;
      const shareInfo = file.sharedWith.find(
        share => share.user.toString() === req.user.id && share.status === 'accepted'
      );

      return {
        id: file._id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        description: file.description,
        tags: file.tags,
        uploadDate: file.uploadDate,
        owner: file.owner,
        isPublic: file.isPublic,
        downloadUrl: `/api/files/${file._id}/download`,
        relevance: result.relevance,
        matchReason: result.reason,
        canDownload: isOwner || file.isPublic || (shareInfo && shareInfo.permissions.includes('download')),
        canView: isOwner || file.isPublic || (shareInfo && shareInfo.permissions.includes('view')),
      };
    }).filter(Boolean);

    res.json({
      results,
      searchQuery: query,
      totalResults: results.length,
      searchType: 'AI-powered semantic search',
      includePublic,
    });
  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ error: error.message || 'Failed to perform AI search' });
  }
});

// Get AI insights for user's file library
router.get('/insights', auth, async (req, res) => {
  try {
    // Get user's files with statistics
    const files = await File.find({ owner: req.user.id });
    
    if (files.length === 0) {
      return res.json({
        insights: [],
        message: 'No files found. Upload some files to get AI insights.',
        stats: {
          totalFiles: 0,
          totalSize: 0,
          totalDownloads: 0,
        }
      });
    }

    // Calculate basic statistics
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      totalDownloads: files.reduce((sum, file) => sum + file.downloadCount, 0),
      publicFiles: files.filter(file => file.isPublic).length,
      sharedFiles: files.filter(file => file.sharedWith.length > 0).length,
      fileTypes: {},
      averageFileSize: 0,
      oldestFile: null,
      newestFile: null,
      mostDownloaded: null,
    };

    // Analyze file types
    files.forEach(file => {
      const type = file.mimeType || 'unknown';
      stats.fileTypes[type] = (stats.fileTypes[type] || 0) + 1;
    });

    stats.averageFileSize = stats.totalSize / stats.totalFiles;
    stats.oldestFile = files.reduce((oldest, file) => 
      !oldest || file.uploadDate < oldest.uploadDate ? file : oldest
    );
    stats.newestFile = files.reduce((newest, file) => 
      !newest || file.uploadDate > newest.uploadDate ? file : newest
    );
    stats.mostDownloaded = files.reduce((most, file) => 
      !most || file.downloadCount > most.downloadCount ? file : most
    );

    // Generate AI insights prompt
    const insightsPrompt = `
    Analyze this user's file library and provide actionable insights:
    
    Statistics:
    - Total files: ${stats.totalFiles}
    - Total size: ${(stats.totalSize / (1024 * 1024)).toFixed(2)} MB
    - Total downloads: ${stats.totalDownloads}
    - Public files: ${stats.publicFiles}
    - Files shared with others: ${stats.sharedFiles}
    - Average file size: ${(stats.averageFileSize / (1024 * 1024)).toFixed(2)} MB
    
    File types distribution:
    ${Object.entries(stats.fileTypes).map(([type, count]) => `- ${type}: ${count} files`).join('\n')}
    
    Top files:
    - Oldest: ${stats.oldestFile.name} (${stats.oldestFile.uploadDate})
    - Newest: ${stats.newestFile.name} (${stats.newestFile.uploadDate})
    - Most downloaded: ${stats.mostDownloaded.name} (${stats.mostDownloaded.downloadCount} downloads)
    
    Provide insights on:
    1. Storage optimization opportunities
    2. Organization suggestions
    3. Security recommendations
    4. Usage pattern analysis
    5. Cost optimization tips
    
    Format as a JSON array of insight objects with: {"category": "string", "title": "string", "description": "string", "priority": "high|medium|low", "actionable": true/false}
    `;

    const aiResponse = await callPerplexityAI(insightsPrompt);

    // Parse AI insights
    let insights = [];
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback insights based on statistics
        insights = generateFallbackInsights(stats);
      }
    } catch (parseError) {
      console.error('AI insights parsing error:', parseError);
      insights = generateFallbackInsights(stats);
    }

    res.json({
      insights,
      stats,
      analyzedAt: new Date(),
      totalFilesAnalyzed: files.length,
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate insights' });
  }
});

// Update user's AI preferences
router.patch('/preferences', auth, async (req, res) => {
  try {
    const { 
      perplexityApiKey, 
      enableAutoAnalysis = true,
      analysisTypes = ['general', 'security'],
      searchModel = 'llama-3.1-sonar-small-128k-online',
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update AI preferences
    if (!user.aiPreferences) {
      user.aiPreferences = {};
    }

    if (perplexityApiKey !== undefined) {
      user.aiPreferences.perplexityApiKey = perplexityApiKey;
    }
    if (enableAutoAnalysis !== undefined) {
      user.aiPreferences.enableAutoAnalysis = enableAutoAnalysis;
    }
    if (analysisTypes !== undefined) {
      user.aiPreferences.analysisTypes = analysisTypes;
    }
    if (searchModel !== undefined) {
      user.aiPreferences.searchModel = searchModel;
    }

    await user.save();

    res.json({
      message: 'AI preferences updated successfully',
      preferences: {
        enableAutoAnalysis: user.aiPreferences.enableAutoAnalysis,
        analysisTypes: user.aiPreferences.analysisTypes,
        searchModel: user.aiPreferences.searchModel,
        hasApiKey: !!user.aiPreferences.perplexityApiKey,
      },
    });
  } catch (error) {
    console.error('AI preferences update error:', error);
    res.status(500).json({ error: 'Failed to update AI preferences' });
  }
});

// Get user's AI preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const preferences = user.aiPreferences || {};

    res.json({
      preferences: {
        enableAutoAnalysis: preferences.enableAutoAnalysis !== false,
        analysisTypes: preferences.analysisTypes || ['general', 'security'],
        searchModel: preferences.searchModel || 'llama-3.1-sonar-small-128k-online',
        hasApiKey: !!preferences.perplexityApiKey,
      },
    });
  } catch (error) {
    console.error('AI preferences fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch AI preferences' });
  }
});

// Helper functions
function extractRiskLevel(analysis) {
  const analysisLower = analysis.toLowerCase();
  if (analysisLower.includes('high risk') || analysisLower.includes('critical')) {
    return 'high';
  } else if (analysisLower.includes('medium risk') || analysisLower.includes('moderate')) {
    return 'medium';
  }
  return 'low';
}

function extractRecommendations(analysis) {
  // Simple extraction of recommendations (can be improved with better NLP)
  const lines = analysis.split('\n');
  const recommendations = lines.filter(line => 
    line.toLowerCase().includes('recommend') || 
    line.toLowerCase().includes('suggest') ||
    line.toLowerCase().includes('should') ||
    line.includes('•') ||
    line.includes('-')
  );
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

function generateFallbackInsights(stats) {
  const insights = [];

  if (stats.totalSize > 100 * 1024 * 1024) { // > 100MB
    insights.push({
      category: 'storage',
      title: 'Large Storage Usage',
      description: `Your library uses ${(stats.totalSize / (1024 * 1024)).toFixed(2)} MB. Consider archiving old files or compressing large files.`,
      priority: 'medium',
      actionable: true,
    });
  }

  if (stats.publicFiles / stats.totalFiles > 0.5) {
    insights.push({
      category: 'security',
      title: 'Many Public Files',
      description: `${stats.publicFiles} of your files are public. Review if all of them need to be publicly accessible.`,
      priority: 'high',
      actionable: true,
    });
  }

  if (stats.totalDownloads < stats.totalFiles) {
    insights.push({
      category: 'usage',
      title: 'Low File Engagement',
      description: 'Many files have few downloads. Consider improving file descriptions and tags for better discoverability.',
      priority: 'low',
      actionable: true,
    });
  }

  return insights;
}

module.exports = router;
