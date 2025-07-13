import React from 'react';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW } from '../../constants/colors';
import { FiShield, FiCalendar, FiX, FiClock, FiCheckCircle } from 'react-icons/fi';

const ViewAllVaccinationRecordsModal = ({ isOpen, onClose, records = [] }) => {
    if (!isOpen) return null;
    const groupedVaccines = records.reduce((acc, record) => {
        const key = `${record.vaccinationTypeId}-${record.vaccinationTypeName}`;
        if (!acc[key]) {
            acc[key] = {
                vaccinationTypeId: record.vaccinationTypeId,
                vaccinationTypeName: record.vaccinationTypeName,
                totalDoses: 0,
                latestDate: null,
                records: []
            };
        }
        acc[key].totalDoses += 1;
        acc[key].records.push(record);

        const currentDate = new Date(record.administeredDate);
        if (!acc[key].latestDate || currentDate > new Date(acc[key].latestDate)) {
            acc[key].latestDate = record.administeredDate;
        }
        return acc;
    }, {});

    const vaccineList = Object.values(groupedVaccines).sort((a, b) =>
        new Date(b.latestDate) - new Date(a.latestDate)
    );

    const allRecords = records
        .sort((a, b) => new Date(b.administeredDate) - new Date(a.administeredDate))
        .map((record, index) => ({ ...record, globalIndex: index + 1 }));

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
                className="rounded-2xl shadow-2xl max-w-4xl w-full transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden"
                style={{ backgroundColor: BACKGROUND.DEFAULT, boxShadow: `0 25px 50px -12px ${SHADOW.DARK}, 0 0 0 1px ${GRAY[100]}` }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b"
                    style={{ borderColor: BORDER.LIGHT }}>
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                            style={{ backgroundColor: PRIMARY[100] }}>
                            <FiShield className="h-6 w-6" style={{ color: PRIMARY[600] }} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Tất cả lịch sử tiêm chủng
                            </h2>
                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                Tổng cộng {records.length} mũi tiêm từ {vaccineList.length} loại vaccine
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
                    <div className="space-y-4">
                        {allRecords.length === 0 ? (
                            <div className="text-center py-8" style={{ color: TEXT.SECONDARY }}>
                                <FiShield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Chưa có lịch sử tiêm chủng</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {allRecords.map((record, index) => (
                                    <div key={index}
                                        className="border rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                                        style={{ borderColor: BORDER.LIGHT, backgroundColor: BACKGROUND.DEFAULT }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div>
                                                    <h4 className="font-semibold text-base" style={{ color: TEXT.PRIMARY }}>
                                                        {record.vaccinationTypeName}
                                                    </h4>
                                                    <div className="flex items-center mt-1">
                                                        <FiCalendar className="h-3 w-3 mr-1" style={{ color: PRIMARY[500] }} />
                                                        <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                            {new Date(record.administeredDate).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs px-3 py-1 rounded-full font-medium"
                                                    style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                                    {record.batchNumber || 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        {(record.notes || record.administeredBy) && (
                                            <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: PRIMARY[25] }}>
                                                {record.notes && (
                                                    <p className="text-sm mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        <strong>Ghi chú:</strong> {record.notes}
                                                    </p>
                                                )}
                                                {record.administeredBy && (
                                                    <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        <strong>Người tiêm:</strong> {record.administeredBy}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewAllVaccinationRecordsModal; 