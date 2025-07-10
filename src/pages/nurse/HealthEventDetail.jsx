import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR, SUCCESS, WARNING, INFO } from '../../constants/colors';
import { FiArrowLeft, FiEdit, FiTrash2, FiAlertTriangle, FiCalendar, FiMapPin, FiUser, FiActivity, FiFileText, FiClock, FiCheckCircle, FiTablet, FiThermometer, FiHeart, FiWind, FiMail, FiUserCheck } from 'react-icons/fi';
import Loading from '../../components/Loading';
import AlertModal from '../../components/modal/AlertModal';
import ConfirmModal from '../../components/modal/ConfirmModal';
import healthEventApi from '../../api/healtheventApi';
import { useAuth } from '../../utils/AuthContext';

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

const HealthEventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const isNurse = hasRole('schoolnurse');

    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: ${PRIMARY[500]};
                border-radius: 4px;
                border: 2px solid transparent;
                background-clip: content-box;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: ${PRIMARY[600]};
            }
            .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: ${PRIMARY[500]} transparent;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const [healthEvent, setHealthEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const showAlertMessage = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlert(true);
    };

    const fetchHealthEvent = async () => {
        try {
            setLoading(true);
            const response = await healthEventApi.getHealthEvent(id);
            if (response.success) {
                setHealthEvent(response.data);
            } else {
                setError(response.message || "Không thể tải thông tin sự kiện y tế");
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tải thông tin sự kiện y tế");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchHealthEvent();
        }
    }, [id]);

    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            const response = await healthEventApi.deleteHealthEvent(id);
            if (response.success) {
                showAlertMessage("success", "Thành công", "Đã xóa sự kiện y tế thành công!");
                setTimeout(() => {
                    navigate('/schoolnurse/health-events');
                }, 1500);
            } else {
                showAlertMessage("error", "Lỗi", response.message || "Không thể xóa sự kiện y tế");
            }
        } catch (err) {
            showAlertMessage("error", "Lỗi", "Có lỗi xảy ra khi xóa sự kiện y tế");
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
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

    const renderMedicationCard = (item, index) => {
        const isMedication = item.dose > 0 && item.medicalPerOnce > 0;

        return (
            <div
                key={index}
                className="p-6 border rounded-lg"
                style={{ backgroundColor: isMedication ? PRIMARY[25] : WARNING[25], borderColor: BORDER.DEFAULT }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-3">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                    {item.medicationName}
                                </h3>
                                <span
                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{ backgroundColor: isMedication ? PRIMARY[100] : WARNING[100], color: isMedication ? PRIMARY[700] : WARNING[700] }}
                                >
                                    {isMedication ? "Thuốc" : "Vật tư"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {renderInfoItem("Số lượng", `${item.medicationQuantity || 0}`, null, true, true)}

                    {isMedication && (
                        <>
                            {renderInfoItem("Liều/ngày", `${item.dose || 0}`, null, true, true)}
                            {renderInfoItem("Số thuốc mỗi lần", `${item.medicalPerOnce || 0}`, null, true, true)}
                        </>
                    )}

                    {item.medicationDosage && (
                        <div className="lg:col-span-3">
                            {renderInfoItem("Hướng dẫn sử dụng", item.medicationDosage)}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const parseHealthStatus = (status) => {
        const result = {
            temperature: '',
            bloodPressure: '',
            breathing: '',
            heartRate: ''
        };

        if (!status) return result;

        const matches = {
            temperature: status.match(/Nhiệt độ: ([\d.]+)°C/),
            bloodPressure: status.match(/Huyết áp: ([\d/]+) mmHg/),
            breathing: status.match(/Nhịp thở: ([\d]+)\/phút/),
            heartRate: status.match(/Nhịp tim: ([\d]+)\/phút/)
        };

        result.temperature = matches.temperature ? matches.temperature[1] + '°C' : 'N/A';
        result.bloodPressure = matches.bloodPressure ? matches.bloodPressure[1] + ' mmHg' : 'N/A';
        result.breathing = matches.breathing ? matches.breathing[1] + '/phút' : 'N/A';
        result.heartRate = matches.heartRate ? matches.heartRate[1] + '/phút' : 'N/A';

        return result;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải chi tiết sự kiện y tế..." />
            </div>
        );
    }

    if (error || !healthEvent) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <FiAlertTriangle className="h-16 w-16 mx-auto mb-4" style={{ color: ERROR[500] }} />
                    <h2 className="text-2xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                        Không thể tải thông tin
                    </h2>
                    <p className="text-lg mb-6" style={{ color: TEXT.SECONDARY }}>
                        {error || "Sự kiện y tế không tồn tại"}
                    </p>
                    <button
                        onClick={() => navigate('/schoolnurse/health-events')}
                        className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                        style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                    >
                        <FiArrowLeft className="mr-2 h-5 w-5 inline" />
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const medicalItems = healthEvent.medicalItemDetails?.filter(item => item.medicationName) || [];
    const medications = medicalItems.filter(item => item.dose > 0 && item.medicalPerOnce > 0);
    const supplies = medicalItems.filter(item => item.dose === 0 && item.medicalPerOnce === 0);
    const sortedMedicalItems = [...medications, ...supplies];

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="w-full">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/schoolnurse/health-events')}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                style={{ backgroundColor: BACKGROUND.DEFAULT, border: `1px solid ${BORDER.DEFAULT}` }}
                            >
                                <FiArrowLeft className="h-5 w-5" style={{ color: TEXT.PRIMARY }} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold" style={{ color: PRIMARY[700] }}>
                                    Chi tiết sự kiện y tế
                                </h1>
                                <p className="text-base mt-1" style={{ color: TEXT.SECONDARY }}>
                                    Mã sự kiện: {healthEvent.code}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div
                                className="inline-flex items-center px-4 py-2 rounded-lg font-medium"
                                style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700], border: `1px solid ${PRIMARY[200]}` }}
                            >
                                <FiActivity className="mr-2 h-5 w-5" />
                                {healthEvent.eventTypeDisplayName}
                            </div>

                            {healthEvent.isEmergency && (
                                <div
                                    className="inline-flex items-center px-4 py-2 rounded-lg font-medium"
                                    style={{ backgroundColor: ERROR[50], color: ERROR[700], border: `1px solid ${ERROR[200]}` }}
                                >
                                    <FiAlertTriangle className="mr-2 h-5 w-5" />
                                    {healthEvent.emergencyStatusText}
                                </div>
                            )}

                            {isNurse && (
                                <>
                                    <button
                                        onClick={() => navigate(`/schoolnurse/health-events/edit/${id}`)}
                                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center"
                                        style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                                    >
                                        <FiEdit className="mr-2 h-4 w-4" />
                                        Chỉnh sửa
                                    </button>

                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center"
                                        style={{ backgroundColor: ERROR[500], color: 'white' }}
                                    >
                                        <FiTrash2 className="mr-2 h-4 w-4" />
                                        Xóa
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
                                <h5 className="text-lg font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                    Thông tin học sinh
                                </h5>

                                <div className="flex flex-col items-center " style={{ backgroundColor: SUCCESS[25] }}>
                                    <div
                                        className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg mb-6"
                                        style={{ backgroundColor: SUCCESS[100] }}
                                    >
                                        <FiUser className="h-10 w-10" style={{ color: SUCCESS[600] }} />
                                    </div>

                                    <div className="text-center w-full">
                                        <div className="flex flex-col items-center space-y-4 mb-8">
                                            <h4 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {healthEvent.studentName} - {healthEvent.medicalItemDetails[0].studentClass}
                                            </h4>
                                            <div className="inline-flex items-center px-6 py-2 rounded-full text-lg font-semibold"
                                                style={{ backgroundColor: SUCCESS[100], color: SUCCESS[700] }}>
                                                {healthEvent.studentCode}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                                            {healthEvent.relatedMedicalConditionName && (
                                                <div className="text-center space-y-3">
                                                    <label className="text-lg font-semibold block" style={{ color: TEXT.SECONDARY }}>
                                                        Tình trạng y tế liên quan
                                                    </label>
                                                    <div className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                                        {healthEvent.relatedMedicalConditionName}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className=" pb-8 border-b" style={{ borderColor: BORDER.LIGHT }}>
                                <h3 className="text-lg font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                    Thông tin sự kiện
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium flex items-center space-x-2" style={{ color: TEXT.SECONDARY }}>
                                            <FiCalendar className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                                            <span>Thời gian xảy ra</span>
                                        </label>
                                        <div className="p-4 rounded-lg flex items-center space-x-3 transition-all duration-200 hover:shadow-md"
                                            style={{ backgroundColor: 'white', border: `1px solid ${PRIMARY[200]}` }}>
                                            <div className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {formatDateTime(healthEvent.occurredAt) || 'Không có thông tin'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium flex items-center space-x-2" style={{ color: TEXT.SECONDARY }}>
                                            <FiMapPin className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                                            <span>Địa điểm</span>
                                        </label>
                                        <div className="p-4 rounded-lg flex items-center space-x-3 transition-all duration-200 hover:shadow-md"
                                            style={{ backgroundColor: 'white', border: `1px solid ${PRIMARY[200]}` }}>
                                            <div className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {healthEvent.location || 'Không có thông tin'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium flex items-center space-x-2" style={{ color: TEXT.SECONDARY }}>
                                            <FiClock className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                                            <span>Ngày tạo</span>
                                        </label>
                                        <div className="p-4 rounded-lg flex items-center space-x-3 transition-all duration-200 hover:shadow-md"
                                            style={{ backgroundColor: 'white', border: `1px solid ${PRIMARY[200]}` }}>
                                            <div className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {formatDateTime(healthEvent.createdDate) || 'Không có thông tin'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium flex items-center space-x-2" style={{ color: TEXT.SECONDARY }}>
                                            <FiUserCheck className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                                            <span>Người xử lý</span>
                                        </label>
                                        <div className="p-4 rounded-lg flex items-center space-x-3 transition-all duration-200 hover:shadow-md"
                                            style={{ backgroundColor: 'white', border: `1px solid ${PRIMARY[200]}` }}>
                                            <div className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                {healthEvent.handledByName || 'Không có thông tin'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {healthEvent.currentHealthStatus && (
                                    <div className="mt-6">
                                        <label className="text-sm font-medium flex items-center space-x-2 mb-2" style={{ color: TEXT.SECONDARY }}>
                                            <FiThermometer className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                                            <span>Tình trạng sức khỏe hiện tại</span>
                                        </label>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {(() => {
                                                const healthStatus = parseHealthStatus(healthEvent.currentHealthStatus);
                                                const items = [
                                                    {
                                                        icon: <FiThermometer className="h-4 w-4" style={{ color: PRIMARY[500] }} />,
                                                        label: 'Nhiệt độ',
                                                        value: healthStatus.temperature
                                                    },
                                                    {
                                                        icon: <FiActivity className="h-4 w-4" style={{ color: PRIMARY[500] }} />,
                                                        label: 'Huyết áp',
                                                        value: healthStatus.bloodPressure
                                                    },
                                                    {
                                                        icon: <FiWind className="h-4 w-4" style={{ color: PRIMARY[500] }} />,
                                                        label: 'Nhịp thở',
                                                        value: healthStatus.breathing
                                                    },
                                                    {
                                                        icon: <FiHeart className="h-4 w-4" style={{ color: PRIMARY[500] }} />,
                                                        label: 'Nhịp tim',
                                                        value: healthStatus.heartRate
                                                    }
                                                ];

                                                return items.map((item, index) => (
                                                    <div key={index} className="p-4 rounded-xl"
                                                        style={{ backgroundColor: 'white', border: `1px solid ${PRIMARY[200]}`, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
                                                        <div className="flex items-center mb-3">
                                                            <div className="p-2 rounded-lg mr-2" style={{ backgroundColor: PRIMARY[50] }}>
                                                                {item.icon}
                                                            </div>
                                                            <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                        <div className="text-base font-semibold text-center" style={{ color: TEXT.PRIMARY }}>
                                                            {item.value}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium flex items-center space-x-2 mb-2" style={{ color: TEXT.SECONDARY }}>
                                    <FiFileText className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                                    <span>Mô tả chi tiết</span>
                                </label>
                                <div className="p-4 rounded-lg flex items-center space-x-3 transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor: 'white', border: `1px solid ${PRIMARY[200]}` }}>
                                    <div className="text-base" style={{ color: TEXT.PRIMARY }}>
                                        {healthEvent.description || 'Không có mô tả chi tiết'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={STYLES.card.base} style={{ borderColor: BORDER.DEFAULT }}>
                        <div className={STYLES.card.header} style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiTablet className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Thuốc & Vật tư đã sử dụng ({sortedMedicalItems.length})
                                {medications.length > 0 && supplies.length > 0 && (
                                    <span className="text-sm font-normal ml-2" style={{ color: TEXT.SECONDARY }}>
                                        ({medications.length} thuốc, {supplies.length} vật tư)
                                    </span>
                                )}
                            </h2>
                        </div>

                        <div className="p-8">
                            {sortedMedicalItems.length === 0 ? (
                                <div className="flex items-center justify-center" style={{ height: '540px' }}>
                                    <div className="text-center" style={{ color: TEXT.SECONDARY }}>
                                        <FiTablet className="h-16 w-16 mx-auto mb-4" style={{ color: GRAY[300] }} />
                                        <p className="text-lg font-medium">Không có thuốc hoặc vật tư nào được sử dụng</p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="space-y-6 pr-2 custom-scrollbar"
                                    style={{ height: '630px', overflowY: sortedMedicalItems.length > 3 ? 'scroll' : 'hidden' }}
                                >
                                    {sortedMedicalItems.map((item, index) => renderMedicationCard(item, index))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={STYLES.card.base} style={{ borderColor: BORDER.DEFAULT }}>
                        <div className={STYLES.card.header} style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiCheckCircle className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Xử lý & Kết quả
                            </h2>
                        </div>

                        <div className={STYLES.card.content}>
                            <div className="space-y-6">
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium flex items-center space-x-2" style={{ color: TEXT.SECONDARY }}>
                                        <FiActivity className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                                        <span>Hành động đã thực hiện</span>
                                    </label>
                                    <div className="p-4 rounded-lg flex items-center space-x-3 transition-all duration-200 hover:shadow-md"
                                        style={{ backgroundColor: 'white', border: `1px solid ${PRIMARY[200]}` }}>
                                        <div className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                            {healthEvent.actionTaken || 'Không có thông tin'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium flex items-center space-x-2" style={{ color: TEXT.SECONDARY }}>
                                        <FiCheckCircle className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                                        <span>Kết quả</span>
                                    </label>
                                    <div className="p-4 rounded-lg flex items-center space-x-3 transition-all duration-200 hover:shadow-md"
                                        style={{ backgroundColor: 'white', border: `1px solid ${PRIMARY[200]}` }}>
                                        <div className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                            {healthEvent.outcome || 'Không có thông tin'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={STYLES.card.base} style={{ borderColor: BORDER.DEFAULT }}>
                        <div className={STYLES.card.header} style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiMail className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Thông báo cho phụ huynh
                            </h2>
                        </div>

                        <div className={STYLES.card.content}>
                            {healthEvent.parentNotice ? (
                                <div className="p-4 rounded-lg" style={{ backgroundColor: INFO[25], border: `1px solid ${INFO[200]}` }}>
                                    <p className="text-base leading-relaxed" style={{ color: TEXT.PRIMARY }}>
                                        {healthEvent.parentNotice}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center" style={{ color: TEXT.SECONDARY }}>
                                        <FiMail className="h-16 w-16 mx-auto mb-4" style={{ color: GRAY[300] }} />
                                        <p className="text-lg font-medium">Không có thông báo cho phụ huynh</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Xác nhận xóa sự kiện y tế"
                message={`Bạn có chắc chắn muốn xóa sự kiện y tế "${healthEvent?.code}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
                loading={deleteLoading}
            />

            <AlertModal
                isOpen={showAlert}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setShowAlert(false)}
            />
        </div>
    );
};

export default HealthEventDetail;