import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiCalendar, FiUsers, FiCheckCircle, FiClock, FiAlertCircle, FiEye, FiRefreshCw, FiXCircle, FiChevronRight, FiChevronLeft, FiMoreVertical, FiCheck, FiX } from "react-icons/fi";
import { PRIMARY, TEXT, BACKGROUND, BORDER, SUCCESS, WARNING, ERROR, GRAY } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import ConfirmActionModal from "../../components/modal/ConfirmActionModal";
import vaccineSessionApi from '../../api/vaccineSessionApi';

const VaccinationListManagement = () => {
    const [vaccinationList, setVaccinationList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ status: '' });
    const [openActionId, setOpenActionId] = useState(null);
    const dropdownRef = useRef(null);
    const [alertConfig, setAlertConfig] = useState({ type: "success", message: "", show: false });
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showConfirmActionModal, setShowConfirmActionModal] = useState(false);
    const [selectedVaccination, setSelectedVaccination] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenActionId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 750);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters.status]);

    useEffect(() => {
        fetchVaccinationSessions();
    }, [currentPage, pageSize, searchTerm, filters.status]);

    const fetchVaccinationSessions = async () => {
        try {
            const data = await vaccineSessionApi.getVaccineSessions({ pageIndex: currentPage, pageSize: 10, searchTerm });
            setVaccinationList(data.data);
            setTotalCount(data.totalCount);
            setTotalPages(data.totalPages);
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            WaitingForParentConsent: { bg: WARNING[50], text: WARNING[700], label: "Chờ PH xác nhận", icon: FiClock },
            Scheduled: { bg: SUCCESS[50], text: SUCCESS[700], label: "Đã lên lịch", icon: FiCalendar },
            Declined: { bg: ERROR[50], text: ERROR[700], label: "Từ chối", icon: FiXCircle },
            Completed: { bg: SUCCESS[50], text: SUCCESS[700], label: "Đã hoàn thành", icon: FiCheckCircle },
            PendingApproval: { bg: WARNING[50], text: WARNING[700], label: "Chờ lên lịch", icon: FiAlertCircle },
        };
        const config = statusConfig[status] || statusConfig.WaitingForParentConsent;
        const Icon = config.icon;

        return (
            <span
                className="px-3 py-1.5 text-sm font-medium rounded-xl inline-flex items-center gap-1.5 transition-all duration-200"
                style={{ backgroundColor: config.bg, color: config.text, boxShadow: `0 2px 4px ${config.bg}` }}
            >
                <Icon className="w-4 h-4" />
                {config.label}
            </span>
        );
    };

    const getStats = () => {
        const upcomingCount = vaccinationList.filter((v) => v.status === "PendingApproval" || v.status === "WaitingForParentConsent").length;
        const completedCount = vaccinationList.filter((v) => v.status === "Scheduled").length;
        const totalStudentsCount = vaccinationList.reduce((sum, v) => sum + (v.totalStudents || 0), 0);
        return { upcoming: upcomingCount, completed: completedCount, totalStudents: totalStudentsCount };
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const resetFilters = () => {
        setFilters({ status: '' });
        setSearchTerm("");
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const showAlert = (type, message) => {
        setAlertConfig({ type, message, show: true });
    };

    const closeModal = () => {
        setShowConfirmModal(false);
        setShowConfirmActionModal(false);
        setSelectedVaccination(null);
    };

    const handleApiAction = async (apiCall, successMessage) => {
        try {
            setLoading(true);
            const result = await apiCall();
            if (result.success) {
                await fetchVaccinationSessions();
                showAlert("success", successMessage);
            } else {
                showAlert("error", result.message || "Không thể thực hiện thao tác.");
            }
        } catch (error) {
            showAlert("error", "Đã xảy ra lỗi khi thực hiện thao tác.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (sessionId) =>
        handleApiAction(() => vaccineSessionApi.approveVaccineSession(sessionId), "Đã duyệt kế hoạch tiêm chủng thành công!");
    const handleReject = (reason) =>
        handleApiAction(() => vaccineSessionApi.declineVaccineSession(selectedVaccination.id, reason), "Đã từ chối kế hoạch tiêm chủng thành công!");
    const handleFinalize = (sessionId) =>
        handleApiAction(() => vaccineSessionApi.finalizeVaccineSession(sessionId), "Đã chốt danh sách thành công!");
    const handleComplete = (sessionId) =>
        handleApiAction(() => vaccineSessionApi.completeVaccineSession(sessionId), "Đã hoàn thành tiêm chủng thành công!");
    const openActionModal = (vaccination, action) => {
        setSelectedVaccination(vaccination);
        setOpenActionId(null);
        if (action === 'reject') {
            setShowConfirmActionModal(true);
        } else {
            setShowConfirmModal(true);
        }
    };

    const renderActionMenu = (vaccination) => {
        const { status } = vaccination;
        const isPending = status === "PendingApproval";
        const isWaiting = status === "WaitingForParentConsent";
        const isScheduled = status === "Scheduled";

        return (
            <div className="relative">
                <button
                    onClick={() => setOpenActionId(openActionId === vaccination.id ? null : vaccination.id)}
                    className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90 hover:shadow-md"
                    style={{ backgroundColor: GRAY[100], color: TEXT.PRIMARY }}
                >
                    <FiMoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>

                {openActionId === vaccination.id && (
                    <div
                        ref={dropdownRef}
                        className="absolute py-2 w-48 bg-white rounded-lg shadow-xl border"
                        style={{ borderColor: BORDER.DEFAULT, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px', zIndex: 50 }}
                    >
                        {isPending && (
                            <>
                                <ActionButton
                                    icon={FiCheck}
                                    text="Duyệt kế hoạch"
                                    color={SUCCESS[600]}
                                    onClick={() => openActionModal(vaccination, 'approve')}
                                />
                                <ActionButton
                                    icon={FiX}
                                    text="Từ chối"
                                    color={ERROR[600]}
                                    onClick={() => openActionModal(vaccination, 'reject')}
                                />
                            </>
                        )}

                        {isWaiting && (
                            <ActionButton
                                icon={FiCheckCircle}
                                text="Chốt danh sách"
                                color={PRIMARY[600]}
                                onClick={() => openActionModal(vaccination, 'finalize')}
                            />
                        )}

                        {isScheduled && (
                            <ActionButton
                                icon={FiCheckCircle}
                                text="Hoàn thành"
                                color={SUCCESS[600]}
                                onClick={() => openActionModal(vaccination, 'complete')}
                            />
                        )}

                        <ActionButton
                            icon={FiEye}
                            text="Xem chi tiết"
                            color={PRIMARY[600]}
                            onClick={() => setOpenActionId(null)}
                            isLink={true}
                            linkTo={`/manager/vaccination/${vaccination.id}`}
                        />
                    </div>
                )}
            </div>
        );
    };

    const getConfirmModalProps = () => {
        const { status } = selectedVaccination || {};
        const modalConfig = {
            PendingApproval: {
                title: "Xác nhận duyệt kế hoạch",
                message: "Bạn có chắc chắn muốn duyệt kế hoạch tiêm chủng này?",
                confirmText: "Duyệt",
                action: () => {
                    closeModal();
                    handleApprove(selectedVaccination?.id);
                }
            },
            WaitingForParentConsent: {
                title: "Xác nhận chốt danh sách",
                message: "Bạn có chắc chắn muốn chốt danh sách cho buổi tiêm chủng này?",
                confirmText: "Chốt danh sách",
                action: () => {
                    closeModal();
                    handleFinalize(selectedVaccination?.id);
                }
            },
            Scheduled: {
                title: "Xác nhận hoàn thành",
                message: "Bạn có chắc chắn muốn đánh dấu buổi tiêm chủng này là đã hoàn thành?",
                confirmText: "Hoàn thành",
                action: () => {
                    closeModal();
                    handleComplete(selectedVaccination?.id);
                }
            }
        };
        return modalConfig[status] || { title: "Xác nhận", message: "Bạn có chắc chắn?", confirmText: "Xác nhận", action: () => { } };
    };

    const filteredVaccinations = vaccinationList.filter(vaccination => {
        const matchesSearch = vaccination.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vaccination.vaccineTypeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filters.status || vaccination.status === filters.status;
        return matchesSearch && matchesStatus;
    });

    const stats = getStats();
    const confirmModalProps = getConfirmModalProps();

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>Quản lý tiêm chủng</h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>Quản lý kế hoạch và lịch tiêm chủng của học sinh</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard title="Kế hoạch sắp tới" value={stats.upcoming} bgColor="#00897B" icon={FiCalendar} />
                    <StatsCard title="Đã chốt danh sách" value={stats.completed} bgColor="#4CAF50" icon={FiCheckCircle} />
                    <StatsCard title="Tổng học sinh" value={stats.totalStudents} bgColor="#FFA726" icon={FiUsers} />
                </div>

                {/* Search and Filters */}
                <div className="rounded-2xl shadow-xl border backdrop-blur-sm mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} debouncedSearchTerm={debouncedSearchTerm} />
                            <FilterControls filters={filters} handleFilterChange={handleFilterChange} resetFilters={resetFilters} />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loading type="medical" size="large" color={PRIMARY[500]} text="Đang tải danh sách tiêm chủng..." />
                    </div>
                ) : (
                    <VaccinationTable
                        filteredVaccinations={filteredVaccinations}
                        getStatusBadge={getStatusBadge}
                        renderActionMenu={renderActionMenu}
                        resetFilters={resetFilters}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalCount={totalCount}
                        paginate={paginate}
                    />
                )}
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={closeModal}
                onConfirm={confirmModalProps.action}
                title={confirmModalProps.title}
                message={confirmModalProps.message}
                confirmText={confirmModalProps.confirmText}
                type="approve"
            />

            <ConfirmActionModal
                isOpen={showConfirmActionModal}
                onClose={closeModal}
                onConfirm={handleReject}
                title="Từ chối kế hoạch"
                message="Vui lòng nhập lý do từ chối kế hoạch tiêm chủng này"
                confirmText="Từ chối"
                type="decline"
            />

            <AlertModal
                isOpen={alertConfig.show}
                type={alertConfig.type}
                message={alertConfig.message}
                onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};

// Helper Components
const StatsCard = ({ title, value, bgColor, icon: Icon }) => (
    <div className="relative overflow-hidden rounded-2xl shadow-lg" style={{ background: bgColor, height: '120px' }}>
        <div className="p-6 relative z-10 h-full flex flex-col justify-between">
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{title}</p>
            <div className="flex items-center justify-between">
                <p className="text-3xl font-bold" style={{ color: 'white' }}>{value}</p>
                <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Icon className="h-6 w-6" style={{ color: 'white' }} />
                </div>
            </div>
        </div>
    </div>
);

const SearchInput = ({ searchTerm, setSearchTerm, debouncedSearchTerm }) => (
    <div className="flex-1">
        <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
            <input
                type="text"
                placeholder="Tìm kiếm kế hoạch tiêm chủng..."
                className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }}
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
);

const FilterControls = ({ filters, handleFilterChange, resetFilters }) => (
    <div className="flex gap-4">
        <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[200px]"
            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
        >
            <option value="">Tất cả trạng thái</option>
            <option value="PendingApproval">Lên kế hoạch</option>
            <option value="WaitingForParentConsent">Sắp diễn ra</option>
            <option value="Scheduled">Đã hoàn thành</option>
        </select>

        <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg flex items-center transition-all duration-300"
            style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}
        >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Đặt lại bộ lọc
        </button>
    </div>
);

const ActionButton = ({ icon: Icon, text, color, onClick, isLink = false, linkTo = "" }) => {
    const buttonContent = (
        <>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{text}</span>
        </>
    );

    const buttonClass = "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150";

    return isLink ? (
        <button className={buttonClass} style={{ color }} onClick={onClick}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <Link to={linkTo}>{text}</Link>
        </button>
    ) : (
        <button onClick={onClick} className={buttonClass} style={{ color }}>
            {buttonContent}
        </button>
    );
};

const VaccinationTable = ({ filteredVaccinations, getStatusBadge, renderActionMenu, resetFilters, totalPages, currentPage, pageSize, totalCount, paginate }) => (
    <div className="rounded-2xl shadow-xl border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
        <div className="overflow-visible">
            <table className="w-full">
                <thead>
                    <tr style={{ backgroundColor: PRIMARY[50] }}>
                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: '250px' }}>
                            Tiêm chủng
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: '150px' }}>
                            Lớp
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: '150px' }}>
                            Ngày tiêm
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: '150px' }}>
                            Trạng thái
                        </th>
                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: '150px' }}>
                            Tham gia
                        </th>
                        <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: '100px' }}>
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                    {filteredVaccinations.length > 0 ? (
                        filteredVaccinations.map((vaccination, index) => (
                            <VaccinationRow
                                key={`${vaccination.id}-${index}`}
                                vaccination={vaccination}
                                index={index}
                                getStatusBadge={getStatusBadge}
                                renderActionMenu={renderActionMenu}
                            />
                        ))
                    ) : (
                        <EmptyState resetFilters={resetFilters} />
                    )}
                </tbody>
            </table>
        </div>

        {totalPages > 0 && (
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalCount={totalCount}
                paginate={paginate}
            />
        )}
    </div>
);

const VaccinationRow = ({ vaccination, index, getStatusBadge, renderActionMenu }) => (
    <tr className="hover:bg-opacity-50 transition-all duration-200 group" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}>
        <td className="py-4 px-6" style={{ width: '250px' }}>
            <div className="flex flex-col">
                <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>{vaccination.sessionName}</span>
                <span className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>{vaccination.vaccineTypeName}</span>
            </div>
        </td>
        <td className="py-4 px-6" style={{ width: '150px' }}>
            <div className="flex flex-wrap gap-1">
                {vaccination.classes.map((classe) => (
                    <span key={classe.id} className="px-2 py-1 text-xs font-medium rounded-lg" style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                        {classe.name}
                    </span>
                ))}
            </div>
        </td>
        <td className="py-4 px-6" style={{ width: '150px' }}>
            <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                {new Date(vaccination.startTime).toLocaleDateString("vi-VN", { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </span>
        </td>
        <td className="py-4 px-6" style={{ width: '150px' }}>
            {getStatusBadge(vaccination.status)}
        </td>
        <td className="py-4 px-6" style={{ width: '150px' }}>

            <div>
                <div className="text-sm font-medium" style={{ color: PRIMARY[600] }}>
                    {vaccination.approvedStudents}/{vaccination.totalStudents}
                </div>
                <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>Đã xác nhận</div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(((vaccination.approvedStudents) / (vaccination.totalStudents)) * 100, 100)}%`, backgroundColor: PRIMARY[500] }}></div>
                </div>
            </div>
        </td>
        <td className="py-4 px-6 text-center overflow-visible" style={{ width: '100px' }}>
            {renderActionMenu(vaccination)}
        </td>
    </tr>
);

const EmptyState = ({ resetFilters }) => (
    <tr>
        <td colSpan="6" className="text-center py-12">
            <div className="flex flex-col items-center justify-center">
                <div className="h-20 w-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: GRAY[100] }}>
                    <FiCalendar className="h-10 w-10" style={{ color: GRAY[400] }} />
                </div>
                <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>Không có kế hoạch tiêm chủng nào</p>
                <p className="mb-4" style={{ color: TEXT.SECONDARY }}>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                <button
                    onClick={resetFilters}
                    className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}
                >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Đặt lại bộ lọc
                </button>
            </div>
        </td>
    </tr>
);

const Pagination = ({ currentPage, totalPages, pageSize, totalCount, paginate }) => (
    <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
        <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
            Hiển thị{" "}
            <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                {((currentPage - 1) * pageSize) + 1}
            </span>{" "}
            -{" "}
            <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-bold" style={{ color: PRIMARY[600] }}>{totalCount}</span>{" "}
            kế hoạch
        </div>

        <div className="flex items-center space-x-2">
            <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    borderColor: currentPage === 1 ? BORDER.DEFAULT : PRIMARY[300],
                    color: currentPage === 1 ? TEXT.SECONDARY : PRIMARY[600],
                    backgroundColor: BACKGROUND.DEFAULT
                }}
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
                style={{
                    borderColor: currentPage === totalPages ? BORDER.DEFAULT : PRIMARY[300],
                    color: currentPage === totalPages ? TEXT.SECONDARY : PRIMARY[600],
                    backgroundColor: BACKGROUND.DEFAULT
                }}
            >
                <FiChevronRight className="h-4 w-4" />
            </button>
        </div>
    </div>
);

export default VaccinationListManagement;