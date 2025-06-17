import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiHome, FiChevronDown, FiLoader, FiHeart } from "react-icons/fi";
import { PRIMARY, BACKGROUND, TEXT, BORDER } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import { useAuth } from "../../utils/AuthContext";

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithCredentials } = useAuth();

    const getInitialRole = () => {
        const searchParams = new URLSearchParams(location.search);
        const roleParam = searchParams.get("role");
        return roleParam || "student";
    };

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: getInitialRole(),
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [alertModal, setAlertModal] = useState({ isOpen: false, type: "info", title: "", message: "" });

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const roleParam = searchParams.get("role");
        if (roleParam) {
            setFormData((prev) => ({ ...prev, role: roleParam }));
        }
    }, [location.search]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const showAlert = (type, title, message) => {
        setAlertModal({ isOpen: true, type, title, message });
    };

    const closeAlert = () => {
        setAlertModal({ isOpen: false, type: "info", title: "", message: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.username.trim() === "" || formData.password.trim() === "") {
            setIsLoading(false);
            showAlert("warning", "Thông tin thiếu", "Vui lòng nhập tên đăng nhập và mật khẩu");
            return;
        }
        try {
            const selectedRoleObj = roles.find(r => r.id === formData.role);
            const serverRole = selectedRoleObj ? selectedRoleObj.serverRole : formData.role.toUpperCase();
            const result = await loginWithCredentials({
                username: formData.username,
                password: formData.password,
                role: serverRole
            });

            if (result.success) {
                const redirectMap = {
                    admin: "/admin/dashboard",
                    staff: "/staff/dashboard",
                    manager: "/manager/dashboard",
                    parent: "/parent/dashboard",
                    student: "/student/dashboard",
                };
                const userRole = result.data.role.toLowerCase();
                navigate(redirectMap[userRole] || "/");
            } else {
                showAlert("error", "Đăng nhập thất bại", result.message || "Vui lòng kiểm tra lại thông tin đăng nhập.");
            }
        } catch (err) {
            showAlert("error", "Lỗi hệ thống", "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        { id: "student", label: "Học sinh", icon: FiUser, serverRole: "STUDENT" },
        { id: "parent", label: "Phụ huynh", icon: FiUser, serverRole: "PARENT" },
        { id: "manager", label: "Quản lý", icon: FiUser, serverRole: "MANAGER" },
        { id: "staff", label: "Nhân viên y tế", icon: FiUser, serverRole: "STAFF" },
        { id: "admin", label: "Quản trị viên", icon: FiUser, serverRole: "ADMIN" },
    ];

    const getCurrentRole = () => {
        return roles.find(role => role.id === formData.role) || roles[0];
    };

    const currentRole = getCurrentRole();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang xác thực thông tin đăng nhập..." />
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="flex flex-col lg:flex-row min-h-screen">
                <div className="lg:w-1/2 h-64 lg:h-screen relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-br"
                        style={{
                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 50%, ${PRIMARY[700]} 100%)`
                        }}
                    >
                        <div className="absolute inset-0 opacity-10">
                            <div className="grid grid-cols-8 lg:grid-cols-12 gap-8 p-8 h-full">
                                {Array.from({ length: 96 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-center">
                                        <FiHeart className="h-6 w-6 text-white" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-8">
                            <div className="text-center">
                                <div
                                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-6 mx-auto"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiHeart className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
                                </div>
                                <h1 className="text-2xl lg:text-4xl font-bold mb-4">
                                    Hệ thống Y tế Trường học
                                </h1>
                                <p className="text-sm lg:text-lg opacity-90 max-w-md">
                                    Quản lý sức khỏe học sinh một cách chuyên nghiệp và hiệu quả
                                </p>

                                <div className="hidden lg:block mt-8 space-y-3">
                                    <div className="flex items-center text-left">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                        >
                                            <span className="text-xs">✓</span>
                                        </div>
                                        <span className="text-sm">Theo dõi sức khỏe realtime</span>
                                    </div>
                                    <div className="flex items-center text-left">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                        >
                                            <span className="text-xs">✓</span>
                                        </div>
                                        <span className="text-sm">Quản lý thuốc an toàn</span>
                                    </div>
                                    <div className="flex items-center text-left">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                        >
                                            <span className="text-xs">✓</span>
                                        </div>
                                        <span className="text-sm">Kết nối phụ huynh hiệu quả</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/2 flex items-center justify-center bg-white min-h-screen lg:h-screen overflow-y-auto relative">
                        <Link
                        to="/"
                        className="absolute top-4 right-4 lg:top-8 lg:right-8 px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        style={{
                            color: PRIMARY[600],
                            backgroundColor: 'white',
                            border: `1px solid ${BORDER.DEFAULT}`
                        }}
                    >
                        <FiHome className="h-4 w-4" />
                        <span className="hidden sm:inline">Trang chủ</span>
                        </Link>

                    <div className="w-full max-w-md mx-auto py-8 lg:py-12 px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: PRIMARY[100] }}
                            >
                                <currentRole.icon className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                                Chào mừng trở lại
                            </h1>
                            <p style={{ color: TEXT.SECONDARY }}>
                                Đăng nhập để truy cập tài khoản của bạn
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label
                                    htmlFor="role"
                                    className="text-sm font-medium"
                                    style={{ color: TEXT.PRIMARY }}
                                >
                                    Tôi là
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <currentRole.icon className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                    </div>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                        className="block w-full pl-10 pr-10 py-3 rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            borderColor: BORDER.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            focusRingColor: PRIMARY[500],
                                            borderWidth: '2px'
                                        }}
                                    >
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <FiChevronDown className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium"
                                    style={{ color: TEXT.PRIMARY }}
                                >
                                    Tên đăng nhập
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUser className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                    </div>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                            autoComplete="username"
                                        className="block w-full pl-10 pr-3 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            borderColor: BORDER.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            borderWidth: '2px'
                                        }}
                                        placeholder="Nhập tên đăng nhập"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium"
                                    style={{ color: TEXT.PRIMARY }}
                                >
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                            autoComplete="current-password"
                                        className="block w-full pl-10 pr-12 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            borderColor: BORDER.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            borderWidth: '2px'
                                        }}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            style={{ color: TEXT.SECONDARY }}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            {showPassword ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            )}
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg"
                                    style={{
                                        backgroundColor: PRIMARY[500],
                                        focusRingColor: PRIMARY[500]
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoading) {
                                            e.target.style.backgroundColor = PRIMARY[600];
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoading) {
                                            e.target.style.backgroundColor = PRIMARY[500];
                                        }
                                    }}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                            Đang xử lý...
                                        </span>
                                    ) : (
                                        "Đăng nhập"
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 text-center">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:underline"
                                style={{ color: PRIMARY[600] }}
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={closeAlert}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                okText="Đóng"
            />
        </>
    );
};

export default LoginPage;