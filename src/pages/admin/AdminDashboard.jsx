import React, { useState, useEffect } from "react";
import { FiUsers, FiActivity, FiCalendar, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiClock } from "react-icons/fi";
import { PRIMARY, SECONDARY, SUCCESS, WARNING, ERROR, INFO, BACKGROUND, TEXT, BORDER, SHADOW } from "../../constants/colors";
import Loading from "../../components/Loading";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeStudents: 0,
        pendingMedications: 0,
        scheduledHealthChecks: 0,
        upcomingVaccinations: 0,
        totalMedicationDispensed: 0,
        healthEventsToday: 0,
        completedHealthChecks: 0,
        allergyAlerts: 0,
        medicationAdherence: 0,
        healthVisitsByCategory: {},
        medicationsByType: {},
    });

    const [dateRange, setDateRange] = useState("week");
    const [loading, setLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                setStats({
                    totalUsers: 1248,
                    activeStudents: 895,
                    pendingMedications: 32,
                    scheduledHealthChecks: 3,
                    upcomingVaccinations: 2,
                    totalMedicationDispensed: 512,
                    healthEventsToday: 8,
                    completedHealthChecks: 42,
                    allergyAlerts: 15,
                    medicationAdherence: 94,
                    healthVisitsByCategory: {
                        "Sốt/Cảm/Cúm": 32,
                        "Đau đầu": 18,
                        "Đau bụng": 15,
                        "Chấn thương": 12,
                        "Dị ứng": 8,
                        "Khác": 15,
                    },
                    medicationsByType: {
                        "Kháng sinh": 28,
                        "Giảm đau": 35,
                        "Hạ sốt": 42,
                        "Vitamin": 22,
                        "Thuốc dị ứng": 18,
                        "Khác": 10,
                    },
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [dateRange]);

    const handleDateRangeChange = (range) => {
        setDateRange(range);
    };

    const handleViewDetails = () => {
        alert("Tính năng báo cáo chi tiết sẽ được phát triển trong tương lai!");
    };

    const dateRangeOptions = [
        { key: "today", label: "Hôm nay" },
        { key: "week", label: "Tuần này" },
        { key: "month", label: "Tháng này" },
        { key: "semester", label: "Học kỳ" }
    ];

    const statsCards = [
        {
            title: "Tổng học sinh",
            value: stats.activeStudents,
            subtitle: "+3.5% so với tháng trước",
            icon: FiUsers,
            color: PRIMARY,
            subtitleColor: SUCCESS[600]
        },
        {
            title: "Yêu cầu thuốc chờ xử lý",
            value: stats.pendingMedications,
            subtitle: stats.pendingMedications > 0
                ? `${stats.pendingMedications} yêu cầu cần phê duyệt`
                : "Không có yêu cầu",
            icon: FiClock,
            color: WARNING,
            subtitleColor: ERROR[500],
            hasAlert: true
        },
        {
            title: "Kiểm tra sức khỏe sắp tới",
            value: stats.scheduledHealthChecks,
            subtitle: `${stats.completedHealthChecks} đã hoàn thành trong 30 ngày qua`,
            icon: FiCalendar,
            color: SUCCESS,
            subtitleColor: INFO[600]
        },
        {
            title: "Sự kiện y tế hôm nay",
            value: stats.healthEventsToday,
            subtitle: `${stats.upcomingVaccinations} buổi tiêm chủng sắp diễn ra`,
            icon: FiActivity,
            color: SECONDARY,
            subtitleColor: SECONDARY[600]
        }
    ];

    const performanceMetrics = [
        {
            title: "Tỷ lệ tuân thủ thuốc",
            value: stats.medicationAdherence,
            percentage: true,
            color: stats.medicationAdherence > 90 ? SUCCESS[500]
                : stats.medicationAdherence > 75 ? WARNING[500]
                    : ERROR[500]
        },
        {
            title: "Cảnh báo dị ứng",
            value: stats.allergyAlerts,
            width: (stats.allergyAlerts / stats.activeStudents) * 100 * 5,
            color: ERROR[500]
        },
        {
            title: "Mức độ hoàn thành kiểm tra sức khỏe",
            value: 92,
            percentage: true,
            width: 92,
            color: INFO[500]
        }
    ];

    const recentActivities = [
        {
            title: "Yêu cầu thuốc mới",
            description: "Nguyễn Văn A - Paracetamol 500mg - 5 phút trước",
            icon: FiClock,
            bgColor: INFO[100],
            iconColor: INFO[600]
        },
        {
            title: "Hoàn thành kiểm tra sức khỏe",
            description: "Lớp 5A - Kiểm tra định kỳ - 30 phút trước",
            icon: FiCheckCircle,
            bgColor: SUCCESS[100],
            iconColor: SUCCESS[600]
        },
        {
            title: "Người dùng mới đăng ký",
            description: "Trần Thị B (Phụ huynh) - 1 giờ trước",
            icon: FiUsers,
            bgColor: PRIMARY[100],
            iconColor: PRIMARY[600]
        },
        {
            title: "Cảnh báo dị ứng",
            description: "Lê Văn C - Dị ứng hải sản - 2 giờ trước",
            icon: FiAlertCircle,
            bgColor: WARNING[100],
            iconColor: WARNING[600]
        }
    ];

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải dữ liệu dashboard..." />
            </div>
        );
    }

    return (
        <div className="h-full" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                        Tổng quan hệ thống
                    </h1>
                    <p className="mt-2 text-sm sm:text-base" style={{ color: TEXT.SECONDARY }}>
                        Phân tích tổng hợp dữ liệu y tế trường học
                    </p>
                </div>

                {/* Date Range Selector */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {dateRangeOptions.map((period) => (
                            <button
                                key={period.key}
                                onClick={() => handleDateRangeChange(period.key)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md ${dateRange === period.key
                                    ? "text-white shadow-lg"
                                    : "hover:shadow-sm"
                                    }`}
                                style={{
                                    backgroundColor: dateRange === period.key ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                    color: dateRange === period.key ? "white" : TEXT.PRIMARY,
                                    border: `1px solid ${dateRange === period.key ? PRIMARY[500] : BORDER.DEFAULT}`,
                                }}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    {statsCards.map((card, index) => {
                        const IconComponent = card.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm p-6 border-l-4 hover:shadow-md transition-shadow duration-200"
                                style={{
                                    borderLeftColor: card.color[500],
                                    boxShadow: SHADOW.DEFAULT
                                }}
                            >
                                <div className="flex items-center">
                                    <div
                                        className="p-3 rounded-full mr-4"
                                        style={{ backgroundColor: card.color[50] }}
                                    >
                                        <IconComponent className="h-6 w-6" style={{ color: card.color[500] }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: TEXT.SECONDARY }}>
                                            {card.title}
                                        </p>
                                        <p className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                            {card.value}
                                        </p>
                                        <div className="flex items-center text-xs mt-1">
                                            <span className="flex items-center" style={{ color: card.subtitleColor }}>
                                                {card.hasAlert && <FiAlertCircle className="h-3 w-3 mr-1" />}
                                                {card.subtitle}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {/* Health Visits by Category */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Lần thăm khám theo danh mục
                            </h3>
                            <button
                                onClick={handleViewDetails}
                                className="text-sm font-medium hover:underline transition-all duration-200 cursor-pointer"
                                style={{ color: PRIMARY[600] }}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(stats.healthVisitsByCategory).map(([category, count], index) => {
                                const total = Object.values(stats.healthVisitsByCategory).reduce((a, b) => a + b, 0);
                                const percentage = (count / total) * 100;
                                return (
                                    <div key={index}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {category}
                                            </span>
                                            <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                {count}
                                            </span>
                                        </div>
                                        <div className="w-full rounded-full h-2" style={{ backgroundColor: BORDER.DEFAULT }}>
                                            <div
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: PRIMARY[500],
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Medication Dispensed by Type */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Thuốc đã cấp theo loại
                            </h3>
                            <button
                                onClick={handleViewDetails}
                                className="text-sm font-medium hover:underline transition-all duration-200 cursor-pointer"
                                style={{ color: PRIMARY[600] }}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(stats.medicationsByType).map(([type, count], index) => {
                                const total = Object.values(stats.medicationsByType).reduce((a, b) => a + b, 0);
                                const percentage = (count / total) * 100;
                                return (
                                    <div key={index}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {type}
                                            </span>
                                            <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                {count}
                                            </span>
                                        </div>
                                        <div className="w-full rounded-full h-2" style={{ backgroundColor: BORDER.DEFAULT }}>
                                            <div
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: SUCCESS[500],
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Key Performance Metrics */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-base font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                            Chỉ số hiệu suất chính
                        </h3>
                        <div className="space-y-6">
                            {performanceMetrics.map((metric, index) => (
                                <div key={index}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                            {metric.title}
                                        </span>
                                        <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                            {metric.value}{metric.percentage ? '%' : ''}
                                        </span>
                                    </div>
                                    {metric.width !== undefined && (
                                        <div className="w-full rounded-full h-2" style={{ backgroundColor: BORDER.DEFAULT }}>
                                            <div
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: metric.color,
                                                    width: `${metric.width || metric.value}%`
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Tổng thuốc đã cấp
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        {stats.totalMedicationDispensed}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xs flex items-center" style={{ color: SUCCESS[600] }}>
                                        <FiTrendingUp className="h-3 w-3 mr-1" />
                                        Tăng 12% so với tháng trước
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity and System Health */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-base font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                            Hoạt động gần đây
                        </h3>
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => {
                                const IconComponent = activity.icon;
                                return (
                                    <div key={index} className="flex">
                                        <div className="flex-shrink-0">
                                            <div
                                                className="flex items-center justify-center h-8 w-8 rounded-full"
                                                style={{ backgroundColor: activity.bgColor }}
                                            >
                                                <IconComponent className="h-4 w-4" style={{ color: activity.iconColor }} />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <p className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {activity.title}
                                            </p>
                                            <p className="text-xs truncate" style={{ color: TEXT.SECONDARY }}>
                                                {activity.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${BORDER.DEFAULT}` }}>
                            <button
                                onClick={handleViewDetails}
                                className="text-sm font-medium hover:underline transition-all duration-200 cursor-pointer"
                                style={{ color: PRIMARY[600] }}
                            >
                                Xem tất cả hoạt động
                            </button>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                        <h3 className="text-base font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                            Sức khỏe hệ thống
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Mức độ hoàn thiện hồ sơ
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        87%
                                    </span>
                                </div>
                                <div className="w-full rounded-full h-2" style={{ backgroundColor: BORDER.DEFAULT }}>
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{
                                            backgroundColor: INFO[500],
                                            width: "87%"
                                        }}
                                    />
                                </div>
                                <p className="text-xs mt-2" style={{ color: TEXT.SECONDARY }}>
                                    118 học sinh cần cập nhật thông tin y tế
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Trạng thái phê duyệt thuốc
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        32 đang chờ
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className="px-2 py-1 text-xs font-medium rounded-full"
                                        style={{
                                            backgroundColor: SUCCESS[100],
                                            color: SUCCESS[800]
                                        }}
                                    >
                                        458 đã phê duyệt
                                    </span>
                                    <span
                                        className="px-2 py-1 text-xs font-medium rounded-full"
                                        style={{
                                            backgroundColor: WARNING[100],
                                            color: WARNING[800]
                                        }}
                                    >
                                        32 đang chờ
                                    </span>
                                    <span
                                        className="px-2 py-1 text-xs font-medium rounded-full"
                                        style={{
                                            backgroundColor: ERROR[100],
                                            color: ERROR[800]
                                        }}
                                    >
                                        12 từ chối
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Tình trạng tiêm chủng
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: SUCCESS[700] }}>
                                        94% đã tiêm đủ
                                    </span>
                                </div>
                                <div className="w-full rounded-full h-2" style={{ backgroundColor: BORDER.DEFAULT }}>
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{
                                            backgroundColor: SUCCESS[500],
                                            width: "94%"
                                        }}
                                    />
                                </div>
                                <p className="text-xs mt-2" style={{ color: TEXT.SECONDARY }}>
                                    53 học sinh cần cập nhật tiêm chủng
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Tổng quan nhân viên y tế
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-lg font-bold" style={{ color: TEXT.PRIMARY }}>8</p>
                                        <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                            nhân viên hoạt động
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold" style={{ color: TEXT.PRIMARY }}>42h</p>
                                        <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                            thời gian/tuần
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold" style={{ color: SUCCESS[600] }}>98%</p>
                                        <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                            tỷ lệ xử lý
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;