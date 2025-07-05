import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUser, FiCalendar, FiUsers } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from '../../constants/colors';
import { ButtonLoading } from '../Loading';
import userApi from '../../api/userApi';
import classApi from '../../api/classApi';
import AlertModal from './AlertModal';

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Nam' },
    { value: 'Female', label: 'Nữ' }
];

const AddStudentModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [parents, setParents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loadingParents, setLoadingParents] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        gender: 'Male',
        dateOfBirth: '',
        studentCode: '',
        parentId: '',
        classId: ''
    });
    const [parentSearch, setParentSearch] = useState('');
    const [classSearch, setClassSearch] = useState('');
    const [showParentSuggestions, setShowParentSuggestions] = useState(false);
    const [showClassSuggestions, setShowClassSuggestions] = useState(false);
    const [filteredParents, setFilteredParents] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [academicYear, setAcademicYear] = useState('');
    const [academicYears, setAcademicYears] = useState([]);
    const parentInputRef = useRef(null);
    const classInputRef = useRef(null);
    const parentSuggestionsRef = useRef(null);
    const classSuggestionsRef = useRef(null);

    const loadClasses = async () => {
        setLoadingClasses(true);
        try {
            const response = await classApi.getSchoolClass({
                pageSize: 1000,
                pageIndex: 1,
                searchTerm: classSearch,
                academicYear: academicYear ? academicYear.split('-')[0] : ''
            });
            if (response.success) {
                setClasses(response.data);
            }
        } catch (error) {
            console.error('Error loading classes:', error);
        }
        setLoadingClasses(false);
    };

    useEffect(() => {
        const loadAcademicYears = async () => {
            try {
                const years = [];
                for (let startYear = 2025; startYear <= 2029; startYear++) {
                    years.push(`${startYear}-${startYear + 1}`);
                }
                setAcademicYears(years);
                setAcademicYear('2025-2026');
            } catch (error) {
                // console.error('Error loading academic years:', error);
            }
        };
        loadAcademicYears();
    }, []);

    useEffect(() => {
        if (academicYear) { loadClasses() }
    }, [academicYear]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (classSearch) {
                loadClasses();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [classSearch]);

    useEffect(() => {
        if (isOpen) {
            fetchParents();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (parentInputRef.current && !parentInputRef.current.contains(event.target) &&
                parentSuggestionsRef.current && !parentSuggestionsRef.current.contains(event.target)) {
                setShowParentSuggestions(false);
            }
            if (classInputRef.current && !classInputRef.current.contains(event.target) &&
                classSuggestionsRef.current && !classSuggestionsRef.current.contains(event.target)) {
                setShowClassSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (parentSearch.trim()) {
            const filtered = parents.filter(parent =>
                parent.fullName.toLowerCase().includes(parentSearch.toLowerCase()) ||
                (parent.phoneNumber && parent.phoneNumber.includes(parentSearch))
            );
            setFilteredParents(filtered);
        } else {
            setFilteredParents([]);
        }
    }, [parentSearch, parents]);

    useEffect(() => {
        if (classSearch.trim()) {
            const filtered = classes.filter(cls =>
                cls.name.toLowerCase().includes(classSearch.toLowerCase())
            );
            setFilteredClasses(filtered);
        } else {
            setFilteredClasses([]);
        }
    }, [classSearch, classes]);

    const fetchParents = async () => {
        setLoadingParents(true);
        try {
            const response = await userApi.getParents({ pageSize: 1000, pageIndex: 1, timestamp: Date.now() });
            if (response.success) {
                setParents(response.data);
            }
        } catch (error) {
            // console.error('Error fetching parents:', error);
        } finally {
            setLoadingParents(false);
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            fullName: '',
            phoneNumber: '',
            address: '',
            gender: 'Male',
            dateOfBirth: '',
            studentCode: '',
            parentId: '',
            classId: ''
        });
        setFormErrors({});
        setParentSearch('');
        setClassSearch('');
        setSelectedParent(null);
        setSelectedClass(null);
        setShowParentSuggestions(false);
        setShowClassSuggestions(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'studentCode') {
            const upperValue = value.toUpperCase();
            const validValue = upperValue.replace(/[^A-Z0-9]/g, '').slice(0, 7); // ST + 5 digits = 7 characters
            setFormData(prev => ({
                ...prev,
                [name]: validValue
            }));
        } else {
            const finalValue = name === 'dateOfBirth' && value ? new Date(value).toISOString().split('T')[0] : value;
            setFormData(prev => ({
                ...prev,
                [name]: finalValue
            }));
        }

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
        if (!formData.dateOfBirth) {
            errors.dateOfBirth = "Ngày sinh không được để trống";
        }
        if (!formData.studentCode?.trim()) {
            errors.studentCode = "Mã học sinh không được để trống";
        } else if (!/^HS\d{5}$/.test(formData.studentCode)) {
            errors.studentCode = "Mã học sinh phải có dạng HSxxxxx (x là các số)";
        }
        if (!formData.parentId) {
            errors.parentId = "Vui lòng chọn phụ huynh";
        }
        if (!formData.classId) {
            errors.classId = "Vui lòng chọn lớp";
        }
        if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = "Số điện thoại không hợp lệ (10 số)";
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
            const response = await userApi.createStudent(formData);
            if (response.success) {
                resetForm();
                onClose();
                onSuccess();
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Có lỗi xảy ra khi thêm học sinh mới');
            }
        } catch (error) {
            showAlertMessage('error', 'Lỗi', 'Có lỗi xảy ra khi thêm học sinh mới');
        } finally {
            setLoading(false);
        }
    };

    const handleParentSelect = (parent) => {
        setSelectedParent(parent);
        setParentSearch(parent.fullName);
        setFormData(prev => ({ ...prev, parentId: parent.id }));
        setShowParentSuggestions(false);
        if (formErrors.parentId) {
            setFormErrors(prev => ({ ...prev, parentId: '' }));
        }
    };

    const handleClassSelect = (cls) => {
        setSelectedClass(cls);
        setClassSearch(cls.name);
        setFormData(prev => ({ ...prev, classId: cls.id }));
        setShowClassSuggestions(false);
        if (formErrors.classId) {
            setFormErrors(prev => ({ ...prev, classId: '' }));
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
                                <FiUsers className="h-6 w-6" style={{ color: PRIMARY[600] }} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    Thêm học sinh mới
                                </h3>
                                <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                    Nhập thông tin học sinh mới
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
                                    Tên đăng nhập *
                                </label>
                                <div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            borderColor: formErrors.username ? ERROR[500] : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        placeholder="Nhập tên đăng nhập..."
                                    />
                                </div>
                                {formErrors.username && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>{formErrors.username}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Email *
                                </label>
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            borderColor: formErrors.email ? ERROR[500] : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        placeholder="Nhập email..."
                                    />
                                </div>
                                {formErrors.email && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>{formErrors.email}</p>
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
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{
                                        borderColor: formErrors.fullName ? ERROR[500] : BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        focusRingColor: PRIMARY[500] + '40'
                                    }}
                                    placeholder="Nhập họ và tên..."
                                />
                                {formErrors.fullName && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>{formErrors.fullName}</p>
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
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{
                                        borderColor: formErrors.gender ? ERROR[500] : BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        focusRingColor: PRIMARY[500] + '40'
                                    }}
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
                                    Phụ huynh *
                                </label>
                                <div className="relative" ref={parentInputRef}>
                                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: TEXT.SECONDARY }} />
                                    <input
                                        type="text"
                                        value={parentSearch}
                                        onChange={(e) => {
                                            setParentSearch(e.target.value);
                                            setShowParentSuggestions(true);
                                            if (!e.target.value) {
                                                setSelectedParent(null);
                                                setFormData(prev => ({ ...prev, parentId: '' }));
                                            }
                                        }}
                                        onFocus={() => setShowParentSuggestions(true)}
                                        disabled={loading || loadingParents}
                                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            borderColor: formErrors.parentId ? ERROR[500] : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        placeholder="Tìm kiếm phụ huynh..."
                                    />
                                    {showParentSuggestions && filteredParents.length > 0 && (
                                        <div
                                            ref={parentSuggestionsRef}
                                            className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto"
                                            style={{ borderColor: BORDER.DEFAULT }}
                                        >
                                            {filteredParents.map((parent) => (
                                                <div
                                                    key={parent.id}
                                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                                                    onClick={() => handleParentSelect(parent)}
                                                >
                                                    <div className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {parent.fullName}
                                                    </div>
                                                    {parent.phoneNumber && (
                                                        <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                            SĐT: {parent.phoneNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {formErrors.parentId && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>{formErrors.parentId}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Số điện thoại
                                </label>
                                <div>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            borderColor: formErrors.phoneNumber ? ERROR[500] : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        placeholder="Nhập số điện thoại..."
                                    />
                                </div>
                                {formErrors.phoneNumber && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>{formErrors.phoneNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Năm học *
                                </label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: TEXT.SECONDARY }} />
                                    <select
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                    >
                                        {academicYears.map((year) => (
                                            <option key={year} value={year}>
                                                Năm học {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Lớp học *
                                </label>
                                <div className="relative" ref={classInputRef}>
                                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: TEXT.SECONDARY }} />
                                    <input
                                        type="text"
                                        value={classSearch}
                                        onChange={(e) => {
                                            setClassSearch(e.target.value);
                                            setShowClassSuggestions(true);
                                            if (!e.target.value) {
                                                setSelectedClass(null);
                                                setFormData(prev => ({ ...prev, classId: '' }));
                                            }
                                        }}
                                        onFocus={() => setShowClassSuggestions(true)}
                                        disabled={loading || loadingClasses}
                                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            borderColor: formErrors.classId ? ERROR[500] : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        placeholder="Tìm kiếm lớp học..."
                                    />
                                    {showClassSuggestions && filteredClasses.length > 0 && (
                                        <div
                                            ref={classSuggestionsRef}
                                            className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto"
                                            style={{ borderColor: BORDER.DEFAULT }}
                                        >
                                            {filteredClasses.map((cls) => (
                                                <div
                                                    key={cls.id}
                                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                                                    onClick={() => handleClassSelect(cls)}
                                                >
                                                    <div className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {cls.name}
                                                    </div>
                                                    <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        Năm học {academicYear} | Sĩ số: {cls.studentCount || 0} học sinh
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {formErrors.classId && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>{formErrors.classId}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Ngày sinh *
                                </label>
                                <div>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            borderColor: formErrors.dateOfBirth ? ERROR[500] : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                    />
                                </div>
                                {formErrors.dateOfBirth && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>{formErrors.dateOfBirth}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Mã học sinh * (HSxxxxx)
                                </label>
                                <div>
                                    <input
                                        type="text"
                                        name="studentCode"
                                        value={formData.studentCode}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        maxLength={7}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            borderColor: formErrors.studentCode ? ERROR[500] : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        placeholder="HSxxxxx"
                                    />
                                </div>
                                {formErrors.studentCode && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>{formErrors.studentCode}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Địa chỉ
                                </label>
                                <div>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        rows={2}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            borderColor: formErrors.address ? ERROR[500] : BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        placeholder="Nhập địa chỉ..."
                                    />
                                </div>
                                {formErrors.address && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>{formErrors.address}</p>
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

export default AddStudentModal; 