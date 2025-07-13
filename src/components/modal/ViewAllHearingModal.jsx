import React from 'react';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW } from '../../constants/colors';
import { FiRadio, FiX } from 'react-icons/fi';

const ViewAllHearingModal = ({ isOpen, onClose, hearingRecords = [] }) => {
    if (!isOpen) return null;

    const sortedHearingRecords = Array.isArray(hearingRecords) 
        ? [...hearingRecords].sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate))
        : [];

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) { onClose() }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div
                className="rounded-2xl shadow-2xl max-w-3xl w-full transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden"
                style={{ backgroundColor: BACKGROUND.DEFAULT, boxShadow: `0 25px 50px -12px ${SHADOW.DARK}, 0 0 0 1px ${GRAY[100]}` }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b"
                    style={{ borderColor: BORDER.LIGHT }}>
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                            style={{ backgroundColor: PRIMARY[100] }}>
                            <FiRadio className="h-6 w-6" style={{ color: PRIMARY[600] }} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Tất cả lịch sử thính lực
                            </h2>
                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                Tổng cộng {sortedHearingRecords.length} lần kiểm tra
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

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {sortedHearingRecords.length === 0 ? (
                        <div className="text-center py-8" style={{ color: TEXT.SECONDARY }}>
                            <FiRadio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Chưa có lịch sử kiểm tra thính lực</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y" style={{ borderColor: GRAY[200] }}>
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            Ngày kiểm tra
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            Tai trái
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            Tai phải
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            Ghi chú
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y" style={{ borderColor: GRAY[200] }}>
                                    {sortedHearingRecords.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {new Date(record.checkDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {record.leftEar > 0 && record.leftEar !== 'Not recorded' 
                                                    ? `${record.leftEar}/10` 
                                                    : 'Không có dữ liệu'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {record.rightEar > 0 && record.rightEar !== 'Not recorded' 
                                                    ? `${record.rightEar}/10` 
                                                    : 'Không có dữ liệu'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center" style={{ color: TEXT.SECONDARY }}>
                                                {record.comments && record.comments !== 'Not recorded' 
                                                    ? record.comments 
                                                    : 'Không có ghi chú'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewAllHearingModal; 