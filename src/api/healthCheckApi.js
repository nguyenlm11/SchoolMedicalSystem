import apiClient from '../config/config';

const healthCheckApi = {
    // Lấy danh sách hạng mục kiểm tra sức khỏe
    getHealthCheckItems: async (params = {}) => {
        try {
            const response = await apiClient.get('/health-check-items', { params });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách hạng mục kiểm tra sức khỏe',
                data: [],
                errors: [error.message]
            };
        }
    },
    // Tạo mới hạng mục kiểm tra sức khỏe
    createHealthCheckItem: async (data) => {
        try {
            const response = await apiClient.post('/health-check-items', data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tạo hạng mục kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
};

export default healthCheckApi; 