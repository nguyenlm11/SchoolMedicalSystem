import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiUser,
    FiClock,
    FiBell,
    FiPlus,
    FiList,
    FiHelpCircle,
    FiFileText,
    FiEdit,
    FiActivity,
    FiCalendar,
    FiChevronRight,
    FiHeart,
    FiTrendingUp
} from "react-icons/fi";
import {
    PRIMARY,
    SECONDARY,
    SUCCESS,
    WARNING,
    ERROR,
    INFO,
    BACKGROUND,
    TEXT,
    BORDER,
    SHADOW
} from "../../constants/colors";
import Loading from "../../components/Loading";

// Custom hook to safely use router
const useSafeRouter = () => {
    try {
        const navigate = useNavigate();
        return { navigate, hasRouter: true };
    } catch (error) {
        console.warn("Router context not available, using fallback navigation");
        return {
            navigate: (path) => {
                console.log("Would navigate to:", path);
                alert(`Điều hướng đến: ${path}`);
            },
            hasRouter: false
        };
    }
};

// Safe Link component
const SafeLink = ({ to, children, className, style, onClick }) => {
    const { navigate, hasRouter } = useSafeRouter();

    if (hasRouter) {
        return (
            <Link to={to} className={className} style={style} onClick={onClick}>
                {children}
            </Link>
        );
    }

    // Fallback when router is not available
    return (
        <button
            className={className}
            style={style}
            onClick={(e) => {
                e.preventDefault();
                if (onClick) onClick(e);
                navigate(to);
            }}
        >
            {children}
        </button>
    );
};

const ParentDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        activeMedications: 0,
        pendingMedications: 0,
        studentName: "",
        notificationCount: 0,
    });

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                setDashboardData({
                    activeMedications: 2,
                    pendingMedications: 1,
                    studentName: "Nguyễn Văn An",
                    notificationCount: 3,
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Stats cards data
    const statsCards = [
        {
            title: "Thuốc đang sử dụng",
            value: dashboardData.activeMedications,
            description: "Các yêu cầu thuốc đang được thực hiện tại trường",
            link: "/parent/medication/history",
            linkText: "Xem chi tiết",
            icon: FiHeart,
            color: PRIMARY,
            bgColor: PRIMARY[50],
            borderColor: PRIMARY[500]
        },
        {
            title: "Yêu cầu chờ xác nhận",
            value: dashboardData.pendingMedications,
            description: "Các yêu cầu thuốc đang chờ xác nhận từ nhân viên y tế",
            link: "/parent/medication/history?status=pending",
            linkText: "Xem chi tiết",
            icon: FiClock,
            color: WARNING,
            bgColor: WARNING[50],
            borderColor: WARNING[500]
        },
        {
            title: "Thông báo mới",
            value: dashboardData.notificationCount,
            description: "Thông báo từ trường học về sức khỏe và thuốc của con bạn",
            link: "/parent/notifications",
            linkText: "Xem tất cả",
            icon: FiBell,
            color: SUCCESS,
            bgColor: SUCCESS[50],
            borderColor: SUCCESS[500]
        }
    ];

    // Medication management actions
    const medicationActions = [
        {
            title: "Gửi yêu cầu thuốc mới",
            description: "Tạo một yêu cầu mới để gửi thuốc đến trường",
            link: "/parent/medication/request",
            icon: FiPlus,
            color: PRIMARY
        },
        {
            title: "Lịch sử yêu cầu",
            description: "Xem tất cả các yêu cầu thuốc trước đây",
            link: "/parent/medication/history",
            icon: FiList,
            color: PRIMARY
        },
        {
            title: "Báo cáo sử dụng thuốc",
            description: "Xem báo cáo về việc sử dụng thuốc của học sinh",
            link: "/parent/medication/reports",
            icon: FiTrendingUp,
            color: PRIMARY
        },
        {
            title: "Câu hỏi thường gặp",
            description: "Thông tin hữu ích về quy trình sử dụng thuốc",
            link: "/parent/medication/faq",
            icon: FiHelpCircle,
            color: PRIMARY
        }
    ];

    // Health profile actions
    const healthActions = [
        {
            title: "Xem hồ sơ sức khỏe",
            description: "Thông tin sức khỏe chi tiết của học sinh",
            link: "/parent/health-profile",
            icon: FiFileText,
            color: SUCCESS
        },
        {
            title: "Cập nhật thông tin",
            description: "Cập nhật thông tin sức khỏe của học sinh",
            link: "/parent/health-profile/new",
            icon: FiEdit,
            color: SUCCESS
        },
        {
            title: "Lịch sử khám sức khỏe",
            description: "Xem lịch sử khám sức khỏe định kỳ",
            link: "/parent/health-records",
            icon: FiActivity,
            color: SUCCESS
        },
        {
            title: "Lịch khám sắp tới",
            description: "Xem lịch khám sức khỏe sắp tới",
            link: "/parent/health-schedule",
            icon: FiCalendar,
            color: SUCCESS
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading
                    type="heart"
                    size="xl"
                    color="primary"
                    text="Đang tải thông tin phụ huynh..."
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div
                            className="p-3 rounded-full mr-4"
                            style={{ backgroundColor: PRIMARY[100] }}
                        >
                            <FiUser className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Xin chào, phụ huynh của {dashboardData.studentName}
                            </h1>
                            <p className="mt-2 text-sm sm:text-base" style={{ color: TEXT.SECONDARY }}>
                                Theo dõi sức khỏe và các yêu cầu của con bạn tại trường
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {statsCards.map((card, index) => {
                        const IconComponent = card.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm p-6 border-l-4 hover:shadow-md transition-all duration-200"
                                style={{
                                    borderLeftColor: card.borderColor,
                                    boxShadow: SHADOW.DEFAULT
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div
                                            className="p-2 rounded-lg mr-3"
                                            style={{ backgroundColor: card.bgColor }}
                                        >
                                            {IconComponent && <IconComponent className="h-5 w-5" style={{ color: card.color[600] }} />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {card.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <span
                                        className="px-3 py-1 text-sm font-medium rounded-full"
                                        style={{
                                            backgroundColor: card.bgColor,
                                            color: card.color[800]
                                        }}
                                    >
                                        {card.value} {card.value === 1 ? 'yêu cầu' : card.title.includes('Thông báo') ? 'thông báo' : 'yêu cầu'}
                                    </span>
                                </div>

                                <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                                    {card.description}
                                </p>

                                <SafeLink
                                    to={card.link}
                                    className="inline-flex items-center text-sm font-medium hover:underline transition-all duration-200"
                                    style={{
                                        color: card.color[600],
                                        textDecoration: 'none',
                                        border: 'none',
                                        background: 'none',
                                        padding: 0,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {card.linkText}
                                    <FiChevronRight className="ml-1 h-4 w-4" />
                                </SafeLink>
                            </div>
                        );
                    })}
                </div>

                {/* Action Sections */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                    {/* Medication Management */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div
                            className="p-6 border-b"
                            style={{
                                backgroundColor: PRIMARY[50],
                                borderBottomColor: BORDER.DEFAULT
                            }}
                        >
                            <div className="flex items-center">
                                <FiHeart className="h-6 w-6 mr-3" style={{ color: PRIMARY[600] }} />
                                <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                    Quản lý thuốc
                                </h2>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {medicationActions.map((action, index) => {
                                    const IconComponent = action.icon;
                                    return (
                                        <SafeLink
                                            key={index}
                                            to={action.link}
                                            className="group block p-4 rounded-xl border-2 border-transparent hover:border-opacity-50 transition-all duration-200"
                                            style={{
                                                backgroundColor: action.color[50],
                                                borderColor: 'transparent',
                                                textDecoration: 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = action.color[200];
                                                e.currentTarget.style.backgroundColor = action.color[100];
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'transparent';
                                                e.currentTarget.style.backgroundColor = action.color[50];
                                            }}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200"
                                                    style={{ backgroundColor: action.color[100] }}
                                                >
                                                    {IconComponent && <IconComponent className="h-6 w-6" style={{ color: action.color[600] }} />}
                                                </div>
                                                <h3 className="font-medium mb-2 group-hover:text-opacity-90" style={{ color: action.color[700] }}>
                                                    {action.title}
                                                </h3>
                                                <p className="text-xs" style={{ color: action.color[600] }}>
                                                    {action.description}
                                                </p>
                                            </div>
                                        </SafeLink>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Health Profile */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div
                            className="p-6 border-b"
                            style={{
                                backgroundColor: SUCCESS[50],
                                borderBottomColor: BORDER.DEFAULT
                            }}
                        >
                            <div className="flex items-center">
                                <FiActivity className="h-6 w-6 mr-3" style={{ color: SUCCESS[600] }} />
                                <h2 className="text-xl font-semibold" style={{ color: SUCCESS[700] }}>
                                    Hồ sơ sức khỏe
                                </h2>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {healthActions.map((action, index) => {
                                    const IconComponent = action.icon;
                                    return (
                                        <SafeLink
                                            key={index}
                                            to={action.link}
                                            className="group block p-4 rounded-xl border-2 border-transparent hover:border-opacity-50 transition-all duration-200"
                                            style={{
                                                backgroundColor: action.color[50],
                                                borderColor: 'transparent',
                                                textDecoration: 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = action.color[200];
                                                e.currentTarget.style.backgroundColor = action.color[100];
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'transparent';
                                                e.currentTarget.style.backgroundColor = action.color[50];
                                            }}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200"
                                                    style={{ backgroundColor: action.color[100] }}
                                                >
                                                    {IconComponent && <IconComponent className="h-6 w-6" style={{ color: action.color[600] }} />}
                                                </div>
                                                <h3 className="font-medium mb-2 group-hover:text-opacity-90" style={{ color: action.color[700] }}>
                                                    {action.title}
                                                </h3>
                                                <p className="text-xs" style={{ color: action.color[600] }}>
                                                    {action.description}
                                                </p>
                                            </div>
                                        </SafeLink>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                            Thao tác nhanh
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <SafeLink
                                to="/parent/medication/request"
                                className="flex items-center p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                                style={{
                                    borderColor: BORDER.DEFAULT,
                                    backgroundColor: BACKGROUND.DEFAULT,
                                    textDecoration: 'none'
                                }}
                            >
                                <div
                                    className="p-2 rounded-lg mr-3"
                                    style={{ backgroundColor: PRIMARY[100] }}
                                >
                                    <FiPlus className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm" style={{ color: TEXT.PRIMARY }}>
                                        Yêu cầu thuốc
                                    </p>
                                    <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                        Gửi yêu cầu mới
                                    </p>
                                </div>
                            </SafeLink>

                            <SafeLink
                                to="/parent/health-profile"
                                className="flex items-center p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                                style={{
                                    borderColor: BORDER.DEFAULT,
                                    backgroundColor: BACKGROUND.DEFAULT,
                                    textDecoration: 'none'
                                }}
                            >
                                <div
                                    className="p-2 rounded-lg mr-3"
                                    style={{ backgroundColor: SUCCESS[100] }}
                                >
                                    <FiFileText className="h-5 w-5" style={{ color: SUCCESS[600] }} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm" style={{ color: TEXT.PRIMARY }}>
                                        Hồ sơ sức khỏe
                                    </p>
                                    <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                        Xem thông tin
                                    </p>
                                </div>
                            </SafeLink>

                            <SafeLink
                                to="/parent/notifications"
                                className="flex items-center p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                                style={{
                                    borderColor: BORDER.DEFAULT,
                                    backgroundColor: BACKGROUND.DEFAULT,
                                    textDecoration: 'none'
                                }}
                            >
                                <div
                                    className="p-2 rounded-lg mr-3 relative"
                                    style={{ backgroundColor: INFO[100] }}
                                >
                                    <FiBell className="h-5 w-5" style={{ color: INFO[600] }} />
                                    {dashboardData.notificationCount > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 h-3 w-3 rounded-full text-xs flex items-center justify-center"
                                            style={{
                                                backgroundColor: ERROR[500],
                                                color: 'white',
                                                fontSize: '8px'
                                            }}
                                        >
                                            {dashboardData.notificationCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-sm" style={{ color: TEXT.PRIMARY }}>
                                        Thông báo
                                    </p>
                                    <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                        {dashboardData.notificationCount} tin mới
                                    </p>
                                </div>
                            </SafeLink>

                            <SafeLink
                                to="/parent/help"
                                className="flex items-center p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                                style={{
                                    borderColor: BORDER.DEFAULT,
                                    backgroundColor: BACKGROUND.DEFAULT,
                                    textDecoration: 'none'
                                }}
                            >
                                <div
                                    className="p-2 rounded-lg mr-3"
                                    style={{ backgroundColor: WARNING[100] }}
                                >
                                    <FiHelpCircle className="h-5 w-5" style={{ color: WARNING[600] }} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm" style={{ color: TEXT.PRIMARY }}>
                                        Trợ giúp
                                    </p>
                                    <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                        Hướng dẫn sử dụng
                                    </p>
                                </div>
                            </SafeLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;