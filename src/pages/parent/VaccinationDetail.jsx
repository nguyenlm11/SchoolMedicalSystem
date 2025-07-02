import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { PRIMARY, GRAY, ERROR, TEXT, BACKGROUND } from "../../constants/colors";
import Loading from "../../components/Loading";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AlertModal from "../../components/modal/AlertModal";
import userApi from "../../api/userApi";
import vaccinationScheduleApi from "../../api/VaccinationScheduleApi";

const VaccinationDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const [vaccination, setVaccination] = useState(null);
    const [vaccinationSession, setVaccinationSession] = useState(null);
    const [vaccineType, setVaccineType] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [consentGiven, setConsentGiven] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [consentStatus, setConsentStatus] = useState(null);
    const [consentData, setConsentData] = useState(null);

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
                const studentIdFromState = location.state?.studentId;
                const finalStudentId = studentIdFromState || "14ac1093-8387-4485-b2c9-0b3f91c2b5dd";
                // Fetch vaccination session details
                const sessionResponse = await vaccinationScheduleApi.getVaccinationSessionDetails(id);
                if (sessionResponse.success) {
                    const sessionData = sessionResponse.data;
                    setVaccinationSession(sessionData);
                    setVaccination({
                        id: parseInt(id),
                        studentId: finalStudentId,
                        vaccinationSessionId: id,
                        status: sessionData.status || "scheduled",
                        createdDate: sessionData.createdDate ? new Date(sessionData.createdDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')
                    });
                    if (sessionData.vaccineTypeId) {
                        const vaccineTypeResponse = await vaccinationScheduleApi.getVaccineTypeDetails(sessionData.vaccineTypeId);
                        if (vaccineTypeResponse.success) {
                            setVaccineType(vaccineTypeResponse.data);
                        }
                    }
                    // Fetch student data
                    const studentResponse = await userApi.getStudentById(finalStudentId);
                    if (studentResponse.success) {
                        setStudent(studentResponse.data);
                    }
                    // Fetch consent status
                    const consentResponse = await vaccinationScheduleApi.getParentConsentStatus(id, finalStudentId);
                    if (consentResponse.success) {
                        setConsentData(consentResponse.data);
                        setConsentStatus(consentResponse.data.consentStatus);
                        if (consentResponse.data.consentStatus === "Approved") {
                            setConsentGiven(true);
                        } else if (consentResponse.data.consentStatus === "Declined") {
                            setConsentGiven(false);
                        }
                    } else {
                        setConsentStatus("Pending");
                    }
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
    }, [id, location.state?.studentId]);

    const getStatusBadge = (status) => {
        if (status === "scheduled") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PRIMARY[500] }}></div>
                    Đã lên lịch
                </span>
            );
        } else if (status === "pending") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: PRIMARY[100], color: PRIMARY[800] }}>
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PRIMARY[600] }}></div>
                    Chờ xác nhận
                </span>
            );
        } else if (status === "completed") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PRIMARY[500] }}></div>
                    Đã hoàn thành
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: GRAY[100], color: GRAY[700] }}>
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: GRAY[500] }}></div>
                    Đã hủy
                </span>
            );
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (consentGiven !== null) {
            setShowConfirmModal(true);
        } else {
            setShowAlertModal(true);
        }
    };

    const handleConfirmSubmission = async () => {
        setIsSubmitting(true);

        try {
            const consentDataToSubmit = {
                consentStatus: consentGiven ? "Approved" : "Declined",
                notes: null
            };

            const submitResponse = await vaccinationScheduleApi.submitParentConsent(
                vaccination.vaccinationSessionId,
                vaccination.studentId,
                consentDataToSubmit
            );
            if (submitResponse.success) {
                const consentResponse = await vaccinationScheduleApi.getParentConsentStatus(
                    vaccination.vaccinationSessionId,
                    vaccination.studentId
                );
                if (consentResponse.success) {
                    setConsentData(consentResponse.data);
                    setConsentStatus(consentResponse.data.consentStatus);
                }
                setSubmitted(true);
                setShowConfirmModal(false);
            } else {
                setShowAlertModal(true);
            }
        } catch (error) {
            setShowAlertModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <Loading type="medical" size="large" color="primary" text="Đang tải thông tin chi tiết..." fullScreen={true} />;
    }

    if (!vaccination) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <FiAlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: ERROR[500] }} />
                    <h2 className="text-2xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                        Không tìm thấy thông tin
                    </h2>
                    <p className="text-lg mb-6" style={{ color: TEXT.SECONDARY }}>
                        Lịch tiêm chủng không tồn tại hoặc đã bị xóa.
                    </p>
                    <Link
                        to="/parent/vaccination/schedule"
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
                {!submitted ? (
                    <div className="bg-white shadow-lg border border-gray-300 w-full" style={{ fontFamily: 'Times, serif' }}>
                        <div className="text-center border-b-2 border-black p-8">
                            <div className="mb-4">
                                <h1 className="text-3xl font-bold uppercase tracking-wide">TRƯỜNG TIỂU HỌC ABC</h1>
                                <p className="text-lg mt-2">123 Đường XYZ, Quận 1, TP. Hồ Chí Minh</p>
                                <p className="text-lg">Điện thoại: (028) 1234-5678 | Email: info@tieuhocabc.edu.vn</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-left">
                                    <p className="text-lg">Số: {String(vaccination.id).padStart(4, '0')}/2025/PHĐY-TC</p>
                                    <p className="text-lg">Ngày: {vaccination.createdDate}</p>
                                </div>
                                <div className="text-right">
                                    {getStatusBadge(vaccination.status)}
                                </div>
                            </div>
                        </div>

                        <div className="text-center py-8">
                            <h2 className="text-5xl font-bold uppercase tracking-wider">PHIẾU ĐỒNG Ý TIÊM CHỦNG</h2>
                            <p className="text-2xl mt-4 italic">Vaccine {vaccinationSession?.vaccineTypeName || "Đang tải..."}</p>
                        </div>

                        <div className="px-12 pb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">I. THÔNG TIN HỌC SINH</h3>
                                        <div className="space-y-4 text-xl">
                                            <div className="flex">
                                                <span className="font-semibold w-40">Họ và tên:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student?.fullName || "Đang tải..."}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8">
                                                <div className="flex">
                                                    <span className="font-semibold w-20">Lớp:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student?.currentClassName || "Đang tải..."}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="font-semibold w-24">Mã HS:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student?.studentCode || "Đang tải..."}</span>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Ngày sinh:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student?.dateOfBirth ? formatDate(student.dateOfBirth) : "Đang tải..."}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Phụ huynh:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{student?.parentName || "Đang tải..."}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">II. THÔNG TIN TIÊM CHỦNG</h3>
                                        <div className="space-y-4 text-xl">
                                            <div className="flex">
                                                <span className="font-semibold w-40">Loại vaccine:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1 font-bold">{vaccinationSession?.vaccineTypeName || "Đang tải..."}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8">
                                                <div className="flex">
                                                    <span className="font-semibold w-28">Ngày tiêm:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccinationSession?.startTime ? formatDateTime(vaccinationSession.startTime).date : "Đang tải..."}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="font-semibold w-16">Giờ:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccinationSession?.startTime ? formatDateTime(vaccinationSession.startTime).time : "Đang tải..."}</span>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Địa điểm:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccinationSession?.location || "Đang tải..."}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Đơn vị phụ trách:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccinationSession?.responsibleOrganizationName || "Đang tải..."}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">III. THÔNG TIN QUAN TRỌNG</h3>
                                        <div className="space-y-4 text-lg leading-relaxed">
                                            <div>
                                                <p className="font-semibold text-xl">1. Mô tả vaccine:</p>
                                                <p className="pl-4">{vaccineType?.description || "Đang tải..."}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-xl">2. Tác dụng phụ có thể xảy ra:</p>
                                                <p className="pl-4">{vaccinationSession?.sideEffect || "Đang tải..."}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-xl">3. Chống chỉ định:</p>
                                                <p className="pl-4">{vaccinationSession?.contraindication || "Đang tải..."}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-xl">4. Ghi chú:</p>
                                                <p className="pl-4">{vaccinationSession?.notes || "Không có ghi chú đặc biệt"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">IV. PHẦN ĐỒNG Ý CỦA PHỤ HUYNH</h3>

                                    <div className="space-y-6 text-xl">
                                        <p>
                                            Tôi, <span className="font-bold border-b border-dotted border-gray-400 px-2">{student?.parentName || "Đang tải..."}</span>,
                                            là phụ huynh/người giám hộ của học sinh <span className="font-bold border-b border-dotted border-gray-400 px-2">{student?.fullName || "Đang tải..."}</span>,
                                            số điện thoại: <span className="border-b border-dotted border-gray-400 px-2">{student?.parentPhone || "Đang tải..."}</span>
                                        </p>

                                        <p className="font-semibold text-xl">Sau khi đã được tư vấn đầy đủ về vaccine, tôi:</p>

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
                                                        disabled={consentStatus !== "Pending"}
                                                    />
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-xl">ĐỒNG Ý</span>
                                                        <span className="text-xl"> cho con tôi được tiêm vaccine {vaccinationSession?.vaccineTypeName || "..."} theo lịch trình đã thông báo.</span>
                                                        {consentStatus === "Approved" && (
                                                            <div className="mt-2">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: PRIMARY[100], color: PRIMARY[800] }}>
                                                                    ✓ Đã xác nhận đồng ý
                                                                </span>
                                                                {consentData?.consentDate && (
                                                                    <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                                        Ngày xác nhận: {formatDate(consentData.consentDate)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
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
                                                        disabled={consentStatus !== "Pending"}
                                                    />
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-xl">KHÔNG ĐỒNG Ý</span>
                                                        <span className="text-xl"> cho con tôi tiêm vaccine này.</span>
                                                    </div>
                                                </label>
                                            </div>

                                            {consentGiven === true && consentStatus === "Pending" && (
                                                <div className="border border-gray-300 p-6 bg-gray-50">
                                                    <p className="font-semibold mb-3 text-xl">Tôi cam kết:</p>
                                                    <ul className="list-disc pl-8 space-y-2 text-lg">
                                                        <li>Đã cung cấp thông tin chính xác về tình trạng sức khỏe của con</li>
                                                        <li>Tôi đã đọc và hiểu thông tin về vaccine.</li>
                                                        <li>Con tôi không có tiền sử dị ứng với vaccine này</li>
                                                        <li>Tôi đồng ý cho phép nhà trường và nhân viên y tế tiến hành tiêm chủng cho con tôi.</li>
                                                    </ul>
                                                </div>
                                            )}

                                            {consentStatus === "Approved" && (
                                                <div className="border border-gray-300 p-6 bg-gray-50">
                                                    <p className="font-semibold mb-3 text-xl">Phụ huynh đã cam kết:</p>
                                                    <ul className="list-disc pl-8 space-y-2 text-lg">
                                                        <li>Đã cung cấp thông tin chính xác về tình trạng sức khỏe của con</li>
                                                        <li>Đã đọc và hiểu thông tin về vaccine.</li>
                                                        <li>Con em không có tiền sử dị ứng với vaccine này</li>
                                                        <li>Đồng ý cho phép nhà trường và nhân viên y tế tiến hành tiêm chủng cho con em.</li>
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="text-center pt-6 border-t border-gray-300">
                                                <p className="text-lg font-semibold mb-2">Phụ huynh xác nhận:</p>
                                                <p className="text-xl font-bold" style={{ color: PRIMARY[700] }}>
                                                    {student?.parentName || "Đang tải..."}
                                                </p>
                                                {(consentStatus === "Approved" || consentStatus === "Declined") && consentData?.consentDate && (
                                                    <p className="text-sm mt-2" style={{ color: TEXT.SECONDARY }}>
                                                        Ngày xác nhận: {formatDate(consentData.consentDate)}
                                                    </p>
                                                )}
                                            </div>

                                            {consentStatus === "Pending" && (
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

                                            {(consentStatus === "Approved" || consentStatus === "Declined") && (
                                                <div className="text-center pt-8">
                                                    <div className="inline-flex items-center px-8 py-3 rounded-lg text-lg font-semibold"
                                                        style={{
                                                            backgroundColor: consentStatus === "Approved" ? PRIMARY[100] : GRAY[100],
                                                            color: consentStatus === "Approved" ? PRIMARY[700] : GRAY[700]
                                                        }}>
                                                        {consentStatus === "Approved" ? (
                                                            <>
                                                                <FiCheckCircle className="w-5 h-5 mr-2" />
                                                                Đã xác nhận đồng ý tiêm chủng
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiAlertCircle className="w-5 h-5 mr-2" />
                                                                Đã xác nhận từ chối tiêm chủng
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
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: PRIMARY[100] }}>
                                <FiCheckCircle className="h-10 w-10" style={{ color: PRIMARY[500] }} />
                            </div>
                            <h2 className="text-2xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                                Đã gửi thành công!
                            </h2>
                            <p className="text-base mb-6 max-w-md mx-auto" style={{ color: TEXT.SECONDARY }}>
                                {consentGiven
                                    ? `Phiếu đồng ý tiêm vaccine ${vaccinationSession?.vaccineTypeName} cho ${student?.fullName} đã được gửi thành công.`
                                    : `Phiếu từ chối tiêm vaccine ${vaccinationSession?.vaccineTypeName} cho ${student?.fullName} đã được ghi nhận.`}
                            </p>
                            <Link
                                to="/parent/vaccination/schedule"
                                className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:opacity-90"
                                style={{ backgroundColor: PRIMARY[500] }}
                            >
                                <FiArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại danh sách
                            </Link>
                        </div>
                    </div>
                )}

                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirmSubmission}
                    title={consentGiven ? "Xác nhận đồng ý tiêm chủng" : "Xác nhận từ chối tiêm chủng"}
                    message={consentGiven ? `Bạn đồng ý cho ${student?.fullName} tiêm vaccine ${vaccinationSession?.vaccineTypeName} vào ngày ${vaccinationSession?.startTime ? formatDateTime(vaccinationSession.startTime).date : "..."}?` : `Bạn xác nhận từ chối cho ${student?.fullName} tiêm vaccine ${vaccinationSession?.vaccineTypeName}?`}
                    confirmText="Xác nhận gửi"
                    cancelText="Kiểm tra lại"
                    type={consentGiven ? "success" : "warning"}
                    confirmButtonColor={PRIMARY[500]}
                    isLoading={isSubmitting}
                >
                </ConfirmModal>

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    title="Thông báo"
                    message={consentGiven === null ? "Vui lòng chọn đồng ý hoặc không đồng ý" : "Có lỗi xảy ra khi gửi phiếu. Vui lòng thử lại."}
                    type="warning"
                    okText="Đã hiểu"
                />
            </div>
        </div>
    );
};

export default VaccinationDetail; 