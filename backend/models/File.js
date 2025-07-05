const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  // Basic file information
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  type: {
    type: String,
    required: [true, 'File type is required']
  },
  extension: {
    type: String,
    required: true
  },
  
  // IPFS and blockchain information
  ipfsHash: {
    type: String,
    required: [true, 'IPFS hash is required'],
    unique: true,
    index: true
  },
  pinataMetadata: {
    name: String,
    keyvalues: mongoose.Schema.Types.Mixed,
    ipfsPinHash: String
  },
  
  // Ownership and sharing
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'File owner is required'],
    index: true
  },
  viewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['view', 'download', 'share'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // File status and visibility
  isPublic: {
    type: Boolean,
    default: false
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  encryptionKey: {
    type: String,
    select: false // Never return this in queries
  },
  status: {
    type: String,
    enum: ['uploading', 'active', 'archived', 'deleted'],
    default: 'active',
    index: true
  },
  
  // AI Analysis data
  aiAnalysis: {
    summary: String,
    tags: [String],
    category: {
      type: String,
      enum: ['document', 'image', 'video', 'audio', 'code', 'data', 'other'],
      default: 'other'
    },
    sensitivity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    insights: [String],
    recommendations: [String],
    analyzedAt: Date,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Security analysis
  securityAnalysis: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    concerns: [String],
    recommendations: [String],
    shouldEncrypt: {
      type: Boolean,
      default: false
    },
    analyzedAt: Date
  },
  
  // File metadata and statistics
  metadata: {
    description: String,
    userTags: [String],
    customProperties: mongoose.Schema.Types.Mixed
  },
  
  stats: {
    downloads: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    lastAccessed: Date,
    lastDownloaded: Date
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  parentFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
  versions: [{
    version: Number,
    ipfsHash: String,
    uploadedAt: Date,
    changes: String
  }],
  
  // Backup and redundancy
  backupLocations: [{
    provider: String,
    location: String,
    lastBackup: Date,
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
fileSchema.index({ owner: 1, createdAt: -1 });
fileSchema.index({ 'viewers.user': 1 });
fileSchema.index({ status: 1 });
fileSchema.index({ type: 1 });
fileSchema.index({ 'aiAnalysis.category': 1 });
fileSchema.index({ 'aiAnalysis.sensitivity': 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ createdAt: -1 });

// Virtual for file URL
fileSchema.virtual('url').get(function() {
  if (this.ipfsHash) {
    return `${process.env.PINATA_GATEWAY}/ipfs/${this.ipfsHash}`;
  }
  return null;
});

// Virtual for formatted file size
fileSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for age
fileSchema.virtual('age').get(function() {
  const now = new Date();
  const uploaded = this.createdAt;
  const diffTime = Math.abs(now - uploaded);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// Virtual for shared users count
fileSchema.virtual('sharedCount').get(function() {
  return this.viewers ? this.viewers.length : 0;
});

// Pre-save middleware
fileSchema.pre('save', function(next) {
  // Update extension from file name if not set
  if (!this.extension && this.name) {
    const lastDot = this.name.lastIndexOf('.');
    if (lastDot > 0) {
      this.extension = this.name.substring(lastDot + 1).toLowerCase();
    }
  }
  
  // Set original name if not provided
  if (!this.originalName) {
    this.originalName = this.name;
  }
  
  next();
});

// Instance method to add viewer
fileSchema.methods.addViewer = function(userId, permissions = 'view', sharedBy = null) {
  // Check if user is already a viewer
  const existingViewer = this.viewers.find(v => v.user.toString() === userId.toString());
  
  if (existingViewer) {
    // Update permissions if different
    existingViewer.permissions = permissions;
    return this.save();
  }
  
  // Add new viewer
  this.viewers.push({
    user: userId,
    permissions,
    sharedAt: new Date(),
    sharedBy: sharedBy || this.owner
  });
  
  // Increment share count
  this.stats.shares += 1;
  
  return this.save();
};

// Instance method to remove viewer
fileSchema.methods.removeViewer = function(userId) {
  this.viewers = this.viewers.filter(v => v.user.toString() !== userId.toString());
  return this.save();
};

// Instance method to check if user has access
fileSchema.methods.hasAccess = function(userId) {
  // Owner always has access
  if (this.owner.toString() === userId.toString()) {
    return true;
  }
  
  // Check if user is in viewers list
  return this.viewers.some(v => v.user.toString() === userId.toString());
};

// Instance method to increment view count
fileSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  this.stats.lastAccessed = new Date();
  return this.updateOne({ 
    $inc: { 'stats.views': 1 },
    $set: { 'stats.lastAccessed': new Date() }
  });
};

// Instance method to increment download count
fileSchema.methods.incrementDownloads = function() {
  this.stats.downloads += 1;
  this.stats.lastDownloaded = new Date();
  return this.updateOne({ 
    $inc: { 'stats.downloads': 1 },
    $set: { 'stats.lastDownloaded': new Date() }
  });
};

// Static method to get files for user (owned + shared)
fileSchema.statics.getUserFiles = function(userId, options = {}) {
  const { 
    page = 1, 
    limit = 20, 
    status = 'active',
    category,
    sensitivity,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const skip = (page - 1) * limit;
  
  const query = {
    $or: [
      { owner: userId },
      { 'viewers.user': userId }
    ],
    status
  };
  
  if (category) query['aiAnalysis.category'] = category;
  if (sensitivity) query['aiAnalysis.sensitivity'] = sensitivity;
  
  const sort = { [sortBy]: sortOrder };
  
  return this.find(query)
    .populate('owner', 'name email')
    .populate('viewers.user', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get file statistics
fileSchema.statics.getFileStats = function(userId = null) {
  const matchQuery = userId ? { owner: userId } : {};
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' },
        categories: {
          $push: '$aiAnalysis.category'
        },
        sensitivityLevels: {
          $push: '$aiAnalysis.sensitivity'
        },
        avgFileSize: { $avg: '$size' },
        totalViews: { $sum: '$stats.views' },
        totalDownloads: { $sum: '$stats.downloads' }
      }
    },
    {
      $project: {
        totalFiles: 1,
        totalSize: 1,
        avgFileSize: 1,
        totalViews: 1,
        totalDownloads: 1,
        categories: {
          $reduce: {
            input: '$categories',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    { k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }
                  ]]
                }
              ]
            }
          }
        },
        sensitivityLevels: {
          $reduce: {
            input: '$sensitivityLevels',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    { k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }
                  ]]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('File', fileSchema);
