import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from '../../constants/colors';
import { FiPlus, FiTrash2, FiAlertTriangle, FiCalendar, FiMapPin, FiFileText, FiUser, FiActivity, FiSave, FiX, FiChevronDown, FiCheck, FiTablet, FiBox, FiThermometer, FiHeart, FiWind } from 'react-icons/fi';
import Loading from '../../components/Loading';
import AlertModal from '../../components/modal/AlertModal';
import userApi from '../../api/userApi';
import medicalApi from '../../api/medicalApi';
import healthEventApi from '../../api/healtheventApi';

const STYLES = {
    input: {
        base: "w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base",
        error: "border-red-500",
        success: `border-${PRIMARY[500]}`,
        focus: `focus:ring-${PRIMARY[500]}40`
    },
    card: {
        base: "bg-white rounded-xl shadow-sm border overflow-hidden",
        header: "p-6 border-b flex items-center",
        content: "p-8"
    },
    button: {
        primary: `px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-${PRIMARY[500]} text-white`,
        secondary: "px-6 py-3 rounded-lg border font-medium transition-all duration-200 text-gray-700"
    }
};

const EVENT_TYPES = [
    { value: 'Injury', label: 'Chấn thương' },
    { value: 'Illness', label: 'Bệnh, ốm' },
    { value: 'AllergicReaction', label: 'Dị ứng' },
    { value: 'Fall', label: 'Té ngã' },
    { value: 'Emergency', label: 'Cấp cứu' },
    { value: 'Other', label: 'Khác' }
];

const MEDICAL_CONDITIONS = [
    { value: '', label: '-- Không có --' },
    { value: 'condition-1', label: 'Hen suyễn' },
    { value: 'condition-2', label: 'Dị ứng thức ăn' },
    { value: 'condition-3', label: 'Tiểu đường' },
    { value: 'condition-4', label: 'Cao huyết áp' }
];

const HealthEventCreate = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "success", title: "", message: "" });

    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);

    const [medicines, setMedicines] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [medicinesLoading, setMedicinesLoading] = useState(false);
    const [suppliesLoading, setSuppliesLoading] = useState(false);

    const [itemSearches, setItemSearches] = useState({});
    const [showDropdowns, setShowDropdowns] = useState({});
    const studentDropdownRef = useRef(null);
    const studentInputRef = useRef(null);

    const [formData, setFormData] = useState({
        userId: '',
        eventType: 'Injury',
        description: '',
        occurredAt: '',
        location: '',
        actionTaken: '',
        outcome: '',
        isEmergency: false,
        relatedMedicalConditionId: '',
        currentHealthStatus: '',
        parentNotice: '',
        temperature: '',
        bloodPressure: '',
        respiratoryRate: '',
        heartRate: '',
        medicalItemUsages: []
    });

    const generateUniqueId = () => Date.now() + Math.random();

    const clearError = (fieldName) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    const buildCurrentHealthStatus = () => {
        const healthMetrics = [];
        if (formData.temperature) {
            healthMetrics.push(`Nhiệt độ: ${formData.temperature}°C`);
        }
        if (formData.bloodPressure) {
            healthMetrics.push(`Huyết áp: ${formData.bloodPressure} mmHg`);
        }
        if (formData.respiratoryRate) {
            healthMetrics.push(`Nhịp thở: ${formData.respiratoryRate}/phút`);
        }
        if (formData.heartRate) {
            healthMetrics.push(`Nhịp tim: ${formData.heartRate}/phút`);
        }
        return healthMetrics.length > 0 ? healthMetrics.join(', ') : '';
    };

    const fetchData = async (apiCall, setData, setLoading) => {
        setLoading(true);
        try {
            const response = await apiCall();
            if (response.success) { setData(response.data) }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally { setLoading(false) }
    };

    const fetchStudents = async () => {
        setStudentsLoading(true);
        setStudentsError(null);
        try {
            const response = await userApi.getStudents({ pageIndex: 1, pageSize: 1000, searchTerm: studentSearch, orderBy: 'name' });
            if (response.success) {
                setStudents(response.data);
            } else {
                throw new Error(response.message || "Không thể tải danh sách học sinh");
            }
        } catch (error) {
            setStudentsError(error.message);
        } finally {
            setStudentsLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target) &&
                studentInputRef.current && !studentInputRef.current.contains(event.target)) {
                setShowStudentDropdown(false);
            }
            const isClickInsideDropdown = event.target.closest('.item-dropdown-container');
            if (!isClickInsideDropdown) {
                setShowDropdowns({});
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (studentSearch) {
            fetchStudents();
        }
    }, [studentSearch]);

    useEffect(() => {
        fetchData(
            () => medicalApi.getMedicalItems({ pageIndex: 1, pageSize: 1000, type: 'Medication', approvalStatus: 'Approved' }),
            setMedicines,
            setMedicinesLoading
        );
        fetchData(
            () => medicalApi.getMedicalItems({ pageIndex: 1, pageSize: 1000, type: 'Supply', approvalStatus: 'Approved' }),
            setSupplies,
            setSuppliesLoading
        );
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        clearError(name);
    };

    const handleCheckboxChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
        clearError(name);
    };

    const handleStudentSelect = (student) => {
        setFormData(prev => ({ ...prev, userId: student.id }));
        setStudentSearch(`${student.fullName} - Lớp ${student.currentClassName}`);
        setShowStudentDropdown(false);
        clearError('userId');
    };

    const handleStudentSearchChange = (e) => {
        const value = e.target.value;
        setStudentSearch(value);
        setShowStudentDropdown(true);
        if (!value) { setFormData(prev => ({ ...prev, userId: '' })) }
        clearError('userId');
    };

    const addMedicalItem = (itemType) => {
        const newId = generateUniqueId();
        setFormData(prev => ({
            ...prev,
            medicalItemUsages: [
                ...prev.medicalItemUsages,
                {
                    id: newId,
                    medicalItemId: '',
                    quantity: 1,
                    notes: '',
                    usedAt: new Date().toISOString(),
                    dose: 1,
                    medicalPerOnce: 1,
                    itemType
                }
            ]
        }));
        setItemSearches(prev => ({ ...prev, [newId]: '' }));
    };

    const removeMedicalItem = (itemType, filteredIndex) => {
        const items = formData.medicalItemUsages.filter(item => item.itemType === itemType);
        const itemToRemove = items[filteredIndex];
        setFormData(prev => ({
            ...prev,
            medicalItemUsages: prev.medicalItemUsages.filter(item => item !== itemToRemove)
        }));
        setItemSearches(prev => {
            const newState = { ...prev };
            delete newState[itemToRemove.id];
            return newState;
        });
    };

    const updateMedicalItem = (itemType, filteredIndex, field, value) => {
        const items = formData.medicalItemUsages.filter(item => item.itemType === itemType);
        const itemToUpdate = items[filteredIndex];
        const realIndex = formData.medicalItemUsages.findIndex(item => item === itemToUpdate);
        setFormData(prev => ({
            ...prev,
            medicalItemUsages: prev.medicalItemUsages.map((item, i) =>
                i === realIndex ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleItemSearchChange = (item, value) => {
        setItemSearches(prev => ({ ...prev, [item.id]: value }));
        setShowDropdowns(prev => ({ ...prev, [item.id]: true }));
        if (!value) {
            const itemType = item.itemType;
            const items = formData.medicalItemUsages.filter(i => i.itemType === itemType);
            const filteredIndex = items.findIndex(i => i === item);
            updateMedicalItem(itemType, filteredIndex, 'medicalItemId', '');
        }
    };

    const handleItemSelect = (item, selectedItem) => {
        const itemType = item.itemType;
        const items = formData.medicalItemUsages.filter(i => i.itemType === itemType);
        const filteredIndex = items.findIndex(i => i === item);
        updateMedicalItem(itemType, filteredIndex, 'medicalItemId', selectedItem.id);
        setItemSearches(prev => ({ ...prev, [item.id]: selectedItem.name }));
        setShowDropdowns(prev => ({ ...prev, [item.id]: false }));
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            { field: 'userId', message: 'Vui lòng chọn học sinh' },
            { field: 'description', message: 'Vui lòng nhập mô tả sự kiện' },
            { field: 'occurredAt', message: 'Vui lòng chọn thời gian xảy ra' },
            { field: 'location', message: 'Vui lòng nhập địa điểm' },
            { field: 'actionTaken', message: 'Vui lòng nhập hành động đã thực hiện' },
            { field: 'outcome', message: 'Vui lòng nhập kết quả' }
        ];
        const hasHealthMetrics = formData.temperature || formData.bloodPressure ||
            formData.respiratoryRate || formData.heartRate;
        if (!hasHealthMetrics) {
            newErrors['healthMetrics'] = 'Vui lòng nhập ít nhất một chỉ số sức khỏe (nhiệt độ, huyết áp, nhịp thở, nhịp tim)';
        }
        requiredFields.forEach(({ field, message }) => {
            if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
                newErrors[field] = message;
            }
        });

        ['medicine', 'supply'].forEach(itemType => {
            const items = formData.medicalItemUsages.filter(item => item.itemType === itemType);
            items.forEach((usage, index) => {
                if (!usage.medicalItemId) {
                    newErrors[`${itemType}Usage_${index}_medicalItemId`] = `Vui lòng chọn ${itemType === 'medicine' ? 'thuốc' : 'vật tư'} cho mục #${index + 1}`;
                }
                if (!usage.quantity || usage.quantity <= 0) {
                    newErrors[`${itemType}Usage_${index}_quantity`] = `Vui lòng nhập số lượng hợp lệ cho mục #${index + 1}`;
                }
                if (itemType === 'medicine') {
                    if (!usage.dose || usage.dose <= 0) {
                        newErrors[`${itemType}Usage_${index}_dose`] = `Vui lòng nhập liều lượng hợp lệ cho mục #${index + 1}`;
                    }
                    if (!usage.medicalPerOnce || usage.medicalPerOnce <= 0) {
                        newErrors[`${itemType}Usage_${index}_medicalPerOnce`] = `Vui lòng nhập số lần dùng/ngày hợp lệ cho mục #${index + 1}`;
                    }
                }
            });
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAlertClose = () => {
        setShowAlert(false);
        if (alertConfig.type === "success") {
            navigate("/schoolnurse/health-events");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const medicalItemUsages = formData.medicalItemUsages.map(item => {
                const { itemType, id, ...cleanItem } = item;
                return {
                    ...cleanItem,
                    usedAt: cleanItem.usedAt || new Date().toISOString(),
                    dose: cleanItem.dose || 1,
                    medicalPerOnce: cleanItem.medicalPerOnce || 1
                };
            });
            const submitData = {
                ...formData,
                relatedMedicalConditionId: formData.relatedMedicalConditionId || null,
                occurredAt: formData.occurredAt ? new Date(formData.occurredAt).toISOString() : new Date().toISOString(),
                currentHealthStatus: buildCurrentHealthStatus(),
                medicalItemUsages
            };
            console.log('Submit Data:', JSON.stringify(submitData, null, 2));
            const response = await healthEventApi.createHealthEventWithMedicalItems(submitData);
            if (response.success) {
                setAlertConfig({ type: "success", title: "Tạo sự kiện y tế thành công!", message: "Sự kiện y tế đã được lưu vào hệ thống. Nhấn OK để về trang quản lý sự kiện y tế." });
                setShowAlert(true);
                setFormData({
                    userId: '',
                    eventType: 'Injury',
                    description: '',
                    occurredAt: '',
                    location: '',
                    actionTaken: '',
                    outcome: '',
                    isEmergency: false,
                    relatedMedicalConditionId: '',
                    currentHealthStatus: '',
                    parentNotice: '',
                    temperature: '',
                    bloodPressure: '',
                    respiratoryRate: '',
                    heartRate: '',
                    medicalItemUsages: []
                });
                setStudentSearch('');
                setItemSearches({});
                setShowDropdowns({});
                setErrors({});
            } else {
                let errorMessage = response.message || "Có lỗi xảy ra khi tạo sự kiện y tế";
                if (response.errors && response.errors.length > 0) {
                    const validationErrors = {};
                    response.errors.forEach(error => {
                        validationErrors[error.field] = error.message;
                    });
                    setErrors(validationErrors);
                    errorMessage = "Vui lòng kiểm tra lại thông tin đã nhập";
                }
                setAlertConfig({ type: "error", title: "Lỗi", message: errorMessage });
                setShowAlert(true);
            }
        } catch (error) {
            setAlertConfig({ type: "error", title: "Lỗi hệ thống", message: "Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau." });
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (name, label, type = 'text', placeholder = '', icon = null, required = false) => (
        <div>
            <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                {label} {required && '*'}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }}>
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={`${STYLES.input.base} ${icon ? 'pl-12' : ''} ${errors[name] ? STYLES.input.error : ''}`}
                    style={{ borderColor: errors[name] ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                    required={required}
                />
            </div>
            {errors[name] && (
                <p className="mt-2 text-sm text-red-500">{errors[name]}</p>
            )}
        </div>
    );

    const renderTextarea = (name, label, placeholder = '', rows = 4, required = false) => (
        <div>
            <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                {label} {required && '*'}
            </label>
            <textarea
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                placeholder={placeholder}
                rows={rows}
                className={`${STYLES.input.base} resize-none ${errors[name] ? STYLES.input.error : ''}`}
                style={{ borderColor: errors[name] ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                required={required}
            />
            {errors[name] && (
                <p className="mt-2 text-sm text-red-500">{errors[name]}</p>
            )}
        </div>
    );

    const renderMedicalItemSection = (itemType, items, icon, title, addButtonText) => (
        <div className={STYLES.card.base} style={{ borderColor: BORDER.DEFAULT }}>
            <div className={`${STYLES.card.header} justify-between`} style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                <div className="flex items-center">
                    {icon}
                    <h2 className="text-xl font-semibold ml-3" style={{ color: PRIMARY[700] }}>
                        {title}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => addMedicalItem(itemType)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                >
                    <FiPlus className="h-4 w-4" />
                    <span>{addButtonText}</span>
                </button>
            </div>

            <div className={STYLES.card.content}>
                {items.length === 0 ? (
                    <div className="text-center py-8" style={{ color: TEXT.SECONDARY }}>
                        <p className="text-lg font-medium mb-2">Chưa có {itemType === 'medicine' ? 'thuốc' : 'vật tư'} nào được sử dụng</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {items.map((item, index) => (
                            <div key={index} className="p-6 border rounded-lg" style={{ backgroundColor: PRIMARY[25], borderColor: BORDER.DEFAULT }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                                        {itemType === 'medicine' ? 'Thuốc' : 'Vật tư'} #{index + 1}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => removeMedicalItem(itemType, index)}
                                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                        style={{ backgroundColor: ERROR[50], color: ERROR[600] }}
                                    >
                                        <FiTrash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className={`grid gap-4 ${itemType === 'medicine' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                            {itemType === 'medicine' ? 'Tên thuốc' : 'Tên vật tư'}
                                        </label>
                                        <div className="relative item-dropdown-container">
                                            <input
                                                type="text"
                                                value={itemSearches[item.id] || ''}
                                                onChange={(e) => handleItemSearchChange(item, e.target.value)}
                                                onFocus={() => setShowDropdowns(prev => ({ ...prev, [item.id]: true }))}
                                                placeholder={`Tìm và chọn ${itemType === 'medicine' ? 'thuốc' : 'vật tư'}...`}
                                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                style={{
                                                    borderColor: item.medicalItemId ? PRIMARY[500] : BORDER.DEFAULT,
                                                    backgroundColor: item.medicalItemId ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                                    color: TEXT.PRIMARY
                                                }}
                                                disabled={itemType === 'medicine' ? medicinesLoading : suppliesLoading}
                                            />
                                            {item.medicalItemId && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <FiCheck className="h-4 w-4" style={{ color: PRIMARY[600] }} />
                                                </div>
                                            )}

                                            {showDropdowns[item.id] && (
                                                <div
                                                    className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl overflow-hidden"
                                                    style={{ borderColor: BORDER.DEFAULT, maxHeight: '200px', minHeight: '120px' }}
                                                >
                                                    <div
                                                        className="overflow-y-auto overflow-x-hidden"
                                                        style={{ maxHeight: '140px' }}
                                                    >
                                                        {(itemType === 'medicine' ? medicines : supplies)
                                                            .filter(medItem => medItem.name.toLowerCase().includes((itemSearches[item.id] || '').toLowerCase()))
                                                            .length === 0 ? (
                                                            <div className="p-4 text-center" style={{ color: TEXT.SECONDARY }}>
                                                                Không tìm thấy {itemType === 'medicine' ? 'thuốc' : 'vật tư'} phù hợp
                                                            </div>
                                                        ) : (
                                                            (itemType === 'medicine' ? medicines : supplies)
                                                                .filter(medItem => medItem.name.toLowerCase().includes((itemSearches[item.id] || '').toLowerCase()))
                                                                .map((medItem) => (
                                                                    <div
                                                                        key={medItem.id}
                                                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors duration-150"
                                                                        onClick={() => handleItemSelect(item, medItem)}
                                                                        style={{ minHeight: '60px' }}
                                                                    >
                                                                        <div className="font-medium text-sm" style={{ color: TEXT.PRIMARY }}>
                                                                            {medItem.name}
                                                                        </div>
                                                                        <div className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                                            {itemType === 'medicine' ? (medItem.dosage || 'N/A') : `Số lượng: ${medItem.quantity}`}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {errors[`${itemType}Usage_${index}_medicalItemId`] && (
                                            <p className="mt-1 text-sm text-red-500">{errors[`${itemType}Usage_${index}_medicalItemId`]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                            Số lượng
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateMedicalItem(itemType, index, 'quantity', parseInt(e.target.value) || 0)}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        />
                                        {errors[`${itemType}Usage_${index}_quantity`] && (
                                            <p className="mt-1 text-sm text-red-500">{errors[`${itemType}Usage_${index}_quantity`]}</p>
                                        )}
                                    </div>

                                    {itemType === 'medicine' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                    Số liều/ngày
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.dose}
                                                    onChange={(e) => updateMedicalItem(itemType, index, 'dose', parseFloat(e.target.value) || 0)}
                                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                                    placeholder="Ví dụ: 500"
                                                />
                                                {errors[`${itemType}Usage_${index}_dose`] && (
                                                    <p className="mt-1 text-sm text-red-500">{errors[`${itemType}Usage_${index}_dose`]}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                    Số thuốc/liều
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.medicalPerOnce}
                                                    onChange={(e) => updateMedicalItem(itemType, index, 'medicalPerOnce', parseInt(e.target.value) || 0)}
                                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                                    placeholder="Ví dụ: 3"
                                                />
                                                {errors[`${itemType}Usage_${index}_medicalPerOnce`] && (
                                                    <p className="mt-1 text-sm text-red-500">{errors[`${itemType}Usage_${index}_medicalPerOnce`]}</p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className={`${itemType === 'medicine' ? 'col-span-full' : 'col-span-2'}`}>
                                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                            Ghi chú
                                        </label>
                                        <textarea
                                            value={item.notes}
                                            onChange={(e) => updateMedicalItem(itemType, index, 'notes', e.target.value)}
                                            placeholder="Ghi chú về cách sử dụng..."
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const medicineItems = formData.medicalItemUsages.filter(item => item.itemType === 'medicine');
    const supplyItems = formData.medicalItemUsages.filter(item => item.itemType === 'supply');

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: PRIMARY[700] }}>
                        Tạo Sự Kiện Y Tế
                    </h1>
                    <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                        Ghi nhận và quản lý các sự kiện y tế của học sinh
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className={STYLES.card.base} style={{ borderColor: BORDER.DEFAULT }}>
                        <div className={`${STYLES.card.header} justify-between`} style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <div className="flex items-center">
                                <FiFileText className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                                <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                    Thông tin cơ bản
                                </h2>
                            </div>
                            {formData.isEmergency && (
                                <div className="flex items-center space-x-2 px-3 py-1 rounded-full" style={{ backgroundColor: ERROR[100] }}>
                                    <FiAlertTriangle className="h-4 w-4" style={{ color: ERROR[600] }} />
                                    <span className="text-sm font-medium" style={{ color: ERROR[700] }}>
                                        Khẩn cấp
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className={STYLES.card.content}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="lg:col-span-2">
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Học sinh *
                                    </label>
                                    <div className="relative" ref={studentDropdownRef}>
                                        <div className="relative">
                                            <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                            <input
                                                ref={studentInputRef}
                                                type="text"
                                                value={studentSearch}
                                                onChange={handleStudentSearchChange}
                                                onFocus={() => setShowStudentDropdown(true)}
                                                placeholder="Tìm và chọn học sinh..."
                                                className={`w-full pl-12 pr-20 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.userId ? 'border-red-500' : ''}`}
                                                style={{
                                                    borderColor: errors.userId ? '#ef4444' : (formData.userId ? PRIMARY[500] : BORDER.DEFAULT),
                                                    backgroundColor: formData.userId ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                                    color: TEXT.PRIMARY
                                                }}
                                                required
                                            />
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                                {formData.userId && (
                                                    <div className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                                        style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                                        Đã chọn
                                                    </div>
                                                )}
                                                {studentsLoading ? (
                                                    <Loading type="spinner" size="small" color="primary" />
                                                ) : (
                                                    <FiChevronDown
                                                        className={`h-5 w-5 transition-transform duration-200 flex-shrink-0 ${showStudentDropdown ? 'rotate-180' : ''}`}
                                                        style={{ color: formData.userId ? PRIMARY[500] : GRAY[400] }}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {showStudentDropdown && (
                                            <div
                                                className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-xl overflow-hidden"
                                                style={{ borderColor: BORDER.DEFAULT, maxHeight: '288px', minHeight: '120px' }}
                                            >
                                                <div
                                                    className="overflow-y-auto overflow-x-hidden"
                                                    style={{ maxHeight: '288px' }}
                                                >
                                                    {studentsError ? (
                                                        <div className="p-4 text-center" style={{ color: ERROR[500] }}>
                                                            <FiAlertTriangle className="h-6 w-6 mx-auto mb-2" />
                                                            {studentsError}
                                                        </div>
                                                    ) : students.length === 0 ? (
                                                        <div className="p-4 text-center" style={{ color: TEXT.SECONDARY }}>
                                                            {studentSearch ? 'Không tìm thấy học sinh' : 'Nhập để tìm kiếm học sinh'}
                                                        </div>
                                                    ) : (
                                                        students.map((student) => (
                                                            <div
                                                                key={student.id}
                                                                onClick={() => handleStudentSelect(student)}
                                                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b last:border-b-0"
                                                                style={{ borderColor: BORDER.LIGHT }}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-grow min-w-0">
                                                                        <div className="font-medium text-base truncate" style={{ color: TEXT.PRIMARY }}>
                                                                            {student.fullName}
                                                                        </div>
                                                                        <div className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                                            Lớp {student.currentClassName}
                                                                            {student.dateOfBirth && (
                                                                                <span className="ml-2">• SN: {new Date(student.dateOfBirth).getFullYear()}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {formData.userId === student.id && (
                                                                        <FiCheck className="h-5 w-5 ml-3 flex-shrink-0" style={{ color: PRIMARY[500] }} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {errors.userId && (
                                        <p className="mt-2 text-sm text-red-500">{errors.userId}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Loại sự kiện *
                                    </label>
                                    <select
                                        name="eventType"
                                        value={formData.eventType}
                                        onChange={handleInputChange}
                                        className={STYLES.input.base}
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                    >
                                        {EVENT_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="block text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Trường hợp khẩn cấp
                                    </label>
                                    <div
                                        className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-all duration-200"
                                        onClick={() => handleCheckboxChange('isEmergency', !formData.isEmergency)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.isEmergency}
                                            onChange={(e) => handleCheckboxChange('isEmergency', e.target.checked)}
                                            className="h-5 w-5 rounded border-2 transition-all duration-200"
                                            style={{ accentColor: PRIMARY[500] }}
                                        />
                                    </div>
                                </div>

                                {renderInput('occurredAt', 'Thời gian xảy ra', 'datetime-local', '', <FiCalendar />, true)}
                                {renderInput('location', 'Địa điểm', 'text', 'Ví dụ: Sân trường, Lớp học, Căng tin...', <FiMapPin />, true)}
                            </div>

                            <div className="mt-6">
                                {renderTextarea('description', 'Mô tả chi tiết sự kiện', 'Mô tả chi tiết về sự kiện đã xảy ra...', 4, true)}
                            </div>
                        </div>
                    </div>

                    <div className={STYLES.card.base} style={{ borderColor: BORDER.DEFAULT }}>
                        <div className={STYLES.card.header} style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiActivity className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Xử lý & Kết quả
                            </h2>
                        </div>

                        <div className={STYLES.card.content}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Tình trạng sức khỏe hiện tại *
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                Nhiệt độ
                                            </label>
                                            <div className="relative">
                                                <FiThermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                                                <input
                                                    type="number"
                                                    name="temperature"
                                                    value={formData.temperature}
                                                    onChange={handleInputChange}
                                                    placeholder="36.5"
                                                    min="30"
                                                    max="45"
                                                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                                />
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: GRAY[500] }}>°C</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                Huyết áp
                                            </label>
                                            <div className="relative">
                                                <FiActivity className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                                                <input
                                                    type="text"
                                                    name="bloodPressure"
                                                    value={formData.bloodPressure}
                                                    onChange={handleInputChange}
                                                    placeholder="120/80"
                                                    className="w-full pl-10 pr-16 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                                />
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: GRAY[500] }}>mmHg</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                Nhịp thở
                                            </label>
                                            <div className="relative">
                                                <FiWind className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                                                <input
                                                    type="number"
                                                    name="respiratoryRate"
                                                    value={formData.respiratoryRate}
                                                    onChange={handleInputChange}
                                                    placeholder="20"
                                                    min="5"
                                                    max="60"
                                                    className="w-full pl-10 pr-16 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                                />
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: GRAY[500] }}>/phút</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                Nhịp tim
                                            </label>
                                            <div className="relative">
                                                <FiHeart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                                                <input
                                                    type="number"
                                                    name="heartRate"
                                                    value={formData.heartRate}
                                                    onChange={handleInputChange}
                                                    placeholder="80"
                                                    min="40"
                                                    max="200"
                                                    className="w-full pl-10 pr-16 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                                />
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: GRAY[500] }}>/phút</span>
                                            </div>
                                        </div>
                                    </div>

                                    {errors['healthMetrics'] && (
                                        <p className="mt-2 text-sm text-red-500">{errors['healthMetrics']}</p>
                                    )}
                                    {buildCurrentHealthStatus() && (
                                        <div className="mt-3 p-3 rounded-lg border" style={{ backgroundColor: PRIMARY[50], borderColor: PRIMARY[200] }}>
                                            <p className="text-sm font-medium mb-1" style={{ color: PRIMARY[700] }}>
                                                Tình trạng sức khỏe tổng hợp:
                                            </p>
                                            <p className="text-sm" style={{ color: PRIMARY[600] }}>
                                                {buildCurrentHealthStatus()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {renderTextarea('actionTaken', 'Hành động đã thực hiện', 'Mô tả các biện pháp xử lý đã thực hiện...', 3, true)}
                                {renderTextarea('outcome', 'Kết quả', 'Kết quả sau khi xử lý...', 3, true)}
                            </div>
                        </div>
                    </div>

                    {renderMedicalItemSection(
                        'medicine',
                        medicineItems,
                        <FiTablet className="h-6 w-6" style={{ color: PRIMARY[500] }} />,
                        'Thuốc đã sử dụng',
                        'Thêm thuốc'
                    )}

                    {renderMedicalItemSection(
                        'supply',
                        supplyItems,
                        <FiBox className="h-6 w-6" style={{ color: PRIMARY[500] }} />,
                        'Vật tư y tế đã sử dụng',
                        'Thêm vật tư'
                    )}

                    <div className={STYLES.card.base} style={{ borderColor: BORDER.DEFAULT }}>
                        <div className={STYLES.card.header} style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiFileText className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Thông tin bổ sung
                            </h2>
                        </div>

                        <div className={STYLES.card.content}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Tình trạng y tế liên quan
                                    </label>
                                    <select
                                        name="relatedMedicalConditionId"
                                        value={formData.relatedMedicalConditionId}
                                        onChange={handleInputChange}
                                        className={STYLES.input.base}
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                    >
                                        {MEDICAL_CONDITIONS.map(condition => (
                                            <option key={condition.value} value={condition.value}>{condition.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {renderTextarea('parentNotice', 'Thông báo cho phụ huynh', 'Thông báo sẽ gửi cho phụ huynh...', 4)}
                            </div>
                        </div>
                    </div>

                    {formData.isEmergency && (
                        <div className={STYLES.card.base} style={{ borderColor: ERROR[300] }}>
                            <div className={STYLES.card.header} style={{ borderColor: ERROR[300], backgroundColor: ERROR[50] }}>
                                <FiAlertTriangle className="h-6 w-6 mr-3" style={{ color: ERROR[600] }} />
                                <h2 className="text-xl font-semibold" style={{ color: ERROR[700] }}>
                                    Cảnh báo trường hợp khẩn cấp
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start space-x-3">
                                    <FiAlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: ERROR[500] }} />
                                    <div>
                                        <p className="text-base font-medium mb-2" style={{ color: ERROR[700] }}>
                                            Sự kiện này được đánh dấu là khẩn cấp
                                        </p>
                                        <p className="text-sm" style={{ color: ERROR[600] }}>
                                            Phụ huynh và ban giám hiệu sẽ được thông báo ngay lập tức khi sự kiện được lưu.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end items-center sticky bottom-0 bg-white p-6 border-t rounded-b-xl shadow-md" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/schoolnurse/health-events')}
                                className="px-6 py-3 rounded-lg border font-medium transition-all duration-200 flex items-center"
                                style={{ borderColor: BORDER.DEFAULT, color: TEXT.PRIMARY, backgroundColor: 'white' }}
                                disabled={loading}
                            >
                                <FiX className="mr-2 h-5 w-5" />Hủy
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
                                style={{ backgroundColor: loading ? GRAY[400] : PRIMARY[500], color: 'white', boxShadow: `0 1px 2px 0 ${PRIMARY[500]}` }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loading type="spinner" size="small" color="white" className="mr-2" />Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2 h-5 w-5" />Lưu sự kiện y tế
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {showAlert && (
                <AlertModal
                    isOpen={showAlert}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onClose={handleAlertClose}
                />
            )}
        </div>
    );
};

export default HealthEventCreate; 