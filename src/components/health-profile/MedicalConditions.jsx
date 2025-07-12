import React, { useState } from 'react';
import { PRIMARY, TEXT, GRAY, COMMON } from '../../constants/colors';
import { FiAlertTriangle, FiHeart, FiActivity, FiClock, FiUser, FiFileText, FiMapPin, FiPackage, FiAlertCircle, FiPlus, FiEye, FiShield } from 'react-icons/fi';
import { useAuth } from '../../utils/AuthContext';
import AddMedicalConditionModal from '../modal/AddMedicalConditionModal';
import ViewAllMedicalConditionsModal from '../modal/ViewAllMedicalConditionsModal';

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
            <span className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: PRIMARY[50], color: PRIMARY[500] }}>            {icon} </span>
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
                                style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)`, color: 'white' }}>
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

const MedicalConditions = ({ conditions = [], medicalRecordId, onConditionAdded }) => {
    const { user } = useAuth();
    const canAddCondition = user && user.role === 'parent';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('Allergy');
    const [viewAllType, setViewAllType] = useState('Allergy');

    const handleAddCondition = (type) => {
        setSelectedType(type);
        setIsModalOpen(true);
    };

    const handleViewAll = (type) => {
        setViewAllType(type);
        setIsViewAllModalOpen(true);
    };

    const getSeverityScore = (severity) => {
        switch (severity) {
            case 'Severe': return 3;
            case 'Moderate': return 2;
            case 'Mild': return 1;
            default: return 0;
        }
    };

    const selectedConditions = conditions.reduce((acc, condition) => {
        const type = condition.type;
        if (!acc[type]) {
            acc[type] = condition;
        } else {
            const currentSeverityScore = getSeverityScore(acc[type].severity);
            const newSeverityScore = getSeverityScore(condition.severity);
            const currentDate = new Date(acc[type].diagnosisDate);
            const newDate = new Date(condition.diagnosisDate);
            if (newSeverityScore > currentSeverityScore ||
                (newSeverityScore === currentSeverityScore && newDate > currentDate)) {
                acc[type] = condition;
            }
        }
        return acc;
    }, {});

    const getTypeTitle = (type) => {
        switch (type) {
            case 'ChronicDisease': return 'Bệnh mãn tính';
            case 'Allergy': return 'Dị ứng';
            case 'MedicalHistory': return 'Tiền sử y tế';
            default: return type;
        }
    };

    const getConditionsByType = (type) => {
        return conditions.filter(condition => condition.type === type);
    };

    const allTypes = ['ChronicDisease', 'Allergy', 'MedicalHistory'];
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

            <div className="grid grid-cols-1 gap-6">
                {allTypes.map((type) => {
                    const condition = selectedConditions[type];
                    return (
                        <div key={type} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>
                                    {getTypeTitle(type)}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleViewAll(type)}
                                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                                        style={{ color: PRIMARY[600], border: `1px solid ${PRIMARY[200]}` }}
                                    >
                                        <FiEye className="h-4 w-4 mr-1" /> Xem tất cả
                                    </button>
                                    {canAddCondition && (
                                        <button
                                            onClick={() => handleAddCondition(type)}
                                            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                                            style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE, border: `1px solid ${PRIMARY[600]}` }}
                                        >
                                            <FiPlus className="h-4 w-4 mr-1" /> Thêm
                                        </button>
                                    )}
                                </div>
                            </div>
                            {condition ? (
                                <ConditionCard condition={condition} />
                            ) : (
                                <div className="bg-white rounded-xl border p-6 text-center flex flex-col items-center" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                        style={{ backgroundColor: PRIMARY[100] }}>
                                        <FiShield className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                                    </div>
                                    <p className="text-lg font-medium" style={{ color: TEXT.SECONDARY }}>
                                        Chưa có thông tin {getTypeTitle(type).toLowerCase()}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <AddMedicalConditionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onConditionAdded}
                medicalRecordId={medicalRecordId}
                type={selectedType}
            />

            <ViewAllMedicalConditionsModal
                isOpen={isViewAllModalOpen}
                onClose={() => setIsViewAllModalOpen(false)}
                conditions={getConditionsByType(viewAllType)}
                type={viewAllType}
                typeTitle={getTypeTitle(viewAllType)}
            />
        </div>
    );
};

export default MedicalConditions; 