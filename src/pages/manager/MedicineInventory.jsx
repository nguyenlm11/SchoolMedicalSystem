import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiX, FiTablet, FiAlertTriangle, FiPackage } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";
import MedicineModal from "../../components/modal/AddMedicineModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AlertModal from "../../components/modal/AlertModal";

const MedicineInventory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialFilter = new URLSearchParams(location.search).get("filter") || "all";
    const [medicines, setMedicines] = useState([]);
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
    const medicinesPerPage = 5;
    const [itemForm, setItemForm] = useState({
        id: 0,
        name: "",
        stockQuantity: 0,
        isActive: true,
    });
    const [formErrors, setFormErrors] = useState({});

    const mockMedicines = [
        { medicineId: 1, name: "Paracetamol 500mg", stockQuantity: 120, isActive: true },
        { medicineId: 2, name: "Ibuprofen 200mg", stockQuantity: 25, isActive: true },
        { medicineId: 3, name: "Vitamin C 500mg", stockQuantity: 200, isActive: true },
        { medicineId: 4, name: "Aspirin 100mg", stockQuantity: 5, isActive: false },
        { medicineId: 5, name: "Amoxicillin 250mg", stockQuantity: 80, isActive: true },
        { medicineId: 6, name: "Cephalexin 500mg", stockQuantity: 45, isActive: true },
    ];

    useEffect(() => {
        fetchMedicines();
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

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMedicines(mockMedicines);
            const total = mockMedicines.length;
            const inactive = mockMedicines.filter(item => !item.isActive).length;
            const lowStock = mockMedicines.filter(item => item.stockQuantity < 50).length;
            setStats({ total, inactive, lowStock });
        } catch (error) {
            console.error("Error fetching medicines:", error);
            showAlert("error", "Lỗi", "Không thể tải danh sách thuốc. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const createMedicine = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const newMedicine = {
                medicineId: Math.max(...medicines.map(m => m.medicineId)) + 1,
                name: itemForm.name,
                stockQuantity: parseInt(itemForm.stockQuantity),
                isActive: itemForm.isActive,
            };
            setMedicines([...medicines, newMedicine]);
            closeModal();
            showAlert("success", "Thành công", `Thuốc "${itemForm.name}" đã được thêm thành công.`);
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
            await new Promise(resolve => setTimeout(resolve, 800));
            const updatedMedicines = medicines.map(med =>
                med.medicineId === itemForm.id
                    ? { ...med, name: itemForm.name, stockQuantity: parseInt(itemForm.stockQuantity), isActive: itemForm.isActive }
                    : med
            );
            setMedicines(updatedMedicines);
            closeModal();
            showAlert("success", "Thành công", `Thuốc "${itemForm.name}" đã được cập nhật thành công.`);
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
            await new Promise(resolve => setTimeout(resolve, 500));
            const medicineToDelete = medicines.find(med => med.medicineId === id);
            setMedicines(medicines.filter(med => med.medicineId !== id));
            showAlert("success", "Thành công", `Thuốc "${medicineToDelete?.name}" đã được xóa thành công.`);
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

    const toggleMedicineStatus = (item) => {
        try {
            const updatedMedicines = medicines.map(med =>
                med.medicineId === item.medicineId ? { ...med, isActive: !med.isActive } : med
            );
            setMedicines(updatedMedicines);
            const newStatus = !item.isActive;
            const statusText = newStatus ? "kích hoạt" : "vô hiệu hóa";
            showAlert("success", "Thành công", `Thuốc "${item.name}" đã được ${statusText} thành công.`);
        } catch (error) {
            console.error("Error toggling medicine status:", error);
            showAlert("error", "Lỗi", "Không thể thay đổi trạng thái thuốc. Vui lòng thử lại.");
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

    const filteredMedicines = medicines.filter((item) => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch = !debouncedSearchTerm ||
            item.name.toLowerCase().includes(searchLower) ||
            item.medicineId.toString().includes(searchLower) ||
            item.stockQuantity.toString().includes(searchLower);

        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && item.isActive) ||
            (filterStatus === "inactive" && !item.isActive) ||
            (filterStatus === "low-stock" && item.stockQuantity < 50);

        return matchesSearch && matchesStatus;
    });

    const sortedMedicines = [...filteredMedicines].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "name": comparison = a.name.localeCompare(b.name); break;
            case "id": comparison = a.medicineId - b.medicineId; break;
            case "stock": comparison = a.stockQuantity - b.stockQuantity; break;
            default: comparison = 0;
        }
        return sortOrder === "asc" ? comparison : -comparison;
    });

    const totalPages = Math.ceil(sortedMedicines.length / medicinesPerPage);
    const indexOfLastMedicine = currentPage * medicinesPerPage;
    const indexOfFirstMedicine = indexOfLastMedicine - medicinesPerPage;
    const currentMedicines = sortedMedicines.slice(indexOfFirstMedicine, indexOfLastMedicine);

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
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Quản lý kho thuốc
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Theo dõi và quản lý danh sách thuốc tại trường
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
                            Thêm thuốc mới
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
                                            { key: "id", label: "Mã thuốc" },
                                            { key: "name", label: "Tên thuốc" },
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
                                    {currentMedicines.length > 0 ? (
                                        currentMedicines.map((item, index) => (
                                            <tr
                                                key={item.medicineId}
                                                className="hover:bg-opacity-50 transition-all duration-200 group"
                                                style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] || '#fafafa' }}
                                            >
                                                <td className="py-4 px-6">
                                                    <span className="font-mono text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        #{item.medicineId.toString().padStart(3, '0')}
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
                                                            onClick={() => toggleMedicineStatus(item)}
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
                                                            onClick={() => handleDeleteClick(item.medicineId)}
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
                                            <td colSpan="5" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div
                                                        className="h-20 w-20 rounded-full flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: GRAY[100] }}
                                                    >
                                                        <FiPackage className="h-10 w-10" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        {sortedMedicines.length === 0 ? "Không có thuốc nào phù hợp" : "Không có dữ liệu trang này"}
                                                    </p>
                                                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        {sortedMedicines.length === 0 ?
                                                            "Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác" :
                                                            "Vui lòng chọn trang khác hoặc điều chỉnh bộ lọc"
                                                        }
                                                    </p>
                                                    {sortedMedicines.length === 0 ? (
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
                                        Hiển thị {indexOfFirstMedicine + 1}-{Math.min(indexOfLastMedicine, sortedMedicines.length)} trong tổng số {sortedMedicines.length} thuốc
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

                <MedicineModal
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
                    title="Xác nhận xóa thuốc"
                    message="Bạn có chắc chắn muốn xóa thuốc này không? Hành động này không thể hoàn tác."
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