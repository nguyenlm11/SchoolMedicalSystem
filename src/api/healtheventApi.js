import apiClient from '../config/config';

const healthEventApi = {
    // Tạo health event với medical items
    createHealthEventWithMedicalItems: async (data) => {
        try {
            const response = await apiClient.post('/health-events/with-medical-items', data);
            return response.data;
        } catch (error) {
            console.error('Error creating health event:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tạo sự kiện y tế.',
                data: null,
                errors: error.response?.data?.errors || []
            };
        }
    },

    // Lấy danh sách health events của một học sinh cụ thể
    getStudentHealthEvents: async (studentId, params) => {
        try {
            const response = await apiClient.get(`/health-events/student/${studentId}`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching student health events:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách sự kiện y tế của học sinh.',
                data: [],
                totalCount: 0,
                totalPages: 0
            };
        }
    },

    // Lấy danh sách health events 
    getHealthEvents: async (params) => {
        try {
            const response = await apiClient.get('/health-events', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching health events:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách sự kiện y tế.',
                data: [],
                totalCount: 0,
                totalPages: 0
            };
        }
    },

    // Lấy chi tiết health event
    getHealthEvent: async (id) => {
        try {
            const response = await apiClient.get(`/health-events/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching health event:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thông tin sự kiện y tế.',
                data: null
            };
        }
    },

    // Cập nhật health event
    updateHealthEvent: async (id, data) => {
        try {
            const response = await apiClient.put(`/health-events/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating health event:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể cập nhật sự kiện y tế.',
                data: null,
                errors: error.response?.data?.errors || []
            };
        }
    },

    // Xóa health event
    deleteHealthEvent: async (id) => {
        try {
            const response = await apiClient.delete(`/health-events/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting health event:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xóa sự kiện y tế.'
            };
        }
    }
};

export default healthEventApi;
