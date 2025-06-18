import apiClient from '../config/config';

const medicalApi = {
    getMedicalItems: async (params) => {
        try {
            const response = await apiClient.get('/medical-items', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching medical items:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách thuốc và vật tư y tế.',
                data: [],
                totalCount: 0,
                totalPages: 0
            };
        }
    },

    getMedicalItem: async (id) => {
        try {
            const response = await apiClient.get(`/medical-items/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching medical item:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải thông tin thuốc.',
                data: null
            };
        }
    },

    createMedicalItem: async (data) => {
        try {
            const response = await apiClient.post('/medical-items', data);
            return response.data;
        } catch (error) {
            console.error('Error creating medical item:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tạo thuốc mới.'
            };
        }
    },

    updateMedicalItem: async (id, data) => {
        try {
            const response = await apiClient.put(`/medical-items/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating medical item:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể cập nhật thông tin thuốc.'
            };
        }
    },

    deleteMedicalItem: async (id) => {
        try {
            const response = await apiClient.delete(`/medical-items/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting medical item:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xóa thuốc.'
            };
        }
    },

    approveMedicalItem: async (id, data) => {
        try {
            const response = await apiClient.put(`/medical-items/${id}/approve`, data);
            return response.data;
        } catch (error) {
            console.error('Error approving medical item:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể phê duyệt thuốc.'
            };
        }
    },

    rejectMedicalItem: async (id, data) => {
        try {
            const response = await apiClient.put(`/medical-items/${id}/reject`, data);
            return response.data;
        } catch (error) {
            console.error('Error rejecting medical item:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể từ chối thuốc.'
            };
        }
    }
};

export default medicalApi;
