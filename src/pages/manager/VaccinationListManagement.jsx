import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ReactDOM from "react-dom";
import { FiSearch, FiFilter, FiCalendar, FiUsers, FiCheckCircle, FiClock, FiAlertCircle, FiDownload, FiUpload, FiPrinter, FiMoreVertical, FiCheck, FiX, FiEye, FiRefreshCw } from "react-icons/fi";
import { PRIMARY, TEXT, BACKGROUND, BORDER, SUCCESS, WARNING, ERROR, INFO, SHADOW, GRAY } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import ConfirmActionModal from "../../components/modal/ConfirmActionModal";
import vaccineSessionApi from '../../api/vaccineSessionApi';

const VaccinationListManagement = () => {
    const [vaccinationList, setVaccinationList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        status: ''
    });
    const [openActionId, setOpenActionId] = useState(null);
    const dropdownRef = useRef(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    // const [showConfirmModal, setShowConfirmModal] = useState(false);
    // const [confirmAction, setConfirmAction] = useState({
    //     type: 'approve',
    //     itemId: null
    // });
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenActionId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters.status]);

    // Fetch vaccination data from API
    useEffect(() => {
        const fetchVaccinationSessions = async () => {
            try {
                const data = await vaccineSessionApi.getVaccineSessions({
                    pageIndex: currentPage,
                    pageSize,
                    searchTerm,
                    status: filters.status,
                });

                setVaccinationList(data.data);
                setTotalCount(data.totalCount);
                setTotalPages(data.totalPages);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching vaccination sessions:', error);
                setLoading(false);
            }
        };

        fetchVaccinationSessions();
    }, [currentPage, pageSize, searchTerm, filters.status]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            WaitingForParentConsent: {
                bg: WARNING[50],
                text: WARNING[700],
                label: "Sắp diễn ra",
                icon: FiClock
            },
            Scheduled: {
                bg: SUCCESS[50],
                text: SUCCESS[700],
                label: "Đã hoàn thành",
                icon: FiCheckCircle
            },
            PendingApproval: {
                bg: PRIMARY[50],
                text: PRIMARY[700],
                label: "Lên kế hoạch",
                icon: FiAlertCircle
            },
        };

        const config = statusConfig[status] || statusConfig.WaitingForParentConsent;
        const Icon = config.icon;

        return (
            <span
                className="px-3 py-1.5 text-sm font-medium rounded-xl inline-flex items-center gap-1.5 transition-all duration-200"
                style={{
                    backgroundColor: config.bg,
                    color: config.text,
                    boxShadow: `0 2px 4px ${config.bg}80`
                }}
            >
                <Icon className="w-4 h-4" />
                {config.label}
            </span>
        );
    };

    const filteredVaccinations = vaccinationList.filter(
        (vaccination) => {
            const matchesSearch = vaccination.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vaccination.vaccineTypeName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = !filters.status || vaccination.status === filters.status;

            return matchesSearch && matchesStatus;
        }
    );

    // Calculate statistics
    const getStats = () => {
        const today = new Date();
        const upcomingCount = vaccinationList.filter(
            (v) => v.status === "PendingApproval" || v.status === "WaitingForParentConsent"
        ).length;

        const completedCount = vaccinationList.filter(
            (v) => v.status === "Scheduled"
        ).length;

        const thisMonthCount = vaccinationList.filter((v) => {
            const vacDate = new Date(v.scheduledDate);
            return (
                vacDate.getMonth() === today.getMonth() &&
                vacDate.getFullYear() === today.getFullYear()
            );
        }).length;

        const totalStudentsCount = vaccinationList.reduce(
            (sum, v) => sum + v.totalStudents,
            0
        );

        return {
            upcoming: upcomingCount,
            completed: completedCount,
            thisMonth: thisMonthCount,
            totalStudents: totalStudentsCount,
        };
    };

    const stats = getStats();

    // const handleApprove = async (id) => {
    //     try {
    //         const response = await vaccineSessionApi.approveVaccineSession(id);
    //         setAlertConfig({
    //             type: "success",
    //             title: "Thành công",
    //             message: response.data.message
    //         });
    //         setShowAlertModal(true);
    //         setShowConfirmModal(false);
    //         setOpenActionId(null);
    //     } catch (error) {
    //         console.error('Error approving vaccination:', error);
    //         setAlertConfig({
    //             type: "error",
    //             title: "Lỗi",
    //             message: "Đã có lỗi xảy ra. Vui lòng thử lại."
    //         });
    //         setShowAlertModal(true);
    //         setShowConfirmModal(false);
    //     }
    // };

    // const handleFinalize = async (id) => {
    //     try {
    //         const response = await vaccineSessionApi.finalizeVaccineSession(id);
    //         setAlertConfig({
    //             type: "success",
    //             title: "Thành công",
    //             message: response.data.message
    //         });
    //         setShowAlertModal(true);
    //         setShowConfirmModal(false);
    //         setOpenActionId(null);
    //     } catch (error) {
    //         console.error('Error approving vaccination:', error);
    //         setAlertConfig({
    //             type: "error",
    //             title: "Lỗi",
    //             message: "Đã có lỗi xảy ra. Vui lòng thử lại."
    //         });
    //         setShowAlertModal(true);
    //         setShowConfirmModal(false);
    //     }
    // };
    
    // const handleReject = async (id) => {
    //     try {
    //         const response = await vaccineSessionApi.declineVaccineSession(id);
    //         setAlertConfig({
    //             type: "info",
    //             title: "Thành công",
    //             message: response.data.message
    //         });
    //         setShowAlertModal(true);
    //         setShowConfirmModal(false);
    //         setOpenActionId(null);
    //     } catch (error) {
    //         console.error('Error rejecting vaccination:', error);
    //         setAlertConfig({
    //             type: "error",
    //             title: "Lỗi",
    //             message: "Đã có lỗi xảy ra. Vui lòng thử lại."
    //         });
    //         setShowAlertModal(true);
    //         setShowConfirmModal(false);
    //     }
    // };

    // const handleConfirmAction = async (reason) => {
    //     try {
    //         let response;
    //         let message = '';

    //         // Kiểm tra loại hành động và gọi đúng API
    //         switch (confirmAction.type) {
    //             case 'approve':
    //                 response = await vaccineSessionApi.approveVaccineSession(confirmAction.itemId, { reason });
    //                 message = "Đã duyệt kế hoạch tiêm chủng thành công";
    //                 break;

    //             case 'reject':
    //                 response = await vaccineSessionApi.declineVaccineSession(confirmAction.itemId, { reason });
    //                 message = "Đã từ chối kế hoạch tiêm chủng";
    //                 break;

    //             case 'finalize':
    //                 response = await vaccineSessionApi.finalizeVaccineSession(confirmAction.itemId, { reason });
    //                 message = "Đã chốt danh sách kế hoạch tiêm chủng";
    //                 break;

    //             default:
    //                 throw new Error("Invalid action type");
    //         }

    //         // Hiển thị thông báo thành công
    //         setAlertConfig({
    //             type: "success",
    //             title: "Thành công",
    //             message: response.data.message || message
    //         });
    //         setShowAlertModal(true);
    //         setShowConfirmModal(false);
    //         setOpenActionId(null);
    //     } catch (error) {
    //         console.error('Error confirming action:', error);
    //         setAlertConfig({
    //             type: "error",
    //             title: "Lỗi",
    //             message: "Đã có lỗi xảy ra. Vui lòng thử lại."
    //         });
    //         setShowAlertModal(true);
    //         setShowConfirmModal(false);
    //     }
    // };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            status: ''
        });
        setSearchTerm("");
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleDropdown = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Header Section */}
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Quản lý tiêm chủng
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Quản lý kế hoạch và lịch tiêm chủng của học sinh
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Upcoming Plans */}
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg"
                        style={{
                            background: '#00897B',
                            height: '120px'
                        }}
                    >
                        <div className="p-6 relative z-10 h-full flex flex-col justify-between">
                            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                Kế hoạch sắp tới
                            </p>
                            <div className="flex items-center justify-between">
                                <p className="text-3xl font-bold" style={{ color: 'white' }}>
                                    {stats.upcoming}
                                </p>
                                <div
                                    className="h-12 w-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiCalendar className="h-6 w-6" style={{ color: 'white' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completed Plans */}
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg"
                        style={{
                            background: '#4CAF50',
                            height: '120px'
                        }}
                    >
                        <div className="p-6 relative z-10 h-full flex flex-col justify-between">
                            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                Đã chốt danh sách
                            </p>
                            <div className="flex items-center justify-between">
                                <p className="text-3xl font-bold" style={{ color: 'white' }}>
                                    {stats.completed}
                                </p>
                                <div
                                    className="h-12 w-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiCheckCircle className="h-6 w-6" style={{ color: 'white' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Students */}
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg"
                        style={{
                            background: '#FFA726',
                            height: '120px'
                        }}
                    >
                        <div className="p-6 relative z-10 h-full flex flex-col justify-between">
                            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                Tổng học sinh
                            </p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold" style={{ color: 'white' }}>
                                        {stats.totalStudents}
                                    </p>
                                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                        92% đã tiêm chủng
                                    </p>
                                </div>
                                <div
                                    className="h-12 w-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUsers className="h-6 w-6" style={{ color: 'white' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div
                    className="rounded-2xl shadow-xl border backdrop-blur-sm mb-6"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: BORDER.LIGHT
                    }}
                >
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm kế hoạch tiêm chủng..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            focusRingColor: `${PRIMARY[500]}40`
                                        }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm !== debouncedSearchTerm && (
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: PRIMARY[500] }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[200px]"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY
                                        }}
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="PendingApproval">Lên kế hoạch</option>
                                        <option value="WaitingForParentConsent">Sắp diễn ra</option>
                                        <option value="Scheduled">Đã hoàn thành</option>
                                    </select>
                                </div>

                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 rounded-lg flex items-center transition-all duration-300"
                                    style={{
                                        backgroundColor: PRIMARY[50],
                                        color: PRIMARY[700]
                                    }}
                                >
                                    <FiRefreshCw className="mr-2 h-4 w-4" />
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vaccination List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loading type="medical" size="large" color={PRIMARY[500]} text="Đang tải danh sách tiêm chủng..." />
                    </div>
                ) : (
                    <div
                        className="rounded-2xl shadow-xl border backdrop-blur-sm"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderColor: BORDER.LIGHT
                        }}
                    >
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
                                    {filteredVaccinations.length > 0 ? (
                                        filteredVaccinations.map((vaccination, index) => (
                                            <tr key={vaccination.id || index} className="hover:bg-opacity-50 transition-all duration-200 group" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}>
                                                <td className="w-[250px] py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {vaccination.sessionName}
                                                        </span>
                                                        <span className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                            {vaccination.vaccineTypeName}
                                                        </span>
                                                        {/* <span className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                            {vaccination.description}
                                                        </span> */}
                                                    </div>
                                                </td>
                                                <td className="w-[150px] py-4 px-6">
                                                    <div className="flex flex-wrap gap-1">
                                                        {vaccination.classes.map((classe) => (
                                                            <span key={classe} className="px-2 py-1 text-xs font-medium rounded-lg" style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                                                                {classe.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="w-[150px] py-4 px-6">
                                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {new Date(vaccination.startTime).toLocaleDateString("vi-VN")}
                                                    </span>
                                                </td>
                                                <td className="w-[150px] py-4 px-6">
                                                    {getStatusBadge(vaccination.status)}
                                                </td>
                                                <td className="w-[150px] py-4 px-6">
                                                    {vaccination.status === "Scheduled" ? (
                                                        <div>
                                                            <div className="text-sm font-medium" style={{ color: SUCCESS[600] }}>
                                                                {vaccination.vaccinatedStudents}/{vaccination.totalStudents}
                                                            </div>
                                                            <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                                Đã hoàn thành
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="text-sm font-medium" style={{ color: PRIMARY[600] }}>
                                                                {vaccination.confirmedParents}/{vaccination.totalStudents}
                                                            </div>
                                                            <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                                Đã xác nhận
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-500"
                                                                    style={{
                                                                        width: `${Math.round((vaccination.confirmedParents / vaccination.totalStudents) * 100)}%`,
                                                                        backgroundColor: PRIMARY[500]
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="w-[100px] py-4 px-6">
                                                    <div style={{ position: 'relative' }}>
                                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                                            <Link
                                                                to={`/manager/vaccination/${vaccination.id}`}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                style={{ color: PRIMARY[600] }}
                                                                onClick={() => setOpenActionId(null)}
                                                            >
                                                                {/* Eye Icon and Tooltip Wrapper */}
                                                                <div className="relative group">
                                                                    {/* Eye Icon */}
                                                                    <FiEye className="w-4 h-4 flex-shrink-0" />
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* <td className="w-[100px] py-4 px-6">
                                                    <div style={{ position: 'relative' }}>
                                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                                            <button
                                                                onClick={() => toggleDropdown(vaccination.id)}
                                                                className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90 hover:shadow-md"
                                                                style={{
                                                                    backgroundColor: GRAY[100],
                                                                    color: TEXT.PRIMARY
                                                                }}
                                                            >
                                                                <FiMoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
                                                            </button>
                                                            

                                                            {openActionId === vaccination.id && (
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
                                                                    {vaccination.status === "PendingApproval" && (
                                                                        <>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onClose();
                                                                                    setConfirmAction({
                                                                                        type: 'approve',
                                                                                        itemId: vaccination.id
                                                                                    });
                                                                                    setShowConfirmModal(true);
                                                                                }}
                                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                                style={{ color: SUCCESS[600] }}
                                                                            >
                                                                                <FiCheck className="w-4 h-4 flex-shrink-0" />
                                                                                <span>Duyệt</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onClose();
                                                                                    setConfirmAction({
                                                                                        type: 'reject',
                                                                                        itemId: vaccination.id
                                                                                    });
                                                                                    setShowConfirmModal(true);
                                                                                }}
                                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                                style={{ color: ERROR[600] }}
                                                                            >
                                                                                <FiX className="w-4 h-4 flex-shrink-0" />
                                                                                <span>Từ chối</span>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {vaccination.status === "WaitingForParentConsent" &&( 
                                                                        <>
                                                                            <button
                                                                                onClick={((e) => {
                                                                                    e.stopPropagation();
                                                                                    onClose();
                                                                                    handleFinalize(vaccination.id); }  
                                                                                )}
                                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                                style={{ color: SUCCESS[600] }}
                                                                            >
                                                                                <FiCheck className="w-4 h-4 flex-shrink-0" />
                                                                                <span>Chốt danh sách</span>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    <Link
                                                                        to={`/manager/vaccination/${vaccination.id}`}
                                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                        style={{ color: PRIMARY[600] }}
                                                                        onClick={() => setOpenActionId(null)}
                                                                    >
                                                                        <FiEye className="w-4 h-4 flex-shrink-0" />
                                                                        <span>Xem chi tiết</span>
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td> */}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div
                                                        className="h-20 w-20 rounded-full flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: GRAY[100] }}
                                                    >
                                                        <FiCalendar className="h-10 w-10" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        Không có kế hoạch tiêm chủng nào
                                                    </p>
                                                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                                                    </p>
                                                    <button
                                                        onClick={resetFilters}
                                                        className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                        style={{
                                                            backgroundColor: PRIMARY[50],
                                                            color: PRIMARY[700]
                                                        }}
                                                    >
                                                        <FiRefreshCw className="mr-2 h-4 w-4" />
                                                        Đặt lại bộ lọc
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.DEFAULT }}>
                                <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                    Hiển thị{" "}
                                    <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {((currentPage - 1) * pageSize) + 1}
                                    </span>{" "}
                                    -{" "}
                                    <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {Math.min(currentPage * pageSize, totalCount)}
                                    </span>{" "}
                                    trong tổng số{" "}
                                    <span className="font-bold" style={{ color: PRIMARY[600] }}>{totalCount}</span>{" "}
                                    kế hoạch
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: currentPage === 1 ? BORDER.DEFAULT : PRIMARY[200],
                                            color: currentPage === 1 ? TEXT.SECONDARY : PRIMARY[600],
                                            backgroundColor: BACKGROUND.DEFAULT
                                        }}
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>

                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => paginate(pageNumber)}
                                                className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                                                style={{
                                                    borderColor: currentPage === pageNumber ? PRIMARY[500] : BORDER.DEFAULT,
                                                    backgroundColor: currentPage === pageNumber ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                                    color: currentPage === pageNumber ? TEXT.INVERSE : TEXT.PRIMARY
                                                }}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: currentPage === totalPages ? BORDER.DEFAULT : PRIMARY[200],
                                            color: currentPage === totalPages ? TEXT.SECONDARY : PRIMARY[600],
                                            backgroundColor: BACKGROUND.DEFAULT
                                        }}
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />

            {/* <ConfirmActionModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmAction}
                title={confirmAction.type === 'approve' ? "Duyệt kế hoạch tiêm chủng" : "Từ chối kế hoạch tiêm chủng"}
                message={confirmAction.type === 'approve'
                    ? "Bạn có chắc chắn muốn duyệt kế hoạch tiêm chủng này? Vui lòng nhập lý do duyệt."
                    : "Bạn có chắc chắn muốn từ chối kế hoạch tiêm chủng này? Vui lòng nhập lý do từ chối."
                }
                type={confirmAction.type}
            /> */}
        </div>
    );
};

export default VaccinationListManagement;
