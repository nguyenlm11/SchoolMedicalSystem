import apiClient from '../config/config';

const userApi = {
    // Lấy danh sách người dùng (y tế và quản lý)
    getUsers: async (params = {}) => {
        try {
            const {
                pageIndex = 1,
                pageSize = 10,
                searchTerm = '',
                orderBy = '',
                role = ''
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
            if (role) {
                queryParams.append('role', role);
            }
            const response = await apiClient.get(`/users/staff?${queryParams.toString()}`);
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
    // Lấy thông tin chi tiết của nhân viên
    getStaffProfile: async (staffId) => {
        try {
            const response = await apiClient.get(`/users/staff/${staffId}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy thông tin nhân viên",
                data: null,
                errors: []
            };
        }
    },
    // Create Manager
    createManager: async (managerData) => {
        try {
            const response = await apiClient.post('/users/managers', managerData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Create School Nurse
    createSchoolNurse: async (nurseData) => {
        try {
            const response = await apiClient.post('/users/school-nurses', nurseData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Delete Manager
    deleteManager: async (managerId) => {
        try {
            const response = await apiClient.delete(`/users/managers/${managerId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Delete School Nurse
    deleteSchoolNurse: async (nurseId) => {
        try {
            const response = await apiClient.delete(`/users/school-nurses/${nurseId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Cập nhật thông tin quản lý
    updateManager: async (managerId, managerData) => {
        try {
            const response = await apiClient.put(`/users/managers/${managerId}`, managerData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể cập nhật thông tin quản lý",
                data: null,
                errors: []
            };
        }
    },
    // Cập nhật thông tin y tá
    updateSchoolNurse: async (nurseId, nurseData) => {
        try {
            const response = await apiClient.put(`/users/school-nurses/${nurseId}`, nurseData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể cập nhật thông tin y tá",
                data: null,
                errors: []
            };
        }
    },
    // Download Manager Template
    downloadManagerTemplate: async () => {
        try {
            const response = await apiClient.get('/users/managers/template', {
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
                message: "Không thể tải mẫu quản lý",
                error: error.response?.data || error
            };
        }
    },
    // Download School Nurse Template
    downloadSchoolNurseTemplate: async () => {
        try {
            const response = await apiClient.get('/users/school-nurses/template', {
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
                message: "Không thể tải mẫu y tá",
                error: error.response?.data || error
            };
        }
    },
    // Export Manager List
    exportManagerList: async () => {
        try {
            const response = await apiClient.get('/users/managers/export', {
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
    // Export School Nurse List
    exportSchoolNurseList: async () => {
        try {
            const response = await apiClient.get('/users/school-nurses/export', {
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
                message: "Không thể xuất danh sách y tá",
                error: error.response?.data || error
            };
        }
    },
    // Import Manager List
    importManagerList: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/users/managers/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: "Không thể nhập danh sách quản lý",
                error: error.response?.data || error
            };
        }
    },
    // Import School Nurse List
    importSchoolNurseList: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/users/school-nurses/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: "Không thể nhập danh sách y tá",
                error: error.response?.data || error
            };
        }
    },
};

export default userApi; 