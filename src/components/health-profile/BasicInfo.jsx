import React, { useState, useCallback } from 'react';
import { PRIMARY, TEXT, GRAY, COMMON, ERROR } from '../../constants/colors';
import { FiUser, FiMail, FiPhone, FiAlertTriangle, FiEdit3, FiCheck, FiX } from 'react-icons/fi';
import healthProfileApi from '../../api/healthProfileApi';
import { useAuth } from '../../utils/AuthContext';
import AlertModal from '../modal/AlertModal';

const ReadOnlyField = ({ label, value, showIcon = false, icon: Icon }) => (
    <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
        <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>{label}</p>
        <p className="text-lg font-semibold flex items-center" style={{ color: TEXT.PRIMARY }}>
            {showIcon && Icon && <Icon className="h-5 w-5 mr-2" style={{ color: PRIMARY[500] }} />}
            {value || "Chưa cập nhật"}
        </p>
    </div>
);

const EditableField = ({ label, value, icon: Icon, isEditing, onEdit, onSave, onCancel, fieldName, canEdit, error, onInputChange }) => {
    const [editValue, setEditValue] = useState(value || '');
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setEditValue(newValue);
        onInputChange?.(fieldName, newValue);
    };

    const handleSave = useCallback(() => {
        onSave(fieldName, editValue);
    }, [fieldName, editValue, onSave]);

    const handleCancel = useCallback(() => {
        setEditValue(value || '');
        onCancel();
    }, [value, onCancel]);

    React.useEffect(() => {
        setEditValue(value || '');
    }, [value]);

    if (isEditing) {
        return (
            <div className="bg-white rounded-xl p-4 border transition-all duration-300" style={{ borderColor: error ? ERROR[500] : GRAY[200] }}>
                <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>{label}</p>
                <div className="flex items-center">
                    {Icon && <Icon className="h-5 w-5 mr-2" style={{ color: PRIMARY[500] }} />}
                    <input
                        type="text"
                        value={editValue}
                        onChange={handleInputChange}
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: error ? ERROR[500] : GRAY[300], focusRingColor: PRIMARY[500] }}
                        autoFocus
                    />
                </div>
                {error && (
                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                        {error}
                    </p>
                )}
                <div className="flex space-x-2 mt-2 justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE }}
                    >
                        Lưu
                    </button>
                    <button
                        onClick={handleCancel}
                        className="flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: GRAY[300], color: TEXT.PRIMARY }}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md relative group" style={{ borderColor: GRAY[200] }}>
            <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>{label}</p>
            <p className="text-lg font-semibold flex items-center" style={{ color: TEXT.PRIMARY }}>
                {Icon && <Icon className="h-5 w-5 mr-2" style={{ color: PRIMARY[500] }} />}
                {value !== 'Unknown' ? value : "Chưa cập nhật"}
            </p>
            {canEdit && (
                <button
                    onClick={() => onEdit(fieldName)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100"
                    style={{ color: PRIMARY[500] }}
                >
                    <FiEdit3 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

const BasicInfo = ({ data, onUpdate, recordId }) => {
    const { user } = useAuth();
    const [editingField, setEditingField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [editData, setEditData] = useState({});
    const canEdit = user?.role === 'parent';

    const showAlertMessage = useCallback((type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlert(true);
    }, []);

    const handleAlertClose = useCallback(() => {
        setShowAlert(false);
        if (alertConfig.type === 'success') {
            onUpdate?.();
        }
    }, [alertConfig.type, onUpdate]);

    const handleEdit = useCallback((fieldName) => {
        setEditingField(fieldName);
        setEditData(prev => ({ ...prev, [fieldName]: data[fieldName] || '' }));
        if (formErrors[fieldName]) {
            setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
        }
    }, [data, formErrors]);

    const handleCancel = useCallback(() => {
        setEditingField(null);
        setEditData({});
        setFormErrors({});
    }, []);

    const handleInputChange = useCallback((fieldName, value) => {
        setEditData(prev => ({ ...prev, [fieldName]: value }));
        if (formErrors[fieldName]) {
            setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
        }
    }, [formErrors]);

    const validateField = useCallback((fieldName, value) => {
        if (!value?.trim()) return 'Vui lòng nhập thông tin';
        if (fieldName === 'emergencyContact') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return 'Vui lòng nhập email hợp lệ';
        }
        if (fieldName === 'emergencyContactPhone') {
            const phoneRegex = /^[0-9+\-\s()]+$/;
            if (!phoneRegex.test(value) || value.length !== 10) return 'Vui lòng nhập số điện thoại hợp lệ (10 số)';
        }
        return null;
    }, []);

    const handleSave = useCallback(async (fieldName, value) => {
        const error = validateField(fieldName, value);
        if (error) {
            setFormErrors(prev => ({ ...prev, [fieldName]: error }));
            return;
        }
        setIsLoading(true);
        try {
            const response = await healthProfileApi.updateBasicInfo(recordId, { [fieldName]: value.trim() });

            if (response.success) {
                setEditingField(null);
                setEditData({});
                setFormErrors({});
                showAlertMessage('success', 'Thành công', 'Cập nhật thông tin thành công');
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
            }
        } catch (error) {
            showAlertMessage('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }, [recordId, validateField, showAlertMessage]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                    <span className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[400]}, ${PRIMARY[600]})` }}>
                        <FiUser className="h-6 w-6" />
                    </span>
                    Thông tin cơ bản học sinh
                </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ReadOnlyField label="Họ và tên học sinh" value={data.studentName} />
                    <ReadOnlyField label="Mã học sinh" value={data.studentCode} />
                    <EditableField
                        label="Nhóm máu"
                        value={editData.bloodType ?? data.bloodType}
                        isEditing={editingField === 'bloodType'}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        fieldName="bloodType"
                        canEdit={canEdit}
                        error={formErrors.bloodType}
                        onInputChange={handleInputChange}
                    />
                </div>

                <div className="mt-6 p-4 rounded-xl bg-white border" style={{ borderColor: GRAY[200] }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>Thông tin liên hệ khẩn cấp</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableField
                            label="Email liên hệ"
                            value={editData.emergencyContact ?? data.emergencyContact}
                            icon={FiMail}
                            isEditing={editingField === 'emergencyContact'}
                            onEdit={handleEdit}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            fieldName="emergencyContact"
                            canEdit={canEdit}
                            error={formErrors.emergencyContact}
                            onInputChange={handleInputChange}
                        />
                        <EditableField
                            label="Số điện thoại"
                            value={editData.emergencyContactPhone ?? data.emergencyContactPhone}
                            icon={FiPhone}
                            isEditing={editingField === 'emergencyContactPhone'}
                            onEdit={handleEdit}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            fieldName="emergencyContactPhone"
                            canEdit={canEdit}
                            error={formErrors.emergencyContactPhone}
                            onInputChange={handleInputChange}
                        />
                    </div>
                </div>

                {data.needsUpdate && (
                    <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                        <div className="flex items-center">
                            <FiAlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                            <p className="text-sm font-medium text-yellow-800">
                                Hồ sơ cần được cập nhật thông tin mới
                            </p>
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm text-blue-800">Đang cập nhật thông tin...</p>
                    </div>
                )}
            </div>

            <AlertModal
                isOpen={showAlert}
                onClose={handleAlertClose}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
            />
        </div>
    );
};

export default BasicInfo; 