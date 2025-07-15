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
  },

  // Lấy thông tin profile của user
  async getUserProfile(staffId) {
    try {
      if (!staffId) throw new Error('Staff ID is required');
      const response = await apiClient.get(`/users/staff/${staffId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy thông tin profile',
        data: null,
        errors: []
      };
    }
  },

  // Lấy thông tin profile của parent
  async getParentProfile(parentId) {
    try {
      if (!parentId) throw new Error('Parent ID is required');
      const response = await apiClient.get(`/users/parents/${parentId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy thông tin profile phụ huynh',
        data: null,
        errors: []
      };
    }
  },

  // Lấy thông tin profile của student
  async getStudentProfile(studentId) {
    try {
      if (!studentId) throw new Error('Student ID is required');
      const response = await apiClient.get(`/users/students/${studentId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy thông tin profile học sinh',
        data: null,
        errors: []
      };
    }
  },

  // Cập nhật thông tin profile
  async updateProfile(userId, formData, role = 'staff') {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!formData.get('FullName')?.trim()) {
        throw new Error('Họ tên không được để trống');
      }
      const updateEndpoint = `/users/${userId}/profile`;
      const updateResponse = await apiClient.put(updateEndpoint, formData);
      let verifyResponse;
      if (role === 'parent') {
        verifyResponse = await apiClient.get(`/users/parents/${userId}`);
      } else if (role === 'student') {
        verifyResponse = await apiClient.get(`/users/students/${userId}`);
      } else {
        verifyResponse = await apiClient.get(`/users/staff/${userId}`);
      }
      return updateResponse.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật thông tin profile',
        data: null,
        errors: error.response?.data?.errors || []
      };
    }
  },

  // Đổi mật khẩu
  async changePassword(userId, oldPassword, newPassword) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!oldPassword) throw new Error('Mật khẩu cũ không được để trống');
      if (!newPassword) throw new Error('Mật khẩu mới không được để trống');

      const response = await apiClient.put(`/users/${userId}/change-password`, {
        oldPassword: oldPassword,
        newPassword: newPassword
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi đổi mật khẩu',
        data: null,
        errors: []
      };
    }
  }
};

export default authApi;
