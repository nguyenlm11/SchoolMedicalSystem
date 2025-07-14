import React from 'react';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW } from '../../constants/colors';
import { FiX, FiBarChart2 } from 'react-icons/fi';

const ViewAllPhysicalRecordsModal = ({ isOpen, onClose, records = [] }) => {
    if (!isOpen) return null;
    const sortedRecords = [...records].sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate));

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
                className="rounded-2xl shadow-2xl max-w-6xl w-full transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden"
                style={{ backgroundColor: BACKGROUND.DEFAULT, boxShadow: `0 25px 50px -12px ${SHADOW.DARK}, 0 0 0 1px ${GRAY[100]}` }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b"
                    style={{ borderColor: BORDER.LIGHT }}>
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                            style={{ backgroundColor: PRIMARY[100] }}>
                            <FiBarChart2 className="h-6 w-6" style={{ color: PRIMARY[600] }} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Tất cả lịch sử chỉ số thể chất
                            </h2>
                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                Tổng cộng {sortedRecords.length} lần kiểm tra
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
                    {sortedRecords.length === 0 ? (
                        <div className="text-center py-8" style={{ color: TEXT.SECONDARY }}>
                            <FiBarChart2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Chưa có lịch sử kiểm tra chỉ số thể chất</p>
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
                                            Chiều cao(cm)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            Cân nặng(kg)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            BMI
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            Ghi chú
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y" style={{ borderColor: GRAY[200] }}>
                                    {sortedRecords.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {new Date(record.checkDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {record.height}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {record.weight}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                <div className="flex items-center space-x-2 justify-center">
                                                    <span>{record.bmi.toFixed(1)}</span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${record.bmi < 18.5 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                                                            record.bmi >= 18.5 && record.bmi < 25 ? 'text-green-600 bg-green-50 border-green-200' :
                                                                record.bmi >= 25 && record.bmi < 30 ? 'text-orange-600 bg-orange-50 border-orange-200' :
                                                                    'text-red-600 bg-red-50 border-red-200'
                                                        }`}>
                                                        {record.bmi < 18.5 ? 'Thiếu cân' :
                                                            record.bmi >= 18.5 && record.bmi < 25 ? 'Bình thường' :
                                                                record.bmi >= 25 && record.bmi < 30 ? 'Thừa cân' : 'Béo phì'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center" style={{ color: TEXT.PRIMARY }}>
                                                {record.comments || "Không có ghi chú"}
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

export default ViewAllPhysicalRecordsModal; 