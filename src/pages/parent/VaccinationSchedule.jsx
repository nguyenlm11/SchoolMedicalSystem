import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiSearch, FiEye, FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { PRIMARY, GRAY, SUCCESS, WARNING, ERROR, TEXT, BACKGROUND } from "../../constants/colors";
import Loading from "../../components/Loading";
import { useAuth } from "../../utils/AuthContext";
import vaccinationScheduleApi from "../../api/VaccinationScheduleApi";
import userApi from "../../api/userApi";

const VaccinationSchedule = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("waiting");
    const [vaccinationSchedule, setVaccinationSchedule] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudentData, setSelectedStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingVaccinations, setLoadingVaccinations] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchStudents();
    }, [user]);

    const fetchStudents = async () => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await userApi.getParentStudents(user.id, { pageIndex: 1, pageSize: 100 });
            if (response.success) {
                setStudents(response.data);
                setSelectedStudent(response.data[0].fullName);
                setSelectedStudentData(response.data[0]);
            } else {
                setError(response.message || "Không thể tải danh sách học sinh");
            }
        } catch (error) {
            setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVaccinationSessions();
    }, [selectedStudentData]);

    const fetchVaccinationSessions = async () => {
        if (!selectedStudentData) {
            setVaccinationSchedule([]);
            return;
        }
        try {
            setLoadingVaccinations(true);
            const response = await vaccinationScheduleApi.getStudentVaccinationSessions(selectedStudentData.id, { pageIndex: 1, pageSize: 100 });
            if (response.success) {
                setVaccinationSchedule(response.data);
            } else {
                setVaccinationSchedule([]);
            }
        } catch (error) {
            setVaccinationSchedule([]);
        } finally {
            setLoadingVaccinations(false);
        }
    };

    const mapApiStatusToComponentStatus = (apiStatus) => {
        if (!apiStatus) return 'waiting';
        const statusMap = {
            'waitingforparentconsent': 'waiting',
            'scheduled': 'scheduled',
            'completed': 'completed'
        };
        return statusMap[apiStatus.toLowerCase()] || 'waiting';
    };

    const handleStudentChange = (studentName) => {
        setSelectedStudent(studentName);
        const studentData = students.find(s => s.fullName === studentName);
        setSelectedStudentData(studentData);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 800);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    useEffect(() => {
        if (searchTerm) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                setIsSearching(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    const uniqueStudents = [...new Set(students.map(student => student.fullName))];

    const filteredSchedule = useMemo(() => {
        let filteredData = vaccinationSchedule.filter(item => {
            const statusMap = {
                'waiting': 'waitingforparentconsent',
                'scheduled': 'scheduled',
                'completed': 'completed'
            };
            const statusFilter = statusMap[activeTab];
            const matchesStatus = !statusFilter || item.status?.toLowerCase() === statusFilter;
            const matchesSearch = (item.vaccineTypeName || item.sessionName || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                (item.location || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                (item.notes || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        }).sort((a, b) => {
            const startDateA = new Date(a.startTime);
            const startDateB = new Date(b.startTime);
            return startDateA - startDateB;
        });

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        setTotalCount(filteredData.length);
        setTotalPages(Math.ceil(filteredData.length / pageSize));

        return paginatedData;
    }, [vaccinationSchedule, activeTab, debouncedSearchTerm, currentPage, pageSize]);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getStatusBadge = (status) => {
        if (status === "waiting") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                    Chờ xác nhận từ phụ huynh
                </span>
            );
        } else if (status === "scheduled") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}>
                    Đã lên lịch
                </span>
            );
        } else if (status === "completed") {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                    Đã hoàn thành
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                    Chờ xác nhận từ phụ huynh
                </span>
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách tiêm chủng..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <section className="py-12 sm:py-16 relative overflow-hidden" style={{ backgroundColor: PRIMARY[500] }}>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center text-white max-w-5xl mx-auto">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4">
                            Lịch tiêm chủng
                        </h1>
                        <p className="text-base sm:text-lg opacity-90 leading-relaxed font-medium px-4">
                            Quản lý lịch tiêm chủng cho con em
                        </p>
                    </div>
                </div>
            </section>

            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="rounded-2xl shadow-xl border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: GRAY[200] }}>
                    <div className="p-6 border-b" style={{ borderColor: GRAY[100] }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-shrink-0">
                                <select
                                    value={selectedStudent}
                                    onChange={(e) => handleStudentChange(e.target.value)}
                                    className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium"
                                    style={{ borderColor: GRAY[200], backgroundColor: 'white', color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                >
                                    {uniqueStudents.map((student, index) => (
                                        <option key={index} value={student}>{student}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên vaccine, địa điểm..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: GRAY[200], backgroundColor: 'white', color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm !== debouncedSearchTerm && (
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: PRIMARY[500] }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {[
                                    { key: "waiting", label: "Chờ xác nhận", icon: FiAlertTriangle },
                                    { key: "scheduled", label: "Đã lên lịch", icon: FiCalendar },
                                    { key: "completed", label: "Đã hoàn thành", icon: FiCheckCircle }
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className="px-4 py-2 rounded-lg flex items-center transition-all duration-200"
                                        style={{
                                            backgroundColor: activeTab === tab.key ? PRIMARY[500] : 'white',
                                            color: activeTab === tab.key ? 'white' : TEXT.PRIMARY,
                                            border: `1px solid ${activeTab === tab.key ? PRIMARY[500] : GRAY[200]}`
                                        }}
                                    >
                                        <tab.icon className="mr-2 h-4 w-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden relative">
                        {isSearching || loadingVaccinations ? (
                            <div className="text-center py-16">
                                <Loading type="medical" size="large" color="primary" text={isSearching ? "Đang tìm kiếm lịch tiêm chủng..." : "Đang tải lịch tiêm chủng..."} />
                            </div>
                        ) : filteredSchedule.length > 0 ? (
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr style={{ backgroundColor: PRIMARY[50] }}>
                                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider w-1/4" style={{ color: TEXT.PRIMARY }}>
                                            Tiêm chủng
                                        </th>
                                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider w-1/6" style={{ color: TEXT.PRIMARY }}>
                                            Ngày tiêm
                                        </th>
                                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider w-1/6" style={{ color: TEXT.PRIMARY }}>
                                            Thời gian
                                        </th>
                                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider w-1/5" style={{ color: TEXT.PRIMARY }}>
                                            Địa điểm
                                        </th>
                                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider w-1/6" style={{ color: TEXT.PRIMARY }}>
                                            Trạng thái
                                        </th>
                                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider w-40" style={{ color: TEXT.PRIMARY }}>
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: GRAY[100] }}>
                                    {filteredSchedule.map((vaccination, index) => (
                                        <tr key={vaccination.id} className="hover:bg-gray-50 transition-all duration-200 group"
                                            style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}>
                                            <td className="py-4 px-6 w-1/4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                        {vaccination.sessionName || vaccination.vaccineTypeName || "Buổi tiêm chủng"}
                                                    </span>
                                                    <span className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                                        {selectedStudentData?.fullName} • Lớp {selectedStudentData?.currentClassName || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 w-1/6">
                                                <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {new Date(vaccination.startTime).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 w-1/6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {new Date(vaccination.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                                        <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                            - {new Date(vaccination.endTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="px-2 py-0.5 rounded-full text-xs font-medium inline-block w-fit"
                                                        style={{
                                                            backgroundColor: (() => {
                                                                const startDate = new Date(vaccination.startTime);
                                                                const now = new Date();
                                                                const dueIn = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
                                                                return dueIn <= 7 && dueIn >= 0 ? ERROR[100] : PRIMARY[100];
                                                            })(),
                                                            color: (() => {
                                                                const startDate = new Date(vaccination.startTime);
                                                                const now = new Date();
                                                                const dueIn = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
                                                                return dueIn <= 7 && dueIn >= 0 ? ERROR[700] : PRIMARY[700];
                                                            })()
                                                        }}
                                                    >
                                                        {(() => {
                                                            const startDate = new Date(vaccination.startTime);
                                                            const now = new Date();
                                                            const dueIn = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
                                                            if (dueIn < 0) return `Đã qua ${Math.abs(dueIn)} ngày`;
                                                            if (dueIn === 0) return "Hôm nay";
                                                            if (dueIn === 1) return "Ngày mai";
                                                            return `Còn ${dueIn} ngày`;
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 w-1/5">
                                                <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                                    {vaccination.location}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 w-1/6">
                                                {getStatusBadge(mapApiStatusToComponentStatus(vaccination.status))}
                                            </td>
                                            <td className="py-4 px-6 w-40">
                                                <div className="flex items-center space-x-2">
                                                    {mapApiStatusToComponentStatus(vaccination.status) === 'completed' ? (
                                                        <Link
                                                            to={`/parent/vaccination/result/${vaccination.id}`}
                                                            state={{ studentId: selectedStudentData?.id }}
                                                            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium"
                                                            title="Xem kết quả"
                                                            style={{ color: PRIMARY[700], border: `1px solid ${PRIMARY[700]}` }}
                                                        >
                                                            <FiEye className="h-3 w-3" />
                                                            <span>Kết quả</span>
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            to={`/parent/vaccination/details/${vaccination.id}`}
                                                            state={{ studentId: selectedStudentData?.id }}
                                                            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium"
                                                            title="Xem chi tiết"
                                                            style={{ color: PRIMARY[700], border: `1px solid ${PRIMARY[700]}` }}
                                                        >
                                                            <FiEye className="h-3 w-3" />
                                                            <span>Chi tiết</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-16 lg:py-24">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: GRAY[100] }}>
                                        <FiAlertCircle className="w-10 h-10 lg:w-12 lg:h-12" style={{ color: GRAY[400] }} />
                                    </div>
                                    <h3 className="text-xl lg:text-2xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                                        Không tìm thấy lịch tiêm chủng nào
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
                                            style={{ backgroundColor: PRIMARY[500], color: 'white', border: `2px solid ${PRIMARY[500]}` }}
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {totalPages > 0 && (
                            <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: GRAY[100] }}>
                                <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                    Hiển thị{" "}
                                    <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {totalCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}
                                    </span>{" "}
                                    -{" "}
                                    <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {Math.min(currentPage * pageSize, totalCount)}
                                    </span>{" "}
                                    trong tổng số{" "}
                                    <span className="font-bold" style={{ color: PRIMARY[600] }}>{totalCount}</span>{" "}
                                    lịch tiêm chủng
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: currentPage === 1 ? GRAY[200] : PRIMARY[300],
                                            color: currentPage === 1 ? GRAY[400] : PRIMARY[600],
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <FiChevronLeft className="h-4 w-4" />
                                    </button>

                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => paginate(pageNumber)}
                                                className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                                                style={{
                                                    borderColor: currentPage === pageNumber ? PRIMARY[500] : GRAY[200],
                                                    backgroundColor: currentPage === pageNumber ? PRIMARY[500] : 'white',
                                                    color: currentPage === pageNumber ? 'white' : TEXT.PRIMARY
                                                }}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: currentPage === totalPages ? GRAY[200] : PRIMARY[300],
                                            color: currentPage === totalPages ? GRAY[400] : PRIMARY[600],
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <FiChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaccinationSchedule;