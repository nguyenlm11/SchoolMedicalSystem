import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://14.225.211.217:5200/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  },
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