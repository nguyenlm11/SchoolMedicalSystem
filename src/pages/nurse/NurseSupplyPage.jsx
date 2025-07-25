import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiRefreshCw, FiPackage, FiAlertTriangle, FiBox, FiX, FiEye, FiTrash2, FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import AddSupplyModal from "../../components/modal/AddSupplyModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import medicalApi from "../../api/medicalApi";

const NurseSupplyPage = () => {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({ total: 0, inactive: 0, lowStock: 0 });
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filters, setFilters] = useState({ approvalStatus: '', priority: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 750);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchSupplies();
    }, [filters, sortBy, sortOrder, currentPage, pageSize, debouncedSearchTerm]);

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
    };

    const fetchSupplies = async () => {
        try {
            const params = { pageIndex: currentPage, pageSize: pageSize, type: 'Supply', role: 'SCHOOLNURSE' };
            if (filters.approvalStatus) {
                params.approvalStatus = filters.approvalStatus;
            }
            if (filters.priority) {
                params.priority = filters.priority;
            }
            if (sortBy && sortOrder) {
                params.orderBy = `${sortBy}_${sortOrder}`;
            }
            if (searchTerm) {
                params.searchTerm = searchTerm;
            }
            const response = await medicalApi.getMedicalItems(params);
            if (response.success) {
                const items = response.data || [];
                setSupplies(items);
                setTotalCount(response.totalCount || 0);
                setTotalPages(response.totalPages || 1);
                const total = items.length;
                const inactive = items.filter(item => item.status === 'Inactive').length;
                const lowStock = items.filter(item => item.isLowStock).length;
                setStats({ total, inactive, lowStock });
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể tải danh sách vật tư. Vui lòng thử lại.");
                setSupplies([]);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (error) {
            showAlert("error", "Lỗi", "Không thể tải danh sách vật tư. Vui lòng thử lại.");
            setSupplies([]);
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

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handleAddSuccess = () => {
        fetchSupplies();
    };

    const handleDelete = async (id) => {
        try {
            const response = await medicalApi.deleteMedicalItem(id);
            if (response.success) {
                showAlert("success", "Thành công", "Đã xóa vật tư thành công");
                fetchSupplies();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể xóa vật tư. Vui lòng thử lại.");
            }
        } catch (error) {
            showAlert("error", "Lỗi", "Không thể xóa vật tư. Vui lòng thử lại.");
        }
    };

    const confirmDelete = (id) => {
        setSelectedItemId(id);
        setShowConfirmModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách vật tư..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>Quản lý vật tư y tế</h1>
                                <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                    Theo dõi và quản lý danh sách vật tư y tế tại trường
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 rounded-xl flex items-center transition-all duration-300 hover:opacity-80"
                                style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                            >
                                <FiPlus className="mr-2 h-5 w-5" />
                                Thêm vật tư y tế
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                            borderColor: PRIMARY[200]
                        }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Tổng số vật tư
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.total}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiBox className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${WARNING[400]} 0%, ${WARNING[500]} 100%)`,
                            borderColor: WARNING[200]
                        }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Sắp hết hàng
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.lowStock}
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
                        style={{
                            background: `linear-gradient(135deg, ${GRAY[500]} 0%, ${GRAY[600]} 100%)`,
                            borderColor: GRAY[200]
                        }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Ngừng sử dụng
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.inactive}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiX className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
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
                                        placeholder="Tìm kiếm theo tên vật tư..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
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
                                        value={filters.approvalStatus}
                                        onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[200px]"
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
                                        className="border rounded-lg px-3 py-2 text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[200px]"
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
                                    className="px-4 py-2 rounded-lg flex items-center transition-all duration-300"
                                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                                >
                                    <FiRefreshCw className="mr-2 h-4 w-4" />
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: GRAY[50] }}>
                                        {[
                                            { key: "id", label: "Mã vật tư" },
                                            { key: "name", label: "Tên vật tư" },
                                            { key: "quantity", label: "Số lượng" },
                                            { key: "status", label: "Trạng thái" },
                                            { key: "priority", label: "Độ ưu tiên" },
                                            { key: "action", label: "Thao tác" }
                                        ].map((col, idx) => (
                                            <th
                                                key={idx}
                                                className={`py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider ${col.key ? 'cursor-pointer hover:bg-opacity-80' : ''} transition-all duration-200`}
                                                style={{ color: TEXT.SECONDARY }}
                                                onClick={col.key ? () => handleSort(col.key) : undefined}
                                            >
                                                <div className="flex items-center">
                                                    {col.label}
                                                    {col.key && sortBy === col.key && (
                                                        <span className="ml-2 text-xs">
                                                            {sortOrder === "asc" ? "↑" : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                    {supplies.length > 0 ? (
                                        supplies.map((item, index) => (
                                            <tr
                                                key={item.id || index}
                                                className="hover:bg-opacity-50 transition-all duration-200 group"
                                                style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                            >
                                                <td className="py-4 px-6">
                                                    <span className="font-mono text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        #{(item.id || '').toString().substring(0, 8)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-sm" style={{ color: TEXT.PRIMARY }}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <span
                                                            className="font-bold text-sm"
                                                            style={{ color: item.isLowStock ? ERROR[600] : TEXT.PRIMARY }}
                                                        >
                                                            {item.quantity || 0}
                                                        </span>
                                                        {item.isLowStock && (
                                                            <div className="ml-3 flex items-center">
                                                                <FiAlertTriangle className="h-4 w-4 mr-1" style={{ color: WARNING[500] }} />
                                                                <span className="text-xs font-medium" style={{ color: WARNING[600] }}>
                                                                    Sắp hết
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                                        style={{
                                                            backgroundColor:
                                                                item.status === 'Approved' ? SUCCESS[100] :
                                                                    item.status === 'Pending' ? WARNING[100] :
                                                                        item.status === 'Rejected' ? ERROR[100] :
                                                                            GRAY[100],
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
                                                <td className="py-4 px-6">
                                                    <span
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                                        style={{
                                                            backgroundColor:
                                                                item.priority === 'Critical' ? ERROR[100] :
                                                                    item.priority === 'High' ? WARNING[100] :
                                                                        item.priority === 'Normal' ? SUCCESS[200] :
                                                                            item.priority === 'Low' ? SUCCESS[100] :
                                                                                GRAY[100],
                                                            color:
                                                                item.priority === 'Critical' ? ERROR[700] :
                                                                    item.priority === 'High' ? WARNING[700] :
                                                                        item.priority === 'Normal' ? SUCCESS[700] :
                                                                            item.priority === 'Low' ? SUCCESS[700] :
                                                                                GRAY[700]
                                                        }}
                                                    >
                                                        {item.priorityDisplayName}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-3">
                                                        <Link to={`/schoolnurse/medical-items/${item.id}`}
                                                            className="text-blue-500 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50">
                                                            <FiEye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => confirmDelete(item.id)}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50">
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
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
                                                        <FiPackage className="h-10 w-10" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        Không có vật tư nào phù hợp
                                                    </p>
                                                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                                                    </p>
                                                    <button
                                                        onClick={resetFilters}
                                                        className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
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

                        {totalPages > 0 && (
                            <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
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
                                    vật tư
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: currentPage === 1 ? BORDER.DEFAULT : PRIMARY[300],
                                            color: currentPage === 1 ? TEXT.SECONDARY : PRIMARY[600],
                                            backgroundColor: BACKGROUND.DEFAULT
                                        }}
                                    >
                                        <FiChevronLeft className="h-4 w-4" />
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
                                            borderColor: currentPage === totalPages ? BORDER.DEFAULT : PRIMARY[300],
                                            color: currentPage === totalPages ? TEXT.SECONDARY : PRIMARY[600],
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

                <AddSupplyModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                />

                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={() => { handleDelete(selectedItemId); setShowConfirmModal(false) }}
                    title="Xác nhận xóa"
                    message="Bạn có chắc chắn muốn xóa vật tư này không? Hành động này không thể hoàn tác."
                    confirmText="Xóa"
                    cancelText="Hủy"
                    type="error"
                />
            </div>
        </div>
    );
};

export default NurseSupplyPage;