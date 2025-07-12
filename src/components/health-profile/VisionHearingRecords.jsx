import React from 'react';
import { PRIMARY, TEXT, GRAY } from '../../constants/colors';
import { FiEye, FiRadio } from 'react-icons/fi';

const RecordCard = ({ title, icon, leftValue, rightValue, date, comments }) => {
    const getSeverityColor = (value) => {
        if (!value || value === 'Not recorded' || value <= 0) return 'text-gray-400';
        if (value >= 8) return 'text-green-600';
        if (value >= 6) return 'text-yellow-600';
        return 'text-red-600';
    };

    // const getSeverityBg = (value) => {
    //     if (!value || value === 'Not recorded' || value <= 0) return 'bg-gray-50';
    //     if (value >= 8) return 'bg-green-50';
    //     if (value >= 6) return 'bg-yellow-50';
    //     return 'bg-red-50';
    // };

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
                        ? <p className={`text-2xl font-bold border border-solid rounded-lg p-2`} style={{ borderColor: GRAY[200] }}>{leftValue}/10</p>
                        : <p className="text-2xl font-bold" style={{ color: TEXT.SECONDARY }}>Không có dữ liệu</p>
                    }
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: PRIMARY[25] }}>
                    <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>Bên phải</p>
                    {(rightValue > 0 && rightValue !== 'Not recorded')
                        ? <p className={`text-2xl font-bold border border-solid rounded-lg p-2`} style={{ borderColor: GRAY[200] }}>{rightValue}/10</p>
                        : <p className="text-2xl font-bold" style={{ color: TEXT.SECONDARY }}>Không có dữ liệu</p>
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
    const sortedVisionRecords = Array.isArray(visionRecords) ? [...visionRecords].sort((a, b) =>
        new Date(b.checkDate) - new Date(a.checkDate)
    ) : [];

    const sortedHearingRecords = Array.isArray(hearingRecords) ? [...hearingRecords].sort((a, b) =>
        new Date(b.checkDate) - new Date(a.checkDate)
    ) : [];

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

            {(!visionRecords && !hearingRecords) || (sortedVisionRecords.length === 0 && sortedHearingRecords.length === 0) ? (
                <div className="bg-white rounded-2xl p-6 border shadow-sm text-center" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
                    <p className="text-lg" style={{ color: TEXT.SECONDARY }}>Chưa có dữ liệu thị lực và thính lực</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>Thị lực</h3>
                        <div className="space-y-4">
                            {sortedVisionRecords.length > 0 ? sortedVisionRecords.map((record, index) => (
                                <RecordCard
                                    key={index}
                                    title="Kiểm tra thị lực"
                                    icon={<FiEye className="h-6 w-6" style={{ color: PRIMARY[500] }} />}
                                    leftValue={record.leftEye}
                                    rightValue={record.rightEye}
                                    date={record.checkDate}
                                    comments={record.comments}
                                />
                            )) : <EmptyRecordMessage title="thị lực" />}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>Thính lực</h3>
                        <div className="space-y-4">
                            {sortedHearingRecords.length > 0 ? sortedHearingRecords.map((record, index) => (
                                <RecordCard
                                    key={index}
                                    title="Kiểm tra thính lực"
                                    icon={<FiRadio className="h-6 w-6" style={{ color: PRIMARY[500] }} />}
                                    leftValue={record.leftEar}
                                    rightValue={record.rightEar}
                                    date={record.checkDate}
                                    comments={record.comments}
                                />
                            )) : <EmptyRecordMessage title="thính lực" />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisionHearingRecords; 