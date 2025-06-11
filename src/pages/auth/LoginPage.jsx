import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiHome, FiChevronDown, FiLoader, FiHeart } from "react-icons/fi";
import { PRIMARY, ERROR, BACKGROUND, TEXT, BORDER, } from "../../constants/colors";
import Loading from "../../components/Loading";
import { useAuth, ROLES } from "../../utils/AuthContext";

const SafeLink = ({ to, children, className, style, onClick }) => {
    try {
        return (
            <Link to={to} className={className} style={style} onClick={onClick}>
                {children}
            </Link>
        );
    } catch (error) {
        return (
            <button
                className={className}
                style={style}
                onClick={(e) => {
                    e.preventDefault();
                    if (onClick) onClick(e);
                    console.log("Would navigate to:", to);
                    alert(`Điều hướng đến: ${to}`);
                }}
            >
                {children}
            </button>
        );
    }
};

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithRole } = useAuth();

    // Get role from URL parameter if available
    const getInitialRole = () => {
        const searchParams = new URLSearchParams(location.search);
        const roleParam = searchParams.get("role");
        return roleParam || "student"; // Default to student if not specified
    };

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: getInitialRole(),
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Update role if URL parameter changes
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
        // Clear error when user changes input
        if (error) setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Map form roles to our ROLES constant
        const roleMapping = {
            student: ROLES.STUDENT,
            parent: ROLES.PARENT,
            admin: ROLES.ADMIN,
            nurse: ROLES.STAFF,
            manager: ROLES.MANAGER,
        };

        // Simple validation for demo
        if (formData.username.trim() === "" || formData.password.trim() === "") {
            setError("Vui lòng nhập tên đăng nhập và mật khẩu");
            setIsLoading(false);
            return;
        }

        try {
            // In a real app, you would call an API here
            setTimeout(() => {
                // For the demo, we'll use a mock login function
                const mappedRole = roleMapping[formData.role];
                loginWithRole(mappedRole);

                // Redirect to the appropriate dashboard based on role
                const redirectMap = {
                    [ROLES.ADMIN]: "/admin/dashboard",
                    [ROLES.STAFF]: "/staff/dashboard",
                    [ROLES.MANAGER]: "/manager/dashboard",
                    [ROLES.PARENT]: "/parent/dashboard",
                    [ROLES.STUDENT]: "/student/dashboard",
                };

                navigate(redirectMap[mappedRole]);
                setIsLoading(false);
            }, 2000); // Simulating API delay
        } catch (err) {
            setError(
                "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
            );
            setIsLoading(false);
        }
    };

    // Available roles in the system
    const roles = [
        { id: "student", label: "Học sinh", icon: FiUser },
        { id: "parent", label: "Phụ huynh", icon: FiHeart },
        { id: "manager", label: "Quản lý", icon: FiUser },
        { id: "nurse", label: "Nhân viên y tế", icon: FiUser },
        { id: "admin", label: "Quản trị viên", icon: FiUser },
    ];

    const getCurrentRole = () => {
        return roles.find(role => role.id === formData.role) || roles[0];
    };

    const currentRole = getCurrentRole();

    // Show loading overlay when submitting
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang xác thực thông tin đăng nhập..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Image Section - Top on mobile, Left 50% on desktop */}
                <div className="lg:w-1/2 h-64 lg:h-screen relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-br"
                        style={{
                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 50%, ${PRIMARY[700]} 100%)`
                        }}
                    >
                        {/* Medical Icons Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="grid grid-cols-8 lg:grid-cols-12 gap-8 p-8 h-full">
                                {Array.from({ length: 96 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-center">
                                        <FiHeart className="h-6 w-6 text-white" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content Overlay */}
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

                                {/* Features */}
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

                {/* Form Section - Bottom on mobile, Right 50% on desktop */}
                <div className="lg:w-1/2 flex items-center justify-center bg-white min-h-screen lg:h-screen overflow-y-auto relative">
                    {/* Back to Home Button */}
                    <SafeLink
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
                    </SafeLink>

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

                        {error && (
                            <div
                                className="mb-6 p-4 rounded-xl border text-sm"
                                style={{
                                    backgroundColor: ERROR[50],
                                    color: ERROR[700],
                                    borderColor: ERROR[200]
                                }}
                            >
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selection */}
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

                            {/* Username */}
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

                            {/* Password */}
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

                            {/* Submit Button */}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;