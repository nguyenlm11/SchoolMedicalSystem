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
                message: response.error,
                data: []
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
};

export default userApi; 