import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiX, FiPackage, FiAlertTriangle, FiBox } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";
import SupplyModal from "../../components/modal/AddSupplyModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AlertModal from "../../components/modal/AlertModal";

const SupplyInventory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialFilter = new URLSearchParams(location.search).get("filter") || "all";
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
    const suppliesPerPage = 5;
    const [itemForm, setItemForm] = useState({
        id: 0,
        name: "",
        stockQuantity: 0,
        category: "",
        description: "",
        isActive: true,
    });
    const [formErrors, setFormErrors] = useState({});

    const mockSupplies = [
        { supplyId: 1, name: "Băng gạc y tế", category: "Băng", description: "Băng gạc vô trùng dùng để băng bó vết thương", stockQuantity: 150, isActive: true },
        { supplyId: 2, name: "Cồn y tế 70%", category: "Dung dịch", description: "Cồn sát trùng dùng để vệ sinh vết thương", stockQuantity: 35, isActive: true },
        { supplyId: 3, name: "Bông y tế", category: "Vật liệu", description: "Bông y tế vô trùng dùng để vệ sinh", stockQuantity: 200, isActive: true },
        { supplyId: 4, name: "Kim tiêm dùng một lần", category: "Dụng cụ", description: "Kim tiêm vô trùng dùng một lần", stockQuantity: 12, isActive: false },
        { supplyId: 5, name: "Ống nghiệm", category: "Dụng cụ", description: "Ống nghiệm dùng để xét nghiệm", stockQuantity: 80, isActive: true },
        { supplyId: 6, name: "Găng tay y tế", category: "Bảo hộ", description: "Găng tay cao su y tế dùng một lần", stockQuantity: 45, isActive: true },
        { supplyId: 7, name: "Khẩu trang y tế", category: "Bảo hộ", description: "Khẩu trang y tế 3 lớp", stockQuantity: 300, isActive: true },
        { supplyId: 8, name: "Nhiệt kế điện tử", category: "Thiết bị", description: "Nhiệt kế điện tử đo nhiệt độ cơ thể", stockQuantity: 25, isActive: true },
    ];

    useEffect(() => {
        fetchSupplies();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, debouncedSearchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
    };

    const fetchSupplies = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSupplies(mockSupplies);
            const total = mockSupplies.length;
            const inactive = mockSupplies.filter(item => !item.isActive).length;
            const lowStock = mockSupplies.filter(item => item.stockQuantity < 50).length;
            setStats({ total, inactive, lowStock });
        } catch (error) {
            console.error("Error fetching supplies:", error);
            showAlert("error", "Lỗi", "Không thể tải danh sách vật tư y tế. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const createSupply = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const newSupply = {
                supplyId: Math.max(...supplies.map(s => s.supplyId)) + 1,
                name: itemForm.name,
                category: itemForm.category,
                description: itemForm.description,
                stockQuantity: parseInt(itemForm.stockQuantity),
                isActive: itemForm.isActive,
            };
            setSupplies([...supplies, newSupply]);
            closeModal();
            showAlert("success", "Thành công", `Vật tư y tế "${itemForm.name}" đã được thêm thành công.`);
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
            await new Promise(resolve => setTimeout(resolve, 800));
            const updatedSupplies = supplies.map(supply =>
                supply.supplyId === itemForm.id
                    ? { ...supply, name: itemForm.name, category: itemForm.category, description: itemForm.description, stockQuantity: parseInt(itemForm.stockQuantity), isActive: itemForm.isActive }
                    : supply
            );
            setSupplies(updatedSupplies);
            closeModal();
            showAlert("success", "Thành công", `Vật tư y tế "${itemForm.name}" đã được cập nhật thành công.`);
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
            await new Promise(resolve => setTimeout(resolve, 500));
            const supplyToDelete = supplies.find(supply => supply.supplyId === id);
            setSupplies(supplies.filter(supply => supply.supplyId !== id));
            showAlert("success", "Thành công", `Vật tư y tế "${supplyToDelete?.name}" đã được xóa thành công.`);
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

    const toggleSupplyStatus = (item) => {
        try {
            const updatedSupplies = supplies.map(supply =>
                supply.supplyId === item.supplyId ? { ...supply, isActive: !supply.isActive } : supply
            );
            setSupplies(updatedSupplies);
            const newStatus = !item.isActive;
            const statusText = newStatus ? "kích hoạt" : "vô hiệu hóa";
            showAlert("success", "Thành công", `Vật tư y tế "${item.name}" đã được ${statusText} thành công.`);
        } catch (error) {
            console.error("Error toggling supply status:", error);
            showAlert("error", "Lỗi", "Không thể thay đổi trạng thái vật tư y tế. Vui lòng thử lại.");
        }
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        const params = new URLSearchParams(location.search);
        if (status === "all") {
            params.delete("filter");
        } else {
            params.set("filter", status);
        }
        navigate({ search: params.toString() });
    };

    const resetFilters = () => {
        setFilterStatus("all");
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setSortBy("name");
        setSortOrder("asc");
        setCurrentPage(1);
        navigate({ search: "" });
    };

    const handleSortChange = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setItemForm({
                id: item.supplyId,
                name: item.name,
                stockQuantity: item.stockQuantity,
                category: item.category || "",
                description: item.description || "",
                isActive: item.isActive,
            });
            setSelectedItem(item);
        } else {
            setItemForm({ id: 0, name: "", stockQuantity: 0, category: "", description: "", isActive: true });
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

    const totalPages = Math.ceil(sortedSupplies.length / suppliesPerPage);
    const indexOfLastSupply = currentPage * suppliesPerPage;
    const indexOfFirstSupply = indexOfLastSupply - suppliesPerPage;
    const currentSupplies = sortedSupplies.slice(indexOfFirstSupply, indexOfLastSupply);

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Quản lý vật tư y tế
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Theo dõi và quản lý danh sách vật tư y tế tại trường
                            </p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="px-6 py-3 rounded-xl flex items-center font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            style={{
                                background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                color: TEXT.INVERSE
                            }}
                        >
                            <FiPlus className="mr-2 h-5 w-5" />
                            Thêm vật tư mới
                        </button>
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
                                <select
                                    className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 min-w-[180px]"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        focusRingColor: PRIMARY[500] + '40'
                                    }}
                                    value={filterStatus}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="active">Đang sử dụng</option>
                                    <option value="inactive">Ngừng sử dụng</option>
                                    <option value="low-stock">Sắp hết hàng</option>
                                </select>

                                <button
                                    onClick={resetFilters}
                                    className="flex items-center px-6 py-3 rounded-xl transition-all duration-200 font-medium border"
                                    style={{
                                        color: PRIMARY[600],
                                        borderColor: PRIMARY[200],
                                        backgroundColor: PRIMARY[50]
                                    }}
                                >
                                    <FiRefreshCw className="mr-2 h-4 w-4" />
                                    Đặt lại
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
                                            { key: "category", label: "Loại" },
                                            { key: "stock", label: "Số lượng" },
                                            { key: null, label: "Trạng thái" },
                                            { key: null, label: "Thao tác" }
                                        ].map((col, idx) => (
                                            <th
                                                key={idx}
                                                className={`py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider ${col.key ? 'cursor-pointer hover:bg-opacity-80' : ''} transition-all duration-200`}
                                                style={{ color: TEXT.SECONDARY }}
                                                onClick={col.key ? () => handleSortChange(col.key) : undefined}
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
                                                        #{item.supplyId.toString().padStart(3, '0')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <div
                                                            className="h-2 w-2 rounded-full mr-3"
                                                            style={{ backgroundColor: item.isActive ? SUCCESS[500] : GRAY[400] }}
                                                        ></div>
                                                        <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span style={{ color: TEXT.SECONDARY }}>
                                                        {item.category || "-"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <span
                                                            className="font-bold text-lg"
                                                            style={{ color: item.stockQuantity < 50 ? ERROR[600] : TEXT.PRIMARY }}
                                                        >
                                                            {item.stockQuantity}
                                                        </span>
                                                        {item.stockQuantity < 50 && (
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
                                                            backgroundColor: item.isActive ? SUCCESS[100] : GRAY[100],
                                                            color: item.isActive ? SUCCESS[800] : GRAY[700]
                                                        }}
                                                    >
                                                        {item.isActive ? "Đang sử dụng" : "Ngừng sử dụng"}
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
                                                                backgroundColor: item.isActive ? GRAY[50] : SUCCESS[50],
                                                                color: item.isActive ? GRAY[600] : SUCCESS[600]
                                                            }}
                                                            title={item.isActive ? "Đánh dấu ngừng sử dụng" : "Đánh dấu đang sử dụng"}
                                                        >
                                                            {item.isActive ? <FiX className="h-4 w-4" /> : <FiCheck className="h-4 w-4" />}
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