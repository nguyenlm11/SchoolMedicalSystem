import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import userApi from '../../api/userApi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from '../../constants/colors';
import Loading from '../Loading';
import AlertModal from './AlertModal';

const AddStaffModal = ({ isOpen, onClose, onSuccess }) => {
  const [staffType, setStaffType] = useState('manager');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    staffCode: '',
    licenseNumber: '',
    specialization: ''
  });

  const generateStaffCode = (role) => {
    const prefix = role === 'manager' ? 'MNG' : 'NUR';
    const timestamp = Date.now().toString().slice(-5);
    return `${prefix}${timestamp}`;
  };

  const resetForm = () => {
    const initialStaffCode = generateStaffCode('manager');
    setFormData({
      username: '',
      email: '',
      fullName: '',
      phoneNumber: '',
      address: '',
      gender: '',
      dateOfBirth: '',
      staffCode: initialStaffCode,
      licenseNumber: '',
      specialization: ''
    });
    setStaffType('manager');
    setFormErrors({});
  };

  useEffect(() => {
    if (isOpen && !formData.staffCode) {
      const initialStaffCode = generateStaffCode(staffType);
      setFormData(prev => ({
        ...prev,
        staffCode: initialStaffCode
      }));
    }
  }, [isOpen, staffType]);

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

  const handleStaffTypeChange = (e) => {
    const newStaffType = e.target.value;
    setStaffType(newStaffType);
    const newStaffCode = generateStaffCode(newStaffType);
    setFormData(prev => ({
      ...prev,
      staffCode: newStaffCode
    }));
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

    if (!formData.username.trim()) {
      errors.username = 'Username không được để trống';
    } else if (formData.username.length < 3) {
      errors.username = 'Username phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username chỉ được chứa chữ cái, số và dấu gạch dưới';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không đúng định dạng';
    }
    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống';
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Số điện thoại phải có 10-11 chữ số';
    }
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ không được để trống';
    }
    if (!formData.gender) {
      errors.gender = 'Vui lòng chọn giới tính';
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (birthDate > today) {
        errors.dateOfBirth = 'Ngày sinh không được ở tương lai';
      } else if (age < 18) {
        errors.dateOfBirth = 'Nhân viên phải từ 18 tuổi trở lên';
      } else if (age > 65) {
        errors.dateOfBirth = 'Tuổi không được vượt quá 65';
      }
    }
    if (staffType === 'nurse') {
      if (!formData.licenseNumber.trim()) {
        errors.licenseNumber = 'Số giấy phép không được để trống';
      }
      if (!formData.specialization.trim()) {
        errors.specialization = 'Chuyên môn không được để trống';
      }
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
      const baseData = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        staffCode: formData.staffCode
      };

      const response = staffType === 'manager'
        ? await userApi.createManager(baseData)
        : await userApi.createSchoolNurse({
          ...baseData,
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization
        });
      setLoading(false);
      if (response.success) {
        showAlertMessage('success', 'Thành công', `Nhân viên "${formData.fullName}" đã được thêm thành công.`);
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
                Thêm Nhân Viên Mới
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
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                Loại nhân viên
              </label>
              <select
                value={staffType}
                onChange={handleStaffTypeChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
              >
                <option value="manager">Quản lý</option>
                <option value="nurse">Nhân viên y tế</option>
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('username')}
                  />
                  {renderFieldError('username')}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('email')}
                  />
                  {renderFieldError('email')}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('fullName')}
                  />
                  {renderFieldError('fullName')}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('phoneNumber')}
                  />
                  {renderFieldError('phoneNumber')}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('address')}
                  />
                  {renderFieldError('address')}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Giới tính *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('gender')}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                  {renderFieldError('gender')}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Ngày sinh *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                    style={getFieldStyle('dateOfBirth')}
                  />
                  {renderFieldError('dateOfBirth')}
                </div>

                {/* Staff Code */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                    Mã nhân viên (Tự động tạo)
                  </label>
                  <input
                    type="text"
                    name="staffCode"
                    value={formData.staffCode}
                    readOnly
                    className="w-full p-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: '#f9fafb', color: TEXT.SECONDARY }}
                  />
                </div>

                {/* School Nurse specific fields */}
                {staffType === 'nurse' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                        Số giấy phép *
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                        style={getFieldStyle('licenseNumber')}
                      />
                      {renderFieldError('licenseNumber')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                        Chuyên môn *
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                        style={getFieldStyle('specialization')}
                      />
                      {renderFieldError('specialization')}
                    </div>
                  </>
                )}
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
              {loading ? 'Đang xử lý...' : 'Thêm nhân viên'}
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

export default AddStaffModal; 