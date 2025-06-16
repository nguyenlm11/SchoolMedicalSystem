import apiClient from '../config/config';

const userApi = {
    // Lấy danh sách người dùng (y tế và quản lý)
    async getUsers(params = {}) {
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
};

export default userApi; 