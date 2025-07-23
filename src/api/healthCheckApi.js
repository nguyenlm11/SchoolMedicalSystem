import apiClient from '../config/config';

const healthCheckApi = {
    // Lấy danh sách hạng mục kiểm tra sức khỏe
    getHealthCheckItems: async (params = {}) => {
        try {
            const response = await apiClient.get('/health-check-items', { params });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách hạng mục kiểm tra sức khỏe',
                data: [],
                errors: [error.message]
            };
        }
    },
    // Tạo mới hạng mục kiểm tra sức khỏe
    createHealthCheckItem: async (data) => {
        try {
            const response = await apiClient.post('/health-check-items', data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tạo hạng mục kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Cập nhật hạng mục kiểm tra sức khỏe
    updateHealthCheckItem: async (id, data) => {
        try {
            const response = await apiClient.put(`/health-check-items/${id}`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể cập nhật hạng mục kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Xóa hạng mục kiểm tra sức khỏe
    deleteHealthCheckItem: async (id) => {
        try {
            const response = await apiClient.delete(`/health-check-items/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xóa hạng mục kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Tạo mới kế hoạch kiểm tra sức khỏe
    createHealthCheckPlan: async (data) => {
        try {
            const response = await apiClient.post('/health-checks', data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tạo kế hoạch kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Lấy danh sách kế hoạch kiểm tra sức khỏe
    getHealthCheckPlans: async (params = {}) => {
        try {
            const response = await apiClient.get('/health-checks', { params });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách kế hoạch kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Lấy chi tiết kế hoạch kiểm tra sức khỏe
    getHealthCheckPlanDetails: async (id) => {
        try {
            const response = await apiClient.get(`/health-checks/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy chi tiết kế hoạch kiểm tra sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Duyệt kế hoạch kiểm tra sức khỏe
    approveHealthCheckPlan: async (id) => {
        try {
            const response = await apiClient.put(`/health-checks/${id}/approve`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể duyệt kế hoạch khám sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Từ chối kế hoạch kiểm tra sức khỏe
    declineHealthCheckPlan: async (id, reason) => {
        try {
            const response = await apiClient.put(`/health-checks/${id}/decline`, null, {
                params: { reason }
            });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể từ chối kế hoạch khám sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Chốt danh sách kế hoạch kiểm tra sức khỏe
    finalizeHealthCheckPlan: async (id) => {
        try {
            const response = await apiClient.put(`/health-checks/${id}/finalize`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể chốt danh sách kế hoạch khám sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Hoàn thành kế hoạch kiểm tra sức khỏe
    completeHealthCheckPlan: async (id) => {
        try {
            const response = await apiClient.put(`/health-checks/${id}/complete`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể hoàn thành kế hoạch khám sức khỏe',
                errors: [error.message]
            };
        }
    },
    // Lấy danh sách phân công nurse cho health check plan
    getNurseAssignments: async (planId) => {
        try {
            const response = await apiClient.get(`/health-checks/${planId}/nurse-assignments`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách phân công nhân viên y tế',
                data: [],
                errors: [error.message]
            };
        }
    },
    // Phân công nurse cho health check plan
    assignNurseToHealthCheckPlan: async (data) => {
        try {
            const response = await apiClient.post('/health-checks/assign-nurse', {
                healthCheckId: data.planId,
                assignments: data.assignments
            });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể phân công nhân viên y tế',
                errors: [error.message]
            };
        }
    },
    // Lấy danh sách học sinh và trạng thái đồng ý theo kế hoạch kiểm tra sức khỏe
    getClassStudentList: async (planId) => {
        try {
            const response = await apiClient.get(`/health-checks/${planId}/students`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách lớp và học sinh',
                data: [],
                errors: [error.message]
            };
        }
    },
    // Tái phân công nurse cho health check plan
    reassignNurseToHealthCheckPlan: async (planId, assignments) => {
        try {
            const response = await apiClient.put(`/health-checks/${planId}/reassign-nurse`, { assignments });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể tái phân công nhân viên y tế',
                errors: [error.message]
            };
        }
    },
};

export default healthCheckApi; 