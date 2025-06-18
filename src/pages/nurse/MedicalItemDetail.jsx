import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiPackage, FiCalendar, FiClock, FiAlertTriangle, FiCheckCircle, FiXCircle, FiAlertCircle, FiArrowLeft, FiBox, FiUser, FiFileText } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING } from '../../constants/colors';
import Loading from '../../components/Loading';
import medicalApi from '../../api/medicalApi';

const MedicalItemDetail = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItemDetail = async () => {
            try {
                setLoading(true);
                const response = await medicalApi.getMedicalItem(id);
                if (response.success) {
                    setItem(response.data);
                } else {
                    setError(response.message || 'Không thể tải thông tin chi tiết');
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải thông tin chi tiết');
                console.error('Error fetching item detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchItemDetail();
    }, [id]);

    if (loading) {
        return <Loading type="medical" size="large" color="primary" fullScreen={true} text="Đang tải thông tin..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <FiAlertCircle className="mx-auto h-12 w-12 mb-4" style={{ color: ERROR[500] }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                        {error}
                    </h3>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                    >
                        <FiArrowLeft className="inline-block mr-2 h-4 w-4" />
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!item) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return { bg: SUCCESS[50], text: SUCCESS[700], icon: <FiCheckCircle className="h-5 w-5" /> };
            case 'Rejected':
                return { bg: ERROR[50], text: ERROR[700], icon: <FiXCircle className="h-5 w-5" /> };
            case 'Pending':
                return { bg: WARNING[50], text: WARNING[700], icon: <FiClock className="h-5 w-5" /> };
            default:
                return { bg: GRAY[50], text: GRAY[700], icon: <FiPackage className="h-5 w-5" /> };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical':
                return { bg: ERROR[50], text: ERROR[700] };
            case 'High':
                return { bg: WARNING[50], text: WARNING[700] };
            case 'Normal':
                return { bg: SUCCESS[50], text: SUCCESS[700] };
            case 'Low':
                return { bg: GRAY[50], text: GRAY[700] };
            default:
                return { bg: GRAY[50], text: GRAY[700] };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const InfoItem = ({ label, value, icon, badge, error }) => (
        <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: BORDER.DEFAULT }}>
            <div className="mt-0.5">
                {icon}
            </div>
            <div className="flex-1">
                <label className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                    {label}
                </label>
                <div className="flex items-center mt-1">
                    <span className="font-medium" style={{ color: error ? ERROR[700] : TEXT.PRIMARY }}>
                        {value}
                    </span>
                    {badge}
                </div>
            </div>
        </div>
    );

    const statusColor = getStatusColor(item.status);
    const priorityColor = getPriorityColor(item.priority);

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            {/* Header */}
            <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10" style={{ borderColor: BORDER.DEFAULT }}>
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 inline-flex items-center"
                            style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                        >
                            <FiArrowLeft className="mr-2 h-5 w-5" />
                            Quay lại
                        </button>

                        {(item.canApprove || item.canReject || item.canUse) && (
                            <div className="flex gap-3">
                                {item.canUse && (
                                    <button
                                        className="px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-sm"
                                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                    >
                                        Sử dụng
                                    </button>
                                )}
                                {item.canApprove && (
                                    <button
                                        className="px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-sm"
                                        style={{ backgroundColor: SUCCESS[500], color: TEXT.INVERSE }}
                                    >
                                        Phê duyệt
                                    </button>
                                )}
                                {item.canReject && (
                                    <button
                                        className="px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-sm"
                                        style={{ backgroundColor: ERROR[500], color: TEXT.INVERSE }}
                                    >
                                        Từ chối
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Title Card */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6" style={{ borderColor: BORDER.DEFAULT }}>
                    <div className="flex items-center">
                        <div
                            className="h-16 w-16 rounded-2xl flex items-center justify-center mr-6"
                            style={{ backgroundColor: PRIMARY[50] }}
                        >
                            <FiBox className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-3" style={{ color: TEXT.PRIMARY }}>
                                {item.name}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span
                                    className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium"
                                    style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                                >
                                    {statusColor.icon}
                                    <span className="ml-2">{item.statusDisplayName}</span>
                                </span>
                                <span
                                    className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium"
                                    style={{ backgroundColor: priorityColor.bg, color: priorityColor.text }}
                                >
                                    {item.priorityDisplayName}
                                </span>
                                {item.isUrgent && (
                                    <span
                                        className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium"
                                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}
                                    >
                                        <FiAlertTriangle className="mr-2 h-4 w-4" />
                                        Khẩn cấp
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BORDER.DEFAULT }}>
                            <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiBox className="mr-3 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Thông tin chung
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem
                                    label="Loại"
                                    value={item.type === 'Supply' ? 'Vật tư y tế' : 'Thuốc'}
                                    icon={<FiPackage className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                />

                                <InfoItem
                                    label="Số lượng"
                                    value={`${item.quantity} ${item.unit}`}
                                    icon={<FiBox className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                    badge={item.isLowStock && (
                                        <span
                                            className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: WARNING[50], color: WARNING[700] }}
                                        >
                                            <FiAlertTriangle className="mr-1 h-3 w-3" />
                                            Tồn kho thấp
                                        </span>
                                    )}
                                />

                                {item.type === 'Medication' && (
                                    <>
                                        <InfoItem
                                            label="Dạng thuốc"
                                            value={item.formDisplayName || 'N/A'}
                                            icon={<FiPackage className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                        />
                                        <InfoItem
                                            label="Liều lượng"
                                            value={item.dosage || 'N/A'}
                                            icon={<FiPackage className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                        />
                                    </>
                                )}

                                {item.expiryDate && (
                                    <InfoItem
                                        label="Hạn sử dụng"
                                        value={formatDate(item.expiryDate)}
                                        icon={<FiCalendar className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                        badge={
                                            <>
                                                {item.isExpiringSoon && (
                                                    <span
                                                        className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: WARNING[50], color: WARNING[700] }}
                                                    >
                                                        <FiCalendar className="mr-1 h-3 w-3" />
                                                        Sắp hết hạn
                                                    </span>
                                                )}
                                                {item.isExpired && (
                                                    <span
                                                        className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}
                                                    >
                                                        <FiAlertTriangle className="mr-1 h-3 w-3" />
                                                        Đã hết hạn
                                                    </span>
                                                )}
                                            </>
                                        }
                                    />
                                )}
                            </div>

                            {item.description && (
                                <div className="mt-6">
                                    <InfoItem
                                        label="Mô tả"
                                        value={item.description}
                                        icon={<FiFileText className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: BORDER.DEFAULT }}>
                            <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiFileText className="mr-3 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Thông tin yêu cầu
                            </h2>
                            <div className="space-y-4">
                                <InfoItem
                                    label="Lý do yêu cầu"
                                    value={item.justification}
                                    icon={<FiFileText className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                />

                                <InfoItem
                                    label="Người yêu cầu"
                                    value={
                                        item.requestedByName ? (
                                            <>
                                                {item.requestedByName}
                                                <span className="ml-2 text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    ({item.requestedByStaffCode})
                                                </span>
                                            </>
                                        ) : (
                                            'N/A'
                                        )
                                    }
                                    icon={<FiUser className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                />

                                <InfoItem
                                    label="Ngày yêu cầu"
                                    value={formatDate(item.createdDate)}
                                    icon={<FiClock className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                />

                                {item.status === 'Approved' && (
                                    <>
                                        <InfoItem
                                            label="Người duyệt"
                                            value={
                                                item.approvedByName ? (
                                                    <>
                                                        {item.approvedByName}
                                                        <span className="ml-2 text-sm" style={{ color: TEXT.SECONDARY }}>
                                                            ({item.approvedByStaffCode})
                                                        </span>
                                                    </>
                                                ) : (
                                                    'N/A'
                                                )
                                            }
                                            icon={<FiUser className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                        />

                                        <InfoItem
                                            label="Ngày duyệt"
                                            value={formatDate(item.approvedAt)}
                                            icon={<FiClock className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                        />
                                    </>
                                )}

                                {item.status === 'Rejected' && (
                                    <>
                                        <InfoItem
                                            label="Ngày từ chối"
                                            value={formatDate(item.rejectedAt)}
                                            icon={<FiClock className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                        />
                                        <InfoItem
                                            label="Lý do từ chối"
                                            value={item.rejectionReason || 'Không có lý do'}
                                            icon={<FiFileText className="h-5 w-5" style={{ color: GRAY[400] }} />}
                                            error={true}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalItemDetail; 