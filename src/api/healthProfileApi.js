import apiClient from '../config/config';

const healthProfileApi = {
    getHealthProfile: async (studentId) => {
        try {
            const response = await apiClient.get(`/medical-records/student/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching health profile:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải hồ sơ y tế'
            };
        }
    }
};

export default healthProfileApi;