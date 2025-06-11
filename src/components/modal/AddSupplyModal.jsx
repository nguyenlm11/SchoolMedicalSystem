import React from "react";
import { FiX, FiBox } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from "../../constants/colors";
import { ButtonLoading } from "../Loading";

const AddSupplyModal = ({ isOpen, onClose, onSubmit, itemForm, selectedItem, formErrors, submitting, onInputChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
            >
                <div className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </div>

                <div
                    className="inline-block align-bottom rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    style={{ backgroundColor: BACKGROUND.DEFAULT }}
                >
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div
                                    className="h-12 w-12 rounded-xl flex items-center justify-center mr-4"
                                    style={{ backgroundColor: PRIMARY[100] }}
                                >
                                    <FiBox className="h-6 w-6" style={{ color: PRIMARY[600] }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {selectedItem ? "Chỉnh sửa vật tư y tế" : "Thêm vật tư y tế mới"}
                                    </h3>
                                    <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                        {selectedItem ? "Cập nhật thông tin vật tư y tế" : "Nhập thông tin vật tư y tế mới"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                style={{ backgroundColor: GRAY[100], color: GRAY[500] }}
                                disabled={submitting}
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Tên vật tư y tế <span style={{ color: ERROR[500] }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={itemForm.name}
                                    onChange={onInputChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${formErrors.name ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'
                                        }`}
                                    style={{
                                        borderColor: formErrors.name ? ERROR[400] : BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT
                                    }}
                                    placeholder="Nhập tên vật tư y tế..."
                                    disabled={submitting}
                                />
                                {formErrors.name && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Loại vật tư
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={itemForm.category}
                                    onChange={onInputChange}
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT
                                    }}
                                    placeholder="Nhập loại vật tư y tế..."
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={itemForm.description}
                                    onChange={onInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT
                                    }}
                                    placeholder="Nhập mô tả vật tư y tế..."
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                    Số lượng trong kho <span style={{ color: ERROR[500] }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="stockQuantity"
                                    value={itemForm.stockQuantity}
                                    onChange={onInputChange}
                                    min="0"
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${formErrors.stockQuantity ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'
                                        }`}
                                    style={{
                                        borderColor: formErrors.stockQuantity ? ERROR[400] : BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT
                                    }}
                                    placeholder="Nhập số lượng..."
                                    disabled={submitting}
                                />
                                {formErrors.stockQuantity && (
                                    <p className="text-sm mt-1" style={{ color: ERROR[500] }}>
                                        {formErrors.stockQuantity}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={itemForm.isActive}
                                        onChange={onInputChange}
                                        className="form-checkbox h-5 w-5 rounded focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                        style={{ color: PRIMARY[500] }}
                                        disabled={submitting}
                                    />
                                    <span className="ml-3 font-medium" style={{ color: TEXT.PRIMARY }}>
                                        Vật tư y tế đang được sử dụng
                                    </span>
                                </label>
                                <p className="text-xs mt-1 ml-8" style={{ color: TEXT.SECONDARY }}>
                                    Bỏ tích nếu vật tư y tế này tạm thời ngừng sử dụng
                                </p>
                            </div>
                        </form>
                    </div>

                    <div
                        className="px-6 py-4 flex justify-end space-x-3 border-t"
                        style={{
                            backgroundColor: GRAY[25] || '#fafafa',
                            borderColor: BORDER.LIGHT
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border rounded-xl font-medium transition-all duration-200 hover:scale-105"
                            style={{
                                borderColor: BORDER.DEFAULT,
                                color: TEXT.SECONDARY,
                                backgroundColor: BACKGROUND.DEFAULT
                            }}
                            disabled={submitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            onClick={onSubmit}
                            className="flex items-center px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                            style={{
                                background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                color: TEXT.INVERSE
                            }}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <ButtonLoading size="small" className="mr-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>{selectedItem ? "Cập nhật" : "Thêm mới"}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSupplyModal; 