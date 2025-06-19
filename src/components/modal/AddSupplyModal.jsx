import React, { useState } from "react";
import { FiX, FiBox } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from "../../constants/colors";
import { ButtonLoading } from "../Loading";
import medicalApi from "../../api/medicalApi";
import AlertModal from "./AlertModal";

const AddSupplyModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        type: 'Supply',
        name: '',
        description: '',
        quantity: '',
        unit: 'Đơn vị',
        justification: '',
        priority: '',
        isUrgent: false
    });

    const priorityOptions = [
        { value: "Low", label: "Thấp" },
        { value: "Normal", label: "Bình thường" },
        { value: "High", label: "Cao" },
        { value: "Critical", label: "Khẩn cấp" }
    ];

    const resetForm = () => {
        setFormData({
            type: 'Supply',
            name: '',
            description: '',
            quantity: '',
            unit: 'Đơn vị',
            justification: '',
            priority: '',
            isUrgent: false
        });
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
            onSuccess && onSuccess();
            onClose();
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name?.trim()) {
            errors.name = "Tên vật tư không được để trống";
        }
        if (!formData.quantity || formData.quantity <= 0) {
            errors.quantity = "Số lượng phải lớn hơn 0";
        }
        if (!formData.justification?.trim() || formData.justification.length < 10) {
            errors.justification = "Lý do yêu cầu phải có ít nhất 10 ký tự";
        }
        if (formData.isUrgent && (!formData.priority || !['High', 'Critical'].includes(formData.priority))) {
            errors.priority = "Yêu cầu khẩn cấp phải có độ ưu tiên Cao hoặc Khẩn cấp";
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setLoading(true);
        try {
            const submitData = {
                ...formData,
                type: 'Supply',
                expiryDate: formData.expiryDate || null
            };
            const response = await medicalApi.createMedicalItem(submitData);
            if (response.success) {
                showAlertMessage('success', 'Thành công', 'Thêm vật tư y tế mới thành công');
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Có lỗi xảy ra khi thêm vật tư y tế');
            }
        } catch (error) {
            console.error('Error creating supply:', error);
            showAlertMessage('error', 'Lỗi', 'Có lỗi xảy ra khi thêm vật tư y tế');
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
                        <div className="flex items-center">
                            <div
                                className="h-12 w-12 rounded-xl flex items-center justify-center mr-4"
                                style={{ backgroundColor: PRIMARY[100] }}
                            >
                                <FiBox className="h-6 w-6" style={{ color: PRIMARY[600] }} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    Thêm vật tư y tế mới
                                </h3>
                                <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                    Nhập thông tin vật tư y tế mới
                                </p>
                            </div>
                        </div>
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
                                    Tên vật tư *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.name ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập tên vật tư..."
                                />
                                {formErrors.name && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Độ ưu tiên *
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.priority ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                >
                                    <option value="">Chọn độ ưu tiên</option>
                                    {priorityOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.priority && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.priority}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Số lượng *
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        min="1"
                                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.quantity ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Số lượng..."
                                    />
                                    {formErrors.quantity && (
                                        <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                            {formErrors.quantity}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    rows={3}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.description ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập mô tả vật tư y tế..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Lý do yêu cầu *
                                </label>
                                <textarea
                                    name="justification"
                                    value={formData.justification}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    rows={3}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.justification ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập lý do yêu cầu vật tư (tối thiểu 10 ký tự)..."
                                />
                                {formErrors.justification && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.justification}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isUrgent"
                                        checked={formData.isUrgent}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-offset-0"
                                    />
                                    <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Đánh dấu là yêu cầu khẩn cấp
                                    </span>
                                </label>
                                <p className="text-xs mt-1 ml-7" style={{ color: TEXT.SECONDARY }}>
                                    Yêu cầu khẩn cấp cần có độ ưu tiên Cao hoặc Khẩn cấp
                                </p>
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

export default AddSupplyModal; 