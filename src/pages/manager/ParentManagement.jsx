import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FiPlus,
    FiFilter,
    FiSearch,
    FiRefreshCw,
    FiEdit,
    FiEye,
    FiTrash2,
    FiCheck,
    FiX,
    FiUser,
} from "react-icons/fi";
import { PRIMARY, SUCCESS, ERROR, WARNING, GRAY, TEXT, BACKGROUND, BORDER } from "../../constants/colors";
import Loading from "../../components/Loading";

const ParentManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get("filter") || "all";

    // Hardcoded parent data
    const initialParentsData = [
        {
            parentId: 1,
            firstName: "Nguyễn Thị",
            lastName: "Lan",
            studentId: 101,
            relationship: "Mẹ",
            email: "nguyenthilan@email.com",
            phone: "0901234567",
            address: "123 Đường ABC, Quận 1, TP.HCM",
            occupation: "Giáo viên",
            isEmergencyContact: true,
            isMainContact: true,
            isActive: true,
            studentName: "Nguyễn Văn An"
        },
        {
            parentId: 2,
            firstName: "Trần Văn",
            lastName: "Minh",
            studentId: 102,
            relationship: "Bố",
            email: "tranvanminh@email.com",
            phone: "0912345678",
            address: "456 Đường XYZ, Quận 2, TP.HCM",
            occupation: "Kỹ sư",
            isEmergencyContact: false,
            isMainContact: true,
            isActive: true,
            studentName: "Trần Thị Bình"
        },
        {
            parentId: 3,
            firstName: "Lê Thị",
            lastName: "Hương",
            studentId: 103,
            relationship: "Mẹ",
            email: "lethihuong@email.com",
            phone: "0923456789",
            address: "789 Đường DEF, Quận 3, TP.HCM",
            occupation: "Bác sĩ",
            isEmergencyContact: true,
            isMainContact: false,
            isActive: false,
            studentName: "Lê Văn Cường"
        },
        {
            parentId: 4,
            firstName: "Phạm Văn",
            lastName: "Đức",
            studentId: 104,
            relationship: "Bố",
            email: "phamvanduc@email.com",
            phone: "0934567890",
            address: "321 Đường GHI, Quận 4, TP.HCM",
            occupation: "Kinh doanh",
            isEmergencyContact: false,
            isMainContact: true,
            isActive: true,
            studentName: "Phạm Thị Diệu"
        },
        {
            parentId: 5,
            firstName: "Võ Thị",
            lastName: "Mai",
            studentId: 105,
            relationship: "Bà",
            email: "vothimai@email.com",
            phone: "0945678901",
            address: "654 Đường JKL, Quận 5, TP.HCM",
            occupation: "Hưu trí",
            isEmergencyContact: true,
            isMainContact: false,
            isActive: true,
            studentName: "Võ Văn Hoàng"
        }
    ];

    // State for parent accounts
    const [parents, setParents] = useState(initialParentsData);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(initialFilter);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [stats, setStats] = useState({
        total: 0,
        inactive: 0,
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const parentsPerPage = 5;

    // State for parent creation/editing
    const [showParentModal, setShowParentModal] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [parentForm, setParentForm] = useState({
        id: 0,
        firstName: "",
        lastName: "",
        studentId: null,
        relationship: "",
        email: "",
        phone: "",
        address: "",
        occupation: "",
        isEmergencyContact: false,
        isMainContact: false,
        isActive: true,
        password: "",
        studentName: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Filter Dropdown
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // Simulate initial data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Calculate stats when parents change
    useEffect(() => {
        const total = parents.length;
        const inactive = parents.filter((item) => !item.isActive).length;

        setStats({
            total,
            inactive,
        });
    }, [parents]);

    // Create new parent
    const createParent = () => {
        if (!validateForm()) return;

        const newParent = {
            parentId: Math.max(...parents.map(p => p.parentId)) + 1,
            firstName: parentForm.firstName,
            lastName: parentForm.lastName,
            studentId: parentForm.studentId,
            relationship: parentForm.relationship,
            email: parentForm.email,
            phone: parentForm.phone,
            address: parentForm.address,
            occupation: parentForm.occupation,
            isEmergencyContact: parentForm.isEmergencyContact,
            isMainContact: parentForm.isMainContact,
            isActive: parentForm.isActive,
            studentName: parentForm.studentName,
        };

        setParents([...parents, newParent]);
        setShowParentModal(false);
        resetForm();
    };

    // Update parent
    const updateParent = () => {
        if (!validateForm()) return;

        const updatedParents = parents.map(parent =>
            parent.parentId === parentForm.id
                ? {
                    ...parent,
                    firstName: parentForm.firstName,
                    lastName: parentForm.lastName,
                    studentId: parentForm.studentId,
                    relationship: parentForm.relationship,
                    email: parentForm.email,
                    phone: parentForm.phone,
                    address: parentForm.address,
                    occupation: parentForm.occupation,
                    isEmergencyContact: parentForm.isEmergencyContact,
                    isMainContact: parentForm.isMainContact,
                    isActive: parentForm.isActive,
                    studentName: parentForm.studentName,
                }
                : parent
        );

        setParents(updatedParents);
        setShowParentModal(false);
        resetForm();
    };

    // Delete parent
    const deleteParent = (id) => {
        if (
            window.confirm("Bạn có chắc chắn muốn xóa tài khoản phụ huynh này không?")
        ) {
            const updatedParents = parents.filter(parent => parent.parentId !== id);
            setParents(updatedParents);
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
        setSortBy("name");
        setSortOrder("asc");
        setCurrentPage(1);

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
            case "name":
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
    const totalPages = Math.ceil(sortedParents.length / parentsPerPage);
    const indexOfLastParent = currentPage * parentsPerPage;
    const indexOfFirstParent = indexOfLastParent - parentsPerPage;
    const currentParents = sortedParents.slice(indexOfFirstParent, indexOfLastParent);

    // Handle sort change
    function handleSortChange(column) {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    }

    // Handle add/edit parent
    const handleAddEditParent = (item = null) => {
        if (item) {
            setParentForm({
                id: item.parentId,
                firstName: item.firstName || "",
                lastName: item.lastName || "",
                studentId: item.studentId,
                relationship: item.relationship || "",
                email: item.email || "",
                phone: item.phone || "",
                address: item.address || "",
                occupation: item.occupation || "",
                isEmergencyContact: item.isEmergencyContact || false,
                isMainContact: item.isMainContact || false,
                isActive: item.isActive,
                password: "", // Don't include the password when editing
                studentName: item.studentName || "",
            });
            setSelectedParent(item);
        } else {
            resetForm();
            setSelectedParent(null);
        }
        setShowParentModal(true);
    };

    // Reset form
    const resetForm = () => {
        setParentForm({
            id: 0,
            firstName: "",
            lastName: "",
            studentId: null,
            relationship: "",
            email: "",
            phone: "",
            address: "",
            occupation: "",
            isEmergencyContact: false,
            isMainContact: false,
            isActive: true,
            password: "",
            studentName: "",
        });
        setFormErrors({});
        setShowPassword(false);
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!parentForm.firstName.trim()) {
            errors.firstName = "Vui lòng nhập họ";
        }

        if (!parentForm.lastName.trim()) {
            errors.lastName = "Vui lòng nhập tên";
        }

        if (!parentForm.email.trim()) {
            errors.email = "Vui lòng nhập email";
        } else if (!/\S+@\S+\.\S+/.test(parentForm.email)) {
            errors.email = "Email không hợp lệ";
        }

        if (!parentForm.phone.trim()) {
            errors.phone = "Vui lòng nhập số điện thoại";
        } else if (!/^[0-9]{10,11}$/.test(parentForm.phone)) {
            errors.phone = "Số điện thoại không hợp lệ";
        }

        if (!parentForm.relationship.trim()) {
            errors.relationship = "Vui lòng nhập mối quan hệ";
        }

        if (!selectedParent && !parentForm.password.trim()) {
            errors.password = "Vui lòng nhập mật khẩu";
        } else if (parentForm.password && parentForm.password.length < 6) {
            errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
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

    return (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border-0 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col mb-6 sm:mb-8">
                <div className="mb-4 sm:mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: GRAY[800] }}>
                        Quản lý phụ huynh
                    </h2>
                    <p className="mt-1 sm:mt-2 text-base sm:text-lg" style={{ color: GRAY[600] }}>
                        Theo dõi và quản lý danh sách phụ huynh tại trường
                    </p>
                </div>
                <div className="flex justify-center sm:justify-end">
                    <button
                        onClick={() => handleAddEditParent()}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        style={{
                            backgroundColor: PRIMARY[500],
                            boxShadow: `0 4px 14px 0 ${PRIMARY[200]}`
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                        onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[500]}
                    >
                        <FiPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base">Thêm phụ huynh mới</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl flex justify-between items-center transform transition-all duration-300 hover:scale-105"
                    style={{
                        backgroundColor: PRIMARY[50],
                        border: `2px solid ${PRIMARY[100]}`,
                        boxShadow: `0 8px 25px -5px ${PRIMARY[100]}`
                    }}>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base" style={{ color: GRAY[600] }}>
                            Tổng số phụ huynh
                        </p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2" style={{ color: PRIMARY[700] }}>
                            {stats.total}
                        </p>
                    </div>
                    <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center ml-3"
                        style={{ backgroundColor: PRIMARY[500] }}>
                        <FiUser className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                    </div>
                </div>

                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl flex justify-between items-center transform transition-all duration-300 hover:scale-105"
                    style={{
                        backgroundColor: WARNING[50],
                        border: `2px solid ${WARNING[100]}`,
                        boxShadow: `0 8px 25px -5px ${WARNING[100]}`
                    }}>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base" style={{ color: GRAY[600] }}>
                            Ngừng hoạt động
                        </p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2" style={{ color: WARNING[700] }}>
                            {stats.inactive}
                        </p>
                    </div>
                    <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center ml-3"
                        style={{ backgroundColor: WARNING[500] }}>
                        <FiX className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
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
                                <tr style={{ backgroundColor: GRAY[50] }}>
                                    <th
                                        className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                        style={{ color: TEXT.SECONDARY }}
                                        onClick={() => handleSortChange("name")}
                                    >
                                        <div className="flex items-center">
                                            <span className="hidden sm:inline">Họ tên</span>
                                            <span className="sm:hidden">Tên</span>
                                            {sortBy === "name" && (
                                                <span className="ml-2 text-xs">
                                                    {sortOrder === "asc" ? "↑" : "↓"}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="hidden sm:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                        style={{ color: TEXT.SECONDARY }}
                                        onClick={() => handleSortChange("relationship")}
                                    >
                                        <div className="flex items-center">
                                            <span className="hidden lg:inline">Mối quan hệ</span>
                                            <span className="lg:hidden">QH</span>
                                            {sortBy === "relationship" && (
                                                <span className="ml-2 text-xs">
                                                    {sortOrder === "asc" ? "↑" : "↓"}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="hidden lg:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                        style={{ color: TEXT.SECONDARY }}
                                        onClick={() => handleSortChange("email")}
                                    >
                                        <div className="flex items-center">
                                            Email
                                            {sortBy === "email" && (
                                                <span className="ml-2 text-xs">
                                                    {sortOrder === "asc" ? "↑" : "↓"}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                        style={{ color: TEXT.SECONDARY }}
                                        onClick={() => handleSortChange("phone")}
                                    >
                                        <div className="flex items-center">
                                            <span className="hidden sm:inline">Số điện thoại</span>
                                            <span className="sm:hidden">SĐT</span>
                                            {sortBy === "phone" && (
                                                <span className="ml-2 text-xs">
                                                    {sortOrder === "asc" ? "↑" : "↓"}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="hidden md:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                        style={{ color: TEXT.SECONDARY }}
                                        onClick={() => handleSortChange("occupation")}
                                    >
                                        <div className="flex items-center">
                                            <span className="hidden lg:inline">Nghề nghiệp</span>
                                            <span className="lg:hidden">Nghề</span>
                                            {sortBy === "occupation" && (
                                                <span className="ml-2 text-xs">
                                                    {sortOrder === "asc" ? "↑" : "↓"}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="hidden lg:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                        style={{ color: TEXT.SECONDARY }}
                                        onClick={() => handleSortChange("address")}
                                    >
                                        <div className="flex items-center">
                                            Địa chỉ
                                            {sortBy === "address" && (
                                                <span className="ml-2 text-xs">
                                                    {sortOrder === "asc" ? "↑" : "↓"}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                        <span className="hidden sm:inline">Trạng thái</span>
                                        <span className="sm:hidden">TT</span>
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                        <span className="hidden sm:inline">Thao tác</span>
                                        <span className="sm:hidden">TT</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-12">
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
                                            key={parent.parentId}
                                            className="hover:bg-opacity-50 transition-all duration-200 group"
                                            style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] || '#fafafa' }}
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div
                                                        className="h-2 w-2 rounded-full mr-3"
                                                        style={{ backgroundColor: parent.isActive ? SUCCESS[500] : GRAY[400] }}
                                                    ></div>
                                                    <div>
                                                        <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {parent.firstName} {parent.lastName}
                                                        </span>
                                                        <div className="sm:hidden text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                            {parent.relationship} • {parent.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell py-4 px-6 text-center align-middle text-sm" style={{ color: TEXT.PRIMARY }}>
                                                {parent.relationship}
                                            </td>
                                            <td className="hidden lg:table-cell py-4 px-6 text-center align-middle text-sm truncate max-w-[150px]" style={{ color: TEXT.PRIMARY }}>
                                                {parent.email}
                                            </td>
                                            <td className="py-4 px-6 text-center align-middle text-sm" style={{ color: TEXT.PRIMARY }}>
                                                {parent.phone}
                                            </td>
                                            <td className="hidden md:table-cell py-4 px-6 text-center align-middle text-sm truncate max-w-[100px]" style={{ color: TEXT.PRIMARY }}>
                                                {parent.occupation}
                                            </td>
                                            <td className="hidden lg:table-cell py-4 px-6 text-center align-middle text-sm truncate max-w-[150px]" style={{ color: TEXT.PRIMARY }}>
                                                {parent.address}
                                            </td>
                                            <td className="py-4 px-6 text-center align-middle">
                                                <span
                                                    className="inline-flex items-center justify-center px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-md sm:rounded-lg lg:rounded-xl text-xs sm:text-xs lg:text-xs font-bold whitespace-nowrap min-w-0"
                                                    style={{
                                                        backgroundColor: parent.isActive ? SUCCESS[100] : WARNING[100],
                                                        color: parent.isActive ? SUCCESS[800] : WARNING[800],
                                                        border: `2px solid ${parent.isActive ? SUCCESS[200] : WARNING[200]}`
                                                    }}
                                                >
                                                    <span className="hidden lg:inline">{parent.isActive ? "Hoạt động" : "Ngừng hoạt động"}</span>
                                                    <span className="hidden sm:inline lg:hidden text-xs">{parent.isActive ? "Hoạt động" : "Tạm ngưng"}</span>
                                                    <span className="sm:hidden text-xs">{parent.isActive ? "✓" : "✗"}</span>
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center align-middle">
                                                <div className="flex space-x-1 sm:space-x-2 lg:space-x-3 justify-center">
                                                    <button
                                                        onClick={() => handleAddEditParent(parent)}
                                                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-110"
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
                                                        <FiEdit className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleParentStatus(parent)}
                                                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-110"
                                                        style={{
                                                            backgroundColor: parent.isActive ? WARNING[100] : SUCCESS[100],
                                                            color: parent.isActive ? WARNING[600] : SUCCESS[600]
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.backgroundColor = parent.isActive ? WARNING[200] : SUCCESS[200];
                                                            e.target.style.color = parent.isActive ? WARNING[700] : SUCCESS[700];
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.backgroundColor = parent.isActive ? WARNING[100] : SUCCESS[100];
                                                            e.target.style.color = parent.isActive ? WARNING[600] : SUCCESS[600];
                                                        }}
                                                        title={
                                                            parent.isActive
                                                                ? "Đánh dấu ngừng hoạt động"
                                                                : "Đánh dấu đang hoạt động"
                                                        }
                                                    >
                                                        {parent.isActive ? (
                                                            <FiX className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                        ) : (
                                                            <FiCheck className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteParent(parent.parentId)}
                                                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-110"
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
                                                        <FiTrash2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
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
                                                    <FiUser className="h-10 w-10" style={{ color: GRAY[400] }} />
                                                </div>
                                                <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                    {sortedParents.length === 0 ? "Không có phụ huynh nào phù hợp" : "Không có dữ liệu trang này"}
                                                </p>
                                                <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                    {sortedParents.length === 0 ?
                                                        "Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác" :
                                                        "Vui lòng chọn trang khác hoặc điều chỉnh bộ lọc"
                                                    }
                                                </p>
                                                {sortedParents.length === 0 ? (
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
                                                ) : (
                                                    <button
                                                        onClick={() => setCurrentPage(1)}
                                                        className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                        style={{
                                                            backgroundColor: PRIMARY[100],
                                                            color: PRIMARY[700]
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[200]}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[100]}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                            <div className="mb-4 sm:mb-0" style={{ color: TEXT.SECONDARY }}>
                                <span className="text-sm">
                                    Hiển thị {indexOfFirstParent + 1}-{Math.min(indexOfLastParent, sortedParents.length)} trong tổng số {sortedParents.length} phụ huynh
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

            {/* Add/Edit Parent Modal */}
            {showParentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg max-w-xs sm:max-w-md lg:max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 sm:mb-4">
                                {selectedParent ? "Chỉnh sửa phụ huynh" : "Thêm phụ huynh mới"}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                    <div>
                                        <label
                                            htmlFor="firstName"
                                            className="block text-xs sm:text-sm font-medium text-gray-700"
                                        >
                                            Họ
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            id="firstName"
                                            className={`mt-1 block w-full border ${formErrors.firstName
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm`}
                                            value={parentForm.firstName}
                                            onChange={handleInputChange}
                                        />
                                        {formErrors.firstName && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {formErrors.firstName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="lastName"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Tên
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            id="lastName"
                                            className={`mt-1 block w-full border ${formErrors.lastName
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                            value={parentForm.lastName}
                                            onChange={handleInputChange}
                                        />
                                        {formErrors.lastName && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {formErrors.lastName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="studentId"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Mã học sinh
                                    </label>
                                    <input
                                        type="text"
                                        name="studentId"
                                        id="studentId"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                        value={parentForm.studentId || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="studentName"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Tên học sinh
                                    </label>
                                    <input
                                        type="text"
                                        name="studentName"
                                        id="studentName"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                        value={parentForm.studentName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="relationship"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Mối quan hệ
                                    </label>
                                    <select
                                        name="relationship"
                                        id="relationship"
                                        className={`mt-1 block w-full border ${formErrors.relationship
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                        value={parentForm.relationship}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- Chọn mối quan hệ --</option>
                                        <option value="Mẹ">Mẹ</option>
                                        <option value="Bố">Bố</option>
                                        <option value="Ông">Ông</option>
                                        <option value="Bà">Bà</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                    {formErrors.relationship && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {formErrors.relationship}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className={`mt-1 block w-full border ${formErrors.email ? "border-red-500" : "border-gray-300"
                                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                        value={parentForm.email}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.email && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {formErrors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        className={`mt-1 block w-full border ${formErrors.phone ? "border-red-500" : "border-gray-300"
                                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                                        value={parentForm.phone}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.phone && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {formErrors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="address"
                                        className="block text-sm font-medium text-gray-700"
                                    >
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

                                <div className="mb-4">
                                    <label
                                        htmlFor="occupation"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nghề nghiệp
                                    </label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        id="occupation"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                        value={parentForm.occupation}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        {selectedParent
                                            ? "Mật khẩu mới (để trống nếu không thay đổi)"
                                            : "Mật khẩu"}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            id="password"
                                            className={`mt-1 block w-full border ${formErrors.password
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
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
                                        <p className="mt-1 text-sm text-red-500">
                                            {formErrors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center">
                                        <input
                                            id="isActive"
                                            name="isActive"
                                            type="checkbox"
                                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                            checked={parentForm.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <label
                                            htmlFor="isActive"
                                            className="ml-2 block text-sm text-gray-900"
                                        >
                                            Đang hoạt động
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="isEmergencyContact"
                                            name="isEmergencyContact"
                                            type="checkbox"
                                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                            checked={parentForm.isEmergencyContact}
                                            onChange={handleInputChange}
                                        />
                                        <label
                                            htmlFor="isEmergencyContact"
                                            className="ml-2 block text-sm text-gray-900"
                                        >
                                            Liên hệ khẩn cấp
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="isMainContact"
                                            name="isMainContact"
                                            type="checkbox"
                                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                            checked={parentForm.isMainContact}
                                            onChange={handleInputChange}
                                        />
                                        <label
                                            htmlFor="isMainContact"
                                            className="ml-2 block text-sm text-gray-900"
                                        >
                                            Liên hệ chính
                                        </label>
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
        </div>
    );
};

export default ParentManagement;