import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiPackage, FiCalendar, FiClock, FiAlertTriangle, FiCheckCircle, FiXCircle, FiAlertCircle, FiArrowLeft, FiBox, FiUser, FiFileText, FiThermometer, FiShield, FiActivity, FiInfo, FiBarChart2 } from 'react-icons/fi';
import { PRIMARY, TEXT, BACKGROUND, BORDER, ERROR, WARNING } from '../../constants/colors';
import Loading from '../../components/Loading';
import medicalApi from '../../api/medicalApi';

const MedicalItemDetail = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);
    const stats = {
        totalQuantity: 100,
        currentQuantity: item?.quantity || 0,
        usageRate: 65,
        daysUntilExpiry: item?.expiryDate ? Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0
    };

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
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" fullScreen={true} text="Đang tải thông tin..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border" style={{ borderColor: PRIMARY[200] }}>
                    <FiAlertCircle className="mx-auto h-12 w-12 mb-4" style={{ color: PRIMARY[500] }} />
                    <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                        {error}
                    </h3>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 rounded-xl font-medium inline-flex items-center"
                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                    >
                        <FiArrowLeft className="mr-2 h-5 w-5" />
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
                return { bg: PRIMARY[50], text: PRIMARY[700], icon: <FiCheckCircle className="h-5 w-5" /> };
            case 'Rejected':
                return { bg: ERROR[50], text: ERROR[700], icon: <FiXCircle className="h-5 w-5" /> };
            case 'Pending':
                return { bg: PRIMARY[50], text: PRIMARY[700], icon: <FiClock className="h-5 w-5" /> };
            default:
                return { bg: PRIMARY[50], text: PRIMARY[700], icon: <FiPackage className="h-5 w-5" /> };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical':
                return { bg: PRIMARY[50], text: PRIMARY[700], border: PRIMARY[200] };
            case 'High':
                return { bg: PRIMARY[50], text: PRIMARY[700], border: PRIMARY[200] };
            case 'Normal':
                return { bg: PRIMARY[50], text: PRIMARY[700], border: PRIMARY[200] };
            case 'Low':
                return { bg: PRIMARY[50], text: PRIMARY[700], border: PRIMARY[200] };
            default:
                return { bg: PRIMARY[50], text: PRIMARY[700], border: PRIMARY[200] };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

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

    const FillBar = ({ label, value, maxValue, icon, unit = '', color = PRIMARY[500] }) => (
        <div className="bg-white p-5 rounded-xl border" style={{ borderColor: PRIMARY[200] }}>
            <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[100] }}>
                    {React.cloneElement(icon, { style: { color: PRIMARY[600] } })}
                </div>
                <div className="flex-1">
                    <label className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                        {label}
                    </label>
                    <div className="flex items-baseline">
                        <span className="text-2xl font-semibold mr-1" style={{ color: TEXT.PRIMARY }}>
                            {value}
                        </span>
                        {unit && <span className="text-sm" style={{ color: TEXT.SECONDARY }}>{unit}</span>}
                    </div>
                </div>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: PRIMARY[100] }}>
                <div
                    className="h-full rounded-full"
                    style={{
                        backgroundColor: color,
                        width: `${Math.min((value / maxValue) * 100, 100)}%`
                    }}
                />
            </div>
        </div>
    );
    const statusColor = getStatusColor(item.status);
    const priorityColor = getPriorityColor(item.priority);

    const StatusBadge = ({ icon, text, bgColor, textColor }) => (
        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: bgColor, color: textColor }}>
            {icon}
            <span className="ml-2">{text}</span>
        </span>
    );

    const ActionButton = ({ onClick, color, children }) => (
        <button
            onClick={onClick}
            className="px-6 py-3 rounded-xl font-medium inline-flex items-center"
            style={{ backgroundColor: color, color: TEXT.INVERSE }}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen pb-8" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10"
                style={{ borderColor: BORDER.DEFAULT }}>
                <div className="max-w-[1920px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 rounded-xl font-medium inline-flex items-center"
                            style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                        >
                            <FiArrowLeft className="mr-2 h-5 w-5" />
                            Quay lại
                        </button>

                        {(item.canApprove || item.canReject || item.canUse) && (
                            <div className="flex gap-4">
                                {item.canUse && (
                                    <ActionButton color={PRIMARY[500]}>
                                        <FiActivity className="h-5 w-5 mr-2" />
                                        <span>Sử dụng</span>
                                    </ActionButton>
                                )}
                                {item.canApprove && (
                                    <ActionButton color={PRIMARY[500]}>
                                        <FiCheckCircle className="h-5 w-5 mr-2" />
                                        <span>Phê duyệt</span>
                                    </ActionButton>
                                )}
                                {item.canReject && (
                                    <ActionButton color={PRIMARY[500]}>
                                        <FiXCircle className="h-5 w-5 mr-2" />
                                        <span>Từ chối</span>
                                    </ActionButton>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1920px] mx-auto px-6 py-6">
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6"
                    style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[50] }}>
                    <div className="flex items-start">
                        <div className="h-16 w-16 rounded-xl flex items-center justify-center mr-6"
                            style={{ backgroundColor: PRIMARY[100] }}>
                            {item.type === 'Supply' ? (
                                <FiBox className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                            ) : (
                                <FiThermometer className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                                <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    {item.name}
                                </h1>
                                <span className="px-4 py-1 rounded-lg text-sm font-medium"
                                    style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                    {item.type === 'Supply' ? 'Vật tư y tế' : 'Thuốc'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <StatusBadge
                                    icon={statusColor.icon}
                                    text={item.statusDisplayName}
                                    bgColor={statusColor.bg}
                                    textColor={statusColor.text}
                                />
                                <StatusBadge
                                    icon={<FiShield className="h-5 w-5" />}
                                    text={item.priorityDisplayName}
                                    bgColor={priorityColor.bg}
                                    textColor={priorityColor.text}
                                />
                                {item.isUrgent && (
                                    <StatusBadge
                                        icon={<FiAlertTriangle className="h-5 w-5" />}
                                        text="Khẩn cấp"
                                        bgColor={ERROR[50]}
                                        textColor={ERROR[700]}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <FillBar
                        label="Số lượng hiện tại"
                        value={stats.currentQuantity}
                        maxValue={stats.totalQuantity}
                        icon={<FiBox className="h-5 w-5" />}
                        unit={item.unit}
                        color={item.isLowStock ? WARNING[500] : PRIMARY[500]}
                    />
                    <FillBar
                        label="Tỷ lệ sử dụng"
                        value={stats.usageRate}
                        maxValue={100}
                        icon={<FiBarChart2 className="h-5 w-5" />}
                        unit="%"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border p-6"
                            style={{ borderColor: BORDER.DEFAULT }}>
                            <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiInfo className="mr-3 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Thông tin chi tiết
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem
                                    label="Số lượng"
                                    value={`${item.quantity} ${item.unit}`}
                                    icon={<FiBox className="h-5 w-5" />}
                                    badge={item.isLowStock && (
                                        <span className="px-3 py-1 rounded-lg text-sm font-medium"
                                            style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                                            <FiAlertTriangle className="inline-block mr-1 h-4 w-4" />
                                            Tồn kho thấp
                                        </span>
                                    )}
                                    important={item.isLowStock}
                                />

                                {item.type === 'Medication' && (
                                    <>
                                        <InfoItem
                                            label="Dạng thuốc"
                                            value={item.formDisplayName || 'N/A'}
                                            icon={<FiPackage className="h-5 w-5" />}
                                        />
                                        <InfoItem
                                            label="Liều lượng"
                                            value={item.dosage || 'N/A'}
                                            icon={<FiThermometer className="h-5 w-5" />}
                                        />
                                    </>
                                )}

                                {item.expiryDate && (
                                    <InfoItem
                                        label="Hạn sử dụng"
                                        value={formatDate(item.expiryDate)}
                                        icon={<FiCalendar className="h-5 w-5" />}
                                        badge={
                                            <>
                                                {item.isExpiringSoon && (
                                                    <span className="px-3 py-1 rounded-lg text-sm font-medium"
                                                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                                                        <FiCalendar className="inline-block mr-1 h-4 w-4" />
                                                        Sắp hết hạn
                                                    </span>
                                                )}
                                                {item.isExpired && (
                                                    <span className="px-3 py-1 rounded-lg text-sm font-medium"
                                                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                                                        <FiAlertTriangle className="inline-block mr-1 h-4 w-4" />
                                                        Đã hết hạn
                                                    </span>
                                                )}
                                            </>
                                        }
                                        important={item.isExpiringSoon || item.isExpired}
                                    />
                                )}
                            </div>

                            {item.description && (
                                <div className="mt-6">
                                    <InfoItem
                                        label="Mô tả"
                                        value={item.description}
                                        icon={<FiFileText className="h-5 w-5" />}
                                        className="col-span-2"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border p-6"
                            style={{ borderColor: BORDER.DEFAULT }}>
                            <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiFileText className="mr-3 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Thông tin yêu cầu
                            </h2>
                            <div className="space-y-4">
                                <InfoItem
                                    label="Lý do yêu cầu"
                                    value={item.justification}
                                    icon={<FiFileText className="h-5 w-5" />}
                                    important={true}
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
                                    icon={<FiUser className="h-5 w-5" />}
                                />

                                <InfoItem
                                    label="Ngày yêu cầu"
                                    value={formatDate(item.createdDate)}
                                    icon={<FiClock className="h-5 w-5" />}
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
                                            icon={<FiUser className="h-5 w-5" />}
                                            important={true}
                                        />

                                        <InfoItem
                                            label="Ngày duyệt"
                                            value={formatDate(item.approvedAt)}
                                            icon={<FiClock className="h-5 w-5" />}
                                        />
                                    </>
                                )}

                                {item.status === 'Rejected' && (
                                    <>
                                        <InfoItem
                                            label="Ngày từ chối"
                                            value={formatDate(item.rejectedAt)}
                                            icon={<FiClock className="h-5 w-5" />}
                                        />
                                        <InfoItem
                                            label="Lý do từ chối"
                                            value={item.rejectionReason || 'Không có lý do'}
                                            icon={<FiFileText className="h-5 w-5" />}
                                            error={true}
                                            important={true}
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