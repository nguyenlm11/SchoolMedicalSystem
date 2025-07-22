import React, { useState, useEffect } from 'react';
import { FiX, FiEdit2, FiPlus, FiSave, FiEye } from 'react-icons/fi';
import { PRIMARY, ERROR, TEXT, GRAY } from '../../constants/colors';

const VaccineTypeDetailModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'view', // 'view' | 'create' | 'edit'
  initialData = {},
  isLoading = false
}) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    recommendedAge: '',
    doseCount: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        recommendedAge: initialData.recommendedAge || '',
        doseCount: initialData.doseCount || ''
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Tên loại vaccine không được để trống';
    if (form.recommendedAge !== '' && (isNaN(form.recommendedAge) || form.recommendedAge < 0)) newErrors.recommendedAge = 'Tuổi khuyến nghị phải là số không âm';
    if (form.doseCount === '' || isNaN(form.doseCount) || form.doseCount < 1) newErrors.doseCount = 'Số mũi tiêm phải là số >= 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...form,
        recommendedAge: Number(form.recommendedAge),
        doseCount: Number(form.doseCount)
      });
    }
  };

  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  // Tăng size modal cho tất cả các chế độ
  const modalMaxWidth = 'max-w-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full mx-4 relative animate-fadeInUp ${modalMaxWidth}`}>
        <button
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          onClick={onClose}
          disabled={isLoading}
        >
          <FiX className="w-6 h-6 text-gray-500" />
        </button>
        <div className="p-8 pb-4">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
              {isView ? 'Chi tiết loại vaccine' : isEdit ? 'Chỉnh sửa loại vaccine' : 'Thêm loại vaccine mới'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Tên loại vaccine <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={isView || isLoading}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all duration-200 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                style={{ backgroundColor: isView ? GRAY[50] : 'white' }}
                placeholder="Nhập tên loại vaccine"
              />
              {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={isView || isLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none transition-all duration-200"
                style={{ backgroundColor: isView ? GRAY[50] : 'white', minHeight: 60 }}
                placeholder="Nhập mô tả (nếu có)"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Tuổi khuyến nghị</label>
                <input
                  type="number"
                  name="recommendedAge"
                  value={form.recommendedAge}
                  onChange={handleChange}
                  disabled={isView || isLoading}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all duration-200 ${errors.recommendedAge ? 'border-red-400' : 'border-gray-200'}`}
                  style={{ backgroundColor: isView ? GRAY[50] : 'white' }}
                  placeholder="Ví dụ: 12"
                  min={0}
                />
                {errors.recommendedAge && <div className="text-xs text-red-500 mt-1">{errors.recommendedAge}</div>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Số mũi tiêm <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="doseCount"
                  value={form.doseCount}
                  onChange={handleChange}
                  disabled={isView || isLoading}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all duration-200 ${errors.doseCount ? 'border-red-400' : 'border-gray-200'}`}
                  style={{ backgroundColor: isView ? GRAY[50] : 'white' }}
                  placeholder="Ví dụ: 2"
                  min={1}
                />
                {errors.doseCount && <div className="text-xs text-red-500 mt-1">{errors.doseCount}</div>}
              </div>
            </div>
            {!isView && (
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center transition-all duration-200 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: PRIMARY[500], color: 'white', borderColor: PRIMARY[600], boxShadow: `0 1px 2px ${PRIMARY[900]}20` }}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    {isCreate ? 'Tạo mới' : 'Lưu thay đổi'}
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VaccineTypeDetailModal; 