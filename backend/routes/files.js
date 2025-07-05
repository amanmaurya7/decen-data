const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const File = require('../models/File');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types but log them
    console.log('Uploading file:', file.originalname, 'Type:', file.mimetype);
    cb(null, true);
  },
});

// Helper function to upload to Pinata
const uploadToPinata = async (fileBuffer, fileName, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);
    
    const pinataMetadata = {
      name: fileName,
      keyvalues: metadata
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        },
      }
    );

    return {
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error('Pinata upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload file to IPFS');
  }
};

// Helper function to get file from Pinata
const getFileFromPinata = async (ipfsHash) => {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, {
      responseType: 'stream',
    });
    return response;
  } catch (error) {
    console.error('Pinata download error:', error.response?.data || error.message);
    throw new Error('Failed to download file from IPFS');
  }
};

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { description, tags, isPublic = false } = req.body;
    
    // Parse tags if provided as string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
      }
    }

    // Upload to Pinata
    const pinataResult = await uploadToPinata(
      req.file.buffer,
      req.file.originalname,
      {
        uploadedBy: req.user.id,
        uploadDate: new Date().toISOString(),
      }
    );

    // Create file record in database
    const file = new File({
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      ipfsHash: pinataResult.ipfsHash,
      owner: req.user.id,
      description: description || '',
      tags: parsedTags,
      isPublic: isPublic === 'true' || isPublic === true,
      uploadDate: new Date(),
      pinataData: {
        pinSize: pinataResult.pinSize,
        timestamp: pinataResult.timestamp,
      },
    });

    await file.save();

    // Populate owner info for response
    await file.populate('owner', 'email name');

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        ipfsHash: file.ipfsHash,
        description: file.description,
        tags: file.tags,
        isPublic: file.isPublic,
        uploadDate: file.uploadDate,
        owner: file.owner,
        downloadUrl: `${req.protocol}://${req.get('host')}/api/files/${file._id}/download`,
        shareUrl: `${req.protocol}://${req.get('host')}/api/files/${file._id}/share`,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// Get user's files
router.get('/my-files', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, tags, sortBy = 'uploadDate', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { owner: req.user.id };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagList };
    }

    // Execute query with pagination
    const files = await File.find(query)
      .populate('owner', 'email name')
      .populate('sharedWith.user', 'email name')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await File.countDocuments(query);

    const filesWithUrls = files.map(file => ({
      id: file._id,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      ipfsHash: file.ipfsHash,
      description: file.description,
      tags: file.tags,
      isPublic: file.isPublic,
      uploadDate: file.uploadDate,
      downloadCount: file.downloadCount,
      lastAccessed: file.lastAccessed,
      owner: file.owner,
      sharedWith: file.sharedWith,
      downloadUrl: `/api/files/${file._id}/download`,
      shareUrl: `/api/files/${file._id}/share`,
      aiAnalysis: file.aiAnalysis,
      securityAnalysis: file.securityAnalysis,
    }));

    res.json({
      files: filesWithUrls,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFiles: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get shared files (files shared with the current user)
router.get('/shared-with-me', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const files = await File.find({
      'sharedWith.user': req.user.id,
      'sharedWith.status': 'accepted'
    })
      .populate('owner', 'email name')
      .populate('sharedWith.user', 'email name')
      .sort({ 'sharedWith.sharedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await File.countDocuments({
      'sharedWith.user': req.user.id,
      'sharedWith.status': 'accepted'
    });

    const filesWithUrls = files.map(file => {
      const shareInfo = file.sharedWith.find(share => 
        share.user._id.toString() === req.user.id
      );
      
      return {
        id: file._id,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        ipfsHash: file.ipfsHash,
        description: file.description,
        tags: file.tags,
        uploadDate: file.uploadDate,
        owner: file.owner,
        shareInfo: {
          sharedAt: shareInfo.sharedAt,
          permissions: shareInfo.permissions,
          expiresAt: shareInfo.expiresAt,
        },
        downloadUrl: `/api/files/${file._id}/download`,
        canDownload: shareInfo.permissions.includes('download'),
        canView: shareInfo.permissions.includes('view'),
      };
    });

    res.json({
      files: filesWithUrls,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFiles: total,
      },
    });
  } catch (error) {
    console.error('Get shared files error:', error);
    res.status(500).json({ error: 'Failed to fetch shared files' });
  }
});

// Get public files
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, tags } = req.query;
    
    const query = { isPublic: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagList };
    }

    const files = await File.find(query)
      .populate('owner', 'email name')
      .sort({ uploadDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await File.countDocuments(query);

    const filesWithUrls = files.map(file => ({
      id: file._id,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      description: file.description,
      tags: file.tags,
      uploadDate: file.uploadDate,
      downloadCount: file.downloadCount,
      owner: file.owner,
      downloadUrl: `/api/files/${file._id}/download`,
    }));

    res.json({
      files: filesWithUrls,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFiles: total,
      },
    });
  } catch (error) {
    console.error('Get public files error:', error);
    res.status(500).json({ error: 'Failed to fetch public files' });
  }
});

// Get file details
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('owner', 'email name')
      .populate('sharedWith.user', 'email name');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permissions
    const isOwner = file.owner._id.toString() === req.user.id;
    const isSharedWith = file.sharedWith.some(
      share => share.user._id.toString() === req.user.id && share.status === 'accepted'
    );

    if (!isOwner && !isSharedWith && !file.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const shareInfo = isSharedWith ? 
      file.sharedWith.find(share => share.user._id.toString() === req.user.id) : null;

    res.json({
      id: file._id,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      ipfsHash: file.ipfsHash,
      description: file.description,
      tags: file.tags,
      isPublic: file.isPublic,
      uploadDate: file.uploadDate,
      downloadCount: file.downloadCount,
      lastAccessed: file.lastAccessed,
      owner: file.owner,
      sharedWith: isOwner ? file.sharedWith : undefined,
      shareInfo: shareInfo ? {
        sharedAt: shareInfo.sharedAt,
        permissions: shareInfo.permissions,
        expiresAt: shareInfo.expiresAt,
      } : undefined,
      downloadUrl: `/api/files/${file._id}/download`,
      canEdit: isOwner,
      canDownload: isOwner || file.isPublic || (shareInfo && shareInfo.permissions.includes('download')),
      canView: isOwner || file.isPublic || (shareInfo && shareInfo.permissions.includes('view')),
      aiAnalysis: file.aiAnalysis,
      securityAnalysis: file.securityAnalysis,
    });
  } catch (error) {
    console.error('Get file details error:', error);
    res.status(500).json({ error: 'Failed to fetch file details' });
  }
});

// Download file
router.get('/:id/download', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permissions for private files
    if (!file.isPublic && req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const isOwner = file.owner.toString() === decoded.id;
        const isSharedWith = file.sharedWith.some(
          share => share.user.toString() === decoded.id && 
                   share.status === 'accepted' &&
                   share.permissions.includes('download')
        );

        if (!isOwner && !isSharedWith) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } catch (authError) {
        if (!file.isPublic) {
          return res.status(401).json({ error: 'Authentication required' });
        }
      }
    } else if (!file.isPublic) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get file from Pinata
    const fileStream = await getFileFromPinata(file.ipfsHash);

    // Update download stats
    await File.findByIdAndUpdate(req.params.id, {
      $inc: { downloadCount: 1 },
      lastAccessed: new Date(),
    });

    // Set headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', file.size);

    // Pipe file stream to response
    fileStream.data.pipe(res);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Share file with another user
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { email, permissions = ['view'], expiresIn, message } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user is owner
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only file owner can share files' });
    }

    // Find user to share with
    const User = require('../models/User');
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already shared
    const existingShare = file.sharedWith.find(
      share => share.user.toString() === targetUser._id.toString()
    );

    if (existingShare) {
      return res.status(400).json({ error: 'File already shared with this user' });
    }

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn) {
      const now = new Date();
      switch (expiresIn) {
        case '1d':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '7d':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          if (typeof expiresIn === 'number') {
            expiresAt = new Date(now.getTime() + expiresIn);
          }
      }
    }

    // Add share record
    file.sharedWith.push({
      user: targetUser._id,
      permissions,
      sharedAt: new Date(),
      expiresAt,
      status: 'pending',
      message,
    });

    await file.save();

    // TODO: Send email notification to user (optional)
    // await sendShareNotification(targetUser.email, file, req.user, message);

    res.json({
      message: 'File shared successfully',
      shareDetails: {
        sharedWith: targetUser.email,
        permissions,
        expiresAt,
        message,
      },
    });
  } catch (error) {
    console.error('File share error:', error);
    res.status(500).json({ error: 'Failed to share file' });
  }
});

// Accept/decline file share
router.patch('/:id/share/:action', auth, async (req, res) => {
  try {
    const { action } = req.params; // 'accept' or 'decline'
    
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const shareIndex = file.sharedWith.findIndex(
      share => share.user.toString() === req.user.id && share.status === 'pending'
    );

    if (shareIndex === -1) {
      return res.status(404).json({ error: 'Share invitation not found' });
    }

    file.sharedWith[shareIndex].status = action === 'accept' ? 'accepted' : 'declined';
    file.sharedWith[shareIndex].respondedAt = new Date();

    await file.save();

    res.json({
      message: `File share ${action}ed successfully`,
      status: file.sharedWith[shareIndex].status,
    });
  } catch (error) {
    console.error('Share response error:', error);
    res.status(500).json({ error: 'Failed to respond to share invitation' });
  }
});

// Update file metadata
router.patch('/:id', auth, async (req, res) => {
  try {
    const { description, tags, isPublic } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user is owner
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only file owner can update file metadata' });
    }

    // Update fields
    if (description !== undefined) file.description = description;
    if (tags !== undefined) file.tags = Array.isArray(tags) ? tags : [];
    if (isPublic !== undefined) file.isPublic = isPublic;

    await file.save();

    res.json({
      message: 'File updated successfully',
      file: {
        id: file._id,
        name: file.name,
        description: file.description,
        tags: file.tags,
        isPublic: file.isPublic,
      },
    });
  } catch (error) {
    console.error('File update error:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Delete file
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user is owner
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only file owner can delete files' });
    }

    // TODO: Optionally unpin from Pinata (requires additional API call)
    // await unpinFromPinata(file.ipfsHash);

    await File.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('owner', 'email name');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user is owner
    if (file.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only file owner can view analytics' });
    }

    const analytics = {
      fileId: file._id,
      fileName: file.name,
      uploadDate: file.uploadDate,
      downloadCount: file.downloadCount,
      lastAccessed: file.lastAccessed,
      shareCount: file.sharedWith.length,
      activeShares: file.sharedWith.filter(share => share.status === 'accepted').length,
      pendingShares: file.sharedWith.filter(share => share.status === 'pending').length,
      size: file.size,
      isPublic: file.isPublic,
      aiAnalysis: file.aiAnalysis,
      securityAnalysis: file.securityAnalysis,
    };

    res.json(analytics);
  } catch (error) {
    console.error('File analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch file analytics' });
  }
});

module.exports = router;
