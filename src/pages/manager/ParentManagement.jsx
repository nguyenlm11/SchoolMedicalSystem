import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiUser, FiUsers, FiUserCheck, FiUserX, FiEdit, FiTrash2, FiSearch, FiRefreshCw, FiEye } from "react-icons/fi";
import { PRIMARY, SUCCESS, ERROR, WARNING, GRAY, TEXT, BACKGROUND, BORDER } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import AddParentModal from "../../components/modal/AddParentModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import userApi from "../../api/userApi";

const ParentManagement = () => {
    const navigate = useNavigate();
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("fullName");
    const [sortOrder, setSortOrder] = useState("asc");
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const [paginationState, setPaginationState] = useState({ totalPages: 1, totalCount: 0, pageSize: 10, currentPage: 1 });
    const [showAddParentModal, setShowAddParentModal] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchParents();
    }, [paginationState.currentPage, paginationState.pageSize, debouncedSearchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
    };

    const fetchParents = async () => {
        // setLoading(true);
        try {
            const params = {
                pageIndex: paginationState.currentPage,
                pageSize: paginationState.pageSize,
                searchTerm: debouncedSearchTerm
            };
            const response = await userApi.getParents(params);
            if (response.success) {
                setParents(response.data);
                setPaginationState({
                    totalPages: response.totalPages,
                    totalCount: response.totalCount,
                    pageSize: response.pageSize,
                    currentPage: response.currentPage
                });
                const total = response.totalCount;
                const active = response.data.filter(item => item.children.length > 0).length;
                const inactive = total - active;
                setStats({ total, active, inactive });
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể tải danh sách phụ huynh");
            }
        } catch (error) {
            showAlert("error", "Lỗi", "Không thể tải danh sách phụ huynh. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    const getSortedParents = () => {
        return [...parents].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case "fullName":
                    comparison = a.fullName.localeCompare(b.fullName);
                    break;
                case "relationship":
                    comparison = (a.relationship || "").localeCompare(b.relationship || "");
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });
    };

    const handleViewDetails = (parent) => {
        navigate(`/manager/parents/${parent.id}`);
    };

    const handleAddParent = () => {
        setShowAddParentModal(true);
    };

    const handleAddParentSuccess = (message) => {
        showAlert("success", "Thành công", message);
        fetchParents();
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSortBy("fullName");
        setSortOrder("asc");
        setPaginationState(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleDelete = async () => {
        if (!selectedParent) return;
        setIsDeleting(true);
        try {
            const response = await userApi.deleteParent(selectedParent.id);
            if (response.success) {
                showAlert("success", "Thành công", "Đã xóa phụ huynh thành công");
                fetchParents();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể xóa phụ huynh. Vui lòng thử lại.");
            }
        } catch (error) {
            showAlert("error", "Lỗi", "Không thể xóa phụ huynh. Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setSelectedParent(null);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách phụ huynh..." />
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
                                Quản lý phụ huynh
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Theo dõi và quản lý danh sách phụ huynh tại trường
                            </p>
                        </div>
                        <button
                            onClick={handleAddParent}
                            className="px-6 py-3 rounded-xl flex items-center font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, color: TEXT.INVERSE }}
                        >
                            <FiPlus className="mr-2 h-5 w-5" />
                            Thêm phụ huynh mới
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, borderColor: PRIMARY[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Tổng số phụ huynh
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.total}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUsers className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`, borderColor: SUCCESS[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Phụ huynh đang hoạt động
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.active}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUserCheck className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${WARNING[500]} 0%, ${WARNING[600]} 100%)`, borderColor: WARNING[200] }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Phụ huynh không hoạt động
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.inactive}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUserX className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="rounded-2xl shadow-xl border backdrop-blur-sm mb-6 sm:mb-8"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}
                >
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
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

                    <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: PRIMARY[50] }}>
                                        <th
                                            className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200 whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("fullName")}
                                        >
                                            <div className="flex items-center">
                                                <span>HỌ TÊN</span>
                                                {sortBy === "fullName" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200 whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("relationship")}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>MỐI QUAN HỆ</span>
                                                {sortBy === "relationship" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200 whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("email")}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>EMAIL</span>
                                                {sortBy === "email" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200 whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("phoneNumber")}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>SỐ ĐIỆN THOẠI</span>
                                                {sortBy === "phoneNumber" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200 whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("address")}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>ĐỊA CHỈ</span>
                                                {sortBy === "address" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                        >
                                            TRẠNG THÁI
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                        >
                                            THAO TÁC
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <Loading type="medical" size="large" color="primary" text="Đang tải danh sách phụ huynh..." />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : getSortedParents().length > 0 ? (
                                        getSortedParents().map((parent, index) => (
                                            <tr
                                                key={parent.id}
                                                className="hover:bg-opacity-50 transition-all duration-200"
                                                style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                            >
                                                <td className="py-4 px-6">
                                                    <span className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {parent.fullName}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center" style={{ color: TEXT.PRIMARY }}>
                                                    {parent.relationship === 'Mother' ? 'Mẹ' :
                                                        parent.relationship === 'Father' ? 'Bố' :
                                                            parent.relationship === 'Guardian' ? 'Người giám hộ' : parent.relationship}
                                                </td>
                                                <td className="py-4 px-6 text-center" style={{ color: TEXT.PRIMARY }}>
                                                    {parent.email}
                                                </td>
                                                <td className="py-4 px-6 text-center" style={{ color: TEXT.PRIMARY }}>
                                                    {parent.phoneNumber}
                                                </td>
                                                <td className="py-4 px-6 text-center" style={{ color: TEXT.PRIMARY }}>
                                                    {parent.address || 'N/A'}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span
                                                        className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: parent.children.length > 0 ? SUCCESS[100] : WARNING[100],
                                                            color: parent.children.length > 0 ? SUCCESS[800] : WARNING[800],
                                                            border: `2px solid ${parent.children.length > 0 ? SUCCESS[200] : WARNING[200]}`
                                                        }}
                                                    >
                                                        {parent.children.length > 0 ? `${parent.children.length} con` : "Chưa có con"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex space-x-2 justify-center">
                                                        <button
                                                            onClick={() => handleViewDetails(parent)}
                                                            className="p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                            style={{ backgroundColor: SUCCESS[100], color: SUCCESS[600] }}
                                                            title="Xem chi tiết"
                                                        >
                                                            <FiEye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedParent(parent); setShowAddParentModal(true) }}
                                                            className="p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                            style={{ backgroundColor: PRIMARY[100], color: PRIMARY[600] }}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FiEdit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setShowConfirmModal(true); setSelectedParent(parent) }}
                                                            className="p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                            style={{ backgroundColor: ERROR[100], color: ERROR[600] }}
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
                                            <td colSpan="7" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div
                                                        className="h-20 w-20 rounded-full flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: GRAY[100] }}
                                                    >
                                                        <FiUser className="h-10 w-10" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        Không có phụ huynh nào
                                                    </p>
                                                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        Hãy thêm phụ huynh mới hoặc thay đổi bộ lọc
                                                    </p>
                                                    <button
                                                        onClick={handleAddParent}
                                                        className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                        style={{ backgroundColor: PRIMARY[100], color: TEXT[700] }}
                                                    >
                                                        <FiPlus className="mr-2 h-4 w-4" />
                                                        Thêm phụ huynh mới
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {paginationState.totalPages > 1 && (
                            <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                                <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                    Hiển thị {(paginationState.currentPage - 1) * paginationState.pageSize + 1}-{Math.min(paginationState.currentPage * paginationState.pageSize, paginationState.totalCount)} trong tổng số {paginationState.totalCount} phụ huynh
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setPaginationState({ ...paginationState, currentPage: paginationState.currentPage - 1 })}
                                        disabled={paginationState.currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: paginationState.currentPage === 1 ? BORDER.DEFAULT : PRIMARY[300],
                                            color: paginationState.currentPage === 1 ? TEXT.SECONDARY : PRIMARY[600],
                                            backgroundColor: BACKGROUND.DEFAULT
                                        }}
                                    >
                                        Trước
                                    </button>

                                    {Array.from({ length: paginationState.totalPages }, (_, i) => i + 1).map((number) => (
                                        <button
                                            key={number}
                                            onClick={() => setPaginationState({ ...paginationState, currentPage: number })}
                                            className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                                            style={{
                                                borderColor: paginationState.currentPage === number ? PRIMARY[500] : BORDER.DEFAULT,
                                                backgroundColor: paginationState.currentPage === number ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                                color: paginationState.currentPage === number ? TEXT.INVERSE : TEXT.PRIMARY
                                            }}
                                        >
                                            {number}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setPaginationState({ ...paginationState, currentPage: paginationState.currentPage + 1 })}
                                        disabled={paginationState.currentPage === paginationState.totalPages}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: paginationState.currentPage === paginationState.totalPages ? BORDER.DEFAULT : PRIMARY[300],
                                            color: paginationState.currentPage === paginationState.totalPages ? TEXT.SECONDARY : PRIMARY[600],
                                            backgroundColor: BACKGROUND.DEFAULT
                                        }}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <AddParentModal
                    isOpen={showAddParentModal}
                    onClose={() => { setShowAddParentModal(false); setSelectedParent(null) }}
                    onSuccess={handleAddParentSuccess}
                    selectedParent={selectedParent}
                />

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                />

                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => { setShowConfirmModal(false); setSelectedParent(null) }}
                    onConfirm={handleDelete}
                    title="Xóa phụ huynh"
                    message={`Bạn có chắc chắn muốn xóa phụ huynh ${selectedParent?.fullName || ''}?`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    type="error"
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
};

export default ParentManagement;