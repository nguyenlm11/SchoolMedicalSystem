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
    }
};

export default medicationRequestApi;