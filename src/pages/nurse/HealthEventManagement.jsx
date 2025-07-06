import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiAlertTriangle, FiCheckCircle, FiClock, FiActivity, FiRefreshCw, FiEye, FiMoreVertical, FiMapPin, FiHeart, FiTrendingUp, FiPhone, FiBell } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
// import medicalApi from "../../api/medicalApi"; // Will be implemented when API is ready

const HealthEventManagement = () => {
    const [activeTab, setActiveTab] = useState("all");
    const navigate = useNavigate();
    const [healthEvents, setHealthEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
    const [openActionId, setOpenActionId] = useState(null);
    const [filterEmergency, setFilterEmergency] = useState("all");
    const [filterEventType, setFilterEventType] = useState("all");

    const mockData = {
        success: true,
        message: "Thành công",
        data: [
            {
                id: "event-001",
                userId: "user-001",
                handledById: "nurse-001",
                eventType: "Injury",
                eventTypeDisplayName: "Chấn thương",
                description: "Học sinh bị ngã và trầy xước đầu gối khi chơi thể thao",
                occurredAt: "2024-07-04T09:30:00.000Z",
                location: "Sân thể thao",
                actionTaken: "Vệ sinh vết thương và băng bó",
                code: "INJ-001",
                outcome: "Ổn định, theo dõi",
                isEmergency: false,
                relatedMedicalConditionId: null,
                createdDate: "2024-07-04T09:35:00.000Z",
                canTakeOwnership: true,
                canComplete: false,
                studentName: "Nguyễn Văn An",
                studentCode: "HS001",
                handledByName: "Y tá Phạm Thị Mai",
                relatedMedicalConditionName: null,
                emergencyStatusText: "Không khẩn cấp",
                currentHealthStatus: "Ổn định",
                parentNotice: "Đã thông báo phụ huynh",
                medicalItemDetails: [
                    {
                        studentName: "Nguyễn Văn An",
                        studentClass: "10A1",
                        nurseName: "Y tá Phạm Thị Mai",
                        medicationName: "Nước muối sinh lý",
                        medicationQuantity: 1,
                        medicationDosage: "Rửa vết thương",
                        supplyQuantity: 2
                    }
                ]
            },
            {
                id: "event-002",
                userId: "user-002",
                handledById: "nurse-002",
                eventType: "Illness",
                eventTypeDisplayName: "Bệnh tật",
                description: "Học sinh bị sốt cao và đau đầu",
                occurredAt: "2024-07-04T11:15:00.000Z",
                location: "Lớp học 9B2",
                actionTaken: "Đo thân nhiệt, cho nghỉ ngơi và liên hệ phụ huynh",
                code: "ILL-002",
                outcome: "Đã liên hệ phụ huynh đưa về nhà",
                isEmergency: true,
                relatedMedicalConditionId: "condition-001",
                createdDate: "2024-07-04T11:20:00.000Z",
                canTakeOwnership: false,
                canComplete: true,
                studentName: "Trần Thị Bình",
                studentCode: "HS002",
                handledByName: "Y tá Lê Văn Đức",
                relatedMedicalConditionName: "Dị ứng thức ăn",
                emergencyStatusText: "Khẩn cấp",
                currentHealthStatus: "Cần theo dõi",
                parentNotice: "Đã gọi điện và phụ huynh đến đón",
                medicalItemDetails: [
                    {
                        studentName: "Trần Thị Bình",
                        studentClass: "9B2",
                        nurseName: "Y tá Lê Văn Đức",
                        medicationName: "Paracetamol",
                        medicationQuantity: 1,
                        medicationDosage: "500mg",
                        supplyQuantity: 0
                    }
                ]
            }
        ],
        errors: [],
        totalCount: 25,
        pageSize: 10,
        currentPage: 1,
        totalPages: 3
    };

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
        setError(null);
        try {
            // TODO: Replace with real API call
            // const response = await medicalApi.getHealthEvents(params);

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = mockData;

            if (response.success) {
                setHealthEvents(response.data);
                setPagination(prev => ({
                    ...prev,
                    pageIndex: response.currentPage || 1,
                    totalCount: response.totalCount || response.data.length,
                    totalPages: response.totalPages || Math.ceil((response.totalCount || response.data.length) / (response.pageSize || prev.pageSize)),
                    pageSize: response.pageSize || prev.pageSize
                }));
            } else {
                setError(response.message || "Không thể tải danh sách sự kiện sức khỏe");
                setHealthEvents([]);
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tải dữ liệu");
            setHealthEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthEvents();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchHealthEvents({
                searchTerm,
                eventType: filterEventType === "all" ? "" : filterEventType,
                isEmergency: filterEmergency === "all" ? null : filterEmergency === "emergency"
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterEventType, filterEmergency]);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        fetchHealthEvents({
            searchTerm: searchTerm,
            status: newTab === "all" ? "" : newTab,
            pageIndex: 1
        });
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const getEventTypeColor = (eventType) => {
        switch (eventType?.toLowerCase()) {
            case "injury": return WARNING;
            case "illness": return ERROR;
            case "medication": return INFO;
            case "checkup": return SUCCESS;
            case "emergency": return ERROR;
            default: return PRIMARY;
        }
    };

    const getStatusBadge = (event) => {
        if (event.isEmergency) {
            return (
                <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                    style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                    <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                    Khẩn cấp
                </span>
            );
        }

        if (event.outcome?.includes("hoàn thành") || event.outcome?.includes("ổn định")) {
            return (
                <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                    style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                    <FiCheckCircle className="mr-1.5 h-4 w-4" />
                    Đã xử lý
                </span>
            );
        }

        return (
            <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                <FiClock className="mr-1.5 h-4 w-4" />
                Đang xử lý
            </span>
        );
    };

    const getHealthStatusBadge = (status) => {
        const statusLower = status?.toLowerCase() || "";

        if (statusLower.includes("ổn định")) {
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-lg"
                    style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                    Ổn định
                </span>
            );
        }

        if (statusLower.includes("cần theo dõi")) {
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-lg"
                    style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                    Cần theo dõi
                </span>
            );
        }

        if (statusLower.includes("nghiêm trọng")) {
            return (
                <span className="px-2 py-1 text-xs font-medium rounded-lg"
                    style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                    Nghiêm trọng
                </span>
            );
        }

        return (
            <span className="px-2 py-1 text-xs font-medium rounded-lg"
                style={{ backgroundColor: INFO[50], color: INFO[700] }}>
                {status}
            </span>
        );
    };

    const filteredEvents = healthEvents.filter(event => {
        const matchesSearch = event.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.eventTypeDisplayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEmergency = filterEmergency === "all" ||
            (filterEmergency === "emergency" && event.isEmergency) ||
            (filterEmergency === "normal" && !event.isEmergency);

        const matchesEventType = filterEventType === "all" ||
            event.eventType?.toLowerCase() === filterEventType.toLowerCase();

        return matchesSearch && matchesEmergency && matchesEventType;
    });

    const toggleDropdown = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    const getStats = () => {
        const emergencyCount = healthEvents.filter(e => e.isEmergency).length;
        const injuryCount = healthEvents.filter(e => e.eventType === "Injury").length;
        const illnessCount = healthEvents.filter(e => e.eventType === "Illness").length;
        const completedCount = healthEvents.filter(e =>
            e.outcome?.includes("hoàn thành") || e.outcome?.includes("ổn định")
        ).length;

        return {
            emergency: emergencyCount,
            injury: injuryCount,
            illness: illnessCount,
            completed: completedCount,
            total: healthEvents.length
        };
    };

    const stats = getStats();

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
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Sự kiện sức khỏe
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Quản lý và theo dõi các sự kiện sức khỏe của học sinh
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                        style={{ background: `linear-gradient(135deg, ${WARNING[500]} 0%, ${WARNING[600]} 100%)`, borderColor: WARNING[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Chấn thương
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.injury}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiActivity className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${INFO[500]} 0%, ${INFO[600]} 100%)`, borderColor: INFO[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Bệnh tật
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.illness}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiHeart className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
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
                                        Đã xử lý
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

                {/* Main Content */}
                <div className="rounded-2xl shadow-xl border backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>

                    {/* Filters and Search */}
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên học sinh, mô tả, loại sự kiện..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY
                                        }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {/* Emergency Filter */}
                                <select
                                    value={filterEmergency}
                                    onChange={(e) => setFilterEmergency(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        color: TEXT.PRIMARY
                                    }}
                                >
                                    <option value="all">Tất cả mức độ</option>
                                    <option value="emergency">Khẩn cấp</option>
                                    <option value="normal">Bình thường</option>
                                </select>

                                {/* Event Type Filter */}
                                <select
                                    value={filterEventType}
                                    onChange={(e) => setFilterEventType(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        color: TEXT.PRIMARY
                                    }}
                                >
                                    <option value="all">Tất cả loại</option>
                                    <option value="injury">Chấn thương</option>
                                    <option value="illness">Bệnh tật</option>
                                    <option value="medication">Thuốc</option>
                                    <option value="checkup">Kiểm tra</option>
                                </select>

                                <button
                                    onClick={() => fetchHealthEvents()}
                                    className="px-3 py-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-80"
                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                    title="Làm mới"
                                >
                                    <FiRefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: PRIMARY[50] }}>
                                    <th className="w-[200px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Học sinh
                                    </th>
                                    <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Loại sự kiện
                                    </th>
                                    <th className="w-[250px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Mô tả
                                    </th>
                                    <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Thời gian
                                    </th>
                                    <th className="w-[120px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Trạng thái
                                    </th>
                                    <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Người xử lý
                                    </th>
                                    <th className="w-[100px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {filteredEvents.map((event, index) => (
                                    <tr
                                        key={event.id}
                                        className="hover:bg-opacity-50 transition-all duration-200 group"
                                        style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                    >
                                        <td className="w-[200px] py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                    {event.studentName}
                                                </span>
                                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    {event.studentCode}
                                                </span>
                                                {event.medicalItemDetails?.[0]?.studentClass && (
                                                    <span className="text-xs mt-1 px-2 py-1 rounded-lg inline-block w-fit"
                                                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                                                        {event.medicalItemDetails[0].studentClass}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="w-[150px] py-4 px-6">
                                            <div className="flex flex-col">
                                                <span
                                                    className="px-3 py-1 text-sm font-medium rounded-lg inline-block w-fit"
                                                    style={{
                                                        backgroundColor: getEventTypeColor(event.eventType)[50],
                                                        color: getEventTypeColor(event.eventType)[700]
                                                    }}
                                                >
                                                    {event.eventTypeDisplayName}
                                                </span>
                                                {event.isEmergency && (
                                                    <span className="text-xs mt-1 font-medium" style={{ color: ERROR[600] }}>
                                                        <FiAlertTriangle className="inline mr-1 h-3 w-3" />
                                                        Khẩn cấp
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="w-[250px] py-4 px-6">
                                            <div className="flex flex-col">
                                                <p className="text-sm line-clamp-2" style={{ color: TEXT.PRIMARY }}>
                                                    {event.description}
                                                </p>
                                                <div className="flex items-center mt-2 text-xs" style={{ color: TEXT.SECONDARY }}>
                                                    <FiMapPin className="mr-1 h-3 w-3" />
                                                    {event.location}
                                                </div>
                                                {event.currentHealthStatus && (
                                                    <div className="mt-1">
                                                        {getHealthStatusBadge(event.currentHealthStatus)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="w-[150px] py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {new Date(event.occurredAt).toLocaleDateString("vi-VN")}
                                                </span>
                                                <span className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                                    {new Date(event.occurredAt).toLocaleTimeString("vi-VN", {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                <span className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                    Mã: {event.code}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="w-[120px] py-4 px-6">
                                            {getStatusBadge(event)}
                                        </td>
                                        <td className="w-[150px] py-4 px-6">
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
                                        <td className="w-[100px] py-4 px-6">
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
                                                        style={{
                                                            borderColor: BORDER.DEFAULT,
                                                            backgroundColor: 'white',
                                                            position: 'absolute',
                                                            right: 'calc(100% + 10px)',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            zIndex: 50
                                                        }}
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
                                                            style={{ color: WARNING[600] }}
                                                            onClick={() => setOpenActionId(null)}
                                                        >
                                                            <FiBell className="w-4 h-4 flex-shrink-0" />
                                                            <span>Thông báo phụ huynh</span>
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
                                                        fetchHealthEvents({ pageIndex: newPageIndex });
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
                                                        fetchHealthEvents({ pageIndex: newPageIndex });
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

                    {/* Empty State */}
                    {!loading && filteredEvents.length === 0 && (
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
        </div>
    );
};

export default HealthEventManagement;