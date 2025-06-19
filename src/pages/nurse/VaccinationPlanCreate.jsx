import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiX, FiCalendar, FiUsers, FiInfo, FiClock, FiMapPin, FiAlertTriangle, FiPackage, FiShield, FiSettings } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";

const VaccinationPlanCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        vaccineType: "",
        description: "",
        scheduledDate: "",
        scheduledTime: "",
        location: "Phòng y tế trường",
        targetGrades: [],
        isVoluntary: false,
        reminderDaysBefore: 7,
        maxStudentsPerSession: 50,
        estimatedDuration: 30,
        notes: "",
        requireParentConsent: true,
        vaccinationDetails: {
            dosage: "",
            manufacturer: "",
            lotNumber: "",
            expiryDate: "",
            sideEffects: "",
            contraindications: "",
        },
    });

    const [availableGrades] = useState([
        { id: '1A', name: 'Lớp 1A', studentCount: 35 },
        { id: '1B', name: 'Lớp 1B', studentCount: 32 },
        { id: '2A', name: 'Lớp 2A', studentCount: 30 },
        { id: '2B', name: 'Lớp 2B', studentCount: 33 },
        { id: '3A', name: 'Lớp 3A', studentCount: 35 },
        { id: '3B', name: 'Lớp 3B', studentCount: 34 },
        { id: '4A', name: 'Lớp 4A', studentCount: 35 },
        { id: '4B', name: 'Lớp 4B', studentCount: 34 },
    ]);

    const [vaccineTypes] = useState([
        {
            id: 'flu2024',
            name: 'Vắc-xin cúm mùa 2024',
            description: 'Phòng ngừa cúm mùa và các biến chứng',
            recommendedAge: '6 tháng trở lên'
        },
        {
            id: 'mmr',
            name: 'Vắc-xin MMR',
            description: 'Phòng bệnh Sởi - Quai bị - Rubella',
            recommendedAge: '12 tháng - 6 tuổi'
        }
    ]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes("vaccinationDetails.")) {
            const field = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                vaccinationDetails: {
                    ...prev.vaccinationDetails,
                    [field]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleGradeSelection = (gradeId) => {
        setFormData((prev) => ({
            ...prev,
            targetGrades: prev.targetGrades.includes(gradeId)
                ? prev.targetGrades.filter((id) => id !== gradeId)
                : [...prev.targetGrades, gradeId],
        }));
    };

    const calculateTotalStudents = () => {
        return formData.targetGrades.reduce((total, gradeId) => {
            const grade = availableGrades.find((g) => g.id === gradeId);
            return total + (grade ? grade.studentCount : 0);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate("/schoolnurse/vaccination");
        }, 2000);
    };

    const selectedVaccine = vaccineTypes.find(
        (v) => v.id === formData.vaccineType
    );
    const totalStudents = calculateTotalStudents();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tạo kế hoạch tiêm chủng..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold mb-2" style={{ color: PRIMARY[700] }}>
                        Tạo kế hoạch tiêm chủng mới
                    </h1>
                    <p className="text-xl font-medium" style={{ color: TEXT.SECONDARY }}>
                        Tạo kế hoạch tiêm chủng cho học sinh trong trường
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border"
                        style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                            <h2 className="text-2xl font-bold flex items-center" style={{ color: PRIMARY[600] }}>
                                <FiInfo className="mr-2 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Thông tin cơ bản
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Tên kế hoạch tiêm chủng *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Ví dụ: Tiêm vắc-xin cúm mùa 2024"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Loại vắc-xin *
                                    </label>
                                    <select
                                        name="vaccineType"
                                        value={formData.vaccineType}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        required
                                    >
                                        <option value="">Chọn loại vắc-xin</option>
                                        {vaccineTypes.map((vaccine) => (
                                            <option key={vaccine.id} value={vaccine.id}>
                                                {vaccine.name}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedVaccine && (
                                        <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: PRIMARY[50] }}>
                                            <p className="text-base font-medium" style={{ color: PRIMARY[700] }}>
                                                {selectedVaccine.description}
                                                <br />
                                                <span className="font-bold">Độ tuổi khuyến nghị:</span> {selectedVaccine.recommendedAge}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Mô tả
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Mô tả chi tiết về kế hoạch tiêm chủng..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border"
                        style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                            <h2 className="text-2xl font-bold flex items-center" style={{ color: PRIMARY[600] }}>
                                <FiCalendar className="mr-2 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Thời gian và địa điểm
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Ngày tiêm *
                                    </label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                                            style={{ color: GRAY[400] }} />
                                        <input
                                            type="date"
                                            name="scheduledDate"
                                            value={formData.scheduledDate}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Giờ bắt đầu
                                    </label>
                                    <div className="relative">
                                        <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                                            style={{ color: GRAY[400] }} />
                                        <input
                                            type="time"
                                            name="scheduledTime"
                                            value={formData.scheduledTime}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Địa điểm
                                    </label>
                                    <div className="relative">
                                        <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                                            style={{ color: GRAY[400] }} />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                            placeholder="Phòng y tế trường"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border"
                        style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center" style={{ color: PRIMARY[600] }}>
                                    <FiUsers className="mr-2 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                    Chọn lớp học
                                </h2>
                                <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: PRIMARY[50] }}>
                                    <span className="text-lg font-bold" style={{ color: PRIMARY[700] }}>
                                        {totalStudents} học sinh được chọn
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {availableGrades.map((grade) => (
                                    <div
                                        key={grade.id}
                                        onClick={() => handleGradeSelection(grade.id)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${formData.targetGrades.includes(grade.id)
                                            ? "shadow-sm" : ""}`}
                                        style={{
                                            borderColor: formData.targetGrades.includes(grade.id) ? PRIMARY[500] : BORDER.DEFAULT,
                                            backgroundColor: formData.targetGrades.includes(grade.id) ? PRIMARY[50] : BACKGROUND.DEFAULT,
                                        }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={formData.targetGrades.includes(grade.id)}
                                                onChange={() => handleGradeSelection(grade.id)}
                                                className="h-5 w-5"
                                                style={{ accentColor: PRIMARY[500] }}
                                            />
                                            <div>
                                                <p className="text-base font-bold" style={{ color: TEXT.PRIMARY }}>{grade.name}</p>
                                                <p className="text-base" style={{ color: TEXT.SECONDARY }}>{grade.studentCount} học sinh</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border"
                        style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                            <h2 className="text-2xl font-bold flex items-center" style={{ color: PRIMARY[600] }}>
                                <FiPackage className="mr-2 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Chi tiết vắc-xin
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Liều lượng
                                    </label>
                                    <input
                                        type="text"
                                        name="vaccinationDetails.dosage"
                                        value={formData.vaccinationDetails.dosage}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Ví dụ: 0.5ml"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Nhà sản xuất
                                    </label>
                                    <input
                                        type="text"
                                        name="vaccinationDetails.manufacturer"
                                        value={formData.vaccinationDetails.manufacturer}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Tên nhà sản xuất"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Số lô
                                    </label>
                                    <input
                                        type="text"
                                        name="vaccinationDetails.lotNumber"
                                        value={formData.vaccinationDetails.lotNumber}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Số lô sản xuất"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Hạn sử dụng
                                    </label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                                            style={{ color: GRAY[400] }} />
                                        <input
                                            type="date"
                                            name="vaccinationDetails.expiryDate"
                                            value={formData.vaccinationDetails.expiryDate}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Tác dụng phụ có thể xảy ra
                                    </label>
                                    <div className="relative">
                                        <FiAlertTriangle className="absolute left-3 top-3 h-5 w-5" style={{ color: WARNING[400] }} />
                                        <textarea
                                            name="vaccinationDetails.sideEffects"
                                            value={formData.vaccinationDetails.sideEffects}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                            placeholder="Mô tả các tác dụng phụ có thể xảy ra..."
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Chống chỉ định
                                    </label>
                                    <div className="relative">
                                        <FiShield className="absolute left-3 top-3 h-5 w-5" style={{ color: ERROR[400] }} />
                                        <textarea
                                            name="vaccinationDetails.contraindications"
                                            value={formData.vaccinationDetails.contraindications}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                            placeholder="Các trường hợp không nên tiêm..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border"
                        style={{ borderColor: BORDER.DEFAULT }}>
                        <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                            <h2 className="text-2xl font-bold flex items-center" style={{ color: PRIMARY[600] }}>
                                <FiSettings className="mr-2 h-6 w-6" style={{ color: PRIMARY[500] }} />
                                Cài đặt bổ sung
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center p-4 rounded-lg transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                                    <input
                                        type="checkbox"
                                        name="isVoluntary"
                                        checked={formData.isVoluntary}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 mr-3"
                                        style={{ accentColor: PRIMARY[500] }}
                                    />
                                    <div>
                                        <label className="text-base font-bold" style={{ color: TEXT.PRIMARY }}>
                                            Tiêm chủng tự nguyện
                                        </label>
                                        <p className="text-base mt-1" style={{ color: TEXT.SECONDARY }}>
                                            Học sinh có thể tự quyết định việc tham gia tiêm chủng
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 rounded-lg transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                                    <input
                                        type="checkbox"
                                        name="requireParentConsent"
                                        checked={formData.requireParentConsent}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 mr-3"
                                        style={{ accentColor: PRIMARY[500] }}
                                    />
                                    <div>
                                        <label className="text-base font-bold" style={{ color: TEXT.PRIMARY }}>
                                            Yêu cầu sự đồng ý của phụ huynh
                                        </label>
                                        <p className="text-base mt-1" style={{ color: TEXT.SECONDARY }}>
                                            Phụ huynh cần xác nhận đồng ý trước khi tiêm chủng
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-base font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                        Ghi chú thêm
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-base"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        placeholder="Ghi chú thêm về kế hoạch tiêm chủng..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate("/schoolnurse/vaccination")}
                            className="px-6 py-3 border rounded-lg text-lg font-semibold inline-flex items-center transition-all duration-200 hover:bg-gray-50"
                            style={{ borderColor: BORDER.DEFAULT, color: TEXT.PRIMARY, backgroundColor: BACKGROUND.DEFAULT }}
                        >
                            <FiX className="mr-2 h-5 w-5" /> Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-lg text-lg font-semibold inline-flex items-center transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                        >
                            {loading ? (
                                <>
                                    <Loading type="spinner" size="small" color="white" className="mr-2" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <FiSave className="mr-2 h-5 w-5" />
                                    Tạo kế hoạch
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VaccinationPlanCreate;