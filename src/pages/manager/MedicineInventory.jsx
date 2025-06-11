import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiX, FiTablet, FiAlertTriangle, FiPackage, FiTrendingDown, FiActivity } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW, SUCCESS, ERROR, WARNING } from "../../constants/colors";

const MedicineInventory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get("filter") || "all";
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(initialFilter);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [stats, setStats] = useState({ total: 0, inactive: 0, lowStock: 0 });
    const [showItemModal, setShowItemModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemForm, setItemForm] = useState({
        id: 0,
        name: "",
        stockQuantity: 0,
        isActive: true,
    });
    const [formErrors, setFormErrors] = useState({});
    const mockMedicines = [
        {
            medicineId: 1,
            name: "Paracetamol 500mg",
            stockQuantity: 120,
            isActive: true,
        },
        {
            medicineId: 2,
            name: "Ibuprofen 200mg",
            stockQuantity: 25,
            isActive: true,
        },
        {
            medicineId: 3,
            name: "Vitamin C 500mg",
            stockQuantity: 200,
            isActive: true,
        },
        {
            medicineId: 4,
            name: "Aspirin 100mg",
            stockQuantity: 5,
            isActive: false,
        },
    ];

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const items = mockMedicines;
            setMedicines(items);
            const total = items.length;
            const inactive = items.filter((item) => !item.isActive).length;
            const lowStock = items.filter((item) => item.stockQuantity < 50).length;

            setStats({ total, inactive, lowStock });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching medicines:", error);
            setLoading(false);
        }
    };

    const createMedicine = async () => {
        if (!validateForm()) return;

        try {
            const newId = Math.max(...medicines.map(m => m.medicineId)) + 1;
            const newMedicine = {
                medicineId: newId,
                name: itemForm.name,
                stockQuantity: parseInt(itemForm.stockQuantity),
                isActive: itemForm.isActive,
            };

            setMedicines([...medicines, newMedicine]);
            fetchMedicines();
            setShowItemModal(false);
            resetForm();
        } catch (error) {
            console.error("Error creating medicine:", error);
        }
    };

    const updateMedicine = async () => {
        if (!validateForm()) return;

        try {
            const updatedMedicines = medicines.map(med =>
                med.medicineId === itemForm.id
                    ? { ...med, name: itemForm.name, stockQuantity: parseInt(itemForm.stockQuantity), isActive: itemForm.isActive }
                    : med
            );

            setMedicines(updatedMedicines);
            fetchMedicines();
            setShowItemModal(false);
            resetForm();
        } catch (error) {
            console.error("Error updating medicine:", error);
        }
    };

    const deleteMedicine = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thuốc này không?")) {
            try {
                const updatedMedicines = medicines.filter(med => med.medicineId !== id);
                setMedicines(updatedMedicines);
                fetchMedicines();
            } catch (error) {
                console.error("Error deleting medicine:", error);
            }
        }
    };

    const toggleMedicineStatus = async (item) => {
        try {
            const updatedMedicines = medicines.map(med =>
                med.medicineId === item.medicineId ? { ...med, isActive: !med.isActive } : med
            );

            setMedicines(updatedMedicines);
            fetchMedicines();
        } catch (error) {
            console.error("Error toggling medicine status:", error);
        }
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        const params = new URLSearchParams(location.search);
        params.set("filter", status);
        navigate({ search: params.toString() });
    };

    const resetFilters = () => {
        setFilterStatus("all");
        setSearchTerm("");
        setSortBy("name");
        setSortOrder("asc");
        const params = new URLSearchParams(location.search);
        params.delete("filter");
        navigate({ search: params.toString() });
    };

    const filteredMedicines = medicines.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.medicineId && item.medicineId.toString().includes(searchTerm));

        let matchesStatus = true;
        if (filterStatus === "active") matchesStatus = item.isActive;
        else if (filterStatus === "inactive") matchesStatus = !item.isActive;
        else if (filterStatus === "low-stock") matchesStatus = item.stockQuantity < 50;

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

    const isLowStock = (item) => item.stockQuantity < 50;

    const handleSortChange = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    const handleAddEditMedicine = (item = null) => {
        if (item) {
            setItemForm({
                id: item.medicineId,
                name: item.name,
                stockQuantity: item.stockQuantity,
                isActive: item.isActive,
            });
            setSelectedItem(item);
        } else {
            resetForm();
            setSelectedItem(null);
        }
        setShowItemModal(true);
    };

    const resetForm = () => {
        setItemForm({ id: 0, name: "", stockQuantity: 0, isActive: true });
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};
        if (!itemForm.name.trim()) errors.name = "Tên thuốc không được để trống";
        if (isNaN(itemForm.stockQuantity) || itemForm.stockQuantity < 0) errors.stockQuantity = "Số lượng phải là số dương";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setItemForm({ ...itemForm, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedItem) updateMedicine();
        else createMedicine();
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: PRIMARY[500] }}></div>
                    <p style={{ color: TEXT.SECONDARY }}>Đang tải danh sách thuốc...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" >
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
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
                            onClick={() => handleAddEditMedicine()}
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

                {/* Stats Cards */}
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

                {/* Main Content Card */}
                <div
                    className="rounded-2xl shadow-xl border backdrop-blur-sm"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: BORDER.LIGHT,
                        boxShadow: `0 25px 50px -12px ${SHADOW.MEDIUM}`
                    }}
                >
                    {/* Filters */}
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên hoặc mã thuốc..."
                                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
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
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = PRIMARY[100];
                                        e.target.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = PRIMARY[50];
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    <FiRefreshCw className="mr-2 h-4 w-4" />
                                    Đặt lại
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
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
                                    {sortedMedicines.length > 0 ? (
                                        sortedMedicines.map((item, index) => (
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
                                                            style={{ color: isLowStock(item) ? ERROR[600] : TEXT.PRIMARY }}
                                                        >
                                                            {item.stockQuantity}
                                                        </span>
                                                        {isLowStock(item) && (
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
                                                            onClick={() => handleAddEditMedicine(item)}
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
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = item.isActive ? GRAY[100] : SUCCESS[100]}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = item.isActive ? GRAY[50] : SUCCESS[50]}
                                                            title={item.isActive ? "Đánh dấu ngừng sử dụng" : "Đánh dấu đang sử dụng"}
                                                        >
                                                            {item.isActive ? <FiX className="h-4 w-4" /> : <FiCheck className="h-4 w-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteMedicine(item.medicineId)}
                                                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                                            style={{
                                                                backgroundColor: ERROR[50],
                                                                color: ERROR[600]
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = ERROR[100]}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = ERROR[50]}
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
                                                        Không có thuốc nào phù hợp
                                                    </p>
                                                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                                                    </p>
                                                    <button
                                                        onClick={resetFilters}
                                                        className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                        style={{
                                                            backgroundColor: PRIMARY[100],
                                                            color: PRIMARY[700]
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[200]}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[100]}
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
                    </div>
                </div>

                {/* Modal */}
                {showItemModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setShowItemModal(false)}
                    >
                        <div
                            className="rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100"
                            style={{ backgroundColor: BACKGROUND.DEFAULT }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                <h3 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    {selectedItem ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                            Tên thuốc *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={itemForm.name}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                            style={{
                                                borderColor: formErrors.name ? ERROR[500] : BORDER.DEFAULT,
                                                focusRingColor: PRIMARY[500] + '40'
                                            }}
                                            placeholder="Nhập tên thuốc..."
                                        />
                                        {formErrors.name && (
                                            <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                                {formErrors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                            Số lượng *
                                        </label>
                                        <input
                                            type="number"
                                            name="stockQuantity"
                                            value={itemForm.stockQuantity}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                            style={{
                                                borderColor: formErrors.stockQuantity ? ERROR[500] : BORDER.DEFAULT,
                                                focusRingColor: PRIMARY[500] + '40'
                                            }}
                                            placeholder="Nhập số lượng..."
                                        />
                                        {formErrors.stockQuantity && (
                                            <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                                {formErrors.stockQuantity}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={itemForm.isActive}
                                            onChange={handleInputChange}
                                            className="h-5 w-5 rounded focus:ring-2 transition-all duration-200"
                                            style={{
                                                color: PRIMARY[600],
                                                focusRingColor: PRIMARY[500] + '40'
                                            }}
                                        />
                                        <label className="ml-3 text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                            Đang sử dụng
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowItemModal(false)}
                                        className="flex-1 py-3 px-4 border rounded-xl font-semibold transition-all duration-200"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            color: TEXT.SECONDARY,
                                            backgroundColor: BACKGROUND.DEFAULT
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = GRAY[50]}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = BACKGROUND.DEFAULT}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                                        style={{
                                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                            color: TEXT.INVERSE
                                        }}
                                    >
                                        {selectedItem ? "Cập nhật" : "Thêm mới"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicineInventory;