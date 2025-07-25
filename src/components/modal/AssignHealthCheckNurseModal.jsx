import React, { useState, useEffect } from "react";
import { FiX, FiUserPlus, FiPlus, FiTrash2 } from "react-icons/fi";
import healthCheckApi from "../../api/healthCheckApi";
import { PRIMARY, GRAY, TEXT, ERROR, BACKGROUND, BORDER } from "../../constants/colors";
import Loading from "../Loading";
import AlertModal from "../modal/AlertModal";

const AssignHealthCheckNurseModal = ({ isOpen, onClose, planId, onNurseAssigned }) => {
    const [loading, setLoading] = useState(false);
    const [nurseList, setNurseList] = useState([]);
    const [error, setError] = useState(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState("info");
    const [alertMsg, setAlertMsg] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setAssignments([]);
        fetchData();
    }, [isOpen, planId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchNurseList(), fetchPlanItems()]);
        } catch (err) {
            setError(err.message || "Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    const fetchNurseList = async () => {
        const res = await healthCheckApi.getNurseAssignments(planId);
        if (!res.success) throw new Error(res.message);
        setNurseList(res.data || []);
    };

    const fetchPlanItems = async () => {
        const res = await healthCheckApi.getHealthCheckPlanDetails(planId);
        if (!res.success) throw new Error(res.message);
        const items = res.data.healthCheckItems || [];
        const itemNurseAssignments = res.data.itemNurseAssignments || [];
        const available = items.filter(item => {
            const assignment = itemNurseAssignments.find(a => a.healthCheckItemId === item.id);
            return !assignment || assignment.nurseId === null;
        });
        setAvailableItems(available);
        if (available.length > 0) {
            setAssignments([{ id: 1, nurseId: "", itemIds: [] }]);
        }
    };

    const addAssignmentRow = () => {
        const newId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1;
        setAssignments([...assignments, { id: newId, nurseId: "", itemIds: [] }]);
    };

    const removeAssignmentRow = (id) => {
        setAssignments(assignments.filter(a => a.id !== id));
    };

    const updateAssignment = (id, field, value) => {
        setAssignments(assignments.map(assignment =>
            assignment.id === id ? { ...assignment, [field]: value } : assignment
        ));
    };

    const toggleItemInAssignment = (assignmentId, itemId) => {
        setAssignments(assignments.map(assignment => {
            if (assignment.id === assignmentId) {
                const itemIds = assignment.itemIds.includes(itemId)
                    ? assignment.itemIds.filter(id => id !== itemId)
                    : [...assignment.itemIds, itemId];
                return { ...assignment, itemIds };
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

    const getAvailableItemsForAssignment = (currentAssignmentId) => {
        const usedItemIds = assignments
            .filter(a => a.id !== currentAssignmentId)
            .flatMap(a => a.itemIds);
        return availableItems.filter(item => !usedItemIds.includes(item.id));
    };

    const validateAssignments = () => {
        for (const assignment of assignments) {
            if (!assignment.nurseId) {
                setError("Vui lòng chọn nhân viên y tế cho tất cả các hàng.");
                return false;
            }
            if (assignment.itemIds.length === 0) {
                setError("Vui lòng chọn ít nhất một hạng mục cho tất cả các hàng.");
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
        if (!validateAssignments()) return;
        setLoading(true);
        try {
            const allAssignments = assignments.flatMap(assignment =>
                assignment.itemIds.map(itemId => ({
                    healthCheckItemId: itemId,
                    nurseId: assignment.nurseId,
                }))
            );
            const res = await healthCheckApi.assignNurseToHealthCheckPlan({ planId, assignments: allAssignments });
            if (res.success) {
                setAlertType("success");
                setAlertMsg(res.message || "Phân công thành công!");
                setAlertOpen(true);
                await fetchData();
                if (onNurseAssigned) {
                    onNurseAssigned();
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

    const handleAlertOk = () => {
        setAlertOpen(false);
    };

    if (!isOpen) return null;
    const hasAvailableItems = getAvailableItemsForAssignment().length > 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: BORDER.DEFAULT }}
            >
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: PRIMARY[50] }}>
                            <FiUserPlus className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Phân công nhân viên y tế
                            </h3>
                            <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                Chọn nhân viên y tế cho các hạng mục chưa được phân công
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                        style={{ color: GRAY[600] }}
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-8">
                        <Loading type="medical" size="large" color="primary" text="Đang tải..." />
                    </div>
                ) : (
                    <>
                        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                            {error && (
                                <div className="mb-4 p-3 rounded-lg border" style={{ backgroundColor: `${ERROR[50]}`, borderColor: ERROR[200] }}>
                                    <p className="text-sm" style={{ color: ERROR[700] }}>{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {assignments.length === 0 && availableItems.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: GRAY[500] }}>
                                        <FiUserPlus className="w-12 h-12 mx-auto mb-4" style={{ color: GRAY[400] }} />
                                        <p className="text-lg font-medium mb-2">Tất cả các hạng mục đã được phân công</p>
                                        <p className="text-sm">Không có hạng mục nào cần phân công thêm</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            {assignments.map((assignment, index) => (
                                                <div key={assignment.id} className="p-4 rounded-lg border" style={{ borderColor: BORDER.DEFAULT }}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                                                {index + 1}
                                                            </span>
                                                            <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                                Phân công {index + 1}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeAssignmentRow(assignment.id)}
                                                            className="p-1.5 rounded-lg transition-all duration-200 hover:bg-red-50"
                                                            style={{ color: ERROR[600] }}
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                                Nhân viên y tế
                                                            </label>
                                                            <select
                                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                                                                style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT }}
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

                                                        <div>
                                                            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                                                                Hạng mục được phân công ({assignment.itemIds.length})
                                                            </label>
                                                            <div className="max-h-32 overflow-y-auto border rounded-lg p-2" style={{ borderColor: BORDER.DEFAULT }}>
                                                                {getAvailableItemsForAssignment(assignment.id).length === 0 ? (
                                                                    <p className="text-sm" style={{ color: GRAY[500] }}>Không có hạng mục nào khả dụng</p>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 gap-1">
                                                                        {getAvailableItemsForAssignment(assignment.id).map((item) => (
                                                                            <label key={item.id} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-gray-50">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={assignment.itemIds.includes(item.id)}
                                                                                    onChange={() => toggleItemInAssignment(assignment.id, item.id)}
                                                                                    className="rounded"
                                                                                />
                                                                                <span style={{ color: TEXT.PRIMARY }}>{item.name}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-center pt-2">
                                            <button
                                                onClick={addAssignmentRow}
                                                disabled={!hasAvailableItems}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: hasAvailableItems ? PRIMARY[50] : GRAY[100],
                                                    color: hasAvailableItems ? PRIMARY[600] : GRAY[500],
                                                    border: `1px solid ${hasAvailableItems ? PRIMARY[200] : GRAY[300]}`
                                                }}
                                            >
                                                <FiPlus className="w-4 h-4" />
                                                Thêm
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-6 pt-0">
                            <div className="pt-4 border-t" style={{ borderColor: BORDER.LIGHT }}>
                                <button
                                    onClick={handleAssignNurse}
                                    disabled={assignments.length === 0 || availableItems.length === 0}
                                    className="w-full py-3 px-6 text-base font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                >
                                    Phân công nhân viên y tế
                                </button>
                            </div>
                        </div>
                    </>
                )}
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

export default AssignHealthCheckNurseModal; 