import React from 'react';
import { FiX, FiAlertTriangle, FiFileText, FiHeart, FiActivity, FiClock } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW } from '../../constants/colors';

const ViewAllMedicalConditionsModal = ({ isOpen, onClose, conditions, type, typeTitle }) => {
    if (!isOpen) return null;

    const getTypeIcon = (type) => {
        const iconMap = {
            'ChronicDisease': FiHeart,
            'Allergy': FiAlertTriangle,
            'MedicalHistory': FiClock
        };
        const IconComponent = iconMap[type] || FiActivity;
        return <IconComponent className="h-6 w-6" />;
    };

    const getSeverityColor = (severity) => {
        const severityMap = {
            'severe': 'text-red-600 bg-red-50 border-red-200',
            'nghiêm trọng': 'text-red-600 bg-red-50 border-red-200',
            'moderate': 'text-yellow-600 bg-yellow-50 border-yellow-200',
            'trung bình': 'text-yellow-600 bg-yellow-50 border-yellow-200',
            'mild': 'text-green-600 bg-green-50 border-green-200',
            'nhẹ': 'text-green-600 bg-green-50 border-green-200'
        };
        return severityMap[severity?.toLowerCase()] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const InfoField = ({ label, value }) => {
        if (!value) return null;
        return (
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[500] }}>
                        <FiFileText className="h-4 w-4" />
                    </span>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold mb-1" style={{ color: TEXT.SECONDARY }}>
                        {label}
                    </p>
                    <p className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                        {value}
                    </p>
                </div>
            </div>
        );
    };

    const ConditionCard = ({ condition }) => (
        <div className="border rounded-xl p-6 hover:shadow-lg transition-all duration-200"
            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT }}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                        {condition.name || 'Không có tên'}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: TEXT.SECONDARY }}>
                        {condition.typeDisplay} • Chẩn đoán ngày {new Date(condition.diagnosisDate).toLocaleDateString('vi-VN')}
                    </p>
                </div>
                {condition.severityDisplay && (
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getSeverityColor(condition.severity)}`}>
                        {condition.severityDisplay}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <InfoField label="Phản ứng" value={condition.reaction} />
                <InfoField label="Điều trị" value={condition.treatment} />
                <InfoField label="Thuốc" value={condition.medication} />
                <InfoField label="Bệnh viện" value={condition.hospital} />
                <InfoField label="Bác sĩ" value={condition.doctor} />
                <div className="md:col-span-2">
                    <InfoField label="Ghi chú" value={condition.notes} />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: BORDER.LIGHT }}>
                <div className="flex items-center justify-between text-xs" style={{ color: TEXT.SECONDARY }}>
                    <span>Ngày tạo: {new Date(condition.createdDate).toLocaleDateString('vi-VN')}</span>
                    {condition.lastUpdatedDate && (
                        <span>Cập nhật: {new Date(condition.lastUpdatedDate).toLocaleDateString('vi-VN')}</span>
                    )}
                </div>
            </div>
        </div>
    );

    const EmptyState = () => (
        <div className="text-center py-12">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
                style={{ backgroundColor: GRAY[100] }}>
                <div style={{ color: GRAY[400] }}>
                    {getTypeIcon(type)}
                </div>
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: TEXT.PRIMARY }}>
                Không có {typeTitle.toLowerCase()}
            </h3>
            <p style={{ color: TEXT.SECONDARY }}>
                Chưa có thông tin {typeTitle.toLowerCase()} nào được ghi nhận.
            </p>
        </div>
    );

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
            onClick={handleBackdropClick}
        >
            <div
                className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
                style={{ backgroundColor: BACKGROUND.DEFAULT, boxShadow: `0 25px 50px -12px ${SHADOW.DARK}, 0 0 0 1px ${GRAY[100]}` }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl"
                            style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)`, color: 'white' }}>
                            {getTypeIcon(type)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Tất cả {typeTitle}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:scale-95"
                        style={{ color: GRAY[600] }}
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {conditions.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-6">
                            {conditions.map((condition, index) => (
                                <ConditionCard key={condition.id || index} condition={condition} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewAllMedicalConditionsModal; 