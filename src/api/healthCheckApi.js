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
    // Xóa kế hoạch kiểm tra sức khỏe
    deleteHealthCheckPlan: async (id) => {
        try {
            const response = await apiClient.delete(`/health-checks/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể xóa kế hoạch kiểm tra sức khỏe',
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
    // Lấy danh sách kế hoạch kiểm tra sức khỏe của học sinh (dành cho phụ huynh)
    getStudentHealthCheckPlans: async (studentId, params = {}) => {
        try {
            if (!studentId) {
                return {
                    success: false,
                    message: 'Student ID là bắt buộc',
                    data: [],
                    errors: ['Student ID không được để trống']
                };
            }
            const queryParams = new URLSearchParams();
            if (params.pageIndex) queryParams.append('pageIndex', params.pageIndex);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);
            // Add more params if needed
            const response = await apiClient.get(`/health-checks/student/${studentId}?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy danh sách kế hoạch kiểm tra sức khỏe của học sinh',
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
    // Phụ huynh xác nhận đồng ý hoặc từ chối khám sức khỏe cho học sinh
    submitParentApproval: async (healthCheckId, studentId, status) => {
        try {
            if (!healthCheckId || !studentId || !status) {
                return {
                    success: false,
                    message: 'Thiếu tham số healthCheckId, studentId hoặc status',
                    errors: ['Thiếu tham số healthCheckId, studentId hoặc status']
                };
            }
            const response = await apiClient.put(
                `/health-checks/${healthCheckId}/parent-approval?studentId=${studentId}`,
                { status }
            );
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể gửi xác nhận phụ huynh cho buổi khám sức khỏe',
                errors: [error.message]
            };
        }
    },

    // Lấy tất cả kết quả kiểm tra sức khỏe cho health check plan
    getHealthCheckResults: async (healthCheckId) => {
        try {
            const response = await apiClient.get(`/health-checks/health-check-results?healthCheckId=${healthCheckId}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Không thể lấy kết quả kiểm tra sức khỏe',
                data: [],
                errors: [error.message]
            };
        }
    },

    // Khám thị lực mắt trái
    submitLeftVisionResult: async (healthCheckId, data) => {
        try {
            const response = await apiClient.post(`/health-checks/${healthCheckId}/vision/left`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể lưu kết quả khám thị lực mắt trái',
                errors: [error.response?.data?.message || error.message]
            };
        }
    },

    // Khám thị lực mắt phải
    submitRightVisionResult: async (healthCheckId, data) => {
        try {
            const response = await apiClient.post(`/health-checks/${healthCheckId}/vision/right`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể lưu kết quả khám thị lực mắt phải',
                errors: [error.response?.data?.message || error.message]
            };
        }
    },

    // Khám thính lực tai trái
    submitLeftHearingResult: async (healthCheckId, data) => {
        try {
            const response = await apiClient.post(`/health-checks/${healthCheckId}/hearing/left`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể lưu kết quả khám thính lực tai trái',
                errors: [error.response?.data?.message || error.message]
            };
        }
    },

    // Khám thính lực tai phải
    submitRightHearingResult: async (healthCheckId, data) => {
        try {
            const response = await apiClient.post(`/health-checks/${healthCheckId}/hearing/right`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể lưu kết quả khám thính lực tai phải',
                errors: [error.response?.data?.message || error.message]
            };
        }
    },

    // Đo chiều cao
    submitHeightResult: async (healthCheckId, data) => {
        try {
            const response = await apiClient.post(`/health-checks/${healthCheckId}/physical/height`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể lưu kết quả đo chiều cao',
                errors: [error.response?.data?.message || error.message]
            };
        }
    },

    // Đo cân nặng
    submitWeightResult: async (healthCheckId, data) => {
        try {
            const response = await apiClient.post(`/health-checks/${healthCheckId}/physical/weight`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể lưu kết quả đo cân nặng',
                errors: [error.response?.data?.message || error.message]
            };
        }
    },

    // Đo huyết áp
    submitBloodPressureResult: async (healthCheckId, data) => {
        try {
            const response = await apiClient.post(`/health-checks/${healthCheckId}/vital-sign/blood-pressure`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể lưu kết quả đo huyết áp',
                errors: [error.response?.data?.message || error.message]
            };
        }
    },

    // Đo nhịp tim
    submitHeartRateResult: async (healthCheckId, data) => {
        try {
            const response = await apiClient.post(`/health-checks/${healthCheckId}/vital-sign/heart-rate`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Không thể lưu kết quả đo nhịp tim',
                errors: [error.response?.data?.message || error.message]
            };
        }
    }
};

export default healthCheckApi; 