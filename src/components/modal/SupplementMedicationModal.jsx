import React, { useState, useEffect } from 'react';
import { FiX, FiPackage, FiCalendar, FiPlus, FiFileText } from 'react-icons/fi';
import { PRIMARY, ERROR, TEXT, BACKGROUND, BORDER, GRAY } from '../../constants/colors';
import AlertModal from './AlertModal';

const SupplementMedicationModal = ({ isOpen, onClose, medicationData, onSubmit }) => {
    const [formData, setFormData] = useState({
        additionalQuantity: '',
        quantityUnit: '',
        newExpiryDate: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertModal, setAlertModal] = useState({ open: false, type: 'info', title: '', message: '' });

    useEffect(() => {
        if (isOpen && medicationData) {
            setFormData({
                additionalQuantity: '',
                quantityUnit: medicationData.quantityUnit,
                newExpiryDate: '',
                notes: ''
            });
            setErrors({});
        }
    }, [isOpen, medicationData]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.additionalQuantity || formData.additionalQuantity <= 0) {
            newErrors.additionalQuantity = 'Vui lòng nhập số lượng bổ sung hợp lệ';
        }
        if (!formData.quantityUnit) {
            newErrors.quantityUnit = 'Vui lòng chọn đơn vị';
        }
        if (!formData.newExpiryDate) {
            newErrors.newExpiryDate = 'Vui lòng chọn ngày hết hạn mới';
        } else {
            const selectedDate = new Date(formData.newExpiryDate);
            const today = new Date();
            if (selectedDate <= today) {
                newErrors.newExpiryDate = 'Ngày hết hạn phải lớn hơn ngày hiện tại';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) { return }
        setIsSubmitting(true);
        try {
            const requestData = {
                studentMedicationId: medicationData.id,
                additionalQuantity: parseInt(formData.additionalQuantity),
                quantityUnit: formData.quantityUnit,
                newExpiryDate: new Date(formData.newExpiryDate).toISOString(),
                notes: formData.notes.trim() || null
            };
            const result = await onSubmit(requestData);
            if (result && result.success) {
                setAlertModal({ open: true, type: 'success', title: 'Thành công', message: 'Đã bổ sung thuốc thành công!' });
            } else {
                setAlertModal({ open: true, type: 'error', title: 'Lỗi', message: result?.message || 'Không thể bổ sung thuốc. Vui lòng thử lại.' });
            }
        } catch (error) {
            setAlertModal({ open: true, type: 'error', title: 'Lỗi', message: 'Đã xảy ra lỗi khi bổ sung thuốc. Vui lòng thử lại.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const getQuantityUnitLabel = (unit) => {
        const unitMap = { Bottle: 'Chai', Tablet: 'Viên', Pack: 'Gói' };
        return unitMap[unit] || unit;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
                </div>

                <div className="inline-block align-bottom rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="relative" style={{ backgroundColor: BACKGROUND.DEFAULT }}>
                        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: PRIMARY[100] }}>
                                    <FiPlus className="w-5 h-5" style={{ color: PRIMARY[600] }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        Bổ sung thuốc
                                    </h3>
                                    <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                        Thêm thuốc mới cho học sinh
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                style={{ backgroundColor: GRAY[100], color: TEXT.PRIMARY }}
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {medicationData && (
                            <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT, backgroundColor: GRAY[25] }}>
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: PRIMARY[100] }}>
                                        <FiPackage className="w-4 h-4" style={{ color: PRIMARY[600] }} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                            {medicationData.medicationName}
                                        </h4>
                                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                            {medicationData.studentName} • {medicationData.dosage}/lần • {medicationData.frequencyCount} lần/ngày
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                            Hiện tại: {medicationData.quantityReceive}/{medicationData.quantitySent} {getQuantityUnitLabel(medicationData.quantityUnit)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Số lượng bổ sung <span style={{ color: ERROR[500] }}>*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${errors.additionalQuantity ? 'border-red-500' : 'border-gray-300'}`}
                                            style={{ backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                            placeholder="Nhập số lượng..."
                                            value={formData.additionalQuantity}
                                            onChange={(e) => handleInputChange('additionalQuantity', e.target.value)}
                                        />
                                    </div>
                                    {errors.additionalQuantity && (
                                        <p className="mt-1 text-sm" style={{ color: ERROR[500] }}>
                                            {errors.additionalQuantity}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Đơn vị <span style={{ color: ERROR[500] }}>*</span>
                                    </label>
                                    <select
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${errors.quantityUnit ? 'border-red-500' : 'border-gray-300'}`}
                                        style={{ backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, }}
                                        value={formData.quantityUnit}
                                        onChange={(e) => handleInputChange('quantityUnit', e.target.value)}
                                    >
                                        <option value="Bottle">Chai</option>
                                        <option value="Tablet">Viên</option>
                                        <option value="Pack">Gói</option>
                                    </select>
                                    {errors.quantityUnit && (
                                        <p className="mt-1 text-sm" style={{ color: ERROR[500] }}>
                                            {errors.quantityUnit}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Ngày hết hạn mới <span style={{ color: ERROR[500] }}>*</span>
                                </label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: GRAY[400] }} />
                                    <input
                                        type="date"
                                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${errors.newExpiryDate ? 'border-red-500' : 'border-gray-300'}`}
                                        style={{ backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.newExpiryDate}
                                        onChange={(e) => handleInputChange('newExpiryDate', e.target.value)}
                                    />
                                </div>
                                {errors.newExpiryDate && (
                                    <p className="mt-1 text-sm" style={{ color: ERROR[500] }}>
                                        {errors.newExpiryDate}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Ghi chú
                                </label>
                                <div className="relative">
                                    <FiFileText className="absolute left-4 top-4 w-4 h-4" style={{ color: GRAY[400] }} />
                                    <textarea
                                        rows="3"
                                        className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        placeholder="Nhập ghi chú (tùy chọn)..."
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 border rounded-lg font-medium transition-all duration-200 hover:opacity-80"
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 flex items-center space-x-2"
                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <FiPlus className="w-4 h-4" /> Bổ sung
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={alertModal.open}
                onClose={() => {
                    setAlertModal({ ...alertModal, open: false });
                    if (alertModal.type === 'success') {
                        onClose();
                    }
                }}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                okText="Đóng"
            />
        </div>
    );
};

export default SupplementMedicationModal; 