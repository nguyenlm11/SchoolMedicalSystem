import apiClient from '../config/config';

const vaccineApi = {
    // Lấy danh sách loại vaccine
    getVaccineTypes: async (params = {}) => {
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

            const response = await apiClient.get(`/vaccine-types?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vaccine types:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tải danh sách loại vaccine.',
                data: [],
                totalCount: 0,
                totalPages: 0
            };
        }
    },

    // Tạo buổi tiêm chủng mới
    createVaccinationSession: async (sessionData) => {
        try {
            const response = await apiClient.post('/VaccinationSession/create-whole', sessionData);
            return response.data;
        } catch (error) {
            console.error('Error creating vaccination session:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tạo buổi tiêm chủng.',
                data: null
            };
        }
    }
};

export default vaccineApi; 