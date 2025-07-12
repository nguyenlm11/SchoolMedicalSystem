import apiClient from '../config/config';

const medicationRequestApi = {
    createBulkRequest: async (requestData) => {
        try {
            const response = await apiClient.post('/student-medications/bulk', requestData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể gửi yêu cầu cấp phát thuốc",
                data: null,
                errors: []
            };
        }
    },
    getMedicationRequests: async (params = {}) => {
        try {
            const response = await apiClient.get('/student-medications/requests', { params });
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy danh sách yêu cầu thuốc",
                data: [],
                errors: []
            };
        }
    },
};

export default medicationRequestApi;