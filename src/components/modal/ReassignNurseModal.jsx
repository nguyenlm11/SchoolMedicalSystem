import React, { useState, useEffect } from "react";
import { FiX, FiUserPlus, FiCheckCircle, FiXCircle } from "react-icons/fi";
import vaccineSessionApi from "../../api/vaccineSessionApi";
import { PRIMARY, GRAY, TEXT, SHADOW } from "../../constants/colors";
import Loading from "../Loading";
import AlertModal from "./AlertModal";

const ReassignNurseModal = ({
  isOpen,
  onClose,
  sessionId,
  onNurseReassigned,
}) => {
  /* ---------------- STATE ---------------- */
  const [loading, setLoading] = useState(false);
  const [nurseList, setNurseList] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("info");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    fetchNurseList();
    fetchSessionDetails();
  }, [isOpen]);

  // Fetch the nurse list
  const fetchNurseList = async () => {
    setLoading(true);
    try {
      const res = await vaccineSessionApi.getNurseAssignments(sessionId);
      if (res.success) {
        setNurseList(res.data || []);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setError(err.message || "Không thể tải danh sách nhân viên y tế.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch session details including class nurse assignments
  const fetchSessionDetails = async () => {
    setLoading(true);
    try {
      const res = await vaccineSessionApi.getVaccineSessionDetails(sessionId);
      if (res.success) {
        setAssignedClasses(res.data.classNurseAssignments || []);
        // Set the selectedClasses based on currently assigned classes
        const currentlyAssignedClasses = res.data.classNurseAssignments.map(
          (assignment) => assignment.classId
        );
        setSelectedClasses(currentlyAssignedClasses);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setError(err.message || "Không thể tải thông tin chi tiết buổi tiêm.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle the selected class for reassignment
  const toggleClass = (id) => {
    setSelectedClasses((prev) =>
      prev.includes(id)
        ? prev.filter((classId) => classId !== id)
        : [...prev, id]
    );
  };

  // Handle reassigning the nurse
  const handleReassignNurse = async () => {
    setError(null);
    if (!selectedNurse) return setError("Vui lòng chọn nhân viên y tế.");
    if (selectedClasses.length === 0)
      return setError("Vui lòng chọn ít nhất một lớp.");

    setLoading(true);
    try {
      const payload = {
        sessionId,
        assignments: selectedClasses.map((classId) => ({
          classId,
          nurseId: selectedNurse,
        })),
      };

      const res = await vaccineSessionApi.reassignNurse(sessionId, payload);

      if (res.success) {
        setAlertType("success");
        setAlertMsg(res.message || "Tái phân công thành công!");
        setAlertOpen(true);
        setAlertModalOpen(true);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setAlertType("error");
      setAlertMsg(err.message || "Có lỗi xảy ra khi tái phân công.");
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

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Chọn tất cả hoặc bỏ chọn các lớp
  const handleSelectAll = () => {
    if (selectedClasses.length === assignedClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(assignedClasses.map((cls) => cls.classId));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      {/* CARD */}
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 25px 50px -12px ${SHADOW.DARK}, 0 0 0 1px ${GRAY[100]}`,
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between p-8 pb-6">
          <div className="flex items-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mr-4"
              style={{ backgroundColor: `${PRIMARY[500]}20` }}
            >
              <FiUserPlus className="w-8 h-8" style={{ color: PRIMARY[600] }} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: TEXT.PRIMARY }}>
              Tái phân công nhân viên y tế
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:scale-95"
            style={{ color: GRAY[600] }}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        {loading ? (
          <Loading type="medical" size="large" color="primary" text="Đang tải..." />
        ) : (
          <div className="p-6 space-y-6">
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* --- CHỌN Y TÁ --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn nhân viên y tế:
              </label>
              <select
                className="block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedNurse}
                onChange={(e) => setSelectedNurse(e.target.value)}
              >
                <option value="">Chọn nhân viên</option>
                {nurseList.map((n) => (
                  <option key={n.nurseId} value={n.nurseId}>
                    {n.nurseName} – {n.assignedClassName || "Chưa phân công"}
                  </option>
                ))}
              </select>
            </div>

            {/* --- DANH SÁCH LỚP ĐÃ PHÂN CÔNG Y TÁ --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Các lớp đã phân công:
              </label>
              <div className="flex items-center gap-4 text-sm mb-2">
                {/* Chọn tất cả */}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 focus:outline-none transition-all duration-200"
                  onClick={handleSelectAll}
                >
                  <FiCheckCircle className="h-4 w-4" />
                  <span>Chọn tất cả</span>
                </button>

                {/* Bỏ chọn */}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 focus:outline-none transition-all duration-200"
                  onClick={() => setSelectedClasses([])}
                >
                  <FiXCircle className="h-4 w-4" />
                  <span>Bỏ chọn</span>
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                {assignedClasses.map((assignment) => (
                  <label key={assignment.classId} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      value={assignment.classId}
                      checked={selectedClasses.includes(assignment.classId)}
                      onChange={() => toggleClass(assignment.classId)}
                    />
                    <span>{assignment.className} – {assignment.nurseName}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* --- BUTTON --- */}
            <button
              onClick={handleReassignNurse}
              className="w-full py-4 px-6 text-base font-semibold text-white rounded-2xl transition-all duration-200 hover:opacity-90 active:scale-98 focus:outline-none focus:ring-4 focus:ring-opacity-20"
              style={{
                backgroundColor: PRIMARY[500],
                focusRingColor: `${PRIMARY[500]}50`,
              }}
            >
              Tái phân công
            </button>
          </div>
        )}
      </div>

      {/* ALERT */}
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

export default ReassignNurseModal;
