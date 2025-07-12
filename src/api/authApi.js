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

  // Cập nhật thông tin profile
  async updateProfile(userId, formData) {
    try {
      if (!userId) throw new Error('Staff ID is required');

      // Validate formData
      if (!formData.get('FullName')?.trim()) {
        throw new Error('Họ tên không được để trống');
      }

      // Log chi tiết FormData
      console.log('=== DEBUG: FormData Content Before Send ===');
      console.log('UserID:', userId);
      console.log('FormData entries:');
      const formDataEntries = {};
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          formDataEntries[pair[0]] = {
            name: pair[1].name,
            type: pair[1].type,
            size: pair[1].size,
            lastModified: pair[1].lastModified
          };
        } else {
          formDataEntries[pair[0]] = pair[1];
        }
      }
      console.log(formDataEntries);

      // Make the request - không cần set headers vì apiClient đã tự handle
      const updateEndpoint = `/users/${userId}/profile`;
      console.log('=== DEBUG: Request Details ===');
      console.log('Endpoint:', updateEndpoint);
      console.log('Method: PUT');

      const updateResponse = await apiClient.put(updateEndpoint, formData);

      // Log response details
      console.log('=== DEBUG: Response Details ===');
      console.log('Status:', updateResponse.status);
      console.log('Data:', updateResponse.data);

      // Verify the update immediately
      const verifyResponse = await apiClient.get(`/users/staff/${userId}`);
      console.log('=== DEBUG: Verify Response ===');
      console.log('Status:', verifyResponse.status);
      console.log('Data:', verifyResponse.data);

      return updateResponse.data;

    } catch (error) {
      console.error('=== DEBUG: Error Details ===', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật thông tin profile',
        data: null,
        errors: error.response?.data?.errors || []
      };
    }
  }
};

export default authApi;
