import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEye, FiEdit, FiTrash2, FiSearch, FiFilter, FiSave, FiX, FiUsers } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW, SUCCESS, WARNING, ERROR, INFO } from "../../../constants/colors";
import Loading, { SkeletonLoading, CardSkeletonLoading, ButtonLoading } from "../../../components/Loading";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sortColumn, setSortColumn] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [showAddModal, setShowAddModal] = useState(false);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "parent",
        status: "active",
    });
    const [formErrors, setFormErrors] = useState({});

    // Mock data - in a real application, this would come from an API
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const mockUsers = [
                {
                    id: 1,
                    name: "Nguyễn Văn A",
                    email: "nguyenvana@example.com",
                    role: "admin",
                    status: "active",
                    lastLogin: "2023-05-17T14:30:00",
                    createdAt: "2023-01-10T09:00:00",
                },
                {
                    id: 2,
                    name: "Trần Thị B",
                    email: "tranthib@example.com",
                    role: "staff",
                    status: "active",
                    lastLogin: "2023-05-18T09:15:00",
                    createdAt: "2023-01-15T10:30:00",
                },
                {
                    id: 3,
                    name: "Lê Văn C",
                    email: "levanc@example.com",
                    role: "parent",
                    status: "active",
                    lastLogin: "2023-05-16T16:45:00",
                    createdAt: "2023-02-05T11:20:00",
                },
                {
                    id: 4,
                    name: "Phạm Thị D",
                    email: "phamthid@example.com",
                    role: "parent",
                    status: "inactive",
                    lastLogin: "2023-05-10T13:10:00",
                    createdAt: "2023-02-10T14:00:00",
                },
                {
                    id: 5,
                    name: "Hoàng Văn E",
                    email: "hoangvane@example.com",
                    role: "staff",
                    status: "active",
                    lastLogin: "2023-05-18T08:30:00",
                    createdAt: "2023-02-20T08:15:00",
                },
                {
                    id: 6,
                    name: "Ngô Thị F",
                    email: "ngothif@example.com",
                    role: "parent",
                    status: "pending",
                    lastLogin: null,
                    createdAt: "2023-05-17T16:00:00",
                },
                {
                    id: 7,
                    name: "Đỗ Văn G",
                    email: "dovang@example.com",
                    role: "parent",
                    status: "active",
                    lastLogin: "2023-05-15T10:20:00",
                    createdAt: "2023-03-05T09:30:00",
                },
                {
                    id: 8,
                    name: "Vũ Thị H",
                    email: "vuthih@example.com",
                    role: "staff",
                    status: "active",
                    lastLogin: "2023-05-18T11:05:00",
                    createdAt: "2023-03-15T13:45:00",
                },
                {
                    id: 9,
                    name: "Trương Văn I",
                    email: "truongvani@example.com",
                    role: "teacher",
                    status: "active",
                    lastLogin: "2023-05-18T15:30:00",
                    createdAt: "2023-03-20T10:15:00",
                },
                {
                    id: 10,
                    name: "Lý Thị K",
                    email: "lythik@example.com",
                    role: "teacher",
                    status: "inactive",
                    lastLogin: "2023-05-05T08:45:00",
                    createdAt: "2023-04-02T09:20:00",
                },
            ];
            setUsers(mockUsers);
            setLoading(false);
        }, 1000);
    }, []);

    // Handle sorting
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // Filter and search users
    const filteredUsers = users.filter((user) => {
        // Filter by role
        if (filterRole !== "all" && user.role !== filterRole) {
            return false;
        }

        // Filter by status
        if (filterStatus !== "all" && user.status !== filterStatus) {
            return false;
        }

        // Search by name or email
        if (
            searchTerm &&
            !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
            return false;
        }

        return true;
    });

    // Sort users
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        // Handle date columns
        if (sortColumn === "lastLogin" || sortColumn === "createdAt") {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }

        if (valA < valB) {
            return sortDirection === "asc" ? -1 : 1;
        }
        if (valA > valB) {
            return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
    });

    // Pagination
    const usersPerPage = 5;
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    // Handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "Chưa đăng nhập";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    // Handle delete user
    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real application, this would make an API call
            setUsers(users.filter((user) => user.id !== userToDelete.id));
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Error deleting user:', error);
            // Handle error - could show toast notification
        } finally {
            setDeleting(false);
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case "admin":
                return "Quản trị viên";
            case "staff":
                return "Nhân viên y tế";
            case "teacher":
                return "Giáo viên";
            case "parent":
                return "Phụ huynh";
            default:
                return role;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "active":
                return "Đang hoạt động";
            case "inactive":
                return "Không hoạt động";
            case "pending":
                return "Chờ xác nhận";
            default:
                return status;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "active":
                return {
                    backgroundColor: SUCCESS[50],
                    color: SUCCESS[700],
                    borderColor: SUCCESS[200]
                };
            case "inactive":
                return {
                    backgroundColor: ERROR[50],
                    color: ERROR[700],
                    borderColor: ERROR[200]
                };
            case "pending":
                return {
                    backgroundColor: WARNING[50],
                    color: WARNING[700],
                    borderColor: WARNING[200]
                };
            default:
                return {
                    backgroundColor: GRAY[50],
                    color: GRAY[700],
                    borderColor: GRAY[200]
                };
        }
    };

    const getRoleStyle = (role) => {
        switch (role) {
            case "admin":
                return {
                    backgroundColor: PRIMARY[50],
                    color: PRIMARY[700],
                    borderColor: PRIMARY[200]
                };
            case "staff":
                return {
                    backgroundColor: INFO[50],
                    color: INFO[700],
                    borderColor: INFO[200]
                };
            case "teacher":
                return {
                    backgroundColor: '#f3e8ff',
                    color: '#7c3aed',
                    borderColor: '#d8b4fe'
                };
            case "parent":
                return {
                    backgroundColor: SUCCESS[50],
                    color: SUCCESS[700],
                    borderColor: SUCCESS[200]
                };
            default:
                return {
                    backgroundColor: GRAY[50],
                    color: GRAY[700],
                    borderColor: GRAY[200]
                };
        }
    };

    // Handle input change in form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when field is edited
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: undefined });
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Vui lòng nhập họ tên";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleAddUser = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real app, submit to API
            // For mock data, create a new user and add to the list
            const newUser = {
                id: users.length + 1,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                lastLogin: null,
                createdAt: new Date().toISOString(),
            };

            setUsers([...users, newUser]);

            // Reset form and close modal
            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "parent",
                status: "active",
            });
            setFormErrors({});
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding user:', error);
            // Handle error - could show toast notification
        } finally {
            setSubmitting(false);
        }
    };

    // Open add user modal
    const openAddModal = () => {
        // Set available roles
        setRoles([
            { id: 1, name: "admin", label: "Quản trị viên" },
            { id: 2, name: "staff", label: "Nhân viên y tế" },
            { id: 3, name: "teacher", label: "Giáo viên" },
            { id: 4, name: "parent", label: "Phụ huynh" },
        ]);

        // Reset form
        setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "parent",
            status: "active",
        });
        setFormErrors({});

        setShowAddModal(true);
    };

    return (
        <>
            {/* Initial Page Loading */}
            {loading && (
                <div className="h-full flex justify-center items-center">
                    <Loading
                        type="medical"
                        size="large"
                        color="primary"
                        text="Đang tải danh sách người dùng..."
                    />
                </div>
            )}

            {/* Main Content - Hidden during initial loading */}
            {!loading && (
                <div className="h-full">
                    {/* Header Section */}
                    <div className="flex flex-col space-y-4 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="mb-4 lg:mb-0">
                                <h2
                                    className="text-2xl lg:text-3xl font-bold mb-2"
                                    style={{ color: TEXT.PRIMARY }}
                                >
                                    Quản lý người dùng
                                </h2>
                                <p
                                    className="text-sm lg:text-base"
                                    style={{ color: TEXT.SECONDARY }}
                                >
                                    Quản lý tất cả người dùng trong hệ thống y tế trường học
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={openAddModal}
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm lg:text-base transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: submitting ? GRAY[400] : PRIMARY[500],
                                        color: TEXT.INVERSE,
                                        borderColor: submitting ? GRAY[400] : PRIMARY[500]
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!submitting) {
                                            e.target.style.backgroundColor = PRIMARY[600];
                                            e.target.style.borderColor = PRIMARY[600];
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!submitting) {
                                            e.target.style.backgroundColor = PRIMARY[500];
                                            e.target.style.borderColor = PRIMARY[500];
                                        }
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <ButtonLoading size="small" color="primary" />
                                            <span className="ml-2">Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiPlus className="mr-2 w-4 h-4 lg:w-5 lg:h-5" />
                                            Thêm người dùng
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Search Section */}
                    <div
                        className="rounded-xl p-4 lg:p-6 mb-6 shadow-sm border"
                        style={{
                            backgroundColor: BACKGROUND.DEFAULT,
                            borderColor: BORDER.DEFAULT,
                            boxShadow: `0 1px 3px ${SHADOW.LIGHT}`
                        }}
                    >
                        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                            {/* Search Input */}
                            <div className="w-full lg:w-1/2 xl:w-1/3 relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FiSearch style={{ color: GRAY[400] }} />
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Tìm kiếm theo tên hoặc email..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-offset-1"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        color: TEXT.PRIMARY
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = PRIMARY[500];
                                        e.target.style.boxShadow = `0 0 0 2px ${PRIMARY[100]}`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = BORDER.DEFAULT;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                                {/* Role Filter */}
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                        <FiFilter style={{ color: GRAY[400] }} className="w-4 h-4" />
                                        <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                            Vai trò:
                                        </span>
                                    </div>
                                    <select
                                        value={filterRole}
                                        onChange={(e) => {
                                            setFilterRole(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="border rounded-lg px-3 py-2 text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[120px]"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = PRIMARY[500];
                                            e.target.style.boxShadow = `0 0 0 2px ${PRIMARY[100]}`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = BORDER.DEFAULT;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="admin">Quản trị viên</option>
                                        <option value="staff">Nhân viên y tế</option>
                                        <option value="teacher">Giáo viên</option>
                                        <option value="parent">Phụ huynh</option>
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                        <FiFilter style={{ color: GRAY[400] }} className="w-4 h-4" />
                                        <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                            Trạng thái:
                                        </span>
                                    </div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => {
                                            setFilterStatus(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="border rounded-lg px-3 py-2 text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[140px]"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = PRIMARY[500];
                                            e.target.style.boxShadow = `0 0 0 2px ${PRIMARY[100]}`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = BORDER.DEFAULT;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="active">Đang hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                        <option value="pending">Chờ xác nhận</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div
                        className="rounded-xl shadow-sm border overflow-hidden"
                        style={{
                            backgroundColor: BACKGROUND.DEFAULT,
                            borderColor: BORDER.DEFAULT,
                            boxShadow: `0 1px 3px ${SHADOW.LIGHT}`
                        }}
                    >
                        {/* Mobile View */}
                        <div className="block lg:hidden">
                            {loading ? (
                                <div className="p-6 space-y-4">
                                    {[...Array(5)].map((_, index) => (
                                        <CardSkeletonLoading key={index} className="shadow-sm" />
                                    ))}
                                </div>
                            ) : (
                                <div className="divide-y" style={{ borderColor: BORDER.DEFAULT }}>
                                    {currentUsers.map((user) => (
                                        <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                                                        style={{ backgroundColor: PRIMARY[500] }}
                                                    >
                                                        {user.name.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-base font-semibold truncate" style={{ color: TEXT.PRIMARY }}>
                                                                {user.name}
                                                            </p>
                                                            <p className="text-sm truncate" style={{ color: TEXT.SECONDARY }}>
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                        <div className="flex space-x-2 ml-2">
                                                            <Link
                                                                to={`/admin/users/${user.id}`}
                                                                className="p-2 rounded-lg transition-colors duration-200"
                                                                style={{ color: INFO[600] }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = INFO[50]}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                                title="Xem chi tiết"
                                                            >
                                                                <FiEye className="h-4 w-4" />
                                                            </Link>
                                                            <Link
                                                                to={`/admin/users/${user.id}/edit`}
                                                                className="p-2 rounded-lg transition-colors duration-200"
                                                                style={{ color: WARNING[600] }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = WARNING[50]}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                                title="Chỉnh sửa"
                                                            >
                                                                <FiEdit className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteClick(user)}
                                                                className="p-2 rounded-lg transition-colors duration-200"
                                                                style={{ color: ERROR[600] }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = ERROR[50]}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                                title="Xóa người dùng"
                                                            >
                                                                <FiTrash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                                            style={getRoleStyle(user.role)}
                                                        >
                                                            {getRoleLabel(user.role)}
                                                        </span>
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                                            style={getStatusStyle(user.status)}
                                                        >
                                                            {getStatusLabel(user.status)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 text-xs" style={{ color: TEXT.SECONDARY }}>
                                                        <p>Đăng nhập cuối: {formatDate(user.lastLogin)}</p>
                                                        <p>Ngày tạo: {formatDate(user.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            {loading ? (
                                <div className="p-6">
                                    <table className="min-w-full">
                                        <thead style={{ backgroundColor: GRAY[50] }}>
                                            <tr>
                                                <th className="px-6 py-4 text-left">
                                                    <SkeletonLoading className="h-4 w-32" />
                                                </th>
                                                <th className="px-6 py-4 text-left">
                                                    <SkeletonLoading className="h-4 w-20" />
                                                </th>
                                                <th className="px-6 py-4 text-left">
                                                    <SkeletonLoading className="h-4 w-24" />
                                                </th>
                                                <th className="px-6 py-4 text-left">
                                                    <SkeletonLoading className="h-4 w-28" />
                                                </th>
                                                <th className="px-6 py-4 text-left">
                                                    <SkeletonLoading className="h-4 w-20" />
                                                </th>
                                                <th className="px-6 py-4 text-right">
                                                    <SkeletonLoading className="h-4 w-16 ml-auto" />
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ backgroundColor: BACKGROUND.DEFAULT, borderColor: BORDER.DEFAULT }}>
                                            {[...Array(5)].map((_, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <SkeletonLoading className="h-10 w-10 rounded-full" />
                                                            <div className="ml-4 space-y-2">
                                                                <SkeletonLoading className="h-4 w-32" />
                                                                <SkeletonLoading className="h-3 w-24" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <SkeletonLoading className="h-6 w-20 rounded-full" />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <SkeletonLoading className="h-6 w-24 rounded-full" />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <SkeletonLoading className="h-4 w-28" />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <SkeletonLoading className="h-4 w-20" />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end space-x-2">
                                                            <SkeletonLoading className="h-8 w-8 rounded-lg" />
                                                            <SkeletonLoading className="h-8 w-8 rounded-lg" />
                                                            <SkeletonLoading className="h-8 w-8 rounded-lg" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y" style={{ borderColor: BORDER.DEFAULT }}>
                                    <thead style={{ backgroundColor: GRAY[50] }}>
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                                                style={{ color: TEXT.SECONDARY }}
                                                onClick={() => handleSort("name")}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Tên người dùng</span>
                                                    {sortColumn === "name" && (
                                                        <span className="text-sm" style={{ color: PRIMARY[500] }}>
                                                            {sortDirection === "asc" ? "↑" : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                                                style={{ color: TEXT.SECONDARY }}
                                                onClick={() => handleSort("role")}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Vai trò</span>
                                                    {sortColumn === "role" && (
                                                        <span className="text-sm" style={{ color: PRIMARY[500] }}>
                                                            {sortDirection === "asc" ? "↑" : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                                                style={{ color: TEXT.SECONDARY }}
                                                onClick={() => handleSort("status")}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Trạng thái</span>
                                                    {sortColumn === "status" && (
                                                        <span className="text-sm" style={{ color: PRIMARY[500] }}>
                                                            {sortDirection === "asc" ? "↑" : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                                                style={{ color: TEXT.SECONDARY }}
                                                onClick={() => handleSort("lastLogin")}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Đăng nhập cuối</span>
                                                    {sortColumn === "lastLogin" && (
                                                        <span className="text-sm" style={{ color: PRIMARY[500] }}>
                                                            {sortDirection === "asc" ? "↑" : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                                                style={{ color: TEXT.SECONDARY }}
                                                onClick={() => handleSort("createdAt")}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Ngày tạo</span>
                                                    {sortColumn === "createdAt" && (
                                                        <span className="text-sm" style={{ color: PRIMARY[500] }}>
                                                            {sortDirection === "asc" ? "↑" : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: TEXT.SECONDARY }}
                                            >
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ backgroundColor: BACKGROUND.DEFAULT, borderColor: BORDER.DEFAULT }}>
                                        {currentUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div
                                                                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                                                                style={{ backgroundColor: PRIMARY[500] }}
                                                            >
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                                        style={getRoleStyle(user.role)}
                                                    >
                                                        {getRoleLabel(user.role)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                                        style={getStatusStyle(user.status)}
                                                    >
                                                        {getStatusLabel(user.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    {formatDate(user.lastLogin)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <Link
                                                            to={`/admin/users/${user.id}`}
                                                            className="p-2 rounded-lg transition-all duration-200"
                                                            style={{ color: INFO[600] }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = INFO[50];
                                                                e.target.style.color = INFO[700];
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = 'transparent';
                                                                e.target.style.color = INFO[600];
                                                            }}
                                                            title="Xem chi tiết"
                                                        >
                                                            <FiEye className="h-5 w-5" />
                                                        </Link>
                                                        <Link
                                                            to={`/admin/users/${user.id}/edit`}
                                                            className="p-2 rounded-lg transition-all duration-200"
                                                            style={{ color: WARNING[600] }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = WARNING[50];
                                                                e.target.style.color = WARNING[700];
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = 'transparent';
                                                                e.target.style.color = WARNING[600];
                                                            }}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FiEdit className="h-5 w-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="p-2 rounded-lg transition-all duration-200"
                                                            style={{ color: ERROR[600] }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = ERROR[50];
                                                                e.target.style.color = ERROR[700];
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = 'transparent';
                                                                e.target.style.color = ERROR[600];
                                                            }}
                                                            title="Xóa người dùng"
                                                        >
                                                            <FiTrash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {!loading && currentUsers.length === 0 && (
                                <div className="p-8 text-center">
                                    <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: GRAY[100] }}>
                                        <FiUsers className="h-6 w-6" style={{ color: GRAY[400] }} />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Không tìm thấy người dùng
                                    </h3>
                                    <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                        Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    {!loading && sortedUsers.length > 0 && (
                        <div
                            className="mt-6 px-4 py-4 lg:px-6 lg:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t"
                            style={{
                                backgroundColor: BACKGROUND.DEFAULT,
                                borderColor: BORDER.DEFAULT,
                                borderRadius: '0 0 0.75rem 0.75rem'
                            }}
                        >
                            <div className="mb-4 sm:mb-0">
                                <p className="text-sm lg:text-base" style={{ color: TEXT.SECONDARY }}>
                                    Hiển thị{" "}
                                    <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>{indexOfFirstUser + 1}</span>{" "}
                                    đến{" "}
                                    <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        {Math.min(indexOfLastUser, sortedUsers.length)}
                                    </span>{" "}
                                    trong tổng số{" "}
                                    <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>{sortedUsers.length}</span>{" "}
                                    người dùng
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="relative z-0 inline-flex rounded-lg shadow-sm"
                                    aria-label="Pagination"
                                >
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border text-sm font-medium transition-all duration-200 ${currentPage === 1
                                            ? "cursor-not-allowed opacity-50"
                                            : "hover:shadow-md"
                                            }`}
                                        style={{
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            borderColor: BORDER.DEFAULT,
                                            color: currentPage === 1 ? GRAY[400] : TEXT.SECONDARY
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPage !== 1) {
                                                e.target.style.backgroundColor = GRAY[50];
                                                e.target.style.borderColor = BORDER.DARK;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== 1) {
                                                e.target.style.backgroundColor = BACKGROUND.DEFAULT;
                                                e.target.style.borderColor = BORDER.DEFAULT;
                                            }
                                        }}
                                    >
                                        <span className="sr-only">Trang trước</span>
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

                                    {[...Array(totalPages).keys()].map((number) => (
                                        <button
                                            key={number + 1}
                                            onClick={() => paginate(number + 1)}
                                            className={`relative inline-flex items-center px-3 lg:px-4 py-2 border text-sm font-medium transition-all duration-200 hover:shadow-md ${currentPage === number + 1 ? 'z-10' : ''}`}
                                            style={{
                                                backgroundColor: currentPage === number + 1 ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                                borderColor: currentPage === number + 1 ? PRIMARY[500] : BORDER.DEFAULT,
                                                color: currentPage === number + 1 ? PRIMARY[700] : TEXT.SECONDARY
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentPage !== number + 1) {
                                                    e.target.style.backgroundColor = GRAY[50];
                                                    e.target.style.borderColor = BORDER.DARK;
                                                    e.target.style.color = TEXT.PRIMARY;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentPage !== number + 1) {
                                                    e.target.style.backgroundColor = BACKGROUND.DEFAULT;
                                                    e.target.style.borderColor = BORDER.DEFAULT;
                                                    e.target.style.color = TEXT.SECONDARY;
                                                }
                                            }}
                                        >
                                            {number + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border text-sm font-medium transition-all duration-200 ${currentPage === totalPages
                                            ? "cursor-not-allowed opacity-50"
                                            : "hover:shadow-md"
                                            }`}
                                        style={{
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            borderColor: BORDER.DEFAULT,
                                            color: currentPage === totalPages ? GRAY[400] : TEXT.SECONDARY
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPage !== totalPages) {
                                                e.target.style.backgroundColor = GRAY[50];
                                                e.target.style.borderColor = BORDER.DARK;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== totalPages) {
                                                e.target.style.backgroundColor = BACKGROUND.DEFAULT;
                                                e.target.style.borderColor = BORDER.DEFAULT;
                                            }
                                        }}
                                    >
                                        <span className="sr-only">Trang sau</span>
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
                                </nav>
                            </div>
                        </div>
                    )}

                    {/* Add User Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                                <div
                                    className="fixed inset-0 transition-opacity"
                                    aria-hidden="true"
                                    onClick={() => setShowAddModal(false)}
                                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                                />

                                <span
                                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                                    aria-hidden="true"
                                >
                                    &#8203;
                                </span>

                                <div
                                    className="inline-block align-bottom rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50"
                                    style={{
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        boxShadow: `0 20px 25px -5px ${SHADOW.DARK}, 0 10px 10px -5px ${SHADOW.MEDIUM}`
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <form onSubmit={handleAddUser}>
                                        <div className="px-6 pt-6 pb-4">
                                            <div className="mb-6">
                                                <h3 className="text-xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                                    Thêm người dùng mới
                                                </h3>
                                                <p className="mt-1 text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    Nhập thông tin để tạo tài khoản người dùng mới
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {/* Họ tên */}
                                                <div>
                                                    <label
                                                        htmlFor="name"
                                                        className="block text-sm font-medium mb-2"
                                                        style={{ color: TEXT.PRIMARY }}
                                                    >
                                                        Họ tên <span style={{ color: ERROR[500] }}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                        style={{
                                                            borderColor: formErrors.name ? ERROR[500] : BORDER.DEFAULT,
                                                            backgroundColor: BACKGROUND.DEFAULT,
                                                            color: TEXT.PRIMARY
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = formErrors.name ? ERROR[500] : PRIMARY[500];
                                                            e.target.style.boxShadow = `0 0 0 2px ${formErrors.name ? ERROR[100] : PRIMARY[100]}`;
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = formErrors.name ? ERROR[500] : BORDER.DEFAULT;
                                                            e.target.style.boxShadow = 'none';
                                                        }}
                                                        placeholder="Nhập họ tên đầy đủ"
                                                    />
                                                    {formErrors.name && (
                                                        <p className="mt-1 text-xs" style={{ color: ERROR[600] }}>
                                                            {formErrors.name}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Email */}
                                                <div>
                                                    <label
                                                        htmlFor="email"
                                                        className="block text-sm font-medium mb-2"
                                                        style={{ color: TEXT.PRIMARY }}
                                                    >
                                                        Email <span style={{ color: ERROR[500] }}>*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                        style={{
                                                            borderColor: formErrors.email ? ERROR[500] : BORDER.DEFAULT,
                                                            backgroundColor: BACKGROUND.DEFAULT,
                                                            color: TEXT.PRIMARY
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = formErrors.email ? ERROR[500] : PRIMARY[500];
                                                            e.target.style.boxShadow = `0 0 0 2px ${formErrors.email ? ERROR[100] : PRIMARY[100]}`;
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = formErrors.email ? ERROR[500] : BORDER.DEFAULT;
                                                            e.target.style.boxShadow = 'none';
                                                        }}
                                                        placeholder="example@email.com"
                                                    />
                                                    {formErrors.email && (
                                                        <p className="mt-1 text-xs" style={{ color: ERROR[600] }}>
                                                            {formErrors.email}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Grid for Password fields */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Mật khẩu */}
                                                    <div>
                                                        <label
                                                            htmlFor="password"
                                                            className="block text-sm font-medium mb-2"
                                                            style={{ color: TEXT.PRIMARY }}
                                                        >
                                                            Mật khẩu <span style={{ color: ERROR[500] }}>*</span>
                                                        </label>
                                                        <input
                                                            type="password"
                                                            id="password"
                                                            name="password"
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                            style={{
                                                                borderColor: formErrors.password ? ERROR[500] : BORDER.DEFAULT,
                                                                backgroundColor: BACKGROUND.DEFAULT,
                                                                color: TEXT.PRIMARY
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = formErrors.password ? ERROR[500] : PRIMARY[500];
                                                                e.target.style.boxShadow = `0 0 0 2px ${formErrors.password ? ERROR[100] : PRIMARY[100]}`;
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = formErrors.password ? ERROR[500] : BORDER.DEFAULT;
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                            placeholder="Ít nhất 6 ký tự"
                                                        />
                                                        {formErrors.password && (
                                                            <p className="mt-1 text-xs" style={{ color: ERROR[600] }}>
                                                                {formErrors.password}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Xác nhận mật khẩu */}
                                                    <div>
                                                        <label
                                                            htmlFor="confirmPassword"
                                                            className="block text-sm font-medium mb-2"
                                                            style={{ color: TEXT.PRIMARY }}
                                                        >
                                                            Xác nhận mật khẩu <span style={{ color: ERROR[500] }}>*</span>
                                                        </label>
                                                        <input
                                                            type="password"
                                                            id="confirmPassword"
                                                            name="confirmPassword"
                                                            value={formData.confirmPassword}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                            style={{
                                                                borderColor: formErrors.confirmPassword ? ERROR[500] : BORDER.DEFAULT,
                                                                backgroundColor: BACKGROUND.DEFAULT,
                                                                color: TEXT.PRIMARY
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = formErrors.confirmPassword ? ERROR[500] : PRIMARY[500];
                                                                e.target.style.boxShadow = `0 0 0 2px ${formErrors.confirmPassword ? ERROR[100] : PRIMARY[100]}`;
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = formErrors.confirmPassword ? ERROR[500] : BORDER.DEFAULT;
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                            placeholder="Nhập lại mật khẩu"
                                                        />
                                                        {formErrors.confirmPassword && (
                                                            <p className="mt-1 text-xs" style={{ color: ERROR[600] }}>
                                                                {formErrors.confirmPassword}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Grid for Role and Status */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Vai trò */}
                                                    <div>
                                                        <label
                                                            htmlFor="role"
                                                            className="block text-sm font-medium mb-2"
                                                            style={{ color: TEXT.PRIMARY }}
                                                        >
                                                            Vai trò
                                                        </label>
                                                        <select
                                                            id="role"
                                                            name="role"
                                                            value={formData.role}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                            style={{
                                                                borderColor: BORDER.DEFAULT,
                                                                backgroundColor: BACKGROUND.DEFAULT,
                                                                color: TEXT.PRIMARY
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = PRIMARY[500];
                                                                e.target.style.boxShadow = `0 0 0 2px ${PRIMARY[100]}`;
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = BORDER.DEFAULT;
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        >
                                                            {roles.map((role) => (
                                                                <option key={role.id} value={role.name}>
                                                                    {role.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Trạng thái */}
                                                    <div>
                                                        <label
                                                            htmlFor="status"
                                                            className="block text-sm font-medium mb-2"
                                                            style={{ color: TEXT.PRIMARY }}
                                                        >
                                                            Trạng thái
                                                        </label>
                                                        <select
                                                            id="status"
                                                            name="status"
                                                            value={formData.status}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                            style={{
                                                                borderColor: BORDER.DEFAULT,
                                                                backgroundColor: BACKGROUND.DEFAULT,
                                                                color: TEXT.PRIMARY
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = PRIMARY[500];
                                                                e.target.style.boxShadow = `0 0 0 2px ${PRIMARY[100]}`;
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = BORDER.DEFAULT;
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        >
                                                            <option value="active">Đang hoạt động</option>
                                                            <option value="inactive">Không hoạt động</option>
                                                            <option value="pending">Chờ xác nhận</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3 space-y-3 sm:space-y-0 border-t"
                                            style={{
                                                backgroundColor: GRAY[50],
                                                borderColor: BORDER.DEFAULT
                                            }}
                                        >
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: submitting ? GRAY[400] : PRIMARY[500],
                                                    color: TEXT.INVERSE,
                                                    borderColor: submitting ? GRAY[400] : PRIMARY[500]
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!submitting) {
                                                        e.target.style.backgroundColor = PRIMARY[600];
                                                        e.target.style.borderColor = PRIMARY[600];
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!submitting) {
                                                        e.target.style.backgroundColor = PRIMARY[500];
                                                        e.target.style.borderColor = PRIMARY[500];
                                                    }
                                                }}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <ButtonLoading size="small" color="primary" />
                                                        <span className="ml-2">Đang tạo...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSave className="mr-2 w-4 h-4" />
                                                        Tạo tài khoản
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddModal(false)}
                                                disabled={submitting}
                                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 border disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: BACKGROUND.DEFAULT,
                                                    color: TEXT.SECONDARY,
                                                    borderColor: BORDER.DEFAULT
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!submitting) {
                                                        e.target.style.backgroundColor = GRAY[50];
                                                        e.target.style.borderColor = BORDER.DARK;
                                                        e.target.style.color = TEXT.PRIMARY;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!submitting) {
                                                        e.target.style.backgroundColor = BACKGROUND.DEFAULT;
                                                        e.target.style.borderColor = BORDER.DEFAULT;
                                                        e.target.style.color = TEXT.SECONDARY;
                                                    }
                                                }}
                                            >
                                                <FiX className="mr-2 w-4 h-4" />
                                                Hủy
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete User Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                                <div
                                    className="fixed inset-0 transition-opacity"
                                    aria-hidden="true"
                                    onClick={() => setShowDeleteModal(false)}
                                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                                />

                                <span
                                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                                    aria-hidden="true"
                                >
                                    &#8203;
                                </span>

                                <div
                                    className="inline-block align-bottom rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50"
                                    style={{
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        boxShadow: `0 20px 25px -5px ${SHADOW.DARK}, 0 10px 10px -5px ${SHADOW.MEDIUM}`
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="px-6 pt-6 pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div
                                                className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"
                                                style={{ backgroundColor: ERROR[100] }}
                                            >
                                                <FiTrash2 className="h-6 w-6" style={{ color: ERROR[600] }} />
                                            </div>
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <h3
                                                    className="text-lg font-bold mb-2"
                                                    style={{ color: TEXT.PRIMARY }}
                                                >
                                                    Xác nhận xóa người dùng
                                                </h3>
                                                <div className="mt-2">
                                                    <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        Bạn có chắc chắn muốn xóa người dùng{" "}
                                                        <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {userToDelete?.name}
                                                        </span>{" "}
                                                        không?
                                                    </p>
                                                    <div
                                                        className="mt-3 p-3 rounded-lg border-l-4"
                                                        style={{
                                                            backgroundColor: WARNING[50],
                                                            borderColor: WARNING[400]
                                                        }}
                                                    >
                                                        <p className="text-xs" style={{ color: WARNING[700] }}>
                                                            ⚠️ Hành động này không thể được hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3 space-y-3 sm:space-y-0 border-t"
                                        style={{
                                            backgroundColor: GRAY[50],
                                            borderColor: BORDER.DEFAULT
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={confirmDelete}
                                            disabled={deleting}
                                            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: deleting ? GRAY[400] : ERROR[500],
                                                color: TEXT.INVERSE,
                                                borderColor: deleting ? GRAY[400] : ERROR[500]
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!deleting) {
                                                    e.target.style.backgroundColor = ERROR[600];
                                                    e.target.style.borderColor = ERROR[600];
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!deleting) {
                                                    e.target.style.backgroundColor = ERROR[500];
                                                    e.target.style.borderColor = ERROR[500];
                                                }
                                            }}
                                        >
                                            {deleting ? (
                                                <>
                                                    <ButtonLoading size="small" color="error" />
                                                    <span className="ml-2">Đang xóa...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiTrash2 className="mr-2 w-4 h-4" />
                                                    Xóa vĩnh viễn
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteModal(false)}
                                            disabled={deleting}
                                            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 border disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: BACKGROUND.DEFAULT,
                                                color: TEXT.SECONDARY,
                                                borderColor: BORDER.DEFAULT
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!deleting) {
                                                    e.target.style.backgroundColor = GRAY[50];
                                                    e.target.style.borderColor = BORDER.DARK;
                                                    e.target.style.color = TEXT.PRIMARY;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!deleting) {
                                                    e.target.style.backgroundColor = BACKGROUND.DEFAULT;
                                                    e.target.style.borderColor = BORDER.DEFAULT;
                                                    e.target.style.color = TEXT.SECONDARY;
                                                }
                                            }}
                                        >
                                            <FiX className="mr-2 w-4 h-4" />
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default UserList;