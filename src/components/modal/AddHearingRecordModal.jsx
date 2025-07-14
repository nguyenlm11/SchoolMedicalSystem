import React, { useState, useEffect } from 'react';
import { FiX, FiRadio, FiCalendar, FiFileText } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR, COMMON } from '../../constants/colors';
import { ButtonLoading } from '../Loading';
import AlertModal from './AlertModal';
import healthProfileApi from '../../api/healthProfileApi';

const AddHearingRecordModal = ({ isOpen, onClose, onSave, studentId }) => {
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        leftEar: '',
        rightEar: '',
        checkDateHearing: new Date().toLocaleString('sv-SE').slice(0, 16),
        commentsHearing: ''
    });

    useEffect(() => {
        if (isOpen) {
            resetForm();
            setFormErrors({});
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            leftEar: '',
            rightEar: '',
            checkDateHearing: new Date().toLocaleString('sv-SE').slice(0, 16),
            commentsHearing: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
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
            onSave?.();
            onClose();
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.leftEar || formData.leftEar.trim() === '') {
            errors.leftEar = "Thính lực tai trái không được để trống";
        }
        if (!formData.rightEar || formData.rightEar.trim() === '') {
            errors.rightEar = "Thính lực tai phải không được để trống";
        }
        if (!formData.checkDateHearing) {
            errors.checkDateHearing = "Ngày kiểm tra không được để trống";
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
            const requestData = {
                leftEar: formData.leftEar.trim(),
                rightEar: formData.rightEar.trim(),
                checkDateHearing: new Date(formData.checkDateHearing).toISOString(),
                commentsHearing: formData.commentsHearing || ""
            };

            const response = await healthProfileApi.addHearingRecord(studentId, requestData);
            if (response.success) {
                showAlertMessage('success', 'Thành công', response.message || 'Thêm bản ghi thính lực thành công');
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Không thể thêm bản ghi thính lực. Vui lòng thử lại.');
            }
        } catch (error) {
            showAlertMessage('error', 'Lỗi', 'Không thể thêm bản ghi thính lực. Vui lòng thử lại.');
        } finally {
            setLoading(false);
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
                            Thêm bản ghi thính lực
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
                                    Thính lực tai trái *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiRadio className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                    </div>
                                    <input
                                        type="text"
                                        name="leftEar"
                                        value={formData.leftEar}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full pl-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.leftEar ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Nhập thính lực tai trái..."
                                    />
                                </div>
                                {formErrors.leftEar && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.leftEar}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Thính lực tai phải *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiRadio className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                    </div>
                                    <input
                                        type="text"
                                        name="rightEar"
                                        value={formData.rightEar}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full pl-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.rightEar ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Nhập thính lực tai phải..."
                                    />
                                </div>
                                {formErrors.rightEar && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.rightEar}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Ngày kiểm tra *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiCalendar className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        name="checkDateHearing"
                                        value={formData.checkDateHearing}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full pl-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.checkDateHearing ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    />
                                </div>
                                {formErrors.checkDateHearing && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.checkDateHearing}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Ghi chú
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                        <FiFileText className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                    </div>
                                    <textarea
                                        name="commentsHearing"
                                        value={formData.commentsHearing}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        rows="4"
                                        className="w-full pl-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 resize-none"
                                        style={{ borderColor: BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Nhập ghi chú (tùy chọn)..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50"
                                style={{ color: TEXT.PRIMARY, border: `1px solid ${BORDER.DEFAULT}` }}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 flex items-center"
                                style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE }}
                            >
                                {loading ? (
                                    <>
                                        <ButtonLoading size="small" color="white" />
                                        <span className="ml-2">Đang lưu...</span>
                                    </>
                                ) : (
                                    'Lưu bản ghi'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <AlertModal
                isOpen={showAlert}
                onClose={handleAlertClose}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
            />
        </>
    );
};

export default AddHearingRecordModal; 