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

    addVaccinationRecord: async (medicalRecordId, vaccinationData) => {
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
    },

    addPhysicalRecord: async (studentId, physicalRecordData) => {
        try {
            const response = await apiClient.post(`/medical-records/${studentId}/physical-record`, physicalRecordData);
            return response.data;
        } catch (error) {
            console.error('Error adding physical record:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể thêm chỉ số thể chất'
            };
        }
    },

    addHearingRecord: async (studentId, hearingRecordData) => {
        try {
            const response = await apiClient.post(`/medical-records/${studentId}/hearing-record`, hearingRecordData);
            return response.data;
        } catch (error) {
            console.error('Error adding hearing record:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể thêm bản ghi thính lực'
            };
        }
    },

    addVisionRecord: async (studentId, visionRecordData) => {
        try {
            const response = await apiClient.post(`/medical-records/${studentId}/vision-record`, visionRecordData);
            return response.data;
        } catch (error) {
            console.error('Error adding vision record:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể thêm bản ghi thị lực'
            };
        }
    },

    updateBasicInfo: async (recordId, updateData) => {
        try {
            const response = await apiClient.put(`/medical-records/${recordId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating basic info:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể cập nhật thông tin cơ bản'
            };
        }
    }
};
export default healthProfileApi;
