import React from 'react';
import { PRIMARY, TEXT, GRAY } from '../../constants/colors';
import { FiAlertTriangle, FiHeart, FiActivity, FiClock, FiUser, FiFileText, FiMapPin, FiPackage, FiAlertCircle } from 'react-icons/fi';

const SeverityBadge = ({ severity, severityDisplay }) => {
    let color = '';
    let bgColor = '';
    let icon = null;
    switch (severity) {
        case 'Mild':
            color = 'text-green-600';
            bgColor = 'bg-green-50 border-green-200';
            icon = <FiAlertCircle className="h-4 w-4 mr-1" />;
            break;
        case 'Moderate':
            color = 'text-yellow-600';
            bgColor = 'bg-yellow-50 border-yellow-200';
            icon = <FiAlertTriangle className="h-4 w-4 mr-1" />;
            break;
        case 'Severe':
            color = 'text-red-600';
            bgColor = 'bg-red-50 border-red-200';
            icon = <FiAlertTriangle className="h-4 w-4 mr-1" />;
            break;
        default:
            color = 'text-gray-600';
            bgColor = 'bg-gray-50 border-gray-200';
            icon = <FiAlertCircle className="h-4 w-4 mr-1" />;
    }
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${color} ${bgColor}`}>
            {icon}
            {severityDisplay}
        </span>
    );
};

const InfoField = ({ label, value, icon }) => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: PRIMARY[50], color: PRIMARY[500] }}>
                {icon}
            </span>
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>{label}</p>
            <p className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>{value || "Không có"}</p>
        </div>
    </div>
);

const ConditionCard = ({ condition }) => {
    const diagnosisDate = new Date(condition.diagnosisDate).toLocaleDateString('vi-VN');
    const createdDate = new Date(condition.createdDate).toLocaleDateString('vi-VN');

    let TypeIcon;
    switch (condition.type) {
        case 'ChronicDisease':
            TypeIcon = FiHeart;
            break;
        case 'Allergy':
            TypeIcon = FiAlertTriangle;
            break;
        case 'MedicalHistory':
            TypeIcon = FiClock;
            break;
        default:
            TypeIcon = FiActivity;
    }

    return (
        <div className="bg-white rounded-xl border transition-all duration-300 hover:shadow-lg" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="flex items-center justify-center w-10 h-10 rounded-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)`,
                                    color: 'white'
                                }}>
                                <TypeIcon className="h-6 w-6" />
                            </span>
                            <div>
                                <h4 className="text-xl font-bold" style={{ color: TEXT.PRIMARY }}>{condition.name}</h4>
                                <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                    {condition.typeDisplay} • Chẩn đoán ngày {diagnosisDate}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <SeverityBadge severity={condition.severity} severityDisplay={condition.severityDisplay} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InfoField label="Phản ứng" value={condition.reaction} icon={<FiActivity className="h-5 w-5" />} />
                    <InfoField label="Phương pháp điều trị" value={condition.treatment} icon={<FiPackage className="h-5 w-5" />} />
                    <InfoField label="Thuốc điều trị" value={condition.medication} icon={<FiPackage className="h-5 w-5" />} />
                    <InfoField label="Bệnh viện" value={condition.hospital} icon={<FiMapPin className="h-5 w-5" />} />
                    <InfoField label="Bác sĩ điều trị" value={condition.doctor} icon={<FiUser className="h-5 w-5" />} />
                    <InfoField label="Ghi chú" value={condition.notes} icon={<FiFileText className="h-5 w-5" />} />
                </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl" style={{ borderColor: GRAY[200] }}>
                <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                        Ngày tạo: {createdDate}
                    </p>
                    {condition.lastUpdatedDate && (
                        <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                            Cập nhật lần cuối: {new Date(condition.lastUpdatedDate).toLocaleDateString('vi-VN')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const MedicalConditions = ({ conditions = [] }) => {
    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                        <span className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
                            <FiActivity className="h-6 w-6" />
                        </span>
                        Tình trạng y tế
                    </h2>
                </div>
                <div className="bg-white rounded-2xl p-6 border shadow-sm text-center" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
                    <p className="text-lg" style={{ color: TEXT.SECONDARY }}>Không có tình trạng y tế nào cần lưu ý</p>
                </div>
            </div>
        );
    }

    const groupedConditions = conditions.reduce((acc, condition) => {
        const type = condition.type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(condition);
        return acc;
    }, {});

    const getTypeTitle = (type) => {
        switch (type) {
            case 'ChronicDisease':
                return 'Bệnh mãn tính';
            case 'Allergy':
                return 'Dị ứng';
            case 'MedicalHistory':
                return 'Tiền sử bệnh';
            default:
                return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                    <span className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
                        <FiActivity className="h-6 w-6" />
                    </span>
                    Tình trạng y tế
                </h2>
            </div>

            {Object.entries(groupedConditions).map(([type, conditions]) => (
                <div key={type} className="space-y-4">
                    <h3 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>
                        {getTypeTitle(type)}
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        {conditions.map((condition, index) => (
                            <ConditionCard key={condition.id || index} condition={condition} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MedicalConditions; 