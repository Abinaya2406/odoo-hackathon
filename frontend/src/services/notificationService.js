import { mockApiCall, getStoredItem, setStoredItem } from './api';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';

export const notificationService = {
  async getNotifications() {
    const data = getStoredItem('notifications', INITIAL_NOTIFICATIONS);
    return mockApiCall(data);
  },

  async markAsRead(id) {
    const notifications = getStoredItem('notifications', INITIAL_NOTIFICATIONS);
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStoredItem('notifications', updated);
    return mockApiCall(updated);
  },

  async markAllAsRead() {
    const notifications = getStoredItem('notifications', INITIAL_NOTIFICATIONS);
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setStoredItem('notifications', updated);
    return mockApiCall(updated);
  },

  async deleteNotification(id) {
    const notifications = getStoredItem('notifications', INITIAL_NOTIFICATIONS);
    const updated = notifications.filter((n) => n.id !== id);
    setStoredItem('notifications', updated);
    return mockApiCall(updated);
  }
};
