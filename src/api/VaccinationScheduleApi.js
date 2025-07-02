import apiClient from '../config/config';

const vaccinationScheduleApi = {
    // Lấy danh sách học sinh của phụ huynh
    getParentStudents: async (parentId, params = {}) => {
        try {
            const {
                pageIndex = 1,
                pageSize = 10,
                searchTerm = '',
                orderBy = ''
            } = params;

            // Validate parentId
            if (!parentId) {
                return {
                    success: false,
                    message: 'Parent ID là bắt buộc',
                    data: [],
                    totalCount: 0,
                    totalPages: 0,
                    errors: ['Parent ID không được để trống']
                };
            }

            const queryParams = new URLSearchParams();
            queryParams.append('pageIndex', pageIndex);
            queryParams.append('pageSize', pageSize);

            if (searchTerm) {
                queryParams.append('searchTerm', searchTerm);
            }

            if (orderBy) {
                queryParams.append('orderBy', orderBy);
            }

            const response = await apiClient.get(
                `/users/parents/${parentId}/students?${queryParams.toString()}`
            );

            return response.data;
        } catch (error) {
            console.error('Error fetching parent students:', error);

            // Handle different error types
            if (error.response && error.response.data) {
                return error.response.data;
            }

            return {
                success: false,
                message: error.message || 'Không thể tải danh sách học sinh của phụ huynh',
                data: [],
                totalCount: 0,
                totalPages: 0,
                errors: [error.message || 'Lỗi kết nối server']
            };
        }
    },

    // Lấy lịch tiêm chủng của học sinh
    getStudentVaccinationSessions: async (studentId, params = {}) => {
        try {
            const {
                pageIndex = 1,
                pageSize = 10,
                searchTerm = '',
                orderBy = ''
            } = params;

            // Validate studentId
            if (!studentId) {
                return {
                    success: false,
                    message: 'Student ID là bắt buộc',
                    data: [],
                    totalCount: 0,
                    totalPages: 0,
                    errors: ['Student ID không được để trống']
                };
            }

            const queryParams = new URLSearchParams();
            queryParams.append('pageIndex', pageIndex);
            queryParams.append('pageSize', pageSize);

            if (searchTerm) {
                queryParams.append('searchTerm', searchTerm);
            }

            if (orderBy) {
                queryParams.append('orderBy', orderBy);
            }

            const response = await apiClient.get(
                `/students/${studentId}/vaccination-sessions?${queryParams.toString()}`
            );

            return response.data;
        } catch (error) {
            console.error('Error fetching student vaccination sessions:', error);

            // Handle different error types
            if (error.response && error.response.data) {
                return error.response.data;
            }

            return {
                success: false,
                message: error.message || 'Không thể tải lịch tiêm chủng của học sinh',
                data: [],
                totalCount: 0,
                totalPages: 0,
                errors: [error.message || 'Lỗi kết nối server']
            };
        }
    }
};

export default vaccinationScheduleApi;
