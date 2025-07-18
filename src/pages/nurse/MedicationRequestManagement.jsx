import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiAlertTriangle, FiCheckCircle, FiClock, FiRefreshCw, FiEye, FiMoreVertical, FiCalendar, FiUser, FiTrendingUp, FiPhone, FiTrash2, FiChevronLeft, FiChevronRight, FiPackage } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import medicationRequestApi from "../../api/medicationRequestApi";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AlertModal from "../../components/modal/AlertModal";

const MedicationRequestManagement = () => {
    const navigate = useNavigate();
    const [medicationRequests, setMedicationRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
    const [openActionId, setOpenActionId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    const [dateRange, setDateRange] = useState({ fromDate: "", toDate: "" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ type: "", message: "" });
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('[data-dropdown]')) {
                setOpenActionId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch data from API
    const fetchMedicationRequests = async (params = {}) => {
        setLoading(true);
        try {
            const apiParams = {
                pageIndex: params.pageIndex || pagination.pageIndex,
                pageSize: params.pageSize || pagination.pageSize,
            };
            if (filterStatus !== "all") apiParams.status = filterStatus;
            if (filterPriority !== "all") apiParams.priority = filterPriority;
            const response = await medicationRequestApi.getMedicationRequests(apiParams);
            if (response.success) {
                setMedicationRequests(response.data || []);
                setPagination({
                    pageIndex: response.currentPage || apiParams.pageIndex,
                    pageSize: response.pageSize || apiParams.pageSize,
                    totalCount: response.totalCount || 0,
                    totalPages: response.totalPages || 0
                });
            } else {
                setMedicationRequests([]);
                setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
            }
        } catch (err) {
            setMedicationRequests([]);
            setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicationRequests();
    }, []);

    useEffect(() => {
        fetchMedicationRequests();
    }, [filterStatus, filterPriority, debouncedSearchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 750);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleRefresh = () => {
        setDateRange({ fromDate: "", toDate: "" });
        setFilterStatus("all");
        setFilterPriority("all");
        setSearchTerm("");
        fetchMedicationRequests();
    };

    const handlePageChange = (newPageIndex) => {
        setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
        fetchMedicationRequests({ pageIndex: newPageIndex });
    };

    const toggleDropdown = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    const getStats = () => {
        const pendingCount = medicationRequests.filter(r => r.status === 'PendingApproval').length;
        const approvedCount = medicationRequests.filter(r => r.status === 'Approved').length;
        const rejectedCount = medicationRequests.filter(r => r.status === 'Rejected').length;
        const activeCount = medicationRequests.filter(r => r.status === 'Active').length;
        const completedCount = medicationRequests.filter(r => r.status === 'Completed').length;
        const discontinuedCount = medicationRequests.filter(r => r.status === 'Discontinued').length;
        return {
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            active: activeCount,
            completed: completedCount,
            discontinued: discontinuedCount,
            total: medicationRequests.length
        };
    };
    const stats = getStats();

    const statusOptions = [
        { value: "all", label: "Tất cả trạng thái" },
        { value: 'PendingApproval', label: 'Chờ duyệt' },
        { value: 'Approved', label: 'Đã duyệt' },
        { value: 'Rejected', label: 'Từ chối' },
        { value: 'Active', label: 'Đang hoạt động' },
        { value: 'Completed', label: 'Đã hoàn thành' },
        { value: 'Discontinued', label: 'Đã ngừng' }
    ];

    const priorityOptions = [
        { value: "all", label: "Tất cả độ ưu tiên" },
        { value: 'Low', label: 'Thấp' },
        { value: 'Normal', label: 'Bình thường' },
        { value: 'High', label: 'Cao' },
        { value: 'Critical', label: 'Khẩn cấp' }
    ];

    const handleDeleteRequest = async () => {
        try {
            const response = await medicationRequestApi.deleteMedicationRequest(selectedRequestId);
            setShowDeleteModal(false);
            setSelectedRequestId(null);

            if (response.success) {
                setShowAlert(true);
                setAlertInfo({ type: "success", message: "Xóa yêu cầu thuốc thành công" });
                fetchMedicationRequests();
            } else {
                setShowAlert(true);
                setAlertInfo({ type: "error", message: response.message || "Không thể xóa yêu cầu thuốc" });
            }
        } catch (err) {
            setShowDeleteModal(false);
            setSelectedRequestId(null);
            setShowAlert(true);
            setAlertInfo({ type: "error", message: "Có lỗi xảy ra khi xóa yêu cầu thuốc" });
        }
    };

    const handleDeleteClick = (requestId) => {
        setSelectedRequestId(requestId);
        setShowDeleteModal(true);
        setOpenActionId(null);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "PendingApproval":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                        <FiClock className="mr-1.5 h-4 w-4" />
                        Chờ duyệt
                    </span>
                );
            case "Approved":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                        <FiCheckCircle className="mr-1.5 h-4 w-4" />
                        Đã duyệt
                    </span>
                );
            case "Rejected":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                        Từ chối
                    </span>
                );
            case "Active":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                        <FiActivity className="mr-1.5 h-4 w-4" />
                        Đang hoạt động
                    </span>
                );
            case "Completed":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: INFO[50], color: INFO[700] }}>
                        <FiCheckCircle className="mr-1.5 h-4 w-4" />
                        Đã hoàn thành
                    </span>
                );
            case "Discontinued":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: GRAY[50], color: GRAY[700] }}>
                        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                        Đã ngừng
                    </span>
                );
            default:
                return null;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "Critical":
                return (
                    <span className="px-3 py-1 text-sm font-medium rounded-lg inline-flex items-center"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700], minWidth: 80, justifyContent: 'center' }}>
                        Khẩn cấp
                    </span>
                );
            case "High":
                return (
                    <span className="px-3 py-1 text-sm font-medium rounded-lg inline-flex items-center"
                        style={{ backgroundColor: WARNING[50], color: WARNING[700], minWidth: 80, justifyContent: 'center' }}>
                        Cao
                    </span>
                );
            case "Normal":
                return (
                    <span className="px-3 py-1 text-sm font-medium rounded-lg inline-flex items-center"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700], minWidth: 80, justifyContent: 'center' }}>
                        Bình thường
                    </span>
                );
            case "Low":
                return (
                    <span className="px-3 py-1 text-sm font-medium rounded-lg inline-flex items-center"
                        style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700], minWidth: 80, justifyContent: 'center' }}>
                        Thấp
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách yêu cầu thuốc..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Quản lý yêu cầu thuốc
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Quản lý và duyệt các yêu cầu thuốc từ phụ huynh
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${WARNING[500]} 0%, ${WARNING[600]} 100%)`, borderColor: WARNING[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Chờ duyệt
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.pending}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiClock className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`, borderColor: SUCCESS[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Đã duyệt
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.approved}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiCheckCircle className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${ERROR[500]} 0%, ${ERROR[600]} 100%)`, borderColor: ERROR[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Từ chối
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.rejected}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiAlertTriangle className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, borderColor: PRIMARY[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Tổng số
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.total}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiTrendingUp className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl shadow-xl border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo mã yêu cầu, tên học sinh, phụ huynh..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleRefresh}
                                    className="px-3 py-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-80"
                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                    title="Làm mới"
                                >
                                    <FiRefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: PRIMARY[50] }}>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '160px' }}>
                                        MÃ YÊU CẦU
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '200px' }}>
                                        HỌC SINH
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '150px' }}>
                                        PHỤ HUYNH
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '130px' }}>
                                        NGÀY GỬI
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
                                        TRẠNG THÁI
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
                                        ĐỘ ƯU TIÊN
                                    </th>
                                    <th className="py-4 px-6 text-center text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '80px' }}>
                                        THAO TÁC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {medicationRequests.map((request, index) => (
                                    <tr
                                        key={request.id}
                                        className="hover:bg-opacity-50 transition-all duration-200 group"
                                        style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                    >
                                        <td className="py-4 px-6 text-base font-medium whitespace-nowrap" style={{ width: '160px', color: TEXT.PRIMARY }}>
                                            {request.code}
                                        </td>
                                        <td className="py-4 px-6 text-base" style={{ width: '200px' }}>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-base" style={{ color: TEXT.PRIMARY }}>
                                                    {request.studentName}
                                                </span>
                                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    {request.studentCode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-base" style={{ width: '150px' }}>
                                            <div className="flex items-center">
                                                <span className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {request.parentName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-base" style={{ width: '130px' }}>
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {new Date(request.submittedAt).toLocaleDateString("vi-VN", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                                </span>
                                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    {new Date(request.submittedAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-base" style={{ width: '120px' }}>
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="py-4 px-6 text-lg font-bold" style={{ width: '120px' }}>
                                            <span style={{ fontSize: '1.25rem', lineHeight: 1.5 }}>
                                                {getPriorityBadge(request.priorityDisplayName)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center text-base" style={{ width: '80px' }}>
                                            <div style={{ position: 'relative', display: 'inline-block' }} data-dropdown>
                                                <button
                                                    onClick={() => toggleDropdown(request.id)}
                                                    className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                                    style={{ backgroundColor: GRAY[100], color: TEXT.PRIMARY }}
                                                >
                                                    <FiMoreVertical className="w-4 h-4" />
                                                </button>

                                                {openActionId === request.id && (
                                                    <div
                                                        className="absolute py-2 w-48 bg-white rounded-lg shadow-xl border"
                                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: 'white', position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '2px', zIndex: 50 }}
                                                    >
                                                        <button
                                                            className="w-full px-4 py-2 text-left text-base hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                            style={{ color: PRIMARY[600] }}
                                                            onClick={() => navigate(`/schoolnurse/medication-requests/${request.id}`)}
                                                        >
                                                            <FiEye className="w-4 h-4 flex-shrink-0" />
                                                            <span>Xem chi tiết</span>
                                                        </button>
                                                        <button
                                                            className="w-full px-4 py-2 text-left text-base hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                            style={{ color: ERROR[600] }}
                                                            onClick={() => handleDeleteClick(request.id)}
                                                        >
                                                            <FiTrash2 className="w-4 h-4 flex-shrink-0" />
                                                            <span>Xóa yêu cầu</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalCount > 0 && (
                        <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                            <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                Hiển thị{" "}
                                <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                    {((pagination.pageIndex - 1) * pagination.pageSize) + 1}
                                </span>{" "}
                                -{" "}
                                <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                    {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalCount)}
                                </span>{" "}
                                trong tổng số{" "}
                                <span className="font-bold" style={{ color: PRIMARY[600] }}>{pagination.totalCount}</span>{" "}
                                yêu cầu
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.pageIndex - 1)}
                                    disabled={pagination.pageIndex === 1}
                                    className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        borderColor: pagination.pageIndex === 1 ? BORDER.DEFAULT : PRIMARY[300],
                                        color: pagination.pageIndex === 1 ? TEXT.SECONDARY : PRIMARY[600],
                                        backgroundColor: BACKGROUND.DEFAULT
                                    }}
                                >
                                    <FiChevronLeft className="h-4 w-4" />
                                </button>

                                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                    let pageNumber;
                                    if (pagination.totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (pagination.pageIndex <= 3) {
                                        pageNumber = i + 1;
                                    } else if (pagination.pageIndex >= pagination.totalPages - 2) {
                                        pageNumber = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNumber = pagination.pageIndex - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                                            style={{
                                                borderColor: pagination.pageIndex === pageNumber ? PRIMARY[500] : BORDER.DEFAULT,
                                                backgroundColor: pagination.pageIndex === pageNumber ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                                color: pagination.pageIndex === pageNumber ? TEXT.INVERSE : TEXT.PRIMARY
                                            }}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(pagination.pageIndex + 1)}
                                    disabled={pagination.pageIndex === pagination.totalPages}
                                    className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        borderColor: pagination.pageIndex === pagination.totalPages ? BORDER.DEFAULT : PRIMARY[300],
                                        color: pagination.pageIndex === pagination.totalPages ? TEXT.SECONDARY : PRIMARY[600],
                                        backgroundColor: BACKGROUND.DEFAULT
                                    }}
                                >
                                    <FiChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && medicationRequests.length === 0 && (
                        <div className="px-6 py-12 text-center" style={{ borderTop: `1px solid ${BORDER.LIGHT}` }}>
                            <FiPackage className="mx-auto h-12 w-12 mb-4" style={{ color: GRAY[400] }} />
                            <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                Không có yêu cầu thuốc nào
                            </h3>
                            <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                                {searchTerm || filterStatus !== "all" || filterPriority !== "all"
                                    ? "Không tìm thấy kết quả phù hợp với bộ lọc."
                                    : "Chưa có yêu cầu thuốc nào được gửi."}
                            </p>
                            {!searchTerm && filterStatus === "all" && filterPriority === "all" && (
                                <button
                                    className="inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                    onClick={() => navigate('/schoolnurse/medication-requests/create')}
                                >
                                    <FiPlus className="mr-2 h-4 w-4" />
                                    Tạo yêu cầu đầu tiên
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Xóa yêu cầu thuốc"
                message="Bạn có chắc chắn muốn xóa yêu cầu thuốc này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDeleteRequest}
                onClose={() => { setShowDeleteModal(false); setSelectedRequestId(null) }}
            />

            <AlertModal
                isOpen={showAlert}
                type={alertInfo.type}
                title={alertInfo.type === "success" ? "Thành công" : "Lỗi"}
                message={alertInfo.message}
                onClose={() => setShowAlert(false)}
            />
        </div>
    );
};

export default MedicationRequestManagement;
