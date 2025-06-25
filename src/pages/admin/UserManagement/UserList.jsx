import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiFilter, FiUsers, FiTrash2, FiPlus, FiEye, FiDownload, FiUpload, FiFileText } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW, SUCCESS, WARNING, ERROR, INFO } from "../../../constants/colors";
import Loading from "../../../components/Loading";
import userApi from "../../../api/userApi";
import AddStaffModal from "../../../components/modal/AddStaffModal";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import AlertModal from "../../../components/modal/AlertModal";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState("fullName");
    const [sortDirection, setSortDirection] = useState("asc");
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
    const [showImportDropdown, setShowImportDropdown] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const orderBy = sortColumn;
            const params = {
                pageIndex: currentPage,
                pageSize: pageSize,
                searchTerm: debouncedSearchTerm,
                orderBy: orderBy,
                role: filterRole,
                timestamp: Date.now()
            };

            const response = await userApi.getUsers(params);
            if (response.success && response.data) {
                setUsers(response.data);
                setTotalCount(response.totalCount);
                setTotalPages(response.totalPages);
            } else {
                setUsers([]);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (error) {
            if (error.name === 'AbortError') { return }
            setUsers([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterRole]);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize, debouncedSearchTerm, filterRole, sortColumn, sortDirection]);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const formatDate = (dateString) => {
        if (!dateString) return "Chưa đăng nhập";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case "MANAGER":
                return "Quản lý";
            case "SCHOOLNURSE":
                return "Y tá trường học";
            default:
                return role;
        }
    };

    const getStatusLabel = (isActive) => { return isActive ? "Đang hoạt động" : "Không hoạt động" };
    const getStatusStyle = (isActive) => {
        if (isActive) {
            return { backgroundColor: SUCCESS[50], color: SUCCESS[700], borderColor: SUCCESS[200] }
        } else {
            return { backgroundColor: ERROR[50], color: ERROR[700], borderColor: ERROR[200] }
        }
    };

    const getRoleStyle = (role) => {
        switch (role) {
            case "MANAGER":
                return { backgroundColor: WARNING[50], color: WARNING[700], borderColor: WARNING[200] }
            case "SCHOOLNURSE":
                return { backgroundColor: INFO[50], color: INFO[700], borderColor: INFO[200] }
            default:
                return { backgroundColor: GRAY[50], color: GRAY[700], borderColor: GRAY[200] }
        }
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return;
        setDeleteLoading(true);
        try {
            const deleteFunction = selectedUser.role === 'MANAGER'
                ? userApi.deleteManager
                : userApi.deleteSchoolNurse;

            const response = await deleteFunction(selectedUser.id);
            if (response.success) {
                setAlertType("success");
                setAlertMessage(`Đã xóa người dùng "${selectedUser.fullName}" thành công`);
                fetchUsers();
                setDeleteModalOpen(false);
                setSelectedUser(null);
                setAlertModalOpen(true);
            } else {
                setAlertType("error");
                setAlertMessage(`Không thể xóa người dùng "${selectedUser.fullName}". ${response.message || 'Vui lòng thử lại sau.'}`);
                setAlertModalOpen(true);
            }
        } catch (error) {
            setAlertType("error");
            setAlertMessage(`Không thể xóa người dùng "${selectedUser.fullName}". Vui lòng thử lại sau.`);
            setAlertModalOpen(true);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleTemplateDownload = async (type) => {
        setShowTemplateDropdown(false);
        try {
            const response = type === 'manager'
                ? await userApi.downloadManagerTemplate()
                : await userApi.downloadSchoolNurseTemplate();
            if (response.success) {
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                // Lấy tên file từ Content-Disposition header
                const contentDisposition = response.headers['content-disposition'];
                const filenameMatch = contentDisposition.match(/filename=(.*?)(;|$)/);
                const fileName = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : '';
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            setAlertMessage(`Không thể tải xuống mẫu. ${error.message || 'Vui lòng thử lại sau.'}`);
        }
    };

    const handleImport = async (type) => {
        setShowImportDropdown(false);
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx';
        input.style.display = 'none';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setImportLoading(true);
            try {
                const response = type === 'manager'
                    ? await userApi.importManagerList(file)
                    : await userApi.importSchoolNurseList(file);
                if (response.success) {
                    const resultData = response.data;
                    setImportResult({
                        totalRows: resultData.totalRows,
                        successRows: resultData.successRows,
                        errorRows: resultData.errorRows,
                        validData: resultData.validData,
                        invalidData: resultData.invalidData,
                        errors: resultData.errors
                    });
                    setAlertType("success");
                    setAlertMessage(`Nhập file thành công!`);
                    setAlertModalOpen(true)
                    if (resultData.successRows > 0) { fetchUsers() }
                } else {
                    throw new Error(response.message || 'Có lỗi xảy ra khi nhập file');
                }
            } catch (error) {
                setAlertType("error");
                setAlertMessage(`Lỗi nhập file: ${error.message || 'Vui lòng thử lại sau'}`);
                setAlertModalOpen(true);
            } finally {
                setImportLoading(false);
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };

    const handleExport = async (type) => {
        setShowExportDropdown(false);
        try {
            const response = type === 'manager'
                ? await userApi.exportManagerList()
                : await userApi.exportSchoolNurseList();

            if (response.success) {
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                // Lấy tên file từ Content-Disposition header
                const contentDisposition = response.headers['content-disposition'];
                const filenameMatch = contentDisposition.match(/filename=(.*?)(;|$)/);
                const fileName = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : '';
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            setAlertMessage(`Không thể xuất danh sách. ${error.message || 'Vui lòng thử lại sau.'}`);
        }
    };

    const dropdownStyle = {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.5rem',
        backgroundColor: BACKGROUND.DEFAULT,
        border: `1px solid ${BORDER.DEFAULT}`,
        borderRadius: '0.5rem',
        boxShadow: `0 4px 6px -1px ${SHADOW.MEDIUM}`,
        zIndex: 50,
        minWidth: '160px',
        overflow: 'hidden'
    };

    const dropdownItemStyle = {
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        color: TEXT.PRIMARY,
        backgroundColor: BACKGROUND.DEFAULT,
        cursor: 'pointer',
        display: 'block',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.2s',
        borderBottom: `1px solid ${BORDER.DEFAULT}`
    };

    return (
        <>
            {loading && (
                <div className="h-full flex justify-center items-center">
                    <Loading type="medical" size="large" color="primary" text="Đang tải danh sách người dùng..." />
                </div>
            )}

            {!loading && (
                <div className="h-full">
                    <div className="flex flex-col space-y-4 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="mb-4 lg:mb-0">
                                <h2 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Quản lý người dùng
                                </h2>
                                <p className="text-sm lg:text-base" style={{ color: TEXT.SECONDARY }}>
                                    Quản lý tất cả người dùng trong hệ thống y tế trường học
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowTemplateDropdown(!showTemplateDropdown);
                                            setShowImportDropdown(false);
                                            setShowExportDropdown(false);
                                        }}
                                        className="inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        style={{ backgroundColor: INFO[600], color: 'white', borderColor: INFO[600] }}
                                    >
                                        <FiFileText className="h-4 w-4 mr-2" />
                                        Lấy mẫu
                                    </button>
                                    {showTemplateDropdown && (
                                        <div style={dropdownStyle}>
                                            <button
                                                onClick={() => handleTemplateDownload('manager')}
                                                style={dropdownItemStyle}
                                            >
                                                Mẫu Quản lý
                                            </button>
                                            <button
                                                onClick={() => handleTemplateDownload('nurse')}
                                                style={dropdownItemStyle}
                                            >
                                                Mẫu Y tế
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowImportDropdown(!showImportDropdown);
                                            setShowTemplateDropdown(false);
                                            setShowExportDropdown(false);
                                        }}
                                        className="inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        style={{ backgroundColor: SUCCESS[600], color: 'white', borderColor: SUCCESS[600] }}
                                        disabled={importLoading}
                                    >
                                        {importLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang nhập...
                                            </>
                                        ) : (
                                            <>
                                                <FiUpload className="h-4 w-4 mr-2" />
                                                Tải lên danh sách
                                            </>
                                        )}
                                    </button>
                                    {showImportDropdown && (
                                        <div style={dropdownStyle}>
                                            <button
                                                onClick={() => handleImport('manager')}
                                                style={dropdownItemStyle}
                                            >
                                                Danh sách quản lý
                                            </button>
                                            <button
                                                onClick={() => handleImport('nurse')}
                                                style={dropdownItemStyle}
                                            >
                                                Danh sách y tế
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowExportDropdown(!showExportDropdown);
                                            setShowTemplateDropdown(false);
                                            setShowImportDropdown(false);
                                        }}
                                        className="inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        style={{ backgroundColor: WARNING[600], color: 'white', borderColor: WARNING[600] }}
                                    >
                                        <FiDownload className="h-4 w-4 mr-2" />
                                        Tải xuống danh sách
                                    </button>
                                    {showExportDropdown && (
                                        <div style={dropdownStyle}>
                                            <button
                                                onClick={() => handleExport('manager')}
                                                style={dropdownItemStyle}
                                            >
                                                Danh sách quản lý
                                            </button>
                                            <button
                                                onClick={() => handleExport('nurse')}
                                                style={dropdownItemStyle}
                                            >
                                                Danh sách y tế
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setIsAddStaffModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{ backgroundColor: PRIMARY[600], focusRingColor: PRIMARY[500] }}
                                >
                                    <FiPlus className="h-4 w-4 mr-2" />
                                    Thêm nhân viên
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className=" mb-6" >
                        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                            <div className="w-full relative">
                                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value) }}
                                    placeholder="Tìm kiếm theo tên hoặc email..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-offset-1"
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 ml-4">
                                <select
                                    value={filterRole}
                                    onChange={(e) => { setFilterRole(e.target.value) }}
                                    className="border rounded-lg px-3 py-2 text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[120px]"
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="MANAGER">Quản lý</option>
                                    <option value="SCHOOLNURSE">Y tá trường học</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div
                        className="rounded-xl shadow-sm border overflow-hidden"
                        style={{
                            backgroundColor: BACKGROUND.DEFAULT,
                            borderColor: BORDER.DEFAULT,
                            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
                        }}
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b" style={{ backgroundColor: '#f8fafc', borderColor: BORDER.DEFAULT }}>
                                        <th
                                            scope="col"
                                            className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80"
                                            style={{ color: TEXT.SECONDARY }}
                                            onClick={() => handleSort("fullName")}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Người dùng</span>
                                                {sortColumn === "fullName" && (
                                                    <span className="text-sm font-bold" style={{ color: PRIMARY[600] }}>
                                                        {sortDirection === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80"
                                            style={{ color: TEXT.SECONDARY }}
                                            onClick={() => handleSort("role")}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Vai trò</span>
                                                {sortColumn === "role" && (
                                                    <span className="text-sm font-bold" style={{ color: PRIMARY[600] }}>
                                                        {sortDirection === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80"
                                            style={{ color: TEXT.SECONDARY }}
                                            onClick={() => handleSort("isActive")}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Trạng thái</span>
                                                {sortColumn === "isActive" && (
                                                    <span className="text-sm font-bold" style={{ color: PRIMARY[600] }}>
                                                        {sortDirection === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80"
                                            style={{ color: TEXT.SECONDARY }}
                                            onClick={() => handleSort("staffCode")}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Mã NV</span>
                                                {sortColumn === "staffCode" && (
                                                    <span className="text-sm font-bold" style={{ color: PRIMARY[600] }}>
                                                        {sortDirection === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80"
                                            style={{ color: TEXT.SECONDARY }}
                                            onClick={() => handleSort("createdDate")}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>Ngày tạo</span>
                                                {sortColumn === "createdDate" && (
                                                    <span className="text-sm font-bold" style={{ color: PRIMARY[600] }}>
                                                        {sortDirection === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider"
                                            style={{ color: TEXT.SECONDARY }}
                                        >
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody style={{ backgroundColor: BACKGROUND.DEFAULT }}>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50/70 transition-all duration-200" style={{ borderColor: BORDER.DEFAULT }}>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <div
                                                            className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                                            style={{ backgroundColor: PRIMARY[500] }}
                                                        >
                                                            {user.fullName.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {user.fullName}
                                                        </div>
                                                        <div className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm"
                                                    style={getRoleStyle(user.role)}
                                                >
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm"
                                                    style={getStatusStyle(user.isActive)}
                                                >
                                                    {getStatusLabel(user.isActive)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {user.staffCode || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    {formatDate(user.createdDate)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                                        className="p-2.5 rounded-lg transition-all duration-200 hover:bg-blue-50 border"
                                                        style={{ color: PRIMARY[600], borderColor: PRIMARY[200] }}
                                                        title="Xem chi tiết"
                                                    >
                                                        <FiEye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(user)}
                                                        className="p-2.5 rounded-lg transition-all duration-200 hover:bg-red-50 border"
                                                        style={{
                                                            color: ERROR[600],
                                                            borderColor: ERROR[200]
                                                        }}
                                                        title="Xóa người dùng"
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {users.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: GRAY[100] }}>
                                        <FiUsers className="h-8 w-8" style={{ color: GRAY[400] }} />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Không tìm thấy người dùng
                                    </h3>
                                    <p className="text-base max-w-md mx-auto" style={{ color: TEXT.SECONDARY }}>
                                        Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác để tìm thấy người dùng phù hợp
                                    </p>
                                </div>
                            )}
                        </div>
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
                                    người dùng
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
            )}

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setSelectedUser(null) }}
                onConfirm={handleDeleteConfirm}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa người dùng "${selectedUser?.fullName}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                type="error"
                isLoading={deleteLoading}
            />

            <AddStaffModal
                isOpen={isAddStaffModalOpen}
                onClose={() => setIsAddStaffModalOpen(false)}
                onSuccess={() => fetchUsers()}
            />

            <AlertModal
                isOpen={alertModalOpen}
                onClose={() => setAlertModalOpen(false)}
                title={alertType === "success" ? "Thành công" : "Lỗi"}
                message={alertMessage}
                type={alertType}
            />
        </>
    );
};

export default UserList;