import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiX, FiUser, FiUsers, FiUserCheck, FiUserX } from "react-icons/fi";
import { PRIMARY, SUCCESS, ERROR, WARNING, GRAY, TEXT, BACKGROUND, BORDER } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import userApi from "../../api/userApi";

const ParentManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get("filter") || "all";
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [filterStatus, setFilterStatus] = useState(initialFilter);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("fullName");
    const [sortOrder, setSortOrder] = useState("asc");
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
    });
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const [paginationState, setPaginationState] = useState({
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
        currentPage: 1
    });
    const [showParentModal, setShowParentModal] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [filterRelationship, setFilterRelationship] = useState("");
    const [filterHasChildren, setFilterHasChildren] = useState(null);
    const [parentForm, setParentForm] = useState({
        id: "",
        username: "",
        email: "",
        fullName: "",
        phoneNumber: "",
        address: "",
        gender: "Male",
        dateOfBirth: "",
        relationship: "",
        password: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);



    useEffect(() => {
        fetchParents();
    }, [paginationState.currentPage, paginationState.pageSize, debouncedSearchTerm, sortBy, sortOrder, filterRelationship, filterHasChildren]);

    useEffect(() => {
        setPaginationState({ ...paginationState, currentPage: 1 });
    }, [filterStatus, debouncedSearchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
    };

    const fetchParents = async () => {
        setLoading(true);
        try {
            const params = {
                pageIndex: paginationState.currentPage,
                pageSize: paginationState.pageSize,
                searchTerm: debouncedSearchTerm,
                orderBy: `${sortBy} ${sortOrder}`,
                hasChildren: filterHasChildren,
                relationship: filterRelationship || undefined
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

                // Update stats
                const total = response.totalCount;
                const active = response.data.filter(item => item.children.length > 0).length;
                const inactive = total - active;
                setStats({ total, active, inactive });

                if (response.message) {
                    showAlert("success", "Thành công", response.message);
                }
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể tải danh sách phụ huynh");
            }
        } catch (error) {
            console.error("Error fetching parents:", error);
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

    const handleAddEditParent = (item = null) => {
        if (item) {
            setParentForm({
                id: item.id,
                username: item.username,
                email: item.email,
                fullName: item.fullName,
                phoneNumber: item.phoneNumber,
                address: item.address,
                gender: item.gender,
                dateOfBirth: item.dateOfBirth ? item.dateOfBirth.split('T')[0] : '',
                relationship: item.relationship,
                password: '', // Don't include the password when editing
            });
            setSelectedParent(item);
        } else {
            resetForm();
            setSelectedParent(null);
        }
        setShowParentModal(true);
    };

    const validateForm = () => {
        const errors = {};

        if (!parentForm.fullName.trim()) {
            errors.fullName = "Vui lòng nhập họ tên";
        }

        if (!parentForm.username.trim()) {
            errors.username = "Vui lòng nhập tên đăng nhập";
        }

        if (!parentForm.email.trim()) {
            errors.email = "Vui lòng nhập email";
        } else if (!/\S+@\S+\.\S+/.test(parentForm.email)) {
            errors.email = "Email không hợp lệ";
        }

        if (!parentForm.phoneNumber.trim()) {
            errors.phoneNumber = "Vui lòng nhập số điện thoại";
        } else if (!/^[0-9]{10,11}$/.test(parentForm.phoneNumber)) {
            errors.phoneNumber = "Số điện thoại không hợp lệ";
        }

        if (!parentForm.relationship) {
            errors.relationship = "Vui lòng chọn mối quan hệ";
        }

        if (!selectedParent && !parentForm.password.trim()) {
            errors.password = "Vui lòng nhập mật khẩu";
        } else if (parentForm.password && parentForm.password.length < 6) {
            errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (!parentForm.dateOfBirth) {
            errors.dateOfBirth = "Vui lòng nhập ngày sinh";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const createParent = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const response = await userApi.createParent(parentForm);

            if (response.success) {
                setShowParentModal(false);
                resetForm();
                showAlert("success", "Thành công", response.message || "Thêm phụ huynh mới thành công");
                fetchParents(); // Refresh the list
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể thêm phụ huynh mới");
            }
        } catch (error) {
            console.error("Error creating parent:", error);
            showAlert("error", "Lỗi", error.response?.data?.message || "Không thể thêm phụ huynh mới. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const updateParent = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const response = await userApi.updateParent(parentForm.id, parentForm);

            if (response.success) {
                setShowParentModal(false);
                resetForm();
                showAlert("success", "Thành công", response.message || "Cập nhật thông tin phụ huynh thành công");
                fetchParents(); // Refresh the list
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể cập nhật thông tin phụ huynh");
            }
        } catch (error) {
            console.error("Error updating parent:", error);
            showAlert("error", "Lỗi", error.response?.data?.message || "Không thể cập nhật thông tin phụ huynh. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteParent = async (id) => {
        setDeleting(true);
        try {
            const response = await userApi.deleteParent(id);

            if (response.success) {
                showAlert("success", "Thành công", response.message || "Xóa phụ huynh thành công");
                fetchParents(); // Refresh the list
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể xóa phụ huynh");
            }
        } catch (error) {
            console.error("Error deleting parent:", error);
            showAlert("error", "Lỗi", error.response?.data?.message || "Không thể xóa phụ huynh. Vui lòng thử lại.");
        } finally {
            setDeleting(false);
        }
    };

    // Toggle parent active status
    const toggleParentStatus = (item) => {
        const updatedParents = parents.map(parent =>
            parent.parentId === item.parentId
                ? { ...parent, isActive: !parent.isActive }
                : parent
        );
        setParents(updatedParents);
    };

    // Handle filter change
    const handleFilterChange = (status) => {
        setLoading(true);
        setFilterStatus(status);

        // Update URL
        const params = new URLSearchParams(location.search);
        params.set("filter", status);
        navigate({ search: params.toString() });

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 600);
    };

    // Reset filters
    const resetFilters = () => {
        setLoading(true);
        setFilterStatus("all");
        setSearchTerm("");
        setSortBy("fullName");
        setSortOrder("asc");
        setPaginationState({ ...paginationState, currentPage: 1 });

        // Update URL
        const params = new URLSearchParams(location.search);
        params.delete("filter");
        navigate({ search: params.toString() });

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 800);
    };

    // Filter parents based on search term and status
    const filteredParents = parents.filter((item) => {
        // Filter by search term
        const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone?.includes(searchTerm) ||
            item.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.parentId && item.parentId.toString().includes(searchTerm));

        // Filter by status
        let matchesStatus = true;
        if (filterStatus === "active") {
            matchesStatus = item.isActive;
        } else if (filterStatus === "inactive") {
            matchesStatus = !item.isActive;
        }

        return matchesSearch && matchesStatus;
    });

    // Sort parents
    const sortedParents = [...filteredParents].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case "fullName":
                const fullNameA = `${a.firstName} ${a.lastName}`;
                const fullNameB = `${b.firstName} ${b.lastName}`;
                comparison = fullNameA.localeCompare(fullNameB);
                break;
            case "id":
                comparison = a.parentId - b.parentId;
                break;
            case "email":
                comparison = (a.email || "").localeCompare(b.email || "");
                break;
            case "relationship":
                comparison = (a.relationship || "").localeCompare(b.relationship || "");
                break;
            case "occupation":
                comparison = (a.occupation || "").localeCompare(b.occupation || "");
                break;
            case "address":
                comparison = (a.address || "").localeCompare(b.address || "");
                break;
            default:
                comparison = 0;
        }

        return sortOrder === "asc" ? comparison : -comparison;
    });

    // Pagination calculations
    const totalPages = Math.ceil(sortedParents.length / paginationState.pageSize);
    const indexOfLastParent = paginationState.currentPage * paginationState.pageSize;
    const indexOfFirstParent = indexOfLastParent - paginationState.pageSize;
    const currentParents = sortedParents.slice(indexOfFirstParent, indexOfLastParent);

    // Reset form
    const resetForm = () => {
        setParentForm({
            id: "",
            username: "",
            email: "",
            fullName: "",
            phoneNumber: "",
            address: "",
            gender: "Male",
            dateOfBirth: "",
            relationship: "",
            password: "",
        });
        setFormErrors({});
        setShowPassword(false);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setParentForm({
            ...parentForm,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedParent) {
            updateParent();
        } else {
            createParent();
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
        <div className="min-h-screen" >
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
                            onClick={() => handleAddEditParent()}
                            className="px-6 py-3 rounded-xl flex items-center font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            style={{
                                background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                color: TEXT.INVERSE
                            }}
                        >
                            <FiPlus className="mr-2 h-5 w-5" />
                            Thêm phụ huynh mới
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
                        style={{
                            background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`,
                            borderColor: SUCCESS[200]
                        }}
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
                        style={{
                            background: `linear-gradient(135deg, ${WARNING[500]} 0%, ${WARNING[600]} 100%)`,
                            borderColor: WARNING[200]
                        }}
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

                {/* Filters */}
                <div
                    className="rounded-2xl shadow-xl border backdrop-blur-sm mb-6 sm:mb-8"
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
                                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
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
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Ngừng hoạt động</option>
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
                                                    <Loading
                                                        type="medical"
                                                        size="xl"
                                                        color="primary"
                                                        text="Đang tải danh sách phụ huynh..."
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentParents.length > 0 ? (
                                        currentParents.map((parent, index) => (
                                            <tr
                                                key={parent.id}
                                                className="hover:bg-opacity-50 transition-all duration-200"
                                                style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] || '#fafafa' }}
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
                                                            onClick={() => handleAddEditParent(parent)}
                                                            className="p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                            style={{
                                                                backgroundColor: PRIMARY[100],
                                                                color: PRIMARY[600]
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = PRIMARY[200];
                                                                e.target.style.color = PRIMARY[700];
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = PRIMARY[100];
                                                                e.target.style.color = PRIMARY[600];
                                                            }}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FiEdit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteParent(parent.id)}
                                                            className="p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                            style={{
                                                                backgroundColor: ERROR[100],
                                                                color: ERROR[600]
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = ERROR[200];
                                                                e.target.style.color = ERROR[700];
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = ERROR[100];
                                                                e.target.style.color = ERROR[600];
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
                                                        onClick={() => handleAddEditParent()}
                                                        className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                        style={{
                                                            backgroundColor: PRIMARY[100],
                                                            color: PRIMARY[700]
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[200]}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[100]}
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

                        {/* Pagination */}
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

                {/* Add/Edit Parent Modal */}
                {showParentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg max-w-xs sm:max-w-md lg:max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                            <div className="p-4 sm:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 sm:mb-4">
                                    {selectedParent ? "Chỉnh sửa phụ huynh" : "Thêm phụ huynh mới"}
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                                    Tên đăng nhập
                                                </label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    id="username"
                                                    className={`mt-1 block w-full border ${formErrors.username ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                                    value={parentForm.username}
                                                    onChange={handleInputChange}
                                                />
                                                {formErrors.username && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                                    Họ và tên
                                                </label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    id="fullName"
                                                    className={`mt-1 block w-full border ${formErrors.fullName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                                    value={parentForm.fullName}
                                                    onChange={handleInputChange}
                                                />
                                                {formErrors.fullName && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                className={`mt-1 block w-full border ${formErrors.email ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                                value={parentForm.email}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.email && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                id="phoneNumber"
                                                className={`mt-1 block w-full border ${formErrors.phoneNumber ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                                value={parentForm.phoneNumber}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.phoneNumber && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                                Địa chỉ
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                id="address"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                value={parentForm.address}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                                    Giới tính
                                                </label>
                                                <select
                                                    name="gender"
                                                    id="gender"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                    value={parentForm.gender}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="Male">Nam</option>
                                                    <option value="Female">Nữ</option>
                                                    <option value="Other">Khác</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                                    Ngày sinh
                                                </label>
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    id="dateOfBirth"
                                                    className={`mt-1 block w-full border ${formErrors.dateOfBirth ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                                    value={parentForm.dateOfBirth}
                                                    onChange={handleInputChange}
                                                />
                                                {formErrors.dateOfBirth && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.dateOfBirth}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
                                                Mối quan hệ
                                            </label>
                                            <select
                                                name="relationship"
                                                id="relationship"
                                                className={`mt-1 block w-full border ${formErrors.relationship ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                                value={parentForm.relationship}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Chọn mối quan hệ --</option>
                                                <option value="Mother">Mẹ</option>
                                                <option value="Father">Bố</option>
                                                <option value="Guardian">Người giám hộ</option>
                                            </select>
                                            {formErrors.relationship && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.relationship}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                {selectedParent ? "Mật khẩu mới (để trống nếu không thay đổi)" : "Mật khẩu"}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    id="password"
                                                    className={`mt-1 block w-full border ${formErrors.password ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                                    value={parentForm.password}
                                                    onChange={handleInputChange}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? "Ẩn" : "Hiện"}
                                                </button>
                                            </div>
                                            {formErrors.password && (
                                                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 sm:mt-5 lg:mt-6 grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 sm:px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                            onClick={() => {
                                                setShowParentModal(false);
                                                resetForm();
                                            }}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 sm:px-4 py-2 bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                        >
                                            {selectedParent ? "Cập nhật" : "Thêm"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {submitting && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
                    >
                        <div
                            className="rounded-2xl shadow-2xl p-8 transform transition-all duration-300"
                            style={{ backgroundColor: BACKGROUND.DEFAULT }}
                        >
                            <div className="text-center">
                                <Loading type="medical" size="large" color="primary" text="Đang xử lý..." />
                            </div>
                        </div>
                    </div>
                )}

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
                                <Loading type="medical" size="large" color="primary" text="Đang xóa phụ huynh..." />
                            </div>
                        </div>
                    </div>
                )}

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                />
            </div>
        </div>
    );
};

export default ParentManagement;