import React, { useState, useEffect } from "react";
import { FiSave, FiAlertTriangle } from "react-icons/fi";

const UserPermissions = () => {
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);
    const [selectedModule, setSelectedModule] = useState("all");
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const modules = [
        { id: "all", name: "Tất cả" },
        { id: "dashboard", name: "Tổng quan" },
        { id: "users", name: "Người dùng" },
        { id: "medication", name: "Quản lý thuốc" },
        { id: "healthCheck", name: "Kiểm tra sức khỏe" },
        { id: "vaccinations", name: "Tiêm chủng" },
        { id: "reports", name: "Báo cáo" },
        { id: "settings", name: "Cài đặt" },
    ];

    // Mock data - in a real application, this would come from an API
    useEffect(() => {
        setTimeout(() => {
            const mockPermissions = [
                {
                    id: 1,
                    module: "dashboard",
                    name: "Xem tổng quan",
                    code: "dashboard.view",
                    description: "Quyền xem trang tổng quan và thống kê",
                    roles: ["Admin", "Nhân viên y tế", "Giáo viên"],
                },
                {
                    id: 2,
                    module: "dashboard",
                    name: "Chỉnh sửa tổng quan",
                    code: "dashboard.edit",
                    description: "Quyền chỉnh sửa các widget trên trang tổng quan",
                    roles: ["Admin"],
                },
                {
                    id: 3,
                    module: "users",
                    name: "Xem người dùng",
                    code: "users.view",
                    description: "Quyền xem danh sách và thông tin người dùng",
                    roles: ["Admin", "Nhân viên y tế"],
                },
                {
                    id: 4,
                    module: "users",
                    name: "Tạo người dùng",
                    code: "users.create",
                    description: "Quyền tạo người dùng mới trong hệ thống",
                    roles: ["Admin"],
                },
                {
                    id: 5,
                    module: "users",
                    name: "Chỉnh sửa người dùng",
                    code: "users.edit",
                    description: "Quyền chỉnh sửa thông tin người dùng",
                    roles: ["Admin"],
                },
                {
                    id: 6,
                    module: "users",
                    name: "Xóa người dùng",
                    code: "users.delete",
                    description: "Quyền xóa người dùng khỏi hệ thống",
                    roles: ["Admin"],
                },
                {
                    id: 7,
                    module: "medication",
                    name: "Xem thuốc",
                    code: "medication.view",
                    description: "Quyền xem danh sách và thông tin thuốc",
                    roles: ["Admin", "Nhân viên y tế", "Giáo viên", "Phụ huynh"],
                },
                {
                    id: 8,
                    module: "medication",
                    name: "Tạo thuốc",
                    code: "medication.create",
                    description: "Quyền thêm thuốc mới vào hệ thống",
                    roles: ["Admin", "Nhân viên y tế"],
                },
                {
                    id: 9,
                    module: "medication",
                    name: "Chỉnh sửa thuốc",
                    code: "medication.edit",
                    description: "Quyền chỉnh sửa thông tin thuốc",
                    roles: ["Admin", "Nhân viên y tế"],
                },
                {
                    id: 10,
                    module: "medication",
                    name: "Xóa thuốc",
                    code: "medication.delete",
                    description: "Quyền xóa thuốc khỏi hệ thống",
                    roles: ["Admin"],
                },
                {
                    id: 11,
                    module: "healthCheck",
                    name: "Xem kiểm tra sức khỏe",
                    code: "healthCheck.view",
                    description: "Quyền xem lịch và kết quả kiểm tra sức khỏe",
                    roles: ["Admin", "Nhân viên y tế", "Giáo viên", "Phụ huynh"],
                },
                {
                    id: 12,
                    module: "healthCheck",
                    name: "Tạo kiểm tra sức khỏe",
                    code: "healthCheck.create",
                    description: "Quyền tạo lịch kiểm tra sức khỏe mới",
                    roles: ["Admin", "Nhân viên y tế"],
                },
                {
                    id: 13,
                    module: "reports",
                    name: "Xem báo cáo",
                    code: "reports.view",
                    description: "Quyền xem các báo cáo trong hệ thống",
                    roles: ["Admin", "Nhân viên y tế", "Giáo viên"],
                },
                {
                    id: 14,
                    module: "reports",
                    name: "Tạo báo cáo",
                    code: "reports.create",
                    description: "Quyền tạo báo cáo mới",
                    roles: ["Admin", "Nhân viên y tế"],
                },
                {
                    id: 15,
                    module: "reports",
                    name: "Xuất báo cáo",
                    code: "reports.export",
                    description: "Quyền xuất báo cáo ra các định dạng khác nhau",
                    roles: ["Admin"],
                },
                {
                    id: 16,
                    module: "settings",
                    name: "Xem cài đặt",
                    code: "settings.view",
                    description: "Quyền xem các cài đặt hệ thống",
                    roles: ["Admin"],
                },
                {
                    id: 17,
                    module: "settings",
                    name: "Chỉnh sửa cài đặt",
                    code: "settings.edit",
                    description: "Quyền chỉnh sửa các cài đặt hệ thống",
                    roles: ["Admin"],
                },
            ];

            setPermissions(mockPermissions);
            setLoading(false);
        }, 1000);
    }, []);

    const handleModuleChange = (moduleId) => {
        setSelectedModule(moduleId);
    };

    const handlePermissionSave = () => {
        // In a real application, this would make an API call to save the permissions
        setShowSaveSuccess(true);
        setTimeout(() => {
            setShowSaveSuccess(false);
        }, 3000);
    };

    const filteredPermissions = permissions.filter(
        (permission) =>
            selectedModule === "all" || permission.module === selectedModule
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Quản lý quyền hệ thống
                    </h1>
                    <p className="text-gray-600">
                        Cấu hình các quyền chi tiết trong hệ thống quản lý y tế trường học
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handlePermissionSave}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <FiSave className="mr-2" />
                        Lưu thay đổi
                    </button>
                </div>
            </div>

            {/* Success alert */}
            {showSaveSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-green-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">
                                Cấu hình quyền đã được lưu thành công!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Module filter */}
            <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                <div className="flex flex-wrap gap-2">
                    {modules.map((module) => (
                        <button
                            key={module.id}
                            onClick={() => handleModuleChange(module.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${selectedModule === module.id
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {module.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Permissions list */}
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
                                    Tên quyền
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Mã quyền
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
                                    Vai trò được cấp
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPermissions.map((permission) => (
                                <tr key={permission.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {permission.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Module:{" "}
                                            {modules.find((m) => m.id === permission.module)?.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 font-mono">
                                            {permission.code}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">
                                            {permission.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {permission.roles.map((role, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${role === "Admin"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : role === "Nhân viên y tế"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : role === "Giáo viên"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && filteredPermissions.length === 0 && (
                    <div className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
                            <FiAlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>
                        <p className="text-gray-600 mb-2">
                            Không tìm thấy quyền nào cho module đã chọn
                        </p>
                        <p className="text-sm text-gray-500">
                            Vui lòng chọn một module khác hoặc xem tất cả các quyền
                        </p>
                    </div>
                )}
            </div>

            {/* Info section */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                    Thông tin về hệ thống phân quyền
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                    Hệ thống phân quyền cho phép kiểm soát chi tiết các quyền truy cập và
                    thao tác trong hệ thống quản lý y tế trường học. Mỗi quyền được gán
                    cho các vai trò khác nhau, và người dùng sẽ kế thừa các quyền từ vai
                    trò của họ.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">
                            Cấu trúc quyền
                        </h4>
                        <p className="text-xs text-blue-700">
                            Quyền được cấu trúc theo dạng "module.action" (ví dụ:
                            users.create, medication.view). Điều này giúp phân loại và quản lý
                            quyền dễ dàng hơn.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">
                            Quản lý vai trò
                        </h4>
                        <p className="text-xs text-blue-700">
                            Sử dụng trang "Quản lý vai trò" để cấu hình các quyền cho từng vai
                            trò. Các thay đổi trong cấu hình quyền sẽ ảnh hưởng đến tất cả
                            người dùng có vai trò tương ứng.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPermissions;