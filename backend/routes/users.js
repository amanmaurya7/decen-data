const express = require('express');
const User = require('../models/User');
const File = require('../models/File');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get file statistics
    const fileStats = await File.aggregate([
      { $match: { owner: user._id } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          totalDownloads: { $sum: '$downloadCount' },
          publicFiles: {
            $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
          },
        }
      }
    ]);

    // Get files shared with user
    const sharedWithUser = await File.countDocuments({
      'sharedWith.user': user._id,
      'sharedWith.status': 'accepted'
    });

    // Get files shared by user
    const sharedByUser = await File.countDocuments({
      owner: user._id,
      'sharedWith.0': { $exists: true }
    });

    // Get recent files
    const recentFiles = await File.find({ owner: user._id })
      .sort({ uploadDate: -1 })
      .limit(5)
      .select('name size mimeType uploadDate downloadCount');

    // Get file type distribution
    const fileTypes = await File.aggregate([
      { $match: { owner: user._id } },
      {
        $group: {
          _id: '$mimeType',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const stats = fileStats[0] || {
      totalFiles: 0,
      totalSize: 0,
      totalDownloads: 0,
      publicFiles: 0,
    };

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        joinedAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      stats: {
        ...stats,
        sharedWithUser,
        sharedByUser,
        averageFileSize: stats.totalFiles > 0 ? stats.totalSize / stats.totalFiles : 0,
        storageUsedMB: (stats.totalSize / (1024 * 1024)).toFixed(2),
      },
      recentFiles,
      fileTypes,
      aiFeatures: {
        enabled: user.aiPreferences?.enableAutoAnalysis !== false,
        hasApiKey: !!user.aiPreferences?.perplexityApiKey,
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get user activity log
router.get('/activity', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Get recent file uploads
    const uploads = await File.find({ owner: req.user.id })
      .sort({ uploadDate: -1 })
      .limit(limit)
      .select('name uploadDate size mimeType')
      .lean();

    // Get recent file shares (files shared by user)
    const shares = await File.find({
      owner: req.user.id,
      'sharedWith.sharedAt': { $exists: true }
    })
      .sort({ 'sharedWith.sharedAt': -1 })
      .limit(limit)
      .populate('sharedWith.user', 'email name')
      .select('name sharedWith')
      .lean();

    // Get recent downloads (approximate - we don't have detailed download logs)
    const downloads = await File.find({
      $or: [
        { owner: req.user.id },
        { 'sharedWith.user': req.user.id, 'sharedWith.status': 'accepted' }
      ],
      lastAccessed: { $exists: true }
    })
      .sort({ lastAccessed: -1 })
      .limit(limit)
      .select('name lastAccessed downloadCount owner')
      .populate('owner', 'email name')
      .lean();

    // Combine and format activities
    const activities = [];

    uploads.forEach(file => {
      activities.push({
        type: 'upload',
        timestamp: file.uploadDate,
        description: `Uploaded ${file.name}`,
        fileId: file._id,
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.mimeType,
      });
    });

    shares.forEach(file => {
      file.sharedWith.forEach(share => {
        if (share.sharedAt) {
          activities.push({
            type: 'share',
            timestamp: share.sharedAt,
            description: `Shared ${file.name} with ${share.user.email}`,
            fileId: file._id,
            fileName: file.name,
            sharedWith: share.user.email,
          });
        }
      });
    });

    downloads.forEach(file => {
      if (file.lastAccessed) {
        activities.push({
          type: 'download',
          timestamp: file.lastAccessed,
          description: `Downloaded ${file.name}`,
          fileId: file._id,
          fileName: file.name,
          downloadCount: file.downloadCount,
          owner: file.owner.email,
        });
      }
    });

    // Sort by timestamp and paginate
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const startIndex = (page - 1) * limit;
    const paginatedActivities = activities.slice(startIndex, startIndex + limit);

    res.json({
      activities: paginatedActivities,
      pagination: {
        currentPage: parseInt(page),
        totalActivities: activities.length,
        hasNextPage: startIndex + limit < activities.length,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Get user's storage analytics
router.get('/storage-analytics', auth, async (req, res) => {
  try {
    // Get monthly storage usage
    const monthlyUsage = await File.aggregate([
      { $match: { owner: req.user.id } },
      {
        $group: {
          _id: {
            year: { $year: '$uploadDate' },
            month: { $month: '$uploadDate' }
          },
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          avgFileSize: { $avg: '$size' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 } // Last 12 months
    ]);

    // Get file type distribution with sizes
    const fileTypeDistribution = await File.aggregate([
      { $match: { owner: req.user.id } },
      {
        $group: {
          _id: '$mimeType',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
          avgSize: { $avg: '$size' },
          maxSize: { $max: '$size' },
          minSize: { $min: '$size' }
        }
      },
      { $sort: { totalSize: -1 } }
    ]);

    // Get largest files
    const largestFiles = await File.find({ owner: req.user.id })
      .sort({ size: -1 })
      .limit(10)
      .select('name size mimeType uploadDate downloadCount');

    // Get storage growth over time
    const storageGrowth = await File.aggregate([
      { $match: { owner: req.user.id } },
      { $sort: { uploadDate: 1 } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$uploadDate'
            }
          },
          cumulativeSize: { $sum: '$size' },
          filesAdded: { $sum: 1 }
        }
      }
    ]);

    // Calculate total storage and costs (estimated)
    const totalStats = await File.aggregate([
      { $match: { owner: req.user.id } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$size' },
          totalFiles: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ]);

    const stats = totalStats[0] || { totalSize: 0, totalFiles: 0, totalDownloads: 0 };
    
    // Estimate IPFS costs (rough calculation)
    const estimatedMonthlyCost = (stats.totalSize / (1024 * 1024 * 1024)) * 0.10; // $0.10 per GB/month
    const estimatedBandwidthCost = (stats.totalDownloads * stats.totalSize / stats.totalFiles / (1024 * 1024 * 1024)) * 0.05; // $0.05 per GB bandwidth

    res.json({
      overview: {
        totalSize: stats.totalSize,
        totalSizeMB: (stats.totalSize / (1024 * 1024)).toFixed(2),
        totalFiles: stats.totalFiles,
        totalDownloads: stats.totalDownloads,
        averageFileSize: stats.totalFiles > 0 ? stats.totalSize / stats.totalFiles : 0,
        estimatedMonthlyCost: estimatedMonthlyCost.toFixed(2),
        estimatedBandwidthCost: estimatedBandwidthCost.toFixed(2),
      },
      monthlyUsage: monthlyUsage.map(month => ({
        period: `${month._id.year}-${month._id.month.toString().padStart(2, '0')}`,
        files: month.totalFiles,
        sizeMB: (month.totalSize / (1024 * 1024)).toFixed(2),
        avgFileSizeMB: (month.avgFileSize / (1024 * 1024)).toFixed(2),
      })),
      fileTypes: fileTypeDistribution.map(type => ({
        mimeType: type._id || 'unknown',
        count: type.count,
        totalSizeMB: (type.totalSize / (1024 * 1024)).toFixed(2),
        avgSizeMB: (type.avgSize / (1024 * 1024)).toFixed(2),
        percentage: ((type.totalSize / stats.totalSize) * 100).toFixed(1),
      })),
      largestFiles: largestFiles.map(file => ({
        id: file._id,
        name: file.name,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        mimeType: file.mimeType,
        uploadDate: file.uploadDate,
        downloadCount: file.downloadCount,
      })),
      storageGrowth: storageGrowth.map(entry => ({
        period: entry._id,
        cumulativeSizeMB: (entry.cumulativeSize / (1024 * 1024)).toFixed(2),
        filesAdded: entry.filesAdded,
      })),
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Storage analytics error:', error);
    res.status(500).json({ error: 'Failed to generate storage analytics' });
  }
});

// Get user's sharing statistics
router.get('/sharing-stats', auth, async (req, res) => {
  try {
    // Files shared by user
    const filesSharedByUser = await File.find({
      owner: req.user.id,
      'sharedWith.0': { $exists: true }
    })
      .populate('sharedWith.user', 'email name')
      .select('name sharedWith uploadDate downloadCount');

    // Files shared with user
    const filesSharedWithUser = await File.find({
      'sharedWith.user': req.user.id
    })
      .populate('owner', 'email name')
      .populate('sharedWith.user', 'email name')
      .select('name owner sharedWith uploadDate');

    // Sharing partners (users you share with most)
    const sharingPartners = await File.aggregate([
      { $match: { owner: req.user.id, 'sharedWith.0': { $exists: true } } },
      { $unwind: '$sharedWith' },
      { $match: { 'sharedWith.status': 'accepted' } },
      {
        $group: {
          _id: '$sharedWith.user',
          filesShared: { $sum: 1 },
          lastSharedAt: { $max: '$sharedWith.sharedAt' }
        }
      },
      { $sort: { filesShared: -1 } },
      { $limit: 10 }
    ]);

    // Populate user details for sharing partners
    await User.populate(sharingPartners, {
      path: '_id',
      select: 'email name'
    });

    // Calculate sharing metrics
    const totalFilesSharedByUser = filesSharedByUser.length;
    const totalFilesSharedWithUser = filesSharedWithUser.filter(file => 
      file.sharedWith.some(share => 
        share.user._id.toString() === req.user.id && share.status === 'accepted'
      )
    ).length;

    const totalUniqueShareRecipients = new Set(
      filesSharedByUser.flatMap(file => 
        file.sharedWith.map(share => share.user._id.toString())
      )
    ).size;

    const pendingShares = filesSharedWithUser.filter(file =>
      file.sharedWith.some(share => 
        share.user._id.toString() === req.user.id && share.status === 'pending'
      )
    ).length;

    res.json({
      overview: {
        filesSharedByUser: totalFilesSharedByUser,
        filesSharedWithUser: totalFilesSharedWithUser,
        uniqueShareRecipients: totalUniqueShareRecipients,
        pendingShareInvitations: pendingShares,
      },
      filesSharedByUser: filesSharedByUser.map(file => ({
        id: file._id,
        name: file.name,
        uploadDate: file.uploadDate,
        downloadCount: file.downloadCount,
        sharedWith: file.sharedWith.map(share => ({
          user: share.user,
          permissions: share.permissions,
          sharedAt: share.sharedAt,
          status: share.status,
        }))
      })),
      filesSharedWithUser: filesSharedWithUser.map(file => {
        const userShare = file.sharedWith.find(share => 
          share.user._id.toString() === req.user.id
        );
        return {
          id: file._id,
          name: file.name,
          owner: file.owner,
          shareInfo: {
            permissions: userShare.permissions,
            sharedAt: userShare.sharedAt,
            status: userShare.status,
            expiresAt: userShare.expiresAt,
          }
        };
      }),
      topSharingPartners: sharingPartners.map(partner => ({
        user: partner._id,
        filesShared: partner.filesShared,
        lastSharedAt: partner.lastSharedAt,
      })),
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Sharing stats error:', error);
    res.status(500).json({ error: 'Failed to generate sharing statistics' });
  }
});

// Search users (for sharing files)
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = q.trim();
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } }, // Exclude current user
        {
          $or: [
            { email: { $regex: searchTerm, $options: 'i' } },
            { name: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    })
      .select('email name createdAt')
      .limit(parseInt(limit))
      .sort({ name: 1, email: 1 });

    res.json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        joinedAt: user.createdAt,
      })),
      searchTerm,
      totalResults: users.length,
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user notifications (share invitations, etc.)
router.get('/notifications', auth, async (req, res) => {
  try {
    // Get pending share invitations
    const pendingShares = await File.find({
      'sharedWith.user': req.user.id,
      'sharedWith.status': 'pending'
    })
      .populate('owner', 'email name')
      .select('name owner sharedWith uploadDate description');

    const notifications = pendingShares.map(file => {
      const shareInfo = file.sharedWith.find(share => 
        share.user.toString() === req.user.id && share.status === 'pending'
      );
      
      return {
        id: `share_${file._id}_${shareInfo.sharedAt.getTime()}`,
        type: 'file_share_invitation',
        title: `${file.owner.name || file.owner.email} shared a file with you`,
        description: `"${file.name}" has been shared with you`,
        fileId: file._id,
        fileName: file.name,
        fileDescription: file.description,
        from: file.owner,
        permissions: shareInfo.permissions,
        sharedAt: shareInfo.sharedAt,
        expiresAt: shareInfo.expiresAt,
        message: shareInfo.message,
        isRead: false,
        createdAt: shareInfo.sharedAt,
      };
    });

    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
      totalCount: notifications.length,
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
