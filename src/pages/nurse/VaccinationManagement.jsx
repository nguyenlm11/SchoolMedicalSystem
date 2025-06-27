import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiCalendar, FiUsers, FiCheckCircle, FiClock, FiAlertTriangle, FiBell, FiCheck, FiRefreshCw } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";

const VaccinationManagement = () => {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [vaccinationList, setVaccinationList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setTimeout(() => {
            setVaccinationList([
                {
                    id: 1,
                    title: "Tiêm vắc-xin cúm mùa",
                    scheduledDate: "2023-07-15",
                    status: "upcoming",
                    grades: ["1A", "1B", "1C"],
                    totalStudents: 75,
                    confirmedParents: 68,
                    vaccineInfo: "Vắc-xin cúm mùa 2023",
                    description: "Tiêm phòng cúm mùa cho học sinh khối lớp 1",
                },
                {
                    id: 2,
                    title: "Tiêm nhắc vắc-xin MMR",
                    scheduledDate: "2023-06-30",
                    status: "upcoming",
                    grades: ["5A", "5B"],
                    totalStudents: 52,
                    confirmedParents: 45,
                    vaccineInfo: "Vắc-xin MMR (Sởi - Quai bị - Rubella)",
                    description: "Tiêm nhắc mũi 2 vắc-xin MMR cho học sinh khối lớp 5",
                },
                {
                    id: 3,
                    title: "Tiêm vắc-xin Viêm gan B",
                    scheduledDate: "2023-05-20",
                    status: "completed",
                    grades: ["3A", "3B", "3C"],
                    totalStudents: 80,
                    vaccinatedStudents: 76,
                    vaccineInfo: "Vắc-xin Viêm gan B",
                    description: "Tiêm nhắc vắc-xin Viêm gan B cho học sinh khối lớp 3",
                },
                {
                    id: 4,
                    title: "Tiêm phòng HPV",
                    scheduledDate: "2023-08-10",
                    status: "planning",
                    grades: ["7A", "7B"],
                    totalStudents: 60,
                    confirmedParents: 10,
                    vaccineInfo: "Vắc-xin HPV",
                    description: "Tiêm phòng HPV cho học sinh nữ lớp 7 (tự nguyện)",
                },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case "planning":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                        <FiClock className="mr-1.5 h-4 w-4" />
                        Lên kế hoạch
                    </span>
                );
            case "upcoming":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                        Sắp diễn ra
                    </span>
                );
            case "completed":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                        <FiCheckCircle className="mr-1.5 h-4 w-4" />
                        Đã hoàn thành
                    </span>
                );
            case "cancelled":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                        Đã hủy
                    </span>
                );
            default:
                return null;
        }
    };

    const filteredVaccinations = vaccinationList.filter(
        (vaccination) =>
            (activeTab === "all" || vaccination.status === activeTab) &&
            (vaccination.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vaccination.vaccineInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vaccination.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vaccination.grades.some((grade) =>
                    grade.toLowerCase().includes(searchTerm.toLowerCase())
                ))
    );

    const getStats = () => {
        const today = new Date();
        const upcomingCount = vaccinationList.filter(
            (v) => v.status === "upcoming" || v.status === "planning"
        ).length;
        const completedCount = vaccinationList.filter(
            (v) => v.status === "completed"
        ).length;
        const thisMonthCount = vaccinationList.filter((v) => {
            const vacDate = new Date(v.scheduledDate);
            return (
                vacDate.getMonth() === today.getMonth() &&
                vacDate.getFullYear() === today.getFullYear()
            );
        }).length;
        const totalStudentsCount = vaccinationList.reduce(
            (sum, v) => sum + v.totalStudents,
            0
        );
        return {
            upcoming: upcomingCount,
            completed: completedCount,
            thisMonth: thisMonthCount,
            totalStudents: totalStudentsCount,
        };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách tiêm chủng..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>Quản lý tiêm chủng</h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Quản lý kế hoạch và lịch tiêm chủng của học sinh
                            </p>
                        </div>
                        <Link
                            to="/schoolnurse/vaccination/create"
                            className="px-4 py-2 rounded-xl flex items-center transition-all duration-300 hover:opacity-80"
                            style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                        >
                            <FiPlus className="mr-2 h-5 w-5" />
                            Tạo buổi tiêm chủng
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                            borderColor: PRIMARY[200]
                        }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Kế hoạch sắp tới
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.upcoming}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiCalendar className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${SUCCESS[400]} 0%, ${SUCCESS[500]} 100%)`,
                            borderColor: SUCCESS[200]
                        }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Đã hoàn thành
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.completed}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiCheckCircle className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${WARNING[400]} 0%, ${WARNING[500]} 100%)`,
                            borderColor: WARNING[200]
                        }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Tổng học sinh
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.totalStudents}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUsers className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl shadow-xl border backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên, lớp..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab("upcoming")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: activeTab === "upcoming" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: activeTab === "upcoming" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${activeTab === "upcoming" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    <FiCalendar className="mr-2 h-4 w-4" />
                                    Sắp diễn ra
                                </button>

                                <button
                                    onClick={() => setActiveTab("planning")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: activeTab === "planning" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: activeTab === "planning" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${activeTab === "planning" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    <FiClock className="mr-2 h-4 w-4" />
                                    Lên kế hoạch
                                </button>

                                <button
                                    onClick={() => setActiveTab("completed")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: activeTab === "completed" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: activeTab === "completed" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${activeTab === "completed" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    <FiCheckCircle className="mr-2 h-4 w-4" />
                                    Đã hoàn thành
                                </button>

                                <button
                                    onClick={() => setActiveTab("all")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: activeTab === "all" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: activeTab === "all" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${activeTab === "all" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    <FiRefreshCw className="mr-2 h-4 w-4" />
                                    Tất cả
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: GRAY[50] }}>
                                    <th className="py-4 px-6 text-left text-sm font-semibold" style={{ color: TEXT.SECONDARY }}>
                                        Tiêm chủng
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold" style={{ color: TEXT.SECONDARY }}>
                                        Lớp
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold" style={{ color: TEXT.SECONDARY }}>
                                        Ngày tiêm
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold" style={{ color: TEXT.SECONDARY }}>
                                        Trạng thái
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold" style={{ color: TEXT.SECONDARY }}>
                                        Tham gia
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold" style={{ color: TEXT.SECONDARY }}>
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: BORDER.LIGHT }}>
                                {filteredVaccinations.map((vaccination, index) => (
                                    <tr
                                        key={vaccination.id}
                                        className="hover:bg-opacity-50 transition-all duration-200"
                                        style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {vaccination.title}
                                            </div>
                                            <div className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                {vaccination.vaccineInfo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm" style={{ color: TEXT.PRIMARY }}>
                                                {vaccination.grades.join(", ")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm" style={{ color: TEXT.PRIMARY }}>
                                                {new Date(vaccination.scheduledDate).toLocaleDateString("vi-VN")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(vaccination.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center">
                                                <div className="text-sm mb-2" style={{ color: TEXT.PRIMARY }}>
                                                    {vaccination.status === "completed"
                                                        ? `${vaccination.vaccinatedStudents}/${vaccination.totalStudents}`
                                                        : `${vaccination.confirmedParents}/${vaccination.totalStudents}`}
                                                </div>
                                                {vaccination.status !== "completed" && (
                                                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: PRIMARY[100] }}>
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${Math.round(
                                                                    (vaccination.confirmedParents / vaccination.totalStudents) * 100
                                                                )}%`,
                                                                background: `linear-gradient(90deg, ${PRIMARY[400]} 0%, ${PRIMARY[500]} 100%)`
                                                            }}
                                                        ></div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center space-x-2">
                                                <Link
                                                    to={`/schoolnurse/vaccination/${vaccination.id}`}
                                                    className="px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center transition-all duration-200 hover:opacity-80"
                                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                                >
                                                    Chi tiết
                                                </Link>
                                                {vaccination.status === "planning" && (
                                                    <button
                                                        className="px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center transition-all duration-200 hover:opacity-80"
                                                        style={{ backgroundColor: WARNING[500], color: TEXT.INVERSE }}
                                                    >
                                                        <FiBell className="mr-1.5 h-4 w-4" />
                                                        Thông báo
                                                    </button>
                                                )}
                                                {vaccination.status === "upcoming" && (
                                                    <button
                                                        className="px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center transition-all duration-200 hover:opacity-80"
                                                        style={{ backgroundColor: SUCCESS[500], color: TEXT.INVERSE }}
                                                    >
                                                        <FiCheck className="mr-1.5 h-4 w-4" />
                                                        Hoàn thành
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaccinationManagement;