import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR, COMMON } from '../../constants/colors';
import { ButtonLoading } from '../Loading';
import AlertModal from './AlertModal';
import vaccineApi from '../../api/vaccineApi';
import healthProfileApi from '../../api/healthProfileApi';

const AddVaccinationModal = ({ isOpen, onClose, onSave, initialData = {}, medicalRecordId }) => {
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [formErrors, setFormErrors] = useState({});
    const [vaccinationTypes, setVaccinationTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredTypes, setFilteredTypes] = useState([]);
    const [formData, setFormData] = useState({
        vaccinationTypeId: '',
        vaccinationTypeName: '',
        doseNumber: 1,
        administeredDate: new Date().toISOString().split('T')[0],
        administeredBy: '',
        symptoms: '',
        vaccinationStatus: 'Completed',
        noteAfterSession: ''
    });

    const fetchVaccinationTypes = async () => {
        setLoadingTypes(true);
        try {
            const response = await vaccineApi.getVaccineTypes({ pageSize: 100 });
            if (response.success) {
                setVaccinationTypes(response.data || []);
                setFilteredTypes(response.data || []);
            } else {
                console.error('Failed to fetch vaccination types:', response.message);
                setVaccinationTypes([]);
                setFilteredTypes([]);
            }
        } catch (error) {
            console.error('Error fetching vaccination types:', error);
            setVaccinationTypes([]);
            setFilteredTypes([]);
        } finally {
            setLoadingTypes(false);
        }
    };

    const handleVaccinationTypeInput = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            vaccinationTypeName: value,
            vaccinationTypeId: ''
        }));

        if (value.trim()) {
            const filtered = vaccinationTypes.filter(type =>
                type.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredTypes(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredTypes(vaccinationTypes);
            setShowSuggestions(false);
        }

        if (formErrors.vaccinationTypeId) {
            setFormErrors(prev => ({
                ...prev,
                vaccinationTypeId: ''
            }));
        }
    };

    const handleSelectVaccinationType = (type) => {
        setFormData(prev => ({
            ...prev,
            vaccinationTypeId: type.id,
            vaccinationTypeName: type.name
        }));
        setShowSuggestions(false);
    };

    const handleInputBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200);
    };

    useEffect(() => {
        if (isOpen) {
            fetchVaccinationTypes();
            if (initialData && Object.keys(initialData).length > 0) {
                setFormData(prev => ({
                    ...prev,
                    ...initialData,
                    administeredDate: initialData.administeredDate ? new Date(initialData.administeredDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                }));
            } else {
                resetForm();
            }
            setFormErrors({});
        }
    }, [isOpen, initialData?.vaccinationTypeId, initialData?.administeredDate]);

    const resetForm = () => {
        setFormData({
            vaccinationTypeId: '',
            vaccinationTypeName: '',
            doseNumber: 1,
            administeredDate: new Date().toISOString().split('T')[0],
            administeredBy: '',
            symptoms: '',
            vaccinationStatus: 'Completed',
            noteAfterSession: ''
        });
        setFormErrors({});
        setShowSuggestions(false);
        setFilteredTypes(vaccinationTypes);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            onSave && onSave();
            onClose();
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.vaccinationTypeId) {
            errors.vaccinationTypeId = "Loại vắc-xin không được để trống";
        }
        if (!formData.administeredBy) {
            errors.administeredBy = "Bác sĩ tiêm không được để trống";
        }
        if (!formData.doseNumber || formData.doseNumber < 1) {
            errors.doseNumber = "Số mũi tiêm phải lớn hơn 0";
        }
        if (!formData.administeredDate) {
            errors.administeredDate = "Ngày tiêm không được để trống";
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
            const apiData = {
                vaccinationTypeId: formData.vaccinationTypeId,
                doseNumber: formData.doseNumber,
                administeredDate: formData.administeredDate,
                symptoms: formData.symptoms,
                vaccinationStatus: formData.vaccinationStatus,
                noteAfterSession: formData.noteAfterSession,
                administeredBy: formData.administeredBy
            };
            const response = await healthProfileApi.addVaccinationRecord(medicalRecordId, apiData);
            if (response.success) {
                showAlertMessage('success', 'Thành công', response.message || 'Thêm lịch sử tiêm chủng thành công');
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Không thể thêm lịch sử tiêm chủng. Vui lòng thử lại.');
            }
        } catch (error) {
            showAlertMessage('error', 'Lỗi', 'Không thể thêm lịch sử tiêm chủng. Vui lòng thử lại.');
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
                            Thêm lịch sử tiêm chủng
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
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Loại vắc-xin *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="vaccinationTypeName"
                                            value={formData.vaccinationTypeName}
                                            onChange={handleVaccinationTypeInput}
                                            onBlur={handleInputBlur}
                                            disabled={loading || loadingTypes}
                                            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                            style={{ borderColor: formErrors.vaccinationTypeId ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                            placeholder="Nhập tên loại vắc-xin"
                                        />
                                        {showSuggestions && filteredTypes.length > 0 && (
                                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredTypes.map(type => (
                                                    <div
                                                        key={type.id}
                                                        className="p-2 cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSelectVaccinationType(type)}
                                                    >
                                                        {type.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {formErrors.vaccinationTypeId && (
                                        <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                            {formErrors.vaccinationTypeId}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Bác sĩ tiêm
                                    </label>
                                    <input
                                        type="text"
                                        name="administeredBy"
                                        value={formData.administeredBy}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.doctorName ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Nhập tên bác sĩ tiêm"
                                    />
                                    {formErrors.doctorName && (
                                        <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                            {formErrors.doctorName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Số mũi đã tiêm *
                                    </label>
                                    <input
                                        type="number"
                                        name="doseNumber"
                                        value={formData.doseNumber}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        min="1"
                                        max="10"
                                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.doseNumber ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="1"
                                    />
                                    {formErrors.doseNumber && (
                                        <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                            {formErrors.doseNumber}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Ngày tiêm gần nhất *
                                    </label>
                                    <input
                                        type="date"
                                        name="administeredDate"
                                        value={formData.administeredDate}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ borderColor: formErrors.administeredDate ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    />
                                    {formErrors.administeredDate && (
                                        <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                            {formErrors.administeredDate}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                Triệu chứng sau tiêm
                            </label>
                            <textarea
                                name="symptoms"
                                value={formData.symptoms}
                                onChange={handleInputChange}
                                disabled={loading}
                                rows="3"
                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 resize-none"
                                style={{ borderColor: formErrors.symptoms ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                placeholder="Mô tả các triệu chứng sau tiêm (nếu có)..."
                            />
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                Ghi chú sau buổi tiêm
                            </label>
                            <textarea
                                name="noteAfterSession"
                                value={formData.noteAfterSession}
                                onChange={handleInputChange}
                                disabled={loading}
                                rows="3"
                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 resize-none"
                                style={{ borderColor: formErrors.noteAfterSession ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                placeholder="Ghi chú sau khi tiêm..."
                            />
                        </div>

                        <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
                                style={{ color: TEXT.SECONDARY, border: `1px solid ${BORDER.DEFAULT}` }}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 flex items-center"
                                style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE }}
                            >
                                {loading ? (
                                    <>
                                        <ButtonLoading size="small" color="white" />
                                        <span className="ml-2">Đang thêm...</span>
                                    </>
                                ) : (
                                    <span>
                                        Thêm lịch sử tiêm chủng
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <AlertModal
                isOpen={showAlert}
                onClose={handleAlertClose}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
            />
        </>
    );
};

export default AddVaccinationModal; 