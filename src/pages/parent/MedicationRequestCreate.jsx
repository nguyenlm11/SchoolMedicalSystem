import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR, SUCCESS } from '../../constants/colors';
import { FiSave, FiUser, FiTablet, FiAlertTriangle, FiCheck, FiChevronDown, FiPlus, FiTrash2, FiChevronLeft, FiCalendar } from 'react-icons/fi';
import Loading from '../../components/Loading';
import AlertModal from '../../components/modal/AlertModal';
import userApi from '../../api/userApi';
import medicationRequestApi from '../../api/medicationRequestApi';
import { useAuth } from '../../utils/AuthContext';

const TIMES_OF_DAY = [
    { value: 'Morning', label: 'Buổi sáng', time: '6:00 - 11:00' },
    { value: 'Noon', label: 'Buổi trưa', time: '11:00 - 14:00' },
    { value: 'Afternoon', label: 'Buổi chiều', time: '14:00 - 18:00' },
    { value: 'Evening', label: 'Buổi tối', time: '18:00 - 22:00' },
];

const QUANTITY_UNITS = [
    { value: 'Tablet', label: 'Viên' },
    { value: 'Bottle', label: 'Chai' },
    { value: 'Package', label: 'Gói' }
];

const PRIORITY_OPTIONS = [
    { value: 'Low', label: 'Thấp' },
    { value: 'Normal', label: 'Bình thường' },
    { value: 'High', label: 'Cao' },
    { value: 'Critical', label: 'Khẩn cấp' }
];

const INITIAL_MEDICATION = {
    medicationName: '',
    dosage: '',
    instructions: '',
    frequencyCount: '',
    expiryDate: '',
    quantitySent: '',
    quantityUnit: 'Tablet',
    specialNotes: '',
    timesOfDay: [],
    startDate: ''
};

const MedicationRequestCreate = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "success", title: "", message: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const studentDropdownRef = useRef(null);
    const studentInputRef = useRef(null);
    const [formData, setFormData] = useState({ studentId: '', priority: 'Normal', medications: [{ ...INITIAL_MEDICATION }] });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target) &&
                studentInputRef.current && !studentInputRef.current.contains(event.target)) {
                setShowStudentDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [studentSearch]);

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const response = await userApi.getParentStudents(user.id, { pageIndex: 1, pageSize: 100, searchTerm: studentSearch, orderBy: 'name' });
            if (response.success) {
                setStudents(response.data);
            } else {
                throw new Error(response.message || "Không thể tải danh sách học sinh");
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setStudentsLoading(false);
        }
    };

    const validateMedication = (medication) => {
        return (
            medication.medicationName.trim() !== '' &&
            medication.dosage.trim() !== '' &&
            medication.frequencyCount > 0 &&
            medication.expiryDate !== '' &&
            medication.quantitySent.trim() !== '' &&
            medication.instructions.trim() !== '' &&
            medication.timesOfDay.length > 0
        );
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.studentId) {
            newErrors.studentId = 'Vui lòng chọn học sinh';
        }
        if (!formData.priority) {
            newErrors.priority = 'Vui lòng chọn mức độ ưu tiên';
        }
        formData.medications.forEach((medication, index) => {
            if (!medication.medicationName.trim()) {
                newErrors[`medications.${index}.medicationName`] = 'Vui lòng nhập tên thuốc';
            }
            if (medication.dosage.trim() === '') {
                newErrors[`medications.${index}.dosage`] = 'Vui lòng nhập liều lượng';
            }
            if (medication.frequencyCount <= 0) {
                newErrors[`medications.${index}.frequencyCount`] = 'Vui lòng nhập số lần uống thuốc lớn hơn 0';
            }
            if (medication.quantitySent.trim() === '') {
                newErrors[`medications.${index}.quantitySent`] = 'Vui lòng nhập số lượng gửi';
            }
            if (!medication.instructions.trim()) {
                newErrors[`medications.${index}.instructions`] = 'Vui lòng nhập hướng dẫn sử dụng';
            }
            if (!medication.expiryDate) {
                newErrors[`medications.${index}.expiryDate`] = 'Vui lòng chọn ngày hết hạn';
            }
            if (medication.timesOfDay.length === 0) {
                newErrors[`medications.${index}.times`] = 'Vui lòng chọn ít nhất một thời điểm uống thuốc';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const handleStudentSelect = (student) => {
        setFormData(prev => ({ ...prev, studentId: student.id }));
        setStudentSearch(`${student.fullName} - Lớp ${student.currentClassName}`);
        setShowStudentDropdown(false);
        clearError('studentId');
    };

    const handleStudentSearchChange = (e) => {
        const value = e.target.value;
        setStudentSearch(value);
        setShowStudentDropdown(true);
        if (!value) { setFormData(prev => ({ ...prev, studentId: '' })) }
        clearError('studentId');
    };

    const handleAddMedication = () => {
        const currentMedication = formData.medications[currentStep];
        if (!validateMedication(currentMedication)) {
            setAlertConfig({ type: "error", title: "Lỗi", message: "Vui lòng điền đầy đủ thông tin thuốc hiện tại trước khi thêm thuốc mới" });
            setShowAlert(true);
            return;
        }
        setFormData(prev => {
            const newMedications = [...prev.medications, { ...INITIAL_MEDICATION }];
            setCurrentStep(newMedications.length - 1);
            return { ...prev, medications: newMedications };
        });
    };

    const handleRemoveMedication = (index) => {
        if (currentStep >= index) {
            setCurrentStep(Math.max(0, currentStep - 1));
        }
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index)
        }));
    };

    const handleMedicationChange = (index, field, value) => {
        const newMedications = [...formData.medications];
        newMedications[index] = { ...newMedications[index], [field]: value };
        setFormData({ ...formData, medications: newMedications });
        clearError(`medications.${index}.${field}`);
    };

    const handleTimeOfDayChange = (index, timeValue) => {
        const medication = formData.medications[index];
        const isSelected = medication.timesOfDay.includes(timeValue);
        const newMedications = [...formData.medications];
        newMedications[index] = {
            ...newMedications[index],
            timesOfDay: isSelected ? newMedications[index].timesOfDay.filter(time => time !== timeValue) : [...newMedications[index].timesOfDay, timeValue]
        };
        setFormData({ ...formData, medications: newMedications });
        clearError(`medications.${index}.timesOfDay`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const formattedData = {
                ...formData,
                medications: formData.medications.map(medication => ({
                    ...medication,
                    startDate: medication.startDate ? new Date(medication.startDate).toISOString() : null,
                    expiryDate: medication.expiryDate ? new Date(medication.expiryDate).toISOString() : null,
                    frequencyCount: parseInt(medication.frequencyCount),
                    quantitySent: parseInt(medication.quantitySent)
                }))
            };
            const response = await medicationRequestApi.createBulkRequest(formattedData);
            if (response.success) {
                setAlertConfig({ type: "success", title: "Thành công", message: response.message });
                setTimeout(() => navigate('/parent/medication/history'), 1500);
            } else {
                setAlertConfig({ type: "error", title: "Lỗi", message: response.message || "Có lỗi xảy ra khi gửi yêu cầu" });
            }
            setShowAlert(true);
        } catch (error) {
            setAlertConfig({ type: "error", title: "Lỗi", message: "Có lỗi xảy ra khi gửi yêu cầu" });
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const currentMedication = formData.medications[currentStep];
    const remainingTimes = Math.max(0, (parseInt(currentMedication.frequencyCount) || 0) - currentMedication.timesOfDay.length);

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="bg-white border-b shadow-sm" style={{ borderColor: BORDER.LIGHT }}>
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                style={{ color: GRAY[600] }}
                            >
                                <FiChevronLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    Tạo yêu cầu thuốc
                        </h1>
                                <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                    Điền thông tin để gửi yêu cầu cấp phát thuốc
                        </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: PRIMARY[100] }}>
                                <FiUser className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                            </div>
                            <h2 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Chọn học sinh
                            </h2>
                        </div>

                            <div className="relative" ref={studentDropdownRef}>
                                <div className="relative">
                                    <input
                                        ref={studentInputRef}
                                        type="text"
                                        value={studentSearch}
                                        onChange={handleStudentSearchChange}
                                        onFocus={() => setShowStudentDropdown(true)}
                                    placeholder="Chọn học sinh..."
                                    className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${errors.studentId ? 'border-red-500' : ''}`}
                                        style={{
                                        borderColor: errors.studentId ? ERROR[500] : (formData.studentId ? PRIMARY[500] : BORDER.DEFAULT),
                                        backgroundColor: formData.studentId ? PRIMARY[50] : BACKGROUND.DEFAULT
                                        }}
                                    />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                        {formData.studentId && (
                                        <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: SUCCESS[100], color: SUCCESS[700] }}>
                                                Đã chọn
                                            </div>
                                        )}
                                        {studentsLoading ? (
                                            <Loading type="spinner" size="small" color="primary" />
                                        ) : (
                                        <FiChevronDown className={`h-4 w-4 transition-transform ${showStudentDropdown ? 'rotate-180' : ''}`} style={{ color: GRAY[400] }} />
                                        )}
                                    </div>
                                </div>

                                {showStudentDropdown && (
                                <div className="absolute left-0 right-0 z-50 mt-2">
                                    <div className="bg-white border rounded-lg shadow-lg overflow-hidden" style={{ borderColor: BORDER.DEFAULT, maxHeight: '240px' }}>
                                        <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
                                                {students.length === 0 ? (
                                                <div className="p-4 text-center text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        {studentSearch ? 'Không tìm thấy học sinh' : 'Nhập để tìm kiếm học sinh'}
                                                    </div>
                                                ) : (
                                                    students.map((student) => (
                                                        <div
                                                            key={student.id}
                                                            onClick={() => handleStudentSelect(student)}
                                                        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b last:border-b-0"
                                                            style={{ borderColor: BORDER.LIGHT }}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                                                        {student.fullName}
                                                                    </div>
                                                                    <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                        {student.studentCode} - Lớp {student.currentClassName}
                                                                    </div>
                                                                </div>
                                                                {formData.studentId === student.id && (
                                                                <FiCheck className="h-4 w-4" style={{ color: PRIMARY[500] }} />
                                                                )}
                                                        </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.studentId && (
                            <p className="mt-2 text-sm" style={{ color: ERROR[500] }}>{errors.studentId}</p>
                            )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: PRIMARY[100] }}>
                                <FiAlertTriangle className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                            </div>
                            <h2 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Mức độ ưu tiên
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {PRIORITY_OPTIONS.map(option => {
                                    const isSelected = formData.priority === option.value;
                                    return (
                                        <label
                                            key={option.value}
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-gray-50`}
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: PRIMARY[50] }}
                                        >
                                            <input
                                                type="radio"
                                                name="priority"
                                                value={option.value}
                                                checked={isSelected}
                                                onChange={(e) => { setFormData(prev => ({ ...prev, priority: e.target.value })); clearError('priority') }}
                                            className="sr-only"
                                            />
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${isSelected ? 'ring-2 ring-offset-2' : ''}`} style={{ backgroundColor: isSelected ? PRIMARY[500] : GRAY[300] }}></div>
                                            <span className="text-sm font-medium" style={{ color: isSelected ? PRIMARY[500] : TEXT.PRIMARY }}>
                                                {option.label}
                                            </span>
                                        </div>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.priority && (
                            <p className="mt-2 text-sm" style={{ color: ERROR[500] }}>{errors.priority}</p>
                            )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT, backgroundColor: GRAY[50] }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: PRIMARY[100] }}>
                                        <FiTablet className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                    </div>
                                    <h2 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        Thông tin thuốc
                                    </h2>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {formData.medications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMedication(currentStep)}
                                            className="p-2 rounded-lg transition-all duration-200 hover:bg-red-50"
                                            style={{ color: ERROR[500] }}
                                            title="Xóa thuốc này"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleAddMedication}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${!validateMedication(currentMedication) ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500' : 'text-white'}`}
                                        style={{ backgroundColor: !validateMedication(currentMedication) ? undefined : PRIMARY[500] }}
                                        disabled={!validateMedication(currentMedication)}
                                    >
                                        <FiPlus className="mr-1 h-4 w-4" /> Thêm thuốc
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-center space-x-3 mt-4 overflow-x-auto">
                                {formData.medications.map((medication, index) => {
                                    const isValid = validateMedication(medication);
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setCurrentStep(index)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-200 flex-shrink-0 ${currentStep === index
                                                ? 'text-white shadow-lg'
                                                : index < currentStep ? 'text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                            style={{
                                                backgroundColor: currentStep === index ? PRIMARY[500] : index < currentStep ? PRIMARY[400] : 'white',
                                                border: `2px solid ${currentStep === index ? PRIMARY[500] : index < currentStep ? PRIMARY[400] : BORDER.DEFAULT}`
                                            }}
                                        >
                                            {index < currentStep && isValid ? <FiCheck className="h-4 w-4" /> : <span className="text-sm">{index + 1}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Tên thuốc *
                                    </label>
                                    <input
                                        type="text"
                                        value={currentMedication.medicationName}
                                        onChange={(e) => handleMedicationChange(currentStep, 'medicationName', e.target.value)}
                                        placeholder="Nhập tên thuốc"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${errors[`medications.${currentStep}.medicationName`] ? 'border-red-500' : ''}`}
                                            style={{ borderColor: errors[`medications.${currentStep}.medicationName`] ? ERROR[500] : BORDER.DEFAULT }}
                                    />
                                    {errors[`medications.${currentStep}.medicationName`] && (
                                            <p className="mt-1 text-sm" style={{ color: ERROR[500] }}>{errors[`medications.${currentStep}.medicationName`]}</p>
                                    )}
                                </div>

                                <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                            Liều lượng/lần uống *
                                        </label>
                                        <input
                                            type="text"
                                            value={currentMedication.dosage}
                                            onChange={(e) => handleMedicationChange(currentStep, 'dosage', e.target.value)}
                                            placeholder="Ví dụ: 1 viên, 0.5 mg, 1 gói..."
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${errors[`medications.${currentStep}.dosage`] ? 'border-red-500' : ''}`}
                                            style={{ borderColor: errors[`medications.${currentStep}.dosage`] ? ERROR[500] : BORDER.DEFAULT }}
                                        />
                                        {errors[`medications.${currentStep}.dosage`] && (
                                            <p className="mt-1 text-sm" style={{ color: ERROR[500] }}>{errors[`medications.${currentStep}.dosage`]}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Tần suất/ngày *
                                    </label>
                                    <input
                                        type="number"
                                        value={currentMedication.frequencyCount}
                                        onChange={(e) => handleMedicationChange(currentStep, 'frequencyCount', e.target.value)}
                                            placeholder="1"
                                        min="1"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${errors[`medications.${currentStep}.frequencyCount`] ? 'border-red-500' : ''}`}
                                            style={{ borderColor: errors[`medications.${currentStep}.frequencyCount`] ? ERROR[500] : BORDER.DEFAULT }}
                                    />
                                    {errors[`medications.${currentStep}.frequencyCount`] && (
                                            <p className="mt-1 text-sm" style={{ color: ERROR[500] }}>{errors[`medications.${currentStep}.frequencyCount`]}</p>
                                    )}
                                </div>

                                <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Số lượng gửi *
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            value={currentMedication.quantitySent}
                                            onChange={(e) => handleMedicationChange(currentStep, 'quantitySent', e.target.value)}
                                            placeholder="Nhập số lượng"
                                            min="1"
                                                className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${errors[`medications.${currentStep}.quantitySent`] ? 'border-red-500' : ''}`}
                                                style={{ borderColor: errors[`medications.${currentStep}.quantitySent`] ? ERROR[500] : BORDER.DEFAULT }}
                                        />
                                        <select
                                            value={currentMedication.quantityUnit}
                                            onChange={(e) => handleMedicationChange(currentStep, 'quantityUnit', e.target.value)}
                                                className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                            style={{ borderColor: BORDER.DEFAULT }}
                                        >
                                            {QUANTITY_UNITS.map(unit => (
                                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors[`medications.${currentStep}.quantitySent`] && (
                                            <p className="mt-1 text-sm" style={{ color: ERROR[500] }}>{errors[`medications.${currentStep}.quantitySent`]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                            Ngày hết hạn *
                                        </label>
                                        <div className="relative">
                                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                                            <input
                                                type="date"
                                                value={currentMedication.expiryDate ? currentMedication.expiryDate.split('T')[0] : ''}
                                                onChange={(e) => handleMedicationChange(currentStep, 'expiryDate', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${errors[`medications.${currentStep}.expiryDate`] ? 'border-red-500' : ''}`}
                                                style={{ borderColor: errors[`medications.${currentStep}.expiryDate`] ? ERROR[500] : BORDER.DEFAULT }}
                                            />
                                        </div>
                                        {errors[`medications.${currentStep}.expiryDate`] && (
                                            <p className="mt-1 text-sm" style={{ color: ERROR[500] }}>{errors[`medications.${currentStep}.expiryDate`]}</p>
                                    )}
                                </div>
                            </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Ngày bắt đầu (tùy chọn)
                                    </label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                                    <input
                                        type="date"
                                        value={currentMedication.startDate ? currentMedication.startDate.split('T')[0] : ''}
                                        onChange={(e) => handleMedicationChange(currentStep, 'startDate', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT }}
                                    />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Thời điểm dùng thuốc * ({remainingTimes} lần còn lại)
                                    </label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {TIMES_OF_DAY.map(time => {
                                            const isSelected = currentMedication.timesOfDay.includes(time.value);
                                            const isDisabled = !isSelected && remainingTimes === 0;
                                            return (
                                                <label
                                                    key={time.value}
                                                    className={`flex items-center p-3 border rounded-lg transition-all duration-200 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                                                    style={{
                                                        borderColor: isSelected ? PRIMARY[500] : BORDER.DEFAULT,
                                                        backgroundColor: isSelected ? PRIMARY[50] : 'white'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleTimeOfDayChange(currentStep, time.value)}
                                                        className="h-4 w-4 mr-2"
                                                        style={{ accentColor: PRIMARY[500] }}
                                                        disabled={isDisabled}
                                                    />
                                                    <div>
                                                        <div className="font-medium text-sm" style={{ color: TEXT.PRIMARY }}>{time.label}</div>
                                                        <div className="text-xs" style={{ color: TEXT.SECONDARY }}>{time.time}</div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {errors[`medications.${currentStep}.times`] && (
                                        <p className="mt-2 text-sm" style={{ color: ERROR[500] }}>Vui lòng chọn ít nhất một thời điểm dùng thuốc</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Hướng dẫn sử dụng *
                                    </label>
                                    <textarea
                                        value={currentMedication.instructions}
                                        onChange={(e) => handleMedicationChange(currentStep, 'instructions', e.target.value)}
                                        placeholder="Nhập hướng dẫn sử dụng thuốc"
                                        rows={3}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${errors[`medications.${currentStep}.instructions`] ? 'border-red-500' : ''}`}
                                        style={{ borderColor: errors[`medications.${currentStep}.instructions`] ? ERROR[500] : BORDER.DEFAULT }}
                                    />
                                    {errors[`medications.${currentStep}.instructions`] && (
                                        <p className="mt-1 text-sm" style={{ color: ERROR[500] }}>{errors[`medications.${currentStep}.instructions`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Ghi chú đặc biệt (tùy chọn)
                                    </label>
                                    <textarea
                                        value={currentMedication.specialNotes}
                                        onChange={(e) => handleMedicationChange(currentStep, 'specialNotes', e.target.value)}
                                        placeholder="Các lưu ý khi sử dụng thuốc (nếu có)"
                                        rows={2}
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none"
                                        style={{ borderColor: BORDER.DEFAULT }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-lg py-4" style={{ borderColor: BORDER.LIGHT }}>
                <div className="max-w-6xl mx-auto px-6">
                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-lg border font-medium transition-all duration-200 flex items-center hover:bg-gray-50"
                            style={{ borderColor: BORDER.DEFAULT, color: TEXT.PRIMARY }}
                                disabled={loading}
                            >
                            <FiChevronLeft className="mr-2 h-4 w-4" /> Quay lại
                            </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                    style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loading type="spinner" size="small" color="white" className="mr-2" /> Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                    <FiSave className="mr-2 h-4 w-4" /> Gửi yêu cầu
                                        </>
                                    )}
                                </button>
                    </div>
                </div>
            </div>

            {showAlert && (
                <AlertModal
                    isOpen={showAlert}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onClose={() => setShowAlert(false)}
                />
            )}
        </div>
    );
};

export default MedicationRequestCreate;