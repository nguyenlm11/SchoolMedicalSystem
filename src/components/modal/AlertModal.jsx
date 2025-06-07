import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";
import { PRIMARY, GRAY, WARNING, ERROR, TEXT, SHADOW } from "../../constants/colors";

const AlertModal = ({ isOpen, onClose, title = "Thông báo", message = "", type = "info", okText = "OK" }) => {
    if (!isOpen) return null;
    const getIcon = () => {
        switch (type) {
            case "success":
                return <FiCheckCircle className="w-8 h-8" style={{ color: PRIMARY[500] }} />;
            case "warning":
                return <FiAlertTriangle className="w-8 h-8" style={{ color: WARNING[500] }} />;
            case "error":
                return <FiAlertCircle className="w-8 h-8" style={{ color: ERROR[500] }} />;
            default:
                return <FiInfo className="w-8 h-8" style={{ color: PRIMARY[500] }} />;
        }
    };

    const getThemeColors = () => {
        switch (type) {
            case "warning":
                return {
                    iconBg: WARNING[50],
                    buttonBg: WARNING[500],
                    buttonHover: WARNING[600]
                };
            case "error":
                return {
                    iconBg: ERROR[50],
                    buttonBg: ERROR[500],
                    buttonHover: ERROR[600]
                };
            default:
                return {
                    iconBg: PRIMARY[50],
                    buttonBg: PRIMARY[500],
                    buttonHover: PRIMARY[600]
                };
        }
    };

    const themeColors = getThemeColors();
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
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ boxShadow: `0 25px 50px -12px ${SHADOW.DARK}, 0 0 0 1px ${GRAY[100]}` }}
            >
                <div
                    className="absolute top-0 left-0 right-0"
                    style={{ background: `linear-gradient(90deg, ${themeColors.buttonBg}, ${themeColors.buttonHover})` }}
                />
                <div className="flex items-center justify-between p-8 pb-6">
                    <div className="flex items-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mr-4"
                            style={{ backgroundColor: themeColors.iconBg }}
                        >
                            {getIcon()}
                        </div>
                        <h3 className="text-xl font-bold" style={{ color: TEXT.PRIMARY }}>{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:scale-95"
                        style={{ color: GRAY[600] }}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-8 pb-6">
                    <p className="text-base leading-relaxed" style={{ color: TEXT.SECONDARY }}>{message}</p>
                </div>
                <div
                    className="px-8 py-6 border-t"
                    style={{ backgroundColor: GRAY[50], borderTopColor: GRAY[100] }}
                >
                    <button
                        onClick={onClose}
                        className="w-full py-4 px-6 text-base font-semibold text-white rounded-2xl transition-all duration-200 hover:opacity-90 active:scale-98 focus:outline-none focus:ring-4 focus:ring-opacity-20"
                        style={{ backgroundColor: themeColors.buttonBg, focusRingColor: themeColors.buttonBg + '50' }}
                        autoFocus
                    >
                        {okText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal; 