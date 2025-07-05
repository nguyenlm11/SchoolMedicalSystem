import axios from 'axios';

const apiClient = axios.create({
  // baseURL: '/api',
  baseURL: 'https://schoolmedicalsystem.ddns.net/api',
  // timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  }
});

// Thêm interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient; 