import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiPackage, FiCalendar, FiClock, FiAlertTriangle, FiCheckCircle, FiXCircle, FiAlertCircle, FiArrowLeft, FiBox, FiUser, FiFileText, FiThermometer, FiShield, FiActivity, FiInfo, FiBarChart2, FiEdit, FiSave, FiX } from 'react-icons/fi';
import { PRIMARY, TEXT, BACKGROUND, BORDER, ERROR, WARNING } from '../../constants/colors';
import Loading from '../../components/Loading';
import medicalApi from '../../api/medicalApi';
import AlertModal from '../../components/modal/AlertModal';

const MedicalItemDetail = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [editedData, setEditedData] = useState({
        type: '',
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
    const stats = {
        totalQuantity: 100,
        currentQuantity: item?.quantity || 0,
        usageRate: 65,
        daysUntilExpiry: item?.expiryDate ? Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0
    };

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

    useEffect(() => {
        fetchItemDetail();
    }, [id]);

    useEffect(() => {
        if (item && isEditing) {
            setEditedData({
                type: item.type || '',
                name: item.name || '',
                description: item.description || '',
                dosage: item.dosage || '',
                form: item.form || '',
                expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
                quantity: item.quantity || '',
                unit: item.unit || '',
                justification: '',  // Để trống vì đây là lý do cho lần chỉnh sửa mới
                priority: item.priority || '',
                isUrgent: item.isUrgent || false
            });
        }
    }, [item, isEditing]);

    const fetchItemDetail = async () => {
        try {
            setLoading(true);
            const response = await medicalApi.getMedicalItem(id);
            if (response.success) {
                setItem(response.data);
            } else {
                setError(response.message || 'Không thể tải thông tin chi tiết');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi tải thông tin chi tiết');
            console.error('Error fetching item detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        if (name === 'form') {
            const selectedForm = formOptions.find(option => option.value === value);
            setEditedData({
                ...editedData,
                [name]: newValue,
                unit: selectedForm ? selectedForm.unit : editedData.unit
            });
        } else {
            setEditedData({
                ...editedData,
                [name]: newValue
            });
        }

        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!editedData.name?.trim()) {
            errors.name = "Tên không được để trống";
        }
        if (!editedData.form) {
            errors.form = "Vui lòng chọn dạng thuốc/vật tư";
        }
        if (editedData.type === 'Medication' && !editedData.dosage?.trim()) {
            errors.dosage = "Liều lượng không được để trống";
        }
        if (!editedData.quantity || editedData.quantity <= 0) {
            errors.quantity = "Số lượng phải lớn hơn 0";
        }
        if (!editedData.expiryDate) {
            errors.expiryDate = "Hạn sử dụng không được để trống";
        } else {
            const expiryDate = new Date(editedData.expiryDate);
            expiryDate.setHours(0, 0, 0, 0);
            if (expiryDate <= today) {
                errors.expiryDate = "Hạn sử dụng phải lớn hơn ngày hiện tại";
            }
        }
        if (!editedData.priority) {
            errors.priority = "Vui lòng chọn độ ưu tiên";
        }
        if (!editedData.justification?.trim() || editedData.justification.length < 1) {
            errors.justification = "Lý do chỉnh sửa phải có ít nhất 1 ký tự";
        }
        if (editedData.isUrgent && !['High', 'Critical'].includes(editedData.priority)) {
            errors.isUrgent = "Yêu cầu khẩn cấp phải có độ ưu tiên Cao hoặc Khẩn cấp";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            showAlertMessage('error', 'Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }
        setSaving(true);
        try {
            const response = await medicalApi.updateMedicalItem(id, editedData);
            if (response.success) {
                showAlertMessage('success', 'Thành công', 'Cập nhật thông tin thành công');
                await fetchItemDetail();
                setIsEditing(false);
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
            }
        } catch (error) {
            showAlertMessage('error', 'Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const showAlertMessage = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlert(true);
    };

    const handleAlertClose = () => {
        setShowAlert(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormErrors({});
        // Reset lại editedData về giá trị ban đầu của item
        if (item) {
            setEditedData({
                type: item.type || '',
                name: item.name || '',
                description: item.description || '',
                dosage: item.dosage || '',
                form: item.form || '',
                expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
                quantity: item.quantity || '',
                unit: item.unit || '',
                justification: '',
                priority: item.priority || '',
                isUrgent: item.isUrgent || false
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải thông tin..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border" style={{ borderColor: PRIMARY[200] }}>
                    <FiAlertCircle className="mx-auto h-12 w-12 mb-4" style={{ color: PRIMARY[500] }} />
                    <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                        {error}
                    </h3>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 rounded-xl font-medium inline-flex items-center"
                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                    >
                        <FiArrowLeft className="mr-2 h-5 w-5" />
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!item) return null;
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return { bg: PRIMARY[50], text: PRIMARY[700], icon: <FiCheckCircle className="h-5 w-5" /> };
            case 'Rejected':
                return { bg: ERROR[50], text: ERROR[700], icon: <FiXCircle className="h-5 w-5" /> };
            case 'Pending':
                return { bg: PRIMARY[50], text: PRIMARY[700], icon: <FiClock className="h-5 w-5" /> };
            default:
                return { bg: PRIMARY[50], text: PRIMARY[700], icon: <FiPackage className="h-5 w-5" /> };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical':
                return { bg: ERROR[100], text: ERROR[700], border: ERROR[200] };
            case 'High':
                return { bg: WARNING[100], text: WARNING[700], border: WARNING[200] };
            case 'Normal':
                return { bg: PRIMARY[100], text: PRIMARY[700], border: PRIMARY[200] };
            case 'Low':
                return { bg: PRIMARY[50], text: PRIMARY[700], border: PRIMARY[200] };
            default:
                return { bg: PRIMARY[50], text: PRIMARY[700], border: PRIMARY[200] };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const InfoItem = ({ label, value, icon, badge, error, className = '', important = false }) => (
        <div className={`bg-white p-5 rounded-xl border ${className}`}
            style={{
                borderColor: error ? ERROR[200] : important ? PRIMARY[200] : BORDER.DEFAULT,
                backgroundColor: important ? PRIMARY[50] : 'white'
            }}>
            <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[100] }}>
                    {React.cloneElement(icon, { style: { color: PRIMARY[600] } })}
                </div>
                <label className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                    {label}
                </label>
            </div>
            <div className="flex items-center mt-1">
                <span className="text-lg font-medium" style={{ color: error ? ERROR[700] : TEXT.PRIMARY }}>
                    {value}
                </span>
                {badge && <div className="ml-3">{badge}</div>}
            </div>
        </div>
    );

    const FillBar = ({ label, value, maxValue, icon, unit = '', color = PRIMARY[500] }) => (
        <div className="bg-white p-5 rounded-xl border" style={{ borderColor: PRIMARY[200] }}>
            <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[100] }}>
                    {React.cloneElement(icon, { style: { color: PRIMARY[600] } })}
                </div>
                <div className="flex-1">
                    <label className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                        {label}
                    </label>
                    <div className="flex items-baseline">
                        <span className="text-2xl font-semibold mr-1" style={{ color: TEXT.PRIMARY }}>
                            {value}
                        </span>
                        {unit && <span className="text-sm" style={{ color: TEXT.SECONDARY }}>{unit}</span>}
                    </div>
                </div>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: PRIMARY[100] }}>
                <div
                    className="h-full rounded-full"
                    style={{
                        backgroundColor: color,
                        width: `${Math.min((value / maxValue) * 100, 100)}%`
                    }}
                />
            </div>
        </div>
    );

    const statusColor = getStatusColor(item.status);
    const priorityColor = getPriorityColor(item.priority);

    const StatusBadge = ({ icon, text, bgColor, textColor }) => (
        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: bgColor, color: textColor }}>
            {icon}
            <span className="ml-2">{text}</span>
        </span>
    );

    const InputField = ({ label, name, value, onChange, type = "text", error, disabled = false, required = false, options = null }) => {
        const inputClasses = "w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50";
        const inputStyles = { borderColor: error ? ERROR[500] : BORDER.DEFAULT };

        return (
            <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                    {label} {required && <span style={{ color: ERROR[500] }}>*</span>}
                </label>
                {options ? (
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        className={inputClasses}
                        style={inputStyles}
                    >
                        <option value="">Chọn {label.toLowerCase()}...</option>
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        className={inputClasses}
                        style={inputStyles}
                        min={type === "number" ? "1" : undefined}
                    />
                )}
                {error && (
                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                        {error}
                    </p>
                )}
            </div>
        );
    };

    const ActionButton = ({ onClick, color, children }) => (
        <button
            onClick={onClick}
            className="px-6 py-3 rounded-xl font-medium inline-flex items-center"
            style={{ backgroundColor: color, color: TEXT.INVERSE }}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen pb-8" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10"
                style={{ borderColor: BORDER.DEFAULT }}>
                <div className="max-w-[1920px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.history.back()}
                            className="px-4 py-2 rounded-xl font-medium inline-flex items-center"
                            style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                        >
                            <FiArrowLeft className="mr-2 h-5 w-5" />
                            Quay lại
                        </button>

                        <div className="flex gap-4">
                            {!isEditing ? (
                                <button
                                    onClick={handleEditClick}
                                    className="px-6 py-2 rounded-xl font-medium inline-flex items-center"
                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                >
                                    <FiEdit className="mr-2 h-5 w-5" />
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-6 py-2 rounded-xl font-medium inline-flex items-center border"
                                        style={{ borderColor: BORDER.DEFAULT, color: TEXT.SECONDARY }}
                                        disabled={saving}
                                    >
                                        <FiX className="mr-2 h-5 w-5" />
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 rounded-xl font-medium inline-flex items-center"
                                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                        disabled={saving}
                                    >
                                        <FiSave className="mr-2 h-5 w-5" />
                                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1920px] mx-auto px-6 py-6">
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6"
                    style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[50] }}>
                    <div className="flex items-start">
                        <div className="h-16 w-16 rounded-xl flex items-center justify-center mr-6"
                            style={{ backgroundColor: PRIMARY[100] }}>
                            {item.type === 'Supply' ? (
                                <FiBox className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                            ) : (
                                <FiThermometer className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                                {isEditing ? (
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            name="name"
                                            value={editedData.name}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border rounded-xl text-3xl font-bold focus:outline-none focus:ring-2 transition-all duration-200"
                                            style={{
                                                borderColor: formErrors.name ? ERROR[500] : BORDER.DEFAULT,
                                                color: TEXT.PRIMARY
                                            }}
                                            disabled={saving}
                                            placeholder="Nhập tên..."
                                        />
                                        {formErrors.name && (
                                            <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                                {formErrors.name}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {item.name}
                                    </h1>
                                )}
                                <span className="px-4 py-1 rounded-lg text-sm font-medium shrink-0"
                                    style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                    {item.type === 'Supply' ? 'Vật tư y tế' : 'Thuốc'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <StatusBadge
                                    icon={statusColor.icon}
                                    text={item.statusDisplayName}
                                    bgColor={statusColor.bg}
                                    textColor={statusColor.text}
                                />
                                {isEditing ? (
                                    <div className="flex-1">
                                        <InputField
                                            label="Độ ưu tiên"
                                            name="priority"
                                            value={editedData.priority}
                                            onChange={handleInputChange}
                                            error={formErrors.priority}
                                            disabled={saving}
                                            required
                                            options={priorityOptions}
                                        />
                                    </div>
                                ) : (
                                    <StatusBadge
                                        icon={<FiShield className="h-5 w-5" />}
                                        text={item.priorityDisplayName}
                                        bgColor={priorityColor.bg}
                                        textColor={priorityColor.text}
                                    />
                                )}
                                {(item.isUrgent || editedData.isUrgent) && (
                                    <StatusBadge
                                        icon={<FiAlertTriangle className="h-5 w-5" />}
                                        text="Khẩn cấp"
                                        bgColor={ERROR[50]}
                                        textColor={ERROR[700]}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <FillBar
                        label="Số lượng hiện tại"
                        value={stats.currentQuantity}
                        maxValue={stats.totalQuantity}
                        icon={<FiBox className="h-5 w-5" />}
                        unit={item.unit}
                        color={item.isLowStock ? WARNING[500] : PRIMARY[500]}
                    />
                    <FillBar
                        label="Tỷ lệ sử dụng"
                        value={stats.usageRate}
                        maxValue={100}
                        icon={<FiBarChart2 className="h-5 w-5" />}
                        unit="%"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border p-6"
                            style={{ borderColor: BORDER.DEFAULT }}>
                            <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiInfo className="mr-3 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Thông tin chi tiết
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isEditing ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                                    Số lượng *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={editedData.quantity}
                                                    onChange={handleInputChange}
                                                    onKeyDown={(e) => {
                                                        // Ngăn chặn nhập số âm và số thập phân
                                                        if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === ',') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    min="0"
                                                    step="1"
                                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                                    style={{ borderColor: formErrors.quantity ? ERROR[500] : BORDER.DEFAULT }}
                                                    disabled={saving}
                                                    placeholder="Nhập số lượng..."
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
                                                    value={editedData.unit}
                                                    disabled
                                                    className="w-full p-3 border rounded-xl bg-gray-100"
                                                    style={{ borderColor: BORDER.DEFAULT }}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        {item.type === 'Medication' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                                        Dạng thuốc *
                                                    </label>
                                                    <select
                                                        name="form"
                                                        value={editedData.form}
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                                        style={{ borderColor: formErrors.form ? ERROR[500] : BORDER.DEFAULT }}
                                                        disabled={saving}
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
                                                        value={editedData.dosage}
                                                        onChange={handleInputChange}
                                                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                                        style={{ borderColor: formErrors.dosage ? ERROR[500] : BORDER.DEFAULT }}
                                                        disabled={saving}
                                                        placeholder="Nhập liều lượng..."
                                                    />
                                                    {formErrors.dosage && (
                                                        <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                                            {formErrors.dosage}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                                Hạn sử dụng *
                                            </label>
                                            <input
                                                type="date"
                                                name="expiryDate"
                                                value={editedData.expiryDate}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                                style={{ borderColor: formErrors.expiryDate ? ERROR[500] : BORDER.DEFAULT }}
                                                disabled={saving}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            {formErrors.expiryDate && (
                                                <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                                    {formErrors.expiryDate}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <InfoItem
                                            label="Số lượng"
                                            value={`${item.quantity} ${item.unit}`}
                                            icon={<FiBox className="h-5 w-5" />}
                                            badge={item.isLowStock && (
                                                <span className="px-3 py-1 rounded-lg text-sm font-medium"
                                                    style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                                                    <FiAlertTriangle className="inline-block mr-1 h-4 w-4" />
                                                    Tồn kho thấp
                                                </span>
                                            )}
                                            important={item.isLowStock}
                                        />

                                        {item.type === 'Medication' && (
                                            <>
                                                <InfoItem
                                                    label="Dạng thuốc"
                                                    value={item.formDisplayName || 'N/A'}
                                                    icon={<FiPackage className="h-5 w-5" />}
                                                />
                                                <InfoItem
                                                    label="Liều lượng"
                                                    value={item.dosage || 'N/A'}
                                                    icon={<FiThermometer className="h-5 w-5" />}
                                                />
                                            </>
                                        )}

                                        {item.expiryDate && (
                                            <InfoItem
                                                label="Hạn sử dụng"
                                                value={formatDate(item.expiryDate)}
                                                icon={<FiCalendar className="h-5 w-5" />}
                                                badge={
                                                    <>
                                                        {item.isExpiringSoon && (
                                                            <span className="px-3 py-1 rounded-lg text-sm font-medium"
                                                                style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                                                                <FiCalendar className="inline-block mr-1 h-4 w-4" />
                                                                Sắp hết hạn
                                                            </span>
                                                        )}
                                                        {item.isExpired && (
                                                            <span className="px-3 py-1 rounded-lg text-sm font-medium"
                                                                style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                                                                <FiAlertTriangle className="inline-block mr-1 h-4 w-4" />
                                                                Đã hết hạn
                                                            </span>
                                                        )}
                                                    </>
                                                }
                                                important={item.isExpiringSoon || item.isExpired}
                                            />
                                        )}
                                    </>
                                )}
                            </div>

                            {(item.description || isEditing) && (
                                <div className="mt-6">
                                    {isEditing ? (
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                                Mô tả
                                            </label>
                                            <textarea
                                                name="description"
                                                value={editedData.description}
                                                onChange={handleInputChange}
                                                disabled={saving}
                                                rows={3}
                                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                                style={{ borderColor: formErrors.description ? ERROR[500] : BORDER.DEFAULT }}
                                            />
                                        </div>
                                    ) : (
                                        <InfoItem
                                            label="Mô tả"
                                            value={item.description}
                                            icon={<FiFileText className="h-5 w-5" />}
                                            className="col-span-2"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border p-6"
                            style={{ borderColor: BORDER.DEFAULT }}>
                            <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiFileText className="mr-3 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Thông tin yêu cầu
                            </h2>
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                                Lý do chỉnh sửa *
                                            </label>
                                            <textarea
                                                name="justification"
                                                value={editedData.justification}
                                                onChange={handleInputChange}
                                                disabled={saving}
                                                rows={3}
                                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                                style={{ borderColor: formErrors.justification ? ERROR[500] : BORDER.DEFAULT }}
                                                placeholder="Nhập lý do chỉnh sửa (tối thiểu 10 ký tự)..."
                                            />
                                            {formErrors.justification && (
                                                <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                                    {formErrors.justification}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center mt-4">
                                            <input
                                                type="checkbox"
                                                name="isUrgent"
                                                checked={editedData.isUrgent}
                                                onChange={handleInputChange}
                                                disabled={saving}
                                                className="h-5 w-5 rounded focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                                style={{ color: PRIMARY[600] }}
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
                                    </>
                                ) : (
                                    <>
                                        <InfoItem
                                            label="Lý do yêu cầu"
                                            value={item.justification}
                                            icon={<FiFileText className="h-5 w-5" />}
                                            important={true}
                                        />

                                        <InfoItem
                                            label="Người yêu cầu"
                                            value={
                                                item.requestedByName ? (
                                                    <>
                                                        {item.requestedByName}
                                                        <span className="ml-2 text-sm" style={{ color: TEXT.SECONDARY }}>
                                                            ({item.requestedByStaffCode})
                                                        </span>
                                                    </>
                                                ) : (
                                                    'N/A'
                                                )
                                            }
                                            icon={<FiUser className="h-5 w-5" />}
                                        />

                                        <InfoItem
                                            label="Ngày yêu cầu"
                                            value={formatDate(item.createdDate)}
                                            icon={<FiClock className="h-5 w-5" />}
                                        />

                                        {item.status === 'Approved' && (
                                            <>
                                                <InfoItem
                                                    label="Người duyệt"
                                                    value={
                                                        item.approvedByName ? (
                                                            <>
                                                                {item.approvedByName}
                                                                <span className="ml-2 text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                    ({item.approvedByStaffCode})
                                                                </span>
                                                            </>
                                                        ) : (
                                                            'N/A'
                                                        )
                                                    }
                                                    icon={<FiUser className="h-5 w-5" />}
                                                    important={true}
                                                />

                                                <InfoItem
                                                    label="Ngày duyệt"
                                                    value={formatDate(item.approvedAt)}
                                                    icon={<FiClock className="h-5 w-5" />}
                                                />
                                            </>
                                        )}

                                        {item.status === 'Rejected' && (
                                            <>
                                                <InfoItem
                                                    label="Ngày từ chối"
                                                    value={formatDate(item.rejectedAt)}
                                                    icon={<FiClock className="h-5 w-5" />}
                                                />
                                                <InfoItem
                                                    label="Lý do từ chối"
                                                    value={item.rejectionReason || 'Không có lý do'}
                                                    icon={<FiFileText className="h-5 w-5" />}
                                                    error={true}
                                                    important={true}
                                                />
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={showAlert}
                onClose={handleAlertClose}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
};

export default MedicalItemDetail; 