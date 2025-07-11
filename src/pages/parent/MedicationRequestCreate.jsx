import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR, SUCCESS } from '../../constants/colors';
import { FiSave, FiX, FiUser, FiTablet, FiAlertTriangle, FiCheck, FiChevronDown, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Loading from '../../components/Loading';
import AlertModal from '../../components/modal/AlertModal';
import vaccinationScheduleApi from '../../api/VaccinationScheduleApi';
import { useAuth } from '../../utils/AuthContext';

const TIMES_OF_DAY = [
    { value: 'Morning', label: 'Buổi sáng' },
    { value: 'Noon', label: 'Buổi trưa' },
    { value: 'Afternoon', label: 'Buổi chiều' },
    { value: 'Evening', label: 'Buổi tối' },
];

const MedicationRequestCreate = () => {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "success", title: "", message: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [remainingTimes, setRemainingTimes] = useState({});
    const { user } = useAuth();

    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const studentDropdownRef = useRef(null);
    const studentInputRef = useRef(null);
    const [formData, setFormData] = useState({
        studentId: '',
        medications: [{
            medicationName: '',
            dosage: '',
            instructions: '',
            frequency: '',
            expiryDate: '',
            quantitySent: '',
            specialNotes: '',
            timesOfDay: []
        }]
    });

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

    useEffect(() => {
        const medication = formData.medications[currentStep];
        const frequencyCount = parseInt(medication.frequency) || 0;
        const totalSelectedTimes = medication.timesOfDay.length;
        setRemainingTimes({
            ...remainingTimes,
            [currentStep]: Math.max(0, frequencyCount - totalSelectedTimes)
        });
    }, [formData.medications, currentStep]);

    const fetchStudents = async () => {
        setStudentsLoading(true);
        setStudentsError(null);
        try {
            const response = await vaccinationScheduleApi.getParentStudents(user.id, { pageIndex: 1, pageSize: 100, searchTerm: studentSearch, orderBy: 'name' });
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
        setFormData(prev => ({
            ...prev,
            studentId: student.id
        }));
        setStudentSearch(`${student.fullName}-Lớp ${student.currentClassName}`);
        setShowStudentDropdown(false);
        clearError('studentId');
    };

    const handleStudentSearchChange = (e) => {
        const value = e.target.value;
        setStudentSearch(value);
        setShowStudentDropdown(true);
        if (!value) {
            setFormData(prev => ({ ...prev, studentId: '' }));
        }
        clearError('studentId');
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

    const validateCurrentMedication = (medication) => {
        if (!medication) return false;
        return (
            medication.medicationName.trim() !== '' &&
            medication.dosage > 0 &&
            medication.frequency > 0 &&
            medication.expiryDate !== '' &&
            medication.instructions !== '' &&
            medication.quantitySent > 0 &&
            medication.timesOfDay.length > 0
        );
    };

    const handleAddMedication = () => {
        const currentMedication = formData.medications[currentStep];
        if (!validateCurrentMedication(currentMedication)) {
            setAlertConfig({ type: "error", title: "Lỗi", message: "Vui lòng điền đầy đủ thông tin thuốc hiện tại trước khi thêm thuốc mới" });
            setShowAlert(true);
            return;
        }
        setFormData(prev => ({
            ...prev,
            medications: [
                ...prev.medications,
                {
                    medicationName: '',
                    dosage: '',
                    instructions: '',
                    frequency: '',
                    expiryDate: '',
                    quantitySent: '',
                    specialNotes: '',
                    timesOfDay: []
                }
            ]
        }));
        setCurrentStep(formData.medications.length);
    };

    const handleMedicationChange = (index, field, value) => {
        const newMedications = [...formData.medications];
        newMedications[index] = {
            ...newMedications[index],
            [field]: value
        };
        // Reset thời điểm uống nếu thay đổi tần suất
        if (field === 'frequency') {
            const frequencyCount = parseInt(value) || 0;
            const totalCurrentTimes = newMedications[index].timesOfDay.length;
            if (frequencyCount > 0 && totalCurrentTimes > frequencyCount) {
                newMedications[index].timesOfDay = [];
            }
        }
        setFormData({
            ...formData,
            medications: newMedications
        });
        if (errors[`medications.${index}.${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`medications.${index}.${field}`];
            setErrors(newErrors);
        }
    };

    const handleTimeOfDayChange = (index, timeValue) => {
        const medication = formData.medications[index];
        const frequencyCount = parseInt(medication.frequency) || 0;
        const isSelected = medication.timesOfDay.includes(timeValue);
        if (!isSelected && medication.timesOfDay.length >= frequencyCount) {
            setErrors(prev => ({
                ...prev,
                [`medications.${index}.timesOfDay`]: `Bạn chỉ được chọn tối đa ${frequencyCount} thời điểm uống thuốc theo tần suất đã nhập`
            }));
            return;
        }
        const newMedications = [...formData.medications];
        newMedications[index] = {
            ...newMedications[index],
            timesOfDay: isSelected
                ? newMedications[index].timesOfDay.filter(time => time !== timeValue)
                : [...newMedications[index].timesOfDay, timeValue]
        };
        setFormData({
            ...formData,
            medications: newMedications
        });
        if (errors[`medications.${index}.timesOfDay`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`medications.${index}.timesOfDay`];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.studentId) {
            newErrors.studentId = 'Vui lòng chọn học sinh';
        }
        formData.medications.forEach((medication, index) => {
            if (!medication.medicationName.trim()) {
                newErrors[`medications.${index}.medicationName`] = 'Vui lòng nhập tên thuốc';
            }
            if (medication.dosage <= 0) {
                newErrors[`medications.${index}.dosage`] = 'Vui lòng nhập liều lượng lớn hơn 0';
            }
            if (medication.frequency <= 0) {
                newErrors[`medications.${index}.frequency`] = 'Vui lòng nhập tần suất sử dụng lớn hơn 0';
            }
            if (!medication.expiryDate) {
                newErrors[`medications.${index}.expiryDate`] = 'Vui lòng chọn ngày hết hạn';
            }
            if (!medication.instructions.trim()) {
                newErrors[`medications.${index}.instructions`] = 'Vui lòng nhập hướng dẫn sử dụng';
            }
            if (!medication.quantitySent || medication.quantitySent < 1) {
                newErrors[`medications.${index}.quantitySent`] = 'Số lượng phải lớn hơn 0';
            }
            if (medication.dosage * medication.frequency > medication.quantitySent) {
                newErrors[`medications.${index}.quantitySent`] = 'Số lượng phải lớn hơn tổng liều lượng';
            }
            if (medication.timesOfDay.length === 0) {
                newErrors[`medications.${index}.times`] = 'Vui lòng chọn ít nhất một thời điểm uống thuốc';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAlertClose = () => {
        setShowAlert(false);
        if (alertConfig.type === "success") {
            navigate("/parent/medication/history");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)
        if (!validate()) return;
        setAlertConfig({ type: "success", title: "Thành công", message: "Yêu cầu cấp phát thuốc đã được gửi thành công" });
        setShowAlert(true);
    };

    const handleStepChange = (step) => {
        if (step >= 0 && step < formData.medications.length) {
            setCurrentStep(step);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <section className="py-12 sm:py-16 relative overflow-hidden" style={{ backgroundColor: PRIMARY[500] }}>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center text-white max-w-5xl mx-auto">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4">
                            Tạo yêu cầu cấp phát thuốc
                        </h1>
                        <p className="text-base sm:text-lg opacity-90 leading-relaxed font-medium px-4">
                            Điền đầy đủ thông tin để gửi yêu cầu cấp phát thuốc cho học sinh
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="bg-white rounded-2xl border-2 shadow-sm" style={{ borderColor: GRAY[200] }}>
                        <div className="p-6 border-b" style={{ borderColor: GRAY[200], backgroundColor: PRIMARY[50] }}>
                            <div className="flex items-center">
                                <FiUser className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                                <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                    Chọn học sinh
                                </h2>
                            </div>
                        </div>

                        <div className="p-6">
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
                                        className={`w-full pl-12 pr-20 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.studentId ? 'border-red-500' : ''}`}
                                        style={{
                                            borderColor: errors.studentId ? '#ef4444' : (formData.studentId ? PRIMARY[500] : BORDER.DEFAULT),
                                            backgroundColor: formData.studentId ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                            color: TEXT.PRIMARY
                                        }}
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                        {formData.studentId && (
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
                                                style={{ color: formData.studentId ? PRIMARY[500] : GRAY[400] }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {showStudentDropdown && (
                                    <div className="absolute left-0 right-0 z-[9999] mt-2 w-full">
                                        <div className="bg-white border rounded-lg shadow-xl overflow-hidden"
                                            style={{ borderColor: BORDER.DEFAULT, maxHeight: '288px' }}>
                                            <div className="overflow-y-auto" style={{ maxHeight: '288px' }}>
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
                                                                <div>
                                                                    <div className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                                                        {student.fullName}
                                                                    </div>
                                                                    <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                        {student.studentCode} - Lớp {student.currentClassName}
                                                                    </div>
                                                                </div>
                                                                {formData.studentId === student.id && (
                                                                    <FiCheck className="h-5 w-5" style={{ color: PRIMARY[500] }} />
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
                                <p className="mt-2 text-sm text-red-500">{errors.studentId}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4 overflow-x-auto">
                        {formData.medications.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleStepChange(index)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all duration-200 flex-shrink-0 ${currentStep === index
                                    ? 'text-white shadow-lg'
                                    : index < currentStep
                                        ? 'text-white bg-green-500'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                style={{
                                    backgroundColor: currentStep === index ? PRIMARY[500] : index < currentStep
                                        ? SUCCESS[500]
                                        : 'white',
                                    border: `2px solid ${currentStep === index ? PRIMARY[500] : index < currentStep
                                        ? SUCCESS[500]
                                        : BORDER.DEFAULT
                                        }`
                                }}
                            >
                                {index < currentStep ? (
                                    <FiCheck className="h-5 w-5" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border-2 overflow-hidden shadow-sm" style={{ borderColor: GRAY[200] }}  >
                        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: GRAY[200], backgroundColor: PRIMARY[50] }}>
                            <div className="flex items-center">
                                <FiTablet className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                                <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                                    Thuốc #{currentStep + 1}
                                </h2>
                            </div>
                            {formData.medications.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveMedication(currentStep)}
                                    className="p-2 rounded-lg transition-all duration-200 hover:bg-red-50"
                                    style={{ color: ERROR[500] }}
                                >
                                    <FiTrash2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Tên thuốc *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.medications[currentStep].medicationName}
                                        onChange={(e) => handleMedicationChange(currentStep, 'medicationName', e.target.value)}
                                        placeholder="Nhập tên thuốc..."
                                        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors[`medications.${currentStep}.medicationName`] ? 'border-red-500' : ''}`}
                                        style={{ borderColor: errors[`medications.${currentStep}.medicationName`] ? '#ef4444' : BORDER.DEFAULT }}
                                        required
                                    />
                                    {errors[`medications.${currentStep}.medicationName`] && (
                                        <p className="mt-2 text-sm text-red-500">{errors[`medications.${currentStep}.medicationName`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Số lượng *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.medications[currentStep].quantitySent}
                                        onChange={(e) => handleMedicationChange(currentStep, 'quantitySent', parseInt(e.target.value))}
                                        min="1"
                                        placeholder="Nhập số lượng"
                                        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors[`medications.${currentStep}.quantitySent`] ? 'border-red-500' : ''}`}
                                        style={{ borderColor: errors[`medications.${currentStep}.quantitySent`] ? '#ef4444' : BORDER.DEFAULT }}
                                        required
                                    />
                                    {errors[`medications.${currentStep}.quantitySent`] && (
                                        <p className="mt-2 text-sm text-red-500">{errors[`medications.${currentStep}.quantitySent`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Tần suất sử dụng *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.medications[currentStep].frequency}
                                        onChange={(e) => handleMedicationChange(currentStep, 'frequency', e.target.value)}
                                        placeholder="Nhập số lần uống/ngày"
                                        min="1"
                                        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors[`medications.${currentStep}.frequency`] ? 'border-red-500' : ''}`}
                                        style={{ borderColor: errors[`medications.${currentStep}.frequency`] ? '#ef4444' : BORDER.DEFAULT }}
                                        required
                                    />
                                    {errors[`medications.${currentStep}.frequency`] && (
                                        <p className="mt-2 text-sm text-red-500">{errors[`medications.${currentStep}.frequency`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Liều lượng *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.medications[currentStep].dosage}
                                        onChange={(e) => handleMedicationChange(currentStep, 'dosage', e.target.value)}
                                        placeholder="Ví dụ: 1 viên/lần"
                                        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors[`medications.${currentStep}.dosage`] ? 'border-red-500' : ''}`}
                                        style={{ borderColor: errors[`medications.${currentStep}.dosage`] ? '#ef4444' : BORDER.DEFAULT }}
                                        required
                                    />
                                    {errors[`medications.${currentStep}.dosage`] && (
                                        <p className="mt-2 text-sm text-red-500">{errors[`medications.${currentStep}.dosage`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Ngày hết hạn *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.medications[currentStep].expiryDate.split('T')[0]}
                                        onChange={(e) => handleMedicationChange(currentStep, 'expiryDate', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors[`medications.${currentStep}.expiryDate`] ? 'border-red-500' : ''}`}
                                        style={{ borderColor: errors[`medications.${currentStep}.expiryDate`] ? '#ef4444' : BORDER.DEFAULT }}
                                        required
                                    />
                                    {errors[`medications.${currentStep}.expiryDate`] && (
                                        <p className="mt-2 text-sm text-red-500">{errors[`medications.${currentStep}.expiryDate`]}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Thời điểm uống thuốc *
                                    </label>
                                    {parseInt(formData.medications[currentStep].frequency) > 0 && (
                                        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: PRIMARY[50] }}>
                                            <p className="text-sm font-medium" style={{ color: PRIMARY[700] }}>
                                                {remainingTimes[currentStep] > 0
                                                    ? `Bạn còn có thể chọn ${remainingTimes[currentStep]} thời điểm uống thuốc`
                                                    : 'Bạn đã chọn đủ số lần uống thuốc theo tần suất'}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-4 gap-4">
                                        {TIMES_OF_DAY.map(time => {
                                            const isSelected = formData.medications[currentStep].timesOfDay.includes(time.value);
                                            const isDisabled = !isSelected && remainingTimes[currentStep] === 0;
                                            return (
                                                <label
                                                    key={time.value}
                                                    className={`flex items-center space-x-2 p-3 border rounded-lg transition-all duration-200 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    style={{ borderColor: isSelected ? PRIMARY[500] : BORDER.DEFAULT, backgroundColor: isSelected ? PRIMARY[50] : 'white' }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleTimeOfDayChange(currentStep, time.value)}
                                                        className="h-4 w-4"
                                                        style={{ accentColor: PRIMARY[500] }}
                                                        disabled={isDisabled}
                                                    />
                                                    <span style={{ color: TEXT.PRIMARY }}>{time.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {errors[`medications.${currentStep}.times`] && (
                                        <p className="mt-2 text-sm text-red-500">{errors[`medications.${currentStep}.times`]}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2 mt-6">
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Hướng dẫn sử dụng *
                                    </label>
                                    <textarea
                                        value={formData.medications[currentStep].instructions}
                                        onChange={(e) => handleMedicationChange(currentStep, 'instructions', e.target.value)}
                                        rows={3}
                                        placeholder="Nhập hướng dẫn sử dụng thuốc..."
                                        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors[`medications.${currentStep}.instructions`] ? 'border-red-500' : ''}`}
                                        style={{ borderColor: errors[`medications.${currentStep}.instructions`] ? '#ef4444' : BORDER.DEFAULT }}
                                        required
                                    />
                                    {errors[`medications.${currentStep}.instructions`] && (
                                        <p className="mt-2 text-sm text-red-500">{errors[`medications.${currentStep}.instructions`]}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2 mt-6">
                                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                        Ghi chú đặc biệt
                                    </label>
                                    <textarea
                                        value={formData.medications[currentStep].specialNotes}
                                        onChange={(e) => handleMedicationChange(currentStep, 'specialNotes', e.target.value)}
                                        rows={3}
                                        placeholder="Nhập các ghi chú đặc biệt về thuốc (nếu có)..."
                                        className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{ borderColor: BORDER.DEFAULT }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-lg py-4"
                style={{ borderColor: GRAY[200] }}
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={() => handleStepChange(currentStep - 1)}
                                    className={`px-6 py-3 rounded-lg border font-medium transition-all duration-200 flex items-center ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    style={{ borderColor: BORDER.DEFAULT, color: TEXT.PRIMARY }}
                                    disabled={currentStep === 0}
                                >
                                    <FiChevronLeft className="mr-2 h-5 w-5" />
                                    Thuốc trước
                                </button>

                                {currentStep < formData.medications.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleStepChange(currentStep + 1)}
                                        className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
                                        style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                                    >
                                        Thuốc tiếp
                                        <FiChevronRight className="ml-2 h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={handleAddMedication}
                                    className={`px-6 py-3 rounded-lg border font-medium transition-all duration-200 flex items-center ${!validateCurrentMedication(formData.medications[currentStep])
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-primary-50'}`}
                                    style={{ borderColor: PRIMARY[500], color: PRIMARY[500] }}
                                    disabled={!validateCurrentMedication(formData.medications[currentStep])}
                                >
                                    <FiPlus className="mr-2 h-5 w-5" />
                                    Thêm thuốc
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/parent/medication-requests')}
                                    className="px-6 py-3 rounded-lg border font-medium transition-all duration-200 flex items-center"
                                    style={{ borderColor: BORDER.DEFAULT, color: TEXT.PRIMARY }}
                                    disabled={loading}
                                >
                                    <FiX className="mr-2 h-5 w-5" />
                                    Hủy
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
                                    style={{ backgroundColor: loading ? GRAY[400] : PRIMARY[500], color: 'white' }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loading type="spinner" size="small" color="white" className="mr-2" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2 h-5 w-5" /> Gửi yêu cầu
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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

export default MedicationRequestCreate;