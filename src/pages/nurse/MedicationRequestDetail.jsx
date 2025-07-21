import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiPackage, FiClock, FiCheckCircle, FiAlertTriangle, FiX, FiActivity, FiCheckSquare } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import ConfirmActionModal from "../../components/modal/ConfirmActionModal";
import QuantityConfirmationModal from "../../components/modal/QuantityConfirmationModal";
import medicationRequestApi from "../../api/medicationRequestApi";
import medicationUsageApi from "../../api/medicationUsageApi";
import { useAuth } from "../../utils/AuthContext";

const MedicationRequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [medicationRequest, setMedicationRequest] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalAction, setApprovalAction] = useState("");
    const [alertInfo, setAlertInfo] = useState({ type: "", message: "" });
    const [showQuantityConfirmModal, setShowQuantityConfirmModal] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [receivedQuantities, setReceivedQuantities] = useState({});
    const isParent = user?.role === 'parent';
    const isNurse = user?.role === 'schoolnurse';

    const STATUS_CONFIG = {
        PendingApproval: { icon: FiClock, label: "Chờ duyệt", bgColor: WARNING[50], textColor: WARNING[700], borderColor: WARNING[200] },
        Approved: { icon: FiCheckCircle, label: "Đã duyệt", bgColor: SUCCESS[50], textColor: SUCCESS[700], borderColor: SUCCESS[200] },
        Rejected: { icon: FiX, label: "Từ chối", bgColor: ERROR[50], textColor: ERROR[700], borderColor: ERROR[200] },
        Active: { icon: FiActivity, label: "Đang hoạt động", bgColor: PRIMARY[50], textColor: PRIMARY[700], borderColor: PRIMARY[200] },
        Completed: { icon: FiCheckCircle, label: "Đã hoàn thành", bgColor: INFO[50], textColor: INFO[700], borderColor: INFO[200] },
        Discontinued: { icon: FiAlertTriangle, label: "Đã ngừng", bgColor: GRAY[50], textColor: GRAY[700], borderColor: GRAY[200] }
    };

    const PRIORITY_CONFIG = {
        Critical: { label: "Khẩn cấp", bgColor: ERROR[50], textColor: ERROR[700], borderColor: ERROR[200] },
        High: { label: "Cao", bgColor: WARNING[50], textColor: WARNING[700], borderColor: WARNING[200] },
        Normal: { label: "Bình thường", bgColor: PRIMARY[50], textColor: PRIMARY[700], borderColor: PRIMARY[200] },
        Low: { label: "Thấp", bgColor: SUCCESS[50], textColor: SUCCESS[700], borderColor: SUCCESS[200] }
    };

    const QUANTITY_UNIT_CONFIG = {
        Tablet: "Viên",
        Bottle: "Chai",
        Package: "Gói"
    };

    const RECEIVED_STATUS_CONFIG = {
        NotReceive: { label: "Chưa nhận", bgColor: WARNING[50], textColor: WARNING[700], borderColor: WARNING[200] },
        Received: { label: "Đã nhận", bgColor: SUCCESS[50], textColor: SUCCESS[700], borderColor: SUCCESS[200] }
    };

    useEffect(() => {
        if (id) { fetchDetail() }
    }, [id, user?.id, isParent]);

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
            const response = await medicationRequestApi.approveMedicationRequest(id, { isApproved: true, notes: notes });

            if (response.success) {
                const detailResponse = await medicationRequestApi.getMedicationRequestDetail(id);
                if (detailResponse.success) { setMedicationRequest(detailResponse.data); }
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
            const response = await medicationRequestApi.rejectMedicationRequest(id, { rejectionReason: rejectionReason, notes: "" });

            if (response.success) {
                const detailResponse = await medicationRequestApi.getMedicationRequestDetail(id);
                if (detailResponse.success) { setMedicationRequest(detailResponse.data); }
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
                navigate(isParent ? '/parent/medication-requests' : '/schoolnurse/medication-requests');
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

    const handleQuantityConfirmClick = (medications) => {
        setSelectedMedication(medications);
        const initialQuantities = medications.reduce((acc, med) => {
            acc[med.id] = med.quantityReceived || 0;
            return acc;
        }, {});
        setReceivedQuantities(initialQuantities);
        setShowQuantityConfirmModal(true);
    };

    const handleQuantityConfirm = async () => {
        try {
            const medicationsWithQuantities = selectedMedication.map(med => ({
                ...med,
                quantityReceived: receivedQuantities[med.id] || 0,
                notes: ""
            }));

            const response = await medicationUsageApi.confirmQuantityReceived(id, medicationsWithQuantities);
            if (response.success) {
                setShowQuantityConfirmModal(false);
                setShowAlert(true);
                setAlertInfo({ type: "success", message: response.message || "Đã xác nhận số lượng thuốc thành công" });
                const detailResponse = await medicationRequestApi.getMedicationRequestDetail(id);
                if (detailResponse.success) { setMedicationRequest(detailResponse.data) }
            } else {
                setShowQuantityConfirmModal(false);
                setShowAlert(true);
                setAlertInfo({ type: "error", message: response.message || "Không thể xác nhận số lượng thuốc" });
            }
        } catch (error) {
            setShowQuantityConfirmModal(false);
            setShowAlert(true);
            setAlertInfo({ type: "error", message: "Không thể xác nhận số lượng thuốc" });
        }
    };



    const handleQuantityChange = (medicationId, value) => {
        setReceivedQuantities(prev => ({
            ...prev,
            [medicationId]: parseInt(value) || 0
        }));
    };

    const getStatusBadge = (status) => {
        const statusConfig = STATUS_CONFIG[status];
        if (!statusConfig) return null;
        const IconComponent = statusConfig.icon;
        return (
            <span
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border"
                style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor, borderColor: statusConfig.borderColor }}
            >
                <IconComponent className="mr-1.5 h-4 w-4" />
                {statusConfig.label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const config = PRIORITY_CONFIG[priority];
        if (!config) return null;
        return (
            <span
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border"
                style={{ backgroundColor: config.bgColor, color: config.textColor, borderColor: config.borderColor }}
            >
                {config.label}
            </span>
        );
    };

    const getReceivedStatusBadge = (received) => {
        const config = RECEIVED_STATUS_CONFIG[received];
        if (!config) return null;
        return (
            <span
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border"
                style={{ backgroundColor: config.bgColor, color: config.textColor, borderColor: config.borderColor }}
            >
                {config.label}
            </span>
        );
    };

    const getQuantityUnitText = (unit) => { return QUANTITY_UNIT_CONFIG[unit] || unit };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Không có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const shouldShowSpecialNotes = (notes) => {
        return notes && notes !== "Không có" && notes.trim() !== "";
    };

    const shouldShowInstructions = (instructions) => {
        return instructions && instructions !== "Không có hướng dẫn" && instructions.trim() !== "";
    };

    const shouldShowFrequency = (frequency) => {
        return frequency && frequency !== "Không xác định" && frequency.trim() !== "";
    };

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
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="w-full mx-auto py-6 px-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-lg transition-all duration-200 hover:bg-white hover:shadow-sm"
                                style={{ color: GRAY[600] }}
                            >
                                <FiArrowLeft className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    Chi tiết yêu cầu thuốc
                                </h1>
                                <p className="text-base mt-2" style={{ color: TEXT.SECONDARY }}>
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
                                        className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                                        style={{ backgroundColor: SUCCESS[500], color: 'white' }}
                                    >
                                        <FiCheckCircle className="mr-2 h-5 w-5" />
                                        Duyệt
                                    </button>
                                    <button
                                        onClick={handleRejectClick}
                                        className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                                        style={{ backgroundColor: ERROR[500], color: 'white' }}
                                    >
                                        <FiX className="mr-2 h-5 w-5" />
                                        Từ chối
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    <div className="lg:col-span-1 flex flex-col h-full">
                        <div className="bg-white rounded-xl shadow-sm border p-8 flex-1" style={{ borderColor: BORDER.DEFAULT }}>
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: PRIMARY[100] }}>
                                    <FiUser className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                        </div>
                                <div>
                                    <h3 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        {medicationRequest.studentName}
                                </h3>
                                    <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                                        Mã học sinh: {medicationRequest.studentCode}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                    <span className="text-base" style={{ color: TEXT.SECONDARY }}>Phụ huynh:</span>
                                    <span className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                        {medicationRequest.parentName}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                    <span className="text-base" style={{ color: TEXT.SECONDARY }}>Ngày gửi yêu cầu:</span>
                                    <span className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                        {formatDateTime(medicationRequest.submittedAt)}
                                    </span>
                                </div>
                                {medicationRequest.approvedAt && (
                                    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                        <span className="text-base" style={{ color: TEXT.SECONDARY }}>Ngày duyệt:</span>
                                        <span className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                            {formatDateTime(medicationRequest.approvedAt)}
                                        </span>
                                    </div>
                                )}
                                {medicationRequest.approvedByName && (
                                    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                        <span className="text-base" style={{ color: TEXT.SECONDARY }}>Người duyệt:</span>
                                        <span className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                            {medicationRequest.approvedByName}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-base" style={{ color: TEXT.SECONDARY }}>Độ ưu tiên:</span>
                                    {getPriorityBadge(medicationRequest.priorityDisplayName)}
                            </div>
                        </div>
                    </div>

                        <div className="flex-1"></div>
                            {(isNurse && medicationRequest.status === "Approved") && (
                            <div className="bg-white rounded-xl shadow-sm border p-8 mt-6" style={{ borderColor: BORDER.DEFAULT }}>
                                <h4 className="text-base font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                                    Thao tác
                                </h4>
                                <button
                                    onClick={() => handleQuantityConfirmClick(medicationRequest.medications)}
                                    className="w-full inline-flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                                    style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                                >
                                    <FiCheckSquare className="mr-3 h-5 w-5" />
                                    Xác nhận số lượng
                                </button>
                            </div>
                            )}
                        </div>

                    <div className="lg:col-span-2 h-full">
                        <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col" style={{ borderColor: BORDER.DEFAULT }}>
                            <div className="p-8 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FiPackage className="h-6 w-6 mr-4" style={{ color: PRIMARY[500] }} />
                                        <h2 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>
                                            Danh sách thuốc ({medicationRequest.medications.length})
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex-1">
                                {medicationRequest.medications.length === 0 ? (
                                    <div className="text-center py-16">
                                        <FiPackage className="h-16 w-16 mx-auto mb-6" style={{ color: GRAY[300] }} />
                                        <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                                            Không có thuốc nào được yêu cầu
                                        </p>
                                </div>
                            ) : (
                                    <div
                                        className={`space-y-6 ${medicationRequest.medications.length > 2 ? 'max-h-[700px] overflow-y-auto pr-3' : ''}`}
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {medicationRequest.medications.map((medication, index) => (
                                            <div key={medication.id} className="bg-gray-50 rounded-lg p-6 border" style={{ borderColor: BORDER.LIGHT }}>
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: PRIMARY[100] }}>
                                                            <span className="text-base font-semibold" style={{ color: PRIMARY[600] }}>
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                                {medication.medicationName}
                                                            </h3>
                                                            <div className="flex items-center mt-2 space-x-3">
                                                                {getStatusBadge(medication.status)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                                                    <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BORDER.LIGHT }}>
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Liều lượng</span>
                                                        </div>
                                                        <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {medication.dosage}
                                                        </p>
                                                    </div>

                                                    <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BORDER.LIGHT }}>
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Số lượng gửi</span>
                                                        </div>
                                                        <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {medication.quantitySent} {getQuantityUnitText(medication.quantityUnit)}
                                                        </p>
                                                    </div>

                                                    <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BORDER.LIGHT }}>
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Số lượng nhận</span>
                                                        </div>
                                                        <p className="text-base font-semibold" style={{ color: medication.quantityReceived > 0 ? SUCCESS[600] : WARNING[600] }}>
                                                            {medication.quantityReceived > 0
                                                                ? `${medication.quantityReceived} ${getQuantityUnitText(medication.quantityUnit)}`
                                                                : "Chưa nhận"
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BORDER.LIGHT }}>
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Tần suất</span>
                                                        </div>
                                                        <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {medication.frequencyCount} lần/ngày
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                                    <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BORDER.LIGHT }}>
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Hạn sử dụng</span>
                                                        </div>
                                                        <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {formatDate(medication.expiryDate)}
                                                        </p>
                                                    </div>

                                                    {medication.startDate && (
                                                        <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BORDER.LIGHT }}>
                                                            <div className="flex items-center mb-2">
                                                                <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Ngày bắt đầu</span>
                                                            </div>
                                                            <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                                {formatDate(medication.startDate)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {medication.timesOfDay && medication.timesOfDay.length > 0 && (
                                                    <div className="bg-white rounded-lg p-4 border mb-6" style={{ borderColor: BORDER.LIGHT }}>
                                                        <div className="flex items-center mb-3">
                                                            <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Thời gian uống</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {medication.timesOfDay.map((time, timeIndex) => (
                                                                <span
                                                                    key={timeIndex}
                                                                    className="px-4 py-2 text-sm rounded-full font-medium"
                                                                    style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}
                                                                >
                                                                    {time}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {(shouldShowSpecialNotes(medication.specialNotes) || shouldShowInstructions(medication.instructions)) && (
                                                    <div className="space-y-4">
                                                        {shouldShowSpecialNotes(medication.specialNotes) && (
                                                            <div className="bg-white rounded-lg p-4 border" style={{ borderColor: WARNING[200] }}>
                                                                <div className="flex items-center mb-3">
                                                                    <span className="text-sm font-medium" style={{ color: WARNING[700] }}>⚠️ Ghi chú đặc biệt</span>
                                                                </div>
                                                                <p className="text-base" style={{ color: WARNING[700] }}>{medication.specialNotes}</p>
                                                            </div>
                                                        )}
                                                        {shouldShowInstructions(medication.instructions) && (
                                                            <div className="bg-white rounded-lg p-4 border" style={{ borderColor: INFO[200] }}>
                                                                <div className="flex items-center mb-3">
                                                                    <span className="text-sm font-medium" style={{ color: INFO[700] }}>📋 Hướng dẫn sử dụng</span>
                                                                </div>
                                                                <p className="text-base" style={{ color: INFO[700] }}>{medication.instructions}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                    ))}
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <QuantityConfirmationModal
                isOpen={showQuantityConfirmModal}
                onClose={() => setShowQuantityConfirmModal(false)}
                medications={selectedMedication || []}
                receivedQuantities={receivedQuantities}
                onQuantityChange={handleQuantityChange}
                onConfirm={handleQuantityConfirm}
            />

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