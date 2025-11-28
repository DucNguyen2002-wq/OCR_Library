const Notification = require('../models/Notification');

/**
 * Create a new notification
 */
const createNotification = async (userId, bookId, type, title, message) => {
  try {
    const notification = new Notification({
      user_id: userId,
      book_id: bookId,
      type,
      title,
      message
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get user's notifications with pagination
 * GET /api/notifications
 */
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unread === 'true';

    const query = { user_id: userId };
    if (unreadOnly) {
      query.is_read = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('book_id', 'title image_url approval_status')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user_id: userId, is_read: false })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotifications: totalCount,
        notificationsPerPage: limit
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải thông báo'
    });
  }
};

/**
 * Get unread notifications count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({
      user_id: userId,
      is_read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải số lượng thông báo chưa đọc'
    });
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: id,
      user_id: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông báo'
      });
    }

    notification.is_read = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Đã đánh dấu là đã đọc',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể cập nhật thông báo'
    });
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể cập nhật thông báo'
    });
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user_id: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông báo'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa thông báo'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể xóa thông báo'
    });
  }
};

/**
 * Delete all read notifications
 * DELETE /api/notifications/clear-read
 */
const clearReadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.deleteMany({
      user_id: userId,
      is_read: true
    });

    res.json({
      success: true,
      message: 'Đã xóa tất cả thông báo đã đọc',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing read notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể xóa thông báo'
    });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications
};
