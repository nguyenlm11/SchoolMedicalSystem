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
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error("Không tìm thấy token hoặc refresh token");
      }

      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken
      });

      // Lưu token mới vào localStorage nếu làm mới thành công
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      console.error("Lỗi khi làm mới token:", error);
      return {
        success: false,
        message: error.message || "Không thể làm mới token",
        data: null,
        errors: []
      };
    }
  },
  // gửi yêu cầu để nhận otp
  async requestOtp(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: email
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi gửi OTP',
        data: null,
        errors: []
      };
    }
  },

  // xác thực otp email
  async verifyOtp(email, otp) {
    try {
      const response = await apiClient.post('/auth/forgot-password/otp', {
        email: email,
        otp: otp
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi xác nhận OTP',
        data: null,
        errors: []
      };
    }
  },

  // đặt lại mật khẩu
  async resetPassword(email, otp, newPassword, confirmPassword) {
    try {
      const response = await apiClient.post('/auth/forgot-password/reset', {
        email: email,
        otp: otp,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi đặt lại mật khẩu',
        data: null,
        errors: []
      };
    }
  }
};

export default authApi;
