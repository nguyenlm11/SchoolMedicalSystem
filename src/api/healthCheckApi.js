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
    // Cập nhật hạng mục kiểm tra sức khỏe
    updateHealthCheckItem: async (id, data) => {
        try {
            const response = await apiClient.put(`/health-check-items/${id}`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể cập nhật hạng mục kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Xóa hạng mục kiểm tra sức khỏe
    deleteHealthCheckItem: async (id) => {
        try {
            const response = await apiClient.delete(`/health-check-items/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xóa hạng mục kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Tạo mới kế hoạch kiểm tra sức khỏe
    createHealthCheckPlan: async (data) => {
        try {
            const response = await apiClient.post('/health-checks', data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tạo kế hoạch kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Lấy danh sách kế hoạch kiểm tra sức khỏe
    getHealthCheckPlans: async (params = {}) => {
        try {
            const response = await apiClient.get('/health-checks', { params });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách kế hoạch kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
};

export default healthCheckApi; 