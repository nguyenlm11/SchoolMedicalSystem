import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiArrowLeft, FiUser } from 'react-icons/fi';
import { PRIMARY, TEXT, BACKGROUND, BORDER, SHADOW } from '../../constants/colors';

const UnauthorizedPage = ({ currentRole = null }) => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        const dashboardMap = {
            admin: '/admin/dashboard',
            manager: '/manager/dashboard',
            staff: '/staff/dashboard',
            parent: '/parent/dashboard',
            student: '/student/dashboard'
        };
        const dashboard = dashboardMap[currentRole?.toLowerCase()];
        navigate(dashboard || '/', { replace: true });
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8"
            style={{ backgroundColor: BACKGROUND.NEUTRAL, backgroundImage: `linear-gradient(135deg, ${PRIMARY[50]} 0%, ${BACKGROUND.NEUTRAL} 100%)` }}
        >
            <div className="max-w-2xl w-full">
                <div
                    className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 text-center relative overflow-hidden"
                    style={{ boxShadow: `0 25px 50px -12px ${SHADOW.MEDIUM}`, border: `1px solid ${BORDER.LIGHT}` }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                        <div
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: PRIMARY[500] }}
                        />
                    </div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5">
                        <div
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: PRIMARY[300] }}
                        />
                    </div>

                    <div
                        className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 relative"
                        style={{ backgroundColor: PRIMARY[100], boxShadow: `0 8px 25px ${PRIMARY[200]}` }}
                    >
                        <FiShield className="w-10 h-10" style={{ color: PRIMARY[600] }} />
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: TEXT.PRIMARY }} >
                        Oops! Không thể truy cập
                    </h1>

                    <p className="text-lg mb-8" style={{ color: TEXT.SECONDARY }}>
                        Bạn không có quyền truy cập vào trang này
                    </p>

                    <div className="grid md:grid-cols-1 gap-4 mb-8">
                        {currentRole && (
                            <div
                                className="rounded-xl p-4 border-l-4"
                                style={{ backgroundColor: PRIMARY[50], borderLeftColor: PRIMARY[500] }}
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <FiUser className="w-5 h-5 mr-2" style={{ color: PRIMARY[600] }} />
                                    <span className="font-semibold text-sm" style={{ color: PRIMARY[700] }}>
                                        Quyền hiện tại
                                    </span>
                                </div>
                                <p className="font-bold text-lg" style={{ color: PRIMARY[800] }}>
                                    {currentRole.toUpperCase()}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                        style={{ backgroundColor: PRIMARY[600], color: 'white', boxShadow: `0 4px 14px ${PRIMARY[300]}` }}
                    >
                        <FiArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage; 