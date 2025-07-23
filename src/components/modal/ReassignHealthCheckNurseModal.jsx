import React, { useState, useEffect } from "react";
import { FiX, FiUserCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import healthCheckApi from "../../api/healthCheckApi";
import { PRIMARY, GRAY, TEXT, ERROR, BACKGROUND, BORDER } from "../../constants/colors";
import Loading from "../Loading";
import AlertModal from "./AlertModal";

const ReassignHealthCheckNurseModal = ({ isOpen, onClose, planId, onNurseReassigned }) => {
    const [loading, setLoading] = useState(false);
    const [nurseList, setNurseList] = useState([]);
    const [assignedItems, setAssignedItems] = useState([]);
    const [error, setError] = useState(null);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState("info");
    const [alertMsg, setAlertMsg] = useState("");
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setAssignments([]);
        fetchData();
    }, [isOpen, planId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchNurseList(), fetchPlanDetails()]);
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

    const fetchPlanDetails = async () => {
        const res = await healthCheckApi.getHealthCheckPlanDetails(planId);
        if (!res.success) throw new Error(res.message);
        const itemAssignments = res.data.itemNurseAssignments?.filter(a => a.nurseId) || [];
        setAssignedItems(itemAssignments);
        if (itemAssignments.length > 0) {
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
        return assignedItems.filter(item => !usedItemIds.includes(item.healthCheckItemId));
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

    const handleReassignNurse = async () => {
        setError(null);
        if (assignments.length === 0) {
            setError("Không có tái phân công nào để thực hiện.");
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
            const res = await healthCheckApi.reassignNurseToHealthCheckPlan(planId, allAssignments);
            if (res.success) {
                setAlertType("success");
                setAlertMsg(res.message || "Tái phân công thành công!");
                setAlertOpen(true);
                if (onNurseReassigned) {
                    const assignmentData = assignments.map(assignment => {
                        const nurse = nurseList.find(n => n.nurseId === assignment.nurseId);
                        return {
                            nurseId: assignment.nurseId,
                            nurseName: nurse?.nurseName || "Unknown",
                            itemIds: assignment.itemIds
                        };
                    });
                    onNurseReassigned(assignmentData);
                }
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
            onClose();
        }
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
                            <FiUserCheck className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Tái phân công nhân viên y tế
                            </h3>
                            <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                Thay đổi phân công nhân viên y tế cho các hạng mục đã được phân công
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
                                <div className="mb-4 p-3 rounded-lg border" style={{ backgroundColor: ERROR[50], borderColor: ERROR[200] }}>
                                    <p className="text-sm" style={{ color: ERROR[700] }}>{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {assignments.length === 0 && assignedItems.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: GRAY[500] }}>
                                        <FiUserCheck className="w-12 h-12 mx-auto mb-4" style={{ color: GRAY[400] }} />
                                        <p className="text-lg font-medium mb-2">Tất cả các hạng mục đã được phân công</p>
                                        <p className="text-sm">Không có hạng mục nào cần tái phân công thêm</p>
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
                                                                Tái phân công {index + 1}
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
                                                                Nhân viên y tế mới
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
                                                                Hạng mục được tái phân công ({assignment.itemIds.length})
                                                            </label>
                                                            <div className="max-h-32 overflow-y-auto border rounded-lg p-2" style={{ borderColor: BORDER.DEFAULT }}>
                                                                {getAvailableItemsForAssignment(assignment.id).length === 0 ? (
                                                                    <p className="text-sm" style={{ color: GRAY[500] }}>Không có hạng mục nào khả dụng</p>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 gap-1">
                                                                        {getAvailableItemsForAssignment(assignment.id).map((item) => (
                                                                            <label key={item.healthCheckItemId} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-gray-50">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={assignment.itemIds.includes(item.healthCheckItemId)}
                                                                                    onChange={() => toggleItemInAssignment(assignment.id, item.healthCheckItemId)}
                                                                                    className="rounded"
                                                                                />
                                                                                <div>
                                                                                    <span style={{ color: TEXT.PRIMARY }}>{item.healthCheckItemName}</span>
                                                                                    <span className="text-xs ml-2" style={{ color: TEXT.SECONDARY }}>
                                                                                        (Hiện tại: {item.nurseName})
                                                                                    </span>
                                                                                </div>
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

                                        {hasAvailableItems && (
                                            <div className="flex justify-center pt-2">
                                                <button
                                                    onClick={addAssignmentRow}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600], border: `1px solid ${PRIMARY[200]}` }}
                                                >
                                                    <FiPlus className="w-4 h-4" />
                                                    Thêm
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-6 pt-0">
                            <div className="pt-4 border-t" style={{ borderColor: BORDER.LIGHT }}>
                                <button
                                    onClick={handleReassignNurse}
                                    disabled={assignments.length === 0 || assignedItems.length === 0}
                                    className="w-full py-3 px-6 text-base font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                >
                                    Tái phân công nhân viên y tế
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

export default ReassignHealthCheckNurseModal; 