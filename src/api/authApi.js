import apiClient from '../config/config';

const authApi = {
  // Đăng nhập
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Có lỗi xảy ra khi kết nối đến server. Vui lòng thử lại.',
        data: null,
        errors: []
      };
    }
  },

  // Đăng xuất
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Có lỗi xảy ra khi đăng xuất.',
        data: null,
        errors: []
      };
    }
  },
};

export default authApi; 