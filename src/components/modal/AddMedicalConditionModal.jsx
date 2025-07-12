import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from '../../constants/colors';
import { ButtonLoading } from '../Loading';
import AlertModal from './AlertModal';
import healthProfileApi from '../../api/healthProfileApi';

const AddMedicalConditionModal = ({ isOpen, onClose, onSave, medicalRecordId, type }) => {
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        medicalRecordId: medicalRecordId || '',
        type: type || 'Allergy',
        name: '',
        severity: 'Mild',
        reaction: '',
        treatment: '',
        medication: '',
        diagnosisDate: new Date().toISOString().split('T')[0],
        hospital: '',
        doctor: '',
        notes: ''
    });

    const severityOptions = [
        { value: "Mild", label: "Nhẹ" },
        { value: "Moderate", label: "Trung bình" },
        { value: "Severe", label: "Nghiêm trọng" }
    ];

    useEffect(() => {
        if (isOpen && type) {
            setFormData(prev => ({
                ...prev,
                type: type,
                medicalRecordId: medicalRecordId || ''
            }));
            setFormErrors({});
        }
    }, [isOpen, type, medicalRecordId]);

    const resetForm = () => {
        setFormData({
            medicalRecordId: medicalRecordId || '',
            type: type || 'Allergy',
            name: '',
            severity: 'Mild',
            reaction: '',
            treatment: '',
            medication: '',
            diagnosisDate: new Date().toISOString().split('T')[0],
            hospital: '',
            doctor: '',
            notes: ''
        });
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const showAlertMessage = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlert(true);
    };

    const handleAlertClose = () => {
        setShowAlert(false);
        if (alertConfig.type === 'success') {
            resetForm();
            onSave && onSave();
            onClose();
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name?.trim()) {
            errors.name = "Tên bệnh không được để trống";
        }
        if (!formData.diagnosisDate) {
            errors.diagnosisDate = "Ngày chẩn đoán không được để trống";
        }
        if (!formData.severity) {
            errors.severity = "Mức độ nghiêm trọng không được để trống";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showAlertMessage('error', 'Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }
        setLoading(true);
        try {
            const response = await healthProfileApi.addMedicalCondition(formData);
            if (response.success) {
                showAlertMessage('success', 'Thành công', response.message || 'Thêm tình trạng y tế thành công');
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Không thể thêm tình trạng y tế. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error saving medical condition:', error);
            showAlertMessage('error', 'Lỗi', 'Không thể thêm tình trạng y tế. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getTypeTitle = (type) => {
        switch (type) {
            case 'ChronicDisease': return 'Bệnh mãn tính';
            case 'Allergy': return 'Dị ứng';
            case 'MedicalHistory': return 'Tiền sử y tế';
            default: return type;
        }
    };
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
                onClick={onClose}
            >
                <div
                    className="rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
                    style={{ backgroundColor: BACKGROUND.DEFAULT }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <h3 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                            Thêm {getTypeTitle(formData.type)}
                        </h3>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
                            style={{ color: GRAY[600] }}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Tên bệnh *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.name ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập tên bệnh..."
                                />
                                {formErrors.name && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Mức độ nghiêm trọng *
                                </label>
                                <select
                                    name="severity"
                                    value={formData.severity}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.severity ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                >
                                    {severityOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.severity && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.severity}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Ngày chẩn đoán *
                                </label>
                                <input
                                    type="date"
                                    name="diagnosisDate"
                                    value={formData.diagnosisDate}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.diagnosisDate ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                />
                                {formErrors.diagnosisDate && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.diagnosisDate}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Bệnh viện
                                </label>
                                <input
                                    type="text"
                                    name="hospital"
                                    value={formData.hospital}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.hospital ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Tên bệnh viện..."
                                />
                                {formErrors.hospital && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.hospital}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Bác sĩ điều trị
                                </label>
                                <input
                                    type="text"
                                    name="doctor"
                                    value={formData.doctor}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.doctor ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Tên bác sĩ..."
                                />
                                {formErrors.doctor && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.doctor}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Phản ứng
                                </label>
                                <textarea
                                    name="reaction"
                                    value={formData.reaction}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    rows={3}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.reaction ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Mô tả phản ứng của bệnh..."
                                />
                                {formErrors.reaction && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.reaction}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Phương pháp điều trị
                                </label>
                                <textarea
                                    name="treatment"
                                    value={formData.treatment}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    rows={3}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.treatment ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Phương pháp điều trị..."
                                />
                                {formErrors.treatment && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.treatment}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Thuốc điều trị
                                </label>
                                <textarea
                                    name="medication"
                                    value={formData.medication}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    rows={3}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.medication ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Danh sách thuốc đang sử dụng..."
                                />
                                {formErrors.medication && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.medication}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Ghi chú
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    rows={3}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.notes ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Ghi chú bổ sung..."
                                />
                                {formErrors.notes && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.notes}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={() => { resetForm(); onClose(); }}
                                disabled={loading}
                                className="flex-1 py-3 px-4 border rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ borderColor: BORDER.DEFAULT, color: TEXT.SECONDARY, backgroundColor: BACKGROUND.DEFAULT }}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, color: TEXT.INVERSE }}
                            >
                                {loading ? (
                                    <>
                                        <ButtonLoading size="small" className="mr-2" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Thêm mới"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <AlertModal
                isOpen={showAlert}
                onClose={handleAlertClose}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </>
    );
};

export default AddMedicalConditionModal; 