import React, { useState, useEffect } from 'react';
import { FiX, FiEye, FiCalendar, FiFileText } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR, COMMON } from '../../constants/colors';
import { ButtonLoading } from '../Loading';
import AlertModal from './AlertModal';
import healthProfileApi from '../../api/healthProfileApi';

const AddVisionRecordModal = ({ isOpen, onClose, onSave, studentId }) => {
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        leftEye: '',
        rightEye: '',
        checkDate: new Date().toLocaleString('sv-SE').slice(0, 16),
        comments: ''
    });

    useEffect(() => {
        if (isOpen) {
            resetForm();
            setFormErrors({});
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            leftEye: '',
            rightEye: '',
            checkDate: new Date().toLocaleString('sv-SE').slice(0, 16),
            comments: ''
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
        if (!formData.leftEye || formData.leftEye <= 0) {
            errors.leftEye = "Thị lực mắt trái phải lớn hơn 0";
        } else if (formData.leftEye > 10) {
            errors.leftEye = "Thị lực phải trong khoảng 1-10";
        }
        if (!formData.rightEye || formData.rightEye <= 0) {
            errors.rightEye = "Thị lực mắt phải phải lớn hơn 0";
        } else if (formData.rightEye > 10) {
            errors.rightEye = "Thị lực phải trong khoảng 1-10";
        }
        if (!formData.checkDate) {
            errors.checkDate = "Ngày kiểm tra không được để trống";
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
                leftEye: parseFloat(formData.leftEye),
                rightEye: parseFloat(formData.rightEye),
                checkDate: new Date(formData.checkDate).toISOString(),
                comments: formData.comments || ""
            };

            const response = await healthProfileApi.addVisionRecord(studentId, requestData);
            if (response.success) {
                showAlertMessage('success', 'Thành công', response.message || 'Thêm bản ghi thị lực thành công');
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Không thể thêm bản ghi thị lực. Vui lòng thử lại.');
            }
        } catch (error) {
            showAlertMessage('error', 'Lỗi', 'Không thể thêm bản ghi thị lực. Vui lòng thử lại.');
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
                            Thêm bản ghi thị lực
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
                                    Thị lực mắt trái (1-10) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiEye className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                    </div>
                                    <input
                                        type="number"
                                        name="leftEye"
                                        value={formData.leftEye}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full pl-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.leftEye ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Nhập thị lực mắt trái..."
                                        min="1"
                                        max="10"
                                    />
                                </div>
                                {formErrors.leftEye && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.leftEye}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Thị lực mắt phải (1-10) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiEye className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                    </div>
                                    <input
                                        type="number"
                                        name="rightEye"
                                        value={formData.rightEye}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full pl-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.rightEye ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Nhập thị lực mắt phải..."
                                        min="1"
                                        max="10"
                                    />
                                </div>
                                {formErrors.rightEye && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.rightEye}
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
                                        name="checkDate"
                                        value={formData.checkDate}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full pl-10 p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.checkDate ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    />
                                </div>
                                {formErrors.checkDate && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.checkDate}
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
                                        name="comments"
                                        value={formData.comments}
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

export default AddVisionRecordModal; 