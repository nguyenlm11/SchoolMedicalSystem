import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiX, FiUsers, FiInfo, FiAlertTriangle, FiPackage, FiChevronLeft, FiChevronRight, FiClipboard } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from "../../constants/colors";
import Loading from "../../components/Loading";
import classApi from "../../api/classApi";
import healthCheckApi from "../../api/healthCheckApi";
import AlertModal from "../../components/modal/AlertModal";

const HealthCheckPlanCreate = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        scheduledDate: "",
        startTime: "",
        endTime: "",
        responsibleOrganizationName: "",
        notes: "",
        healthCheckItemIds: [],
        classIds: []
    });
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "success", title: "", message: "" });
    const [availableClasses, setAvailableClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(false);
    const [classesError, setClassesError] = useState(null);
    const [healthCheckItems, setHealthCheckItems] = useState([]);
    const [healthCheckItemsLoading, setHealthCheckItemsLoading] = useState(false);
    const [healthCheckItemsError, setHealthCheckItemsError] = useState(null);
    const [healthCheckItemsSearch, setHealthCheckItemsSearch] = useState("");
    const [errors, setErrors] = useState({});
    const [academicYears, setAcademicYears] = useState([]);
    const [academicYear, setAcademicYear] = useState("");

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const defaultAcademicYear = currentMonth >= 9 ? currentYear : currentYear - 1;
        const years = [];
        for (let i = defaultAcademicYear; i <= defaultAcademicYear + 5; i++) {
            years.push({ value: i, label: `${i}-${i + 1}` });
        }
        setAcademicYears(years);
        setAcademicYear(defaultAcademicYear.toString());
    }, []);

    useEffect(() => {
        if (academicYear) {
            fetchClasses();
        }
    }, [academicYear]);

    useEffect(() => {
        fetchHealthCheckItems();
    }, [healthCheckItemsSearch]);

    const fetchClasses = async () => {
        if (!academicYear) return;
        setClassesLoading(true);
        setClassesError(null);
        try {
            const response = await classApi.getSchoolClass({ pageIndex: 1, pageSize: 1000, searchTerm: "", orderBy: "name", grade: "", academicYear: parseInt(academicYear) });
            if (response.success) {
                setAvailableClasses(response.data || []);
            } else {
                throw new Error(response.message || "Không thể tải danh sách lớp học");
            }
        } catch (error) {
            setClassesError(error.message);
        } finally {
            setClassesLoading(false);
        }
    };

    const fetchHealthCheckItems = async () => {
        setHealthCheckItemsLoading(true);
        setHealthCheckItemsError(null);
        try {
            const response = await healthCheckApi.getHealthCheckItems({ pageIndex: 1, pageSize: 1000, searchTerm: healthCheckItemsSearch, orderBy: 'name' });
            if (response.success) {
                setHealthCheckItems(response.data);
            } else {
                throw new Error(response.message || "Không thể tải danh sách hạng mục kiểm tra");
            }
        } catch (error) {
            setHealthCheckItemsError(error.message);
        } finally {
            setHealthCheckItemsLoading(false);
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

    const handleHealthCheckItemSelect = (item) => {
        setFormData(prev => ({
            ...prev,
            healthCheckItemIds: prev.healthCheckItemIds.includes(item.id)
                ? prev.healthCheckItemIds.filter(id => id !== item.id)
                : [...prev.healthCheckItemIds, item.id]
        }));
        clearError('healthCheckItemIds');
    };

    const handleClassSelection = (classId) => {
        setFormData(prev => ({
            ...prev,
            classIds: prev.classIds.includes(classId)
                ? prev.classIds.filter(id => id !== classId)
                : [...prev.classIds, classId]
        }));
        clearError('classIds');
    };

    const calculateTotalStudents = () => {
        return availableClasses.filter(cls => formData.classIds.includes(cls.id)).reduce((total, cls) => total + (cls.studentCount || 0), 0);
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = "Vui lòng nhập tiêu đề kế hoạch";
        }
        if (!formData.location.trim()) {
            newErrors.location = "Vui lòng nhập địa điểm";
        }
        if (!formData.scheduledDate) {
            newErrors.scheduledDate = "Vui lòng chọn ngày kiểm tra";
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
        if (formData.healthCheckItemIds.length === 0) {
            newErrors.healthCheckItemIds = "Vui lòng chọn ít nhất một hạng mục kiểm tra";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!academicYear) {
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
        if (!formData.title?.trim()) {
            newErrors.title = "Vui lòng nhập tiêu đề kế hoạch";
        }
        if (!formData.location?.trim()) {
            newErrors.location = "Vui lòng nhập địa điểm";
        }
        if (!formData.scheduledDate) {
            newErrors.scheduledDate = "Vui lòng chọn ngày kiểm tra";
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
        if (formData.healthCheckItemIds.length === 0) {
            newErrors.healthCheckItemIds = "Vui lòng chọn ít nhất một hạng mục kiểm tra";
        }
        // Step 3 validation
        if (!academicYear) {
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
        if (alertConfig.type === "success") { navigate("/schoolnurse/health-check") }
    };

    const handleCreatePlan = async () => {
        if (!validateAllSteps()) return;
        setLoading(true);
        try {
            const startTimeString = `${formData.scheduledDate}T${formData.startTime}:00.000Z`;
            const endTimeString = `${formData.scheduledDate}T${formData.endTime}:00.000Z`;
            const requestData = {
                healthCheckItemIds: formData.healthCheckItemIds,
                title: formData.title,
                description: formData.description,
                responsibleOrganizationName: formData.responsibleOrganizationName,
                location: formData.location,
                scheduledDate: formData.scheduledDate,
                startTime: startTimeString,
                endTime: endTimeString,
                notes: formData.notes,
                classIds: formData.classIds
            };
            const response = await healthCheckApi.createHealthCheckPlan(requestData);
            if (response.success) {
                setAlertConfig({ type: "success", title: "Thành công", message: "Đã tạo kế hoạch kiểm tra sức khỏe thành công" });
                setShowAlert(true);
            } else {
                throw new Error(response.message || "Không thể tạo kế hoạch kiểm tra sức khỏe");
            }
        } catch (error) {
            setAlertConfig({ type: "error", title: "Lỗi", message: error.message || "Đã có lỗi xảy ra khi tạo kế hoạch kiểm tra sức khỏe" });
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
                            Tiêu đề kế hoạch *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.title ? 'border-red-500' : ''}`}
                            style={{ borderColor: errors.title ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            placeholder="Ví dụ: Khám sức khỏe định kỳ năm 2024"
                            required
                        />
                        {errors.title && (
                            <p className="mt-2 text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-3" style={{ color: TEXT.PRIMARY }}>
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            placeholder="Mô tả chi tiết về kế hoạch kiểm tra sức khỏe..."
                        />
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
                                Ngày kiểm tra *
                            </label>
                            <input
                                type="date"
                                name="scheduledDate"
                                value={formData.scheduledDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base ${errors.scheduledDate ? 'border-red-500' : ''}`}
                                style={{ borderColor: errors.scheduledDate ? '#ef4444' : BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                required
                            />
                            {errors.scheduledDate && (
                                <p className="mt-2 text-sm text-red-500">{errors.scheduledDate}</p>
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
                            placeholder="Tên đơn vị thực hiện kiểm tra sức khỏe"
                            required
                        />
                        {errors.responsibleOrganizationName && (
                            <p className="mt-2 text-sm text-red-500">{errors.responsibleOrganizationName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                            Ghi chú
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            placeholder="Ghi chú thêm về kế hoạch kiểm tra sức khỏe..."
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                            Chọn hạng mục kiểm tra sức khỏe *
                        </label>
                        <div className="mb-2 text-sm" style={{ color: TEXT.SECONDARY }}>
                            Đã chọn {formData.healthCheckItemIds.length} / {healthCheckItems.length} hạng mục
                        </div>
                        {healthCheckItemsLoading ? (
                            <div className="flex justify-center py-8">
                                <Loading type="spinner" size="medium" color="primary" />
                            </div>
                        ) : healthCheckItemsError ? (
                            <div className="text-center py-8" style={{ color: ERROR[500] }}>
                                <FiAlertTriangle className="h-8 w-8 mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">Không thể tải danh sách hạng mục kiểm tra</p>
                                <p className="text-sm">{healthCheckItemsError}</p>
                                <button
                                    onClick={fetchHealthCheckItems}
                                    className="mt-4 px-4 py-2 rounded-lg border"
                                    style={{ borderColor: PRIMARY[500], color: PRIMARY[500] }}
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : healthCheckItems.length === 0 ? (
                            <div className="text-center py-8" style={{ color: TEXT.SECONDARY }}>
                                <FiClipboard className="h-8 w-8 mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">Không có hạng mục kiểm tra nào</p>
                                <p className="text-sm">Vui lòng thêm hạng mục kiểm tra trước</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {healthCheckItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleHealthCheckItemSelect(item)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${formData.healthCheckItemIds.includes(item.id) ? "shadow-sm" : ""}`}
                                        style={{
                                            borderColor: formData.healthCheckItemIds.includes(item.id) ? PRIMARY[500] : BORDER.DEFAULT,
                                            backgroundColor: formData.healthCheckItemIds.includes(item.id) ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                        }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={formData.healthCheckItemIds.includes(item.id)}
                                                onChange={() => handleHealthCheckItemSelect(item)}
                                                className="h-5 w-5"
                                                style={{ accentColor: PRIMARY[500] }}
                                                onClick={e => e.stopPropagation()}
                                            />
                                            <div>
                                                <p className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {item.name}
                                                </p>
                                                {item.description && (
                                                    <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.healthCheckItemIds && (
                            <p className="mt-2 text-sm text-red-500">{errors.healthCheckItemIds}</p>
                        )}
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
                        value={academicYear}
                        onChange={e => setAcademicYear(e.target.value)}
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
                    {errors.academicYear && (
                        <p className="mt-2 text-sm text-red-500">{errors.academicYear}</p>
                    )}
                </div>

                {academicYear && (
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
                        ) : availableClasses.length === 0 ? (
                            <div className="text-center py-8" style={{ color: TEXT.SECONDARY }}>
                                <FiUsers className="h-8 w-8 mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">Không có lớp học nào</p>
                                <p className="text-sm">Năm học này chưa có lớp học được tạo</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Danh sách lớp học năm {academicYears.find(y => y.value.toString() === academicYear)?.label}
                                    </h3>
                                    <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                        {availableClasses.length} lớp học
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {availableClasses.map((cls) => (
                                        <div
                                            key={cls.id}
                                            onClick={() => handleClassSelection(cls.id)}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${formData.classIds.includes(cls.id) ? "shadow-sm" : ""}`}
                                            style={{
                                                borderColor: formData.classIds.includes(cls.id) ? PRIMARY[500] : BORDER.DEFAULT,
                                                backgroundColor: formData.classIds.includes(cls.id) ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                            }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.classIds.includes(cls.id)}
                                                    onChange={() => handleClassSelection(cls.id)}
                                                    className="h-5 w-5"
                                                    style={{ accentColor: PRIMARY[500] }}
                                                />
                                                <div>
                                                    <p className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {cls.name}
                                                    </p>
                                                    <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        {cls.studentCount || 0} học sinh
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
                        Tạo kế hoạch kiểm tra sức khỏe mới
                    </h1>
                    <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                        Điền đầy đủ thông tin để tạo một kế hoạch kiểm tra sức khỏe mới cho học sinh
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
                                            <Loading type="spinner" size="small" color="white" className="mr-2" />Đang tạo...
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

export default HealthCheckPlanCreate;