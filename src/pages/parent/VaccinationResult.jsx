import { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiCalendar,
    FiMapPin,
    FiUser,
    FiShield,
    FiActivity,
    FiFileText,
    FiInfo,
    FiAward,
    FiTrendingUp
} from "react-icons/fi";
import {
    PRIMARY,
    GRAY,
    SUCCESS,
    WARNING,
    ERROR,
    TEXT,
    BACKGROUND,
    BORDER,
    INFO,
    COMMON
} from "../../constants/colors";
import Loading from "../../components/Loading";
import vaccinationScheduleApi from "../../api/VaccinationScheduleApi";
import AlertModal from "../../components/modal/AlertModal";

// Constants
const SYMPTOMS_COLOR_CONFIG = {
    normal: {
        backgroundColor: SUCCESS[50],
        borderColor: SUCCESS[500],
        textColor: SUCCESS[700]
    },
    warning: {
        backgroundColor: WARNING[50],
        borderColor: WARNING[500],
        textColor: WARNING[700]
    }
};


// Helper Components
const InfoRow = ({ icon: Icon, label, value, color = GRAY[500] }) => (
    <div className="flex items-center py-4 px-2">
        <Icon className="w-7 h-7 mr-5 flex-shrink-0" style={{ color }} />
        <div>
            <div className="text-base lg:text-lg font-semibold" style={{ color: TEXT.SECONDARY }}>
                {label}
            </div>
            <div className="text-lg lg:text-2xl font-bold mt-1" style={{ color: TEXT.PRIMARY }}>
                {value}
            </div>
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, iconBgColor, iconColor }) => (
    <div className="flex items-center mb-8">
        <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
            style={{ backgroundColor: iconBgColor }}
        >
            <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
        <div>
            <h2 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                {title}
            </h2>
            <p className="text-gray-500">{subtitle}</p>
        </div>
    </div>
);

const StudentInfoCard = ({ studentName, className, studentId }) => (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12 mb-8">
        <div className="flex items-center gap-8">
            <div style={{ backgroundColor: PRIMARY[500] }} className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-xl flex-shrink-0">
                <span className="text-5xl font-extrabold text-white">
                    {studentName?.charAt(0)?.toUpperCase() || 'S'}
                </span>
            </div>
            <div>
                <div className="text-3xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                    {studentName || 'Học sinh'}
                </div>
                <div className="text-xl text-gray-500">
                    Lớp {className || 'N/A'} • Mã số: {studentId}
                </div>
            </div>
        </div>
    </div>
);

const SymptomsCard = ({ symptoms }) => {
    const hasNoSymptoms = (symptoms || '').toLowerCase().includes('không');
    const config = hasNoSymptoms ? SYMPTOMS_COLOR_CONFIG.normal : SYMPTOMS_COLOR_CONFIG.warning;

    return (
        <div
            className="rounded-3xl border-l-8 p-8"
            style={{
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor
            }}
        >
            <div className="flex items-start">
                <FiActivity
                    className="w-8 h-8 mr-4 mt-1"
                    style={{ color: config.borderColor }}
                />
                <div>
                    <div
                        className="text-xl font-bold mb-2"
                        style={{ color: config.textColor }}
                    >
                        Triệu chứng sau tiêm
                    </div>
                    <div
                        className="text-lg"
                        style={{ color: config.textColor }}
                    >
                        {symptoms || 'Chưa có thông tin'}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotesCard = ({ resultNotes, notes }) => (
    <div className="rounded-3xl border border-gray-200 bg-white p-8">
        <div className="flex items-start">
            <FiFileText className="w-8 h-8 mr-4 mt-1" style={{ color: GRAY[500] }} />
            <div>
                <div className="text-xl font-bold mb-2" style={{ color: TEXT.SECONDARY }}>
                    Ghi chú và hướng dẫn sau tiêm
                </div>
                <div className="text-lg mb-4" style={{ color: TEXT.PRIMARY }}>
                    {resultNotes || notes || 'Kết quả tiêm chủng bình thường'}
                </div>
                <div className="border-t pt-4" style={{ borderColor: BORDER.DEFAULT }}>
                    <div className="text-base font-semibold mb-3" style={{ color: TEXT.SECONDARY }}>
                        Lưu ý theo dõi:
                    </div>
                    <ul className="space-y-2 text-base" style={{ color: TEXT.SECONDARY }}>
                        <li>• Theo dõi tình trạng sức khỏe trong 24-48h đầu</li>
                        <li>• Liên hệ y tá nếu có biểu hiện bất thường</li>
                        <li>• Giữ vệ sinh vùng tiêm sạch sẽ</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

const SessionNotesCard = ({ notes }) => {
    if (!notes) return null;

    return (
        <div
            className="rounded-3xl border-l-8 p-8"
            style={{ backgroundColor: INFO[50], borderColor: INFO[500] }}
        >
            <div className="flex items-start">
                <FiInfo className="w-8 h-8 mr-4 mt-1" style={{ color: INFO[500] }} />
                <div>
                    <div className="text-xl font-bold mb-2" style={{ color: INFO[700] }}>
                        Ghi chú buổi tiêm
                    </div>
                    <div className="text-lg" style={{ color: TEXT.PRIMARY }}>
                        {notes}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Component
const VaccinationResult = () => {
    const { id: sessionId } = useParams();
    const location = useLocation();
    const [vaccinationResult, setVaccinationResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [studentId] = useState(location.state?.studentId);
    const navigate = useNavigate();

    // Helper Functions
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatHour = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fetchSessionData = async () => {
        const response = await vaccinationScheduleApi.getVaccinationSessionDetails(sessionId);
        if (!response.success) {
            throw new Error(response.message || "Không thể tải thông tin buổi tiêm");
        }
        return response.data;
    };

    const fetchResultData = async (studentId) => {
        if (!studentId) return null;
        try {
            const response = await vaccinationScheduleApi.getVaccineResult(sessionId, studentId);
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch result data:', error);
            return null;
        }
    };

    const fetchVaccinationResult = async () => {
        try {
            setLoading(true);
            const finalStudentId = studentId || location.state?.studentId;

            const [sessionData, resultData] = await Promise.all([
                fetchSessionData(),
                fetchResultData(finalStudentId)
            ]);

            setVaccinationResult({
                ...sessionData,
                ...resultData,
                studentId: finalStudentId,
                scheduledDate: sessionData.startTime,
                administeredDate: resultData?.administeredDate || sessionData.startTime
            });
        } catch (error) {
            setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        if (!sessionId) {
            setError("Không tìm thấy thông tin buổi tiêm chủng");
            setShowAlert(true);
            return;
        }
        fetchVaccinationResult();
    }, [sessionId]);

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải kết quả tiêm chủng..." />
            </div>
        );
    }

    // Error State
    if (!vaccinationResult) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="w-full px-4 py-8 lg:py-16">
                    <div className="text-center py-12 lg:py-20 rounded-2xl lg:rounded-3xl" style={{ backgroundColor: GRAY[50] }}>
                        <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6" style={{ backgroundColor: GRAY[300] }}>
                            <FiAlertCircle className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
                        </div>
                        <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4" style={{ color: TEXT.PRIMARY }}>
                            Không tìm thấy kết quả tiêm chủng
                        </h3>
                        <p className="text-base lg:text-lg mb-4 lg:mb-6 px-4" style={{ color: TEXT.SECONDARY }}>
                            Thông tin kết quả tiêm chủng không tồn tại hoặc đã bị xóa.
                        </p>
                        <Link
                            to="/parent/vaccination/schedule"
                            className="group flex items-center px-4 py-2 font-semibold text-sm rounded-lg border transition-all duration-300 hover:scale-105 mx-auto w-max"
                            style={{ borderColor: PRIMARY[500], color: PRIMARY[600], backgroundColor: 'white' }}
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                            Quay lại lịch tiêm chủng
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Main Render
    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <AlertModal
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                type="error"
                title="Lỗi tải dữ liệu"
                message={error || "Có lỗi xảy ra khi tải kết quả tiêm chủng."}
            />

            {/* Header Section */}
            <div style={{ backgroundColor: PRIMARY[500] }} className="w-full py-12 lg:py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                            style={{ color: COMMON.WHITE }}
                        >
                            <FiArrowLeft className="w-5 h-5 mr-3" />
                            Quay lại
                        </button>
                        <h1 className="text-3xl lg:text-5xl font-extrabold" style={{ color: COMMON.WHITE }}>
                            Chi tiết & Kết quả tiêm chủng
                        </h1>
                        <div className="w-32"></div>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <p className="text-lg lg:text-xl mb-6 max-w-2xl" style={{ color: COMMON.WHITE }}>
                            Báo cáo chi tiết về buổi tiêm chủng đã thực hiện
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full py-8 lg:py-12">
                <div className="container mx-auto px-4 lg:px-8">
                    {/* Student Info */}
                    <StudentInfoCard
                        studentName={vaccinationResult.studentName}
                        className={vaccinationResult.className}
                        studentId={vaccinationResult.studentId}
                    />

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Session Information */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-10">
                            <SectionHeader
                                icon={FiCalendar}
                                title="Thông tin buổi tiêm"
                                subtitle="Chi tiết về buổi tiêm chủng"
                                iconBgColor="rgb(239 246 255)"
                                iconColor={PRIMARY[500]}
                            />
                            <div className="space-y-6">
                                <InfoRow
                                    icon={FiFileText}
                                    label="Tên buổi tiêm"
                                    value={vaccinationResult.sessionName || 'Buổi tiêm chủng'}
                                    color={PRIMARY[500]}
                                />
                                <InfoRow
                                    icon={FiShield}
                                    label="Loại vaccine"
                                    value={vaccinationResult.vaccinationTypeName || vaccinationResult.vaccineTypeName || 'Vaccine không xác định'}
                                    color={PRIMARY[500]}
                                />
                                <InfoRow
                                    icon={FiCalendar}
                                    label="Ngày tiêm dự kiến"
                                    value={formatDate(vaccinationResult.scheduledDate)}
                                    color={PRIMARY[500]}
                                />
                                <InfoRow
                                    icon={FiClock}
                                    label="Giờ tiêm dự kiến"
                                    value={formatHour(vaccinationResult.scheduledDate)}
                                    color={PRIMARY[500]}
                                />
                                <InfoRow
                                    icon={FiMapPin}
                                    label="Địa điểm"
                                    value={vaccinationResult.location || 'Phòng y tế trường'}
                                    color={PRIMARY[500]}
                                />
                                <InfoRow
                                    icon={FiUser}
                                    label="Đơn vị phụ trách"
                                    value={vaccinationResult.responsibleOrganizationName || 'Bác sĩ trường'}
                                    color={PRIMARY[500]}
                                />
                            </div>
                        </div>

                        {/* Vaccination Results */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-10">
                            <SectionHeader
                                icon={FiAward}
                                title="Kết quả tiêm chủng"
                                subtitle="Thông tin về kết quả thực hiện"
                                iconBgColor="rgb(240 253 244)"
                                iconColor={SUCCESS[500]}
                            />
                            <div className="space-y-6">
                                <InfoRow
                                    icon={FiActivity}
                                    label="Trạng thái buổi tiêm"
                                    value="Đã hoàn thành"
                                    color={SUCCESS[500]}
                                />
                                <InfoRow
                                    icon={FiClock}
                                    label="Giờ kết thúc"
                                    value={formatHour(vaccinationResult.endTime)}
                                    color={SUCCESS[500]}
                                />
                                <InfoRow
                                    icon={FiTrendingUp}
                                    label="Số mũi tiêm"
                                    value={`${vaccinationResult.doseNumber || 1} mũi`}
                                    color={SUCCESS[500]}
                                />
                                <InfoRow
                                    icon={FiUser}
                                    label="Người thực hiện"
                                    value={vaccinationResult.administeredBy || 'Đang cập nhật'}
                                    color={SUCCESS[500]}
                                />
                                <InfoRow
                                    icon={FiShield}
                                    label="Số lô vaccine"
                                    value={vaccinationResult.batchNumber || 'Đang cập nhật'}
                                    color={SUCCESS[500]}
                                />
                                <InfoRow
                                    icon={FiCheckCircle}
                                    label="Trạng thái tiêm"
                                    value={vaccinationResult.vaccinationStatus || vaccinationResult.status || 'Hoàn thành'}
                                    color={SUCCESS[500]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <SymptomsCard symptoms={vaccinationResult.symptoms} />
                        <NotesCard
                            resultNotes={vaccinationResult.resultNotes}
                            notes={vaccinationResult.notes}
                        />
                    </div>

                    {/* Session Notes */}
                    <SessionNotesCard notes={vaccinationResult.notes} />
                </div>
            </div>
        </div>
    );
};

export default VaccinationResult; 