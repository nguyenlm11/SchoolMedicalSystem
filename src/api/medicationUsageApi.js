import apiClient from '../config/config';

const medicationUsageApi = {
    // Lấy danh sách thuốc theo y tá hoặc học sinh (cho nurse - xem tất cả trạng thái)
    getMedicationUsage: async (params = {}) => {
        try {
            const {
                pageIndex = 1,
                pageSize = 10,
                nurseId = '',
                studentId = '',
                status = '',
                searchTerm = ''
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('pageIndex', pageIndex);
            queryParams.append('pageSize', pageSize);

            if (nurseId) {
                queryParams.append('nurseId', nurseId);
            }
            if (studentId) {
                queryParams.append('studentId', studentId);
            }
            if (status) {
                queryParams.append('status', status);
            }
            if (searchTerm) {
                queryParams.append('searchTerm', searchTerm);
            }

            const response = await apiClient.get(`/student-medications/by-nurse-or-student?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy danh sách sử dụng thuốc",
                data: [],
                totalCount: 0,
                pageSize: 10,
                currentPage: 1,
                totalPages: 0,
                errors: []
            };
        }
    },

    // Cập nhật trạng thái sử dụng thuốc
    updateMedicationUsageStatus: async (medicationId, status, reason = null) => {
        try {
            const requestBody = { status: status, reason: reason };
            const response = await apiClient.patch(`/student-medications/${medicationId}/status`, requestBody);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể cập nhật trạng thái sử dụng thuốc",
                data: null,
                errors: []
            };
        }
    },

    // Bổ sung thuốc
    supplementMedication: async (requestData) => {
        try {
            const response = await apiClient.post('/student-medications/stocks', requestData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể bổ sung thuốc",
                data: null,
                errors: []
            };
        }
    },

    // Lấy chi tiết sử dụng thuốc theo ID
    getMedicationUsageById: async (id) => {
        try {
            const response = await apiClient.get(`/student-medications/${id}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy chi tiết sử dụng thuốc",
                data: null,
                errors: []
            };
        }
    },

    // Cập nhật trạng thái sử dụng thuốc
    updateMedicationUsage: async (id, updateData) => {
        try {
            const response = await apiClient.put(`/student-medications/${id}`, updateData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể cập nhật thông tin sử dụng thuốc",
                data: null,
                errors: []
            };
        }
    },

    // Ghi nhận việc cho thuốc
    recordMedicationAdministration: async (id, administrationData) => {
        try {
            const response = await apiClient.post(`/student-medications/${id}/administer`, administrationData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể ghi nhận việc cho thuốc",
                data: null,
                errors: []
            };
        }
    },

    // Lấy lịch sử cho thuốc
    getAdministrationHistory: async (medicationId, params = {}) => {
        try {
            const {
                pageIndex = 1,
                pageSize = 10,
                fromDate = '',
                toDate = ''
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('pageIndex', pageIndex);
            queryParams.append('pageSize', pageSize);

            if (fromDate) {
                queryParams.append('fromDate', fromDate);
            }
            if (toDate) {
                queryParams.append('toDate', toDate);
            }

            const response = await apiClient.get(`/student-medications/${medicationId}/administration-history?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy lịch sử cho thuốc",
                data: [],
                totalCount: 0,
                pageSize: 10,
                currentPage: 1,
                totalPages: 0,
                errors: []
            };
        }
    },

    // Dừng sử dụng thuốc
    discontinueMedication: async (id, reason) => {
        try {
            const response = await apiClient.put(`/student-medications/${id}/discontinue`, { reason });
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể dừng sử dụng thuốc",
                data: null,
                errors: []
            };
        }
    },

    // Lấy báo cáo sử dụng thuốc
    getMedicationUsageReport: async (params = {}) => {
        try {
            const {
                fromDate = '',
                toDate = '',
                nurseId = '',
                studentId = '',
                status = '',
                priority = ''
            } = params;

            const queryParams = new URLSearchParams();

            if (fromDate) {
                queryParams.append('fromDate', fromDate);
            }
            if (toDate) {
                queryParams.append('toDate', toDate);
            }
            if (nurseId) {
                queryParams.append('nurseId', nurseId);
            }
            if (studentId) {
                queryParams.append('studentId', studentId);
            }
            if (status) {
                queryParams.append('status', status);
            }
            if (priority) {
                queryParams.append('priority', priority);
            }

            const response = await apiClient.get(`/student-medications/usage-report?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy báo cáo sử dụng thuốc",
                data: null,
                errors: []
            };
        }
    },

    // Xác nhận số lượng thuốc đã nhận
    confirmQuantityReceived: async (requestId, medications) => {
        try {
            const requestBody = {
                medications: medications.map(med => ({
                    medicationId: med.id,
                    quantityReceived: med.quantityReceived || 0,
                    notes: med.notes || ""
                }))
            };

            const response = await apiClient.patch(`/student-medications/student-medical-requests/${requestId}/quantity-received`, requestBody);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể xác nhận số lượng thuốc đã nhận",
                data: null,
                errors: []
            };
        }
    },

    // Lấy lịch sử dùng thuốc theo medicationId
    getMedicationUsageHistory: async (params = {}) => {
        try {
            const {
                medicationId = '',
                pageIndex = 1,
                pageSize = 1000,
                fromDate = '',
                toDate = '',
                status = '' // Used, Skipped, Missed
            } = params;

            if (!medicationId) {
                return {
                    success: false,
                    message: "Thiếu medicationId",
                    data: [],
                    totalCount: 0,
                    pageSize,
                    currentPage: pageIndex,
                    totalPages: 0,
                    errors: []
                };
            }

            const queryParams = new URLSearchParams();
            queryParams.append('pageIndex', pageIndex);
            queryParams.append('pageSize', pageSize);
            if (fromDate) queryParams.append('fromDate', fromDate);
            if (toDate) queryParams.append('toDate', toDate);
            if (status) queryParams.append('status', status);

            const response = await apiClient.get(`/student-medications/medications/${medicationId}/usage-history?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: "Không thể lấy lịch sử dùng thuốc",
                data: [],
                totalCount: 0,
                pageSize: 10,
                currentPage: 1,
                totalPages: 0,
                errors: []
            };
        }
    }
};

export default medicationUsageApi;