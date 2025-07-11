import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://schoolmedicalsystem.ddns.net/api',
  timeout: 300000, // Tăng timeout mặc định lên 5 phút
  headers: {
    'Accept': '*/*'
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});

// Thêm interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Tự động set Content-Type dựa trên data
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý lỗi
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        response: {
          data: {
            success: false,
            message: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
          }
        }
      });
    }
    
    if (error.message === 'Network Error') {
      return Promise.reject({
        response: {
          data: {
            success: false,
            message: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.',
          }
        }
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 