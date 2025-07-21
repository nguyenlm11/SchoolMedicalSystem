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

    // Lấy thông tin chi tiết của lớp học
    getClassById: async (classId) => {
        try {
            const response = await apiClient.get(`/school-classes/${classId}`);
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

    // Thêm lớp
    addSchoolClass: async (classData) => {
        try {
            const response = await apiClient.post('/school-classes', classData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Tải Template
    downloadClassTemplate: async () => {
        try {
            const response = await apiClient.get('/school-classes/template', {
                responseType: 'blob'
            });
            return {
                success: true,
                data: response.data,
                headers: response.headers
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                errors: []
            };
        }
    },

    // Xuất danh sách lớp học
    exportClassList: async (classData) => {
        try {
            const response = await apiClient.get('/school-classes/export', classData, {
                responseType: 'blob'
            });
            return {
                success: true,
                data: response.data,
                headers: response.headers
            };
        } catch (error) {
            return {
                success: false,
                message: "Không thể xuất danh sách quản lý",
                error: error.response?.data || error
            };
        }
    },

    // Thêm lớp bằng import file
    addSchoolClassByFile: async (classData) => {
        try {
            const response = await apiClient.post('/school-classes/import', classData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
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