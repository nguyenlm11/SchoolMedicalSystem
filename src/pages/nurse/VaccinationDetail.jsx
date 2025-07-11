import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiCalendar,
    FiClock,
    FiUser,
    FiUsers,
    FiClipboard,
    FiCheckCircle, 
    FiXCircle,
    FiDownload,
    FiMessageCircle,
    FiEdit,
    FiTrash2,
    FiBell,
    FiInfo,
    FiAlertCircle,
    FiSearch,
    FiBookmark,
    FiActivity,
    FiMapPin,
    FiXOctagon,
    FiAlertTriangle,
    FiFilter,
    FiMoreVertical,
    FiEye,
    FiRefreshCw,
    FiUserPlus,
} from "react-icons/fi";
import { PRIMARY, SECONDARY, GRAY, SUCCESS, WARNING, ERROR, TEXT, BACKGROUND, BORDER, SHADOW, COMMON } from "../../constants/colors";
import vaccineSessionApi from '../../api/vaccineSessionApi';
import Loading from "../../components/Loading";
import ConfirmActionModal from "../../components/modal/ConfirmActionModal";
import AssignNurseModal from "../../components/modal/AssignNurseModal";

const VaccinationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [vaccination, setVaccination] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState("all");
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [sortBy, setSortBy] = useState("index");
    const [sortOrder, setSortOrder] = useState("asc");
    const [error, setError] = useState(null);
    const [modalType, setModalType] = useState("approve");
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [studentConsentData, setStudentConsentData] = useState([]);
    const [isAssignNurseModalOpen, setAssignNurseModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(null);
 
    const user = JSON.parse(localStorage.getItem("user"));
    const userRole = user?.role;

    // Fetch details by id 
    useEffect(() => {
        const fetchVaccinationDetails = async () => {
            try {
                setLoading(true);
                const response = await vaccineSessionApi.getVaccineSessionDetails(id);
                setVaccination(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching vaccination details:", err);
                setError("Không thể tải thông tin tiêm chủng.");
                setLoading(false);
            }
        };

        fetchVaccinationDetails();
    }, [id]);

    const handleApprove = async () => {
        try {
            const response = await vaccineSessionApi.approveVaccineSession(id);
            if (response.success) {
                setVaccination({ ...vaccination, status: "WaitingForParentConsent" });
                setConfirmationModal(false);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Không thể duyệt buổi tiêm.");
        }
    };

    useEffect(() => {
        const fetchVaccinationDetails = async () => {
            try {
                setLoading(true);
                const response = await vaccineSessionApi.getVaccineSessionDetails(id);
                const session = response.data;
                setVaccination(session);

                
                const classNurseAssignments = response.data.classNurseAssignments || [];

                if (session?.classIds?.length > 0) {
                    const classConsentResponses = await vaccineSessionApi.getAllClassStudentConsents(id, session.classIds);
                    const validData = classConsentResponses
                        .filter(res => res.success && res.data?.length > 0)
                        .flatMap(res => res.data);

                    // Map nurse assignments to students based on classId
                    const studentsWithNurse = validData.map((item) => {
                        item.students.forEach((student) => {
                            const nurseAssignment = classNurseAssignments.find(assignment => assignment.classId === item.classId);
                            student.classNurseAssignments = nurseAssignment ? nurseAssignment.nurseName : "Chưa có";
                        });
                        return item;
                    });
                    
                    setStudentConsentData(studentsWithNurse);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching vaccination details:", err);
                setError("Không thể tải thông tin tiêm chủng.");
                setLoading(false);
            }
        };

        fetchVaccinationDetails();
    }, [id]);

    const handleDecline = async (reason) => {
        try {
            const response = await vaccineSessionApi.declineVaccineSession(id, reason);
            if (response.success) {
                setVaccination({ ...vaccination, status: "Declined" });
                setConfirmationModal(false);
            } else {
                setError(response.message); 
            }
        } catch (err) {
            setError("Không thể từ chối buổi tiêm.");
        }
    };

    const handleFinalize = async () => {
        try {
            const response = await vaccineSessionApi.finalizeVaccineSession(id);
            if (response.success) {
                setVaccination({ ...vaccination, status: "Scheduled" });
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Không thể chốt danh sách buổi tiêm.");
        }
    };

    const handleComplete = async () => {
        try {
            const response = await vaccineSessionApi.completeVaccineSession(id);
            if (response.success) {
                setVaccination({ ...vaccination, status: "Completed" });
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Không thể xác nhận hoàn thành.");
        }
    };

    if (loading) {
        return (
        <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <Loading type="medical" size="large" color="primary" text="Đang tải thông tin..." />
        </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: ERROR[600] }}>{error}</h3>
                    <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                    >
                    <FiArrowLeft className="mr-2" />
                    Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const isAssigned = (classId) => {
        return vaccination?.classNurseAssignments.some((assignment) => assignment.classId === classId);
    };
    
    // Modal control
    const handleOpenConfirmModal = (actionType) => {
        if (actionType === "approve") {
            setModalType("approve");
            setModalTitle("Duyệt buổi tiêm");
            setModalMessage("Bạn có chắc chắn muốn duyệt buổi tiêm này?");
        } else if (actionType === "decline") {
            setModalType("decline");
            setModalTitle("Từ chối buổi tiêm");
            setModalMessage("Bạn có chắc chắn muốn từ chối buổi tiêm này?");
        } else if (actionType === "finalize") {
            setModalType("finalize");
            setModalTitle("Chốt danh sách");
            setModalMessage("Bạn có chắc chắn muốn chốt danh sách buổi tiêm này?");
        } else if (actionType === "complete") {
            setModalType("complete");
            setModalTitle("Xác nhận hoàn thành");
            setModalMessage("Bạn có chắc chắn muốn đánh dấu buổi tiêm này là đã hoàn thành?");
        }
        setConfirmationModal(true);
    };
    
    const getStatusBadge = (status) => {
        switch (status) {
            case "PendingApproval":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Lên kế hoạch
                    </span>
                );
            case "WaitingForParentConsent":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Chờ xác nhận
                    </span>
                );
            case "Scheduled":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Đã lên lịch
                    </span>
                );
            case "Declined":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Từ chối
                    </span>
                );
            case "Completed":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-green-800">
                        Đã hoàn thành
                    </span>
                );
            default:
                return null;
        }
    };

    const ConsentStatusBadge = ({ status }) => {
        let bgColor, text;

        switch (status) {
            case "Confirm":
                bgColor = SUCCESS[500];
                text = "Đã xác nhận";
                break;
            case "Declined":
                bgColor = ERROR[500];
                text = "Từ chối";
                break;
            case "Pending":
            default:
                bgColor = WARNING[500];
                text = "Chưa phản hồi";
                break;
        }

        return (
            <div
                className="px-3 py-1 rounded-full inline-flex items-center"
                style={{
                    backgroundColor: bgColor,
                    color: COMMON.WHITE
                }}
            >
                <span className="text-sm font-medium">{text}</span>
            </div>
        );
    };

    const VaccinationStatusBadge = ({ status }) => {
        let bgColor, text;

        switch (status) {
            case "Completed":
                bgColor = PRIMARY[600];
                text = "Đã tiêm";
                break;
            case "InProgress":
            default:
                bgColor = GRAY[400];
                text = "Chưa tiêm";
                break;
        }

        return (
            <div
                className="px-3 py-1 rounded-full inline-flex items-center"
                style={{
                    backgroundColor: bgColor,
                    color: COMMON.WHITE
                }}
            >
                <span className="text-sm font-medium">{text}</span>
            </div>
        );
    };

    const handleDeleteVaccination = () => {
        // In a real app, this would be an API call
        // and you'd show a confirmation dialog
        navigate("/nurse/vaccination");
    };

    const handleMarkAsCompleted = () => {
        // In a real app, this would be an API call
        setVaccination({ ...vaccination, status: "completed" });
        // Display a success message or notification
    };

    const filteredStudents = studentConsentData
        .filter(item => selectedClass === "all" || item.classId === selectedClass)
        .flatMap(item =>
            item.students.map(student => ({
                ...student,
                classId: item.classId,
                className: item.className
            }))
        )
        .filter(student =>
            student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const uniqueClasses = studentConsentData.map(item => ({
        id: item.classId,
        name: item.className
    }));

    const handleAssignNurse = (classId) => {
        setSelectedClassId(classId);
        setAssignNurseModalOpen(true);
    };

    const handleNurseAssigned = (assignedNurseData) => {
        const updatedClassAssignments = vaccination.classNurseAssignments.map(assignment => 
            assignment.classId === selectedClassId 
                ? { ...assignment, nurseName: assignedNurseData.nurseName } 
                : assignment
        );
        setVaccination(prevVaccination => ({
            ...prevVaccination,
            classNurseAssignments: updatedClassAssignments
        }));
    };


    const ActionMenu = ({ student }) => {
        const [isOpen, setIsOpen] = useState(false);
        const menuRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (menuRef.current && !menuRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90 hover:shadow-md"
                    style={{
                        backgroundColor: GRAY[100],
                        color: TEXT.PRIMARY
                    }}
                >
                    <FiMoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>

                {isOpen && (
                    <div
                        className="absolute py-2 w-48 bg-white rounded-lg shadow-xl border"
                        style={{
                            borderColor: BORDER.DEFAULT,
                            right: '100%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            marginRight: '8px',
                            zIndex: 50
                        }}
                    >
                        {/* Xem chi tiết – CHO MANAGER & SCHOOLNURSE */}
                        {(userRole === 'manager' || userRole === 'schoolnurse') && (
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    console.log("Xem chi tiết");
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                style={{ color: PRIMARY[600] }}
                            >
                                <FiEye className="w-4 h-4 flex-shrink-0" />
                                <span>Xem chi tiết</span>
                            </button>
                        )}

                        {/* Các nút dưới chỉ dành cho SCHOOLNURSE */}
                        {userRole === 'schoolnurse' && (
                            <>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        console.log("Tiến hành tiêm");
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                    style={{ color: SUCCESS[600] }}
                                >
                                    <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>Tiến hành tiêm</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        console.log("Chưa tiêm");
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                    style={{ color: ERROR[600] }}
                                >
                                    <FiXCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>Chưa tiêm</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const handleSort = (key) => {
        if (key === sortBy) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedClass("all");
        setSortBy("index");
        setSortOrder("asc");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: PRIMARY[500] }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-8" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            {/* Header Bar */}
            <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10" style={{ borderColor: BORDER.DEFAULT }}>
                <div className="max-w-[1920px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-xl transition-all duration-200 hover:bg-primary-50"
                                style={{ color: PRIMARY[600] }}
                            >
                                <FiArrowLeft className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    Chi tiết tiêm chủng
                                </h1>
                                <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                    {vaccination.sessionName}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-4"> 
                            {/* Phân quyền cho nút "Chỉnh sửa" và "Phân công" */}
                            {userRole === "schoolnurse" && (
                                <Link
                                    to={`/schoolnurse/vaccination/${id}/edit`}
                                    className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:opacity-90"
                                    style={{
                                        backgroundColor: PRIMARY[500],
                                        color: TEXT.INVERSE,
                                        border: `1px solid ${PRIMARY[600]}`
                                    }}
                                >
                                    <FiEdit className="h-4 w-4 mr-2" />
                                    Chỉnh sửa
                                </Link>
                            )}
                            {userRole === "manager" && (
                                <>
                                    {/* Phân công NVYT cho các lớp chưa có nhân viên y tế */}
                                    {vaccination?.classIds.map((classId) => (
                                        <div key={classId}>
                                            {!isAssigned(classId) && (
                                                <button
                                                    onClick={() => setAssignNurseModalOpen(true)}
                                                    className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:opacity-90"
                                                    style={{
                                                        backgroundColor: PRIMARY[500],
                                                        color: TEXT.INVERSE,
                                                        border: `1px solid ${PRIMARY[600]}`,
                                                    }}
                                                >
                                                    <FiUserPlus className="w-4 h-4 mr-2" />
                                                    Phân công
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {vaccination.status === "PendingApproval" && (
                                        <>
                                            <button
                                                onClick={() => handleOpenConfirmModal("approve")}
                                                className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:opacity-90"
                                                style={{
                                                    backgroundColor: SUCCESS[500],
                                                    color: TEXT.INVERSE,
                                                    border: `1px solid ${SUCCESS[600]}`
                                                }}
                                            >
                                                Duyệt
                                            </button>
                                            <button
                                                onClick={() => handleOpenConfirmModal("decline")}
                                                className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:opacity-90"
                                                style={{
                                                    backgroundColor: ERROR[500],
                                                    color: TEXT.INVERSE,
                                                    border: `1px solid ${ERROR[600]}`
                                                }}
                                            >
                                                Từ chối
                                            </button>
                                        </>
                                    )}
                                    {vaccination.status === "WaitingForParentConsent" && (
                                        <button
                                            onClick={() => handleOpenConfirmModal("finalize")}
                                            className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:opacity-90"
                                            style={{
                                                backgroundColor: SUCCESS[500],
                                                color: TEXT.INVERSE,
                                                border: `1px solid ${SUCCESS[600]}`
                                            }}
                                        >
                                            Chốt danh sách
                                        </button>
                                    )}
                                    {vaccination.status === "Scheduled" && (
                                        <button
                                            onClick={() => handleOpenConfirmModal("complete")}
                                            className="inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:opacity-90"
                                            style={{
                                                backgroundColor: SUCCESS[500],
                                                color: TEXT.INVERSE,
                                                border: `1px solid ${SUCCESS[600]}`
                                            }}
                                        >
                                            Xác nhận hoàn thành
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1920px] mx-auto px-6 py-8">
                {/* Vaccination Header Card */}
                <div
                    className="bg-white rounded-2xl shadow-xl border backdrop-blur-sm mb-8"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: BORDER.LIGHT,
                        boxShadow: `0 4px 6px -1px ${SHADOW.LIGHT}, 0 2px 4px -1px ${SHADOW.DEFAULT}`
                    }}
                >
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: PRIMARY[50] }}
                                >
                                    <FiClipboard className="h-6 w-6" style={{ color: PRIMARY[500] }} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {vaccination.sessionName}
                                    </h2>
                                    {/* <p className="mt-1" style={{ color: TEXT.SECONDARY }}>
                                        {vaccination.description}
                                    </p> */}
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-3">
                                {getStatusBadge(vaccination.status)}
                                <div className="flex items-center text-sm" style={{ color: TEXT.SECONDARY }}>
                                    <FiCalendar className="mr-2 h-4 w-4" />
                                    {new Date(vaccination.startTime).toLocaleDateString("vi-VN")}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard
                                icon={<FiCalendar />}
                                title="Kế hoạch sắp tới"
                                value="3"
                                bgColor="#0D9488"
                            />
                            <StatCard
                                icon={<FiCheckCircle />}
                                title="Đã hoàn thành"
                                value="1"
                                bgColor="#22C55E"
                            />
                            <StatCard
                                icon={<FiUsers />}
                                title="Tổng học sinh"
                                value="267"
                                bgColor="#F59E0B"
                            />
                        </div>
                    </div> */}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Vaccination Information */}
                    <div
                        className="bg-white rounded-2xl shadow-lg border overflow-hidden"
                        style={{
                            borderColor: BORDER.DEFAULT,
                            boxShadow: `0 4px 6px -1px ${SHADOW.LIGHT}, 0 2px 4px -1px ${SHADOW.DEFAULT}`
                        }}
                    >
                        <div
                            className="px-6 py-4 border-b flex items-center"
                            style={{
                                background: `linear-gradient(135deg, ${PRIMARY[50]} 0%, ${PRIMARY[100]} 100%)`,
                                borderColor: PRIMARY[200]
                            }}
                        >
                            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${PRIMARY[500]}20` }}>
                                <FiInfo className="h-6 w-6" style={{ color: PRIMARY[700] }} />
                            </div>
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Thông tin tiêm chủng
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                                    style={{
                                        backgroundColor: `${PRIMARY[50]}50`,
                                        borderColor: PRIMARY[200]
                                    }}
                                >
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${PRIMARY[500]}15` }}>
                                            <FiBookmark className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Loại vắc-xin và phương pháp
                                            </p>
                                            <p className="text-lg font-semibold mt-1" style={{ color: PRIMARY[700] }}>
                                                {vaccination.vaccineTypeName}
                                            </p>
                                            {/* <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                Phương pháp: {vaccination.vaccinationMethod}
                                            </p> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                                    style={{
                                        backgroundColor: `${PRIMARY[50]}50`,
                                        borderColor: PRIMARY[200]
                                    }}
                                >
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${PRIMARY[500]}15` }}>
                                            <FiMapPin className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Địa điểm và thời gian
                                            </p>
                                            <p className="text-lg font-semibold mt-1" style={{ color: PRIMARY[700] }}>
                                                {vaccination.location}
                                            </p>
                                            <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                Thời gian: {new Date(vaccination.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} - {new Date(vaccination.endTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                                    style={{
                                        backgroundColor: `${PRIMARY[50]}50`,
                                        borderColor: PRIMARY[200]
                                    }}
                                >
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${PRIMARY[500]}15` }}>
                                            <FiUser className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Đơn vị thực hiện
                                            </p>
                                            <p className="text-lg font-semibold mt-1" style={{ color: PRIMARY[700] }}>
                                                {vaccination.responsibleOrganizationName}
                                            </p>
                                            <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                Đơn vị y tế được cấp phép
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div
                        className="bg-white rounded-2xl shadow-lg border overflow-hidden"
                        style={{
                            borderColor: BORDER.DEFAULT,
                            boxShadow: `0 4px 6px -1px ${SHADOW.LIGHT}, 0 2px 4px -1px ${SHADOW.DEFAULT}`
                        }}
                    >
                        <div
                            className="px-6 py-4 border-b flex items-center"
                            style={{
                                background: `linear-gradient(135deg, ${WARNING[50]} 0%, ${WARNING[100]} 100%)`,
                                borderColor: WARNING[200]
                            }}
                        >
                            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${WARNING[500]}20` }}>
                                <FiAlertCircle className="h-6 w-6" style={{ color: WARNING[700] }} />
                            </div>
                            <h2 className="text-xl font-semibold" style={{ color: WARNING[700] }}>
                                Lưu ý quan trọng
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                                    style={{
                                        backgroundColor: `${WARNING[50]}50`,
                                        borderColor: WARNING[200]
                                    }}
                                >
                                    <div className="flex items-center mb-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${WARNING[500]}15` }}>
                                            <FiAlertTriangle className="h-5 w-5" style={{ color: WARNING[600] }} />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Tác dụng phụ có thể xảy ra
                                            </p>
                                            <p className="text-lg font-semibold mt-1" style={{ color: WARNING[700] }}>
                                                {vaccination.sideEffect}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                                    style={{
                                        backgroundColor: `${ERROR[50]}50`,
                                        borderColor: ERROR[200]
                                    }}
                                >
                                    <div className="flex items-center mb-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${ERROR[500]}15` }}>
                                            <FiXOctagon className="h-5 w-5" style={{ color: ERROR[600] }} />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Chống chỉ định
                                            </p>
                                            <p className="text-lg font-semibold mt-1" style={{ color: ERROR[700] }}>
                                                {vaccination.contraindication}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                                    style={{
                                        backgroundColor: `${PRIMARY[50]}50`,
                                        borderColor: PRIMARY[200]
                                    }}
                                >
                                    <div className="flex items-center mb-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${PRIMARY[500]}15` }}>
                                            <FiMessageCircle className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Ghi chú bổ sung
                                            </p>
                                            <p className="text-lg font-semibold mt-1" style={{ color: PRIMARY[700] }}>
                                                {vaccination.notes}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div
                    className="bg-white rounded-2xl shadow-xl border backdrop-blur-sm"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: BORDER.LIGHT,
                        boxShadow: `0 4px 6px -1px ${SHADOW.LIGHT}, 0 2px 4px -1px ${SHADOW.DEFAULT}`
                    }}
                >
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Danh sách học sinh
                            </h3>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setSelectedClass("all")}
                                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                    style={{
                                        backgroundColor: selectedClass === "all" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                        color: selectedClass === "all" ? TEXT.INVERSE : TEXT.PRIMARY,
                                        border: `1px solid ${selectedClass === "all" ? PRIMARY[500] : BORDER.DEFAULT}`
                                    }}
                                >
                                    Tất cả
                                </button>

                                {uniqueClasses.map(({ id, name }) => (
                                    <button
                                        key={id}
                                        onClick={() => setSelectedClass(id)}
                                        className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200`}
                                        style={{
                                            backgroundColor: selectedClass === id ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                            color: selectedClass === id ? TEXT.INVERSE : TEXT.PRIMARY,
                                            border: `1px solid ${selectedClass === id ? PRIMARY[500] : BORDER.DEFAULT}`
                                        }}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        color: TEXT.PRIMARY,
                                        focusRingColor: `${PRIMARY[500]}40`
                                    }}
                                    placeholder="Tìm kiếm học sinh..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* <div className="flex items-center justify-between text-sm" style={{ color: TEXT.SECONDARY }}>
                                <span>
                                    Hiển thị {filteredStudents.length} học sinh {selectedClass !== "all" ? `của lớp ${selectedClass}` : ""}
                                </span>
                                <span>
                                    Tổng số: {vaccination?.students.length || 0} học sinh
                                </span>
                            </div> */}
                        </div>
                    </div>

                    {/* Student List Table */}
                    <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{
                                        backgroundColor: PRIMARY[50],
                                        borderBottom: `2px solid ${PRIMARY[200]}`
                                    }}>
                                        {[
                                            { key: "index", label: "STT", width: "80px" },
                                            { key: "name", label: "Họ và tên", width: "250px" },
                                            { key: "class", label: "Lớp", width: "120px" },
                                            { key: "parentConfirmed", label: "Xác nhận PH", width: "150px" },
                                            { key: "vaccinated", label: "Trạng thái", width: "150px" },
                                            { key: "classNurseAssignments", label: "Phân công NVYT", width: "150px" },
                                            { key: "action", label: "Thao tác", width: "100px" }
                                        ].map((col, idx) => (
                                            <th
                                                key={idx}
                                                className={`py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider ${col.key !== 'action' && col.key !== 'index' ? 'cursor-pointer hover:bg-primary-100' : ''
                                                    } transition-all duration-200`}
                                                style={{
                                                    color: PRIMARY[700],
                                                    width: col.width,
                                                    position: 'relative'
                                                }}
                                                onClick={col.key !== 'action' && col.key !== 'index' ? () => handleSort(col.key) : undefined}
                                            >
                                                <div className="flex items-center">
                                                    {col.label}
                                                    {col.key !== 'action' && col.key !== 'index' && sortBy === col.key && (
                                                        <span className="ml-2 text-xs" style={{ color: PRIMARY[500] }}>
                                                            {sortOrder === "asc" ? "↑" : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                                {idx !== 5 && (
                                                    <div
                                                        className="absolute right-0 top-1/2 -translate-y-1/2"
                                                        style={{
                                                            width: '1px',
                                                            height: '20px',
                                                            backgroundColor: PRIMARY[200]
                                                        }}
                                                    />
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, index) => (
                                            <tr key={`${student.classId}-${student.studentId}-${index}`} className="hover:bg-primary-50 transition-all duration-200">
                                                <td className="py-4 px-6">{index + 1}</td>
                                                <td className="py-4 px-6">{student.studentName}</td>
                                                <td className="py-4 px-6">
                                                    {student.className || "Không xác định"}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <ConsentStatusBadge status={student.status} />
                                                </td>
                                                <td className="py-4 px-6">
                                                    <VaccinationStatusBadge status={student.vaccinationStatus} />
                                                </td>
                                                <td className="py-4 px-6">
                                                    {student.classNurseAssignments ? student.classNurseAssignments : "Chưa có"}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <ActionMenu student={student} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div
                                                        className="h-20 w-20 rounded-full flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: GRAY[100] }}
                                                    >
                                                        <FiUsers className="h-10 w-10" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        Không có học sinh nào phù hợp
                                                    </p>
                                                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                                                    </p>
                                                    <button
                                                        onClick={resetFilters}
                                                        className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                                                    >
                                                        <FiRefreshCw className="mr-2 h-4 w-4" />
                                                        Đặt lại bộ lọc
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Nurse Modal */}
            <AssignNurseModal
                isOpen={isAssignNurseModalOpen}
                onClose={() => setAssignNurseModalOpen(false)}
                sessionId={id}
                classId={selectedClassId}
                onNurseAssigned={handleNurseAssigned}
            />

            {/* Confirm Action Modal */}
            <ConfirmActionModal
                isOpen={confirmationModal}
                onClose={() => setConfirmationModal(false)}
                onConfirm={modalType === "approve" ? handleApprove : modalType === "decline" ? handleDecline : modalType === "finalize" ? handleFinalize : handleComplete}
                title={modalTitle}
                message={modalMessage}
                type={modalType}
                confirmText={modalType === "approve" ? "Duyệt" : modalType === "decline" ? "Từ chối" : modalType === "finalize" ? "Chốt" : "Hoàn thành"}
            />
        </div>
    );
};

// Component cho thống kê
const StatCard = ({ icon, title, value, bgColor }) => (
    <div
        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
        style={{
            background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor} 100%)`,
            borderColor: 'rgba(255, 255, 255, 0.2)'
        }}
    >
        <div className="p-6 relative z-10">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                        {title}
                    </p>
                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                        {value}
                    </p>
                </div>
                <div
                    className="h-16 w-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                    {React.cloneElement(icon, { className: "h-8 w-8", style: { color: TEXT.INVERSE } })}
                </div>
            </div>
        </div>
    </div>
);

// Component cho các mục thông tin
// const InfoItem = ({ icon, label, value, color }) => (
//     <div className="flex items-start">
//         <div
//             className="p-2 rounded-lg mr-4 mt-1"
//             style={{ backgroundColor: `${color[500]}10` }}
//         >
//             {React.cloneElement(icon, {
//                 className: "h-5 w-5",
//                 style: { color: color[600] }
//             })}
//         </div>
//         <div className="flex-1">
//             <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>
//                 {label}
//             </p>
//             <p className="text-base" style={{ color: TEXT.PRIMARY }}>
//                 {value}
//             </p>
//         </div>
//     </div>
// );

// Component cho badge trạng thái
const StatusBadge = ({ status, textTrue, textFalse, colorTrue, colorFalse }) => {
    const color = status ? colorTrue : colorFalse;
    return (
        <div
            className="px-3 py-1 rounded-full inline-flex items-center"
            style={{
                backgroundColor: color[500],
                color: COMMON.WHITE
            }}
        >
            <span className="text-sm font-medium">
                {status ? textTrue : textFalse}
            </span>
        </div>
    );
};

// Component cho modal
const Modal = ({ title, children, onClose, onConfirm, confirmText, confirmColor }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
            style={{
                boxShadow: `0 25px 50px -12px ${SHADOW.MEDIUM}`
            }}
        >
            <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                {title}
            </h3>
            <div className="mb-6">{children}</div>
            <div className="flex justify-end space-x-4">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl font-medium border transition-colors duration-200"
                    style={{
                        backgroundColor: BACKGROUND.DEFAULT,
                        color: TEXT.PRIMARY,
                        borderColor: BORDER.DEFAULT
                    }}
                >
                    Hủy
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                    style={{
                        background: `linear-gradient(135deg, ${confirmColor[500]} 0%, ${confirmColor[600]} 100%)`,
                        color: TEXT.INVERSE
                    }}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);

export default VaccinationDetail;