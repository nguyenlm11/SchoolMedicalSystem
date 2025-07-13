import React, { useState, useEffect } from "react";
import { FiX, FiCheckCircle } from "react-icons/fi";
import vaccineSessionApi from "../../api/vaccineSessionApi";
import { PRIMARY, GRAY, TEXT, SHADOW, ERROR, COMMON, SUCCESS, WARNING } from "../../constants/colors";
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
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: GRAY[200] }}>
          <h2 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>Kết Quả Tiêm</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:scale-95"
            style={{ color: GRAY[600] }}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex justify-center py-4">
              <Loading type="spinner" size="large" color="primary" />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {vaccinationResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold" style={{ color: TEXT.SECONDARY }}>Tên</p>
                  <p style={{ color: TEXT.PRIMARY }}>{vaccinationResult.studentName}</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: TEXT.SECONDARY }}>Lớp</p>
                  <p style={{ color: TEXT.PRIMARY }}>{studentData?.className}</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: TEXT.SECONDARY }}>Loại Vắc Xin</p>
                  <p style={{ color: TEXT.PRIMARY }}>{vaccinationResult.vaccinationTypeName}</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: TEXT.SECONDARY }}>Liều</p>
                  <p style={{ color: TEXT.PRIMARY }}>{vaccinationResult.doseNumber}</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: TEXT.SECONDARY }}>Ngày Tiêm</p>
                  <p style={{ color: TEXT.PRIMARY }}>{new Date(vaccinationResult.administeredDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: TEXT.SECONDARY }}>Tiêm Bởi</p>
                  <p style={{ color: TEXT.PRIMARY }}>{vaccinationResult.administeredBy}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold" style={{ color: TEXT.SECONDARY }}>Số Lô</p>
                  <p style={{ color: TEXT.PRIMARY }}>{vaccinationResult.batchNumber}</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: TEXT.SECONDARY }}>Triệu Chứng</p>
                  <p style={{ color: TEXT.PRIMARY }}>{vaccinationResult.symptoms || "Không có"}</p>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: TEXT.SECONDARY }}>Trạng Thái Tiêm</p>
                  <p className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: PRIMARY[600] }}>
                    {vaccinationResult.vaccinationStatus}
                  </p>
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
