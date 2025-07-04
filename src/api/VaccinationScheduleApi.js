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
    },

    // Lấy chi tiết buổi tiêm chủng
    getVaccinationSessionDetails: async (sessionId) => {
        try {
            // Validate sessionId
            if (!sessionId) {
                return {
                    success: false,
                    message: 'Session ID là bắt buộc',
                    data: null,
                    errors: ['Session ID không được để trống']
                };
            }

            const response = await apiClient.get(`/vaccination-sessions/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vaccination session details:', error);

            // Handle different error types
            if (error.response && error.response.data) {
                return error.response.data;
            }

            return {
                success: false,
                message: error.message || 'Không thể tải chi tiết buổi tiêm chủng',
                data: null,
                errors: [error.message || 'Lỗi kết nối server']
            };
        }
    },

    // Lấy chi tiết loại vaccine
    getVaccineTypeDetails: async (vaccineTypeId) => {
        try {
            // Validate vaccineTypeId
            if (!vaccineTypeId) {
                return {
                    success: false,
                    message: 'Vaccine Type ID là bắt buộc',
                    data: null,
                    errors: ['Vaccine Type ID không được để trống']
                };
            }

            const response = await apiClient.get(`/vaccine-types/${vaccineTypeId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vaccine type details:', error);

            // Handle different error types
            if (error.response && error.response.data) {
                return error.response.data;
            }

            return {
                success: false,
                message: error.message || 'Không thể tải chi tiết loại vaccine',
                data: null,
                errors: [error.message || 'Lỗi kết nối server']
            };
        }
    },

    // Lấy trạng thái đồng ý của phụ huynh
    getParentConsentStatus: async (sessionId, studentId) => {
        try {
            // Validate parameters
            if (!sessionId) {
                return {
                    success: false,
                    message: 'Session ID là bắt buộc',
                    data: null,
                    errors: ['Session ID không được để trống']
                };
            }

            if (!studentId) {
                return {
                    success: false,
                    message: 'Student ID là bắt buộc',
                    data: null,
                    errors: ['Student ID không được để trống']
                };
            }

            const response = await apiClient.get(`/vaccination-sessions/${sessionId}/parent-consent-status?studentId=${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching parent consent status:', error);

            // Handle different error types
            if (error.response && error.response.data) {
                return error.response.data;
            }

            return {
                success: false,
                message: error.message || 'Không thể tải trạng thái đồng ý của phụ huynh',
                data: null,
                errors: [error.message || 'Lỗi kết nối server']
            };
        }
    },

    // Gửi quyết định đồng ý của phụ huynh
    submitParentConsent: async (sessionId, studentId, consentData) => {
        try {
            // Validate parameters
            if (!sessionId) {
                return {
                    success: false,
                    message: 'Session ID là bắt buộc',
                    data: null,
                    errors: ['Session ID không được để trống']
                };
            }

            if (!studentId) {
                return {
                    success: false,
                    message: 'Student ID là bắt buộc',
                    data: null,
                    errors: ['Student ID không được để trống']
                };
            }

            if (!consentData) {
                return {
                    success: false,
                    message: 'Dữ liệu đồng ý là bắt buộc',
                    data: null,
                    errors: ['Dữ liệu đồng ý không được để trống']
                };
            }

            const requestData = {
                studentId: studentId,
                consentStatus: consentData.consentStatus, // "Confirmed" or "Declined"
                parentSignature: consentData.parentSignature || null,
                consentDate: new Date().toISOString(),
                notes: consentData.notes || null
            };

            const response = await apiClient.put(`/vaccination-sessions/${sessionId}/parent-consent`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error submitting parent consent:', error);

            // Handle different error types
            if (error.response && error.response.data) {
                return error.response.data;
            }

            return {
                success: false,
                message: error.message || 'Không thể gửi quyết định đồng ý',
                data: null,
                errors: [error.message || 'Lỗi kết nối server']
            };
        }
    },

    // API chính thức: Phê duyệt/Từ chối tiêm chủng của phụ huynh
    submitParentApproval: async (sessionId, studentId, status) => {
        try {
            // Validate parameters
            if (!sessionId) {
                return {
                    success: false,
                    message: 'Session ID là bắt buộc',
                    data: null,
                    errors: ['Session ID không được để trống']
                };
            }

            if (!studentId) {
                return {
                    success: false,
                    message: 'Student ID là bắt buộc',
                    data: null,
                    errors: ['Student ID không được để trống']
                };
            }

            if (!status) {
                return {
                    success: false,
                    message: 'Trạng thái phê duyệt là bắt buộc',
                    data: null,
                    errors: ['Status không được để trống']
                };
            }

            // Validate status values
            const validStatuses = ['Confirmed', 'Declined'];
            if (!validStatuses.includes(status)) {
                return {
                    success: false,
                    message: 'Trạng thái không hợp lệ',
                    data: null,
                    errors: ['Status phải là: Confirmed, Declined']
                };
            }

            const requestData = {
                status: status
            };

            const response = await apiClient.put(
                `/vaccination-sessions/${sessionId}/parent-approval?studentId=${studentId}`,
                requestData
            );

            return response.data;
        } catch (error) {
            console.error('Error submitting parent approval:', error);

            // Handle different error types
            if (error.response && error.response.data) {
                return error.response.data;
            }

            return {
                success: false,
                message: error.message || 'Không thể gửi quyết định phê duyệt',
                data: null,
                errors: [error.message || 'Lỗi kết nối server']
            };
        }
    },

    // Lấy kết quả tiêm chủng
    getVaccineResult: async (sessionId, studentId) => {
        try {
            // Validate parameters
            if (!sessionId) {
                return {
                    success: false,
                    message: 'Session ID là bắt buộc',
                    data: null,
                    errors: ['Session ID không được để trống']
                };
            }

            if (!studentId) {
                return {
                    success: false,
                    message: 'Student ID là bắt buộc',
                    data: null,
                    errors: ['Student ID không được để trống']
                };
            }

            const response = await apiClient.get(`/vaccination-sessions/${sessionId}/students/${studentId}/vaccination-result`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vaccination result:', error);

            // Handle different error types
            if (error.response && error.response.data) {
                return error.response.data;
            }

            return {
                success: false,
                message: error.message || 'Không thể tải kết quả tiêm chủng',
                data: null,
                errors: [error.message || 'Lỗi kết nối server']
            };
        }
    }
};

export default vaccinationScheduleApi;
