import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiSearch, FiRefreshCw, FiTablet, FiAlertTriangle, FiPackage, FiX, FiCheck, FiInfo, FiEye, FiMoreVertical, FiLoader, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import ConfirmActionModal from "../../components/modal/ConfirmActionModal";
import medicalApi from "../../api/medicalApi";

const MedicineInventory = () => {
    const location = useLocation();
    const initialFilter = new URLSearchParams(location.search).get("filter") || "";
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(initialFilter);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({ total: 0, inactive: 0, lowStock: 0 });
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({ approvalStatus: '', priority: '' });
    const [openActionId, setOpenActionId] = useState(null);
    const dropdownRef = useRef(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ type: 'approve', itemId: null });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 750);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus]);

    useEffect(() => {
        fetchMedicines();
    }, [filters, currentPage, pageSize, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenActionId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
    };

    const fetchMedicines = async () => {
        try {
            const params = { pageIndex: currentPage, pageSize: pageSize, type: 'Medication' };
            if (filters.approvalStatus) {
                params.approvalStatus = filters.approvalStatus;
            }
            if (filters.priority) {
                params.priority = filters.priority;
            }
            if (searchTerm) {
                params.searchTerm = searchTerm;
            }
            const response = await medicalApi.getMedicalItems(params);
            if (response.success) {
                setMedicines(response.data);
                setTotalCount(response.totalCount);
                setTotalPages(response.totalPages);
                const total = response.totalCount;
                const inactive = response.data.filter(item => item.status === 'Inactive').length;
                const lowStock = response.data.filter(item => item.isLowStock).length;
                setStats({ total, inactive, lowStock });
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể tải danh sách thuốc. Vui lòng thử lại.");
                setMedicines([]);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (error) {
            showAlert("error", "Lỗi", "Không thể tải danh sách thuốc. Vui lòng thử lại.");
            setMedicines([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            approvalStatus: '',
            priority: ''
        });
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortData = (data) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Xử lý các trường hợp đặc biệt
            if (sortConfig.key === 'expiryDate') {
                aValue = new Date(a.expiryDate).getTime();
                bValue = new Date(b.expiryDate).getTime();
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleApprove = async (reason) => {
        try {
            const response = await medicalApi.approveMedicalItem(confirmAction.itemId, {
                approvalNotes: reason
            });

            if (response.success) {
                setMedicines(prevMedicines =>
                    prevMedicines.map(item =>
                        item.id === confirmAction.itemId
                            ? {
                                ...item,
                                status: 'Approved',
                                statusDisplayName: 'Đã duyệt'
                            }
                            : item
                    )
                );

                await fetchMedicines();
                showAlert("success", "Thành công", "Phê duyệt thuốc thành công");
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể phê duyệt thuốc. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error('Error approving medicine:', error);
            showAlert("error", "Lỗi", "Không thể phê duyệt thuốc. Vui lòng thử lại.");
        } finally {
            setShowConfirmModal(false);
        }
    };

    const handleReject = async (reason) => {
        try {
            const response = await medicalApi.rejectMedicalItem(confirmAction.itemId, {
                rejectionReason: reason
            });

            if (response.success) {
                setMedicines(prevMedicines =>
                    prevMedicines.map(item =>
                        item.id === confirmAction.itemId
                            ? {
                                ...item,
                                status: 'Rejected',
                                statusDisplayName: 'Bị từ chối'
                            }
                            : item
                    )
                );

                await fetchMedicines();
                showAlert("success", "Thành công", "Đã từ chối phê duyệt thuốc");
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể từ chối phê duyệt thuốc. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error('Error rejecting medicine:', error);
            showAlert("error", "Lỗi", "Không thể từ chối phê duyệt thuốc. Vui lòng thử lại.");
        } finally {
            setShowConfirmModal(false);
        }
    };

    const toggleDropdown = (id) => {
        setOpenActionId(openActionId === id ? null : id);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải thuốc..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen" >
            <div className="h-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>Quản lý thuốc</h1>
                            <p className="mt-1 text-sm sm:text-base" style={{ color: TEXT.SECONDARY }}>
                                Quản lý danh sách thuốc và vật tư y tế
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div
                        className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                            borderColor: PRIMARY[200]
                        }}
                    >
                        <div className="p-4 sm:p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm sm:text-base font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Tổng số thuốc
                                    </p>
                                    <p className="text-2xl sm:text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.total}
                                    </p>
                                </div>
                                <div
                                    className="h-12 sm:h-16 w-12 sm:w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiTablet className="h-6 sm:h-8 w-6 sm:w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${WARNING[400]} 0%, ${WARNING[500]} 100%)`,
                            borderColor: WARNING[200]
                        }}
                    >
                        <div className="p-4 sm:p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm sm:text-base font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Sắp hết hàng
                                    </p>
                                    <p className="text-2xl sm:text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.lowStock}
                                    </p>
                                </div>
                                <div
                                    className="h-12 sm:h-16 w-12 sm:w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiAlertTriangle className="h-6 sm:h-8 w-6 sm:w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 md:col-span-2 lg:col-span-1"
                        style={{
                            background: `linear-gradient(135deg, ${GRAY[500]} 0%, ${GRAY[600]} 100%)`,
                            borderColor: GRAY[200]
                        }}
                    >
                        <div className="p-4 sm:p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm sm:text-base font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Ngừng sử dụng
                                    </p>
                                    <p className="text-2xl sm:text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.inactive}
                                    </p>
                                </div>
                                <div
                                    className="h-12 sm:h-16 w-12 sm:w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiX className="h-6 sm:h-8 w-6 sm:w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="rounded-xl sm:rounded-2xl shadow-xl border backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}
                >
                    <div className="p-4 sm:p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên thuốc..."
                                        className="w-full pl-10 sm:pl-12 pr-10 py-2 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm !== debouncedSearchTerm && (
                                        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                                            <FiLoader className="animate-spin h-4 w-4" style={{ color: PRIMARY[500] }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={filters.approvalStatus}
                                        onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[160px] sm:min-w-[200px]"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="PENDING">Chờ duyệt</option>
                                        <option value="APPROVED">Đã duyệt</option>
                                        <option value="REJECTED">Từ chối</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <select
                                        value={filters.priority}
                                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[160px] sm:min-w-[200px]"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                    >
                                        <option value="">Độ ưu tiên</option>
                                        <option value="LOW">Thấp</option>
                                        <option value="NORMAL">Bình thường</option>
                                        <option value="HIGH">Cao</option>
                                        <option value="CRITICAL">Khẩn cấp</option>
                                    </select>
                                </div>

                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 text-sm sm:text-base"
                                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                                >
                                    <FiRefreshCw className="mr-2 h-4 w-4" />
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-visible">
                        <div className="overflow-visible">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: PRIMARY[50] }}>
                                        <th className="w-[120px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: TEXT.PRIMARY }}>
                                            Mã thuốc
                                        </th>
                                        <th className="w-[250px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                            Tên thuốc
                                        </th>
                                        <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: TEXT.PRIMARY }}>
                                            Liều lượng
                                        </th>
                                        <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                            Số lượng
                                        </th>
                                        <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: TEXT.PRIMARY }}>
                                            Hạn sử dụng
                                        </th>
                                        <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                            Trạng thái
                                        </th>
                                        <th className="w-[150px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: TEXT.PRIMARY }}>
                                            Độ ưu tiên
                                        </th>
                                        <th className="w-[100px] py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                    {medicines.length > 0 ? (
                                        sortData(medicines).map((item, index) => (
                                            <tr
                                                key={item.id || index}
                                                className="hover:bg-opacity-50 transition-all duration-200 group"
                                                style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                            >
                                                <td className="w-[120px] py-4 px-6 hidden sm:table-cell">
                                                    <span className="font-mono text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        #{(item.id || '').toString().substring(0, 8)}
                                                    </span>
                                                </td>
                                                <td className="w-[250px] py-4 px-6">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <span className="font-semibold block text-sm sm:text-base" style={{ color: TEXT.PRIMARY }}>
                                                                {item.name || 'N/A'}
                                                            </span>
                                                            <span className="text-xs sm:text-sm mt-0.5 block md:hidden" style={{ color: TEXT.SECONDARY }}>
                                                                {item.dosage || 'N/A'}
                                                            </span>
                                                            <span className="text-xs sm:text-sm mt-0.5 block sm:hidden" style={{ color: TEXT.SECONDARY }}>
                                                                HSD: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="w-[150px] py-4 px-6 hidden lg:table-cell">
                                                    <span className="text-sm sm:text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {item.dosage || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="w-[150px] py-4 px-6">
                                                    <div className="flex items-center">
                                                        <span
                                                            className="font-bold text-base sm:text-lg"
                                                            style={{ color: item.isLowStock ? ERROR[600] : TEXT.PRIMARY }}
                                                        >
                                                            {item.quantity || 0}
                                                        </span>
                                                        <span className="ml-1 text-xs sm:text-sm" style={{ color: TEXT.SECONDARY }}>
                                                            {item.unit || 'N/A'}
                                                        </span>
                                                        {item.isLowStock && (
                                                            <div className="ml-2 sm:ml-3 flex items-center">
                                                                <FiAlertTriangle className="h-3 sm:h-4 w-3 sm:w-4 mr-1" style={{ color: WARNING[500] }} />
                                                                <span className="text-xs font-medium" style={{ color: WARNING[600] }}>
                                                                    Sắp hết
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="w-[150px] py-4 px-6 hidden md:table-cell">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm sm:text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </span>
                                                        {(item.isExpiringSoon || item.isExpired) && (
                                                            <span
                                                                className="text-xs font-medium mt-1 px-2 py-1 rounded-full inline-block"
                                                                style={{
                                                                    backgroundColor: item.isExpired ? ERROR[100] : WARNING[100],
                                                                    color: item.isExpired ? ERROR[700] : WARNING[700]
                                                                }}
                                                            >
                                                                {item.isExpired ? 'Đã hết hạn' : 'Sắp hết hạn'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="w-[150px] py-4 px-6">
                                                    <span
                                                        className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold"
                                                        style={{
                                                            backgroundColor:
                                                                item.status === 'Approved' ? SUCCESS[50] :
                                                                    item.status === 'Pending' ? WARNING[50] :
                                                                        item.status === 'Rejected' ? ERROR[50] :
                                                                            GRAY[50],
                                                            color:
                                                                item.status === 'Approved' ? SUCCESS[700] :
                                                                    item.status === 'Pending' ? WARNING[700] :
                                                                        item.status === 'Rejected' ? ERROR[700] :
                                                                            GRAY[700]
                                                        }}
                                                    >
                                                        {item.statusDisplayName}
                                                    </span>
                                                </td>
                                                <td className="w-[150px] py-4 px-6 hidden md:table-cell">
                                                    <span
                                                        className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold"
                                                        style={{
                                                            backgroundColor:
                                                                item.priority === 'High' ? ERROR[100] :
                                                                    item.priority === 'Medium' ? WARNING[100] :
                                                                        SUCCESS[100],
                                                            color:
                                                                item.priority === 'High' ? ERROR[700] :
                                                                    item.priority === 'Medium' ? WARNING[700] :
                                                                        SUCCESS[700]
                                                        }}
                                                    >
                                                        {item.priorityDisplayName || item.priority || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="w-[100px] py-4 px-6 overflow-visible">
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => toggleDropdown(item.id)}
                                                            className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90 hover:shadow-md"
                                                            style={{
                                                                backgroundColor: GRAY[100],
                                                                color: TEXT.PRIMARY
                                                            }}
                                                        >
                                                            <FiMoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
                                                        </button>

                                                        {openActionId === item.id && (
                                                            <div
                                                                className="absolute py-2 w-48 bg-white rounded-lg shadow-xl border"
                                                                style={{
                                                                    borderColor: BORDER.DEFAULT,
                                                                    right: '100%',
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)',
                                                                    marginRight: '8px',
                                                                    zIndex: 50
                                                                }}
                                                            >
                                                                {item.status === 'Pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setConfirmAction({
                                                                                    type: 'approve',
                                                                                    itemId: item.id
                                                                                });
                                                                                setShowConfirmModal(true);
                                                                                setOpenActionId(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                            style={{ color: SUCCESS[600] }}
                                                                        >
                                                                            <FiCheck className="w-4 h-4 flex-shrink-0" />
                                                                            <span>Duyệt</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setConfirmAction({
                                                                                    type: 'reject',
                                                                                    itemId: item.id
                                                                                });
                                                                                setShowConfirmModal(true);
                                                                                setOpenActionId(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                            style={{ color: ERROR[600] }}
                                                                        >
                                                                            <FiX className="w-4 h-4 flex-shrink-0" />
                                                                            <span>Từ chối</span>
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                                                    style={{ color: PRIMARY[600] }}
                                                                >
                                                                    <FiEye className="w-4 h-4 flex-shrink-0" />
                                                                    <Link to={`/manager/medical-items/${item.id}`}>
                                                                        Xem chi tiết
                                                                    </Link>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-8 sm:py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div
                                                        className="h-16 sm:h-20 w-16 sm:w-20 rounded-full flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: GRAY[100] }}
                                                    >
                                                        <FiPackage className="h-8 sm:h-10 w-8 sm:w-10" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-lg sm:text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        {medicines.length === 0 ? "Không có thuốc nào phù hợp" : "Không có dữ liệu trang này"}
                                                    </p>
                                                    <p className="text-sm sm:text-base mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        {medicines.length === 0 ?
                                                            "Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác" :
                                                            "Vui lòng chọn trang khác hoặc điều chỉnh bộ lọc"
                                                        }
                                                    </p>
                                                    {medicines.length === 0 && (
                                                        <button
                                                            onClick={resetFilters}
                                                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center transition-all duration-300 font-medium text-sm sm:text-base"
                                                            style={{
                                                                backgroundColor: PRIMARY[50],
                                                                color: PRIMARY[600]
                                                            }}
                                                        >
                                                            <FiRefreshCw className="mr-2 h-4 w-4" />
                                                            Đặt lại bộ lọc
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 0 && (
                            <div
                                className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50/50"
                                style={{ borderColor: BORDER.DEFAULT }}
                            >
                                <div className="mb-4 sm:mb-0">
                                    <p className="text-xs sm:text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
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
                                        thuốc
                                    </p>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-1 sm:p-2 text-sm font-semibold border rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm"
                                        style={{ borderColor: currentPage === 1 ? BORDER.DEFAULT : PRIMARY[300], color: currentPage === 1 ? TEXT.SECONDARY : PRIMARY[600], backgroundColor: BACKGROUND.DEFAULT }}
                                    >
                                        <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
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
                                                className="p-1 sm:p-2 min-w-[28px] sm:min-w-[32px] text-xs sm:text-sm font-semibold border rounded-lg transition-all duration-200 hover:shadow-sm"
                                                style={{
                                                    borderColor: currentPage === pageNumber ? PRIMARY[500] : BORDER.DEFAULT,
                                                    backgroundColor: currentPage === pageNumber ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                                    color: currentPage === pageNumber ? 'white' : TEXT.PRIMARY,
                                                    boxShadow: currentPage === pageNumber ? `0 2px 4px ${PRIMARY[200]}` : 'none'
                                                }}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-1 sm:p-2 text-sm font-semibold border rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm"
                                        style={{
                                            borderColor: currentPage === totalPages ? BORDER.DEFAULT : PRIMARY[300],
                                            color: currentPage === totalPages ? TEXT.SECONDARY : PRIMARY[600],
                                            backgroundColor: BACKGROUND.DEFAULT
                                        }}
                                    >
                                        <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                />

                <ConfirmActionModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmAction.type === 'approve' ? handleApprove : handleReject}
                    title={confirmAction.type === 'approve' ? "Phê duyệt thuốc" : "Từ chối thuốc"}
                    message={confirmAction.type === 'approve'
                        ? "Bạn có chắc chắn muốn phê duyệt thuốc này? Vui lòng nhập lý do phê duyệt."
                        : "Bạn có chắc chắn muốn từ chối thuốc này? Vui lòng nhập lý do từ chối."
                    }
                    type={confirmAction.type}
                    confirmText={confirmAction.type === 'approve' ? "Phê duyệt" : "Từ chối"}
                />
            </div>
        </div >
    );
};

export default MedicineInventory;