import React, { useState } from 'react';
import { PRIMARY, TEXT, GRAY, COMMON } from '../../constants/colors';
import { FiEye, FiRadio, FiList } from 'react-icons/fi';
import ViewAllVisionModal from '../modal/ViewAllVisionModal';
import ViewAllHearingModal from '../modal/ViewAllHearingModal';

const RecordCard = ({ title, icon, leftValue, rightValue, date, comments }) => {
    return (
        <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <span className="flex items-center justify-center w-10 h-10 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[50] }}>
                        {icon}
                    </span>
                    <div>
                        <h4 className="font-semibold" style={{ color: TEXT.PRIMARY }}>{title}</h4>
                        {date && date !== '0001-01-01T00:00:00' && (
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
                    {(leftValue > 0 && leftValue !== 'Not recorded')
                        ? <p className="text-2xl font-bold border border-solid rounded-lg p-2" style={{ borderColor: GRAY[200] }}>{leftValue}/10</p>
                        : <p className="text-2xl font-bold border border-solid rounded-lg p-2" style={{ color: TEXT.SECONDARY, borderColor: GRAY[200] }}>Không có dữ liệu</p>
                    }
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: PRIMARY[25] }}>
                    <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>Bên phải</p>
                    {(rightValue > 0 && rightValue !== 'Not recorded')
                        ? <p className="text-2xl font-bold border border-solid rounded-lg p-2" style={{ borderColor: GRAY[200] }}>{rightValue}/10</p>
                        : <p className="text-2xl font-bold border border-solid rounded-lg p-2" style={{ color: TEXT.SECONDARY, borderColor: GRAY[200] }}>Không có dữ liệu</p>
                    }
                </div>
            </div>
            {comments && comments !== 'Not recorded' && (
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

const VisionHearingRecords = ({ visionRecords = [], hearingRecords = [] }) => {
    const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
    const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
    
    const sortedVisionRecords = Array.isArray(visionRecords) ? [...visionRecords].sort((a, b) =>
        new Date(b.checkDate) - new Date(a.checkDate)
    ) : [];

    const sortedHearingRecords = Array.isArray(hearingRecords) ? [...hearingRecords].sort((a, b) =>
        new Date(b.checkDate) - new Date(a.checkDate)
    ) : [];

    const latestVisionRecord = sortedVisionRecords[0] || null;
    const latestHearingRecord = sortedHearingRecords[0] || null;

    const hasAnyRecords = sortedVisionRecords.length > 0 || sortedHearingRecords.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                    <span className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
                        <FiEye className="h-6 w-6" />
                    </span>
                    Thị lực & Thính lực
                </h2>
            </div>

            {!hasAnyRecords ? (
                <div className="bg-white rounded-2xl p-6 border shadow-sm text-center" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
                    <p className="text-lg" style={{ color: TEXT.SECONDARY }}>Chưa có dữ liệu thị lực và thính lực</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>Thị lực</h3>
                            {sortedVisionRecords.length > 0 && (
                                <button
                                    onClick={() => setIsVisionModalOpen(true)}
                                    className="flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                    style={{ color:PRIMARY[600], border: `1px solid ${PRIMARY[200]}` }}
                                >
                                    <FiEye className="h-3 w-3 mr-1" /> Xem tất cả
                                </button>
                            )}
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
                                />
                            ) : <EmptyRecordMessage title="thị lực" />}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>Thính lực</h3>
                            {sortedHearingRecords.length > 0 && (
                                <button
                                    onClick={() => setIsHearingModalOpen(true)}
                                    className="flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md"
                                    style={{ color:PRIMARY[600], border: `1px solid ${PRIMARY[200]}` }}
                                >
                                    <FiEye className="h-3 w-3 mr-1" /> Xem tất cả
                                </button>
                            )}
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
            )}

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
        </div>
    );
};

export default VisionHearingRecords; 