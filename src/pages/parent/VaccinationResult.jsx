import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiClock, FiCalendar, FiMapPin, FiUser, FiShield, FiActivity, FiFileText, FiInfo, FiAward, FiTrendingUp } from "react-icons/fi";
import { PRIMARY, GRAY, SUCCESS, WARNING, ERROR, TEXT, BACKGROUND, BORDER, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import vaccinationScheduleApi from "../../api/VaccinationScheduleApi";
import AlertModal from "../../components/modal/AlertModal";

const VaccinationResult = () => {
    const { id: sessionId } = useParams();
    const location = useLocation();
    const [vaccinationResult, setVaccinationResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [studentId] = useState(location.state?.studentId);

    useEffect(() => {
        if (!sessionId) {
            setError("Không tìm thấy thông tin buổi tiêm chủng");
            setShowAlert(true);
            return;
        }
        fetchVaccinationResult();
    }, [sessionId]);

    const fetchSessionData = async () => {
        const response = await vaccinationScheduleApi.getVaccinationSessionDetails(sessionId);
        if (!response.success) {
            throw new Error(response.message || "Không thể tải thông tin buổi tiêm");
        }
        return response.data;
    };

    const fetchResultData = async (studentId) => {
        if (!studentId) return;
        try {
            const response = await vaccinationScheduleApi.getVaccineResult(sessionId, studentId);
            return response.data;
        } catch (error) {
            return;
        }
    };

    const fetchVaccinationResult = async () => {
        try {
            setLoading(true);
            const finalStudentId = studentId || location.state?.studentId;
            const sessionData = await fetchSessionData();
            const resultData = await fetchResultData(finalStudentId);
            setVaccinationResult({
                ...sessionData,
                ...resultData,
                studentId: finalStudentId,
                scheduledDate: sessionData.startTime,
                administeredDate: resultData.administeredDate || sessionData.startTime
            });
        } catch (error) {
            setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    const formatHour = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const getStatusBadge = (status) => {
        if (status === "completed") {
            return (
                <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                    style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                    <FiCheckCircle className="mr-1.5 h-4 w-4" />
                    Đã hoàn thành
                </span>
            );
        }
        return (
            <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                <FiAlertCircle className="mr-1.5 h-4 w-4" />
                Chưa hoàn thành
            </span>
        );
    };

    const InfoRow = ({ icon: Icon, label, value, color = GRAY[500] }) => (
        <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            <Icon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color }} />
            <div className="flex-1">
                <dt className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                    {label}
                </dt>
                <dd className="text-sm mt-1" style={{ color: TEXT.PRIMARY }}>
                    {value}
                </dd>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách tiêm chủng..." />
            </div>
        );
    }

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

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <AlertModal
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                type="error"
                title="Lỗi tải dữ liệu"
                message={error || "Có lỗi xảy ra khi tải kết quả tiêm chủng."}
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-white via-gray-50 to-white shadow-lg">
                <div className="w-full px-6 py-8">
                    {/* Top Navigation */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-6">
                            <Link
                                to="/parent/vaccination/schedule"
                                className="group flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
                                style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}
                            >
                                <FiArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                                Quay lại danh sách
                            </Link>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Kết quả tiêm chủng
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Báo cáo chi tiết về buổi tiêm chủng đã thực hiện
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                {getStatusBadge(vaccinationResult.vaccinationStatus || vaccinationResult.status || 'completed')}
                            </div>
                        </div>
                    </div>

                    {/* Student Info Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4" style={{ background: `linear-gradient(to right, ${PRIMARY[500]}, ${PRIMARY[600]})` }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                                        <span className="text-2xl font-bold text-white">
                                            {vaccinationResult.studentName?.charAt(0)?.toUpperCase() || 'S'}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {vaccinationResult.studentName || 'Học sinh'}
                                        </h2>
                                        <p className="text-white/80">
                                            Lớp {vaccinationResult.currentClassName || 'N/A'} • Mã số: {vaccinationResult.studentId}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Session Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <FiCalendar className="w-5 h-5 mr-2" style={{ color: PRIMARY[500] }} />
                                <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                    Thông tin buổi tiêm
                                </h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                <div className="space-y-0">
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
                                        label="Ngày tiêm"
                                        value={formatDate(vaccinationResult.scheduledDate)}
                                        color={PRIMARY[500]}
                                    />
                                    <InfoRow
                                        icon={FiClock}
                                        label="Thời gian tiêm"
                                        value={formatHour(vaccinationResult.scheduledDate)}
                                        color={PRIMARY[500]}
                                    />
                                </div>
                                <div className="space-y-0">
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
                                    <InfoRow
                                        icon={FiActivity}
                                        label="Trạng thái buổi tiêm"
                                        value="Đã hoàn thành"
                                        color={PRIMARY[500]}
                                    />
                                    <InfoRow
                                        icon={FiClock}
                                        label="Thời gian kết thúc"
                                        value={formatHour(vaccinationResult.endTime)}
                                        color={PRIMARY[500]}
                                    />
                                </div>
                            </div>

                            {vaccinationResult.notes && (
                                <div className="mt-6 p-4 rounded-lg border-l-4"
                                    style={{ backgroundColor: INFO[50], borderColor: INFO[500] }}>
                                    <div className="flex">
                                        <FiInfo className="w-4 h-4 mr-2 mt-0.5" style={{ color: INFO[500] }} />
                                        <div>
                                            <h4 className="text-sm font-medium mb-1" style={{ color: INFO[700] }}>
                                                Ghi chú buổi tiêm
                                            </h4>
                                            <p className="text-sm" style={{ color: TEXT.PRIMARY }}>
                                                {vaccinationResult.notes}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vaccination Results */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <FiAward className="w-5 h-5 mr-2" style={{ color: SUCCESS[500] }} />
                                <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                    Kết quả tiêm chủng
                                </h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                <div className="space-y-0">
                                    <InfoRow
                                        icon={FiCalendar}
                                        label="Ngày tiêm thực tế"
                                        value={formatDate(vaccinationResult.administeredDate)}
                                        color={SUCCESS[500]}
                                    />
                                    <InfoRow
                                        icon={FiTrendingUp}
                                        label="Số mũi tiêm"
                                        value={`Mũi ${vaccinationResult.doseNumber || 1}`}
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
                                </div>
                                <div className="space-y-0">
                                    <InfoRow
                                        icon={FiFileText}
                                        label="Mã hồ sơ tiêm"
                                        value={vaccinationResult.vaccinationRecordId ? vaccinationResult.vaccinationRecordId.substring(0, 8) + "..." : "Đang cập nhật"}
                                        color={SUCCESS[500]}
                                    />
                                    <InfoRow
                                        icon={FiShield}
                                        label="Mã loại vaccine"
                                        value={vaccinationResult.vaccinationTypeId ? vaccinationResult.vaccinationTypeId.substring(0, 8) + "..." : "Đang cập nhật"}
                                        color={SUCCESS[500]}
                                    />
                                    <InfoRow
                                        icon={FiClock}
                                        label="Thời gian tiêm"
                                        value={new Date(vaccinationResult.administeredDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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

                            {/* Symptoms */}
                            <div className="mt-6 p-4 rounded-lg border-l-4" style={{
                                backgroundColor: (vaccinationResult.symptoms || '').toLowerCase().includes('không') ? SUCCESS[50] : WARNING[50],
                                borderColor: (vaccinationResult.symptoms || '').toLowerCase().includes('không') ? SUCCESS[500] : WARNING[500]
                            }}>
                                <div className="flex">
                                    <FiActivity className="w-4 h-4 mr-2 mt-0.5" style={{
                                        color: (vaccinationResult.symptoms || '').toLowerCase().includes('không') ? SUCCESS[500] : WARNING[500]
                                    }} />
                                    <div>
                                        <h4 className="text-sm font-medium mb-1" style={{
                                            color: (vaccinationResult.symptoms || '').toLowerCase().includes('không') ? SUCCESS[700] : WARNING[700]
                                        }}>
                                            Triệu chứng sau tiêm
                                        </h4>
                                        <p className="text-sm" style={{
                                            color: (vaccinationResult.symptoms || '').toLowerCase().includes('không') ? SUCCESS[700] : WARNING[700]
                                        }}>
                                            {vaccinationResult.symptoms || 'Chưa có thông tin'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: GRAY[50] }}>
                                <div className="flex">
                                    <FiFileText className="w-4 h-4 mr-2 mt-0.5" style={{ color: GRAY[500] }} />
                                    <div>
                                        <h4 className="text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                                            Ghi chú và hướng dẫn sau tiêm
                                        </h4>
                                        <p className="text-sm mb-3" style={{ color: TEXT.PRIMARY }}>
                                            {vaccinationResult.resultNotes || vaccinationResult.notes || 'Kết quả tiêm chủng bình thường'}
                                        </p>
                                        <div className="border-t pt-3" style={{ borderColor: BORDER.DEFAULT }}>
                                            <p className="text-xs font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                                                Lưu ý theo dõi:
                                            </p>
                                            <ul className="space-y-1 text-xs" style={{ color: TEXT.SECONDARY }}>
                                                <li>• Theo dõi tình trạng sức khỏe trong 24-48h đầu</li>
                                                <li>• Liên hệ y tá nếu có biểu hiện bất thường</li>
                                                <li>• Giữ vệ sinh vùng tiêm sạch sẽ</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaccinationResult; 