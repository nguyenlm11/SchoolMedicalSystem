import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiCalendar, FiCheckCircle, FiClock, FiAlertTriangle, FiEye, FiTrash2, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, WARNING, INFO, ERROR } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import vaccineSessionApi from "../../api/vaccineSessionApi";
import vaccineApi from "../../api/vaccineApi";

const VaccinationManagement = () => {
    const [activeTab, setActiveTab] = useState("planning");
    const [allData, setAllData] = useState([]);
    const [vaccinationList, setVaccinationList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [stats, setStats] = useState({ planning: 0, upcoming: 0, scheduled: 0, completed: 0 });

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [selectedItemName, setSelectedItemName] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
    };

    const confirmDelete = (id, name) => {
        setSelectedItemId(id);
        setSelectedItemName(name);
        setShowConfirmModal(true);
    };

    const handleDelete = async () => {
        if (!selectedItemId) return;
        try {
            setDeleteLoading(true);
            const response = await vaccineApi.deleteVaccinationSession(selectedItemId);
            if (response.success) {
                showAlert("success", "Thành công", "Đã xóa buổi tiêm chủng thành công!");
                setShowConfirmModal(false);
                const remainingItems = vaccinationList.length - 1;
                if (remainingItems === 0 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                await fetchVaccinationSessions();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể xóa buổi tiêm chủng. Vui lòng thử lại.");
            }
        } catch (error) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa buổi tiêm chủng. Vui lòng thử lại.");
        } finally {
            setDeleteLoading(false);
            setSelectedItemId(null);
            setSelectedItemName("");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 800);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    useEffect(() => {
        filterAndPaginateData();
    }, [activeTab, currentPage, allData]);

    useEffect(() => {
        fetchVaccinationSessions();
    }, [debouncedSearchTerm]);

    const fetchVaccinationSessions = async () => {
        try {
            setLoading(true);
            const params = { pageIndex: 1, pageSize: 1000, orderBy: "startTime" };
            if (debouncedSearchTerm) {
                params.searchTerm = debouncedSearchTerm;
            }
            const response = await vaccineSessionApi.getVaccineSessions(params);
            if (response.success) {
                setAllData(response.data);
                const planning = response.data.filter(v => v.status === 'PendingApproval').length;
                const upcoming = response.data.filter(v => v.status === 'WaitingForParentConsent').length;
                const scheduled = response.data.filter(v => v.status === 'Scheduled').length;
                const completed = response.data.filter(v => v.status === 'Completed').length;
                setStats({ planning, upcoming, scheduled, completed });
            } else {
                setAllData([]);
                setStats({ planning: 0, upcoming: 0, scheduled: 0, completed: 0 });
            }
        } catch (error) {
            setAllData([]);
            setStats({ planning: 0, upcoming: 0, scheduled: 0, completed: 0 });
        } finally {
            setLoading(false);
        }
    };

    const filterAndPaginateData = () => {
        let filteredData = allData;
        const statusMap = {
            'planning': 'PendingApproval',
            'upcoming': 'WaitingForParentConsent',
            'scheduled': 'Scheduled',
            'completed': 'Completed'
        };
        filteredData = allData.filter(item => item.status === statusMap[activeTab]);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        setVaccinationList(paginatedData);
        setTotalCount(filteredData.length);
        setTotalPages(Math.ceil(filteredData.length / pageSize));
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "PendingApproval":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                        <FiClock className="mr-1.5 h-4 w-4" />
                        Lên kế hoạch
                    </span>
                );
            case "WaitingForParentConsent":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                        Chờ phụ huynh
                    </span>
                );
            case "Scheduled":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: INFO[50], color: INFO[700] }}>
                        <FiCalendar className="mr-1.5 h-4 w-4" />
                        Đã lên lịch
                    </span>
                );
            case "Completed":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                        <FiCheckCircle className="mr-1.5 h-4 w-4" />
                        Đã hoàn thành
                    </span>
                );
            case "Declined":
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
                        Đã bị từ chối
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách vật tư..." />
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${WARNING[500]} 0%, ${WARNING[600]} 100%)`, borderColor: WARNING[200] }}>
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>Lên kế hoạch</p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>{stats.planning}</p>
                                </div>
                                <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                    <FiClock className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, borderColor: PRIMARY[200] }}>
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>Chờ phụ huynh</p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>{stats.upcoming}</p>
                                </div>
                                <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                    <FiCalendar className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${INFO[400]} 0%, ${INFO[500]} 100%)`, borderColor: INFO[200] }}>
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>Đã lên lịch</p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>{stats.scheduled}</p>
                                </div>
                                <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                    <FiCalendar className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${SUCCESS[400]} 0%, ${SUCCESS[500]} 100%)`, borderColor: SUCCESS[200] }}>
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>Đã hoàn thành</p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>{stats.completed}</p>
                                </div>
                                <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                    <FiCheckCircle className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl shadow-xl border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên buổi tiêm chủng..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm !== debouncedSearchTerm && (
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: PRIMARY[500] }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {[
                                    { key: "planning", label: "Lên kế hoạch", icon: FiClock },
                                    { key: "upcoming", label: "Chờ phụ huynh", icon: FiCalendar },
                                    { key: "scheduled", label: "Đã lên lịch", icon: FiCheckCircle },
                                    { key: "completed", label: "Đã hoàn thành", icon: FiCheckCircle }
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className="px-4 py-2 rounded-lg flex items-center transition-all duration-200"
                                        style={{
                                            backgroundColor: activeTab === tab.key ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                            color: activeTab === tab.key ? TEXT.INVERSE : TEXT.PRIMARY,
                                            border: `1px solid ${activeTab === tab.key ? PRIMARY[500] : BORDER.DEFAULT}`
                                        }}
                                    >
                                        <tab.icon className="mr-2 h-4 w-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden relative">
                        {deleteLoading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                <Loading type="spinner" size="medium" color="primary" text="Đang xóa..." />
                            </div>
                        )}
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: PRIMARY[50] }}>
                                    {[
                                        "Tiêm chủng",
                                        "Lớp",
                                        "Ngày tiêm",
                                        "Trạng thái",
                                        "Tham gia",
                                        "Thao tác"
                                    ].map((header, idx) => (
                                        <th key={idx} className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {vaccinationList.length > 0 ? (
                                    vaccinationList.map((vaccination, index) => (
                                        <tr key={vaccination.id} className="hover:bg-opacity-50 transition-all duration-200 group"
                                            style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>{vaccination.sessionName || "Buổi tiêm chủng"}</span>
                                                    <span className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>{vaccination.vaccineTypeName || "Không xác định"}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {(vaccination.classes || []).map((cls, idx) => (
                                                        <span key={idx} className="px-2 py-1 text-xs font-medium rounded-lg" style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                                                            {cls.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {new Date(vaccination.startTime).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                                {vaccination.startTime && vaccination.endTime && (
                                                    <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                        {new Date(vaccination.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                                        -
                                                        {new Date(vaccination.endTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(vaccination.status)}
                                            </td>
                                            <td className="py-4 px-6">
                                                {vaccination.status === "Completed" ? (
                                                    <div>
                                                        <div className="text-sm font-medium" style={{ color: SUCCESS[600] }}>
                                                            {vaccination.vaccinatedCount || vaccination.completedCount || 0}/{vaccination.totalStudents || 0}
                                                        </div>
                                                        <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>Đã hoàn thành</div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="text-sm font-medium" style={{ color: PRIMARY[600] }}>
                                                            {vaccination.confirmedCount || vaccination.parentConfirmationCount || 0}/{vaccination.totalStudents || 0}
                                                        </div>
                                                        <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>Đã xác nhận</div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(((vaccination.confirmedCount || 0) / (vaccination.totalStudents || 1)) * 100, 100)}%`, backgroundColor: PRIMARY[500] }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <Link to={`/schoolnurse/vaccination/${vaccination.id}`} className="text-blue-500 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50">
                                                        <FiEye className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(vaccination.id, vaccination.sessionName)}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={deleteLoading}
                                                        title="Xóa buổi tiêm chủng"
                                                    >
                                                        {deleteLoading && selectedItemId === vaccination.id ? (
                                                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <FiTrash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center">
                                                <FiCalendar className="mx-auto h-12 w-12 mb-4" style={{ color: GRAY[400] }} />
                                                <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>Không có buổi tiêm chủng nào</h3>
                                                <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                                                    {searchTerm ? "Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm." : "Chưa có buổi tiêm chủng nào được tạo."}
                                                </p>
                                                {!searchTerm && (
                                                    <Link to="/schoolnurse/vaccination/create" className="inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}>
                                                        <FiPlus className="mr-2 h-4 w-4" />
                                                        Tạo buổi tiêm chủng đầu tiên
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 0 && (
                        <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                            <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                Hiển thị{" "}
                                <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                    {totalCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}
                                </span>{" "}
                                -{" "}
                                <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                    {Math.min(currentPage * pageSize, totalCount)}
                                </span>{" "}
                                trong tổng số{" "}
                                <span className="font-bold" style={{ color: PRIMARY[600] }}>{totalCount}</span>{" "}
                                buổi tiêm chủng
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ borderColor: currentPage === 1 ? BORDER.DEFAULT : PRIMARY[300], color: currentPage === 1 ? TEXT.SECONDARY : PRIMARY[600], }}
                                >
                                    <FiChevronLeft className="h-4 w-4" />
                                </button>

                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => paginate(pageNumber)}
                                            className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                                            style={{
                                                borderColor: currentPage === pageNumber ? PRIMARY[500] : BORDER.DEFAULT,
                                                backgroundColor: currentPage === pageNumber ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                                color: currentPage === pageNumber ? TEXT.INVERSE : TEXT.PRIMARY
                                            }}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ borderColor: currentPage === totalPages ? BORDER.DEFAULT : PRIMARY[300], color: currentPage === totalPages ? TEXT.SECONDARY : PRIMARY[600], backgroundColor: BACKGROUND.DEFAULT }}
                                >
                                    <FiChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => { if (!deleteLoading) { setShowConfirmModal(false); setSelectedItemId(null); setSelectedItemName("") } }}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa buổi tiêm chủng ${selectedItemName}?`}
                confirmText="Xóa"
                cancelText="Hủy"
                type="error"
                isLoading={deleteLoading}
            />

            <AlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
};

export default VaccinationManagement;