import { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiClock, FiCalendar, FiMapPin, FiUser, FiShield, FiFileText, FiHome } from "react-icons/fi";
import { PRIMARY, GRAY, SUCCESS, WARNING, TEXT, BACKGROUND } from "../../constants/colors";
import Loading from "../../components/Loading";
import vaccinationScheduleApi from "../../api/VaccinationScheduleApi";

const InfoCard = ({ icon: Icon, title, value, color = PRIMARY[500], bgColor = PRIMARY[50] }) => (
    <div className="flex items-center p-4 rounded-xl border" style={{ backgroundColor: bgColor, borderColor: GRAY[200] }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: color + '20' }}>
            <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1">
            <div className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>{title}</div>
            <div className="text-base font-semibold mt-1" style={{ color: TEXT.PRIMARY }}>{value}</div>
        </div>
    </div>
);

const StatusBadge = ({ children }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
        style={{ backgroundColor: SUCCESS[100], color: SUCCESS[700] }}>
        <FiCheckCircle className="w-4 h-4 mr-2" />
        {children}
    </span>
);

const SectionCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl border p-6 ${className}`} style={{ borderColor: GRAY[200] }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>{title}</h3>
        {children}
    </div>
);

const VaccinationResult = () => {
    const { id: sessionId } = useParams();
    const location = useLocation();
    const [vaccinationResult, setVaccinationResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [studentId] = useState(location.state?.studentId);
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    };

    const formatHour = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
            return;
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

    useEffect(() => {
        if (!sessionId) {
            setError("Không tìm thấy thông tin buổi tiêm chủng");
            setShowAlert(true);
            return;
        }
        fetchVaccinationResult();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải kết quả tiêm chủng..." />
            </div>
        );
    }

    if (!vaccinationResult) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: GRAY[200] }}>
                        <FiAlertCircle className="w-8 h-8" style={{ color: GRAY[500] }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                        Không tìm thấy kết quả
                    </h3>
                    <p className="text-sm mb-6" style={{ color: TEXT.SECONDARY }}>
                        Thông tin kết quả tiêm chủng không tồn tại hoặc đã bị xóa.
                    </p>
                    <Link
                        to="/parent/vaccination/schedule"
                        className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200"
                        style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                    >
                        <FiHome className="w-4 h-4 mr-2" />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="bg-white border-b" style={{ borderColor: GRAY[200] }}>
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-gray-100"
                            style={{ color: TEXT.PRIMARY }}
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                        </button>
                        <h1 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>
                            Kết quả tiêm chủng
                        </h1>
                        <StatusBadge status="completed">Đã hoàn thành</StatusBadge>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: GRAY[200] }}>
                    <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: PRIMARY[500] }}>
                            <span className="text-2xl font-bold text-white">
                                {vaccinationResult.studentName?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-1" style={{ color: TEXT.PRIMARY }}>
                                {vaccinationResult.studentName || 'Học sinh'}
                            </h2>
                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                Lớp {vaccinationResult.className} • Mã số: {vaccinationResult.studentId}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <InfoCard
                        icon={FiFileText}
                        title="Buổi tiêm"
                        value={vaccinationResult.sessionName || 'Buổi tiêm chủng'}
                    />
                    <InfoCard
                        icon={FiShield}
                        title="Loại vaccine"
                        value={vaccinationResult.vaccinationTypeName || vaccinationResult.vaccineTypeName || 'Không xác định'}
                    />
                    <InfoCard
                        icon={FiCalendar}
                        title="Ngày tiêm"
                        value={formatDate(vaccinationResult.scheduledDate)}
                    />
                    <InfoCard
                        icon={FiClock}
                        title="Giờ tiêm"
                        value={formatHour(vaccinationResult.scheduledDate)}
                    />
                    <InfoCard
                        icon={FiMapPin}
                        title="Địa điểm"
                        value={vaccinationResult.location || 'Phòng y tế trường'}
                    />
                    <InfoCard
                        icon={FiUser}
                        title="Người thực hiện"
                        value={vaccinationResult.administeredBy || 'Đang cập nhật'}
                        color={SUCCESS[500]}
                        bgColor={SUCCESS[50]}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SectionCard title="Chi tiết tiêm chủng">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: GRAY[100] }}>
                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>Trạng thái</span>
                                <StatusBadge status="completed">Hoàn thành</StatusBadge>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: GRAY[100] }}>
                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>Số mũi tiêm</span>
                                <span className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                    {vaccinationResult.doseNumber || 1} mũi
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: GRAY[100] }}>
                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>Số lô vaccine</span>
                                <span className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                    {vaccinationResult.batchNumber || 'Đang cập nhật'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>Giờ kết thúc</span>
                                <span className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                    {formatHour(vaccinationResult.endTime)}
                                </span>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Triệu chứng & Ghi chú">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                                    Triệu chứng sau tiêm
                                </div>
                                <div className="p-3 rounded-lg text-sm" style={{
                                    backgroundColor: (vaccinationResult.symptoms || '').toLowerCase().includes('không') ? SUCCESS[50] : WARNING[50],
                                    color: (vaccinationResult.symptoms || '').toLowerCase().includes('không') ? SUCCESS[700] : WARNING[700]
                                }}>
                                    {vaccinationResult.symptoms || 'Không có triệu chứng bất thường'}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                                    Ghi chú
                                </div>
                                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: GRAY[50], color: TEXT.PRIMARY }}>
                                    {vaccinationResult.resultNotes || vaccinationResult.notes || 'Kết quả tiêm chủng bình thường'}
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                <SectionCard title="Hướng dẫn theo dõi" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: PRIMARY[100] }}>
                                <FiClock className="w-4 h-4" style={{ color: PRIMARY[600] }} />
                            </div>
                            <div>
                                <div className="font-medium text-sm mb-1" style={{ color: TEXT.PRIMARY }}>Theo dõi 24-48h</div>
                                <div className="text-xs" style={{ color: TEXT.SECONDARY }}>Quan sát tình trạng sức khỏe</div>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: WARNING[100] }}>
                                <FiAlertCircle className="w-4 h-4" style={{ color: WARNING[600] }} />
                            </div>
                            <div>
                                <div className="font-medium text-sm mb-1" style={{ color: TEXT.PRIMARY }}>Liên hệ y tá</div>
                                <div className="text-xs" style={{ color: TEXT.SECONDARY }}>Nếu có biểu hiện bất thường</div>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: SUCCESS[100] }}>
                                <FiShield className="w-4 h-4" style={{ color: SUCCESS[600] }} />
                            </div>
                            <div>
                                <div className="font-medium text-sm mb-1" style={{ color: TEXT.PRIMARY }}>Giữ vệ sinh</div>
                                <div className="text-xs" style={{ color: TEXT.SECONDARY }}>Vùng tiêm sạch sẽ</div>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default VaccinationResult; 