import React from 'react';
import { FiX, FiCheckSquare } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, INFO, SHADOW } from '../../constants/colors';

const QuantityConfirmationModal = ({ isOpen, onClose, medications = [], receivedQuantities = {}, onQuantityChange, onConfirm }) => {
    if (!isOpen) return null;

    const QUANTITY_UNIT_CONFIG = {
        'Tablet': 'Viên',
        'Pack': 'Gói',
        'Bottle': 'Chai'
    };

    const getQuantityUnitText = (unit) => { return QUANTITY_UNIT_CONFIG[unit] || unit };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={onClose}
        >
            {/* CARD */}
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-4 transform transition-all duration-300 scale-100 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{
                    boxShadow: `0 25px 50px -12px ${SHADOW.DARK}, 0 0 0 1px ${GRAY[100]}`,
                }}
            >
                {/* HEADER */}
                <div className="flex justify-between p-8 pb-6">
                    <div className="flex items-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mr-4"
                            style={{ backgroundColor: `${PRIMARY[500]}20` }}
                        >
                            <FiCheckSquare className="w-8 h-8" style={{ color: PRIMARY[600] }} />
                        </div>
                        <h3 className="text-xl font-bold" style={{ color: TEXT.PRIMARY }}>
                            Xác nhận số lượng thuốc
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

                {/* BODY */}
                <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
                    {/* Medication Cards */}
                    <div className="space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ height: '400px' }}>
                        {medications.map((medication) => (
                            <div
                                key={medication.id}
                                className="border rounded-xl overflow-hidden"
                                style={{ borderColor: GRAY[200] }}
                            >
                                {/* Medication Card Header */}
                                <div className="p-4" style={{ backgroundColor: PRIMARY[25] }}>
                                    <h3 className="text-lg font-semibold" style={{ color: PRIMARY[500] }}>
                                        {medication.medicationName.toUpperCase()}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                        <span>Liều lượng: {medication.dosage}</span>
                                        <span>Tần suất: {medication.frequency} lần/ngày</span>
                                    </div>
                                </div>

                                {/* Two Column Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                    {/* Left Column - Sent Quantity */}
                                    <div className="p-4 border-r" style={{ borderColor: GRAY[200], backgroundColor: INFO[25] }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                Số lượng đã gửi
                                            </h4>
                                            <div className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                {medication.quantitySent} {getQuantityUnitText(medication.quantityUnit)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Received Quantity Input */}
                                    <div className="p-4" style={{ backgroundColor: BACKGROUND.DEFAULT }}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Số lượng đã nhận
                                            </h4>
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    onChange={(e) => onQuantityChange(medication.id, e.target.value)}
                                                    className="w-20 text-center text-base font-medium px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    style={{ borderColor: GRAY[300] }}
                                                    placeholder="0"
                                                />
                                                <span className="ml-2 text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                                    {getQuantityUnitText(medication.quantityUnit)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="p-6 flex-shrink-0">
                    <button
                        onClick={onConfirm}
                        className="w-full py-4 px-6 text-base font-semibold text-white rounded-2xl transition-all duration-200 hover:opacity-90 active:scale-98 focus:outline-none focus:ring-4 focus:ring-opacity-20"
                        style={{
                            backgroundColor: PRIMARY[500],
                            focusRingColor: `${PRIMARY[500]}50`,
                        }}
                    >
                        Xác nhận số lượng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuantityConfirmationModal; 