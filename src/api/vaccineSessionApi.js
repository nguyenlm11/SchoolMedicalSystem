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

};

export default vaccineSessionApi; 