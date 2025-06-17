import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLoader, FiHeart, FiArrowLeft } from 'react-icons/fi';
import { PRIMARY, BACKGROUND, TEXT, COLORS, BORDER } from '../../constants/colors';
import Loading from '../../components/Loading';
import AlertModal from '../../components/modal/AlertModal';
import authApi from "../../api/authApi"; // Import the API methods for forgot password

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // Step control (1: email, 2: OTP, 3: reset password)
    const [alertModal, setAlertModal] = useState({ isOpen: false, type: "info", title: "", message: "" });
    const [countdown, setCountdown] = useState(5);
    const [isResetSuccessful, setIsResetSuccessful] = useState(false);

    const showAlert = (type, title, message) => {
        setAlertModal({ isOpen: true, type, title, message });
    };

    const closeAlert = () => {
        setAlertModal({ isOpen: false, type: "info", title: "", message: "" });
    };

    useEffect(() => {
        if (isResetSuccessful && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown <= 1) {
                        clearInterval(timer);
                        navigate("/login");
                    }
                    return prevCountdown - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isResetSuccessful, countdown, navigate]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (email.trim() === "") {
            setIsLoading(false);
            showAlert("warning", "Thông tin thiếu", "Vui lòng nhập email của bạn.");
            return;
        }

        try {
            const result = await authApi.requestOtp(email);

            if (result.success) {
                setAlertModal({ isOpen: true, type: "success", title: "Thành công", message: result.message });
                setStep(2);
            } else {
                showAlert("error", "Lỗi hệ thống", result.message || "Có lỗi xảy ra khi gửi OTP");
            }
        } catch (err) {
            setIsLoading(false);
            showAlert("error", "Lỗi hệ thống", "Có lỗi xảy ra khi gửi OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (otp.trim() === "") {
            setIsLoading(false);
            showAlert("warning", "Thông tin thiếu", "Vui lòng nhập mã OTP.");
            return;
        }

        try {
            const result = await authApi.verifyOtp(email, otp);

            if (result.success) {
                setAlertModal({ isOpen: true, type: "success", title: "Thành công", message: result.data.message });
                setStep(3);
            } else {
                showAlert("error", "Lỗi hệ thống", result.message || "Mã OTP không hợp lệ.");
            }
        } catch (err) {
            setIsLoading(false);
            showAlert("error", "Lỗi hệ thống", "Có lỗi xảy ra khi xác nhận OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (newPassword !== confirmPassword) {
            setIsLoading(false);
            showAlert("warning", "Mật khẩu không khớp", "Mật khẩu và xác nhận mật khẩu không khớp.");
            return;
        }

        try {
            const result = await authApi.resetPassword(email, otp, newPassword, confirmPassword);

            if (result.success) {
                setIsResetSuccessful(true);
                showAlert("success", "Thành công", result.message);
            } else {
                showAlert("error", "Lỗi hệ thống", result.message || "Có lỗi xảy ra khi đặt lại mật khẩu.");
            }
        } catch (err) {
            setIsLoading(false);
            showAlert("error", "Lỗi hệ thống", "Có lỗi xảy ra khi đặt lại mật khẩu.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang xác thực, vui lòng chờ giây lát..." />
            </div>
        );
    }

    return (
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

                <div className="lg:w-1/2 flex items-center justify-center bg-white min-h-screen lg:h-screen overflow-y-auto relative px-6 py-8">
                    <div className="w-full max-w-md mx-auto">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ backgroundColor: PRIMARY[100] }}
                        >
                            <img src="/reset-password.gif" alt="Reset Password" className="w-12 h-12" />
                        </div>
                        {step === 1 && (
                            <>
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Quên mật khẩu?
                                    </h1>
                                    <p style={{ color: TEXT.SECONDARY }}>
                                        Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
                                    </p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                            Email của bạn
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiMail className="h-5 w-5" style={{ color: TEXT.SECONDARY }} />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                autoComplete="email"
                                                className="block w-full pl-10 pr-3 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200"
                                                style={{
                                                    backgroundColor: BACKGROUND.DEFAULT,
                                                    borderColor: BORDER.DEFAULT,
                                                    color: TEXT.PRIMARY,
                                                    borderWidth: '2px',
                                                }}
                                                placeholder="Nhập email của bạn"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg"
                                            style={{
                                                backgroundColor: PRIMARY[500],
                                                focusRingColor: PRIMARY[500],
                                            }}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                                    Đang xử lý...
                                                </span>
                                            ) : (
                                                "Gửi OTP"
                                            )}
                                        </button>
                                    </div>
                                </form>
                                <div className="mt-4 text-center">
                                    <Link
                                        to="/login"
                                        className="text-sm text-primary hover:underline"
                                        style={{ color: PRIMARY[600] }}
                                    >
                                        <FiArrowLeft className="inline mr-2" />
                                        Quay lại trang đăng nhập
                                    </Link>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Nhập mã OTP
                                    </h1>
                                    <p style={{ color: TEXT.SECONDARY }}>
                                        Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã OTP để xác nhận.
                                    </p>
                                </div>

                                <form onSubmit={handleOtpSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="otp" className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                            Mã OTP
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="otp"
                                                name="otp"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                                className="block w-full pl-10 pr-3 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200"
                                                style={{
                                                    backgroundColor: BACKGROUND.DEFAULT,
                                                    borderColor: BORDER.DEFAULT,
                                                    color: TEXT.PRIMARY,
                                                    borderWidth: '2px',
                                                }}
                                                placeholder="Nhập mã OTP"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg"
                                            style={{
                                                backgroundColor: PRIMARY[500],
                                                focusRingColor: PRIMARY[500],
                                            }}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                                    Đang xử lý...
                                                </span>
                                            ) : (
                                                "Xác nhận OTP"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Đặt lại mật khẩu
                                    </h1>
                                    <p style={{ color: TEXT.SECONDARY }}>
                                        Nhập mật khẩu mới và xác nhận mật khẩu.
                                    </p>
                                </div>

                                <form onSubmit={handlePasswordReset} className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="newPassword" className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                            Mật khẩu mới
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                className="block w-full pl-10 pr-3 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200"
                                                style={{
                                                    backgroundColor: BACKGROUND.DEFAULT,
                                                    borderColor: BORDER.DEFAULT,
                                                    color: TEXT.PRIMARY,
                                                    borderWidth: '2px',
                                                }}
                                                placeholder="Mật khẩu mới"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                            Xác nhận mật khẩu
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="block w-full pl-10 pr-3 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200"
                                                style={{
                                                    backgroundColor: BACKGROUND.DEFAULT,
                                                    borderColor: BORDER.DEFAULT,
                                                    color: TEXT.PRIMARY,
                                                    borderWidth: '2px',
                                                }}
                                                placeholder="Xác nhận mật khẩu"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg"
                                            style={{
                                                backgroundColor: PRIMARY[500],
                                                focusRingColor: PRIMARY[500],
                                            }}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                                    Đang xử lý...
                                                </span>
                                            ) : (
                                                "Đặt lại mật khẩu"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Countdown Timer After Success */}
                        {isResetSuccessful && (
                            <div className="mt-4 text-center">
                                <p style={{ color: TEXT.SECONDARY }}>
                                    Bạn sẽ được chuyển hướng đến trang đăng nhập trong {countdown} giây.{" "}
                                    <Link to="/login" className="text-primary hover:underline">
                                        Hoặc click vào đây để quay lại ngay.
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={closeAlert}
                type={alertModal.type}
                title={alertModal.title}
                message={
                    isResetSuccessful ? (
                        <div className="mt-4 text-center">
                            <p className="text-xl" style={{ color: TEXT.SECONDARY }}>
                                Bạn sẽ được chuyển hướng đến trang đăng nhập trong {countdown} giây.{" "}
                            </p>
                        </div>
                    ) : (
                        alertModal.message
                    )
                }
                okText="Đóng"
            />
        </div>
    );
};

export default ForgotPasswordPage;
