import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiX, FiUsers, FiInfo, FiAlertTriangle, FiPackage, FiSearch, FiChevronDown, FiChevronLeft, FiChevronRight, FiCheck } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";
import classApi from "../../api/classApi";
import vaccineApi from "../../api/vaccineApi";
import AlertModal from "../../components/modal/AlertModal";

const VaccinationPlanCreate = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        sessionName: "",
        vaccineTypeId: "",
        vaccineTypeName: "",
        location: "",
        startDate: "",
        startTime: "",
        endTime: "",
        classIds: [],
        responsibleOrganizationName: "",
        posology: "",
        sideEffect: "",
        contraindication: "",
        notes: "",
        academicYear: ""
    });
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "success", title: "", message: "" });
    const [availableGrades, setAvailableGrades] = useState([]);
    const [classesLoading, setClassesLoading] = useState(false);
    const [classesError, setClassesError] = useState(null);
    const [vaccineTypes, setVaccineTypes] = useState([]);
    const [vaccineTypesLoading, setVaccineTypesLoading] = useState(false);
    const [vaccineTypesError, setVaccineTypesError] = useState(null);
    const [vaccineTypesSearch, setVaccineTypesSearch] = useState("");
    const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);
    const vaccineDropdownRef = useRef(null);
    const vaccineInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [academicYears, setAcademicYears] = useState([]);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const defaultAcademicYear = currentMonth >= 9 ? currentYear : currentYear - 1;
        const years = [];
        for (let i = defaultAcademicYear; i <= defaultAcademicYear + 5; i++) {
            years.push({ value: i, label: `${i}-${i + 1}` });
        }
        setAcademicYears(years);
        setFormData(prev => ({
            ...prev,
            academicYear: defaultAcademicYear.toString()
        }));
    }, []);

    useEffect(() => {
        if (formData.academicYear) {
            fetchClasses();
        }
    }, [formData.academicYear]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (vaccineDropdownRef.current && !vaccineDropdownRef.current.contains(event.target) &&
                vaccineInputRef.current && !vaccineInputRef.current.contains(event.target)) {
                setShowVaccineDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (vaccineTypesSearch) {
            fetchVaccineTypes();
        }
    }, [vaccineTypesSearch]);

    const fetchClasses = async () => {
        if (!formData.academicYear) return;
        setClassesLoading(true);
        setClassesError(null);
        try {
            const response = await classApi.getSchoolClass({ pageIndex: 1, pageSize: 1000, searchTerm: "", orderBy: "name", grade: "", academicYear: parseInt(formData.academicYear) });
            if (response.success) {
                setAvailableGrades(response.data || []);
            } else {
                throw new Error(response.message || "Không thể tải danh sách lớp học");
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
            setClassesError(error.message);
        } finally {
            setClassesLoading(false);
        }
    };

    const fetchVaccineTypes = async () => {
        setVaccineTypesLoading(true);
        setVaccineTypesError(null);
        try {
            const response = await vaccineApi.getVaccineTypes({ pageIndex: 1, pageSize: 1000, searchTerm: vaccineTypesSearch, orderBy: 'name' });
            if (response.success) {
                setVaccineTypes(response.data);
            } else {
                throw new Error(response.message || "Không thể tải danh sách vaccine");
            }
        } catch (error) {
            setVaccineTypesError(error.message);
        } finally {
            setVaccineTypesLoading(false);
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

    const handleVaccineSelect = (vaccine) => {
        setFormData(prev => ({
            ...prev,
            vaccineTypeId: vaccine.id,
            vaccineTypeName: vaccine.name
        }));
        setVaccineTypesSearch(vaccine.name);
        setShowVaccineDropdown(false);
        clearError('vaccineTypeId');
    };

    const handleVaccineSearchChange = (e) => {
        const value = e.target.value;
        setVaccineTypesSearch(value);
        setShowVaccineDropdown(true);
        if (!value) {
            setFormData(prev => ({
                ...prev,
                vaccineTypeId: "",
                vaccineTypeName: ""
            }));
        }
        clearError('vaccineTypeId');
    };

    const handleGradeSelection = (gradeId) => {
        setFormData(prev => ({
            ...prev,
            classIds: prev.classIds.includes(gradeId)
                ? prev.classIds.filter(id => id !== gradeId)
                : [...prev.classIds, gradeId]
        }));
    };

    const calculateTotalStudents = () => {
        return availableGrades
            .filter(grade => formData.classIds.includes(grade.id))
            .reduce((total, grade) => total + (grade.studentCount || 0), 0);
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.sessionName.trim()) {
            newErrors.sessionName = "Vui lòng nhập tên buổi tiêm chủng";
        }
        if (!formData.vaccineTypeId) {
            newErrors.vaccineTypeId = "Vui lòng chọn loại vắc-xin";
        }
        if (!formData.location.trim()) {
            newErrors.location = "Vui lòng nhập địa điểm";
        }
        if (!formData.startDate) {
            newErrors.startDate = "Vui lòng chọn ngày tiêm";
        }
        if (!formData.startTime) {
            newErrors.startTime = "Vui lòng chọn giờ bắt đầu";
        }
        if (!formData.endTime) {
            newErrors.endTime = "Vui lòng chọn giờ kết thúc";
        }
        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
            newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.responsibleOrganizationName?.trim()) {
            newErrors.responsibleOrganizationName = "Vui lòng nhập đơn vị thực hiện";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.academicYear) {
            newErrors.academicYear = "Vui lòng chọn năm học";
        }
        if (formData.classIds.length === 0) {
            newErrors.classIds = "Vui lòng chọn ít nhất một lớp học";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateAllSteps = () => {
        const newErrors = {};
        // Step 1 validation
        if (!formData.sessionName?.trim()) {
            newErrors.sessionName = "Vui lòng nhập tên buổi tiêm chủng";
        }
        if (!formData.vaccineTypeId) {
            newErrors.vaccineTypeId = "Vui lòng chọn loại vắc-xin";
        }
        if (!formData.location?.trim()) {
            newErrors.location = "Vui lòng nhập địa điểm";
        }
        if (!formData.startDate) {
            newErrors.startDate = "Vui lòng chọn ngày tiêm";
        }
        if (!formData.startTime) {
            newErrors.startTime = "Vui lòng chọn giờ bắt đầu";
        }
        if (!formData.endTime) {
            newErrors.endTime = "Vui lòng chọn giờ kết thúc";
        }
        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
            newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
        }
        // Step 2 validation
        if (!formData.responsibleOrganizationName?.trim()) {
            newErrors.responsibleOrganizationName = "Vui lòng nhập đơn vị thực hiện";
        }
        // Step 3 validation
        if (!formData.academicYear) {
            newErrors.academicYear = "Vui lòng chọn năm học";
        }
        if (formData.classIds.length === 0) {
            newErrors.classIds = "Vui lòng chọn ít nhất một lớp học";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        let isValid = false;
        if (currentStep === 1) {
            isValid = validateStep1();
        } else if (currentStep === 2) {
            isValid = validateStep2();
        } else if (currentStep === 3) {
            isValid = validateStep3();
        }
        if (isValid && currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) { setCurrentStep(prev => prev - 1) }
    };

    const handleAlertClose = () => {
        setShowAlert(false);
        if (alertConfig.type === "success") { navigate("/schoolnurse/vaccination") }
    };

    const handleCreatePlan = async () => {
        if (!validateAllSteps()) return;
        setLoading(true);
        try {
            const startTimeString = `${formData.startDate}T${formData.startTime}:00.000Z`;
            const endTimeString = `${formData.startDate}T${formData.endTime}:00.000Z`;
            const requestData = {
                vaccineTypeId: formData.vaccineTypeId,
                vaccineTypeName: formData.vaccineTypeName,
                sessionName: formData.sessionName,
                responsibleOrganizationName: formData.responsibleOrganizationName,
                location: formData.location,
                startDate: formData.startDate,
                startTime: startTimeString,
                endTime: endTimeString,
                posology: formData.posology,
                sideEffect: formData.sideEffect,
                contraindication: formData.contraindication,
                notes: formData.notes,
                classIds: formData.classIds
            };
            const response = await vaccineApi.createVaccinationSession(requestData);
            if (response.success) {
                setAlertConfig({ type: "success", title: "Thành công", message: "Đã tạo buổi tiêm chủng thành công" });
                setShowAlert(true);
            } else {
                throw new Error(response.message || "Không thể tạo buổi tiêm chủng");
            }
        } catch (error) {
            setAlertConfig({ type: "error", title: "Lỗi", message: error.message || "Đã có lỗi xảy ra khi tạo buổi tiêm chủng" });
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            default:
                return renderStep1();
        }
    };

    const renderStep1 = () => (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ borderColor: BORDER.DEFAULT }}>
            <div className="p-6 border-b flex items-center justify-between"
                style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                <div className="flex items-center">
                    <FiInfo className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                    <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                        Thông tin cơ bản
                    </h2>
                </div>
                <div className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                    Bước 1/3
                </div>
            </div>

            <div className="p-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                            Tên buổi tiêm chủng *
                        </label>
                        <input
                            type="text"
                            name="sessionName"
                            value={formData.sessionName}
                            onChange={handleInputChange}
                            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.sessionName ? 'border-red-500' : ''}`}
                            style={{ borderColor: errors.sessionName ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            placeholder="Ví dụ: Tiêm vắc-xin cúm mùa 2024"
                            required
                        />
                        {errors.sessionName && (
                            <p className="mt-2 text-sm text-red-500">{errors.sessionName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                            Loại vắc-xin *
                        </label>
                        <div className="relative" ref={vaccineDropdownRef}>
                            <div className="relative">
                                <input
                                    ref={vaccineInputRef}
                                    type="text"
                                    value={vaccineTypesSearch}
                                    onChange={handleVaccineSearchChange}
                                    onFocus={() => setShowVaccineDropdown(true)}
                                    placeholder="Tìm và chọn loại vắc-xin..."
                                    className={`w-full p-4 pr-20 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.vaccineTypeId ? 'border-red-500' : ''}`}
                                    style={{
                                        borderColor: errors.vaccineTypeId ? '#ef4444' : (formData.vaccineTypeId ? PRIMARY[500] : BORDER.DEFAULT),
                                        backgroundColor: formData.vaccineTypeId ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                        color: TEXT.PRIMARY,
                                    }}
                                    required
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                    {formData.vaccineTypeId && (
                                        <div className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                            style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                            Đã chọn
                                        </div>
                                    )}
                                    {vaccineTypesLoading ? (
                                        <Loading type="spinner" size="small" color="primary" />
                                    ) : (
                                        <FiChevronDown
                                            className={`h-5 w-5 transition-transform duration-200 flex-shrink-0 ${showVaccineDropdown ? 'rotate-180' : ''}`}
                                            style={{ color: formData.vaccineTypeId ? PRIMARY[500] : GRAY[400] }}
                                        />
                                    )}
                                </div>
                            </div>

                            {showVaccineDropdown && (
                                <div
                                    className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg overflow-hidden"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }}
                                >
                                    {vaccineTypesError ? (
                                        <div className="p-4 text-center" style={{ color: ERROR[500] }}>
                                            <FiAlertTriangle className="h-6 w-6 mx-auto mb-2" />
                                            {vaccineTypesError}
                                        </div>
                                    ) : vaccineTypes.length === 0 ? (
                                        <div className="p-4 text-center" style={{ color: TEXT.SECONDARY }}>
                                            <FiSearch className="h-6 w-6 mx-auto mb-2" />
                                            {vaccineTypesSearch ? 'Không tìm thấy kết quả' : 'Nhập để tìm kiếm'}
                                        </div>
                                    ) : (
                                        <div>
                                            {vaccineTypes.map((vaccine, index) => (
                                                <div
                                                    key={vaccine.id}
                                                    onClick={() => handleVaccineSelect(vaccine)}
                                                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b last:border-b-0"
                                                    style={{ borderColor: BORDER.LIGHT }}
                                                >
                                                    <div className="flex items-start">
                                                        <div className="flex-grow min-w-0">
                                                            <div className="font-medium text-base truncate" style={{ color: TEXT.PRIMARY }}>
                                                                {vaccine.name}
                                                            </div>
                                                            {vaccine.description && (
                                                                <div className="text-sm mt-1 line-clamp-2" style={{ color: TEXT.SECONDARY }}>
                                                                    {vaccine.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {formData.vaccineTypeId === vaccine.id && (
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
                        {errors.vaccineTypeId && (
                            <p className="mt-2 text-sm text-red-500">{errors.vaccineTypeId}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                            Địa điểm *
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.location ? 'border-red-500' : ''}`}
                            style={{ borderColor: errors.location ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            placeholder="Ví dụ: Phòng y tế trường"
                            required
                        />
                        {errors.location && (
                            <p className="mt-2 text-sm text-red-500">{errors.location}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                Ngày tiêm *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.startDate ? 'border-red-500' : ''}`}
                                style={{ borderColor: errors.startDate ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                required
                            />
                            {errors.startDate && (
                                <p className="mt-2 text-sm text-red-500">{errors.startDate}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                Giờ bắt đầu *
                            </label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.startTime ? 'border-red-500' : ''}`}
                                style={{ borderColor: errors.startTime ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                required
                            />
                            {errors.startTime && (
                                <p className="mt-2 text-sm text-red-500">{errors.startTime}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                                Giờ kết thúc *
                            </label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.endTime ? 'border-red-500' : ''}`}
                                style={{ borderColor: errors.endTime ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                required
                            />
                            {errors.endTime && (
                                <p className="mt-2 text-sm text-red-500">{errors.endTime}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ borderColor: BORDER.DEFAULT }}>
            <div className="p-6 border-b flex items-center justify-between"
                style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                <div className="flex items-center">
                    <FiPackage className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                    <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                        Thông tin chi tiết
                    </h2>
                </div>
                <div className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                    Bước 2/3
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-base font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                            Đơn vị thực hiện *
                        </label>
                        <input
                            type="text"
                            name="responsibleOrganizationName"
                            value={formData.responsibleOrganizationName}
                            onChange={handleInputChange}
                            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.responsibleOrganizationName ? 'border-red-500' : ''}`}
                            style={{ borderColor: errors.responsibleOrganizationName ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            placeholder="Tên đơn vị thực hiện tiêm chủng"
                            required
                        />
                        {errors.responsibleOrganizationName && (
                            <p className="mt-2 text-sm text-red-500">{errors.responsibleOrganizationName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                            Liều lượng
                        </label>
                        <input
                            type="text"
                            name="posology"
                            value={formData.posology}
                            onChange={handleInputChange}
                            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            placeholder="Ví dụ: 0.5ml, tiêm bắp"
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                            Tác dụng phụ có thể xảy ra
                        </label>
                        <div className="relative">
                            <FiAlertTriangle className="absolute left-4 top-4 h-5 w-5" style={{ color: WARNING[400] }} />
                            <textarea
                                name="sideEffect"
                                value={formData.sideEffect}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full pl-12 pr-4 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                placeholder="Mô tả các tác dụng phụ có thể xảy ra..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                            Chống chỉ định
                        </label>
                        <textarea
                            name="contraindication"
                            value={formData.contraindication}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            placeholder="Các trường hợp không nên tiêm..."
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                            Ghi chú
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            placeholder="Ghi chú thêm về buổi tiêm chủng..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ borderColor: BORDER.DEFAULT }}>
            <div className="p-6 border-b flex items-center justify-between"
                style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[50] }}>
                <div className="flex items-center">
                    <FiUsers className="h-6 w-6 mr-3" style={{ color: PRIMARY[500] }} />
                    <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                        Chọn lớp học
                    </h2>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                        {calculateTotalStudents()} học sinh được chọn
                    </div>
                    <div className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                        Bước 3/3
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-6">
                    <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                        Năm học *
                    </label>
                    <select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleInputChange}
                        className="w-full md:w-64 p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                        required
                    >
                        <option value="">Chọn năm học</option>
                        {academicYears.map((year) => (
                            <option key={year.value} value={year.value}>
                                {year.label}
                            </option>
                        ))}
                    </select>
                </div>

                {formData.academicYear && (
                    <>
                        {classesLoading ? (
                            <div className="flex justify-center py-8">
                                <Loading type="spinner" size="medium" color="primary" />
                            </div>
                        ) : classesError ? (
                            <div className="text-center py-8" style={{ color: ERROR[500] }}>
                                <FiAlertTriangle className="h-8 w-8 mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">Không thể tải danh sách lớp học</p>
                                <p className="text-sm">{classesError}</p>
                                <button
                                    onClick={fetchClasses}
                                    className="mt-4 px-4 py-2 rounded-lg border"
                                    style={{ borderColor: PRIMARY[500], color: PRIMARY[500] }}
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : availableGrades.length === 0 ? (
                            <div className="text-center py-8" style={{ color: TEXT.SECONDARY }}>
                                <FiUsers className="h-8 w-8 mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">Không có lớp học nào</p>
                                <p className="text-sm">Năm học này chưa có lớp học được tạo</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Danh sách lớp học năm {academicYears.find(y => y.value.toString() === formData.academicYear)?.label}
                                    </h3>
                                    <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                        {availableGrades.length} lớp học
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {availableGrades.map((grade) => (
                                        <div
                                            key={grade.id}
                                            onClick={() => handleGradeSelection(grade.id)}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${formData.classIds.includes(grade.id) ? "shadow-sm" : ""}`}
                                            style={{
                                                borderColor: formData.classIds.includes(grade.id) ? PRIMARY[500] : BORDER.DEFAULT,
                                                backgroundColor: formData.classIds.includes(grade.id) ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                            }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.classIds.includes(grade.id)}
                                                    onChange={() => handleGradeSelection(grade.id)}
                                                    className="h-5 w-5"
                                                    style={{ accentColor: PRIMARY[500] }}
                                                />
                                                <div>
                                                    <p className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {grade.name}
                                                    </p>
                                                    <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        {grade.studentCount || 0} học sinh
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: PRIMARY[700] }}>
                        Tạo kế hoạch tiêm chủng mới
                    </h1>
                    <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                        Điền đầy đủ thông tin để tạo một buổi tiêm chủng mới cho học sinh
                    </p>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-8">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-200 ${step <= currentStep
                                        ? 'text-white'
                                        : 'text-gray-400'
                                        }`}
                                    style={{
                                        backgroundColor: step <= currentStep ? PRIMARY[500] : GRAY[200]
                                    }}
                                >
                                    {step}
                                </div>
                                {step < 3 && (
                                    <div
                                        className="w-16 h-1 mx-4 transition-all duration-200"
                                        style={{ backgroundColor: step < currentStep ? PRIMARY[500] : GRAY[200] }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-4 space-x-16">
                        <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                            Thông tin cơ bản
                        </span>
                        <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                            Thông tin chi tiết
                        </span>
                        <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                            Chọn lớp học
                        </span>
                    </div>
                </div>

                <div className="space-y-8">
                    {renderStepContent()}

                    <div className="flex justify-end items-center sticky bottom-0 bg-white p-6 border-t rounded-b-xl shadow-md"
                        style={{ borderColor: BORDER.DEFAULT }}>
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

                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="px-6 py-3 rounded-lg border font-medium transition-all duration-200 flex items-center"
                                    style={{ borderColor: PRIMARY[500], color: PRIMARY[500], backgroundColor: 'white' }}
                                    disabled={loading}
                                >
                                    <FiChevronLeft className="mr-2 h-5 w-5" />
                                    Quay lại
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
                                    style={{ backgroundColor: PRIMARY[500], color: 'white', boxShadow: `0 1px 2px 0 ${PRIMARY[500]}40` }}
                                    disabled={loading}
                                >
                                    Tiếp theo<FiChevronRight className="ml-2 h-5 w-5" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleCreatePlan}
                                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
                                    style={{ backgroundColor: loading ? GRAY[400] : PRIMARY[500], color: 'white', boxShadow: `0 1px 2px 0 ${PRIMARY[500]}40` }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loading type="spinner" size="small" color="white" className="mr-2" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="mr-2 h-5 w-5" />Tạo kế hoạch
                                        </>
                                    )}
                                </button>
                            )}
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

export default VaccinationPlanCreate;