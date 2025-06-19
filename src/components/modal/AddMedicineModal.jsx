import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from "../../constants/colors";
import { ButtonLoading } from "../Loading";
import medicalApi from "../../api/medicalApi";
import AlertModal from "./AlertModal";

const MedicineModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        type: 'Medication',
        name: '',
        description: '',
        dosage: '',
        form: '',
        expiryDate: '',
        quantity: '',
        unit: '',
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

    const formOptions = [
        { value: "Tablet", label: "Viên nén", unit: "Viên" },
        { value: "Syrup", label: "Siro", unit: "Chai" },
        { value: "Injection", label: "Tiêm", unit: "Chai" },
        { value: "Cream", label: "Kem", unit: "Tuýp" },
        { value: "Drops", label: "Nhỏ giọt", unit: "Chai" },
        { value: "Inhaler", label: "Hít", unit: "Bình" },
        { value: "Other", label: "Khác", unit: "Đơn vị" }
    ];

    const resetForm = () => {
        setFormData({
            type: 'Medication',
            name: '',
            description: '',
            dosage: '',
            form: '',
            expiryDate: '',
            quantity: '',
            unit: '',
            justification: '',
            priority: '',
            isUrgent: false
        });
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let updates = {
            [name]: type === 'checkbox' ? checked : value
        };
        if (name === 'form') {
            const selectedForm = formOptions.find(option => option.value === value);
            if (selectedForm) {
                updates.unit = selectedForm.unit;
            }
        }
        setFormData(prev => ({
            ...prev,
            ...updates
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!formData.name?.trim()) {
            errors.name = "Tên thuốc không được để trống";
        }
        if (!formData.form) {
            errors.form = "Vui lòng chọn dạng thuốc";
        }
        if (!formData.dosage?.trim()) {
            errors.dosage = "Liều lượng không được để trống";
        }
        if (!formData.quantity || formData.quantity <= 0) {
            errors.quantity = "Số lượng phải lớn hơn 0";
        }
        if (!formData.expiryDate) {
            errors.expiryDate = "Hạn sử dụng không được để trống";
        } else {
            const expiryDate = new Date(formData.expiryDate);
            expiryDate.setHours(0, 0, 0, 0);
            if (expiryDate <= today) {
                errors.expiryDate = "Hạn sử dụng phải lớn hơn ngày hiện tại";
            }
        }
        if (!formData.priority) {
            errors.priority = "Vui lòng chọn độ ưu tiên";
        }
        if (!formData.justification?.trim() || formData.justification.length < 10) {
            errors.justification = "Lý do phải có ít nhất 10 ký tự";
        }
        if (formData.isUrgent && !['High', 'Critical'].includes(formData.priority)) {
            errors.isUrgent = "Yêu cầu khẩn cấp phải có độ ưu tiên Cao hoặc Khẩn cấp";
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
            const response = await medicalApi.createMedicalItem(formData);
            if (response.success) {
                showAlertMessage('success', 'Thành công', 'Thêm thuốc mới thành công');
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Không thể thêm thuốc. Vui lòng thử lại.');
            }
        } catch (error) {
            showAlertMessage('error', 'Lỗi', 'Không thể thêm thuốc. Vui lòng thử lại.');
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
                            Thêm thuốc mới
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
                                    Tên thuốc *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.name ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập tên thuốc..."
                                />
                                {formErrors.name && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Dạng thuốc *
                                </label>
                                <select
                                    name="form"
                                    value={formData.form}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.form ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                >
                                    <option value="">Chọn dạng thuốc...</option>
                                    {formOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.form && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.form}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Liều lượng *
                                </label>
                                <input
                                    type="text"
                                    name="dosage"
                                    value={formData.dosage}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.dosage ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Ví dụ: 500mg/viên"
                                />
                                {formErrors.dosage && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.dosage}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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

                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Đơn vị
                                    </label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={formData.unit}
                                        disabled={true}
                                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-100"
                                        style={{ borderColor: BORDER.DEFAULT }}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Hạn sử dụng *
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.expiryDate ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                />
                                {formErrors.expiryDate && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.expiryDate}
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
                                    <option value="">Chọn độ ưu tiên...</option>
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
                                    placeholder="Nhập mô tả về thuốc..."
                                />
                                {formErrors.description && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.description}
                                    </p>
                                )}
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
                                    placeholder="Nhập lý do yêu cầu thuốc (tối thiểu 10 ký tự)..."
                                />
                                {formErrors.justification && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.justification}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isUrgent"
                                        checked={formData.isUrgent}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="h-5 w-5 rounded focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ color: PRIMARY[600], focusRingColor: PRIMARY[500] + '40' }}
                                    />
                                    <label className="ml-3 text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Yêu cầu khẩn cấp
                                    </label>
                                </div>
                                {formErrors.isUrgent && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.isUrgent}
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

export default MedicineModal; 