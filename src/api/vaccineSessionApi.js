import apiClient from '../config/config';

const vaccineSessionApi = {

    // Lấy danh sách danh sách tiêm chủng
    getVaccineSessions: async (params = {}) => {
        try {
            const {
                pageIndex = 1,
                pageSize = 10,
                searchTerm = '',
                orderBy = ''
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('pageIndex', pageIndex);
            queryParams.append('pageSize', pageSize);

            if (searchTerm) {
                queryParams.append('searchTerm', searchTerm);
            }

            if (orderBy) {
                queryParams.append('orderBy', orderBy);
            }

            const response = await apiClient.get(`/vaccination-sessions?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vaccine sessions:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách loại vaccine.',
                data: [],
                totalCount: 0,
                totalPages: 0
            };
        }
    },

    // Lấy danh sách nhân viên y tế cho buổi tiêm chủng
    getNurseAssignments: async (sessionId) => {
        try {
            const response = await apiClient.get(`/vaccination-sessions/${sessionId}/nurse-assignments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching nurse list:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách.',
                data: null
            };
        }
    },
 
    // Lấy chi tiết buổi tiêm chủng
    getVaccineSessionDetails: async (sessionId) => {
        try {
            const response = await apiClient.get(`/vaccination-sessions/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vaccine session details:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải chi tiết buổi tiêm.',
                data: null
            };
        }
    },
    
    // Chấp nhận buổi tiêm chủng
    approveVaccineSession: async (sessionId) => {
        try {
            const response = await apiClient.put(`/vaccination-sessions/${sessionId}/approve`);
            return response.data;
        } catch (error) {
            console.error('Error approving vaccine session:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể chấp nhận buổi tiêm.',
                data: null
            };
        }
    },

    // Chốt danh sách buổi tiêm chủng
    finalizeVaccineSession: async (sessionId) => {
        try {
            const response = await apiClient.put(`/vaccination-sessions/${sessionId}/finalize`);
            return response.data;
        } catch (error) {
            console.error('Error finalizing vaccine session:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể chốt danh sách buổi tiêm.',
                data: null
            };
        }
    },
    
    // Xác nhận đã hoàn thành buổi tiêm chủng
    completeVaccineSession: async (sessionId) => {
        try {
            const response = await apiClient.put(`/vaccination-sessions/${sessionId}/complete`);
            return response.data;
        } catch (error) {
            console.error('Error complete vaccine session:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xác nhận hoàn thành.',
                data: null
            };
        }
    },

    // Từ chối buổi tiêm chủng
    declineVaccineSession: async (sessionId, reason) => {
        try {
            const response = await apiClient.put(`/vaccination-sessions/${sessionId}/decline`, null, {
                params: { reason }
            });
            return response.data;
        } catch (error) {
            console.error('Error declining vaccine session:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể từ chối buổi tiêm.',
                data: null
            };
        }
    },

    // Lấy danh sách học sinh và trạng thái tiêm trong 1 lớp thuộc buổi tiêm
    getStudentConsentStatusByClass: async (sessionId, classId) => {
        try {
            const response = await apiClient.get(`/vaccination-sessions/${sessionId}/class/${classId}/student-consent-status`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student consent status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy thông tin trạng thái học sinh.',
                data: []
            };
        }
    },

    // Lấy thông tin trạng thái học sinh cho tất cả các lớp trong buổi tiêm
    getAllClassStudentConsents: async (sessionId, classIds = []) => {
        try {
            const requests = classIds.map(classId =>
                vaccineSessionApi.getStudentConsentStatusByClass(sessionId, classId)
            );
            const results = await Promise.all(requests);
            return results;
        } catch (error) {
            console.error('Error fetching all class consent statuses:', error);
            return [];
        }
    },

    // Phân công y tá cho buổi tiêm chủng
    assignNurseToVaccinationSession: async (data) => {
        try {
            const response = await apiClient.post(`/vaccination-sessions/assign-nurse`, data);
            return response.data;
        } catch (error) {
            console.error('Error assigning nurse:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể phân công y tá.',
                data: null
            };
        }
    },

    // Phân công lại y tá cho buổi tiêm chủng
    reassignNurse: async (sessionId, data) => {
        try {
            const response = await apiClient.put(`/vaccination-sessions/${sessionId}/reassign-nurse`, data);
            return response.data;
        } catch (error) {
            console.error('Error reassigning nurse:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể phân công lại y tá.',
                data: null
            };
        }
    },
    
    // Đánh dấu tiêm 
    markStudentVaccinated: async (sessionId, data) => {
        try {
            const response = await apiClient.post(`/vaccination-sessions/${sessionId}/mark-student-vaccinated`, data);
            return response.data;
        } catch (error) {
            console.error('Error mark student vaccinated:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể đánh dấu tiêm.',
                data: null
            };
        }
    },

    // Đánh dấu chưa tiêm 
    markStudentNotVaccinated: async (sessionId, data) => {
        try {
            const response = await apiClient.post(`/vaccination-sessions/${sessionId}/mark-student-not-vaccinated`, data);
            return response.data;
        } catch (error) {
            console.error('Error mark student not vaccinated:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể đánh dấu chưa tiêm.',
                data: null
            };
        }
    },

    // Xem kết quả buổi tiêm
    getVaccinationResult: async (sessionId, studentId) => {
        try {
            const response = await apiClient.get(`/vaccination-sessions/${sessionId}/students/${studentId}/vaccination-result`);
            return response.data;
        } catch (error) {
            console.error('Error get Vaccination Result:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy kết quả buổi tiêm.',
                data: null
            };
        }
    }
};

export default vaccineSessionApi; 