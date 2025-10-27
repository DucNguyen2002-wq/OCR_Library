import api from './client';

export const getNotifications = async (params) => {
  return await api.get('/notifications', { params });
};

export const getUnreadCount = async () => {
  return await api.get('/notifications/unread-count');
};

export const markAsRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
  return await api.patch('/notifications/read-all');
};

export const deleteNotification = async (id) => {
  return await api.delete(`/notifications/${id}`);
};

export const clearReadNotifications = async () => {
  return await api.delete('/notifications/clear-read');
};
