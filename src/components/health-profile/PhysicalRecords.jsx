import React, { useState } from 'react';
import { PRIMARY, TEXT, GRAY, COMMON } from '../../constants/colors';
import { FiBarChart2, FiActivity, FiFileText, FiEye, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../utils/AuthContext';
import ViewAllPhysicalRecordsModal from '../modal/ViewAllPhysicalRecordsModal';
import AddPhysicalRecordModal from '../modal/AddPhysicalRecordModal';

const BMIStatus = ({ bmi }) => {
    const getBMIInfo = (bmi) => {
        if (bmi < 18.5) return { status: 'Thiếu cân', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
        if (bmi < 25) return { status: 'Bình thường', color: 'text-green-600 bg-green-50 border-green-200' };
        if (bmi < 30) return { status: 'Thừa cân', color: 'text-orange-600 bg-orange-50 border-orange-200' };
        return { status: 'Béo phì', color: 'text-red-600 bg-red-50 border-red-200' };
    };
    const { status, color } = getBMIInfo(bmi);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>{status}</span>
    );
};

const PhysicalRecords = ({ records = [], onRecordAdded, studentId }) => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
    const canAddRecord = user?.role === 'parent';
    const sortedRecords = Array.isArray(records) ? [...records].sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate)) : [];
    const latestRecord = sortedRecords[0];
    const hasMultipleRecords = sortedRecords.length > 1;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                    <span
                        className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}
                    >
                        <FiBarChart2 className="h-6 w-6" />
                    </span>
                    Chỉ số thể chất
                </h2>
                <div className="flex items-center space-x-2">
                    {hasMultipleRecords && sortedRecords.length > 1 && (
                        <button
                            onClick={() => setIsViewAllModalOpen(true)}
                            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                            style={{ color: PRIMARY[600], border: `1px solid ${PRIMARY[200]}` }}
                        >
                            <FiEye className="h-4 w-4 mr-1" /> Xem tất cả
                        </button>
                    )}
                    {canAddRecord && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                            style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE, border: `1px solid ${PRIMARY[600]}` }}
                        >
                            <FiPlus className="h-4 w-4 mr-1" /> Cập nhật
                        </button>
                    )}
                </div>
            </div>

            {!latestRecord ? (
                <div
                    className="bg-white rounded-2xl p-6 border shadow-sm text-center"
                    style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}
                >
                    <p className="text-lg" style={{ color: TEXT.SECONDARY }}>Chưa có dữ liệu chỉ số thể chất</p>
                </div>
            ) : (
                <div
                    className="bg-white rounded-2xl p-6 border shadow-sm"
                    style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                            Chỉ số mới nhất
                            <span className="ml-2 text-sm font-normal" style={{ color: TEXT.SECONDARY }}>
                                (Ngày kiểm tra: {new Date(latestRecord.checkDate).toLocaleDateString('vi-VN')})
                            </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Chiều cao</p>
                                    <FiBarChart2 className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                </div>
                                <p className="mt-2 text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>{latestRecord.height}</p>
                                <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Cm</p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Cân nặng</p>
                                    <FiActivity className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                </div>
                                <p className="mt-2 text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>{latestRecord.weight}</p>
                                <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Kg</p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>BMI</p>
                                    <FiBarChart2 className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                </div>
                                <p className="mt-2 text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>{latestRecord.bmi.toFixed(1)}</p>
                                <div className="mt-1">
                                    <BMIStatus bmi={latestRecord.bmi} />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Ghi chú</p>
                                    <FiFileText className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                </div>
                                <p className="mt-2 text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                                    {latestRecord.comments || "Không có ghi chú"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AddPhysicalRecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => onRecordAdded?.()}
                studentId={studentId}
            />

            <ViewAllPhysicalRecordsModal
                isOpen={isViewAllModalOpen}
                onClose={() => setIsViewAllModalOpen(false)}
                records={sortedRecords}
            />
        </div>
    );
};

export default PhysicalRecords; 