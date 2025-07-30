import React, { useState } from 'react';
import { PRIMARY, TEXT, GRAY, COMMON } from '../../constants/colors';
import { FiEye, FiRadio, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../utils/AuthContext';
import ViewAllVisionModal from '../modal/ViewAllVisionModal';
import ViewAllHearingModal from '../modal/ViewAllHearingModal';
import AddHearingRecordModal from '../modal/AddHearingRecordModal';
import AddVisionRecordModal from '../modal/AddVisionRecordModal';

const RecordCard = ({ title, icon, leftValue, rightValue, date, comments, isVision = false }) => {
    const isValidValue = (value) => {
        if (!value || value === 'Not recorded') return false;
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'number') return value > 0;
        return false;
    };
    const isValidDate = (date) => date && date !== '0001-01-01T00:00:00';

    const handleHearing = (value) => {
        if (value === 'normal') return 'Bình thường';    // <26
        if (value === 'mild') return 'Yếu';             //26~40
        if (value === 'moderate') return 'Trung bình'; //41~65
        if (value === 'severe') return 'Nặng';        //>66
        return 'Không có dữ liệu';
    }

    const formatValue = (value) => {
        if (!isValidValue(value)) return 'Không có dữ liệu';
        if (isVision && typeof value === 'number') { return `${value}/10` }
        return handleHearing(value);
    };

    return (
        <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <span className="flex items-center justify-center w-10 h-10 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[50] }}>
                        {icon}
                    </span>
                    <div>
                        <h4 className="font-semibold" style={{ color: TEXT.PRIMARY }}>{title}</h4>
                        {isValidDate(date) && (
                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                {new Date(date).toLocaleDateString('vi-VN')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: PRIMARY[25] }}>
                    <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>Bên trái</p>
                    <p className={`text-2xl font-bold border border-solid rounded-lg p-2 ${!isValidValue(leftValue) ? 'text-gray-500' : ''}`} style={{ borderColor: GRAY[200], color: !isValidValue(leftValue) ? TEXT.SECONDARY : TEXT.PRIMARY }}>
                        {formatValue(leftValue)}
                    </p>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: PRIMARY[25] }}>
                    <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>Bên phải</p>
                    <p className={`text-2xl font-bold border border-solid rounded-lg p-2 ${!isValidValue(rightValue) ? 'text-gray-500' : ''}`} style={{ borderColor: GRAY[200], color: !isValidValue(rightValue) ? TEXT.SECONDARY : TEXT.PRIMARY }}>
                        {formatValue(rightValue)}
                    </p>
                </div>
            </div>
            {isValidValue(comments) && (
                <div className="mt-2">
                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Ghi chú</p>
                    <p className="text-sm" style={{ color: TEXT.PRIMARY }}>{comments}</p>
                </div>
            )}
        </div>
    );
};

const EmptyRecordMessage = ({ title }) => (
    <div className="bg-white rounded-xl p-6 border shadow-sm text-center" style={{ borderColor: GRAY[200] }}>
        <p className="text-lg" style={{ color: TEXT.SECONDARY }}>Chưa có dữ liệu {title}</p>
    </div>
);

const VisionHearingRecords = ({ visionRecords = [], hearingRecords = [], onRecordAdded, studentId }) => {
    const { user } = useAuth();
    const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
    const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
    const [isAddHearingModalOpen, setIsAddHearingModalOpen] = useState(false);
    const [isAddVisionModalOpen, setIsAddVisionModalOpen] = useState(false);
    const canAddRecord = user?.role === 'parent';
    const sortedVisionRecords = Array.isArray(visionRecords) ? [...visionRecords].sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate)) : [];
    const sortedHearingRecords = Array.isArray(hearingRecords) ? [...hearingRecords].sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate)) : [];
    const latestVisionRecord = sortedVisionRecords[0] || null;
    const latestHearingRecord = sortedHearingRecords[0] || null;
    const hasAnyRecords = sortedVisionRecords.length > 0 || sortedHearingRecords.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                    <span
                        className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}
                    >
                        <FiEye className="h-6 w-6" />
                    </span>
                    Thị lực & Thính lực
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>Thị lực</h3>
                        <div className="flex items-center space-x-2">
                            {sortedVisionRecords.length > 1 && (
                                <button
                                    onClick={() => setIsVisionModalOpen(true)}
                                    className="flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                    style={{ color: PRIMARY[600], border: `1px solid ${PRIMARY[200]}` }}
                                >
                                    <FiEye className="h-3 w-3 mr-1" /> Xem tất cả
                                </button>
                            )}
                            {canAddRecord && (
                                <button
                                    onClick={() => setIsAddVisionModalOpen(true)}
                                    className="flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE, border: `1px solid ${PRIMARY[600]}` }}
                                >
                                    <FiPlus className="h-3 w-3 mr-1" /> Cập nhật
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {latestVisionRecord ? (
                            <RecordCard
                                title="Kiểm tra thị lực"
                                icon={<FiEye className="h-6 w-6" style={{ color: PRIMARY[500] }} />}
                                leftValue={latestVisionRecord.leftEye}
                                rightValue={latestVisionRecord.rightEye}
                                date={latestVisionRecord.checkDate}
                                comments={latestVisionRecord.comments}
                                isVision={true}
                            />
                        ) : <EmptyRecordMessage title="thị lực" />}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>Thính lực</h3>
                        <div className="flex items-center space-x-2">
                            {sortedHearingRecords.length > 1 && (
                                <button
                                    onClick={() => setIsHearingModalOpen(true)}
                                    className="flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                    style={{ color: PRIMARY[600], border: `1px solid ${PRIMARY[200]}` }}
                                >
                                    <FiEye className="h-3 w-3 mr-1" /> Xem tất cả
                                </button>
                            )}
                            {canAddRecord && (
                                <button
                                    onClick={() => setIsAddHearingModalOpen(true)}
                                    className="flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE, border: `1px solid ${PRIMARY[600]}` }}
                                >
                                    <FiPlus className="h-3 w-3 mr-1" /> Cập nhật
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {latestHearingRecord ? (
                            <RecordCard
                                title="Kiểm tra thính lực"
                                icon={<FiRadio className="h-6 w-6" style={{ color: PRIMARY[500] }} />}
                                leftValue={latestHearingRecord.leftEar}
                                rightValue={latestHearingRecord.rightEar}
                                date={latestHearingRecord.checkDate}
                                comments={latestHearingRecord.comments}
                            />
                        ) : <EmptyRecordMessage title="thính lực" />}
                    </div>
                </div>
            </div>

            <ViewAllVisionModal
                isOpen={isVisionModalOpen}
                onClose={() => setIsVisionModalOpen(false)}
                visionRecords={visionRecords}
            />

            <ViewAllHearingModal
                isOpen={isHearingModalOpen}
                onClose={() => setIsHearingModalOpen(false)}
                hearingRecords={hearingRecords}
            />

            <AddHearingRecordModal
                isOpen={isAddHearingModalOpen}
                onClose={() => setIsAddHearingModalOpen(false)}
                onSave={() => onRecordAdded?.()}
                studentId={studentId}
            />

            <AddVisionRecordModal
                isOpen={isAddVisionModalOpen}
                onClose={() => setIsAddVisionModalOpen(false)}
                onSave={() => onRecordAdded?.()}
                studentId={studentId}
            />
        </div>
    );
};

export default VisionHearingRecords; 