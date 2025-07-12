import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiPackage, FiCalendar, FiClock, FiCheckCircle, FiAlertTriangle, FiX, FiEdit, FiTrash2, FiFileText, FiActivity, FiInfo, FiBarChart2, FiShield, FiMail, FiUserCheck } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import medicationRequestApi from "../../api/medicationRequestApi";

const MedicationRequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [medicationRequest, setMedicationRequest] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ type: "", message: "" });

    const STYLES = {
        card: {
            base: "bg-white rounded-xl shadow-sm border overflow-hidden h-full",
            header: "p-6 border-b flex items-center",
            content: "p-8 flex-1"
        },
        infoItem: {
            container: "flex flex-col space-y-2",
            label: "text-sm font-medium",
            value: "text-base"
        },
        badge: {
            base: "px-3 py-1 rounded-full text-sm font-medium inline-flex items-center",
            emergency: "bg-red-50 text-red-700 border border-red-200",
            normal: "bg-gray-50 text-gray-700 border border-gray-200",
            success: "bg-green-50 text-green-700 border border-green-200"
        }
    };

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const response = await medicationRequestApi.getMedicationRequestDetail(id);
                if (response.success) {
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
    }, [id]);

    const handleApprove = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            setMedicationRequest(prev => ({
                ...prev,
                status: "Approved",
                statusDisplayName: "Đã duyệt",
                approvedAt: new Date().toISOString(),
                approvedByName: "Y tá Mai"
            }));

            setShowAlert(true);
            setAlertInfo({ type: "success", message: "Đã duyệt yêu cầu thuốc thành công" });
        } catch (error) {
            setShowAlert(true);
            setAlertInfo({ type: "error", message: "Không thể duyệt yêu cầu thuốc" });
        }
    };

    const handleReject = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            setMedicationRequest(prev => ({
                ...prev,
                status: "Rejected",
                statusDisplayName: "Từ chối",
                approvedAt: new Date().toISOString(),
                approvedByName: "Y tá Mai"
            }));

            setShowAlert(true);
            setAlertInfo({ type: "success", message: "Đã từ chối yêu cầu thuốc" });
        } catch (error) {
            setShowAlert(true);
            setAlertInfo({ type: "error", message: "Không thể từ chối yêu cầu thuốc" });
        }
    };

    const handleDelete = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            setShowDeleteModal(false);
            setShowAlert(true);
            setAlertInfo({ type: "success", message: "Đã xóa yêu cầu thuốc thành công" });

            // Navigate back to list after a short delay
            setTimeout(() => {
                navigate('/schoolnurse/medication-requests');
            }, 1500);
        } catch (error) {
            setShowDeleteModal(false);
            setShowAlert(true);
            setAlertInfo({ type: "error", message: "Không thể xóa yêu cầu thuốc" });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "PendingApproval":
                return (
                    <span className="px-4 py-2 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                        <FiClock className="mr-2 h-4 w-4" />
                        Chờ duyệt
                    </span>
                );
            case "Approved":
                return (
                    <span className="px-4 py-2 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                        <FiCheckCircle className="mr-2 h-4 w-4" />
                        Đã duyệt
                    </span>
                );
            case "Rejected":
                return (
                    <span className="px-4 py-2 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                        <FiX className="mr-2 h-4 w-4" />
                        Từ chối
                    </span>
                );
            default:
                return null;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "Critical":
                return (
                    <span className="px-3 py-1 text-sm font-medium rounded-md"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                        Khẩn cấp
                    </span>
                );
            case "High":
                return (
                    <span className="px-3 py-1 text-sm font-medium rounded-md"
                        style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                        Cao
                    </span>
                );
            case "Normal":
                return (
                    <span className="px-3 py-1 text-sm font-medium rounded-md"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                        Bình thường
                    </span>
                );
            case "Low":
                return (
                    <span className="px-3 py-1 text-sm font-medium rounded-md"
                        style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                        Thấp
                    </span>
                );
            default:
                return null;
        }
    };

    const getMedicationPriorityBadge = (priority) => {
        switch (priority) {
            case "Critical":
                return (
                    <span className="px-2 py-1 text-xs font-medium rounded-md"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                        Khẩn cấp
                    </span>
                );
            case "High":
                return (
                    <span className="px-2 py-1 text-xs font-medium rounded-md"
                        style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                        Cao
                    </span>
                );
            case "Normal":
                return (
                    <span className="px-2 py-1 text-xs font-medium rounded-md"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                        Bình thường
                    </span>
                );
            case "Low":
                return (
                    <span className="px-2 py-1 text-xs font-medium rounded-md"
                        style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                        Thấp
                    </span>
                );
            default:
                return null;
        }
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
        <div className={`${STYLES.infoItem.container} ${isCentered ? 'text-center' : ''}`}>
            <div className={`flex items-center ${isCentered ? 'justify-center' : ''} space-x-2`}>
                {icon && <span style={{ color: GRAY[400] }}>{icon}</span>}
                <label className={STYLES.infoItem.label} style={{ color: TEXT.SECONDARY }}>
                    {label}
                </label>
            </div>
            <div
                className={`${STYLES.infoItem.value} ${isLargeNumber ? 'text-2xl font-bold' : ''}`}
                style={{ color: TEXT.PRIMARY }}
            >
                {value || 'Không có thông tin'}
            </div>
        </div>
    );

    const InfoItem = ({ label, value, icon, badge, error, className = '', important = false }) => (
        <div className={`bg-white p-5 rounded-xl border ${className}`}
            style={{
                borderColor: error ? ERROR[200] : important ? PRIMARY[200] : BORDER.DEFAULT,
                backgroundColor: important ? PRIMARY[50] : 'white'
            }}>
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
                        onClick={() => navigate('/schoolnurse/medication-requests')}
                        className="inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                    >
                        <FiArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="w-full">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/schoolnurse/medication-requests')}
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

                            {medicationRequest.status === "PendingApproval" && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center"
                                        style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                                    >
                                        <FiCheckCircle className="mr-2 h-4 w-4" />
                                        Duyệt
                                    </button>
                                    <button
                                        onClick={handleReject}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className={STYLES.card.base} style={{ borderColor: BORDER.DEFAULT }}>
                        <div className={STYLES.card.header} style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiFileText className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Thông tin cơ bản
                            </h2>
                        </div>

                        <div className={STYLES.card.content}>
                            <div>


                                <div className="pb-8 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                    <h3 className="text-lg font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                        <FiUser className="mr-3 h-5 w-5" style={{ color: PRIMARY[500] }} />
                                        Thông tin học sinh
                                    </h3>
                                    <div
                                        className="bg-white rounded-2xl shadow-md border p-8 flex flex-col items-center mb-8"
                                        style={{ borderColor: BORDER.LIGHT }}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg mb-4"
                                            style={{ backgroundColor: SUCCESS[100] }}
                                        >
                                            <FiUser className="h-12 w-12" style={{ color: SUCCESS[600] }} />
                                        </div>
                                        {/* Tên và mã học sinh */}
                                        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: TEXT.PRIMARY }}>
                                            {medicationRequest.studentName}
                                        </h2>
                                        <div
                                            className="inline-flex items-center px-4 py-1 rounded-full text-base font-semibold mb-4"
                                            style={{ backgroundColor: SUCCESS[100], color: SUCCESS[700] }}
                                        >
                                            {medicationRequest.studentCode}
                                        </div>
                                        {/* Thông tin phụ huynh */}
                                        <div className="flex flex-col items-center space-y-1">
                                            <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Phụ huynh
                                            </span>
                                            <span className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                {medicationRequest.parentName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
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

                    <div className={STYLES.card.base} style={{ borderColor: BORDER.DEFAULT }}>
                        <div className={STYLES.card.header} style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
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
                                    {medicationRequest.medications.map((medication, index) => (
                                        <div
                                            key={medication.id}
                                            className="p-6 border rounded-lg"
                                            style={{ backgroundColor: PRIMARY[25], borderColor: BORDER.DEFAULT }}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="lg:col-span-3">
                                                    <div className="flex items-center space-x-3 mb-4">
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                                {medication.medicationName}
                                                            </h3>
                                                            {getMedicationPriorityBadge(medication.priority)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {renderInfoItem("Liều lượng", medication.dosage, null, true, true)}
                                                {renderInfoItem("Số lượng", `${medication.quantitySent}`, null, true, true)}
                                                {renderInfoItem("Hạn sử dụng", new Date(medication.expiryDate).toLocaleDateString("vi-VN"), null, true, true)}

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>

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
        </div>
    );
};

export default MedicationRequestDetail;
