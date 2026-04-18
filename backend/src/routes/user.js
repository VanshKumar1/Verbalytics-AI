const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('statistics profile');
    
    res.status(200).json({
      success: true,
      data: {
        statistics: user.statistics,
        profile: {
          skillLevel: user.profile.skillLevel,
          goals: user.profile.goals
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
});

// Update user statistics (called after each session)
router.put('/stats', authenticate, async (req, res) => {
  try {
    const { logicScore, clarityScore, relevanceScore } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    // Update statistics
    user.statistics.totalSessions += 1;
    
    // Calculate new averages
    const currentTotal = user.statistics.totalSessions - 1;
    const newTotal = user.statistics.totalSessions;
    
    user.statistics.averageLogicScore = 
      ((user.statistics.averageLogicScore * currentTotal) + logicScore) / newTotal;
    
    user.statistics.averageClarityScore = 
      ((user.statistics.averageClarityScore * currentTotal) + clarityScore) / newTotal;
    
    user.statistics.averageRelevanceScore = 
      ((user.statistics.averageRelevanceScore * currentTotal) + relevanceScore) / newTotal;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Statistics updated successfully',
      data: {
        statistics: user.statistics
      }
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update statistics'
    });
  }
});

// Delete user account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Soft delete by deactivating account
    await User.findByIdAndUpdate(userId, { isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

// Search users (for future features like leaderboards)
router.get('/search', authenticate, async (req, res) => {
  try {
    const { query, limit = 10, skip = 0 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await User.find({
      isActive: true,
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username firstName lastName profile.avatar profile.skillLevel statistics.averageLogicScore')
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ 'statistics.averageLogicScore': -1 });

    res.status(200).json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

module.exports = router;
