import React from "react";
import { FiX } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from "../../constants/colors";
import { ButtonLoading } from "../Loading";

const MedicineModal = ({ isOpen, onClose, onSubmit, itemForm, selectedItem, formErrors, submitting, onInputChange }) => {
    if (!isOpen) return null;
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div
                className="rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100"
                style={{ backgroundColor: BACKGROUND.DEFAULT }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                    <h3 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                        {selectedItem ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
                        style={{ color: GRAY[600] }}
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                Tên thuốc *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={itemForm.name}
                                onChange={onInputChange}
                                disabled={submitting}
                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                style={{
                                    borderColor: formErrors.name ? ERROR[500] : BORDER.DEFAULT,
                                    focusRingColor: PRIMARY[500] + '40'
                                }}
                                placeholder="Nhập tên thuốc..."
                            />
                            {formErrors.name && (
                                <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                    {formErrors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                Số lượng *
                            </label>
                            <input
                                type="number"
                                name="stockQuantity"
                                value={itemForm.stockQuantity}
                                onChange={onInputChange}
                                disabled={submitting}
                                min="0"
                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                style={{
                                    borderColor: formErrors.stockQuantity ? ERROR[500] : BORDER.DEFAULT,
                                    focusRingColor: PRIMARY[500] + '40'
                                }}
                                placeholder="Nhập số lượng..."
                            />
                            {formErrors.stockQuantity && (
                                <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                    {formErrors.stockQuantity}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={itemForm.isActive}
                                onChange={onInputChange}
                                disabled={submitting}
                                className="h-5 w-5 rounded focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                style={{
                                    color: PRIMARY[600],
                                    focusRingColor: PRIMARY[500] + '40'
                                }}
                            />
                            <label className="ml-3 text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                Đang sử dụng
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 py-3 px-4 border rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                borderColor: BORDER.DEFAULT,
                                color: TEXT.SECONDARY,
                                backgroundColor: BACKGROUND.DEFAULT
                            }}
                            onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = GRAY[50])}
                            onMouseLeave={(e) => !submitting && (e.target.style.backgroundColor = BACKGROUND.DEFAULT)}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                color: TEXT.INVERSE
                            }}
                        >
                            {submitting ? (
                                <>
                                    <ButtonLoading size="small" className="mr-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                selectedItem ? "Cập nhật" : "Thêm mới"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicineModal; 