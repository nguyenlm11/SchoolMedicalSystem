import React, { useEffect, useState } from 'react';
import { FiSearch, FiRefreshCw, FiEye, FiMoreVertical, FiCheckCircle, FiAlertTriangle, FiActivity, FiTrendingUp, FiChevronLeft, FiChevronRight, FiPackage } from "react-icons/fi";
import { PRIMARY, WARNING, ERROR, SUCCESS, INFO, TEXT, BACKGROUND, BORDER, GRAY } from '../../constants/colors';
import Loading from '../../components/Loading';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../utils/AuthContext';
import medicationUsageApi from '../../api/medicationUsageApi';

const MedicationUsageManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
    const [openActionId, setOpenActionId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("Approved");
    const [filterActive, setFilterActive] = useState(false);
    const [filterCompleted, setFilterCompleted] = useState(false);
    const [filterDiscontinued, setFilterDiscontinued] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const nurseId = user?.id || '';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('[data-dropdown]')) {
                setOpenActionId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchMedicationUsage = async () => {
        try {
            const params = {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                nurseId: nurseId
            };

            if (debouncedSearchTerm) {
                params.searchTerm = debouncedSearchTerm;
            }

            if (filterStatus) {
                params.status = filterStatus;
            }
            if (filterActive) {
                params.status = 'Active';
            }
            if (filterCompleted) {
                params.status = 'Completed';
            }
            if (filterDiscontinued) {
                params.status = 'Discontinued';
            }

            const response = await medicationUsageApi.getMedicationUsage(params);

            if (response.success) {
                setData(response.data || []);
                setPagination({
                    pageIndex: response.currentPage || pagination.pageIndex,
                    pageSize: response.pageSize || pagination.pageSize,
                    totalCount: response.totalCount || 0,
                    totalPages: response.totalPages || 0
                });
            } else {
                setData([]);
                setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
                console.error('API Error:', response.message);
            }
        } catch (error) {
            console.error('Error fetching medication usage:', error);
            setData([]);
            setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicationUsage();
    }, [pagination.pageIndex, pagination.pageSize, nurseId, filterStatus, filterActive, filterCompleted, filterDiscontinued, debouncedSearchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 750);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleRefresh = () => {
        setFilterStatus("Approved");
        setFilterActive(false);
        setFilterCompleted(false);
        setFilterDiscontinued(false);
        setSearchTerm("");
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
    };

    const handlePageChange = (newPageIndex) => {
        setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
    };

    const toggleDropdown = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    const getStats = () => {
        const approvedCount = data.filter(r => r.status === 'Approved').length;
        const activeCount = data.filter(r => r.status === 'Active').length;
        const completedCount = data.filter(r => r.status === 'Completed').length;
        const expiringSoonCount = data.filter(r => r.isExpiringSoon).length;
        const lowStockCount = data.filter(r => r.isLowStock).length;

        return {
            approved: approvedCount,
            active: activeCount,
            completed: completedCount,
            expiringSoon: expiringSoonCount,
            lowStock: lowStockCount,
            total: data.length
        };
    };

    const stats = getStats();

    const handleStatusFilter = (status) => {
        if (status === 'Approved') {
            setFilterStatus('Approved');
            setFilterActive(false);
            setFilterCompleted(false);
            setFilterDiscontinued(false);
        } else if (status === 'Active') {
            setFilterStatus('');
            setFilterActive(true);
            setFilterCompleted(false);
            setFilterDiscontinued(false);
        } else if (status === 'Completed') {
            setFilterStatus('');
            setFilterActive(false);
            setFilterCompleted(true);
            setFilterDiscontinued(false);
        } else if (status === 'Discontinued') {
            setFilterStatus('');
            setFilterActive(false);
            setFilterCompleted(false);
            setFilterDiscontinued(true);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Approved":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                        <FiCheckCircle className="mr-1.5 h-4 w-4" />
                        Đã duyệt
                    </span>
                );
            case "Active":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                        <FiActivity className="mr-1.5 h-4 w-4" />
                        Đang sử dụng
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải dữ liệu sử dụng thuốc..." />
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
                                Quản lý sử dụng thuốc tại trường
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Theo dõi và quản lý việc sử dụng thuốc của học sinh
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, borderColor: PRIMARY[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Đang sử dụng
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.active}
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
                        style={{ background: `linear-gradient(135deg, ${ERROR[500]} 0%, ${ERROR[600]} 100%)`, borderColor: ERROR[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Sắp hết hạn
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.expiringSoon}
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
                        style={{ background: `linear-gradient(135deg, ${INFO[500]} 0%, ${INFO[600]} 100%)`, borderColor: INFO[200] }}
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
                                        placeholder="Tìm kiếm theo tên học sinh, thuốc, phụ huynh..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleStatusFilter('Approved')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${filterStatus === 'Approved' ? 'text-white shadow-lg' : 'hover:shadow-sm'}`}
                                    style={{
                                        backgroundColor: filterStatus === 'Approved' ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: filterStatus === 'Approved' ? 'white' : TEXT.PRIMARY,
                                        border: `1px solid ${filterStatus === 'Approved' ? PRIMARY[500] : BORDER.DEFAULT}`,
                                    }}
                                >
                                    <FiCheckCircle className="h-4 w-4" />
                                    Đã duyệt
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('Active')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${filterActive ? 'text-white shadow-lg' : 'hover:shadow-sm'}`}
                                    style={{
                                        backgroundColor: filterActive ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: filterActive ? 'white' : TEXT.PRIMARY,
                                        border: `1px solid ${filterActive ? PRIMARY[500] : BORDER.DEFAULT}`,
                                    }}
                                >
                                    <FiActivity className="h-4 w-4" />
                                    Đang sử dụng
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('Completed')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${filterCompleted ? 'text-white shadow-lg' : 'hover:shadow-sm'}`}
                                    style={{
                                        backgroundColor: filterCompleted ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: filterCompleted ? 'white' : TEXT.PRIMARY,
                                        border: `1px solid ${filterCompleted ? PRIMARY[500] : BORDER.DEFAULT}`,
                                    }}
                                >
                                    <FiTrendingUp className="h-4 w-4" />
                                    Đã hoàn thành
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('Discontinued')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${filterDiscontinued ? 'text-white shadow-lg' : 'hover:shadow-sm'}`}
                                    style={{
                                        backgroundColor: filterDiscontinued ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: filterDiscontinued ? 'white' : TEXT.PRIMARY,
                                        border: `1px solid ${filterDiscontinued ? PRIMARY[500] : BORDER.DEFAULT}`,
                                    }}
                                >
                                    <FiAlertTriangle className="h-4 w-4" />
                                    Đã ngừng
                                </button>
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
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '200px' }}>
                                        HỌC SINH
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '150px' }}>
                                        THUỐC
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '150px' }}>
                                        LIỀU DÙNG
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
                                        TRẠNG THÁI
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
                                        LỊCH TRÌNH
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
                                        CẢNH BÁO
                                    </th>
                                    <th className="py-4 px-6 text-center text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '80px' }}>
                                        THAO TÁC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center" style={{ borderTop: `1px solid ${BORDER.LIGHT}` }}>
                                            <FiPackage className="mx-auto h-12 w-12 mb-4" style={{ color: GRAY[400] }} />
                                            <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                Không có dữ liệu sử dụng thuốc
                                            </h3>
                                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                {searchTerm || filterStatus !== "Approved" || filterActive || filterCompleted || filterDiscontinued
                                                    ? "Không tìm thấy kết quả phù hợp với bộ lọc."
                                                    : "Chưa có dữ liệu sử dụng thuốc nào."}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-opacity-50 transition-all duration-200 group"
                                            style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                        >
                                            <td className="py-4 px-6 text-base" style={{ width: '200px' }}>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-base" style={{ color: TEXT.PRIMARY }}>
                                                        {item.studentName}
                                                    </span>
                                                    <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        {item.studentCode}
                                                    </span>
                                                    <span className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                                        {item.parentName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-base" style={{ width: '150px' }}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-base" style={{ color: TEXT.PRIMARY }}>
                                                        {item.medicationName}
                                                    </span>
                                                    <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        {item.purpose || 'Không có mô tả'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-base" style={{ width: '150px' }}>
                                                <span className="text-base" style={{ color: TEXT.PRIMARY }}>
                                                    {item.dosage}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-base" style={{ width: '120px' }}>
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="py-4 px-6 text-base" style={{ width: '120px' }}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-base" style={{ color: TEXT.PRIMARY }}>
                                                        {item.totalAdministrations}/{item.totalSchedules}
                                                    </span>
                                                    <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        {item.totalSchedules > 0
                                                            ? `${Math.round((item.totalAdministrations / item.totalSchedules) * 100)}% hoàn thành`
                                                            : 'Chưa có lịch trình'
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-base" style={{ width: '120px' }}>
                                                <div className="flex flex-col gap-1">
                                                    {item.isExpiringSoon && (
                                                        <span className="inline-block px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: WARNING[100], color: WARNING[700] }}>
                                                            Sắp hết hạn
                                                        </span>
                                                    )}
                                                    {item.isLowStock && (
                                                        <span className="inline-block px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: ERROR[100], color: ERROR[700] }}>
                                                            Sắp hết thuốc
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center text-base" style={{ width: '80px' }}>
                                                <div style={{ position: 'relative', display: 'inline-block' }} data-dropdown>
                                                    <button
                                                        onClick={() => toggleDropdown(item.id)}
                                                        className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                                        style={{ backgroundColor: GRAY[100], color: TEXT.PRIMARY }}
                                                    >
                                                        <FiMoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {openActionId === item.id && (
                                                        <div
                                                            className="absolute py-2 w-48 bg-white rounded-lg shadow-xl border"
                                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: 'white', position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '2px', zIndex: 50 }}
                                                        >
                                                            <button
                                                                className="w-full px-4 py-2 text-left text-base hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                style={{ color: PRIMARY[600] }}
                                                                onClick={() => navigate(`/schoolnurse/medication-usage/${item.id}`)}
                                                            >
                                                                <FiEye className="w-4 h-4 flex-shrink-0" />
                                                                <span>Xem chi tiết</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
                                bản ghi
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
                </div>
            </div>
        </div>
    );
};

export default MedicationUsageManagement;
