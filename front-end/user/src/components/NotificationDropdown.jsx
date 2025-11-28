import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from '../api/notifications';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.data?.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications({ limit: 10 });
      if (response.data?.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
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
        console.error('Error marking notification as read:', error);
      }
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
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

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>
              <i className="fas fa-bell"></i>
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read"
                onClick={handleMarkAllAsRead}
                title="Đánh dấu tất cả đã đọc"
              >
                <i className="fas fa-check-double"></i>
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner"></div>
                <p>Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <i className="fas fa-inbox"></i>
                <p>Không có thông báo</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const { icon, color } = getNotificationIcon(notification.type);
                const bookLink = notification.type === 'rejected'
                  ? `/edit-rejected-book/${notification.book_id._id}`
                  : `/books/${notification.book_id._id}`;

                return (
                  <Link
                    key={notification._id}
                    to={bookLink}
                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon" style={{ color }}>
                      <i className={`fas ${icon}`}></i>
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        <i className="far fa-clock"></i>
                        {getTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    {!notification.is_read && (
                      <div className="unread-indicator"></div>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <Link to="/notifications" onClick={() => setIsOpen(false)}>
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
