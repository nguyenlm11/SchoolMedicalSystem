import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiX, FiPackage, FiAlertTriangle, FiBox } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";
import SupplyModal from "../../components/modal/AddSupplyModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AlertModal from "../../components/modal/AlertModal";
import medicalApi from "../../api/medicalApi";

const SupplyInventory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialFilter = new URLSearchParams(location.search).get("filter") || "";
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [filterStatus, setFilterStatus] = useState(initialFilter);
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
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [itemForm, setItemForm] = useState({
        id: "",
        name: "",
        description: "",
        quantity: 0,
        unit: "",
        justification: "",
        status: "Pending",
        priority: "Low",
        isUrgent: false
    });
    const [formErrors, setFormErrors] = useState({});
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
    }, [filterStatus, filters.approvalStatus, filters.priority]);

    useEffect(() => {
        fetchSupplies();
    }, [filters, sortBy, sortOrder, currentPage, pageSize, debouncedSearchTerm]);

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
    };

    const fetchSupplies = async () => {
        try {
            setLoading(true);

            const params = {
                pageIndex: currentPage,
                pageSize: pageSize,
                type: 'Supply'
            };

            if (filters.approvalStatus) {
                params.approvalStatus = filters.approvalStatus;
            }

            if (filters.priority) {
                params.priority = filters.priority;
            }

            if (sortBy && sortOrder) {
                params.orderBy = `${sortBy}_${sortOrder}`;
            }

            if (debouncedSearchTerm) {
                params.searchTerm = debouncedSearchTerm;
            }

            const response = await medicalApi.getMedicalItems(params);
            console.log(response);

            if (response.success) {
                setSupplies(response.data);
                console.log(response.data);
                setTotalCount(response.totalCount);
                setTotalPages(response.totalPages);
                setCurrentPage(response.currentPage);

                // Tính toán thống kê
                const total = response.totalCount;
                const inactive = response.data.filter(item => item.status === 'Inactive').length;
                const lowStock = response.data.filter(item => item.isLowStock).length;
                setStats({ total, inactive, lowStock });
            } else {
                console.error('Error fetching supplies:', response.message);
                showAlert("error", "Lỗi", response.message || "Không thể tải danh sách vật tư y tế. Vui lòng thử lại.");
                setSupplies([]);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error fetching supplies:', error);
            showAlert("error", "Lỗi", "Không thể tải danh sách vật tư y tế. Vui lòng thử lại.");
            setSupplies([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const createSupply = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const supplyData = {
                type: 'Supply',
                name: itemForm.name,
                description: itemForm.description,
                quantity: parseInt(itemForm.quantity),
                unit: itemForm.unit,
                justification: itemForm.justification,
                status: itemForm.status,
                priority: itemForm.priority,
                isUrgent: itemForm.isUrgent
            };
            const response = await medicalApi.createMedicalItem(supplyData);
            if (response.success) {
                closeModal();
                showAlert("success", "Thành công", `Vật tư y tế "${itemForm.name}" đã được thêm thành công.`);
                fetchSupplies();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể thêm vật tư y tế mới. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error creating supply:", error);
            showAlert("error", "Lỗi", "Không thể thêm vật tư y tế mới. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const updateSupply = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const supplyData = {
                type: 'Supply',
                name: itemForm.name,
                description: itemForm.description,
                quantity: parseInt(itemForm.quantity),
                unit: itemForm.unit,
                justification: itemForm.justification,
                status: itemForm.status,
                priority: itemForm.priority,
                isUrgent: itemForm.isUrgent
            };
            const response = await medicalApi.updateMedicalItem(itemForm.id, supplyData);
            if (response.success) {
                closeModal();
                showAlert("success", "Thành công", `Vật tư y tế "${itemForm.name}" đã được cập nhật thành công.`);
                fetchSupplies();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể cập nhật thông tin vật tư y tế. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error updating supply:", error);
            showAlert("error", "Lỗi", "Không thể cập nhật thông tin vật tư y tế. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteSupply = async (id) => {
        setDeleting(true);
        try {
            const response = await medicalApi.deleteMedicalItem(id);
            if (response.success) {
                showAlert("success", "Thành công", `Vật tư y tế đã được xóa thành công.`);
                fetchSupplies();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể xóa vật tư y tế. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error deleting supply:", error);
            showAlert("error", "Lỗi", "Không thể xóa vật tư y tế. Vui lòng thử lại.");
        } finally {
            setDeleting(false);
            setShowConfirmModal(false);
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmAction(() => () => deleteSupply(id));
        setShowConfirmModal(true);
    };

    const toggleSupplyStatus = async (item) => {
        try {
            const supplyData = {
                ...item,
                status: item.status === 'Active' ? 'Inactive' : 'Active'
            };
            const response = await medicalApi.updateMedicalItem(item.id, supplyData);
            if (response.success) {
                fetchSupplies();
                const newStatus = item.status === 'Active';
                const statusText = newStatus ? "vô hiệu hóa" : "kích hoạt";
                showAlert("success", "Thành công", `Vật tư y tế "${item.name}" đã được ${statusText} thành công.`);
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể thay đổi trạng thái vật tư y tế. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error toggling supply status:", error);
            showAlert("error", "Lỗi", "Không thể thay đổi trạng thái vật tư y tế. Vui lòng thử lại.");
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
                id: item.id,
                name: item.name,
                description: item.description || "",
                quantity: item.quantity,
                unit: item.unit || "",
                justification: item.justification || "",
                status: item.status,
                priority: item.priority,
                isUrgent: item.isUrgent
            });
            setSelectedItem(item);
        } else {
            setItemForm({
                id: "",
                name: "",
                description: "",
                quantity: 0,
                unit: "",
                justification: "",
                status: "Pending",
                priority: "Low",
                isUrgent: false
            });
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
        if (!itemForm.name.trim()) errors.name = "Tên vật tư y tế không được để trống";
        if (!itemForm.description.trim()) errors.description = "Mô tả không được để trống";
        if (isNaN(itemForm.quantity) || itemForm.quantity < 0) {
            errors.quantity = "Số lượng phải là số dương";
        }
        if (!itemForm.unit.trim()) errors.unit = "Đơn vị tính không được để trống";
        if (!itemForm.justification.trim()) errors.justification = "Lý do yêu cầu không được để trống";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setItemForm({ ...itemForm, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        selectedItem ? updateSupply() : createSupply();
    };

    const filteredSupplies = supplies.filter((item) => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch = !debouncedSearchTerm ||
            item.name.toLowerCase().includes(searchLower) ||
            item.supplyId.toString().includes(searchLower) ||
            (item.category && item.category.toLowerCase().includes(searchLower)) ||
            item.stockQuantity.toString().includes(searchLower);

        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && item.isActive) ||
            (filterStatus === "inactive" && !item.isActive) ||
            (filterStatus === "low-stock" && item.stockQuantity < 50);

        return matchesSearch && matchesStatus;
    });

    const sortedSupplies = [...filteredSupplies].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "name": comparison = a.name.localeCompare(b.name); break;
            case "id": comparison = a.supplyId - b.supplyId; break;
            case "stock": comparison = a.stockQuantity - b.stockQuantity; break;
            case "category": comparison = (a.category || "").localeCompare(b.category || ""); break;
            default: comparison = 0;
        }
        return sortOrder === "asc" ? comparison : -comparison;
    });

    const indexOfLastSupply = currentPage * pageSize;
    const indexOfFirstSupply = indexOfLastSupply - pageSize;
    const currentSupplies = sortedSupplies.slice(indexOfFirstSupply, indexOfLastSupply);

    const getStatusClasses = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityClasses = (priority) => {
        switch (priority) {
            case 'Low':
                return 'bg-blue-100 text-blue-800';
            case 'Normal':
                return 'bg-green-100 text-green-800';
            case 'High':
                return 'bg-yellow-100 text-yellow-800';
            case 'Critical':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải vật tư y tế..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen" >
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                            Quản lý vật tư y tế
                        </h1>
                        <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                            Theo dõi và quản lý danh sách vật tư y tế tại trường
                        </p>
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

                <div
                    className="rounded-2xl shadow-xl border backdrop-blur-sm"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: BORDER.LIGHT,
                    }}
                >
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên, mã vật tư, loại hoặc số lượng..."
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
                                            { key: "id", label: "Mã vật tư" },
                                            { key: "name", label: "Tên vật tư" },
                                            { key: "justification", label: "Lý do yêu cầu" },
                                            { key: "quantity", label: "Số lượng" },
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
                                    {currentSupplies.length > 0 ? (
                                        currentSupplies.map((item, index) => (
                                            <tr
                                                key={item.supplyId}
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
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {item.justification || 'N/A'}
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
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(item.status)}`}
                                                    >
                                                        {item.statusDisplayName || item.status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityClasses(item.priority)}`}
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
                                                            onClick={() => toggleSupplyStatus(item)}
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
                                                            onClick={() => handleDeleteClick(item.supplyId)}
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
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div
                                                        className="h-20 w-20 rounded-full flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: GRAY[100] }}
                                                    >
                                                        <FiPackage className="h-10 w-10" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        {sortedSupplies.length === 0 ? "Không có vật tư y tế nào phù hợp" : "Không có dữ liệu trang này"}
                                                    </p>
                                                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        {sortedSupplies.length === 0 ?
                                                            "Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác" :
                                                            "Vui lòng chọn trang khác hoặc điều chỉnh bộ lọc"
                                                        }
                                                    </p>
                                                    {sortedSupplies.length === 0 ? (
                                                        <button
                                                            onClick={resetFilters}
                                                            className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                            style={{
                                                                backgroundColor: PRIMARY[100],
                                                                color: PRIMARY[700]
                                                            }}
                                                        >
                                                            <FiRefreshCw className="mr-2 h-4 w-4" />
                                                            Đặt lại bộ lọc
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setCurrentPage(1)}
                                                            className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                            style={{
                                                                backgroundColor: PRIMARY[100],
                                                                color: PRIMARY[700]
                                                            }}
                                                        >
                                                            Về trang đầu
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
                            <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                                <div className="mb-4 sm:mb-0" style={{ color: TEXT.SECONDARY }}>
                                    <span className="text-sm">
                                        Hiển thị {indexOfFirstSupply + 1}-{Math.min(indexOfLastSupply, sortedSupplies.length)} trong tổng số {sortedSupplies.length} vật tư y tế
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                borderColor: currentPage === 1 ? BORDER.DEFAULT : PRIMARY[300],
                                                color: currentPage === 1 ? TEXT.SECONDARY : PRIMARY[600],
                                                backgroundColor: BACKGROUND.DEFAULT
                                            }}
                                        >
                                            <svg
                                                className="h-4 w-4 lg:h-5 lg:w-5"
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

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                            <button
                                                key={number}
                                                onClick={() => setCurrentPage(number)}
                                                className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                                                style={{
                                                    borderColor: currentPage === number ? PRIMARY[500] : BORDER.DEFAULT,
                                                    backgroundColor: currentPage === number ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                                    color: currentPage === number ? TEXT.INVERSE : TEXT.PRIMARY
                                                }}
                                            >
                                                {number}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                borderColor: currentPage === totalPages ? BORDER.DEFAULT : PRIMARY[300],
                                                color: currentPage === totalPages ? TEXT.SECONDARY : PRIMARY[600],
                                                backgroundColor: BACKGROUND.DEFAULT
                                            }}
                                        >
                                            <svg
                                                className="h-4 w-4 lg:h-5 lg:w-5"
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
                            </div>
                        )}
                    </div>
                </div>

                <SupplyModal
                    isOpen={showItemModal}
                    onClose={closeModal}
                    onSubmit={handleSubmit}
                    itemForm={itemForm}
                    selectedItem={selectedItem}
                    formErrors={formErrors}
                    submitting={submitting}
                    onInputChange={handleInputChange}
                />

                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmAction}
                    title="Xác nhận xóa vật tư y tế"
                    message="Bạn có chắc chắn muốn xóa vật tư y tế này không? Hành động này không thể hoàn tác."
                    confirmText="Xóa"
                    cancelText="Hủy"
                    type="error"
                    isLoading={deleting}
                />

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                    okText="OK"
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
                                <Loading type="medical" size="large" color="primary" text="Đang xóa vật tư y tế..." />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default SupplyInventory;