import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiX, FiTablet, FiAlertTriangle, FiPackage, FiFilter } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import medicalApi from "../../api/medicalApi";

const MedicineInventory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialFilter = new URLSearchParams(location.search).get("filter") || "";
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [filterStatus, setFilterStatus] = useState(initialFilter);
    const [filterApprovalStatus, setFilterApprovalStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({ total: 0, inactive: 0, lowStock: 0 });
    const [showItemModal, setShowItemModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [pageSize] = useState(10);
    const [itemForm, setItemForm] = useState({
        id: 0,
        name: "",
        stockQuantity: 0,
        isActive: true,
    });
    const [formErrors, setFormErrors] = useState({});
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        approvalStatus: '',
        priority: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterApprovalStatus, filterPriority]);

    useEffect(() => {
        fetchMedicines();
    }, [filters, sortBy, sortOrder, currentPage, pageSize, searchTerm]);

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
    };

    const fetchMedicines = async () => {
        try {
            setLoading(true);

            // Xây dựng object params
            const params = {
                pageIndex: currentPage,
                pageSize: pageSize,
                type: 'Medication'
            };

            if (filters.approvalStatus) {
                params.approvalStatus = filters.approvalStatus;
            }

            if (filters.priority) {
                params.priority = filters.priority;
            }

            // Thêm params cho sorting nếu có
            if (sortBy && sortOrder) {
                params.orderBy = `${sortBy}_${sortOrder}`;
            }

            // Thêm param search nếu có
            if (searchTerm) {
                params.searchTerm = searchTerm;
            }

            const response = await medicalApi.getMedicalItems(params);

            if (response.success) {
                setMedicines(response.data);
                setTotalCount(response.totalCount);
                setTotalPages(response.totalPages);

                // Tính toán thống kê
                const total = response.totalCount;
                const inactive = response.data.filter(item => item.status === 'Inactive').length;
                const lowStock = response.data.filter(item => item.isLowStock).length;
                setStats({ total, inactive, lowStock });
            } else {
                console.error('Error fetching medicines:', response.message);
                showAlert("error", "Lỗi", response.message || "Không thể tải danh sách thuốc. Vui lòng thử lại.");
                setMedicines([]);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error fetching medicines:', error);
            showAlert("error", "Lỗi", "Không thể tải danh sách thuốc. Vui lòng thử lại.");
            setMedicines([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const createMedicine = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const medicineData = {
                type: 'Medication',
                name: itemForm.name,
                quantity: parseInt(itemForm.stockQuantity),
                status: itemForm.isActive ? 'Active' : 'Inactive'
            };
            const response = await medicalApi.createMedicalItem(medicineData);
            if (response.success) {
                closeModal();
                showAlert("success", "Thành công", `Thuốc "${itemForm.name}" đã được thêm thành công.`);
                fetchMedicines();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể thêm thuốc mới. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error creating medicine:", error);
            showAlert("error", "Lỗi", "Không thể thêm thuốc mới. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const updateMedicine = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const medicineData = {
                type: 'Medication',
                name: itemForm.name,
                quantity: parseInt(itemForm.stockQuantity),
                status: itemForm.isActive ? 'Active' : 'Inactive'
            };
            const response = await medicalApi.updateMedicalItem(itemForm.id, medicineData);
            if (response.success) {
                closeModal();
                showAlert("success", "Thành công", `Thuốc "${itemForm.name}" đã được cập nhật thành công.`);
                fetchMedicines();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể cập nhật thông tin thuốc. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error updating medicine:", error);
            showAlert("error", "Lỗi", "Không thể cập nhật thông tin thuốc. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteMedicine = async (id) => {
        setDeleting(true);
        try {
            const response = await medicalApi.deleteMedicalItem(id);
            if (response.success) {
                showAlert("success", "Thành công", `Thuốc đã được xóa thành công.`);
                fetchMedicines();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể xóa thuốc. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error deleting medicine:", error);
            showAlert("error", "Lỗi", "Không thể xóa thuốc. Vui lòng thử lại.");
        } finally {
            setDeleting(false);
            setShowConfirmModal(false);
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmAction(() => () => deleteMedicine(id));
        setShowConfirmModal(true);
    };

    const toggleMedicineStatus = async (item) => {
        try {
            const medicineData = {
                ...item,
                status: item.status === 'Active' ? 'Inactive' : 'Active'
            };
            const response = await medicalApi.updateMedicalItem(item.id, medicineData);
            if (response.success) {
                fetchMedicines();
                const newStatus = item.status === 'Active';
                const statusText = newStatus ? "vô hiệu hóa" : "kích hoạt";
                showAlert("success", "Thành công", `Thuốc "${item.name}" đã được ${statusText} thành công.`);
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể thay đổi trạng thái thuốc. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error toggling medicine status:", error);
            showAlert("error", "Lỗi", "Không thể thay đổi trạng thái thuốc. Vui lòng thử lại.");
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

    const openModal = (item = null) => {
        if (item) {
            setItemForm({
                id: item.medicineId,
                name: item.name,
                stockQuantity: item.stockQuantity,
                isActive: item.isActive,
            });
            setSelectedItem(item);
        } else {
            setItemForm({ id: 0, name: "", stockQuantity: 0, isActive: true });
            setSelectedItem(null);
        }
        setFormErrors({});
        setShowItemModal(true);
    };

    const closeModal = () => {
        setShowItemModal(false);
        setSelectedItem(null);
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};
        if (!itemForm.name.trim()) errors.name = "Tên thuốc không được để trống";
        if (isNaN(itemForm.stockQuantity) || itemForm.stockQuantity < 0) {
            errors.stockQuantity = "Số lượng phải là số dương";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setItemForm({ ...itemForm, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        selectedItem ? updateMedicine() : createMedicine();
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải thuốc..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen" >
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Quản lý thuốc
                            </h1>
                            <p className="mt-1" style={{ color: TEXT.SECONDARY }}>
                                Quản lý danh sách thuốc và vật tư y tế
                            </p>
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
                                        Tổng số thuốc
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.total}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiTablet className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
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

                <div
                    className="rounded-2xl shadow-xl border backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}
                >
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên, mã thuốc hoặc số lượng..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
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
                                        value={filters.approvalStatus}
                                        onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[200px]"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="PENDING">Chờ duyệt</option>
                                        <option value="APPROVED">Đã duyệt</option>
                                        <option value="REJECTED">Từ chối</option>
                                        <option value="DRAFT">Nháp</option>
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
                                    style={{
                                        backgroundColor: PRIMARY[50],
                                        color: PRIMARY[600]
                                    }}
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
                                            { key: "id", label: "Mã thuốc" },
                                            { key: "name", label: "Tên thuốc" },
                                            { key: "dosage", label: "Liều lượng" },
                                            { key: "quantity", label: "Số lượng" },
                                            { key: "expiryDate", label: "Hạn sử dụng" },
                                            { key: "status", label: "Trạng thái" },
                                            { key: "priority", label: "Độ ưu tiên" },
                                            { key: null, label: "Thao tác" }
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
                                    {medicines.length > 0 ? (
                                        medicines.map((item, index) => (
                                            <tr
                                                key={item.id || index}
                                                className="hover:bg-opacity-50 transition-all duration-200 group"
                                                style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] || '#fafafa' }}
                                            >
                                                <td className="py-4 px-6">
                                                    <span className="font-mono text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        #{(item.id || '').toString().substring(0, 8)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <div
                                                            className="h-2 w-2 rounded-full mr-3"
                                                            style={{
                                                                backgroundColor: item.isExpiringSoon ? WARNING[500] :
                                                                    item.isExpired ? ERROR[500] :
                                                                        item.isLowStock ? WARNING[500] :
                                                                            SUCCESS[500]
                                                            }}
                                                        ></div>
                                                        <div>
                                                            <span className="font-semibold block" style={{ color: TEXT.PRIMARY }}>
                                                                {item.name || 'N/A'}
                                                            </span>
                                                            <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                {item.form && item.formDisplayName ? `${item.formDisplayName} (${item.form})` : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {item.dosage || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <span
                                                            className="font-bold text-lg"
                                                            style={{ color: item.isLowStock ? ERROR[600] : TEXT.PRIMARY }}
                                                        >
                                                            {item.quantity || 0}
                                                        </span>
                                                        <span className="ml-1 text-sm" style={{ color: TEXT.SECONDARY }}>
                                                            {item.unit || 'N/A'}
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
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </span>
                                                        {(item.isExpiringSoon || item.isExpired) && (
                                                            <span
                                                                className="text-xs font-medium mt-1 px-2 py-1 rounded-full"
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
                                                <td className="py-4 px-6">
                                                    <span
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                                        style={{
                                                            backgroundColor:
                                                                item.status === 'Active' ? SUCCESS[100] :
                                                                    item.status === 'Pending' ? WARNING[100] :
                                                                        item.status === 'Rejected' ? ERROR[100] :
                                                                            GRAY[100],
                                                            color:
                                                                item.status === 'Active' ? SUCCESS[700] :
                                                                    item.status === 'Pending' ? WARNING[700] :
                                                                        item.status === 'Rejected' ? ERROR[700] :
                                                                            GRAY[700]
                                                        }}
                                                    >
                                                        {item.statusDisplayName || item.status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
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
                                                        {item.isUrgent && (
                                                            <FiAlertTriangle className="ml-1 h-3 w-3" />
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => openModal(item)}
                                                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                                            style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FiEdit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleMedicineStatus(item)}
                                                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                                            style={{
                                                                backgroundColor: item.status === 'Active' ? GRAY[50] : SUCCESS[50],
                                                                color: item.status === 'Active' ? GRAY[600] : SUCCESS[600]
                                                            }}
                                                            title={item.status === 'Active' ? "Đánh dấu ngừng sử dụng" : "Đánh dấu đang sử dụng"}
                                                        >
                                                            {item.status === 'Active' ? <FiX className="h-4 w-4" /> : <FiCheck className="h-4 w-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                                            style={{
                                                                backgroundColor: ERROR[50],
                                                                color: ERROR[600]
                                                            }}
                                                            title="Xóa"
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div
                                                        className="h-20 w-20 rounded-full flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: GRAY[100] }}
                                                    >
                                                        <FiPackage className="h-10 w-10" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        {medicines.length === 0 ? "Không có thuốc nào phù hợp" : "Không có dữ liệu trang này"}
                                                    </p>
                                                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        {medicines.length === 0 ?
                                                            "Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác" :
                                                            "Vui lòng chọn trang khác hoặc điều chỉnh bộ lọc"
                                                        }
                                                    </p>
                                                    {medicines.length === 0 && (
                                                        <button
                                                            onClick={resetFilters}
                                                            className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
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

                        {totalPages > 1 && (
                            <div
                                className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-gray-50/50"
                                style={{ borderColor: BORDER.DEFAULT, borderRadius: '0 0 0.75rem 0.75rem' }}
                            >
                                <div className="mb-4 sm:mb-0">
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
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
                                        className="px-3 py-2 text-sm font-semibold border rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm"
                                        style={{ borderColor: currentPage === 1 ? BORDER.DEFAULT : PRIMARY[300], color: currentPage === 1 ? TEXT.SECONDARY : PRIMARY[600], backgroundColor: BACKGROUND.DEFAULT }}
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
                                                className="px-3 py-2 text-sm font-semibold border rounded-lg transition-all duration-200 hover:shadow-sm"
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
                                        className="px-3 py-2 text-sm font-semibold border rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm"
                                        style={{
                                            borderColor: currentPage === totalPages ? BORDER.DEFAULT : PRIMARY[300],
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
                </div>

                <AlertModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    title="Xác nhận xóa thuốc"
                    message="Bạn có chắc chắn muốn xóa thuốc này không? Hành động này không thể hoàn tác."
                    type="warning"
                    confirmText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => {
                        confirmAction && confirmAction();
                        setShowConfirmModal(false);
                    }}
                />

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                />

                {deleting && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
                    >
                        <div
                            className="rounded-2xl shadow-2xl p-8 transform transition-all duration-300"
                            style={{ backgroundColor: BACKGROUND.DEFAULT }}
                        >
                            <div className="text-center">
                                <Loading type="medical" size="large" color="primary" text="Đang xóa thuốc..." />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default MedicineInventory;