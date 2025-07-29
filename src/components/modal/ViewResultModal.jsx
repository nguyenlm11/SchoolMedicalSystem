import React, { useState, useEffect } from "react";
import { FiX, FiCheckCircle, FiUser, FiCalendar, FiShield, FiUserCheck, FiActivity } from "react-icons/fi";
import vaccineSessionApi from "../../api/vaccineSessionApi";
import { PRIMARY, GRAY, TEXT, SHADOW, ERROR, SUCCESS, BACKGROUND, BORDER } from "../../constants/colors";
import Loading from "../Loading";
import AlertModal from "./AlertModal";

const ViewResultModal = ({ isOpen, onClose, sessionId, studentId, studentData }) => {
  const [loading, setLoading] = useState(false);
  const [vaccinationResult, setVaccinationResult] = useState(null);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("info");
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    fetchVaccinationResult();
  }, [isOpen]);

  const fetchVaccinationResult = async () => {
    setLoading(true);
    try {
      const response = await vaccineSessionApi.getVaccinationResult(sessionId, studentId);
      if (response.success) {
        setVaccinationResult(response.data);
      } else {
        setVaccinationResult(null);
        setAlertType("error");
        setAlertMsg(response.message || "Không tìm thấy kết quả tiêm.");
        setAlertOpen(true);
      }
    } catch (err) {
      setVaccinationResult(null);
      setError(err.message || "Có lỗi xảy ra khi lấy kết quả tiêm.");
      setAlertType("error");
      setAlertMsg(err.message || "Có lỗi xảy ra.");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    onClose();
  };

  const getVaccinationStatusDisplay = (status) => {
    if (status?.toLowerCase() === 'completed') {
      return {
        text: 'Hoàn thành',
        bgColor: SUCCESS[500],
        textColor: 'white'
      };
    }
    return {
      text: 'Không tiêm',
      bgColor: GRAY[500],
      textColor: 'white'
    };
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
        style={{ boxShadow: `0 25px 50px -12px ${SHADOW.DARK}, 0 0 0 1px ${GRAY[100]}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT, backgroundColor: PRIMARY[25] }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: PRIMARY[500] }}
              >
                <FiCheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>
                  Kết quả tiêm chủng
                </h2>
                <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                  Thông tin chi tiết
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/50 transition-colors"
              style={{ color: GRAY[600] }}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loading type="spinner" size="medium" color="primary" />
              <p className="mt-3 text-sm" style={{ color: TEXT.SECONDARY }}>
                Đang tải kết quả...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-base" style={{ color: ERROR[600] }}>{error}</p>
            </div>
          )}

          {vaccinationResult && (
            <div className="space-y-5">
              {/* Student & Vaccine Info */}
              <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: BORDER.LIGHT }}>
                <div className="flex items-center mb-4">
                  <FiUser className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
                  <h3 className="font-medium" style={{ color: TEXT.PRIMARY }}>
                    Thông tin cơ bản
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium flex items-center mb-1" style={{ color: TEXT.SECONDARY }}>
                        Họ và tên
                      </label>
                      <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                        {vaccinationResult.studentName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center mb-1" style={{ color: TEXT.SECONDARY }}>
                        Lớp học
                      </label>
                      <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                        {studentData?.className || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium flex items-center mb-1" style={{ color: TEXT.SECONDARY }}>
                        <FiShield className="h-3 w-3 mr-1" />
                        Loại vaccine
                      </label>
                      <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                        {vaccinationResult.vaccinationTypeName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center mb-1" style={{ color: TEXT.SECONDARY }}>
                        Liều thứ
                      </label>
                      <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                        {vaccinationResult.doseNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administration Details */}
              <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: BORDER.LIGHT }}>
                <div className="flex items-center mb-4">
                  <FiCalendar className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
                  <h3 className="font-medium" style={{ color: TEXT.PRIMARY }}>
                    Thông tin thực hiện
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium flex items-center mb-1" style={{ color: TEXT.SECONDARY }}>
                      Ngày tiêm
                    </label>
                    <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                      {new Date(vaccinationResult.administeredDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center mb-1" style={{ color: TEXT.SECONDARY }}>
                      <FiUserCheck className="h-3 w-3 mr-1" />
                      Người thực hiện
                    </label>
                    <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                      {vaccinationResult.administeredBy}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center mb-1" style={{ color: TEXT.SECONDARY }}>
                      Số lô
                    </label>
                    <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                      {vaccinationResult.batchNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Symptoms */}
              <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: BORDER.LIGHT }}>
                <div className="flex items-center mb-4">
                  <FiActivity className="h-4 w-4 mr-2" style={{ color: PRIMARY[500] }} />
                  <h3 className="font-medium" style={{ color: TEXT.PRIMARY }}>
                    Kết quả & tình trạng
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                        Trạng thái tiêm
                      </label>
                      <p className="text-base font-semibold" style={{ color: TEXT.PRIMARY }}>
                        {getVaccinationStatusDisplay(vaccinationResult.vaccinationStatus).text}
                      </p>
                    </div>
                    <span
                      className="px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                      style={{
                        backgroundColor: getVaccinationStatusDisplay(vaccinationResult.vaccinationStatus).bgColor,
                        color: getVaccinationStatusDisplay(vaccinationResult.vaccinationStatus).textColor
                      }}
                    >
                      {getVaccinationStatusDisplay(vaccinationResult.vaccinationStatus).text}
                    </span>
                  </div>
                  <div className="pt-3 border-t" style={{ borderColor: BORDER.LIGHT }}>
                    <label className="text-sm font-medium mb-2 block" style={{ color: TEXT.SECONDARY }}>
                      Triệu chứng sau tiêm
                    </label>
                    <div
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: vaccinationResult.symptoms ? '#fef3cd' : SUCCESS[25],
                        borderColor: vaccinationResult.symptoms ? '#f9c851' : SUCCESS[200]
                      }}
                    >
                      <p className="text-base" style={{ color: TEXT.PRIMARY }}>
                        {vaccinationResult.symptoms || "Không có triệu chứng bất thường"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertModal
            isOpen={alertOpen}
            onClose={handleAlertClose}
            title="Thông Báo"
            message={alertMsg}
            type={alertType}
            okText="OK"
          />
        </div>
      </div>
    </div>
  );
};

export default ViewResultModal;
