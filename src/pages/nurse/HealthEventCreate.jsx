import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from '../../constants/colors';
import { FiPlus, FiTrash2, FiAlertTriangle, FiCalendar, FiMapPin, FiFileText, FiUser, FiActivity, FiSave, FiX, FiSearch, FiChevronDown, FiCheck, FiTablet, FiBox } from 'react-icons/fi';
import Loading from '../../components/Loading';
import AlertModal from '../../components/modal/AlertModal';
import userApi from '../../api/userApi';
import medicalApi from '../../api/medicalApi';

const HealthEventCreate = () => {
    const navigate = useNavigate();
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
        medicalItemUsages: []
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "success", title: "", message: "" });

    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const studentDropdownRef = useRef(null);
    const studentInputRef = useRef(null);

    const [medicines, setMedicines] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [medicinesLoading, setMedicinesLoading] = useState(false);
    const [suppliesLoading, setSuppliesLoading] = useState(false);

    // Search states for medicine/supply suggestions
    const [medicineSearches, setMedicineSearches] = useState({});
    const [supplySearches, setSupplySearches] = useState({});
    const [showMedicineDropdowns, setShowMedicineDropdowns] = useState({});
    const [showSupplyDropdowns, setShowSupplyDropdowns] = useState({});

    const eventTypes = [
        { value: 'Injury', label: 'Chấn thương' },
        { value: 'Illness', label: 'Bệnh tật' },
        { value: 'Allergic Reaction', label: 'Phản ứng dị ứng' },
        { value: 'Emergency', label: 'Cấp cứu' },
        { value: 'Other', label: 'Khác' }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target) &&
                studentInputRef.current && !studentInputRef.current.contains(event.target)) {
                setShowStudentDropdown(false);
            }

            // Close medicine/supply dropdowns when clicking outside their containers
            const clickedElement = event.target;
            const isClickInsideDropdown = clickedElement.closest('.medicine-dropdown-container') ||
                clickedElement.closest('.supply-dropdown-container');

            if (!isClickInsideDropdown) {
                setShowMedicineDropdowns({});
                setShowSupplyDropdowns({});
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
        fetchMedicines();
        fetchSupplies();
    }, []);

    const fetchStudents = async () => {
        setStudentsLoading(true);
        setStudentsError(null);
        try {
            const response = await userApi.getStudents({ pageIndex: 1, pageSize: 1000, searchTerm: studentSearch, orderBy: 'name' });
            if (response.success) {
                setStudents(response.data || []);
            } else {
                throw new Error(response.message || "Không thể tải danh sách học sinh");
            }
        } catch (error) {
            setStudentsError(error.message);
        } finally {
            setStudentsLoading(false);
        }
    };

    const fetchMedicines = async () => {
        setMedicinesLoading(true);
        try {
            const response = await medicalApi.getMedicalItems({ pageIndex: 1, pageSize: 1000, type: 'Medication', approvalStatus: 'Approved' });
            if (response.success) {
                setMedicines(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching medicines:', error);
        } finally {
            setMedicinesLoading(false);
        }
    };

    const fetchSupplies = async () => {
        setSuppliesLoading(true);
        try {
            const response = await medicalApi.getMedicalItems({ pageIndex: 1, pageSize: 1000, type: 'Supply', approvalStatus: 'Approved' });
            if (response.success) {
                setSupplies(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching supplies:', error);
        } finally {
            setSuppliesLoading(false);
        }
    };

    const clearError = (fieldName) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        clearError(name);
    };

    const handleCheckboxChange = (name, checked) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
        clearError(name);
    };

    const handleStudentSelect = (student) => {
        setFormData(prev => ({
            ...prev,
            userId: student.id
        }));
        setStudentSearch(`${student.name} - ${student.className || 'Chưa có lớp'}`);
        setShowStudentDropdown(false);
        clearError('userId');
    };

    const handleStudentSearchChange = (e) => {
        const value = e.target.value;
        setStudentSearch(value);
        setShowStudentDropdown(true);
        if (!value) {
            setFormData(prev => ({
                ...prev,
                userId: ''
            }));
        }
        clearError('userId');
    };

    const addMedicineUsage = () => {
        const newId = Date.now() + Math.random(); // Unique ID
        setFormData(prev => ({
            ...prev,
            medicalItemUsages: [
                ...prev.medicalItemUsages,
                {
                    id: newId,
                    medicalItemId: '',
                    quantity: 0,
                    notes: '',
                    usedAt: new Date().toISOString(),
                    itemType: 'medicine'
                }
            ]
        }));
        // Initialize search state for new item
        setMedicineSearches(prev => ({ ...prev, [newId]: '' }));
    };

    const removeMedicineUsage = (filteredIndex) => {
        const medicineItems = formData.medicalItemUsages.filter(item => item.itemType === 'medicine');
        const itemToRemove = medicineItems[filteredIndex];
        const realIndex = formData.medicalItemUsages.findIndex(item => item === itemToRemove);

        setFormData(prev => ({
            ...prev,
            medicalItemUsages: prev.medicalItemUsages.filter((_, i) => i !== realIndex)
        }));

        // Clean up search state
        setMedicineSearches(prev => {
            const newState = { ...prev };
            delete newState[itemToRemove.id];
            return newState;
        });
    };

    const updateMedicineUsage = (filteredIndex, field, value) => {
        const medicineItems = formData.medicalItemUsages.filter(item => item.itemType === 'medicine');
        const itemToUpdate = medicineItems[filteredIndex];
        const realIndex = formData.medicalItemUsages.findIndex(item => item === itemToUpdate);

        setFormData(prev => ({
            ...prev,
            medicalItemUsages: prev.medicalItemUsages.map((item, i) =>
                i === realIndex ? { ...item, [field]: value } : item
            )
        }));
    };

    const addSupplyUsage = () => {
        const newId = Date.now() + Math.random(); // Unique ID
        setFormData(prev => ({
            ...prev,
            medicalItemUsages: [
                ...prev.medicalItemUsages,
                {
                    id: newId,
                    medicalItemId: '',
                    quantity: 0,
                    notes: '',
                    usedAt: new Date().toISOString(),
                    itemType: 'supply'
                }
            ]
        }));
        // Initialize search state for new item
        setSupplySearches(prev => ({ ...prev, [newId]: '' }));
    };

    const removeSupplyUsage = (filteredIndex) => {
        const supplyItems = formData.medicalItemUsages.filter(item => item.itemType === 'supply');
        const itemToRemove = supplyItems[filteredIndex];
        const realIndex = formData.medicalItemUsages.findIndex(item => item === itemToRemove);

        setFormData(prev => ({
            ...prev,
            medicalItemUsages: prev.medicalItemUsages.filter((_, i) => i !== realIndex)
        }));

        // Clean up search state
        setSupplySearches(prev => {
            const newState = { ...prev };
            delete newState[itemToRemove.id];
            return newState;
        });
    };

    const updateSupplyUsage = (filteredIndex, field, value) => {
        const supplyItems = formData.medicalItemUsages.filter(item => item.itemType === 'supply');
        const itemToUpdate = supplyItems[filteredIndex];
        const realIndex = formData.medicalItemUsages.findIndex(item => item === itemToUpdate);

        setFormData(prev => ({
            ...prev,
            medicalItemUsages: prev.medicalItemUsages.map((item, i) =>
                i === realIndex ? { ...item, [field]: value } : item
            )
        }));
    };

    // Medicine search and select functions
    const handleMedicineSearchChange = (item, value) => {
        setMedicineSearches(prev => ({ ...prev, [item.id]: value }));
        setShowMedicineDropdowns(prev => ({ ...prev, [item.id]: true }));
        if (!value) {
            const medicineItems = formData.medicalItemUsages.filter(i => i.itemType === 'medicine');
            const filteredIndex = medicineItems.findIndex(i => i === item);
            updateMedicineUsage(filteredIndex, 'medicalItemId', '');
        }
    };

    const handleMedicineSelect = (item, medicine) => {
        const medicineItems = formData.medicalItemUsages.filter(i => i.itemType === 'medicine');
        const filteredIndex = medicineItems.findIndex(i => i === item);
        updateMedicineUsage(filteredIndex, 'medicalItemId', medicine.id);
        setMedicineSearches(prev => ({ ...prev, [item.id]: `${medicine.name}` }));
        setShowMedicineDropdowns(prev => ({ ...prev, [item.id]: false }));
    };

    // Supply search and select functions
    const handleSupplySearchChange = (item, value) => {
        setSupplySearches(prev => ({ ...prev, [item.id]: value }));
        setShowSupplyDropdowns(prev => ({ ...prev, [item.id]: true }));
        if (!value) {
            const supplyItems = formData.medicalItemUsages.filter(i => i.itemType === 'supply');
            const filteredIndex = supplyItems.findIndex(i => i === item);
            updateSupplyUsage(filteredIndex, 'medicalItemId', '');
        }
    };

    const handleSupplySelect = (item, supply) => {
        const supplyItems = formData.medicalItemUsages.filter(i => i.itemType === 'supply');
        const filteredIndex = supplyItems.findIndex(i => i === item);
        updateSupplyUsage(filteredIndex, 'medicalItemId', supply.id);
        setSupplySearches(prev => ({ ...prev, [item.id]: `${supply.name}` }));
        setShowSupplyDropdowns(prev => ({ ...prev, [item.id]: false }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.userId) {
            newErrors.userId = "Vui lòng chọn học sinh";
        }
        if (!formData.description?.trim()) {
            newErrors.description = "Vui lòng nhập mô tả sự kiện";
        }
        if (!formData.occurredAt) {
            newErrors.occurredAt = "Vui lòng chọn thời gian xảy ra";
        }
        if (!formData.location?.trim()) {
            newErrors.location = "Vui lòng nhập địa điểm";
        }
        if (!formData.actionTaken?.trim()) {
            newErrors.actionTaken = "Vui lòng nhập hành động đã thực hiện";
        }
        if (!formData.outcome?.trim()) {
            newErrors.outcome = "Vui lòng nhập kết quả";
        }
        if (!formData.currentHealthStatus?.trim()) {
            newErrors.currentHealthStatus = "Vui lòng nhập tình trạng sức khỏe hiện tại";
        }

        // Validate medicine usages
        const medicineItems = formData.medicalItemUsages.filter(item => item.itemType === 'medicine');
        medicineItems.forEach((usage, filteredIndex) => {
            const realIndex = formData.medicalItemUsages.findIndex(item => item === usage);
            if (!usage.medicalItemId) {
                newErrors[`medicineUsage_${filteredIndex}_medicalItemId`] = `Vui lòng chọn thuốc cho mục #${filteredIndex + 1}`;
            }
            if (!usage.quantity || usage.quantity <= 0) {
                newErrors[`medicineUsage_${filteredIndex}_quantity`] = `Vui lòng nhập số lượng hợp lệ cho mục #${filteredIndex + 1}`;
            }
        });

        // Validate supply usages
        const supplyItems = formData.medicalItemUsages.filter(item => item.itemType === 'supply');
        supplyItems.forEach((usage, filteredIndex) => {
            const realIndex = formData.medicalItemUsages.findIndex(item => item === usage);
            if (!usage.medicalItemId) {
                newErrors[`supplyUsage_${filteredIndex}_medicalItemId`] = `Vui lòng chọn vật tư cho mục #${filteredIndex + 1}`;
            }
            if (!usage.quantity || usage.quantity <= 0) {
                newErrors[`supplyUsage_${filteredIndex}_quantity`] = `Vui lòng nhập số lượng hợp lệ cho mục #${filteredIndex + 1}`;
            }
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
            // Remove itemType and id fields from medicalItemUsages for API
            const medicalItemUsages = formData.medicalItemUsages.map(item => {
                const { itemType, id, ...itemWithoutType } = item;
                return itemWithoutType;
            });

            // Prepare data for API according to the exact structure
            const submitData = {
                userId: formData.userId,
                eventType: formData.eventType,
                description: formData.description,
                occurredAt: formData.occurredAt,
                location: formData.location,
                actionTaken: formData.actionTaken,
                outcome: formData.outcome,
                isEmergency: formData.isEmergency,
                relatedMedicalConditionId: formData.relatedMedicalConditionId === '' ? null : formData.relatedMedicalConditionId,
                currentHealthStatus: formData.currentHealthStatus,
                parentNotice: formData.parentNotice,
                medicalItemUsages
            };

            console.log('Submit Data:', submitData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAlertConfig({ type: "success", title: "Thành công", message: "Đã tạo sự kiện y tế thành công" });
            setShowAlert(true);
        } catch (error) {
            setAlertConfig({ type: "error", title: "Lỗi", message: error.message || "Đã có lỗi xảy ra khi tạo sự kiện y tế" });
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
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

                        <div className="p-8">
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
                                                    color: TEXT.PRIMARY,
                                                    focusRingColor: PRIMARY[500] + '40'
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
                                                className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg overflow-hidden"
                                                style={{
                                                    borderColor: BORDER.DEFAULT,
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                                }}
                                            >
                                                {studentsError ? (
                                                    <div className="p-4 text-center" style={{ color: ERROR[500] }}>
                                                        <FiAlertTriangle className="h-6 w-6 mx-auto mb-2" />
                                                        {studentsError}
                                                    </div>
                                                ) : students.length === 0 ? (
                                                    <div className="p-4 text-center" style={{ color: TEXT.SECONDARY }}>
                                                        <FiSearch className="h-6 w-6 mx-auto mb-2" />
                                                        {studentSearch ? 'Không tìm thấy học sinh' : 'Nhập để tìm kiếm học sinh'}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {students.map((student) => (
                                                            <div
                                                                key={student.id}
                                                                onClick={() => handleStudentSelect(student)}
                                                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b last:border-b-0"
                                                                style={{ borderColor: BORDER.LIGHT }}
                                                            >
                                                                <div className="flex items-start">
                                                                    <div className="flex-grow min-w-0">
                                                                        <div className="font-medium text-base truncate" style={{ color: TEXT.PRIMARY }}>
                                                                            {student.name}
                                                                        </div>
                                                                        <div className="flex items-center space-x-2 text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                                            <span>{student.className || 'Chưa có lớp'}</span>
                                                                            {student.dateOfBirth && (
                                                                                <>
                                                                                    <span>•</span>
                                                                                    <span>SN: {new Date(student.dateOfBirth).getFullYear()}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {formData.userId === student.id && (
                                                                        <div className="ml-3 text-lg flex-shrink-0" style={{ color: PRIMARY[500] }}>
                                                                            <FiCheck className="h-5 w-5" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {errors.userId && (
                                        <p className="mt-2 text-sm text-red-500">{errors.userId}</p>
                                    )}
                                </div>

                                {/* Event Type */}
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Loại sự kiện *
                                    </label>
                                    <select
                                        name="eventType"
                                        value={formData.eventType}
                                        onChange={handleInputChange}
                                        className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                    >
                                        {eventTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Emergency Checkbox */}
                                <div className="flex items-center space-x-4">
                                    <label className="block text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Trường hợp khẩn cấp
                                    </label>
                                    <div
                                        className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-all duration-200"
                                        style={{ backgroundColor: formData.isEmergency ? ERROR[50] : 'transparent' }}
                                        onClick={() => handleCheckboxChange('isEmergency', !formData.isEmergency)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.isEmergency}
                                            onChange={(e) => handleCheckboxChange('isEmergency', e.target.checked)}
                                            className="h-5 w-5 rounded border-2 transition-all duration-200"
                                            style={{ accentColor: ERROR[500] }}
                                        />
                                        {formData.isEmergency && (
                                            <FiAlertTriangle className="h-5 w-5" style={{ color: ERROR[500] }} />
                                        )}
                                    </div>
                                </div>

                                {/* Occurred At */}
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Thời gian xảy ra *
                                    </label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                        <input
                                            type="datetime-local"
                                            name="occurredAt"
                                            value={formData.occurredAt}
                                            onChange={handleInputChange}
                                            className={`w-full pl-12 pr-4 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.occurredAt ? 'border-red-500' : ''}`}
                                            style={{
                                                borderColor: errors.occurredAt ? '#ef4444' : BORDER.DEFAULT,
                                                backgroundColor: BACKGROUND.DEFAULT,
                                                color: TEXT.PRIMARY,
                                                focusRingColor: PRIMARY[500] + '40'
                                            }}
                                            required
                                        />
                                    </div>
                                    {errors.occurredAt && (
                                        <p className="mt-2 text-sm text-red-500">{errors.occurredAt}</p>
                                    )}
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Địa điểm *
                                    </label>
                                    <div className="relative">
                                        <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="Ví dụ: Sân trường, Lớp học, Căng tin..."
                                            className={`w-full pl-12 pr-4 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.location ? 'border-red-500' : ''}`}
                                            style={{
                                                borderColor: errors.location ? '#ef4444' : BORDER.DEFAULT,
                                                backgroundColor: BACKGROUND.DEFAULT,
                                                color: TEXT.PRIMARY,
                                                focusRingColor: PRIMARY[500] + '40'
                                            }}
                                            required
                                        />
                                    </div>
                                    {errors.location && (
                                        <p className="mt-2 text-sm text-red-500">{errors.location}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                    Mô tả chi tiết sự kiện *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả chi tiết về sự kiện đã xảy ra..."
                                    rows={4}
                                    className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base resize-none ${errors.description ? 'border-red-500' : ''}`}
                                    style={{
                                        borderColor: errors.description ? '#ef4444' : BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        color: TEXT.PRIMARY,
                                        focusRingColor: PRIMARY[500] + '40'
                                    }}
                                    required
                                />
                                {errors.description && (
                                    <p className="mt-2 text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action & Outcome Card */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b flex items-center" style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiActivity className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Xử lý & Kết quả
                            </h2>
                        </div>

                        <div className="p-8">
                            <div className="space-y-6">
                                {/* Action Taken */}
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Hành động đã thực hiện *
                                    </label>
                                    <textarea
                                        name="actionTaken"
                                        value={formData.actionTaken}
                                        onChange={handleInputChange}
                                        placeholder="Mô tả các biện pháp xử lý đã thực hiện..."
                                        rows={3}
                                        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base resize-none ${errors.actionTaken ? 'border-red-500' : ''}`}
                                        style={{
                                            borderColor: errors.actionTaken ? '#ef4444' : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        required
                                    />
                                    {errors.actionTaken && (
                                        <p className="mt-2 text-sm text-red-500">{errors.actionTaken}</p>
                                    )}
                                </div>

                                {/* Outcome */}
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Kết quả *
                                    </label>
                                    <textarea
                                        name="outcome"
                                        value={formData.outcome}
                                        onChange={handleInputChange}
                                        placeholder="Kết quả sau khi xử lý..."
                                        rows={3}
                                        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base resize-none ${errors.outcome ? 'border-red-500' : ''}`}
                                        style={{
                                            borderColor: errors.outcome ? '#ef4444' : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        required
                                    />
                                    {errors.outcome && (
                                        <p className="mt-2 text-sm text-red-500">{errors.outcome}</p>
                                    )}
                                </div>

                                {/* Current Health Status */}
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Tình trạng sức khỏe hiện tại *
                                    </label>
                                    <input
                                        type="text"
                                        name="currentHealthStatus"
                                        value={formData.currentHealthStatus}
                                        onChange={handleInputChange}
                                        placeholder="Ví dụ: Ổn định, Cần theo dõi, Đã hồi phục..."
                                        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.currentHealthStatus ? 'border-red-500' : ''}`}
                                        style={{
                                            borderColor: errors.currentHealthStatus ? '#ef4444' : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        required
                                    />
                                    {errors.currentHealthStatus && (
                                        <p className="mt-2 text-sm text-red-500">{errors.currentHealthStatus}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medicine Usage */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <div className="flex items-center">
                                <FiTablet className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                                <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                    Thuốc đã sử dụng
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={addMedicineUsage}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                            >
                                <FiPlus className="h-4 w-4" />
                                <span>Thêm thuốc</span>
                            </button>
                        </div>

                        <div className="p-8">
                            {formData.medicalItemUsages.filter(item => item.itemType === 'medicine').length === 0 ? (
                                <div className="text-center py-8" style={{ color: TEXT.SECONDARY }}>
                                    <FiTablet className="h-8 w-8 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">Chưa có thuốc nào được sử dụng</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {formData.medicalItemUsages.filter(item => item.itemType === 'medicine').map((item, index) => (
                                        <div key={index} className="p-6 border rounded-lg" style={{ backgroundColor: PRIMARY[25], borderColor: BORDER.DEFAULT }}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    Thuốc #{index + 1}
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedicineUsage(index)}
                                                    className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                                    style={{ backgroundColor: ERROR[50], color: ERROR[600] }}
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className=" text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                        Thuốc
                                                    </label>
                                                    <div className="relative medicine-dropdown-container">
                                                        <input
                                                            type="text"
                                                            value={medicineSearches[item.id] || ''}
                                                            onChange={(e) => handleMedicineSearchChange(item, e.target.value)}
                                                            onFocus={() => setShowMedicineDropdowns(prev => ({ ...prev, [item.id]: true }))}
                                                            placeholder="Tìm và chọn thuốc..."
                                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                            style={{
                                                                borderColor: item.medicalItemId ? PRIMARY[500] : BORDER.DEFAULT,
                                                                backgroundColor: item.medicalItemId ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                                                color: TEXT.PRIMARY,
                                                                focusRingColor: PRIMARY[500] + '40'
                                                            }}
                                                            disabled={medicinesLoading}
                                                        />
                                                        {item.medicalItemId && (
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                <FiCheck className="h-4 w-4" style={{ color: PRIMARY[600] }} />
                                                            </div>
                                                        )}

                                                        {showMedicineDropdowns[item.id] && (
                                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                                                style={{ borderColor: BORDER.DEFAULT }}>
                                                                {medicines.filter(medicine =>
                                                                    medicine.name.toLowerCase().includes((medicineSearches[item.id] || '').toLowerCase())
                                                                ).map((medicine) => (
                                                                    <div
                                                                        key={medicine.id}
                                                                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                                                        onClick={() => handleMedicineSelect(item, medicine)}
                                                                    >
                                                                        <div className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                                                            {medicine.name}
                                                                        </div>
                                                                        <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                            {medicine.dosage || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {medicines.filter(medicine =>
                                                                    medicine.name.toLowerCase().includes((medicineSearches[item.id] || '').toLowerCase())
                                                                ).length === 0 && (
                                                                        <div className="p-3 text-center" style={{ color: TEXT.SECONDARY }}>
                                                                            Không tìm thấy thuốc phù hợp
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {medicinesLoading && (
                                                        <p className="mt-1 text-sm" style={{ color: TEXT.SECONDARY }}>Đang tải danh sách thuốc...</p>
                                                    )}
                                                    {errors[`medicineUsage_${index}_medicalItemId`] && (
                                                        <p className="mt-1 text-sm text-red-500">{errors[`medicineUsage_${index}_medicalItemId`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                        Số lượng
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.quantity}
                                                        onChange={(e) => updateMedicineUsage(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                        style={{
                                                            borderColor: BORDER.DEFAULT,
                                                            backgroundColor: BACKGROUND.DEFAULT,
                                                            color: TEXT.PRIMARY,
                                                            focusRingColor: PRIMARY[500] + '40'
                                                        }}
                                                    />
                                                    {errors[`medicineUsage_${index}_quantity`] && (
                                                        <p className="mt-1 text-sm text-red-500">{errors[`medicineUsage_${index}_quantity`]}</p>
                                                    )}
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                        Ghi chú
                                                    </label>
                                                    <textarea
                                                        value={item.notes}
                                                        onChange={(e) => updateMedicineUsage(index, 'notes', e.target.value)}
                                                        placeholder="Ghi chú về cách sử dụng..."
                                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                        style={{
                                                            borderColor: BORDER.DEFAULT,
                                                            backgroundColor: BACKGROUND.DEFAULT,
                                                            color: TEXT.PRIMARY,
                                                            focusRingColor: PRIMARY[500] + '40'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Medical Supply Usage */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <div className="flex items-center">
                                <FiBox className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                                <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                    Vật tư y tế đã sử dụng
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={addSupplyUsage}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                            >
                                <FiPlus className="h-4 w-4" />
                                <span>Thêm vật tư</span>
                            </button>
                        </div>

                        <div className="p-8">
                            {formData.medicalItemUsages.filter(item => item.itemType === 'supply').length === 0 ? (
                                <div className="text-center py-8" style={{ color: TEXT.SECONDARY }}>
                                    <FiBox className="h-8 w-8 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">Chưa có vật tư y tế nào được sử dụng</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {formData.medicalItemUsages.filter(item => item.itemType === 'supply').map((item, index) => (
                                        <div key={index} className="p-6 border rounded-lg" style={{ backgroundColor: PRIMARY[25], borderColor: BORDER.DEFAULT }}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    Vật tư #{index + 1}
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSupplyUsage(index)}
                                                    className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                                    style={{ backgroundColor: ERROR[50], color: ERROR[600] }}
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                        Vật tư y tế
                                                    </label>
                                                    <div className="relative supply-dropdown-container">
                                                        <input
                                                            type="text"
                                                            value={supplySearches[item.id] || ''}
                                                            onChange={(e) => handleSupplySearchChange(item, e.target.value)}
                                                            onFocus={() => setShowSupplyDropdowns(prev => ({ ...prev, [item.id]: true }))}
                                                            placeholder="Tìm và chọn vật tư y tế..."
                                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                            style={{
                                                                borderColor: item.medicalItemId ? PRIMARY[500] : BORDER.DEFAULT,
                                                                backgroundColor: item.medicalItemId ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                                                color: TEXT.PRIMARY,
                                                                focusRingColor: PRIMARY[500] + '40'
                                                            }}
                                                            disabled={suppliesLoading}
                                                        />
                                                        {item.medicalItemId && (
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                <FiCheck className="h-4 w-4" style={{ color: PRIMARY[600] }} />
                                                            </div>
                                                        )}

                                                        {showSupplyDropdowns[item.id] && (
                                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                                                style={{ borderColor: BORDER.DEFAULT }}>
                                                                {supplies.filter(supply =>
                                                                    supply.name.toLowerCase().includes((supplySearches[item.id] || '').toLowerCase())
                                                                ).map((supply) => (
                                                                    <div
                                                                        key={supply.id}
                                                                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                                                        onClick={() => handleSupplySelect(item, supply)}
                                                                    >
                                                                        <div className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                                                            {supply.name} - số lượng: {supply.quantity}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {supplies.filter(supply =>
                                                                    supply.name.toLowerCase().includes((supplySearches[item.id] || '').toLowerCase())
                                                                ).length === 0 && (
                                                                        <div className="p-3 text-center" style={{ color: TEXT.SECONDARY }}>
                                                                            Không tìm thấy vật tư phù hợp
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {suppliesLoading && (
                                                        <p className="mt-1 text-sm" style={{ color: TEXT.SECONDARY }}>Đang tải danh sách vật tư...</p>
                                                    )}
                                                    {errors[`supplyUsage_${index}_medicalItemId`] && (
                                                        <p className="mt-1 text-sm text-red-500">{errors[`supplyUsage_${index}_medicalItemId`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                        Số lượng
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.quantity}
                                                        onChange={(e) => updateSupplyUsage(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                        style={{
                                                            borderColor: BORDER.DEFAULT,
                                                            backgroundColor: BACKGROUND.DEFAULT,
                                                            color: TEXT.PRIMARY,
                                                            focusRingColor: PRIMARY[500] + '40'
                                                        }}
                                                    />
                                                    {errors[`supplyUsage_${index}_quantity`] && (
                                                        <p className="mt-1 text-sm text-red-500">{errors[`supplyUsage_${index}_quantity`]}</p>
                                                    )}
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                        Ghi chú
                                                    </label>
                                                    <textarea
                                                        value={item.notes}
                                                        onChange={(e) => updateSupplyUsage(index, 'notes', e.target.value)}
                                                        placeholder="Ghi chú về cách sử dụng..."
                                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                                        style={{
                                                            borderColor: BORDER.DEFAULT,
                                                            backgroundColor: BACKGROUND.DEFAULT,
                                                            color: TEXT.PRIMARY,
                                                            focusRingColor: PRIMARY[500] + '40'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b flex items-center" style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                            <FiFileText className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                Thông tin bổ sung
                            </h2>
                        </div>

                        <div className="p-8">
                            <div className="space-y-6">
                                {/* Related Medical Condition */}
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Tình trạng y tế liên quan
                                    </label>
                                    <select
                                        name="relatedMedicalConditionId"
                                        value={formData.relatedMedicalConditionId}
                                        onChange={handleInputChange}
                                        className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                    >
                                        <option value="">-- Không có --</option>
                                        <option value="condition-1">Hen suyễn</option>
                                        <option value="condition-2">Dị ứng thức ăn</option>
                                        <option value="condition-3">Tiểu đường</option>
                                        <option value="condition-4">Cao huyết áp</option>
                                    </select>
                                </div>

                                {/* Parent Notice */}
                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Thông báo cho phụ huynh
                                    </label>
                                    <textarea
                                        name="parentNotice"
                                        value={formData.parentNotice}
                                        onChange={handleInputChange}
                                        placeholder="Thông báo sẽ gửi cho phụ huynh..."
                                        rows={4}
                                        className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base resize-none"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Notice */}
                    {formData.isEmergency && (
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: ERROR[300] }}>
                            <div className="p-6 border-b flex items-center" style={{ borderColor: ERROR[300], backgroundColor: ERROR[50] }}>
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

                    {/* Submit Actions */}
                    <div className="flex justify-end items-center sticky bottom-0 bg-white p-6 border-t rounded-b-xl shadow-md" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 rounded-lg border font-medium transition-all duration-200 flex items-center"
                                style={{ borderColor: BORDER.DEFAULT, color: TEXT.PRIMARY, backgroundColor: 'white' }}
                                disabled={loading}
                            >
                                <FiX className="mr-2 h-5 w-5" />
                                Hủy
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
                                style={{
                                    backgroundColor: loading ? GRAY[400] : PRIMARY[500],
                                    color: 'white',
                                    boxShadow: `0 1px 2px 0 ${PRIMARY[500]}40`
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loading type="spinner" size="small" color="white" className="mr-2" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-2 h-5 w-5" />
                                        Lưu sự kiện y tế
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