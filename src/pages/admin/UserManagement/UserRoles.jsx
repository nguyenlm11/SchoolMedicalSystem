import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const UserRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        permissions: {
            dashboard: { view: false, edit: false },
            users: { view: false, create: false, edit: false, delete: false },
            medication: { view: false, create: false, edit: false, delete: false },
            healthRecords: { view: false, create: false, edit: false, delete: false },
            reports: { view: false, create: false, export: false },
            settings: { view: false, edit: false },
        },
    });

    // Mock data - in a real application, this would come from an API
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const mockRoles = [
                {
                    id: 1,
                    name: "Quản trị viên",
                    description:
                        "Quyền truy cập đầy đủ vào tất cả các chức năng hệ thống",
                    usersCount: 3,
                    permissions: {
                        dashboard: { view: true, edit: true },
                        users: { view: true, create: true, edit: true, delete: true },
                        medication: { view: true, create: true, edit: true, delete: true },
                        healthRecords: {
                            view: true,
                            create: true,
                            edit: true,
                            delete: true,
                        },
                        reports: { view: true, create: true, export: true },
                        settings: { view: true, edit: true },
                    },
                },
                {
                    id: 2,
                    name: "Nhân viên y tế",
                    description: "Quản lý thuốc, chăm sóc y tế và lưu trữ hồ sơ",
                    usersCount: 5,
                    permissions: {
                        dashboard: { view: true, edit: false },
                        users: { view: true, create: false, edit: false, delete: false },
                        medication: { view: true, create: true, edit: true, delete: false },
                        healthRecords: {
                            view: true,
                            create: true,
                            edit: true,
                            delete: false,
                        },
                        reports: { view: true, create: true, export: false },
                        settings: { view: false, edit: false },
                    },
                },
                {
                    id: 3,
                    name: "Giáo viên",
                    description: "Xem thông tin học sinh và báo cáo sức khỏe",
                    usersCount: 15,
                    permissions: {
                        dashboard: { view: true, edit: false },
                        users: { view: true, create: false, edit: false, delete: false },
                        medication: {
                            view: true,
                            create: false,
                            edit: false,
                            delete: false,
                        },
                        healthRecords: {
                            view: true,
                            create: false,
                            edit: false,
                            delete: false,
                        },
                        reports: { view: true, create: false, export: false },
                        settings: { view: false, edit: false },
                    },
                },
                {
                    id: 4,
                    name: "Phụ huynh",
                    description: "Quản lý thông tin học sinh và xem báo cáo sức khỏe",
                    usersCount: 350,
                    permissions: {
                        dashboard: { view: false, edit: false },
                        users: { view: false, create: false, edit: false, delete: false },
                        medication: {
                            view: true,
                            create: true,
                            edit: false,
                            delete: false,
                        },
                        healthRecords: {
                            view: true,
                            create: false,
                            edit: false,
                            delete: false,
                        },
                        reports: { view: false, create: false, export: false },
                        settings: { view: false, edit: false },
                    },
                },
            ];

            setRoles(mockRoles);
            setLoading(false);
        }, 1000);
    }, []);

    const handleAddRole = () => {
        setCurrentRole(null);
        setFormData({
            name: "",
            description: "",
            permissions: {
                dashboard: { view: false, edit: false },
                users: { view: false, create: false, edit: false, delete: false },
                medication: { view: false, create: false, edit: false, delete: false },
                healthRecords: {
                    view: false,
                    create: false,
                    edit: false,
                    delete: false,
                },
                reports: { view: false, create: false, export: false },
                settings: { view: false, edit: false },
            },
        });
        setShowAddEditModal(true);
    };

    const handleEditRole = (role) => {
        setCurrentRole(role);
        setFormData({
            name: role.name,
            description: role.description,
            permissions: { ...role.permissions },
        });
        setShowAddEditModal(true);
    };

    const handleDeleteRole = (role) => {
        setCurrentRole(role);
        setShowDeleteModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePermissionChange = (module, permission, checked) => {
        setFormData({
            ...formData,
            permissions: {
                ...formData.permissions,
                [module]: {
                    ...formData.permissions[module],
                    [permission]: checked,
                },
            },
        });
    };

    const handleSaveRole = (e) => {
        e.preventDefault();
        // In a real application, this would make an API call
        if (currentRole) {
            // Update existing role
            setRoles(
                roles.map((role) =>
                    role.id === currentRole.id
                        ? {
                            ...role,
                            name: formData.name,
                            description: formData.description,
                            permissions: formData.permissions,
                        }
                        : role
                )
            );
        } else {
            // Add new role
            setRoles([
                ...roles,
                {
                    id: roles.length + 1,
                    name: formData.name,
                    description: formData.description,
                    permissions: formData.permissions,
                    usersCount: 0,
                },
            ]);
        }

        setShowAddEditModal(false);
    };

    const handleConfirmDelete = () => {
        // In a real application, this would make an API call
        setRoles(roles.filter((role) => role.id !== currentRole.id));
        setShowDeleteModal(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Quản lý vai trò người dùng
                    </h1>
                    <p className="text-gray-600">
                        Tạo và quản lý vai trò và quyền hạn trong hệ thống
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handleAddRole}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FiPlus className="mr-2" />
                        Thêm vai trò mới
                    </button>
                </div>
            </div>

            {/* Roles Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Tên vai trò
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Mô tả
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Người dùng
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {role.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">
                                            {role.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {role.usersCount} người dùng
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditRole(role)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <FiEdit className="h-5 w-5" />
                                                <span className="sr-only">Chỉnh sửa</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRole(role)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={role.usersCount > 0}
                                                title={
                                                    role.usersCount > 0
                                                        ? "Không thể xóa vai trò đang được sử dụng"
                                                        : ""
                                                }
                                            >
                                                <FiTrash2
                                                    className={`h-5 w-5 ${role.usersCount > 0
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                        }`}
                                                />
                                                <span className="sr-only">Xóa</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Role Modal */}
            {showAddEditModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSaveRole}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {currentRole ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
                                        </h3>
                                        <div className="mt-6 space-y-4">
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Tên vai trò
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="description"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Mô tả
                                                </label>
                                                <textarea
                                                    name="description"
                                                    id="description"
                                                    rows="3"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-700">
                                                    Phân quyền
                                                </h4>
                                                <div className="mt-4 space-y-5">
                                                    {/* Dashboard permissions */}
                                                    <div>
                                                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                            Tổng quan
                                                        </h5>
                                                        <div className="ml-5 space-y-2">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="dashboard-view"
                                                                    checked={formData.permissions.dashboard.view}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            "dashboard",
                                                                            "view",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                                <label
                                                                    htmlFor="dashboard-view"
                                                                    className="ml-2 text-sm text-gray-700"
                                                                >
                                                                    Xem
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="dashboard-edit"
                                                                    checked={formData.permissions.dashboard.edit}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            "dashboard",
                                                                            "edit",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                                <label
                                                                    htmlFor="dashboard-edit"
                                                                    className="ml-2 text-sm text-gray-700"
                                                                >
                                                                    Chỉnh sửa
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Users permissions */}
                                                    <div>
                                                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                            Người dùng
                                                        </h5>
                                                        <div className="ml-5 space-y-2">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="users-view"
                                                                    checked={formData.permissions.users.view}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            "users",
                                                                            "view",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                                <label
                                                                    htmlFor="users-view"
                                                                    className="ml-2 text-sm text-gray-700"
                                                                >
                                                                    Xem
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="users-create"
                                                                    checked={formData.permissions.users.create}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            "users",
                                                                            "create",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                                <label
                                                                    htmlFor="users-create"
                                                                    className="ml-2 text-sm text-gray-700"
                                                                >
                                                                    Tạo mới
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="users-edit"
                                                                    checked={formData.permissions.users.edit}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            "users",
                                                                            "edit",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                                <label
                                                                    htmlFor="users-edit"
                                                                    className="ml-2 text-sm text-gray-700"
                                                                >
                                                                    Chỉnh sửa
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="users-delete"
                                                                    checked={formData.permissions.users.delete}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            "users",
                                                                            "delete",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                                <label
                                                                    htmlFor="users-delete"
                                                                    className="ml-2 text-sm text-gray-700"
                                                                >
                                                                    Xóa
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* More permission sections can be added here */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {currentRole ? "Cập nhật" : "Tạo mới"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddEditModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Role Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity"
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FiTrash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Xóa vai trò
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Bạn có chắc chắn muốn xóa vai trò "{currentRole?.name}"
                                                không? Hành động này không thể hoàn tác.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Xóa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserRoles;