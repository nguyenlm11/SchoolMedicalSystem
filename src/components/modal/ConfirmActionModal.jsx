import React, { useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { PRIMARY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING } from "../../constants/colors";

const ConfirmActionModal = ({ isOpen, onClose, onConfirm, title, message, type = "approve", confirmText, cancelText = "Hủy" }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError("Vui lòng nhập lý do");
            return;
        }
        onConfirm(reason);
        setReason("");
        setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>

                <div
                    className="relative inline-block w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
                    style={{ backgroundColor: BACKGROUND.DEFAULT }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div
                                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                style={{
                                    backgroundColor: type === "approve" ? SUCCESS[50] : ERROR[50],
                                    color: type === "approve" ? SUCCESS[600] : ERROR[600]
                                }}
                            >
                                <FiAlertCircle className="w-6 h-6" />
                            </div>
                            <h3
                                className="ml-3 text-lg font-semibold"
                                style={{ color: TEXT.PRIMARY }}
                            >
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FiX className="w-5 h-5" style={{ color: TEXT.SECONDARY }} />
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                            {message}
                        </p>
                        <div className="mt-4">
                            <label
                                htmlFor="reason"
                                className="block text-sm font-medium mb-2"
                                style={{ color: TEXT.PRIMARY }}
                            >
                                Lý do {type === "approve" ? "phê duyệt" : "từ chối"}
                            </label>
                            <textarea
                                id="reason"
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                                style={{
                                    borderColor: error ? ERROR[300] : BORDER.DEFAULT,
                                    backgroundColor: BACKGROUND.DEFAULT,
                                    color: TEXT.PRIMARY,
                                    focusRingColor: error ? ERROR[200] : PRIMARY[200]
                                }}
                                placeholder={`Nhập lý do ${type === "approve" ? "phê duyệt" : "từ chối"}...`}
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    setError("");
                                }}
                            />
                            {error && (
                                <p className="mt-2 text-sm" style={{ color: ERROR[500] }}>
                                    {error}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                            style={{
                                borderColor: BORDER.DEFAULT,
                                color: TEXT.PRIMARY,
                                backgroundColor: BACKGROUND.DEFAULT
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200"
                            style={{
                                backgroundColor: type === "approve" ? PRIMARY[500] : ERROR[500],
                                color: TEXT.INVERSE
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmActionModal; 