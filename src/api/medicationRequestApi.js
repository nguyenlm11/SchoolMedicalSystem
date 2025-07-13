import apiClient from '../config/config';

const medicationRequestApi = {
    createBulkRequest: async (requestData) => {
        try {
            const response = await apiClient.post('/student-medications/bulk', requestData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể gửi yêu cầu cấp phát thuốc",
                data: null,
                errors: []
            };
        }
    },

    // Hàm cho SchoolNurse - xem tất cả medication requests từ nhiều parent
    getMedicationRequests: async (params = {}) => {
        try {
            const response = await apiClient.get('/student-medications/requests', { params });
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy danh sách yêu cầu thuốc",
                data: [],
                errors: []
            };
        }
    },

    // Hàm cho Parent - chỉ xem medication requests của chính họ
    getParentMedicationRequests: async (parentId, params = {}) => {
        try {
            if (!parentId) {
                return {
                    success: false,
                    message: "Parent ID là bắt buộc",
                    data: [],
                    errors: ['Parent ID không được để trống']
                };
            }

            const {
                pageIndex = 1,
                pageSize = 10,
                searchTerm = '',
                orderBy = '',
                studentId = '',
                status = ''
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('pageIndex', pageIndex);
            queryParams.append('pageSize', pageSize);
            queryParams.append('parentId', parentId); // Luôn thêm parentId để đảm bảo chỉ xem requests của parent này

            if (searchTerm) {
                queryParams.append('searchTerm', searchTerm);
            }
            if (orderBy) {
                queryParams.append('orderBy', orderBy);
            }
            if (studentId) {
                queryParams.append('studentId', studentId);
            }
            if (status) {
                queryParams.append('status', status);
            }

            const response = await apiClient.get(`/student-medications/requests?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy danh sách yêu cầu thuốc của phụ huynh",
                data: [],
                errors: []
            };
        }
    },

    getMedicationRequestDetail: async (id) => {
        try {
            const response = await apiClient.get(`/student-medications/requests/${id}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy chi tiết yêu cầu thuốc",
                data: null,
                errors: []
            };
        }
    },

    approveMedicationRequest: async (id) => {
        try {
            const response = await apiClient.put(`/student-medications/requests/${id}/approve`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể duyệt yêu cầu thuốc",
                data: null,
                errors: []
            };
        }
    },

    rejectMedicationRequest: async (id) => {
        try {
            const response = await apiClient.put(`/student-medications/requests/${id}/reject`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể từ chối yêu cầu thuốc",
                data: null,
                errors: []
            };
        }
    },

    deleteMedicationRequest: async (id) => {
        try {
            const response = await apiClient.delete(`/student-medications/requests/${id}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể xóa yêu cầu thuốc",
                data: null,
                errors: []
            };
        }
    },
};

export default medicationRequestApi;