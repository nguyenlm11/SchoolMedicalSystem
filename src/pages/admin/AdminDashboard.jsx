import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FiUsers,
    FiActivity,
    FiCalendar,
    FiTrendingUp,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
} from "react-icons/fi";
import { PRIMARY, SECONDARY, GRAY, SUCCESS, WARNING, ERROR, INFO, BACKGROUND, TEXT, BORDER, SHADOW } from "../../constants/colors";

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
    });

    const [dateRange, setDateRange] = useState("week");
    const [loading, setLoading] = useState(true);

    // Mock data - in a real application, this would come from an API
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
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
                    Khác: 15,
                },
                medicationsByType: {
                    "Kháng sinh": 28,
                    "Giảm đau": 35,
                    "Hạ sốt": 42,
                    Vitamin: 22,
                    "Thuốc dị ứng": 18,
                    Khác: 10,
                },
            });
            setLoading(false);
        }, 1000);
    }, [dateRange]);

    const handleDateRangeChange = (range) => {
        setDateRange(range);
        // In a real app, this would fetch new data based on the selected range
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                        {[
                            { key: "today", label: "Hôm nay" },
                            { key: "week", label: "Tuần này" },
                            { key: "month", label: "Tháng này" },
                            { key: "semester", label: "Học kỳ" }
                        ].map((period) => (
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

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: PRIMARY[500] }}></div>
                    </div>
                ) : (
                    <>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                            <div
                                className="bg-white rounded-xl shadow-sm p-6 border-l-4 hover:shadow-md transition-shadow duration-200"
                                style={{
                                    borderLeftColor: PRIMARY[500],
                                    boxShadow: SHADOW.DEFAULT
                                }}
                            >
                                <div className="flex items-center">
                                    <div
                                        className="p-3 rounded-full mr-4"
                                        style={{ backgroundColor: PRIMARY[50] }}
                                    >
                                        <FiUsers className="h-6 w-6" style={{ color: PRIMARY[500] }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: TEXT.SECONDARY }}>
                                            Tổng học sinh
                                        </p>
                                        <p className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                            {stats.activeStudents}
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: SUCCESS[600] }}>
                                            +3.5% so với tháng trước
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-white rounded-xl shadow-sm p-6 border-l-4 hover:shadow-md transition-shadow duration-200"
                                style={{
                                    borderLeftColor: WARNING[500],
                                    boxShadow: SHADOW.DEFAULT
                                }}
                            >
                                <div className="flex items-center">
                                    <div
                                        className="p-3 rounded-full mr-4"
                                        style={{ backgroundColor: WARNING[50] }}
                                    >
                                        <FiClock className="h-6 w-6" style={{ color: WARNING[500] }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: TEXT.SECONDARY }}>
                                            Yêu cầu thuốc chờ xử lý
                                        </p>
                                        <p className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                            {stats.pendingMedications}
                                        </p>
                                        <div className="flex items-center text-xs mt-1">
                                            <span className="flex items-center" style={{ color: ERROR[500] }}>
                                                <FiAlertCircle className="h-3 w-3 mr-1" />
                                                {stats.pendingMedications > 0
                                                    ? `${stats.pendingMedications} yêu cầu cần phê duyệt`
                                                    : "Không có yêu cầu"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-white rounded-xl shadow-sm p-6 border-l-4 hover:shadow-md transition-shadow duration-200"
                                style={{
                                    borderLeftColor: SUCCESS[500],
                                    boxShadow: SHADOW.DEFAULT
                                }}
                            >
                                <div className="flex items-center">
                                    <div
                                        className="p-3 rounded-full mr-4"
                                        style={{ backgroundColor: SUCCESS[50] }}
                                    >
                                        <FiCalendar className="h-6 w-6" style={{ color: SUCCESS[500] }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: TEXT.SECONDARY }}>
                                            Kiểm tra sức khỏe sắp tới
                                        </p>
                                        <p className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                            {stats.scheduledHealthChecks}
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: INFO[600] }}>
                                            {stats.completedHealthChecks} đã hoàn thành trong 30 ngày qua
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-white rounded-xl shadow-sm p-6 border-l-4 hover:shadow-md transition-shadow duration-200"
                                style={{
                                    borderLeftColor: SECONDARY[500],
                                    boxShadow: SHADOW.DEFAULT
                                }}
                            >
                                <div className="flex items-center">
                                    <div
                                        className="p-3 rounded-full mr-4"
                                        style={{ backgroundColor: SECONDARY[50] }}
                                    >
                                        <FiActivity className="h-6 w-6" style={{ color: SECONDARY[500] }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: TEXT.SECONDARY }}>
                                            Sự kiện y tế hôm nay
                                        </p>
                                        <p className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                            {stats.healthEventsToday}
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: SECONDARY[600] }}>
                                            {stats.upcomingVaccinations} buổi tiêm chủng sắp diễn ra
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* More Detailed Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                            {/* Health Visits by Category */}
                            <div
                                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                                style={{ boxShadow: SHADOW.DEFAULT }}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        Lần thăm khám theo danh mục
                                    </h3>
                                    <Link
                                        to="/admin/reports"
                                        className="text-sm font-medium hover:underline transition-all duration-200"
                                        style={{ color: PRIMARY[600] }}
                                    >
                                        Xem chi tiết
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(stats.healthVisitsByCategory).map(
                                        ([category, count], index) => (
                                            <div key={index}>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {category}
                                                    </span>
                                                    <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                        {count}
                                                    </span>
                                                </div>
                                                <div className="w-full rounded-full h-2" style={{ backgroundColor: GRAY[200] }}>
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            backgroundColor: PRIMARY[500],
                                                            width: `${(count /
                                                                Object.values(
                                                                    stats.healthVisitsByCategory
                                                                ).reduce((a, b) => a + b, 0)) *
                                                                100
                                                                }%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Medication Dispensed by Type */}
                            <div
                                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                                style={{ boxShadow: SHADOW.DEFAULT }}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        Thuốc đã cấp theo loại
                                    </h3>
                                    <Link
                                        to="/admin/reports"
                                        className="text-sm font-medium hover:underline transition-all duration-200"
                                        style={{ color: PRIMARY[600] }}
                                    >
                                        Xem chi tiết
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(stats.medicationsByType).map(
                                        ([type, count], index) => (
                                            <div key={index}>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {type}
                                                    </span>
                                                    <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                        {count}
                                                    </span>
                                                </div>
                                                <div className="w-full rounded-full h-2" style={{ backgroundColor: GRAY[200] }}>
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            backgroundColor: SUCCESS[500],
                                                            width: `${(count /
                                                                Object.values(stats.medicationsByType).reduce(
                                                                    (a, b) => a + b,
                                                                    0
                                                                )) *
                                                                100
                                                                }%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Key Performance Metrics */}
                            <div
                                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                                style={{ boxShadow: SHADOW.DEFAULT }}
                            >
                                <h3 className="text-base font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                                    Chỉ số hiệu suất chính
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                Tỷ lệ tuân thủ thuốc
                                            </span>
                                            <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                {stats.medicationAdherence}%
                                            </span>
                                        </div>
                                        <div className="w-full rounded-full h-2" style={{ backgroundColor: GRAY[200] }}>
                                            <div
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: stats.medicationAdherence > 90
                                                        ? SUCCESS[500]
                                                        : stats.medicationAdherence > 75
                                                            ? WARNING[500]
                                                            : ERROR[500],
                                                    width: `${stats.medicationAdherence}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                Cảnh báo dị ứng
                                            </span>
                                            <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                {stats.allergyAlerts}
                                            </span>
                                        </div>
                                        <div className="w-full rounded-full h-2" style={{ backgroundColor: GRAY[200] }}>
                                            <div
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: ERROR[500],
                                                    width: `${(stats.allergyAlerts / stats.activeStudents) * 100 * 5}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

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

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                Mức độ hoàn thành kiểm tra sức khỏe
                                            </span>
                                            <span className="text-sm font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                92%
                                            </span>
                                        </div>
                                        <div className="w-full rounded-full h-2" style={{ backgroundColor: GRAY[200] }}>
                                            <div
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: INFO[500],
                                                    width: "92%"
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity and Alerts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Recent Activity */}
                            <div
                                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                                style={{ boxShadow: SHADOW.DEFAULT }}
                            >
                                <h3 className="text-base font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                                    Hoạt động gần đây
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div
                                                className="flex items-center justify-center h-8 w-8 rounded-full"
                                                style={{ backgroundColor: INFO[100] }}
                                            >
                                                <FiClock className="h-4 w-4" style={{ color: INFO[600] }} />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <p className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                Yêu cầu thuốc mới
                                            </p>
                                            <p className="text-xs truncate" style={{ color: TEXT.SECONDARY }}>
                                                Nguyễn Văn A - Paracetamol 500mg - 5 phút trước
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div
                                                className="flex items-center justify-center h-8 w-8 rounded-full"
                                                style={{ backgroundColor: SUCCESS[100] }}
                                            >
                                                <FiCheckCircle className="h-4 w-4" style={{ color: SUCCESS[600] }} />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <p className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                Hoàn thành kiểm tra sức khỏe
                                            </p>
                                            <p className="text-xs truncate" style={{ color: TEXT.SECONDARY }}>
                                                Lớp 5A - Kiểm tra định kỳ - 30 phút trước
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div
                                                className="flex items-center justify-center h-8 w-8 rounded-full"
                                                style={{ backgroundColor: PRIMARY[100] }}
                                            >
                                                <FiUsers className="h-4 w-4" style={{ color: PRIMARY[600] }} />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <p className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                Người dùng mới đăng ký
                                            </p>
                                            <p className="text-xs truncate" style={{ color: TEXT.SECONDARY }}>
                                                Trần Thị B (Phụ huynh) - 1 giờ trước
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div
                                                className="flex items-center justify-center h-8 w-8 rounded-full"
                                                style={{ backgroundColor: WARNING[100] }}
                                            >
                                                <FiAlertCircle className="h-4 w-4" style={{ color: WARNING[600] }} />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <p className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                Cảnh báo dị ứng
                                            </p>
                                            <p className="text-xs truncate" style={{ color: TEXT.SECONDARY }}>
                                                Lê Văn C - Dị ứng hải sản - 2 giờ trước
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${BORDER.DEFAULT}` }}>
                                    <Link
                                        to="/admin/reports"
                                        className="text-sm font-medium hover:underline transition-all duration-200"
                                        style={{ color: PRIMARY[600] }}
                                    >
                                        Xem tất cả hoạt động
                                    </Link>
                                </div>
                            </div>

                            {/* System Health */}
                            <div
                                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                                style={{ boxShadow: SHADOW.DEFAULT }}
                            >
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
                                        <div className="w-full rounded-full h-2" style={{ backgroundColor: GRAY[200] }}>
                                            <div
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: INFO[500],
                                                    width: "87%"
                                                }}
                                            ></div>
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
                                        <div className="w-full rounded-full h-2" style={{ backgroundColor: GRAY[200] }}>
                                            <div
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: SUCCESS[500],
                                                    width: "94%"
                                                }}
                                            ></div>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;