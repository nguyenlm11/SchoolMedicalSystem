import React, { useState, useEffect } from "react";
import { FiX, FiUserPlus, FiPlus, FiTrash2 } from "react-icons/fi";
import vaccineSessionApi from "../../api/vaccineSessionApi";
import classApi from "../../api/classApi";
import { PRIMARY, GRAY, TEXT, SHADOW, ERROR } from "../../constants/colors";
import Loading from "../Loading";
import AlertModal from "../modal/AlertModal";

const AssignNurseModal = ({ isOpen, onClose, sessionId, preselectedClassId = null, onNurseAssigned = null }) => {
  const [loading, setLoading] = useState(false);
  const [nurseList, setNurseList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("info");
  const [alertMsg, setAlertMsg] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [availableNurses, setAvailableNurses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setAssignments([]);
    fetchNurseList();
    fetchSessionClasses();
  }, [isOpen, sessionId]);

  const fetchNurseList = async () => {
    setLoading(true);
    try {
      const res = await vaccineSessionApi.getNurseAssignments(sessionId);
      if (res.success) {
        setNurseList(res.data || []);
        setAvailableNurses(res.data || []);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setError(err.message || "Không thể tải danh sách nhân viên y tế.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionClasses = async () => {
    try {
      const res = await vaccineSessionApi.getVaccineSessionDetails(sessionId);
      if (res.success) {
        const classIds = res.data.classIds || [];
        const classes = await Promise.all(
          classIds.map(async (classId) => {
            try {
              const classDetails = await classApi.getClassById(classId);
              return classDetails.data;
            } catch (err) {
              console.error(`Error fetching class ${classId}:`, err);
              return null;
            }
          })
        );

        // Filter out any failed class fetches
        const validClasses = classes.filter(cls => cls !== null);

        // Lọc các lớp đã được phân công y tá
        const assignedClassIds = (res.data.classNurseAssignments || [])
          .filter(assignment => assignment.nurseId !== null)
          .map(assignment => assignment.classId);

        const availableClasses = validClasses.filter(
          (cls) => !assignedClassIds.includes(cls.id)
        );

        setClassList(validClasses);
        setAvailableClasses(availableClasses);

        console.log('Available classes after filtering:', availableClasses.length, availableClasses.map(c => c.name));

        if (preselectedClassId) {
          const preselectedClass = availableClasses.find(cls => cls.id === preselectedClassId);
          if (preselectedClass) {
            setAssignments([{
              id: 1,
              nurseId: "",
              classIds: [preselectedClassId]
            }]);
          }
        } else if (availableClasses.length > 0) {
          // Tự động tạo 1 hàng trống nếu không có preselectedClassId
          setAssignments([{
            id: 1,
            nurseId: "",
            classIds: []
          }]);
        }
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setError(err.message || "Không thể tải danh sách lớp.");
    }
  };

  const addAssignmentRow = () => {
    const newId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1;
    setAssignments([...assignments, {
      id: newId,
      nurseId: "",
      classIds: []
    }]);
  };

  const removeAssignmentRow = (id) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const updateAssignment = (id, field, value) => {
    setAssignments(assignments.map(assignment =>
      assignment.id === id
        ? { ...assignment, [field]: value }
        : assignment
    ));
  };

  const toggleClassInAssignment = (assignmentId, classId) => {
    setAssignments(assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        const classIds = assignment.classIds.includes(classId)
          ? assignment.classIds.filter(id => id !== classId)
          : [...assignment.classIds, classId];
        return { ...assignment, classIds };
      }
      return assignment;
    }));
  };

  const getAvailableNursesForAssignment = (currentAssignmentId) => {
    const usedNurseIds = assignments
      .filter(a => a.id !== currentAssignmentId && a.nurseId)
      .map(a => a.nurseId);

    return nurseList.filter(nurse => !usedNurseIds.includes(nurse.nurseId));
  };

  const getAvailableClassesForAssignment = (currentAssignmentId) => {
    // Chỉ lọc những lớp đã được chọn trong các assignment khác trong modal hiện tại
    // Không lọc những lớp đã được assign trong session từ trước
    const usedClassIds = assignments
      .filter(a => a.id !== currentAssignmentId)
      .flatMap(a => a.classIds);

    const result = availableClasses.filter(cls => !usedClassIds.includes(cls.id));
    console.log(`Available classes for assignment ${currentAssignmentId}:`, result.length, result.map(c => c.name));
    return result;
  };

  const validateAssignments = () => {
    for (const assignment of assignments) {
      if (!assignment.nurseId) {
        setError("Vui lòng chọn nhân viên y tế cho tất cả các hàng.");
        return false;
      }
      if (assignment.classIds.length === 0) {
        setError("Vui lòng chọn ít nhất một lớp cho tất cả các hàng.");
        return false;
      }
    }
    return true;
  };

  const handleAssignNurse = async () => {
    setError(null);

    if (assignments.length === 0) {
      setError("Không có phân công nào để thực hiện.");
      return;
    }

    if (!validateAssignments()) {
      return;
    }

    setLoading(true);
    try {
      const allAssignments = assignments.flatMap(assignment =>
        assignment.classIds.map(classId => ({
          classId: classId,
          nurseId: assignment.nurseId,
        }))
      );

      const payload = {
        sessionId,
        assignments: allAssignments,
      };

      const res = await vaccineSessionApi.assignNurseToVaccinationSession(payload);

      if (res.success) {
        setAlertType("success");
        setAlertMsg(res.message || "Phân công thành công!");
        setAlertOpen(true);

        // Call callback if provided
        if (onNurseAssigned) {
          const assignmentData = assignments.map(assignment => {
            const nurse = nurseList.find(n => n.nurseId === assignment.nurseId);
            return {
              nurseId: assignment.nurseId,
              nurseName: nurse?.nurseName || "Unknown",
              classIds: assignment.classIds
            };
          });
          onNurseAssigned(assignmentData);
        }
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setAlertType("error");
      setAlertMsg(err.message || "Có lỗi xảy ra khi phân công.");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleAlertOk = () => {
    setAlertOpen(false);
    if (alertType === "success") {
      onClose();
    }
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 transform transition-all duration-300 scale-100 relative overflow-hidden"
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
              Phân công nhân viên y tế
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
            {error && (
              <div className="p-4 rounded-lg border" style={{ backgroundColor: `${ERROR[50]}`, borderColor: ERROR[200] }}>
                <p className="text-sm" style={{ color: ERROR[700] }}>{error}</p>
              </div>
            )}

            {/* Assignment Table */}
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 rounded-lg font-medium text-sm" style={{ backgroundColor: PRIMARY[50] }}>
                <div className="col-span-1 text-center" style={{ color: PRIMARY[700] }}>STT</div>
                <div className="col-span-4" style={{ color: PRIMARY[700] }}>Nhân viên y tế</div>
                <div className="col-span-6" style={{ color: PRIMARY[700] }}>Lớp được phân công</div>
                <div className="col-span-1 text-center" style={{ color: PRIMARY[700] }}>Thao tác</div>
              </div>

              {/* Assignment Rows */}
              {assignments.length === 0 && availableClasses.length === 0 ? (
                <div className="text-center py-8" style={{ color: GRAY[500] }}>
                  <FiUserPlus className="w-12 h-12 mx-auto mb-4" style={{ color: GRAY[400] }} />
                  <p>Tất cả các lớp đã được phân công.</p>
                </div>
              ) : (
                assignments.map((assignment, index) => (
                  <div key={assignment.id} className="grid grid-cols-12 gap-4 p-4 rounded-lg border" style={{ borderColor: GRAY[200] }}>
                    {/* STT */}
                    <div className="col-span-1 flex items-center justify-center">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Nurse Selection */}
                    <div className="col-span-4">
                      <select
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        style={{ borderColor: GRAY[300] }}
                        value={assignment.nurseId}
                        onChange={(e) => updateAssignment(assignment.id, 'nurseId', e.target.value)}
                      >
                        <option value="">Chọn nhân viên y tế</option>
                        {getAvailableNursesForAssignment(assignment.id).map((nurse) => (
                          <option key={nurse.nurseId} value={nurse.nurseId}>
                            {nurse.nurseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Class Selection */}
                    <div className="col-span-6">
                      <div className="max-h-32 overflow-y-auto border rounded-lg p-2" style={{ borderColor: GRAY[300] }}>
                        {getAvailableClassesForAssignment(assignment.id).length === 0 ? (
                          <p className="text-sm" style={{ color: GRAY[500] }}>Không có lớp nào khả dụng</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {getAvailableClassesForAssignment(assignment.id).map((cls) => (
                              <label key={cls.id} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={assignment.classIds.includes(cls.id)}
                                  onChange={() => toggleClassInAssignment(assignment.id, cls.id)}
                                  className="rounded"
                                />
                                <span>{cls.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      {assignment.classIds.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs" style={{ color: GRAY[600] }}>
                            Đã chọn: {assignment.classIds.length} lớp
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => removeAssignmentRow(assignment.id)}
                        className="p-2 rounded-lg transition-all duration-200 hover:bg-red-50"
                        style={{ color: ERROR[600] }}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Add Button */}
              <div className="flex justify-center">
                <button
                  onClick={addAssignmentRow}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: PRIMARY[50],
                    color: PRIMARY[600],
                    border: `1px solid ${PRIMARY[200]}`
                  }}
                >
                  <FiPlus className="w-4 h-4" />
                  Thêm phân công
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAssignNurse}
              disabled={assignments.length === 0 || availableClasses.length === 0}
              className="w-full py-4 px-6 text-base font-semibold text-white rounded-2xl transition-all duration-200 hover:opacity-90 active:scale-98 focus:outline-none focus:ring-4 focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: PRIMARY[500],
                focusRingColor: `${PRIMARY[500]}50`,
              }}
            >
              Phân công
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

export default AssignNurseModal;