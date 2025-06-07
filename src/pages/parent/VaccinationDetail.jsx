import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { PRIMARY, GRAY, ERROR, TEXT, BACKGROUND } from "../../constants/colors";
import Loading from "../../components/Loading";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AlertModal from "../../components/modal/AlertModal";

const VaccinationDetail = () => {
    const { id } = useParams();
    const [vaccination, setVaccination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [consentGiven, setConsentGiven] = useState(null);
    const [signature, setSignature] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            const mockVaccinationDetail = {
                id: parseInt(id),
                studentName: "Nguyễn Văn An",
                studentId: "HS12345",
                class: "2A",
                dateOfBirth: "15/05/2017",
                parentName: "Nguyễn Văn Bình",
                parentPhone: "0123456789",
                vaccineName: "Sởi-Rubella",
                date: "2025-07-20",
                displayDate: "20/07/2025",
                time: "08:00",
                location: "Phòng y tế trường",
                address: "Trường Tiểu học ABC, 123 Đường XYZ, Quận 1, TP.HCM",
                status: "scheduled",
                statusText: "Đã lên lịch",
                description: "Vaccine phòng bệnh Sởi và Rubella cho trẻ em trong độ tuổi tiểu học. Đây là vaccine được khuyến nghị trong chương trình tiêm chủng mở rộng quốc gia.",
                sideEffects: "Có thể gây sốt nhẹ, đau tại chỗ tiêm, mệt mỏi trong vòng 24-48 giờ sau tiêm. Các tác dụng phụ này thường nhẹ và tự khỏi.",
                contraindications: "Không tiêm cho trẻ đang sốt cao, có tiền sử dị ứng nghiêm trọng với vaccine, hoặc đang điều trị ức chế miễn dịch.",
                preparation: "Trẻ cần được nghỉ ngơi đầy đủ, không sốt trong 24h trước khi tiêm. Mang theo thẻ BHYT và sổ tiêm chủng.",
                dueIn: 15,
                priority: "medium",
                avatar: "A",
                createdDate: "10/07/2025",
                doctor: "BS. Nguyễn Thị Lan",
                notes: "Học sinh cần được theo dõi sức khỏe trong 30 phút sau tiêm."
            };
            setVaccination(mockVaccinationDetail);
            setLoading(false);
        }, 1000);
    }, [id]);

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
        if (consentGiven !== null && (consentGiven === false || signature)) {
            setShowConfirmModal(true);
        } else {
            setShowAlertModal(true);
        }
    };

    const handleConfirmSubmission = async () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setSubmitted(true);
            setShowConfirmModal(false);
            setIsSubmitting(false);
        }, 2000);
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
                            <p className="text-2xl mt-4 italic">Vaccine {vaccination.vaccineName}</p>
                        </div>

                        <div className="px-12 pb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">I. THÔNG TIN HỌC SINH</h3>
                                        <div className="space-y-4 text-xl">
                                            <div className="flex">
                                                <span className="font-semibold w-40">Họ và tên:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccination.studentName}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8">
                                                <div className="flex">
                                                    <span className="font-semibold w-20">Lớp:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccination.class}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="font-semibold w-24">Mã HS:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccination.studentId}</span>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Ngày sinh:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccination.dateOfBirth}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Phụ huynh:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccination.parentName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">II. THÔNG TIN TIÊM CHỦNG</h3>
                                        <div className="space-y-4 text-xl">
                                            <div className="flex">
                                                <span className="font-semibold w-40">Loại vaccine:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1 font-bold">{vaccination.vaccineName}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-8">
                                                <div className="flex">
                                                    <span className="font-semibold w-28">Ngày tiêm:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccination.displayDate}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="font-semibold w-16">Giờ:</span>
                                                    <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccination.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Địa điểm:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccination.location}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-semibold w-40">Bác sĩ:</span>
                                                <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{vaccination.doctor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">III. THÔNG TIN QUAN TRỌNG</h3>
                                        <div className="space-y-4 text-lg leading-relaxed">
                                            <div>
                                                <p className="font-semibold text-xl">1. Mô tả vaccine:</p>
                                                <p className="pl-4">{vaccination.description}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-xl">2. Tác dụng phụ có thể xảy ra:</p>
                                                <p className="pl-4">{vaccination.sideEffects}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-xl">3. Chống chỉ định:</p>
                                                <p className="pl-4">{vaccination.contraindications}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-xl">4. Chuẩn bị trước khi tiêm:</p>
                                                <p className="pl-4">{vaccination.preparation}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold mb-6 uppercase border-b-2 border-gray-400 pb-2">IV. PHẦN ĐỒNG Ý CỦA PHỤ HUYNH</h3>

                                    <div className="space-y-6 text-xl">
                                        <p>
                                            Tôi, <span className="font-bold border-b border-dotted border-gray-400 px-2">{vaccination.parentName}</span>,
                                            là phụ huynh/người giám hộ của học sinh <span className="font-bold border-b border-dotted border-gray-400 px-2">{vaccination.studentName}</span>,
                                            số điện thoại: <span className="border-b border-dotted border-gray-400 px-2">{vaccination.parentPhone}</span>
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
                                                    />
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-xl">ĐỒNG Ý</span>
                                                        <span className="text-xl"> cho con tôi được tiêm vaccine {vaccination.vaccineName} theo lịch trình đã thông báo.</span>
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
                                                    />
                                                    <div className="flex-1">
                                                        <span className="font-semibold text-xl">KHÔNG ĐỒNG Ý</span>
                                                        <span className="text-xl"> cho con tôi tiêm vaccine này.</span>
                                                    </div>
                                                </label>
                                            </div>

                                            {consentGiven === true && (
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

                                            <div className="grid grid-cols-2 gap-8 pt-8">
                                                <div className="text-center">
                                                    <p className="font-semibold mb-4 text-xl">NHÂN VIÊN Y TẾ</p>
                                                    <p className="text-lg italic mb-8">(Ký tên, ghi rõ họ tên)</p>
                                                    <div className="h-20 border-b border-dotted border-gray-400"></div>
                                                    <p className="text-lg mt-3">{vaccination.doctor}</p>
                                                </div>

                                                <div className="text-center">
                                                    <p className="font-semibold mb-4 text-xl">PHỤ HUYNH/NGƯỜI GIÁM HỘ</p>
                                                    <p className="text-lg italic mb-3">(Ký tên, ghi rõ họ tên)</p>

                                                    {consentGiven === true ? (
                                                        <div className="mb-6">
                                                            <input
                                                                type="text"
                                                                className="w-full p-3 text-center text-2xl border-b-2 border-gray-400 bg-transparent focus:outline-none focus:border-gray-600"
                                                                style={{ fontFamily: 'serif' }}
                                                                value={signature}
                                                                onChange={(e) => setSignature(e.target.value)}
                                                                placeholder="Ký tên đầy đủ"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-20 border-b border-dotted border-gray-400 mb-6"></div>
                                                    )}

                                                    <p className="text-lg">{vaccination.parentName}</p>
                                                    <p className="text-base mt-2">Ngày ký: {new Date().toLocaleDateString('vi-VN')}</p>
                                                </div>
                                            </div>

                                            <div className="text-center pt-8">
                                                <button
                                                    type="submit"
                                                    className="px-12 py-4 text-xl font-semibold text-white rounded-lg transition-all duration-300 hover:opacity-90"
                                                    style={{ backgroundColor: PRIMARY[500] }}
                                                >
                                                    Xác nhận và Gửi Phiếu
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center text-base italic pt-8 border-t border-gray-300 mt-8">
                                <p>Phiếu này có hiệu lực khi được ký đầy đủ và có dấu của nhà trường</p>
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
                                    ? `Phiếu đồng ý tiêm vaccine ${vaccination.vaccineName} cho ${vaccination.studentName} đã được gửi thành công.`
                                    : `Phiếu từ chối tiêm vaccine ${vaccination.vaccineName} cho ${vaccination.studentName} đã được ghi nhận.`}
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
                    message={consentGiven ? `Bạn đồng ý cho ${vaccination?.studentName} tiêm vaccine ${vaccination?.vaccineName} vào ngày ${vaccination?.displayDate}?` : `Bạn xác nhận từ chối cho ${vaccination?.studentName} tiêm vaccine ${vaccination?.vaccineName}?`}
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
                    message="Vui lòng ký tên nếu đồng ý cho con tiêm chủng"
                    type="warning"
                    okText="Đã hiểu"
                />
            </div>
        </div>
    );
};

export default VaccinationDetail; 