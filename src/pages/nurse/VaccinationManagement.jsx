import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiCalendar, FiCheckCircle, FiClock, FiAlertTriangle, FiRefreshCw, FiEye, FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import vaccineSessionApi from "../../api/vaccineSessionApi";

const VaccinationManagement = () => {
    const [activeTab, setActiveTab] = useState("all");
    const [vaccinationList, setVaccinationList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
    const [openActionId, setOpenActionId] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setOpenActionId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchVaccinationSessions = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const apiParams = {
                pageIndex: params.pageIndex || pagination.pageIndex,
                pageSize: pagination.pageSize,
                searchTerm: params.searchTerm || searchTerm,
                orderBy: 'startTime desc',
                ...params
            };

            const response = await vaccineSessionApi.getVaccineSessions(apiParams);
            if (response.success) {
                const mappedData = response.data.map(session => ({
                    id: session.id,
                    title: session.sessionName || "Buổi tiêm chủng",
                    scheduledDate: session.startTime ? session.startTime.split('T')[0] : "",
                    startTime: session.startTime,
                    endTime: session.endTime,
                    status: mapApiStatusToUIStatus(session.status),
                    grades: session.classes ? session.classes.map(cls => cls.name) : [],
                    totalStudents: session.totalStudents || (session.classes ? session.classes.length * 25 : 0), // Estimate 25 students per class
                    confirmedParents: session.confirmedCount || session.parentConfirmationCount || 0,
                    vaccinatedStudents: session.vaccinatedCount || session.completedCount || 0,
                    vaccineInfo: session.vaccineTypeName || "Không xác định",
                    description: session.notes || "",
                    location: session.location || "Phòng y tế",
                    vaccineTypeId: session.vaccineTypeId,
                    classDetails: session.classes || []
                }));
                setVaccinationList(mappedData);
                setPagination(prev => ({
                    ...prev,
                    pageIndex: response.currentPage || 1,
                    totalCount: response.totalCount || response.data.length,
                    totalPages: response.totalPages || Math.ceil((response.totalCount || response.data.length) / (response.pageSize || prev.pageSize)),
                    pageSize: response.pageSize || prev.pageSize
                }));
            } else {
                setError(response.message || "Không thể tải danh sách tiêm chủng");
                setVaccinationList([]);
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tải dữ liệu");
            setVaccinationList([]);
        } finally {
            setLoading(false);
        }
    };

    const mapApiStatusToUIStatus = (apiStatus) => {
        if (!apiStatus) return "planning";
        const statusMapping = {
            'PENDINGAPPROVAL': 'planning',
            'WAITINGFORPARENTCONSENT': 'upcoming',
            'SCHEDULED': 'scheduled',
            'DECLINED': 'cancelled',
            'COMPLETED': 'completed'
        };
        return statusMapping[apiStatus.toUpperCase().replace(/[^A-Z]/g, '')] || 'planning';
    };

    useEffect(() => {
        fetchVaccinationSessions({
            status: mapUIStatusToApiStatus(activeTab)
        });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== "") {
                fetchVaccinationSessions({ searchTerm });
            } else {
                fetchVaccinationSessions();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        fetchVaccinationSessions({
            searchTerm: searchTerm,
            status: mapUIStatusToApiStatus(newTab),
            pageIndex: 1
        });
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const mapUIStatusToApiStatus = (uiStatus) => {
        const statusMapping = {
            'planning': 'PendingApproval',
            'upcoming': 'WaitingForParentConsent',
            'scheduled': 'Scheduled',
            'completed': 'Completed',
            'cancelled': 'Declined',
            'all': ''
        };
        return statusMapping[uiStatus] || '';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "planning":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                        <FiClock className="mr-1.5 h-4 w-4" />
                        Lên kế hoạch
                    </span>
                );
            case "upcoming":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                        Chờ phụ huynh
                    </span>
                );
            case "scheduled":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: INFO[50], color: INFO[700] }}>
                        <FiCalendar className="mr-1.5 h-4 w-4" />
                        Đã lên lịch
                    </span>
                );
            case "completed":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                        <FiCheckCircle className="mr-1.5 h-4 w-4" />
                        Đã hoàn thành
                    </span>
                );
            case "cancelled":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                        Từ chối
                    </span>
                );
            default:
                return null;
        }
    };

    const filteredVaccinations = vaccinationList.filter(
        (vaccination) =>
            (activeTab === "all" || vaccination.status === activeTab) &&
            (vaccination.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vaccination.vaccineInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vaccination.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vaccination.grades.some((grade) =>
                    grade.toLowerCase().includes(searchTerm.toLowerCase())
                ))
    );

    const toggleDropdown = (id) => { setOpenActionId(openActionId === id ? null : id); };

    const getStats = () => {
        const planningCount = vaccinationList.filter((v) => v.status === "planning").length;
        const upcomingCount = vaccinationList.filter((v) => v.status === "upcoming").length;
        const scheduledCount = vaccinationList.filter((v) => v.status === "scheduled").length;
        const completedCount = vaccinationList.filter((v) => v.status === "completed").length;
        const totalClassesCount = vaccinationList.reduce(
            (sum, v) => sum + (v.grades ? v.grades.length : 0),
            0
        );
        return {
            planning: planningCount,
            upcoming: upcomingCount,
            scheduled: scheduledCount,
            completed: completedCount,
            totalClasses: totalClassesCount,
        };
    };
    const stats = getStats();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách tiêm chủng..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>Quản lý tiêm chủng</h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Quản lý kế hoạch và lịch tiêm chủng của học sinh
                            </p>
                            {error && (
                                <div className="mt-2 text-sm px-3 py-2 rounded-lg flex items-center"
                                    style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                                    <FiAlertTriangle className="mr-2 h-4 w-4" />
                                    {error}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to="/schoolnurse/vaccination/create"
                                className="px-4 py-2 rounded-xl flex items-center transition-all duration-300 hover:opacity-80"
                                style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                            >
                                <FiPlus className="mr-2 h-5 w-5" />
                                Tạo buổi tiêm chủng
                            </Link>
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
                                        Lên kế hoạch
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.planning}
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
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, borderColor: PRIMARY[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Chờ phụ huynh
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.upcoming}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiCalendar className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${INFO[400]} 0%, ${INFO[500]} 100%)`, borderColor: INFO[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Đã lên lịch
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.scheduled}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiCalendar className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${SUCCESS[400]} 0%, ${SUCCESS[500]} 100%)`, borderColor: SUCCESS[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Đã hoàn thành
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.completed}
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
                </div>

                <div className="rounded-2xl shadow-xl border backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên, lớp..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleTabChange("all")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: activeTab === "all" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: activeTab === "all" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${activeTab === "all" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    <FiRefreshCw className="mr-2 h-4 w-4" />
                                    Tất cả
                                </button>

                                <button
                                    onClick={() => handleTabChange("planning")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: activeTab === "planning" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: activeTab === "planning" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${activeTab === "planning" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    <FiClock className="mr-2 h-4 w-4" />
                                    Lên kế hoạch
                                </button>

                                <button
                                    onClick={() => handleTabChange("upcoming")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: activeTab === "upcoming" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: activeTab === "upcoming" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${activeTab === "upcoming" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    <FiCalendar className="mr-2 h-4 w-4" />
                                    Chờ phụ huynh
                                </button>

                                <button
                                    onClick={() => handleTabChange("scheduled")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: activeTab === "scheduled" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: activeTab === "scheduled" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${activeTab === "scheduled" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    <FiCheckCircle className="mr-2 h-4 w-4" />
                                    Đã lên lịch
                                </button>

                                <button
                                    onClick={() => handleTabChange("completed")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: activeTab === "completed" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: activeTab === "completed" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${activeTab === "completed" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    <FiCheckCircle className="mr-2 h-4 w-4" />
                                    Đã hoàn thành
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-visible">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: PRIMARY[50] }}>
                                    <th className="w-[250px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Tiêm chủng
                                    </th>
                                    <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Lớp
                                    </th>
                                    <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Ngày tiêm
                                    </th>
                                    <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Trạng thái
                                    </th>
                                    <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Tham gia
                                    </th>
                                    <th className="w-[100px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {filteredVaccinations.map((vaccination, index) => (
                                    <tr
                                        key={vaccination.id}
                                        className="hover:bg-opacity-50 transition-all duration-200 group"
                                        style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                    >
                                        <td className="w-[250px] py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                    {vaccination.title}
                                                </span>
                                                <span className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                    {vaccination.vaccineInfo}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="w-[150px] py-4 px-6">
                                            <div className="flex flex-wrap gap-1">
                                                {vaccination.grades.map((grade, idx) => (
                                                    <span key={idx} className="px-2 py-1 text-xs font-medium rounded-lg" style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                                                        {grade}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="w-[150px] py-4 px-6">
                                            <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {new Date(vaccination.scheduledDate).toLocaleDateString("vi-VN")}
                                            </span>
                                            {vaccination.startTime && vaccination.endTime && (
                                                <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                    {new Date(vaccination.startTime).toLocaleTimeString("vi-VN", {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })} - {new Date(vaccination.endTime).toLocaleTimeString("vi-VN", {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="w-[150px] py-4 px-6">
                                            {getStatusBadge(vaccination.status)}
                                        </td>
                                        <td className="w-[150px] py-4 px-6">
                                            {vaccination.status === "completed" ? (
                                                <div>
                                                    <div className="text-sm font-medium" style={{ color: SUCCESS[600] }}>
                                                        {vaccination.vaccinatedStudents || 0}/{vaccination.totalStudents}
                                                    </div>
                                                    <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                        Đã hoàn thành
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-sm font-medium" style={{ color: PRIMARY[600] }}>
                                                        {Math.floor(vaccination.totalStudents * 0.85)}/{vaccination.totalStudents}
                                                    </div>
                                                    <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                        Đã xác nhận
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{ width: `85%`, backgroundColor: PRIMARY[500] }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="w-[100px] py-4 px-6">
                                            <div style={{ position: 'relative' }} className="dropdown-container">
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <button
                                                        onClick={() => toggleDropdown(vaccination.id)}
                                                        className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90 hover:shadow-md"
                                                        style={{ backgroundColor: GRAY[100], color: TEXT.PRIMARY }}
                                                    >
                                                        <FiMoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
                                                    </button>

                                                    {openActionId === vaccination.id && (
                                                        <div
                                                            className="absolute py-2 w-48 bg-white rounded-lg shadow-xl border"
                                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: 'white', position: 'absolute', right: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
                                                        >
                                                            <Link
                                                                to={`/schoolnurse/vaccination/${vaccination.id}`}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                style={{ color: PRIMARY[600] }}
                                                                onClick={() => setOpenActionId(null)}
                                                            >
                                                                <FiEye className="w-4 h-4 flex-shrink-0" />
                                                                <span>Xem chi tiết</span>
                                                            </Link>
                                                            <button
                                                                onClick={() => { setOpenActionId(null); }}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                style={{ color: ERROR[600] }}
                                                            >
                                                                <FiTrash2 className="w-4 h-4 flex-shrink-0" />
                                                                <span>Xóa</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalCount > 0 && (
                        <div className="px-6 py-4 border-t flex items-center justify-end" style={{ borderColor: BORDER.LIGHT }}>
                            <div className="flex items-center gap-2">
                                {pagination.totalPages > 1 && (
                                    <>
                                        <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                            Trang {pagination.pageIndex} / {pagination.totalPages}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    if (pagination.pageIndex > 1) {
                                                        const newPageIndex = pagination.pageIndex - 1;
                                                        setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
                                                        fetchVaccinationSessions({ pageIndex: newPageIndex, status: mapUIStatusToApiStatus(activeTab) });
                                                    }
                                                }}
                                                disabled={pagination.pageIndex <= 1}
                                                className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                                style={{
                                                    backgroundColor: pagination.pageIndex > 1 ? PRIMARY[500] : GRAY[200],
                                                    color: pagination.pageIndex > 1 ? TEXT.INVERSE : TEXT.SECONDARY
                                                }}
                                            >
                                                Trước
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (pagination.pageIndex < pagination.totalPages) {
                                                        const newPageIndex = pagination.pageIndex + 1;
                                                        setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
                                                        fetchVaccinationSessions({ pageIndex: newPageIndex, status: mapUIStatusToApiStatus(activeTab) });
                                                    }
                                                }}
                                                disabled={pagination.pageIndex >= pagination.totalPages}
                                                className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                                style={{
                                                    backgroundColor: pagination.pageIndex < pagination.totalPages ? PRIMARY[500] : GRAY[200],
                                                    color: pagination.pageIndex < pagination.totalPages ? TEXT.INVERSE : TEXT.SECONDARY
                                                }}
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {!loading && filteredVaccinations.length === 0 && (
                        <div className="px-6 py-12 text-center" style={{ borderTop: `1px solid ${BORDER.LIGHT}` }}>
                            <FiCalendar className="mx-auto h-12 w-12 mb-4" style={{ color: GRAY[400] }} />
                            <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                Không có buổi tiêm chủng nào
                            </h3>
                            <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                                {searchTerm ? "Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm." : "Chưa có buổi tiêm chủng nào được tạo."}
                            </p>
                            {!searchTerm && (
                                <Link
                                    to="/schoolnurse/vaccination/create"
                                    className="inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                >
                                    <FiPlus className="mr-2 h-4 w-4" />
                                    Tạo buổi tiêm chủng đầu tiên
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VaccinationManagement;