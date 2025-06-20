import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiRefreshCw, FiEdit, FiTrash2, FiCheck, FiX, FiUser, FiUsers, FiUserCheck, FiUserX } from "react-icons/fi";
import { PRIMARY, SUCCESS, ERROR, WARNING, GRAY, TEXT, BACKGROUND, BORDER } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import classApi from "../../api/classApi";

const StudentManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get("filter") || "all";
    const initialStudentsData = [
        {
            studentId: 1,
            studentCode: "HS001",
            firstName: "Nguyễn Văn",
            lastName: "An",
            dateOfBirth: "2015-03-15T00:00:00",
            gender: "Nam",
            className: "1A",
            gradeLevel: 1,
            address: "123 Đường ABC, Quận 1, TP.HCM",
            parentId: 1,
            isActive: true
        },
        {
            studentId: 2,
            studentCode: "HS002",
            firstName: "Trần Thị",
            lastName: "Bình",
            dateOfBirth: "2015-07-22T00:00:00",
            gender: "Nữ",
            className: "1A",
            gradeLevel: 1,
            address: "456 Đường XYZ, Quận 2, TP.HCM",
            parentId: 2,
            isActive: true
        },
        {
            studentId: 3,
            studentCode: "HS003",
            firstName: "Lê Văn",
            lastName: "Cường",
            dateOfBirth: "2015-12-10T00:00:00",
            gender: "Nam",
            className: "1B",
            gradeLevel: 1,
            address: "789 Đường DEF, Quận 3, TP.HCM",
            parentId: 3,
            isActive: false
        },
        {
            studentId: 4,
            studentCode: "HS004",
            firstName: "Phạm Thị",
            lastName: "Diệu",
            dateOfBirth: "2015-05-08T00:00:00",
            gender: "Nữ",
            className: "1B",
            gradeLevel: 1,
            address: "321 Đường GHI, Quận 4, TP.HCM",
            parentId: 4,
            isActive: true
        },
        {
            studentId: 5,
            studentCode: "HS005",
            firstName: "Võ Văn",
            lastName: "Hoàng",
            dateOfBirth: "2015-09-18T00:00:00",
            gender: "Nam",
            className: "1C",
            gradeLevel: 1,
            address: "654 Đường JKL, Quận 5, TP.HCM",
            parentId: 5,
            isActive: true
        },
        {
            studentId: 6,
            studentCode: "HS006",
            firstName: "Nguyễn Thị",
            lastName: "Mai",
            dateOfBirth: "2014-03-15T00:00:00",
            gender: "Nữ",
            className: "2A",
            gradeLevel: 2,
            address: "123 Đường ABC, Quận 1, TP.HCM",
            parentId: 1,
            isActive: true
        }
    ];

    const [students, setStudents] = useState(initialStudentsData);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(initialFilter);
    const [filterGrade, setFilterGrade] = useState("all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
    });
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 5;
    const [classes, setClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [classStats, setClassStats] = useState({
        totalClasses: 0,
        classesPerGrade: {}
    });
    const [academicYears] = useState(Array.from({ length: 6 }, (_, i) => 2025 + i));
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(2025);
    const [showFilters, setShowFilters] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, debouncedSearchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchClasses();
    }, [filterGrade, selectedAcademicYear]);

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStudents(initialStudentsData);
            const total = initialStudentsData.length;
            const active = initialStudentsData.filter(item => item.isActive).length;
            const inactive = initialStudentsData.filter(item => !item.isActive).length;
            setStats({ total, active, inactive });
        } catch (error) {
            console.error("Error fetching students:", error);
            showAlert("error", "Lỗi", "Không thể tải danh sách học sinh. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        setLoadingClasses(true);
        try {
            const response = await classApi.getSchoolClass({
                pageIndex: 1,
                pageSize: 1000,
                grade: filterGrade !== "all" ? parseInt(filterGrade) : '',
                academicYear: selectedAcademicYear
            });

            if (response.success) {
                setClasses(response.data);

                const classesPerGrade = response.data.reduce((acc, cls) => {
                    acc[cls.grade] = (acc[cls.grade] || 0) + 1;
                    return acc;
                }, {});

                setClassStats({
                    totalClasses: response.totalCount,
                    classesPerGrade
                });
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể tải danh sách lớp học");
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
            showAlert("error", "Lỗi", "Không thể tải danh sách lớp học. Vui lòng thử lại.");
        } finally {
            setLoadingClasses(false);
        }
    };

    // Handle filter change
    const handleFilterChange = (status) => {
        setFilterStatus(status);

        // Update URL
        const params = new URLSearchParams(location.search);
        params.set("filter", status);
        navigate({ search: params.toString() });
    };

    // Reset filters
    const resetFilters = () => {
        setFilterStatus("all");
        setFilterGrade("all");
        setSelectedClass("all");
        setSearchTerm("");
        setSortBy("name");
        setSortOrder("asc");
        setCurrentPage(1);
        setSelectedAcademicYear(2025); // Reset to default year

        // Update URL
        const params = new URLSearchParams(location.search);
        params.delete("filter");
        navigate({ search: params.toString() });
    };

    // Filter students based on search term, status and grade
    const filteredStudents = students.filter((item) => {
        // Filter by search term
        const fullName = `${item.firstName || ""} ${item.lastName || ""}`.trim();
        const matchesSearch =
            fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.studentCode &&
                item.studentCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.studentId && item.studentId.toString().includes(searchTerm));

        // Filter by status
        let matchesStatus = true;
        if (filterStatus === "active") {
            matchesStatus = item.isActive;
        } else if (filterStatus === "inactive") {
            matchesStatus = !item.isActive;
        }

        // Filter by grade level
        let matchesGrade = true;
        if (filterGrade !== "all") {
            matchesGrade = item.gradeLevel === parseInt(filterGrade);
        }

        // Filter by class
        let matchesClass = true;
        if (selectedClass !== "all") {
            matchesClass = item.className === selectedClass;
        }

        return matchesSearch && matchesStatus && matchesGrade && matchesClass;
    });

    // Sort students
    const sortedStudents = [...filteredStudents].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case "name":
                const fullNameA = `${a.lastName || ""} ${a.firstName || ""}`.trim();
                const fullNameB = `${b.lastName || ""} ${b.firstName || ""}`.trim();
                comparison = fullNameA.localeCompare(fullNameB);
                break;
            case "id":
                comparison = a.studentId - b.studentId;
                break;
            case "dob":
                comparison = new Date(a.dateOfBirth) - new Date(b.dateOfBirth);
                break;
            case "gradeLevel":
                comparison = a.gradeLevel - b.gradeLevel;
                break;
            default:
                comparison = 0;
        }

        return sortOrder === "asc" ? comparison : -comparison;
    });

    // Pagination calculations
    const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

    // Handle sort change
    function handleSortChange(column) {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    // Get full name
    const getFullName = (student) => {
        return `${student.firstName || ""} ${student.lastName || ""}`.trim();
    };

    // Get unique classes by grade level
    const getClassesByGrade = (gradeLevel) => {
        if (gradeLevel === "all") return [];
        return classes
            .filter(cls => cls.grade === parseInt(gradeLevel))
            .map(cls => cls.name)
            .sort();
    };

    // Handle grade selection
    const handleGradeSelection = (grade) => {
        setFilterGrade(grade);
        setSelectedClass("all"); // Reset class selection when grade changes
        setCurrentPage(1);
    };

    // Handle class selection  
    const handleClassSelection = (className) => {
        setSelectedClass(className);
        setCurrentPage(1);
    };

    // Handle academic year change
    const handleAcademicYearChange = (year) => {
        setSelectedAcademicYear(parseInt(year));
        setSelectedClass("all"); // Reset selected class when year changes
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách học sinh..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Quản lý học sinh
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Theo dõi và quản lý danh sách học sinh tại trường
                            </p>
                        </div>
                        <button
                            className="px-6 py-3 rounded-xl flex items-center font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            style={{
                                background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                color: TEXT.INVERSE
                            }}
                        >
                            <FiPlus className="mr-2 h-5 w-5" />
                            Thêm học sinh mới
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                            borderColor: PRIMARY[200]
                        }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Tổng số học sinh
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.total}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUsers className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`,
                            borderColor: SUCCESS[200]
                        }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Học sinh đang học
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.active}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUserCheck className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${WARNING[500]} 0%, ${WARNING[600]} 100%)`,
                            borderColor: WARNING[200]
                        }}
                    >
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Học sinh đã nghỉ học
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.inactive}
                                    </p>
                                </div>
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUserX className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div
                    className="rounded-2xl shadow-xl border backdrop-blur-sm mb-6 sm:mb-8"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: BORDER.LIGHT,
                    }}
                >
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-8">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
                                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{
                                            borderColor: BORDER.DEFAULT,
                                            backgroundColor: BACKGROUND.DEFAULT,
                                            focusRingColor: PRIMARY[500] + '40'
                                        }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex gap-3">
                                <select
                                    className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        focusRingColor: PRIMARY[500] + '40'
                                    }}
                                    value={selectedAcademicYear}
                                    onChange={(e) => handleAcademicYearChange(parseInt(e.target.value))}
                                >
                                    {academicYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year} - {year + 1}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{
                                        borderColor: BORDER.DEFAULT,
                                        backgroundColor: BACKGROUND.DEFAULT,
                                        focusRingColor: PRIMARY[500] + '40'
                                    }}
                                    value={filterStatus}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="active">Đang học</option>
                                    <option value="inactive">Đã nghỉ</option>
                                </select>

                                <button
                                    onClick={resetFilters}
                                    className="flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 font-medium border"
                                    style={{
                                        color: PRIMARY[600],
                                        borderColor: PRIMARY[200],
                                        backgroundColor: PRIMARY[50]
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = PRIMARY[100];
                                        e.target.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = PRIMARY[50];
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    <FiRefreshCw className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Filter Status Indicator */}
                            {(filterGrade !== "all" || selectedClass !== "all") && (
                                <div className="lg:col-span-12">
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: PRIMARY[50], border: `1px solid ${PRIMARY[200]}` }}>
                                        <div className="flex items-center gap-2 text-sm" style={{ color: PRIMARY[700] }}>
                                            <span className="font-medium">Đang lọc:</span>
                                            {filterGrade !== "all" && (
                                                <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                                    Khối {filterGrade}
                                                </span>
                                            )}
                                            {selectedClass !== "all" && (
                                                <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: SUCCESS[100], color: SUCCESS[700] }}>
                                                    Lớp {selectedClass}
                                                </span>
                                            )}
                                            <button
                                                onClick={resetFilters}
                                                className="ml-auto text-xs hover:underline"
                                                style={{ color: ERROR[600] }}
                                            >
                                                Xóa bộ lọc
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Filters Section */}
                            <div className="lg:col-span-12">
                                {/* Filters Toggle Header */}
                                <div
                                    className="flex items-center justify-between cursor-pointer border-b pb-4 mb-4"
                                    style={{ borderColor: BORDER.DEFAULT }}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <h4 className="font-semibold text-base" style={{ color: GRAY[700] }}>
                                        Bộ lọc nâng cao
                                    </h4>
                                    <div className="flex items-center gap-2" style={{ color: PRIMARY[600] }}>
                                        <span className="text-sm">
                                            {showFilters ? 'Thu gọn' : 'Mở rộng'}
                                        </span>
                                        <div
                                            className="transform transition-transform duration-200"
                                            style={{ transform: showFilters ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters Content */}
                                <div className={`space-y-4 transition-all duration-300 ${showFilters ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'
                                    }`}>
                                    {/* Grade Level Filter */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3" style={{ color: GRAY[700] }}>
                                            Lọc theo khối lớp:
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                            <button
                                                onClick={() => handleGradeSelection("all")}
                                                className="w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                                                style={{
                                                    backgroundColor: filterGrade === "all" ? PRIMARY[500] : 'white',
                                                    color: filterGrade === "all" ? 'white' : GRAY[700],
                                                    border: `2px solid ${filterGrade === "all" ? PRIMARY[500] : GRAY[300]}`,
                                                    boxShadow: filterGrade === "all" ? `0 4px 12px ${PRIMARY[200]}` : 'none'
                                                }}
                                            >
                                                Tất cả ({classStats.totalClasses || 0})
                                            </button>
                                            {[1, 2, 3, 4, 5].map((grade) => (
                                                <button
                                                    key={grade}
                                                    onClick={() => handleGradeSelection(grade.toString())}
                                                    className="w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                                                    style={{
                                                        backgroundColor: filterGrade === grade.toString() ? PRIMARY[500] : 'white',
                                                        color: filterGrade === grade.toString() ? 'white' : GRAY[700],
                                                        border: `2px solid ${filterGrade === grade.toString() ? PRIMARY[500] : GRAY[300]}`,
                                                        boxShadow: filterGrade === grade.toString() ? `0 4px 12px ${PRIMARY[200]}` : 'none'
                                                    }}
                                                >
                                                    Khối {grade} ({classStats.classesPerGrade[grade] || 0})
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Class Filter */}
                                    {filterGrade !== "all" && (
                                        <div>
                                            <h4 className="font-semibold text-sm mb-3" style={{ color: GRAY[700] }}>
                                                Lọc theo lớp học (Khối {filterGrade}):
                                            </h4>
                                            {loadingClasses ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <Loading type="medical" size="small" color="primary" text="Đang tải danh sách lớp..." />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                                    <button
                                                        onClick={() => handleClassSelection("all")}
                                                        className="w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                                                        style={{
                                                            backgroundColor: selectedClass === "all" ? PRIMARY[500] : 'white',
                                                            color: selectedClass === "all" ? 'white' : GRAY[700],
                                                            border: `2px solid ${selectedClass === "all" ? PRIMARY[500] : GRAY[300]}`,
                                                            boxShadow: selectedClass === "all" ? `0 4px 12px ${PRIMARY[500]}` : 'none'
                                                        }}
                                                    >
                                                        Tất cả lớp
                                                    </button>
                                                    {getClassesByGrade(filterGrade).map((className) => (
                                                        <button
                                                            key={className}
                                                            onClick={() => handleClassSelection(className)}
                                                            className="w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                                                            style={{
                                                                backgroundColor: selectedClass === className ? PRIMARY[500] : 'white',
                                                                color: selectedClass === className ? 'white' : GRAY[700],
                                                                border: `2px solid ${selectedClass === className ? PRIMARY[500] : GRAY[300]}`,
                                                                boxShadow: selectedClass === className ? `0 4px 12px ${PRIMARY[200]}` : 'none'
                                                            }}
                                                        >
                                                            {className}
                                                            {classes.find(cls => cls.name === className) && (
                                                                <span className="ml-1">
                                                                    ({classes.find(cls => cls.name === className).studentCount})
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl shadow-lg border mb-6" style={{ borderColor: BORDER.DEFAULT }}>
                    <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: PRIMARY[50] }}>
                                        <th
                                            className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("name")}
                                        >
                                            <div className="flex items-center">
                                                <span className="hidden sm:inline">Họ tên</span>
                                                <span className="sm:hidden">Tên</span>
                                                {sortBy === "name" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="hidden sm:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("dob")}
                                        >
                                            <div className="flex items-center">
                                                <span className="hidden lg:inline">Ngày sinh</span>
                                                <span className="lg:hidden">NS</span>
                                                {sortBy === "dob" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="hidden md:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                            <span className="hidden lg:inline">Giới tính</span>
                                            <span className="lg:hidden">GT</span>
                                        </th>
                                        <th
                                            className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("gradeLevel")}
                                        >
                                            <div className="flex items-center">
                                                Lớp
                                                {sortBy === "gradeLevel" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="hidden lg:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                            Địa chỉ
                                        </th>
                                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                            <span className="hidden sm:inline">Trạng thái</span>
                                            <span className="sm:hidden">TT</span>
                                        </th>
                                        <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>
                                            <span className="hidden sm:inline">Thao tác</span>
                                            <span className="sm:hidden">TT</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <Loading
                                                        type="medical"
                                                        size="xl"
                                                        color="primary"
                                                        text="Đang tải danh sách học sinh..."
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentStudents.length > 0 ? (
                                        currentStudents.map((student, index) => (
                                            <tr
                                                key={student.studentId}
                                                className="hover:bg-opacity-50 transition-all duration-200 group"
                                                style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] || '#fafafa' }}
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {getFullName(student)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="hidden sm:table-cell py-4 px-6 text-center align-middle text-sm" style={{ color: TEXT.PRIMARY }}>
                                                    {formatDate(student.dateOfBirth)}
                                                </td>
                                                <td className="hidden md:table-cell py-4 px-6 text-center align-middle text-sm" style={{ color: TEXT.PRIMARY }}>
                                                    {student.gender}
                                                </td>
                                                <td className="py-4 px-6 text-center align-middle text-sm" style={{ color: TEXT.PRIMARY }}>
                                                    {student.className}
                                                </td>
                                                <td className="hidden lg:table-cell py-4 px-6 text-center align-middle text-sm truncate max-w-[150px]" style={{ color: TEXT.PRIMARY }}>
                                                    {student.address}
                                                </td>
                                                <td className="py-4 px-6 text-center align-middle">
                                                    <span
                                                        className="inline-flex items-center justify-center px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-md sm:rounded-lg lg:rounded-xl text-xs sm:text-xs lg:text-xs font-bold whitespace-nowrap min-w-0"
                                                        style={{
                                                            backgroundColor: student.isActive ? SUCCESS[100] : WARNING[100],
                                                            color: student.isActive ? SUCCESS[800] : WARNING[800],
                                                            border: `2px solid ${student.isActive ? SUCCESS[200] : WARNING[200]}`
                                                        }}
                                                    >
                                                        <span className="hidden lg:inline">{student.isActive ? "Hoạt động" : "Ngừng hoạt động"}</span>
                                                        <span className="hidden sm:inline lg:hidden text-xs">{student.isActive ? "Hoạt động" : "Tạm ngưng"}</span>
                                                        <span className="sm:hidden text-xs">{student.isActive ? "✓" : "✗"}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center align-middle">
                                                    <div className="flex space-x-1 sm:space-x-2 lg:space-x-3 justify-center">
                                                        <button
                                                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-110"
                                                            style={{
                                                                backgroundColor: PRIMARY[100],
                                                                color: PRIMARY[600]
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = PRIMARY[200];
                                                                e.target.style.color = PRIMARY[700];
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = PRIMARY[100];
                                                                e.target.style.color = PRIMARY[600];
                                                            }}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FiEdit className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                        </button>
                                                        <button
                                                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-110"
                                                            style={{
                                                                backgroundColor: student.isActive ? WARNING[100] : SUCCESS[100],
                                                                color: student.isActive ? WARNING[600] : SUCCESS[600]
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = student.isActive ? WARNING[200] : SUCCESS[200];
                                                                e.target.style.color = student.isActive ? WARNING[700] : SUCCESS[700];
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = student.isActive ? WARNING[100] : SUCCESS[100];
                                                                e.target.style.color = student.isActive ? WARNING[600] : SUCCESS[600];
                                                            }}
                                                            title={
                                                                student.isActive
                                                                    ? "Đánh dấu ngừng hoạt động"
                                                                    : "Đánh dấu đang hoạt động"
                                                            }
                                                        >
                                                            {student.isActive ? (
                                                                <FiX className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                            ) : (
                                                                <FiCheck className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                            )}
                                                        </button>
                                                        <button
                                                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-110"
                                                            style={{
                                                                backgroundColor: ERROR[100],
                                                                color: ERROR[600]
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = ERROR[200];
                                                                e.target.style.color = ERROR[700];
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = ERROR[100];
                                                                e.target.style.color = ERROR[600];
                                                            }}
                                                            title="Xóa"
                                                        >
                                                            <FiTrash2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div
                                                        className="h-20 w-20 rounded-full flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: GRAY[100] }}
                                                    >
                                                        <FiUser className="h-10 w-10" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        {sortedStudents.length === 0 ? "Không có học sinh nào phù hợp" : "Không có dữ liệu trang này"}
                                                    </p>
                                                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                                                        {sortedStudents.length === 0 ?
                                                            "Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác" :
                                                            "Vui lòng chọn trang khác hoặc điều chỉnh bộ lọc"
                                                        }
                                                    </p>
                                                    {sortedStudents.length === 0 ? (
                                                        <button
                                                            onClick={resetFilters}
                                                            className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                            style={{
                                                                backgroundColor: PRIMARY[100],
                                                                color: PRIMARY[700]
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[200]}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[100]}
                                                        >
                                                            <FiRefreshCw className="mr-2 h-4 w-4" />
                                                            Đặt lại bộ lọc
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setCurrentPage(1)}
                                                            className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                            style={{
                                                                backgroundColor: PRIMARY[100],
                                                                color: PRIMARY[700]
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[200]}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[100]}
                                                        >
                                                            Về trang đầu
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                            <div className="mb-4 sm:mb-0" style={{ color: TEXT.SECONDARY }}>
                                <span className="text-sm">
                                    Hiển thị {indexOfFirstStudent + 1}-{Math.min(indexOfLastStudent, sortedStudents.length)} trong tổng số {sortedStudents.length} học sinh
                                </span>
                            </div>

                            <div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: currentPage === 1 ? BORDER.DEFAULT : PRIMARY[300],
                                            color: currentPage === 1 ? TEXT.SECONDARY : PRIMARY[600],
                                            backgroundColor: BACKGROUND.DEFAULT
                                        }}
                                    >
                                        <svg
                                            className="h-4 w-4 lg:h-5 lg:w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                        <button
                                            key={number}
                                            onClick={() => setCurrentPage(number)}
                                            className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                                            style={{
                                                borderColor: currentPage === number ? PRIMARY[500] : BORDER.DEFAULT,
                                                backgroundColor: currentPage === number ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                                color: currentPage === number ? TEXT.INVERSE : TEXT.PRIMARY
                                            }}
                                        >
                                            {number}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            borderColor: currentPage === totalPages ? BORDER.DEFAULT : PRIMARY[300],
                                            color: currentPage === totalPages ? TEXT.SECONDARY : PRIMARY[600],
                                            backgroundColor: BACKGROUND.DEFAULT
                                        }}
                                    >
                                        <svg
                                            className="h-4 w-4 lg:h-5 lg:w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                />
            </div>
        </div>
    );
};

export default StudentManagement;