import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiUser,
    FiHeart,
    FiActivity,
    FiCalendar,
    FiShield,
    FiTrendingUp,
    FiAlertCircle,
    FiUserCheck,
    // FiPill,
    FiCheckCircle,
    FiClock,
    FiChevronRight
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

const StudentDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState({
        studentName: "",
        studentClass: "",
        healthInfo: [],
        medications: [],
        upcomingEvents: []
    });

    // Fetch student data
    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                setStudentData({
                    studentName: "Nguyễn Văn An",
                    studentClass: "Lớp 3A",
                    healthInfo: [
                        { title: "Tình trạng sức khỏe", value: "Tốt", status: "good", icon: FiHeart },
                        { title: "Dị ứng", value: "Không", status: "good", icon: FiShield },
                        { title: "Bệnh mãn tính", value: "Không", status: "good", icon: FiActivity },
                        { title: "Chiều cao", value: "135 cm", status: "normal", icon: FiTrendingUp },
                        { title: "Cân nặng", value: "32 kg", status: "normal", icon: FiTrendingUp },
                    ],
                    medications: [
                        {
                            id: 1,
                            name: "Vitamin D",
                            schedule: "Hàng ngày, sau bữa sáng",
                            remainingDoses: 24,
                            color: SUCCESS
                        },
                    ],
                    upcomingEvents: [
                        {
                            id: 1,
                            title: "Khám sức khỏe định kỳ",
                            date: "15/06/2023",
                            type: "health-check",
                            icon: FiCheckCircle,
                            color: INFO
                        },
                        {
                            id: 2,
                            title: "Tiêm chủng vắc-xin",
                            date: "22/07/2023",
                            type: "vaccination",
                            icon: FiShield,
                            color: SUCCESS
                        },
                    ]
                });
            } catch (error) {
                console.error("Error fetching student data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    // Quick actions data
    const quickActions = [
        {
            title: "Báo cáo triệu chứng",
            description: "Báo cáo khi bạn cảm thấy không khỏe",
            link: "/student/report-symptom",
            icon: FiAlertCircle,
            color: WARNING
        },
        {
            title: "Yêu cầu gặp y tá",
            description: "Đặt lịch đến phòng y tế",
            link: "/student/request-visit",
            icon: FiUserCheck,
            color: SUCCESS
        }
    ];

    const handleMedicationTaken = (medicationId) => {
        alert(`Đã đánh dấu đã uống thuốc: ${medicationId}`);
        // In real app, this would update the backend
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading
                    type="heart"
                    size="xl"
                    color="primary"
                    text="Đang tải thông tin học sinh..."
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
                                Xin chào, {studentData.studentName}
                            </h1>
                            <p className="mt-2 text-sm sm:text-base" style={{ color: TEXT.SECONDARY }}>
                                {studentData.studentClass} - Thông tin sức khỏe cá nhân
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
                    {/* Health Overview - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2">
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
                                        Tổng quan sức khỏe
                                    </h2>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    {studentData.healthInfo.map((item, index) => {
                                        const IconComponent = item.icon;
                                        const getStatusColor = (status) => {
                                            switch (status) {
                                                case 'good': return SUCCESS;
                                                case 'warning': return WARNING;
                                                case 'bad': return ERROR;
                                                default: return INFO;
                                            }
                                        };
                                        const statusColor = getStatusColor(item.status);

                                        return (
                                            <div
                                                key={index}
                                                className="p-4 rounded-xl border hover:shadow-md transition-all duration-200"
                                                style={{
                                                    backgroundColor: statusColor[50],
                                                    borderColor: statusColor[200]
                                                }}
                                            >
                                                <div className="flex items-center mb-2">
                                                    <div
                                                        className="p-1 rounded-full mr-2"
                                                        style={{ backgroundColor: statusColor[100] }}
                                                    >
                                                        <IconComponent className="h-4 w-4" style={{ color: statusColor[600] }} />
                                                    </div>
                                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                        {item.title}
                                                    </p>
                                                </div>
                                                <p className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                    {item.value}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="text-center">
                                    <SafeLink
                                        to="/student/health-profile"
                                        className="inline-flex items-center text-sm font-medium hover:underline transition-all duration-200"
                                        style={{
                                            color: PRIMARY[600],
                                            textDecoration: 'none',
                                            border: 'none',
                                            background: 'none',
                                            padding: 0,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Xem chi tiết hồ sơ sức khỏe
                                        <FiChevronRight className="ml-1 h-4 w-4" />
                                    </SafeLink>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
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
                                        Hành động nhanh
                                    </h2>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col gap-4">
                                {quickActions.map((action, index) => {
                                    const IconComponent = action.icon;
                                    return (
                                        <SafeLink
                                            key={index}
                                            to={action.link}
                                            className="block p-4 rounded-xl border-2 border-transparent hover:border-opacity-50 transition-all duration-200"
                                            style={{
                                                backgroundColor: action.color[50],
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
                                            <div className="flex items-center">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                                                    style={{ backgroundColor: action.color[100] }}
                                                >
                                                    <IconComponent className="h-5 w-5" style={{ color: action.color[600] }} />
                                                </div>
                                                <div>
                                                    <p className="font-medium" style={{ color: action.color[700] }}>
                                                        {action.title}
                                                    </p>
                                                    <p className="text-xs" style={{ color: action.color[600] }}>
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </SafeLink>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medication Reminders */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div
                            className="p-6 border-b"
                            style={{
                                backgroundColor: INFO[50],
                                borderBottomColor: BORDER.DEFAULT
                            }}
                        >
                            <div className="flex items-center">
                                {/* <FiPill className="h-6 w-6 mr-3" style={{ color: INFO[600] }} /> */}
                                <h2 className="text-xl font-semibold" style={{ color: INFO[700] }}>
                                    Nhắc nhở thuốc
                                </h2>
                            </div>
                        </div>

                        {studentData.medications.length > 0 ? (
                            <div>
                                {studentData.medications.map((medication, index) => (
                                    <div
                                        key={medication.id}
                                        className={`p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${index < studentData.medications.length - 1 ? 'border-b' : ''
                                            }`}
                                        style={{ borderBottomColor: BORDER.DEFAULT }}
                                    >
                                        <div className="flex items-center flex-1">
                                            <div
                                                className="p-2 rounded-lg mr-4"
                                                style={{ backgroundColor: medication.color[100] }}
                                            >
                                                {/* <FiPill className="h-5 w-5" style={{ color: medication.color[600] }} /> */}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg" style={{ color: TEXT.PRIMARY }}>
                                                    {medication.name}
                                                </p>
                                                <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    {medication.schedule}
                                                </p>
                                                <p className="text-xs mt-1" style={{ color: INFO[600] }}>
                                                    Còn lại: {medication.remainingDoses} liều
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleMedicationTaken(medication.id)}
                                            className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                                            style={{ backgroundColor: SUCCESS[500] }}
                                        >
                                            Đã uống thuốc
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: INFO[100] }}
                                >
                                    {/* <FiPill className="h-8 w-8" style={{ color: INFO[500] }} /> */}
                                </div>
                                <p style={{ color: TEXT.SECONDARY }}>
                                    Bạn không có lịch dùng thuốc nào.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Health Events */}
                <div>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div
                            className="p-6 border-b"
                            style={{
                                backgroundColor: WARNING[50],
                                borderBottomColor: BORDER.DEFAULT
                            }}
                        >
                            <div className="flex items-center">
                                <FiCalendar className="h-6 w-6 mr-3" style={{ color: WARNING[600] }} />
                                <h2 className="text-xl font-semibold" style={{ color: WARNING[700] }}>
                                    Sự kiện y tế sắp tới
                                </h2>
                            </div>
                        </div>

                        {studentData.upcomingEvents.length > 0 ? (
                            <div>
                                {studentData.upcomingEvents.map((event, index) => {
                                    const IconComponent = event.icon;
                                    return (
                                        <div
                                            key={event.id}
                                            className={`p-6 flex items-center gap-4 ${index < studentData.upcomingEvents.length - 1 ? 'border-b' : ''
                                                }`}
                                            style={{ borderBottomColor: BORDER.DEFAULT }}
                                        >
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: event.color[100] }}
                                            >
                                                <IconComponent className="h-6 w-6" style={{ color: event.color[600] }} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-lg" style={{ color: TEXT.PRIMARY }}>
                                                    {event.title}
                                                </p>
                                                <div className="flex items-center mt-1">
                                                    <FiClock className="h-4 w-4 mr-2" style={{ color: TEXT.SECONDARY }} />
                                                    <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        Ngày: {event.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor: event.color[100],
                                                    color: event.color[700]
                                                }}
                                            >
                                                {event.type === 'health-check' ? 'Khám sức khỏe' : 'Tiêm chủng'}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div
                                    className="p-4 text-center border-t"
                                    style={{
                                        backgroundColor: BACKGROUND.NEUTRAL,
                                        borderTopColor: BORDER.DEFAULT
                                    }}
                                >
                                    <SafeLink
                                        to="/student/health-events"
                                        className="text-sm font-medium hover:underline transition-all duration-200"
                                        style={{
                                            color: PRIMARY[600],
                                            textDecoration: 'none',
                                            border: 'none',
                                            background: 'none',
                                            padding: 0,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Xem tất cả sự kiện
                                    </SafeLink>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: WARNING[100] }}
                                >
                                    <FiCalendar className="h-8 w-8" style={{ color: WARNING[500] }} />
                                </div>
                                <p style={{ color: TEXT.SECONDARY }}>
                                    Không có sự kiện y tế nào sắp tới.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;