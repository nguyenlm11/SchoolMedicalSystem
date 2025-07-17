import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    FiArrowLeft,
    FiUser,
    FiPackage,
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle,
    FiX,
    FiFileText,
    FiActivity,
    FiInfo,
    FiShield,
    FiUserCheck,
    FiFilter
} from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import ConfirmActionModal from "../../components/modal/ConfirmActionModal";
import medicationRequestApi from "../../api/medicationRequestApi";
import { useAuth } from "../../utils/AuthContext";

const MedicationRequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [medicationRequest, setMedicationRequest] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalAction, setApprovalAction] = useState(""); // "approve" or "reject"
    const [alertInfo, setAlertInfo] = useState({ type: "", message: "" });

    // Determine user role based on URL path
    const isParent = location.pathname.includes('/parent/');
    const isNurse = location.pathname.includes('/schoolnurse/');

    // Status badge configurations
    const STATUS_CONFIG = {
        PendingApproval: {
            icon: FiClock,
            label: "Chờ duyệt",
            bgColor: WARNING[50],
            textColor: WARNING[700]
        },
        Approved: {
            icon: FiCheckCircle,
            label: "Đã duyệt",
            bgColor: SUCCESS[50],
            textColor: SUCCESS[700]
        },
        Rejected: {
            icon: FiX,
            label: "Từ chối",
            bgColor: ERROR[50],
            textColor: ERROR[700]
        },
        Active: {
            icon: FiActivity,
            label: "Đang hoạt động",
            bgColor: PRIMARY[50],
            textColor: PRIMARY[700]
        },
        Completed: {
            icon: FiCheckCircle,
            label: "Đã hoàn thành",
            bgColor: INFO[50],
            textColor: INFO[700]
        },
        Discontinued: {
            icon: FiAlertTriangle,
            label: "Đã ngừng",
            bgColor: GRAY[50],
            textColor: GRAY[700]
        }
    };

    // Priority badge configurations
    const PRIORITY_CONFIG = {
        Critical: {
            label: "Khẩn cấp",
            bgColor: ERROR[50],
            textColor: ERROR[700]
        },
        High: {
            label: "Cao",
            bgColor: WARNING[50],
            textColor: WARNING[700]
        },
        Normal: {
            label: "Bình thường",
            bgColor: PRIMARY[50],
            textColor: PRIMARY[700]
        },
        Low: {
            label: "Thấp",
            bgColor: SUCCESS[50],
            textColor: SUCCESS[700]
        }
    };

    useEffect(() => {
        const fetchDetail = async () => {
            if (isParent && !user?.id) {
                setShowAlert(true);
                setAlertInfo({ type: "error", message: "Không tìm thấy thông tin người dùng" });
                return;
            }

            setLoading(true);
            try {
                const response = await medicationRequestApi.getMedicationRequestDetail(id);
                if (response.success) {
                    // Check access permission for parent
                    if (isParent && response.data.parentId !== user.id) {
                        setMedicationRequest(null);
                        setShowAlert(true);
                        setAlertInfo({ type: "error", message: "Bạn không có quyền xem yêu cầu thuốc này" });
                        return;
                    }
                    setMedicationRequest(response.data);
                } else {
                    setMedicationRequest(null);
                    setShowAlert(true);
                    setAlertInfo({ type: "error", message: response.message || "Không thể tải chi tiết yêu cầu thuốc" });
                }
            } catch (error) {
                setMedicationRequest(null);
                setShowAlert(true);
                setAlertInfo({ type: "error", message: "Không thể tải chi tiết yêu cầu thuốc" });
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id, user?.id, isParent]);

    const handleApproveClick = () => {
        setApprovalAction("approve");
        setShowApprovalModal(true);
    };

    const handleRejectClick = () => {
        setApprovalAction("reject");
        setShowApprovalModal(true);
    };

    const handleApprove = async (notes = "") => {
        try {
            const response = await medicationRequestApi.approveMedicationRequest(id, {
                isApproved: true,
                notes: notes
            });

            if (response.success) {
                // Refresh the medication request data
                const detailResponse = await medicationRequestApi.getMedicationRequestDetail(id);
                if (detailResponse.success) {
                    setMedicationRequest(detailResponse.data);
                }

                setShowApprovalModal(false);
                setShowAlert(true);
                setAlertInfo({ type: "success", message: response.message || "Đã duyệt yêu cầu thuốc thành công" });
            } else {
                setShowAlert(true);
                setAlertInfo({ type: "error", message: response.message || "Không thể duyệt yêu cầu thuốc" });
            }
        } catch (error) {
            setShowAlert(true);
            setAlertInfo({ type: "error", message: "Không thể duyệt yêu cầu thuốc" });
        }
    };

    const handleReject = async (rejectionReason = "") => {
        try {
            const response = await medicationRequestApi.rejectMedicationRequest(id, {
                rejectionReason: rejectionReason,
                notes: ""
            });

            if (response.success) {
                // Refresh the medication request data
                const detailResponse = await medicationRequestApi.getMedicationRequestDetail(id);
                if (detailResponse.success) {
                    setMedicationRequest(detailResponse.data);
                }

                setShowApprovalModal(false);
                setShowAlert(true);
                setAlertInfo({ type: "success", message: response.message || "Đã từ chối yêu cầu thuốc" });
            } else {
                setShowAlert(true);
                setAlertInfo({ type: "error", message: response.message || "Không thể từ chối yêu cầu thuốc" });
            }
        } catch (error) {
            setShowAlert(true);
            setAlertInfo({ type: "error", message: "Không thể từ chối yêu cầu thuốc" });
        }
    };

    const handleDelete = async () => {
        try {
            const response = await medicationRequestApi.deleteMedicationRequest(id);

            if (response.success) {
                setShowDeleteModal(false);
                setShowAlert(true);
                setAlertInfo({ type: "success", message: response.message || "Đã xóa yêu cầu thuốc thành công" });

                // Navigate back to list after a short delay
                setTimeout(() => {
                    if (isParent) {
                        navigate('/parent/medication-requests');
                    } else {
                        navigate('/schoolnurse/medication-requests');
                    }
                }, 1500);
            } else {
                setShowDeleteModal(false);
                setShowAlert(true);
                setAlertInfo({ type: "error", message: response.message || "Không thể xóa yêu cầu thuốc" });
            }
        } catch (error) {
            setShowDeleteModal(false);
            setShowAlert(true);
            setAlertInfo({ type: "error", message: "Không thể xóa yêu cầu thuốc" });
        }
    };

    const getStatusBadge = (status) => {
        const config = STATUS_CONFIG[status];
        if (!config) return null;

        const IconComponent = config.icon;
        return (
            <span
                className="px-4 py-2 inline-flex items-center text-sm font-medium rounded-lg"
                style={{ backgroundColor: config.bgColor, color: config.textColor }}
            >
                <IconComponent className="mr-2 h-4 w-4" />
                {config.label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const config = PRIORITY_CONFIG[priority];
        if (!config) return null;

        return (
            <span
                className="px-3 py-1 text-sm font-medium rounded-md"
                style={{ backgroundColor: config.bgColor, color: config.textColor }}
            >
                {config.label}
            </span>
        );
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return (
            <div className="flex items-center space-x-2">
                <span>{dateStr}</span>
                <span style={{ color: GRAY[400] }}>|</span>
                <span>{timeStr}</span>
            </div>
        );
    };

    const renderInfoItem = (label, value, icon = null, isCentered = false, isLargeNumber = false) => (
        <div className={`flex flex-col space-y-2 ${isCentered ? 'text-center' : ''}`}>
            <div className={`flex items-center ${isCentered ? 'justify-center' : ''} space-x-2`}>
                {icon && <span style={{ color: GRAY[400] }}>{icon}</span>}
                <label className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                    {label}
                </label>
            </div>
            <div
                className={`text-base ${isLargeNumber ? 'text-2xl font-bold' : ''}`}
                style={{ color: TEXT.PRIMARY }}
            >
                {value || 'Không có thông tin'}
            </div>
        </div>
    );

    const InfoItem = ({ label, value, icon, badge, error, className = '', important = false }) => (
        <div
            className={`bg-white p-5 rounded-xl border ${className}`}
            style={{
                borderColor: error ? ERROR[200] : important ? PRIMARY[200] : BORDER.DEFAULT,
                backgroundColor: important ? PRIMARY[50] : 'white'
            }}
        >
            <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[100] }}>
                    {React.cloneElement(icon, { style: { color: PRIMARY[600] } })}
                </div>
                <label className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                    {label}
                </label>
            </div>
            <div className="flex items-center mt-1">
                <span className="text-lg font-medium" style={{ color: error ? ERROR[700] : TEXT.PRIMARY }}>
                    {value}
                </span>
                {badge && <div className="ml-3">{badge}</div>}
            </div>
        </div>
    );

    const StudentInfoCard = ({ studentName, studentCode, parentName }) => (
        <div className="bg-white rounded-2xl shadow-md border p-8 flex flex-col items-center mb-8" style={{ borderColor: BORDER.LIGHT }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg mb-4" style={{ backgroundColor: SUCCESS[100] }}>
                <FiUser className="h-12 w-12" style={{ color: SUCCESS[600] }} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: TEXT.PRIMARY }}>
                {studentName}
            </h2>
            <div
                className="inline-flex items-center px-4 py-1 rounded-full text-base font-semibold mb-4"
                style={{ backgroundColor: SUCCESS[100], color: SUCCESS[700] }}
            >
                {studentCode}
            </div>
            <div className="flex flex-col items-center space-y-1">
                <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                    Phụ huynh
                </span>
                <span className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                    {parentName}
                </span>
            </div>
        </div>
    );

    const MedicationCard = ({ medication }) => (
        <div className="p-6 border rounded-lg" style={{ backgroundColor: PRIMARY[25], borderColor: BORDER.DEFAULT }}>
            <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-lg font-semibold flex items-center" style={{ color: TEXT.PRIMARY }}>
                        <FiFilter className="mr-3 h-5 w-5" /> {medication.medicationName}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {renderInfoItem("Liều lượng", `${medication.dosage}`, null, true, true)}
                    {renderInfoItem("Số lượng", `${medication.quantitySent}`, null, true, true)}
                    {renderInfoItem("Tần suất", `${medication.frequency} lần/ngày`, null, true, true)}
                    {renderInfoItem("Hạn sử dụng", new Date(medication.expiryDate).toLocaleDateString("vi-VN"), null, true, true)}
                </div>

                {medication.timesOfDay && medication.timesOfDay.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold mb-2 text-blue-800">Thời gian uống:</h4>
                        <div className="flex flex-wrap gap-2">
                            {medication.timesOfDay.map((time, timeIndex) => (
                                <span
                                    key={timeIndex}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                >
                                    {time}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {medication.specialNotes && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold mb-2 text-yellow-800">Ghi chú đặc biệt:</h4>
                        <p className="text-sm text-yellow-700">{medication.specialNotes}</p>
                    </div>
                )}

                {medication.instructions && medication.instructions !== "Không có hướng dẫn" && (
                    <div className="bg-white p-4 rounded-lg border" style={{ borderColor: BORDER.DEFAULT }}>
                        <h4 className="font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>Hướng dẫn sử dụng:</h4>
                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>{medication.instructions}</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải chi tiết yêu cầu thuốc..." />
            </div>
        );
    }

    if (!medicationRequest) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <FiPackage className="mx-auto h-16 w-16 mb-4" style={{ color: GRAY[400] }} />
                    <h3 className="text-xl font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                        Không tìm thấy yêu cầu thuốc
                    </h3>
                    <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                        Yêu cầu thuốc bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                    >
                        <FiArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="w-full">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                style={{ backgroundColor: BACKGROUND.DEFAULT, border: `1px solid ${BORDER.DEFAULT}` }}
                            >
                                <FiArrowLeft className="h-5 w-5" style={{ color: TEXT.PRIMARY }} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold" style={{ color: PRIMARY[700] }}>
                                    Chi tiết yêu cầu thuốc
                                </h1>
                                <p className="text-base mt-1" style={{ color: TEXT.SECONDARY }}>
                                    Mã yêu cầu: {medicationRequest.code}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {getStatusBadge(medicationRequest.status)}

                            {medicationRequest.status === "PendingApproval" && isNurse && (
                                <>
                                    <button
                                        onClick={handleApproveClick}
                                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center"
                                        style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                                    >
                                        <FiCheckCircle className="mr-2 h-4 w-4" />
                                        Duyệt
                                    </button>
                                    <button
                                        onClick={handleRejectClick}
                                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center"
                                        style={{ backgroundColor: ERROR[500], color: 'white' }}
                                    >
                                        <FiX className="mr-2 h-4 w-4" />
                                        Từ chối
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-full" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b flex items-center" style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiFileText className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Thông tin cơ bản
                            </h2>
                        </div>

                        <div className="p-8 flex-1">
                            <div className="pb-8 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                <h3 className="text-lg font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                    <FiUser className="mr-3 h-5 w-5" style={{ color: PRIMARY[500] }} />
                                    Thông tin học sinh
                                </h3>
                                <StudentInfoCard
                                    studentName={medicationRequest.studentName}
                                    studentCode={medicationRequest.studentCode}
                                    parentName={medicationRequest.parentName}
                                />
                            </div>

                            <div className="pb-8 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                <h3 className="text-lg font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                    <FiFileText className="mr-3 h-5 w-5" style={{ color: PRIMARY[500] }} />
                                    Thông tin yêu cầu
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoItem
                                        label="Ngày gửi yêu cầu"
                                        value={formatDateTime(medicationRequest.submittedAt)}
                                        icon={<FiCalendar className="h-5 w-5" />}
                                        important={true}
                                    />

                                    <InfoItem
                                        label="Độ ưu tiên"
                                        value={getPriorityBadge(medicationRequest.priorityDisplayName)}
                                        icon={<FiShield className="h-5 w-5" />}
                                        important={true}
                                    />

                                    {medicationRequest.approvedAt && (
                                        <InfoItem
                                            label="Ngày duyệt"
                                            value={formatDateTime(medicationRequest.approvedAt)}
                                            icon={<FiClock className="h-5 w-5" />}
                                        />
                                    )}

                                    {medicationRequest.approvedByName && (
                                        <InfoItem
                                            label="Người duyệt"
                                            value={medicationRequest.approvedByName}
                                            icon={<FiUserCheck className="h-5 w-5" />}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medications Card */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b flex items-center" style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiPackage className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Thuốc đã yêu cầu ({medicationRequest.medications.length})
                            </h2>
                        </div>

                        <div className="p-8">
                            {medicationRequest.medications.length === 0 ? (
                                <div className="flex items-center justify-center" style={{ height: '540px' }}>
                                    <div className="text-center" style={{ color: TEXT.SECONDARY }}>
                                        <FiPackage className="h-16 w-16 mx-auto mb-4" style={{ color: GRAY[300] }} />
                                        <p className="text-lg font-medium">Không có thuốc nào được yêu cầu</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {medicationRequest.medications.map((medication) => (
                                        <MedicationCard key={medication.id} medication={medication} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AlertModal
                isOpen={showAlert}
                type={alertInfo.type}
                title={alertInfo.type === "success" ? "Thành công" : "Lỗi"}
                message={alertInfo.message}
                onClose={() => setShowAlert(false)}
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Xóa yêu cầu thuốc"
                message="Bạn có chắc chắn muốn xóa yêu cầu thuốc này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDelete}
                onClose={() => setShowDeleteModal(false)}
            />

            {/* Approval Modal */}
            <ConfirmActionModal
                isOpen={showApprovalModal}
                onClose={() => setShowApprovalModal(false)}
                onConfirm={approvalAction === "approve" ? handleApprove : handleReject}
                title={approvalAction === "approve" ? "Duyệt yêu cầu thuốc" : "Từ chối yêu cầu thuốc"}
                message={approvalAction === "approve"
                    ? "Bạn có chắc chắn muốn duyệt yêu cầu thuốc này? Hành động này sẽ cập nhật trạng thái yêu cầu thành 'Đã duyệt'."
                    : "Bạn có chắc chắn muốn từ chối yêu cầu thuốc này? Hành động này sẽ cập nhật trạng thái yêu cầu thành 'Từ chối'."
                }
                type={approvalAction === "approve" ? "approve" : "reject"}
                confirmText={approvalAction === "approve" ? "Duyệt" : "Từ chối"}
                cancelText="Hủy"
            />
        </div>
    );
};

export default MedicationRequestDetail;
