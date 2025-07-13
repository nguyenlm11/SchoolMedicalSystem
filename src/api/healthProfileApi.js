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

    getMedicalConditions: async (studentId, params = {}) => {
        try {
            const response = await apiClient.get(`/medical-conditions/student/${studentId}`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching medical conditions:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách tình trạng y tế',
                data: [],
                totalCount: 0,
                totalPages: 0
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
    },

    addVaccinationRecord: async (medicalRecordId,vaccinationData) => {
        try {
            const response = await apiClient.post(`/VaccineRecord/${medicalRecordId}`, vaccinationData);
            return response.data;
        } catch (error) {
            console.error('Error adding vaccination record:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể thêm lịch sử tiêm chủng'
            };
        }
    }
};

export default healthProfileApi;