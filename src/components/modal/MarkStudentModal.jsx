import React, { useState, useEffect } from "react";
import { FiX, FiCheckCircle, FiXCircle } from "react-icons/fi";
import vaccineSessionApi from "../../api/vaccineSessionApi";
import { PRIMARY, GRAY, TEXT, SHADOW, ERROR, COMMON, SUCCESS, WARNING, SECONDARY } from "../../constants/colors";
import Loading from "../Loading";
import AlertModal from "./AlertModal";

const MarkStudentModal = ({ isOpen, onClose, sessionId, studentId, onSuccess, studentData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: '',
    noteAfterSession: '',
    reason: ''
  });
  const [selectedOption, setSelectedOption] = useState("vaccinated");
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("info");
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setFormData({
      symptoms: '',
      noteAfterSession: '',
      reason: ''
    });
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setFormData({
      symptoms: '',
      noteAfterSession: '',
      reason: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (selectedOption === "vaccinated" && !formData.symptoms) {
      return setError("Vui lòng nhập triệu chứng.");
    }

    if (selectedOption === "notVaccinated" && !formData.reason) {
      return setError("Vui lòng nhập lý do không tiêm.");
    }

    setLoading(true);

    try {
      const data = {
        studentId: studentId,
        symptoms: formData.symptoms,
        noteAfterSession: formData.noteAfterSession
      };

      let response;
      if (selectedOption === "vaccinated") {
        response = await vaccineSessionApi.markStudentVaccinated(sessionId, data);
      } else {
        response = await vaccineSessionApi.markStudentNotVaccinated(sessionId, {
          studentId: studentId,
          reason: formData.reason,
          noteAfterSession: formData.noteAfterSession
        });
      }

      if (response.success) {
        setAlertType("success");
        setAlertMsg(response.message || "Thao tác thành công!");
        setAlertOpen(true);
      } else {
        setAlertType("error");
        setAlertMsg(response.message || "Có lỗi xảy ra.");
        setAlertOpen(true);
      }
    } catch (err) {
      setAlertType("error");
      setAlertMsg(err.message || "Có lỗi xảy ra.");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertOk = () => {
    setAlertOpen(false);
    if (alertType === "success") {
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  // Component for displaying vaccination status badge
  const VaccinationStatusBadge = ({ status }) => {
    let bgColor, text;

    switch (status) {
      case "Completed":
        bgColor = PRIMARY[600];
        text = "Đã tiêm";
        break;
      case "InProgress":
        bgColor = WARNING[500];
        text = "Chưa tiêm";
        break;
      default:
        bgColor = GRAY[400];
        text = "Chưa tiêm";
        break;
    }

    return (
      <div
        className="px-3 py-1 rounded-full inline-flex items-center"
        style={{
          backgroundColor: bgColor,
          color: COMMON.WHITE
        }}
      >
        <span className="text-sm font-medium">{text}</span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-40"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)"
      }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl transform transition-all max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white px-6 pt-6 pb-4 border-b" style={{ borderColor: TEXT.PRIMARY }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>
              Tiến hành Tiêm
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

        <div className="px-6 py-4 space-y-6">
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Student Details */}
          <div className="p-4 mb-6 bg-gray-50 rounded-xl">
            <h4 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>Thông tin học sinh</h4>
            <p><strong>Tên:</strong> {studentData?.studentName}</p>
            <p><strong>Lớp:</strong> {studentData?.className}</p>
            <p><strong>Trạng thái tiêm:</strong> <VaccinationStatusBadge status={studentData?.vaccinationStatus} /></p>
          </div>

          {/* Option Select */}
          <div>
            <label className="block text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
              Chọn trạng thái tiêm
            </label>
            <div className="flex gap-6 mb-4 text-sm">
              <button
                type="button"
                onClick={() => handleSelectOption("vaccinated")}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all text-center ${selectedOption === "vaccinated" ? "bg-primary-600 text-white border-2 border-primary-700" : "bg-gray-200 text-gray-700 border-2 border-gray-400"}`}
                style={{
                  backgroundColor: selectedOption === "vaccinated" ? PRIMARY[500] : GRAY[100], 
                  color: selectedOption === "vaccinated" ? COMMON.WHITE : TEXT.PRIMARY
                }}
              >
                Đã Tiêm
              </button>
              <button
                type="button"
                onClick={() => handleSelectOption("notVaccinated")}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all text-center ${selectedOption === "notVaccinated" ? "bg-primary-600 text-white border-2 border-primary-700" : "bg-gray-200 text-gray-700 border-2 border-gray-400"}`}
                style={{
                  backgroundColor: selectedOption === "notVaccinated" ? PRIMARY[500] : GRAY[100],
                  color: selectedOption === "notVaccinated" ? COMMON.WHITE : TEXT.PRIMARY
                }}
              >
                Chưa Tiêm
              </button>
            </div>
          </div>

          {/* Form Fields based on Selection */}
          {selectedOption === "vaccinated" ? (
            <>
              <div>
                <label className="block text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                  Triệu chứng sau tiêm
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                  Ghi chú sau buổi tiêm
                </label>
                <textarea
                  name="noteAfterSession"
                  value={formData.noteAfterSession}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                  Lý do không tiêm
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                  Ghi chú sau buổi tiêm
                </label>
                <textarea
                  name="noteAfterSession"
                  value={formData.noteAfterSession}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 px-6 text-base font-semibold text-white rounded-2xl transition-all duration-200 hover:opacity-90 focus:outline-none"
            style={{
              backgroundColor: PRIMARY[500],
              focusRingColor: `${PRIMARY[500]}50`,
            }}
          >
            {loading ? <Loading type="spinner" size="small" color="white" /> : 'Xác nhận'}
          </button>
        </div>
      </div>

      <AlertModal
        isOpen={alertOpen}
        onClose={handleAlertOk}
        title="Thông báo"
        message={alertMsg}
        type={alertType}
        okText="OK"
      />
    </div>
  );
};

export default MarkStudentModal;
