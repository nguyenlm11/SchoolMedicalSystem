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
    },

    addMedicalCondition: async (medicalConditionData) => {
        try {
            const response = await apiClient.post('/medical-conditions', medicalConditionData);
            return response.data;
        } catch (error) {
            console.error('Error adding medical condition:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể thêm tình trạng y tế'
            };
        }
    }
};

export default healthProfileApi;