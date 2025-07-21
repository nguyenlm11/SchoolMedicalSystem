import React, { useState, useEffect } from 'react';
import { FiX, FiClipboard, FiPlus, FiEdit2 } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BORDER, ERROR, BACKGROUND, COMMON } from '../../constants/colors';
import healthCheckApi from '../../api/healthCheckApi';
import Loading from '../Loading';

const CATEGORY_OPTIONS = [
    { value: 'Vision', label: 'Thị lực' },
    { value: 'Hearing', label: 'Thính lực' },
    { value: 'Weight', label: 'Cân nặng' },
    { value: 'Height', label: 'Chiều cao' },
    { value: 'Vital', label: 'Chỉ số sức khỏe' },
];

const initialForm = {
    name: '',
    categories: '',
    description: '',
    unit: '',
    minValue: '',
    maxValue: ''
};

const AddHealthCheckItemModal = ({ isOpen, onClose, onSuccess, item, onShowAlert }) => {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (item && isOpen) {
            setForm({
                name: item.name || '',
                categories: item.categories || '',
                description: item.description || '',
                unit: item.unit || '',
                minValue: item.minValue === null ? '' : item.minValue,
                maxValue: item.maxValue === null ? '' : item.maxValue
            });
            setError('');
            setFormErrors({});
        } else if (isOpen) {
            resetForm();
        }
    }, [item, isOpen]);

    const resetForm = () => {
        setForm(initialForm);
        setError('');
        setFormErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Vui lòng nhập tên hạng mục';
        if (!form.categories) errors.categories = 'Vui lòng chọn loại';
        if (!form.unit.trim()) errors.unit = 'Vui lòng nhập đơn vị';
        if (form.minValue !== '' && form.maxValue !== '' && Number(form.minValue) > Number(form.maxValue)) errors.maxValue = 'Giá trị tối đa phải lớn hơn tối thiểu';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setLoading(true);
        try {
            const data = {
                ...form,
                minValue: form.minValue === '' ? null : Number(form.minValue),
                maxValue: form.maxValue === '' ? null : Number(form.maxValue)
            };
            let res;
            if (item) {
                res = await healthCheckApi.updateHealthCheckItem(item.id, data);
            } else {
                res = await healthCheckApi.createHealthCheckItem(data);
            }
            if (res.success) {
                resetForm();
                onClose();
                onSuccess && onSuccess();
                onShowAlert && onShowAlert('success', item ? 'Cập nhật thành công!' : 'Tạo mới thành công!', 'Thành công');
            } else {
                onShowAlert && onShowAlert('error', res.message || (item ? 'Không thể cập nhật hạng mục kiểm tra' : 'Không thể tạo hạng mục kiểm tra'), 'Lỗi');
            }
        } catch (err) {
            onShowAlert && onShowAlert('error', 'Có lỗi xảy ra, vui lòng thử lại.', 'Lỗi');
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
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: PRIMARY[100] }}>
                                <FiClipboard className="h-6 w-6" style={{ color: PRIMARY[600] }} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    {item ? 'Chỉnh sửa hạng mục kiểm tra sức khỏe' : 'Thêm hạng mục kiểm tra sức khỏe'}
                                </h3>
                                <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                    {item ? 'Cập nhật thông tin hạng mục kiểm tra' : 'Nhập thông tin hạng mục kiểm tra mới'}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Tên hạng mục *
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.name ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập tên hạng mục..."
                                />
                                {formErrors.name && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Loại *
                                </label>
                                <select
                                    name="categories"
                                    value={form.categories}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.categories ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                >
                                    <option value="">Chọn loại...</option>
                                    {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                {formErrors.categories && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.categories}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Đơn vị *
                                </label>
                                <input
                                    name="unit"
                                    value={form.unit}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.unit ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập đơn vị..."
                                />
                                {formErrors.unit && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.unit}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Giá trị tối thiểu *
                                </label>
                                <input
                                    name="minValue"
                                    type="number"
                                    value={form.minValue}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.minValue ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập giá trị tối thiểu..."
                                />
                                {formErrors.minValue && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.minValue}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Giá trị tối đa *
                                </label>
                                <input
                                    name="maxValue"
                                    type="number"
                                    value={form.maxValue}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                    style={{ borderColor: formErrors.maxValue ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder="Nhập giá trị tối đa..."
                                />
                                {formErrors.maxValue && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.maxValue}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                disabled={loading}
                                rows={3}
                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 resize-none"
                                style={{ borderColor: BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                placeholder="Nhập mô tả (không bắt buộc)"
                            />
                        </div>
                        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                type="button"
                                onClick={() => { onClose(); resetForm(); }}
                                disabled={loading}
                                className="px-5 py-3 rounded-xl border font-semibold transition-all duration-200"
                                style={{ borderColor: BORDER.DEFAULT, color: TEXT.SECONDARY, backgroundColor: 'white' }}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 flex items-center"
                                style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE }}
                            >
                                {loading ?
                                    <>
                                        <Loading type="spinner" size="small" color="white" /> {item ? 'Đang cập nhật...' : 'Đang tạo...'}
                                    </>
                                    :
                                    <>
                                        {item ? <FiEdit2 className="h-5 w-5" /> : <FiPlus className="h-5 w-5" />}
                                        {item ? ' Cập nhật' : ' Tạo mới'}
                                    </>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddHealthCheckItemModal; 