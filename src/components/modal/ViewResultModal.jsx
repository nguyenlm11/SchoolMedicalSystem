import React, { useState, useEffect } from "react";
import { FiX, FiCheckCircle } from "react-icons/fi";
import vaccineSessionApi from "../../api/vaccineSessionApi";
import { PRIMARY, GRAY, TEXT, SHADOW, ERROR, COMMON, SUCCESS, WARNING } from "../../constants/colors";
import Loading from "../Loading";
import AlertModal from "./AlertModal";

// Custom Badge Component for Vaccination Status
const StatusBadge = ({ status }) => (
  <div
    className="px-4 py-2 rounded-lg inline-flex items-center"
    style={{
      color: COMMON.PRIMARY,
    }}
  >
    <FiCheckCircle className="mr-2 text-black" />
    <span className="text-sm font-medium">{status}</span>
  </div>
);

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
      className="fixed inset-0 flex items-center justify-center z-40"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-lg transform transition-all w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: "16px" }}
      >
        <div className="bg-white px-6 pt-6 pb-4 border-b" style={{ borderColor: TEXT.PRIMARY }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-gray-900">Xem Kết Quả Tiêm</h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-200 transition-all"
              style={{ color: GRAY[400] }}
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Student Details */}
          {vaccinationResult && (
            <div className="p-6 bg-gray-100 rounded-xl">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Thông Tin Học Sinh</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="text-sm text-gray-700 space-y-3">
                  <p><strong>Tên:</strong> {vaccinationResult.studentName}</p>
                  <p><strong>Lớp:</strong> {studentData?.className}</p>
                  <p><strong>Loại Vắc Xin:</strong> {vaccinationResult.vaccinationTypeName}</p>
                  <p><strong>Liều:</strong> {vaccinationResult.doseNumber}</p>
                  <p><strong>Ngày Tiêm:</strong> {new Date(vaccinationResult.administeredDate).toLocaleString()}</p>
                  <p><strong>Tiêm Bởi:</strong> {vaccinationResult.administeredBy}</p>
                </div>

                <div className="text-sm text-gray-700 space-y-3">
                  <p><strong>Số Lô:</strong> {vaccinationResult.batchNumber}</p>
                  <p><strong>Triệu Chứng:</strong> {vaccinationResult.symptoms || "Không Có"}</p>
                  <p><strong>Trạng Thái Tiêm:</strong>
                    <StatusBadge status={vaccinationResult.vaccinationStatus} />
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center py-4">
              <Loading type="spinner" size="large" color="primary" />
            </div>
          )}

          {/* Alert Modal */}
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
