import React, { useEffect, useState } from 'react';
import { FiSearch, FiClock, FiCheckCircle, FiAlertTriangle, FiActivity, FiTrendingUp, FiPackage, FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PRIMARY, WARNING, ERROR, SUCCESS, INFO, TEXT, BACKGROUND, BORDER, GRAY } from '../../constants/colors';
import Loading from '../../components/Loading';
import { useAuth } from '../../utils/AuthContext';
import medicationUsageApi from '../../api/medicationUsageApi';
import { useNavigate } from "react-router-dom";

const statusColor = {
    PendingApproval: WARNING[500],
    Approved: SUCCESS[500],
    Rejected: ERROR[500],
    Active: PRIMARY[500],
    Completed: INFO[500],
    Discontinued: GRAY[500],
};

const MedicationUsageSchedule = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const studentId = user?.id || '';
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });



    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 750);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchMedicationUsage = async () => {
        setLoading(true);
        try {
            const params = {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                studentId: studentId
                // Không gửi status filter lên API, sẽ filter ở frontend
            };
            if (debouncedSearchTerm) {
                params.searchTerm = debouncedSearchTerm;
            }
            const response = await medicationUsageApi.getStudentMedicationUsage(params);
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
            }
        } catch (error) {
            setData([]);
            setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicationUsage();
        // eslint-disable-next-line
    }, [pagination.pageIndex, pagination.pageSize, studentId, debouncedSearchTerm]);

    const handlePageChange = (newPageIndex) => {
        setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
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
            case "Rejected":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                        Từ chối
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
                <Loading type="medical" size="large" color="primary" text="Đang tải lịch sử sử dụng thuốc..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                        Lịch sử sử dụng thuốc
                    </h1>
                    <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                        Xem chi tiết tất cả thuốc của bạn (trừ những thuốc đang chờ duyệt)
                    </p>
                </div>
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full sm:w-1/2">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên thuốc, mục đích..."
                            className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="rounded-2xl shadow-xl border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: PRIMARY[50] }}>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '200px' }}>
                                        TÊN THUỐC
                                    </th>
                                    <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
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
                                    <th className="py-4 px-6 text-center text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '100px' }}>
                                        THAO TÁC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center" style={{ borderTop: `1px solid ${BORDER.LIGHT}` }}>
                                            <FiPackage className="mx-auto h-12 w-12 mb-4" style={{ color: GRAY[400] }} />
                                            <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                Không có dữ liệu thuốc
                                            </h3>
                                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                {searchTerm ? "Không tìm thấy kết quả phù hợp với từ khóa." : "Bạn chưa có thuốc nào hoặc tất cả thuốc đều đang chờ duyệt."}
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
                                                        {item.medicationName}
                                                    </span>
                                                    <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        {item.purpose || 'Không có mô tả'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-base" style={{ width: '120px' }}>
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
                                            <td className="py-4 px-6 text-center text-base" style={{ width: '100px' }}>
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => navigate(`/student/medication-history/${item.id}`)}
                                                        className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                                        style={{ color: PRIMARY[500], border: `1px solid ${PRIMARY[500]}` }}
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
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

export default MedicationUsageSchedule;
