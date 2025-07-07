import React, { useState, useEffect } from 'react';
import { FiX, FiUserPlus } from 'react-icons/fi';
import vaccineSessionApi from '../../api/vaccineSessionApi';
import { PRIMARY, GRAY, TEXT, SHADOW, BACKGROUND, BORDER, ERROR } from '../../constants/colors';
import Loading from '../Loading';
import AlertModal from '../modal/AlertModal';

const AssignNurseModal = ({ isOpen, onClose, sessionId, classId, onNurseAssigned }) => {
    const [loading, setLoading] = useState(false);
    const [nurseList, setNurseList] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState(null);
    const [error, setError] = useState(null);
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [alertModalType, setAlertModalType] = useState('info');
    const [alertModalMessage, setAlertModalMessage] = useState('');

    // Lấy danh sách y tá khi modal được mở
    useEffect(() => {
        if (isOpen) {
            fetchNurseList();
        }
    }, [isOpen]);

    const fetchNurseList = async () => {
        setLoading(true);
        try {
            // Lấy danh sách y tá phân công cho buổi tiêm chủng
            const response = await vaccineSessionApi.getNurseAssignments(sessionId);
            if (response.success) {
                setNurseList(response.data);
            } else {
                setError("Không thể tải danh sách nhân viên y tế.");
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tải danh sách nhân viên y tế.");
        }
        setLoading(false);
    };

    const handleAssignNurse = async () => {
        if (!selectedNurse) {
            setError("Vui lòng chọn một nhân viên y tế.");
            return;
        }

        setLoading(true);
        try {
            // Phân công y tá cho buổi tiêm chủng
            const response = await vaccineSessionApi.assignNurseToVaccinationSession({
                sessionId: sessionId,
                assignments: [
                    {
                        nurseId: selectedNurse,
                        classId: classId
                    }
                ]
            });

            if (response.success) {
                setAlertModalType('success');
                setAlertModalMessage('Y tá đã được phân công thành công!');
                setAlertModalOpen(true);
                setTimeout(() => {
                    setAlertModalOpen(false);
                    onClose();
                }, 3000);
            } else {
                setAlertModalType('error');
                setAlertModalMessage('Không thể phân công nhân viên y tế.');
                setAlertModalOpen(true);
            }
        } catch (err) {
            setAlertModalType('error');
            setAlertModalMessage('Có lỗi xảy ra khi phân công.');
            setAlertModalOpen(true);
        }
        setLoading(false);
    };

    // Khi thông báo thành công được đóng, reload trang để cập nhật danh sách
    useEffect(() => {
        if (alertModalType === 'success' && !alertModalOpen) {
            window.location.reload();
        }
    }, [alertModalOpen, alertModalType]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ boxShadow: `0 25px 50px -12px ${SHADOW.DARK}, 0 0 0 1px ${GRAY[100]}` }}
            >
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
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:scale-95"
                        style={{ color: GRAY[600] }}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <Loading type="medical" size="large" color="primary" text="Đang tải..." />
                ) : (
                    <div className="p-6">
                        {error && <div className="text-sm text-red-500 mb-4">{error}</div>}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn nhân viên y tế:</label>
                            <select
                                className="block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onChange={(e) => setSelectedNurse(e.target.value)}
                            >
                                <option value="">Chọn nhân viên</option>
                                {nurseList.map((nurse) => (
                                    <option key={nurse.nurseId} value={nurse.nurseId}>
                                        {nurse.nurseName} - {nurse.assignedClassName || 'Chưa phân công'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleAssignNurse}
                            className="w-full py-4 px-6 text-base font-semibold text-white rounded-2xl transition-all duration-200 hover:opacity-90 active:scale-98 focus:outline-none focus:ring-4 focus:ring-opacity-20"
                            style={{
                                backgroundColor: PRIMARY[500],
                                focusRingColor: PRIMARY[500] + '50',
                            }}
                        >
                            Phân công
                        </button>
                    </div>
                )}
            </div>

            {/* Alert Modal for Success/Error */}
            <AlertModal
                isOpen={alertModalOpen}
                onClose={() => setAlertModalOpen(false)}
                title="Thông báo"
                message={alertModalMessage}
                type={alertModalType}
                okText="OK"
            />
        </div>
    );
};

export default AssignNurseModal;
