import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { PRIMARY, GRAY, ERROR, SUCCESS, WARNING, TEXT, BACKGROUND } from "../../constants/colors";
import Loading from "../../components/Loading";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AlertModal from "../../components/modal/AlertModal";
import userApi from "../../api/userApi";
import healthCheckApi from "../../api/healthCheckApi";

const HealthCheckDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const [healthCheck, setHealthCheck] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [consentGiven, setConsentGiven] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("info");
    const [consentStatus, setConsentStatus] = useState(null);
    const [consentData, setConsentData] = useState(null);
    const [studentLoading, setStudentLoading] = useState(true);

    const studentIdFromState = location.state?.studentId;

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };
    const formatDateTime = (dateString) => {
        if (!dateString) return { date: "", time: "" };
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('vi-VN'),
            time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (!id) {
                    setLoading(false);
                    return;
                }
                const response = await healthCheckApi.getHealthCheckPlanDetails(id);
                if (response.success) {
                    setHealthCheck(response.data);
                    setConsentStatus(response.data.status);
                } else {
                    setConsentStatus("Pending");
                }
            } catch (error) {
                setConsentStatus("Pending");
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const fetchStudent = async () => {
            if (!studentIdFromState) {
                setStudentLoading(false);
                return;
            }
            try {
                setStudentLoading(true);
                const response = await userApi.getStudentById(studentIdFromState);
                if (response.success) {
                    setStudent(response.data);
                }
            } catch (err) {
                // ignore
            } finally {
                setStudentLoading(false);
            }
        };
        fetchStudent();
    }, [studentIdFromState]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (consentGiven !== null) {
            setShowConfirmModal(true);
        } else {
            setAlertMessage("Vui lòng chọn đồng ý hoặc không đồng ý");
            setAlertType("warning");
            setShowAlertModal(true);
        }
    };

    // No real consent API, just simulate
    const handleConfirmSubmission = async () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setConsentStatus(consentGiven ? "Confirmed" : "Declined");
            setAlertMessage(
                consentGiven
                    ? `Phiếu đồng ý khám sức khỏe cho ${student?.fullName} đã được gửi thành công.`
                    : `Phiếu từ chối khám sức khỏe cho ${student?.fullName} đã được ghi nhận.`
            );
            setAlertType("success");
            setShowAlertModal(true);
            setShowConfirmModal(false);
            setIsSubmitting(false);
        }, 1200);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải chi tiết buổi khám sức khỏe..." />
            </div>
        );
    }

    if (!healthCheck) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <FiAlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: ERROR[500] }} />
                    <h2 className="text-2xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                        Không tìm thấy thông tin
                    </h2>
                    <p className="text-lg mb-6" style={{ color: TEXT.SECONDARY }}>
                        Buổi khám sức khỏe không tồn tại hoặc đã bị xóa.
                    </p>
                    <Link
                        to="/parent/health-schedule"
                        className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300"
                        style={{ backgroundColor: PRIMARY[500] }}
                    >
                        <FiArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="w-full px-6 lg:px-12 xl:px-16">
                <div className="bg-white shadow-lg border border-gray-300 w-full" style={{ fontFamily: 'Times, serif' }}>
                    <div className="text-center border-b-2 border-black p-8">
                        <div className="mb-4">
                            <h1 className="text-3xl font-bold uppercase tracking-wide">TRƯỜNG TIỂU HỌC ABC</h1>
                            <p className="text-lg mt-2">123 Đường XYZ, Quận 1, TP. Hồ Chí Minh</p>
                            <p className="text-lg">Điện thoại: (028) 1234-5678 | Email: info@tieuhocabc.edu.vn</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="text-left">
                                <p className="text-lg">Số: {String(healthCheck.id).padStart(4, '0')}/2025/PHKH-SK</p>
                                <p className="text-lg">Ngày: {formatDate(healthCheck.scheduledDate)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center py-8">
                        <h2 className="text-5xl font-bold uppercase tracking-wider">PHIẾU ĐỒNG Ý KHÁM SỨC KHỎE</h2>
                        <p className="text-2xl mt-4 italic">{healthCheck.title || "Đang tải..."}</p>
                    </div>

                    <div className="px-12 pb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            <div className="space-y-8">
                                {/* I. THÔNG TIN HỌC SINH */}
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">I. THÔNG TIN HỌC SINH</h3>
                                    {studentLoading ? (
                                        <div className="py-6"><Loading type="medical" size="medium" color="primary" text="Đang tải thông tin học sinh..." /></div>
                                    ) : student ? (
                                        <div className="space-y-4 text-xl">
                                            <div className="flex">
                                                <span className="font-semibold w-40">Họ và tên:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student.fullName}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8">
                                                <div className="flex">
                                                    <span className="font-semibold w-20">Lớp:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student.currentClassName}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="font-semibold w-24">Mã HS:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student.studentCode}</span>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Ngày sinh:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student.dateOfBirth ? formatDate(student.dateOfBirth) : ""}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Phụ huynh:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student.parentName}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-lg" style={{ color: GRAY[500] }}>Không có thông tin học sinh.</div>
                                    )}
                                </div>

                                {/* II. THÔNG TIN BUỔI KHÁM */}
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">II. THÔNG TIN BUỔI KHÁM</h3>
                                    <div className="space-y-4 text-xl">
                                        <div className="flex">
                                            <span className="font-semibold w-40">Tên buổi khám:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{healthCheck.title}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="font-semibold w-40">Ngày khám:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{formatDate(healthCheck.scheduledDate)}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-8">
                                            <div className="flex items-center">
                                                <span className="font-semibold mr-3">Giờ bắt đầu:</span>
                                                <span className="border-b border-dotted border-gray-400 pb-1" style={{ width: 258, display: 'inline-block', textAlign: 'center' }}>{healthCheck.startTime ? formatDateTime(healthCheck.startTime).time : "--"}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold mr-3">Giờ kết thúc:</span>
                                                <span className="border-b border-dotted border-gray-400 pb-1" style={{ width: 258, display: 'inline-block', textAlign: 'center' }}>{healthCheck.endTime ? formatDateTime(healthCheck.endTime).time : "--"}</span>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <span className="font-semibold w-40">Địa điểm:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{healthCheck.location}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="font-semibold w-40">Đơn vị phụ trách:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{healthCheck.responsibleOrganizationName}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="font-semibold w-40">Ghi chú:</span>
                                            <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{healthCheck.notes || "Không có ghi chú đặc biệt"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* III. THÔNG TIN CHI TIẾT */}
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">III. THÔNG TIN CHI TIẾT</h3>
                                    <div className="space-y-4 text-xl">
                                        {healthCheck.healthCheckItems && healthCheck.healthCheckItems.length > 0 ? (
                                            <table className="w-full border rounded-xl overflow-hidden">
                                                <thead style={{ backgroundColor: PRIMARY[50] }}>
                                                    <tr>
                                                        <th className="py-2 px-4 text-left font-semibold" style={{ color: TEXT.PRIMARY }}>Hạng mục</th>
                                                        <th className="py-2 px-4 text-left font-semibold" style={{ color: TEXT.PRIMARY }}>Mô tả</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {healthCheck.healthCheckItems.map((item) => (
                                                        <tr key={item.id} className="border-b last:border-b-0">
                                                            <td className="py-2 px-4 font-medium" style={{ color: TEXT.PRIMARY }}>{item.name}</td>
                                                            <td className="py-2 px-4" style={{ color: TEXT.SECONDARY }}>{item.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-center text-lg" style={{ color: GRAY[500] }}>
                                                Không có hạng mục khám nào.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* IV. PHẦN ĐỒNG Ý CỦA PHỤ HUYNH */}
                            <div>
                                <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">IV. PHẦN ĐỒNG Ý CỦA PHỤ HUYNH</h3>

                                <div className="space-y-6 text-xl">
                                    <p>
                                        Tôi, <span className="font-bold border-b border-dotted border-gray-400 px-2">{student?.parentName || "Đang tải..."}</span>,
                                        là phụ huynh/người giám hộ của học sinh <span className="font-bold border-b border-dotted border-gray-400 px-2">{student?.fullName || "Đang tải..."}</span>,
                                        số điện thoại: <span className="border-b border-dotted border-gray-400 px-2">{student?.parentPhone || "Đang tải..."}</span>
                                    </p>

                                    <p className="font-semibold text-xl">Sau khi đã được tư vấn đầy đủ về buổi khám sức khỏe, tôi:</p>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="pl-4 space-y-4">
                                            <label className="flex items-start cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="consent"
                                                    className="mr-4 mt-2"
                                                    style={{ accentColor: PRIMARY[500], transform: 'scale(1.5)' }}
                                                    onChange={() => setConsentGiven(true)}
                                                    checked={consentGiven === true}
                                                    disabled={consentStatus !== "WaitingForParentConsent"}
                                                />
                                                <div className="flex-1">
                                                    <span className="font-semibold text-xl">ĐỒNG Ý</span>
                                                    <span className="text-xl"> cho con tôi tham gia buổi khám sức khỏe này.</span>
                                                </div>
                                            </label>

                                            <label className="flex items-start cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="consent"
                                                    className="mr-4 mt-2"
                                                    style={{ accentColor: GRAY[500], transform: 'scale(1.5)' }}
                                                    onChange={() => setConsentGiven(false)}
                                                    checked={consentGiven === false}
                                                    disabled={consentStatus !== "WaitingForParentConsent"}
                                                />
                                                <div className="flex-1">
                                                    <span className="font-semibold text-xl">KHÔNG ĐỒNG Ý</span>
                                                    <span className="text-xl"> cho con tôi tham gia buổi khám sức khỏe này.</span>
                                                </div>
                                            </label>
                                        </div>

                                        {consentGiven === true && consentStatus === "WaitingForParentConsent" && (
                                            <div className="border border-gray-300 p-6 bg-gray-50">
                                                <p className="font-semibold mb-3 text-xl">Tôi cam kết:</p>
                                                <ul className="list-disc pl-8 space-y-2 text-lg">
                                                    <li>Đã cung cấp thông tin chính xác về tình trạng sức khỏe của con</li>
                                                    <li>Tôi đã đọc và hiểu thông tin về buổi khám sức khỏe.</li>
                                                    <li>Con tôi không có chống chỉ định tham gia buổi khám này</li>
                                                    <li>Tôi đồng ý cho phép nhà trường và nhân viên y tế tiến hành kiểm tra sức khỏe cho con tôi.</li>
                                                </ul>
                                            </div>
                                        )}

                                        {consentStatus === "Confirmed" && (
                                            <div className="border border-gray-300 p-6 bg-gray-50">
                                                <p className="font-semibold mb-3 text-xl">Phụ huynh đã cam kết:</p>
                                                <ul className="list-disc pl-8 space-y-2 text-lg">
                                                    <li>Đã cung cấp thông tin chính xác về tình trạng sức khỏe của con</li>
                                                    <li>Đã đọc và hiểu thông tin về buổi khám sức khỏe.</li>
                                                    <li>Con em không có chống chỉ định tham gia buổi khám này</li>
                                                    <li>Đồng ý cho phép nhà trường và nhân viên y tế tiến hành kiểm tra sức khỏe cho con em.</li>
                                                </ul>
                                            </div>
                                        )}

                                        <div className="text-center pt-6 border-t border-gray-300">
                                            <p className="text-lg font-semibold mb-2">Phụ huynh xác nhận:</p>
                                            <p className="text-xl font-bold" style={{ color: PRIMARY[700] }}>
                                                {student?.parentName || "Đang tải..."}
                                            </p>
                                        </div>

                                        {consentStatus === "WaitingForParentConsent" && (
                                            <div className="text-center pt-8">
                                                <button
                                                    type="submit"
                                                    className="px-12 py-4 text-xl font-semibold text-white rounded-lg transition-all duration-300 hover:opacity-90"
                                                    style={{ backgroundColor: PRIMARY[500] }}
                                                >
                                                    Xác nhận và Gửi Phiếu
                                                </button>
                                            </div>
                                        )}

                                        {(consentStatus === "Confirmed" || consentStatus === "Declined") && (
                                            <div className="text-center pt-8">
                                                <div className="inline-flex items-center px-8 py-3 rounded-lg text-lg font-semibold"
                                                    style={{
                                                        backgroundColor: consentStatus === "Confirmed" ? PRIMARY[100] : GRAY[100],
                                                        color: consentStatus === "Confirmed" ? PRIMARY[700] : GRAY[700]
                                                    }}>
                                                    {consentStatus === "Confirmed" ? (
                                                        <>
                                                            <FiCheckCircle className="w-5 h-5 mr-2" />
                                                            Đã xác nhận đồng ý khám sức khỏe
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiAlertCircle className="w-5 h-5 mr-2" />
                                                            Đã xác nhận từ chối khám sức khỏe
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-base italic pt-8 border-t border-gray-300 mt-8">
                            <p>Phiếu này có hiệu lực khi được xác nhận trực tuyến</p>
                            <p className="mt-2">Mọi thắc mắc xin liên hệ phòng y tế trường: (028) 1234-5678</p>
                        </div>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmSubmission}
                    title={consentGiven ? "Xác nhận đồng ý khám sức khỏe" : "Xác nhận từ chối khám sức khỏe"}
                    message={consentGiven ? `Bạn đồng ý cho ${student?.fullName} tham gia buổi khám sức khỏe vào ngày ${healthCheck?.scheduledDate ? formatDate(healthCheck.scheduledDate) : "..."}?` : `Bạn xác nhận từ chối cho ${student?.fullName} tham gia buổi khám sức khỏe này?`}
                    confirmText="Xác nhận gửi"
                    cancelText="Kiểm tra lại"
                    type={consentGiven ? "success" : "warning"}
                    confirmButtonColor={PRIMARY[500]}
                    isLoading={isSubmitting}
                />

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    title="Thông báo"
                    message={alertMessage}
                    type={alertType}
                    okText="Đã hiểu"
                />
            </div>
        </div>
    );
};

export default HealthCheckDetail;
