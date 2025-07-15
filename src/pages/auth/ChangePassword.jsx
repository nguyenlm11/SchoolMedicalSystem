import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import { PRIMARY, BACKGROUND, TEXT, BORDER, SUCCESS, ERROR } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import { useAuth } from "../../utils/AuthContext";
import authApi from "../../api/authApi";

const ChangePassword = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error khi user bắt đầu nhập
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const showAlert = (type, title, message) => {
        setAlertModal({ isOpen: true, type, title, message });
    };

    const closeAlert = () => {
        setAlertModal({ isOpen: false, type: "info", title: "", message: "" });

        // Nếu là thông báo thành công, tự động đăng xuất và chuyển về trang login
        if (alertModal.type === "success") {
            logout();
            navigate("/login");
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.oldPassword.trim()) {
            newErrors.oldPassword = "Vui lòng nhập mật khẩu cũ";
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else {
            // Kiểm tra độ dài tối thiểu
            if (formData.newPassword.length < 8) {
                newErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
            }
            // Kiểm tra có chữ hoa
            else if (!/[A-Z]/.test(formData.newPassword)) {
                newErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ hoa";
            }
            // Kiểm tra có ký tự đặc biệt
            else if (!/[^A-Za-z0-9]/.test(formData.newPassword)) {
                newErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt";
            }
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        if (formData.oldPassword === formData.newPassword) {
            newErrors.newPassword = "Mật khẩu mới không được trùng với mật khẩu cũ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await authApi.changePassword(
                user.id,
                formData.oldPassword,
                formData.newPassword
            );

            if (result.success) {
                showAlert(
                    "success",
                    "Đổi mật khẩu thành công",
                    "Mật khẩu của bạn đã được cập nhật thành công. Bạn sẽ được chuyển về trang đăng nhập để đăng nhập lại với mật khẩu mới."
                );

                // Reset form
                setFormData({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            } else {
                showAlert(
                    "error",
                    "Đổi mật khẩu thất bại",
                    result.message || "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại."
                );
            }
        } catch (error) {
            showAlert(
                "error",
                "Lỗi hệ thống",
                "Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng kiểm tra kết nối và thử lại."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang xử lý yêu cầu đổi mật khẩu..." />
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="flex flex-col lg:flex-row min-h-screen">
                    {/* Left Panel - Background */}
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
                                            <FiLock className="h-6 w-6 text-white" />
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
                                        <FiLock className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
                                    </div>
                                    <h1 className="text-2xl lg:text-4xl font-bold mb-4">
                                        Bảo mật tài khoản
                                    </h1>
                                    <p className="text-sm lg:text-lg opacity-90 max-w-md">
                                        Đổi mật khẩu để bảo vệ tài khoản của bạn
                                    </p>

                                    <div className="hidden lg:block mt-8 space-y-3">
                                        <div className="flex items-center text-left">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                            >
                                                <span className="text-xs">✓</span>
                                            </div>
                                            <span className="text-sm">Mật khẩu mạnh bảo vệ tài khoản</span>
                                        </div>
                                        <div className="flex items-center text-left">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                            >
                                                <span className="text-xs">✓</span>
                                            </div>
                                            <span className="text-sm">Cập nhật định kỳ để tăng bảo mật</span>
                                        </div>
                                        <div className="flex items-center text-left">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                            >
                                                <span className="text-xs">✓</span>
                                            </div>
                                            <span className="text-sm">Không chia sẻ mật khẩu với người khác</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Form */}
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
                            <FiArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Trang chủ</span>
                        </Link>

                        <div className="w-full max-w-md mx-auto py-8 lg:py-12 px-6 lg:px-8">
                            <div className="text-center mb-8">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: PRIMARY[100] }}
                                >
                                    <FiLock className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                                </div>
                                <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Đổi mật khẩu
                                </h1>
                                <p style={{ color: TEXT.SECONDARY }}>
                                    Nhập mật khẩu cũ và mật khẩu mới để cập nhật
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Mật khẩu cũ */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="oldPassword"
                                        className="text-sm font-medium"
                                        style={{ color: TEXT.PRIMARY }}
                                    >
                                        Mật khẩu hiện tại
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                        </div>
                                        <input
                                            type={showPasswords.oldPassword ? "text" : "password"}
                                            id="oldPassword"
                                            name="oldPassword"
                                            value={formData.oldPassword}
                                            onChange={handleChange}
                                            required
                                            className={`block w-full pl-10 pr-12 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 ${errors.oldPassword ? 'border-2' : 'border-2'
                                                }`}
                                            style={{
                                                backgroundColor: BACKGROUND.DEFAULT,
                                                borderColor: errors.oldPassword ? ERROR[500] : BORDER.DEFAULT,
                                                color: TEXT.PRIMARY,
                                                focusRingColor: PRIMARY[500]
                                            }}
                                            placeholder="Nhập mật khẩu hiện tại"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => togglePasswordVisibility('oldPassword')}
                                        >
                                            {showPasswords.oldPassword ? (
                                                <FiEyeOff className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                            ) : (
                                                <FiEye className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.oldPassword && (
                                        <p className="text-sm mt-1 flex items-center" style={{ color: ERROR[500] }}>
                                            <FiAlertCircle className="h-4 w-4 mr-1" />
                                            {errors.oldPassword}
                                        </p>
                                    )}
                                </div>

                                {/* Mật khẩu mới */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="newPassword"
                                        className="text-sm font-medium"
                                        style={{ color: TEXT.PRIMARY }}
                                    >
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                        </div>
                                        <input
                                            type={showPasswords.newPassword ? "text" : "password"}
                                            id="newPassword"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            required
                                            className={`block w-full pl-10 pr-12 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 ${errors.newPassword ? 'border-2' : 'border-2'
                                                }`}
                                            style={{
                                                backgroundColor: BACKGROUND.DEFAULT,
                                                borderColor: errors.newPassword ? ERROR[500] : BORDER.DEFAULT,
                                                color: TEXT.PRIMARY,
                                                focusRingColor: PRIMARY[500]
                                            }}
                                            placeholder="Nhập mật khẩu mới"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                        >
                                            {showPasswords.newPassword ? (
                                                <FiEyeOff className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                            ) : (
                                                <FiEye className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="text-sm mt-1 flex items-center" style={{ color: ERROR[500] }}>
                                            <FiAlertCircle className="h-4 w-4 mr-1" />
                                            {errors.newPassword}
                                        </p>
                                    )}
                                </div>

                                {/* Xác nhận mật khẩu mới */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="text-sm font-medium"
                                        style={{ color: TEXT.PRIMARY }}
                                    >
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                        </div>
                                        <input
                                            type={showPasswords.confirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className={`block w-full pl-10 pr-12 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 ${errors.confirmPassword ? 'border-2' : 'border-2'
                                                }`}
                                            style={{
                                                backgroundColor: BACKGROUND.DEFAULT,
                                                borderColor: errors.confirmPassword ? ERROR[500] : BORDER.DEFAULT,
                                                color: TEXT.PRIMARY,
                                                focusRingColor: PRIMARY[500]
                                            }}
                                            placeholder="Nhập lại mật khẩu mới"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                        >
                                            {showPasswords.confirmPassword ? (
                                                <FiEyeOff className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                            ) : (
                                                <FiEye className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-sm mt-1 flex items-center" style={{ color: ERROR[500] }}>
                                            <FiAlertCircle className="h-4 w-4 mr-1" />
                                            {errors.confirmPassword}
                                        </p>
                                    )}
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
                                            <span className="flex items-center justify-center">
                                                <FiCheckCircle className="mr-2 h-5 w-5" />
                                                Đổi mật khẩu
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="text-sm hover:underline"
                                    style={{ color: PRIMARY[600] }}
                                >
                                    Quay lại trang đăng nhập
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
                okText="Xác nhận"
            />
        </>
    );
};

export default ChangePassword;
