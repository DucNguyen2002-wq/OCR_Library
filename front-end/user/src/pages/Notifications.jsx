import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  clearReadNotifications 
} from '../api/notifications';
import { toast } from 'react-toastify';
import '../styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [filter, pagination.currentPage]);

  const loadNotifications = async (page = pagination.currentPage) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15
      };

      if (filter === 'unread') {
        params.unread = 'true';
      }

      const response = await getNotifications(params);
      if (response.data?.success) {
        setNotifications(response.data.notifications);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalNotifications: response.data.pagination.totalNotifications
        });
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification._id);
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể đánh dấu thông báo');
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      return;
    }

    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Đã xóa thông báo');
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleClearRead = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả thông báo đã đọc?')) {
      return;
    }

    try {
      await clearReadNotifications();
      setNotifications(prev => prev.filter(n => !n.is_read));
      toast.success('Đã xóa tất cả thông báo đã đọc');
      loadNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approved':
        return { icon: 'fa-check-circle', color: '#10b981' };
      case 'rejected':
        return { icon: 'fa-times-circle', color: '#ef4444' };
      case 'resubmitted':
        return { icon: 'fa-redo', color: '#3b82f6' };
      default:
        return { icon: 'fa-bell', color: '#6b7280' };
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diffMs = now - createdAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return createdAt.toLocaleDateString('vi-VN');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <span className="current">Thông báo</span>
        </div>
        <h1>
          <i className="fas fa-bell"></i>
          Thông Báo
        </h1>
        <p className="subtitle">
          Theo dõi trạng thái sách của bạn và các cập nhật quan trọng
        </p>
      </div>

      <div className="notifications-container">
        <div className="notifications-toolbar">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => { setFilter('all'); setPagination(prev => ({ ...prev, currentPage: 1 })); }}
            >
              <i className="fas fa-inbox"></i>
              Tất cả
              <span className="tab-badge">{pagination.totalNotifications}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => { setFilter('unread'); setPagination(prev => ({ ...prev, currentPage: 1 })); }}
            >
              <i className="fas fa-envelope"></i>
              Chưa đọc
              <span className="tab-badge unread">{unreadCount}</span>
            </button>
          </div>

          <div className="toolbar-actions">
            {unreadCount > 0 && (
              <button
                className="toolbar-btn"
                onClick={handleMarkAllAsRead}
                title="Đánh dấu tất cả đã đọc"
              >
                <i className="fas fa-check-double"></i>
                Đánh dấu tất cả đã đọc
              </button>
            )}
            <button
              className="toolbar-btn danger"
              onClick={handleClearRead}
              title="Xóa thông báo đã đọc"
            >
              <i className="fas fa-trash-alt"></i>
              Xóa đã đọc
            </button>
          </div>
        </div>

        {loading ? (
          <div className="notifications-loading">
            <div className="spinner"></div>
            <p>Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="empty-icon">
              <i className="fas fa-inbox"></i>
            </div>
            <h3>Không có thông báo</h3>
            <p>
              {filter === 'unread'
                ? 'Bạn đã đọc hết tất cả thông báo'
                : 'Bạn chưa có thông báo nào'}
            </p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((notification) => {
                const { icon, color } = getNotificationIcon(notification.type);
                const bookLink = notification.type === 'rejected'
                  ? `/edit-rejected-book/${notification.book_id._id}`
                  : `/books/${notification.book_id._id}`;

                return (
                  <Link
                    key={notification._id}
                    to={bookLink}
                    className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon" style={{ color }}>
                      <i className={`fas ${icon}`}></i>
                    </div>

                    <div className="notification-content">
                      <div className="notification-main">
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                      </div>

                      <div className="notification-meta">
                        <span className="notification-time">
                          <i className="far fa-clock"></i>
                          {getTimeAgo(notification.created_at)}
                        </span>
                        {notification.book_id && (
                          <span className="book-title">
                            <i className="fas fa-book"></i>
                            {notification.book_id.title}
                          </span>
                        )}
                      </div>
                    </div>

                    {!notification.is_read && (
                      <div className="unread-indicator"></div>
                    )}

                    <button
                      className="delete-btn"
                      onClick={(e) => handleDelete(notification._id, e)}
                      title="Xóa thông báo"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </Link>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                  Trước
                </button>

                <div className="pagination-info">
                  Trang {pagination.currentPage} / {pagination.totalPages}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Tiếp
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
