import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiMapPin, FiSearch, FiEye, FiAlertCircle } from "react-icons/fi";
import { PRIMARY, SECONDARY, GRAY, SUCCESS, WARNING, ERROR, TEXT, BACKGROUND, BORDER, SHADOW } from "../../constants/colors";
import Loading from "../../components/Loading";

const VaccinationSchedule = () => {
    const [vaccinationSchedule, setVaccinationSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("all");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            const mockVaccinationSchedule = [
                {
                    id: 1,
                    studentName: "Nguyễn Văn An",
                    studentId: "HS12345",
                    class: "2A",
                    vaccineName: "Sởi-Rubella",
                    date: "2025-07-20",
                    displayDate: "20/07/2025",
                    time: "08:00",
                    location: "Phòng y tế trường",
                    status: "scheduled",
                    statusText: "Đã lên lịch",
                    description: "Vaccine phòng bệnh Sởi và Rubella cho trẻ em trong độ tuổi tiểu học",
                    dueIn: 15,
                    priority: "medium",
                    avatar: "A"
                },
                {
                    id: 2,
                    studentName: "Nguyễn Minh Cường",
                    studentId: "HS12347",
                    class: "3C",
                    vaccineName: "Viêm não Nhật Bản",
                    date: "2025-07-25",
                    displayDate: "25/07/2025",
                    time: "09:30",
                    location: "Phòng y tế trường",
                    status: "scheduled",
                    statusText: "Đã lên lịch",
                    description: "Vaccine phòng bệnh viêm não Nhật Bản cho trẻ em",
                    dueIn: 20,
                    priority: "high",
                    avatar: "C"
                },
                {
                    id: 3,
                    studentName: "Nguyễn Thị Lan",
                    studentId: "HS12348",
                    class: "1B",
                    vaccineName: "Bạch hầu - Ho gà - Uốn ván",
                    date: "2025-08-10",
                    displayDate: "10/08/2025",
                    time: "10:00",
                    location: "Phòng y tế trường",
                    status: "pending",
                    statusText: "Chờ xác nhận",
                    description: "Vaccine phòng bệnh Bạch hầu, Ho gà và Uốn ván",
                    dueIn: 36,
                    priority: "medium",
                    avatar: "L"
                },
            ];
            setVaccinationSchedule(mockVaccinationSchedule);
            setLoading(false);
        }, 1200);
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                setIsSearching(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    const uniqueStudents = [...new Set(vaccinationSchedule.map(item => item.studentName))];

    const filteredSchedule = vaccinationSchedule
        .filter(item => {
            const matchesSearch = item.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStudent = selectedStudent === "all" || item.studentName === selectedStudent;
            return matchesSearch && matchesStudent;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const getStatusBadge = (status) => {
        if (status === "scheduled") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PRIMARY[500] }}></div>
                    Đã lên lịch
                </span>
            );
        } else if (status === "pending") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: WARNING[500] }}></div>
                    Chờ xác nhận
                </span>
            );
        } else if (status === "completed") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: SUCCESS[500] }}></div>
                    Đã hoàn thành
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ERROR[500] }}></div>
                    Đã hủy
                </span>
            );
        }
    };

    const getDueInText = (dueIn) => {
        if (dueIn < 0) return `Đã qua ${Math.abs(dueIn)} ngày`;
        if (dueIn === 0) return "Hôm nay";
        if (dueIn === 1) return "Ngày mai";
        return `Còn ${dueIn} ngày`;
    };

    if (loading) {
        return <Loading type="medical" size="large" color="primary" text="Đang tải lịch tiêm chủng..." fullScreen={true} />;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <section className="py-12 sm:py-16 lg:py-20 xl:py-28 relative overflow-hidden" style={{ backgroundColor: PRIMARY[500] }}>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center text-white max-w-5xl mx-auto">
                        <div className="flex items-center justify-center mb-6 lg:mb-8">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-black text-white">
                                Lịch Tiêm Chủng
                            </h1>
                        </div>
                        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl opacity-90 leading-relaxed font-medium px-4">
                            Theo dõi và quản lý lịch tiêm chủng của con em tại trường một cách khoa học và an toàn
                        </p>

                        <div className="grid grid-cols-4 gap-4 lg:gap-8 mt-8 lg:mt-12 max-w-4xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                                <div className="text-2xl lg:text-3xl font-bold text-white">{vaccinationSchedule.length}</div>
                                <div className="text-sm lg:text-base text-teal-100 font-medium">Tổng lịch</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                                <div className="text-2xl lg:text-3xl font-bold text-white">
                                    {vaccinationSchedule.filter(v => v.status === 'scheduled').length}
                                </div>
                                <div className="text-sm lg:text-base text-teal-100 font-medium">Đã lên lịch</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                                <div className="text-2xl lg:text-3xl font-bold text-white">
                                    {vaccinationSchedule.filter(v => v.status === 'pending').length}
                                </div>
                                <div className="text-sm lg:text-base text-teal-100 font-medium">Chờ xác nhận</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                                <div className="text-2xl lg:text-3xl font-bold text-white">
                                    {vaccinationSchedule.filter(v => v.status === 'completed').length}
                                </div>
                                <div className="text-sm lg:text-base text-teal-100 font-medium">Đã hoàn thành</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-8 lg:py-12 bg-white bg-opacity-50 backdrop-blur-sm" style={{ borderBottomColor: GRAY[200], borderBottomWidth: 1 }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-6 lg:mb-8">
                            <h2 className="text-xl lg:text-2xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                                Tìm kiếm và lọc lịch tiêm chủng
                            </h2>
                            <p className="text-sm lg:text-base" style={{ color: TEXT.SECONDARY }}>
                                Chọn con em để xem lịch tiêm chủng hoặc tìm kiếm theo vaccine
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center">
                            <div className="flex-shrink-0">
                                <select
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="px-4 py-4 lg:py-5 text-base lg:text-lg rounded-xl lg:rounded-2xl border-2 focus:outline-none transition-all duration-300 font-medium shadow-sm min-w-[200px]"
                                    style={{
                                        borderColor: GRAY[200],
                                        backgroundColor: GRAY[25] || '#fafafa',
                                        color: TEXT.PRIMARY
                                    }}
                                >
                                    <option value="all">Tất cả con em</option>
                                    {uniqueStudents.map((student, index) => (
                                        <option key={index} value={student}>{student}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative flex-1 w-full">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                    <FiSearch className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: PRIMARY[400] }} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên vaccine, địa điểm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 lg:pl-14 pr-12 py-4 lg:py-5 text-base lg:text-lg rounded-xl lg:rounded-2xl border-2 focus:outline-none transition-all duration-300 font-medium shadow-sm"
                                    style={{
                                        borderColor: GRAY[200],
                                        backgroundColor: GRAY[25] || '#fafafa',
                                        color: TEXT.PRIMARY
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = PRIMARY[400];
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.boxShadow = `0 0 0 4px ${PRIMARY[50]}`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = GRAY[200];
                                        e.target.style.backgroundColor = GRAY[25] || '#fafafa';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 text-lg"
                                        style={{ color: GRAY[400] }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8 lg:py-16">
                {isSearching ? (
                    <div className="text-center py-12">
                        <Loading type="medical" size="large" color="primary" text="Đang tìm kiếm lịch tiêm chủng..." />
                    </div>
                ) : filteredSchedule.length > 0 ? (
                    <div className="bg-white rounded-2xl lg:rounded-3xl border-2 overflow-hidden shadow-lg" style={{ borderColor: GRAY[200] }}>
                        <div className="divide-y" style={{ borderColor: GRAY[100] }}>
                            {filteredSchedule.map((vaccination) => (
                                <div key={vaccination.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-3">
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-white text-sm lg:text-base mr-4 shadow-sm"
                                                    style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
                                                    {vaccination.avatar}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg lg:text-xl" style={{ color: TEXT.PRIMARY }}>
                                                        {vaccination.studentName}
                                                    </h4>
                                                    <p className="text-sm font-medium" style={{ color: GRAY[500] }}>
                                                        {vaccination.studentId} • Lớp {vaccination.class}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="ml-14 lg:ml-16">
                                                <h5 className="font-bold text-base lg:text-lg mb-2" style={{ color: TEXT.PRIMARY }}>
                                                    {vaccination.vaccineName}
                                                </h5>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                                    <div className="flex items-center">
                                                        <FiCalendar className="w-4 h-4 mr-2" style={{ color: PRIMARY[600] }} />
                                                        <span className="text-sm font-medium" style={{ color: GRAY[600] }}>
                                                            {vaccination.displayDate}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FiClock className="w-4 h-4 mr-2" style={{ color: PRIMARY[600] }} />
                                                        <span className="text-sm font-medium" style={{ color: GRAY[600] }}>
                                                            {vaccination.time}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FiMapPin className="w-4 h-4 mr-2" style={{ color: PRIMARY[600] }} />
                                                        <span className="text-sm font-medium" style={{ color: GRAY[600] }}>
                                                            {vaccination.location}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-sm leading-relaxed mb-3" style={{ color: GRAY[600] }}>
                                                    {vaccination.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start lg:items-end gap-3 lg:ml-6">
                                            <div className="flex flex-col items-start lg:items-end gap-2">
                                                {getStatusBadge(vaccination.status)}
                                                <div
                                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                                    style={{
                                                        backgroundColor: vaccination.dueIn <= 7 && vaccination.dueIn >= 0 ? ERROR[100] : PRIMARY[100],
                                                        color: vaccination.dueIn <= 7 && vaccination.dueIn >= 0 ? ERROR[700] : PRIMARY[700]
                                                    }}
                                                >
                                                    {getDueInText(vaccination.dueIn)}
                                                </div>
                                            </div>

                                            <Link
                                                to={`/parent/vaccination/details/${vaccination.id}`}
                                                className="group flex items-center px-4 py-2 font-semibold text-sm rounded-lg border transition-all duration-300 hover:scale-105"
                                                style={{
                                                    borderColor: PRIMARY[500],
                                                    color: PRIMARY[600],
                                                    backgroundColor: 'white'
                                                }}
                                            >
                                                <FiEye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 lg:py-20 rounded-2xl lg:rounded-3xl" style={{ backgroundColor: GRAY[50] }}>
                        <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6" style={{ backgroundColor: GRAY[300] }}>
                            <FiAlertCircle className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
                        </div>
                        <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4" style={{ color: TEXT.PRIMARY }}>
                            Không tìm thấy lịch tiêm chủng nào
                        </h3>
                        <p className="text-base lg:text-lg mb-4 lg:mb-6 px-4" style={{ color: TEXT.SECONDARY }}>
                            Thử chọn học sinh khác hoặc thay đổi từ khóa tìm kiếm!
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedStudent("all");
                            }}
                            className="px-4 py-2 lg:px-6 lg:py-3 text-white font-bold rounded-xl lg:rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            style={{ backgroundColor: PRIMARY[500] }}
                        >
                            Đặt lại bộ lọc
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VaccinationSchedule;