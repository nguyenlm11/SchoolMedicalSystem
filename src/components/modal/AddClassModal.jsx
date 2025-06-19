import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import classApi from '../../api/classApi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from '../../constants/colors';
import Loading from '../Loading';
import AlertModal from './AlertModal';

const AddClassModal = ({ isOpen, onClose, onSuccess, classToEdit }) => {
  const currentYear = new Date().getFullYear();

  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    grade: 0,
    academicYear: currentYear
  });

  useEffect(() => {
    if (classToEdit) {
      setFormData({
        name: classToEdit.name,
        grade: classToEdit.grade,
        academicYear: classToEdit.academicYear
      });
    } else {
      resetForm();
    }
  }, [classToEdit, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      grade: 0,
      academicYear: currentYear
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
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
      onSuccess && onSuccess();
      onClose();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Tên lớp không được để trống';
    }

    if (formData.grade === 0) {
      errors.grade = 'Vui lòng chọn khối';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showAlertMessage('error', 'Lỗi validation', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setLoading(true);
    try {
      const response = classToEdit
        ? await classApi.updateSchoolClass(classToEdit.id, formData)
        : await classApi.addSchoolClass(formData);

      setLoading(false);
      if (response.success) {
        showAlertMessage('success', 'Thành công', `Lớp "${formData.name}" đã được ${classToEdit ? 'chỉnh sửa' : 'thêm'} thành công.`);
      } else {
        showAlertMessage('error', 'Lỗi', response.message);
      }
    } catch (error) {
      setLoading(false);
      showAlertMessage('error', 'Lỗi', error.message);
    }
  };

  const getFieldStyle = (fieldName) => ({
    borderColor: formErrors[fieldName] ? ERROR[500] : BORDER.DEFAULT,
    backgroundColor: BACKGROUND.DEFAULT,
    color: TEXT.PRIMARY
  });

  const renderFieldError = (fieldName) => {
    return formErrors[fieldName] ? (
      <p className="mt-1 text-sm" style={{ color: ERROR[600] }}>{formErrors[fieldName]}</p>
    ) : null;
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-2xl shadow-2xl transform transition-all max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-6 pt-6 pb-4 border-b" style={{ borderColor: BORDER.DEFAULT }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl leading-6 font-semibold" style={{ color: TEXT.PRIMARY }}>
                {classToEdit ? 'Chỉnh sửa lớp học' : 'Thêm Lớp Học Mới'}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                style={{ color: GRAY[400] }}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Tên lớp *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('name')}
                  />
                  {renderFieldError('name')}
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Khối *
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('grade')}
                  >
                    <option value="0">Chọn khối</option>
                    {[1, 2, 3, 4, 5].map((grade) => (
                      <option key={grade} value={grade}>
                        Khối {grade}
                      </option>
                    ))}
                  </select>
                  {renderFieldError('grade')}
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Năm học *
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    disabled
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('academicYear')}
                  />
                  {renderFieldError('academicYear')}
                </div>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t flex flex-col sm:flex-row-reverse gap-3" style={{ backgroundColor: '#f9fafb', borderColor: BORDER.DEFAULT }}>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
              style={{ backgroundColor: loading ? GRAY[400] : PRIMARY[600] }}
            >
              {loading && (
                <div className="mr-2">
                  <Loading type="spinner" size="small" color="white" />
                </div>
              )}
              {loading ? 'Đang xử lý...' : classToEdit ? 'Cập nhật lớp học' : 'Thêm lớp học'}
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border rounded-lg text-base font-medium bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:bg-gray-50"
              style={{ borderColor: BORDER.DEFAULT, color: TEXT.SECONDARY }}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={showAlert}
        onClose={handleAlertClose}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        okText="OK"
      />
    </>
  );
};

export default AddClassModal;
