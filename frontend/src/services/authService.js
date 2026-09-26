import { mockApiCall, getStoredItem, setStoredItem } from './api';
import { MOCK_USER } from '../data/users';

export const authService = {
  async login(email, password) {
    // Simulate validation check
    const user = getStoredItem('user', MOCK_USER);
    const updatedUser = { ...user, email: email || user.email };
    setStoredItem('user', updatedUser);
    setStoredItem('isAuthenticated', true);
    return mockApiCall({ success: true, user: updatedUser, token: 'mock-jwt-token-xyz' });
  },

  async register(userData) {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.fullName || 'New Admin',
      email: userData.email,
      phone: userData.phone || '',
      role: 'Inventory Manager',
      department: 'Operations',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      defaultWarehouseId: 'wh-1'
    };
    setStoredItem('user', newUser);
    setStoredItem('isAuthenticated', true);
    return mockApiCall({ success: true, user: newUser, token: 'mock-jwt-token-xyz' });
  },

  async forgotPassword(email) {
    setStoredItem('resetEmail', email);
    return mockApiCall({ success: true, message: 'OTP sent to your email.' });
  },

  async verifyOtp(otp) {
    if (otp === '123456' || otp.length === 6) {
      return mockApiCall({ success: true, message: 'OTP verified successfully.' });
    }
    return mockApiCall({ success: true, message: 'OTP verified successfully.' });
  },

  async resetPassword(newPassword) {
    return mockApiCall({ success: true, message: 'Password reset successfully. Please log in.' });
  },

  async logout() {
    setStoredItem('isAuthenticated', false);
    return mockApiCall({ success: true });
  },

  getCurrentUser() {
    const isAuth = getStoredItem('isAuthenticated', true); // Default logged in for demo
    if (!isAuth) return null;
    return getStoredItem('user', MOCK_USER);
  }
};
