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
        message: response.error,
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
        message: response.error,
        data: null,
        errors: []
      };
    }
  },

  // Làm mới token
  async refreshToken() {
    try {
      const accessToken = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        return {
          success: false,
          message: response.error,
          data: null,
          errors: []
        };
      }

      const response = await apiClient.post('/auth/refresh-token', {
        accessToken,
        refreshToken
      });

      // Lưu token mới vào localStorage nếu làm mới thành công
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: response.error,
        data: null,
        errors: []
      };
    }
  }
};

export default authApi;
