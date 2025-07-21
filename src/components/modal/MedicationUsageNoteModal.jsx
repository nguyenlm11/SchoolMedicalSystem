import React from 'react';
import { FiInfo, FiX } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BORDER } from '../../constants/colors';

const MedicationUsageNoteModal = ({ isOpen, onClose, instructions, specialNotes, studentName, medicationName }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 scale-100 relative overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{ boxShadow: `0 10px 32px 0 ${GRAY[300]}` }}
            >
                <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b" style={{ borderColor: BORDER.LIGHT }}>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow" style={{ backgroundColor: PRIMARY[50] }}>
                            <FiInfo className="w-8 h-8" style={{ color: PRIMARY[500] }} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-1" style={{ color: TEXT.PRIMARY }}>Lưu ý & Hướng dẫn sử dụng</h3>
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-base font-semibold" style={{ color: TEXT.SECONDARY }}>Học sinh: <span className="font-bold" style={{ color: PRIMARY[600] }}>{studentName || 'Không xác định'}</span></span>
                                <span className="text-base font-semibold" style={{ color: TEXT.SECONDARY }}>Thuốc: <span className="font-bold" style={{ color: PRIMARY[600] }}>{medicationName || 'Không xác định'}</span></span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:scale-95"
                        style={{ color: GRAY[600] }}
                        title="Đóng"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-8 pb-8 pt-6 flex flex-col gap-6">
                    <div className="rounded-2xl shadow-sm bg-gray-50 p-5 flex flex-col gap-2 border" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="font-semibold text-base mb-1" style={{ color: TEXT.SECONDARY }}>Hướng dẫn sử dụng</div>
                        <div className="text-base text-gray-700 min-h-[40px]">
                            {instructions || <span className="italic text-gray-400">Không có</span>}
                        </div>
                    </div>
                    <div className="rounded-2xl shadow-sm bg-gray-50 p-5 flex flex-col gap-2 border" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="font-semibold text-base mb-1" style={{ color: TEXT.SECONDARY }}>Lưu ý từ phụ huynh</div>
                        <div className="text-base text-gray-700 min-h-[40px]">
                            {specialNotes || <span className="italic text-gray-400">Không có</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicationUsageNoteModal; 