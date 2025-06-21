import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import classApi from '../../api/classApi';
import Loading from '../Loading';
import AlertModal from './AlertModal';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from '../../constants/colors';

const AddFileClassModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
  const [showAlert, setShowAlert] = useState(false);

  const showAlertMessage = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setShowAlert(true);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    if (alertConfig.type === 'success') {
      onSuccess && onSuccess();
      onClose();
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFile(null);
    setFileName('');
    setIsFileUploaded(false);
    setFormErrors({});
  };

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedExtensions = /(\.xlsx|\.xls)$/i;

    if (!allowedExtensions.exec(selectedFile.name)) {
      setFormErrors({ file: 'Vui lòng chọn một tệp Excel (dạng .xlsx hoặc .xls).' });
      setFile(null);
      return;
    } else {
      setFormErrors({});
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  // Gửi dữ liệu file lên API
  const handleSubmitFile = async () => {
    if (!file) {
      showAlertMessage('error', 'Lỗi', 'Vui lòng chọn một tệp Excel để nhập.');
      return;
    }

    setLoading(true);
    try {
      const overwriteExisting = true;
      const formData = new FormData();
      formData.append('ExcelFile', file);
      formData.append('OverwriteExisting', overwriteExisting);

      const result = await classApi.addSchoolClassByFile(formData);
      
      if (result.success) {
        showAlertMessage('success', 'Thành công', result.message);
      } else {
        showAlertMessage('error', 'Lỗi', result.message);
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
                Thêm lớp học từ file Excel
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
            <div className="space-y-4">
              {/* Chọn file */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                  Tải lên tệp Excel *
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-1 transition-all"
                  style={getFieldStyle('file')}
                />
                {formErrors.file && (
                  <p className="mt-1 text-sm" style={{ color: ERROR[600] }}>
                    {formErrors.file}
                  </p>
                )}
                <div className="mt-2 text-sm" style={{ color: TEXT.PRIMARY }}>
                  {fileName && <span>{fileName}</span>}
                </div>
              </div>

                <div className="px-6 py-4 border-t flex flex-col sm:flex-row-reverse gap-3" style={{ backgroundColor: '#f9fafb', borderColor: BORDER.DEFAULT }}>
                    {/* Nút kiểm tra file */}
                    <button
                        onClick={handleSubmitFile}
                        className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                        style={{ backgroundColor: loading ? GRAY[400] : PRIMARY[600] }}
                    >
                        {loading && (
                        <div className="mr-2">
                            <Loading type="spinner" size="small" color="white" />
                        </div>
                        )}
                        {loading ? 'Đang xử lý...' : 'Nhập'}
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

export default AddFileClassModal;
