import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiAlertTriangle, FiCheckCircle, FiActivity, FiRefreshCw, FiEye, FiMoreVertical, FiMapPin, FiHeart, FiTrendingUp, FiPhone, FiTrash2, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import healthEventApi from "../../api/healtheventApi";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AlertModal from "../../components/modal/AlertModal";

const HealthEventManagement = () => {
    const navigate = useNavigate();
    const [healthEvents, setHealthEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
    const [openActionId, setOpenActionId] = useState(null);
    const [filterEmergency, setFilterEmergency] = useState("all");
    const [filterEventType, setFilterEventType] = useState("all");
    const [dateRange, setDateRange] = useState({ fromDate: "", toDate: "" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ type: "", message: "" });
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setOpenActionId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchHealthEvents = async (params = {}) => {
        setLoading(true);
        try {
            const apiParams = {
                pageIndex: params.pageIndex || pagination.pageIndex,
                pageSize: params.pageSize || pagination.pageSize,
                searchTerm: params.searchTerm || searchTerm,
                eventType: filterEventType !== "all" ? filterEventType : undefined,
                isEmergency: filterEmergency !== "all" ? filterEmergency === "emergency" : undefined,
                fromDate: dateRange.fromDate || undefined,
                toDate: dateRange.toDate || undefined,
                location: params.location
            };

            const response = await healthEventApi.getHealthEvents(
                Object.fromEntries(
                    Object.entries(apiParams).filter(([_, value]) => value !== undefined)
                )
            );
            if (response.success) {
                setHealthEvents(response.data);
                setPagination({
                    pageIndex: response.currentPage || 1,
                    totalCount: response.totalCount || 0,
                    totalPages: response.totalPages || 1,
                    pageSize: response.pageSize || 10
                });
            } else {
                setHealthEvents([]);
            }
        } catch (err) {
            setHealthEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthEvents();
    }, []);

    useEffect(() => {
        fetchHealthEvents();
    }, [filterEventType, filterEmergency, debouncedSearchTerm]);

    const handleFilter = () => {
        if (dateRange.fromDate && dateRange.toDate) {
            fetchHealthEvents();
        }
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 750);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleRefresh = () => {
        setDateRange({ fromDate: "", toDate: "" });
        setFilterEmergency("all");
        setFilterEventType("all");
        setSearchTerm("");
        fetchHealthEvents();
    };

    const handlePageChange = (newPageIndex) => {
        setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
        fetchHealthEvents({ pageIndex: newPageIndex });
    };

    const toggleDropdown = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    const getStats = () => {
        const emergencyCount = healthEvents.filter(e => e.isEmergency).length;
        const normalCount = healthEvents.filter(e => !e.isEmergency).length;
        return {
            emergency: emergencyCount,
            normal: normalCount,
            total: healthEvents.length
        };
    };
    const stats = getStats();

    const eventTypeOptions = [
        { value: "all", label: "Tất cả loại" },
        { value: 'Injury', label: 'Chấn thương' },
        { value: 'Illness', label: 'Bệnh, ốm' },
        { value: 'AllergicReaction', label: 'Dị ứng' },
        { value: 'Fall', label: 'Té ngã' },
        { value: 'Emergency', label: 'Cấp cứu' },
        { value: 'Other', label: 'Khác' }
    ];

    const handleDeleteEvent = async () => {
        try {
            const response = await healthEventApi.deleteHealthEvent(selectedEventId);
            setShowDeleteModal(false);
            setSelectedEventId(null);

            if (response.success) {
                setShowAlert(true);
                setAlertInfo({ type: "success", message: "Xóa sự kiện y tế thành công" });
                fetchHealthEvents();
            } else {
                setShowAlert(true);
                setAlertInfo({ type: "error", message: response.message || "Không thể xóa sự kiện y tế" });
            }
        } catch (err) {
            setShowDeleteModal(false);
            setSelectedEventId(null);
            setShowAlert(true);
            setAlertInfo({ type: "error", message: "Có lỗi xảy ra khi xóa sự kiện" });
        }
    };

    const handleDeleteClick = (eventId) => {
        setSelectedEventId(eventId);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách sự kiện sức khỏe..." />
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
                                Sự kiện sức khỏe
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Quản lý và theo dõi các sự kiện sức khỏe của học sinh
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="px-4 py-2 rounded-xl flex items-center transition-all duration-300 hover:opacity-80"
                                style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                onClick={() => navigate('/schoolnurse/health-events/create')}
                            >
                                <FiPlus className="mr-2 h-5 w-5" />
                                Tạo sự kiện mới
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${ERROR[500]} 0%, ${ERROR[600]} 100%)`, borderColor: ERROR[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Khẩn cấp
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.emergency}
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
                        style={{ background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`, borderColor: SUCCESS[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Bình thường
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.normal}
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
                                        placeholder="Tìm kiếm theo tên học sinh, mô tả, loại sự kiện..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filterEmergency}
                                    onChange={(e) => setFilterEmergency(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                >
                                    <option value="all">Tất cả mức độ</option>
                                    <option value="emergency">Khẩn cấp</option>
                                    <option value="normal">Bình thường</option>
                                </select>

                                <select
                                    value={filterEventType}
                                    onChange={(e) => setFilterEventType(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                >
                                    {eventTypeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                                        <input
                                            type="date"
                                            name="fromDate"
                                            value={dateRange.fromDate}
                                            onChange={handleDateChange}
                                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        />
                                    </div>
                                    <span style={{ color: TEXT.SECONDARY }}>-</span>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                                        <input
                                            type="date"
                                            name="toDate"
                                            value={dateRange.toDate}
                                            onChange={handleDateChange}
                                            min={dateRange.fromDate}
                                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleFilter}
                                        disabled={!dateRange.fromDate || !dateRange.toDate}
                                        className="px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                    >
                                        Lọc
                                    </button>
                                </div>

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
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '160px' }}>
                                        MÃ SỰ KIỆN
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '200px' }}>
                                        HỌC SINH
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '160px' }}>
                                        LOẠI SỰ KIỆN
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '130px' }}>
                                        THỜI GIAN XẢY RA
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '150px' }}>
                                        NGƯỜI XỬ LÝ
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '80px' }}>
                                        THAO TÁC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {healthEvents.map((event, index) => (
                                    <tr
                                        key={event.id}
                                        className="hover:bg-opacity-50 transition-all duration-200 group"
                                        style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                    >
                                        <td className="py-4 px-6 text-sm font-medium whitespace-nowrap" style={{ width: '160px', color: TEXT.PRIMARY }}>
                                            {event.code}
                                        </td>
                                        <td className="py-4 px-6" style={{ width: '200px' }}>
                                            <div className="flex flex-col">
                                                <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                    {event.studentName}
                                                </span>
                                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    {event.studentCode}
                                                </span>
                                                {event.medicalItemDetails?.[0]?.studentClass && (
                                                    <span className="text-xs mt-1 px-2 py-1 rounded-md inline-block w-fit"
                                                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}
                                                    >
                                                        {event.medicalItemDetails[0].studentClass}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6" style={{ width: '160px' }}>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="px-2.5 py-1 text-sm font-medium rounded-md"
                                                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}
                                                >
                                                    {event.eventTypeDisplayName}
                                                </span>
                                                {event.isEmergency && (
                                                    <span
                                                        className="p-1 text-xs font-medium rounded-md"
                                                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}
                                                        title={event.emergencyStatusText}
                                                    >
                                                        <FiAlertTriangle className="h-4 w-4" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6" style={{ width: '130px' }}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {new Date(event.occurredAt).toLocaleDateString("vi-VN", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                                </span>
                                                <span className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                                    {new Date(event.occurredAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6" style={{ width: '150px' }}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {event.handledByName || "Chưa phân công"}
                                                </span>
                                                {event.parentNotice && (
                                                    <div className="flex items-center mt-1 text-xs" style={{ color: SUCCESS[600] }}>
                                                        <FiPhone className="mr-1 h-3 w-3" />
                                                        {event.parentNotice}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center" style={{ width: '80px' }}>
                                            <div style={{ position: 'relative' }} className="dropdown-container">
                                                <button
                                                    onClick={() => toggleDropdown(event.id)}
                                                    className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                                    style={{ backgroundColor: GRAY[100], color: TEXT.PRIMARY }}
                                                >
                                                    <FiMoreVertical className="w-4 h-4" />
                                                </button>

                                                {openActionId === event.id && (
                                                    <div
                                                        className="absolute py-2 w-48 bg-white rounded-lg shadow-xl border"
                                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: 'white', position: 'absolute', right: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
                                                    >
                                                        <button
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                            style={{ color: PRIMARY[600] }}
                                                            onClick={() => navigate(`/schoolnurse/health-events/${event.id}`)}
                                                        >
                                                            <FiEye className="w-4 h-4 flex-shrink-0" />
                                                            <span>Xem chi tiết</span>
                                                        </button>
                                                        <button
                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                            style={{ color: ERROR[600] }}
                                                            onClick={() => handleDeleteClick(event.id)}
                                                        >
                                                            <FiTrash2 className="w-4 h-4 flex-shrink-0" />
                                                            <span>Xóa sự kiện</span>
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
                                sự kiện
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

                    {!loading && healthEvents.length === 0 && (
                        <div className="px-6 py-12 text-center" style={{ borderTop: `1px solid ${BORDER.LIGHT}` }}>
                            <FiActivity className="mx-auto h-12 w-12 mb-4" style={{ color: GRAY[400] }} />
                            <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                Không có sự kiện sức khỏe nào
                            </h3>
                            <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                                {searchTerm || filterEmergency !== "all" || filterEventType !== "all"
                                    ? "Không tìm thấy kết quả phù hợp với bộ lọc."
                                    : "Chưa có sự kiện sức khỏe nào được ghi nhận."}
                            </p>
                            {!searchTerm && filterEmergency === "all" && filterEventType === "all" && (
                                <button
                                    className="inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                    onClick={() => navigate('/schoolnurse/health-events/create')}
                                >
                                    <FiPlus className="mr-2 h-4 w-4" />
                                    Tạo sự kiện đầu tiên
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Xóa sự kiện y tế"
                message="Bạn có chắc chắn muốn xóa sự kiện y tế này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDeleteEvent}
                onClose={() => { setShowDeleteModal(false); setSelectedEventId(null) }}
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

export default HealthEventManagement;