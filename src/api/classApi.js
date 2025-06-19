import apiClient from '../config/config';

const classApi = {
    // Lấy danh sách lớp học
    getSchoolClass: async (params = {}) => {
        try {
            const {
                pageIndex = 1,
                pageSize = 10,
                searchTerm = '',
                orderBy = '',
                grade = '',
                academicYear = ''
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

            if (grade) {
                queryParams.append('grade', grade);
            }
            
            if (academicYear) {
                queryParams.append('academicYear', academicYear);
            }

            const response = await apiClient.get(`/school-classes?${queryParams.toString()}`);
            return response.data;

        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    },

    // Thêm lớp
    addSchoolClass: async (classData) => {
        try {
            const response = await apiClient.post('/school-classes', classData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Chỉnh sửa lớp
    updateSchoolClass: async (classId, classData) => {
        try {
            const response = await apiClient.put(`/school-classes/${classId}`, classData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: error.message,
                data: null,
                errors: []
            };
        }
    },

    // Xoá lớp
    deleteSchoolClass: async (classId) => {
        try {
            const response = await apiClient.delete(`/school-classes/${classId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
}

export default classApi; 