import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from "../../constants/colors";
import { ButtonLoading } from "../Loading";
import userApi from "../../api/userApi";
import AlertModal from "./AlertModal";

const RELATIONSHIP_OPTIONS = [
    { value: "Father", label: "Bố" },
    { value: "Mother", label: "Mẹ" },
    { value: "Guardian", label: "Người giám hộ" }
];

const GENDER_OPTIONS = [
    { value: "Male", label: "Nam" },
    { value: "Female", label: "Nữ" },
    { value: "Other", label: "Khác" }
];

const AddParentModal = ({ isOpen, onClose, onSuccess, selectedParent }) => {
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        fullName: "",
        phoneNumber: "",
        address: "",
        gender: "Male",
        dateOfBirth: "",
        relationship: ""
    });

    useEffect(() => {
        if (selectedParent) {
            const formattedDate = selectedParent.dateOfBirth ? new Date(selectedParent.dateOfBirth).toISOString().split('T')[0] : "";
            setFormData({
                username: selectedParent.username || "",
                email: selectedParent.email || "",
                fullName: selectedParent.fullName || "",
                phoneNumber: selectedParent.phoneNumber || "",
                address: selectedParent.address || "",
                gender: selectedParent.gender || "Male",
                dateOfBirth: formattedDate,
                relationship: selectedParent.relationship || ""
            });
        } else { resetForm() }
    }, [selectedParent]);

    const resetForm = () => {
        setFormData({
            username: "",
            email: "",
            fullName: "",
            phoneNumber: "",
            address: "",
            gender: "Male",
            dateOfBirth: "",
            relationship: ""
        });
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'dateOfBirth' && value ? new Date(value).toISOString().split('T')[0] : value;
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
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
            onClose();
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.username?.trim()) {
            errors.username = "Tên đăng nhập không được để trống";
        }
        if (!formData.email?.trim()) {
            errors.email = "Email không được để trống";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Email không hợp lệ";
        }
        if (!formData.fullName?.trim()) {
            errors.fullName = "Họ tên không được để trống";
        }
        if (!formData.phoneNumber?.trim()) {
            errors.phoneNumber = "Số điện thoại không được để trống";
        } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = "Số điện thoại không hợp lệ (10 số)";
        }
        if (!formData.dateOfBirth) {
            errors.dateOfBirth = "Ngày sinh không được để trống";
        }
        if (!formData.relationship) {
            errors.relationship = "Vui lòng chọn mối quan hệ";
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
            const response = selectedParent
                ? await userApi.updateParent(selectedParent.id, formData)
                : await userApi.createParent(formData);

            if (response.success) {
                resetForm();
                onSuccess(response.message || (selectedParent ? 'Cập nhật phụ huynh thành công' : 'Thêm phụ huynh mới thành công'));
                onClose();
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Không thể thực hiện. Vui lòng thử lại.');
            }
        } catch (error) {
            showAlertMessage('error', 'Lỗi', 'Không thể thực hiện. Vui lòng thử lại.');
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
                            {selectedParent ? 'Cập nhật phụ huynh' : 'Thêm phụ huynh mới'}
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
                                    Tên đăng nhập *
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.username ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập tên đăng nhập..."
                                />
                                {formErrors.username && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.username}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.fullName ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập họ và tên..."
                                />
                                {formErrors.fullName && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.fullName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.email ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập địa chỉ email..."
                                />
                                {formErrors.email && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Số điện thoại *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.phoneNumber ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập số điện thoại..."
                                />
                                {formErrors.phoneNumber && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.phoneNumber}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Giới tính *
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.gender ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                >
                                    {GENDER_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Ngày sinh *
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.dateOfBirth ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                />
                                {formErrors.dateOfBirth && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.dateOfBirth}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Mối quan hệ *
                                </label>
                                <select
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.relationship ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                >
                                    {RELATIONSHIP_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.relationship && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.relationship}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Địa chỉ
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    rows={3}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.address ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập địa chỉ..."
                                />
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
                                        {selectedParent ? 'Đang cập nhật...' : 'Đang thêm mới...'}
                                    </>
                                ) : (
                                    selectedParent ? "Cập nhật" : "Thêm mới"
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

export default AddParentModal; 