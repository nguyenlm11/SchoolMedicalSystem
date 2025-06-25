import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiRefreshCw, FiUser, FiUsers, FiUserCheck, FiUserX, FiTrash2, FiEye, FiDownload, FiUpload, FiFileText } from "react-icons/fi";
import { PRIMARY, SUCCESS, ERROR, WARNING, GRAY, TEXT, BACKGROUND, BORDER, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import classApi from "../../api/classApi";
import userApi from "../../api/userApi";

const StudentManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get("filter") || "all";
    const [students, setStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const studentsPerPage = 10;
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(initialFilter);
    const [filterGrade, setFilterGrade] = useState("all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [classes, setClasses] = useState([]);
    const [academicYears] = useState(Array.from({ length: 6 }, (_, i) => 2025 + i));
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(2025);
    const [showFilters, setShowFilters] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, [currentPage, debouncedSearchTerm, sortBy, sortOrder, selectedClass, selectedAcademicYear, filterGrade]);

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
        // setLoading(true);
        try {
            const params = {
                pageIndex: currentPage,
                pageSize: studentsPerPage,
                searchTerm: debouncedSearchTerm,
                orderBy: `${sortBy}_${sortOrder}`,
                classId: selectedClass !== "all" ? selectedClass : undefined
            };
            const response = await userApi.getStudents(params);
            if (response.success) {
                const filteredData = response.data.filter(student => {
                    const hasClassInYear = student.classes.some(c => c.academicYear === selectedAcademicYear);
                    if (!hasClassInYear) return false;
                    if (filterGrade !== "all") {
                        const hasClassInGrade = student.classes.some(c =>
                            c.academicYear === selectedAcademicYear &&
                            c.grade === parseInt(filterGrade)
                        );
                        if (!hasClassInGrade) return false;
                    }
                    return true;
                });
                setStudents(filteredData);
                setTotalStudents(filteredData.length);
                setTotalPages(Math.ceil(filteredData.length / studentsPerPage));
                const total = filteredData.length;
                const active = filteredData.filter(item =>
                    item.classes.some(c =>
                        c.academicYear === selectedAcademicYear &&
                        c.isActive &&
                        (filterGrade === "all" || c.grade === parseInt(filterGrade))
                    )
                ).length;
                const inactive = total - active;
                setStats({ total, active, inactive });
            }
            else {
                showAlert("error", "Lỗi", response.message || "Không thể tải danh sách học sinh");
            }
        } catch (error) {
            showAlert("error", "Lỗi", "Không thể tải danh sách học sinh. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        // setLoadingClasses(true);
        try {
            const response = await classApi.getSchoolClass({
                pageIndex: 1,
                pageSize: 1000,
                grade: filterGrade !== "all" ? parseInt(filterGrade) : '',
                academicYear: selectedAcademicYear
            });
            if (response.success) {
                setClasses(response.data);
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể tải danh sách lớp học");
            }
        } catch (error) {
            showAlert("error", "Lỗi", "Không thể tải danh sách lớp học. Vui lòng thử lại.");
        } finally {
            // setLoadingClasses(false);
        }
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        const params = new URLSearchParams(location.search);
        params.set("filter", status);
        navigate({ search: params.toString() });
    };

    const resetFilters = () => {
        setFilterStatus("all");
        setFilterGrade("all");
        setSelectedClass("all");
        setSearchTerm("");
        setSortBy("name");
        setSortOrder("asc");
        setCurrentPage(1);
        setSelectedAcademicYear(2025);
        const params = new URLSearchParams(location.search);
        params.delete("filter");
        navigate({ search: params.toString() });
    };

    const getCurrentClass = (student) => {
        if (!student.classes || student.classes.length === 0) return null;
        const currentYearClasses = student.classes.filter(c =>
            c.academicYear === selectedAcademicYear &&
            (filterGrade === "all" || c.grade === parseInt(filterGrade))
        );
        if (currentYearClasses.length === 0) return null;
        return currentYearClasses.find(c => c.isActive) || currentYearClasses[0];
    };

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const currentClass = getCurrentClass(student);
            if (!currentClass) return false;
            if (filterStatus === "active") {
                return currentClass.isActive;
            } else if (filterStatus === "inactive") {
                return !currentClass.isActive;
            }
            return true;
        });
    }, [students, filterStatus, selectedAcademicYear, filterGrade]);

    useEffect(() => {
        const total = filteredStudents.length;
        const active = filteredStudents.filter(student => {
            const currentClass = getCurrentClass(student);
            return currentClass?.isActive;
        }).length;
        const inactive = total - active;
        setStats({ total, active, inactive });
    }, [filteredStudents]);

    const sortedStudents = useMemo(() => {
        return [...filteredStudents].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case "name":
                    const fullNameA = `${a.lastName || ""} ${a.firstName || ""}`.trim();
                    const fullNameB = `${b.lastName || ""} ${b.firstName || ""}`.trim();
                    comparison = fullNameA.localeCompare(fullNameB);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [filteredStudents, sortBy, sortOrder]);

    function handleSortChange(column) {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    const getClassesByGrade = (gradeLevel) => {
        if (gradeLevel === "all") return [];
        return classes.filter(cls => cls.grade === parseInt(gradeLevel)).sort((a, b) => a.name.localeCompare(b.name));
    };

    const handleGradeSelection = (grade) => {
        setFilterGrade(grade);
        setSelectedClass("all");
        setCurrentPage(1);
    };

    const handleClassSelection = (classId) => {
        setSelectedClass(classId);
        setCurrentPage(1);
    };

    const handleAcademicYearChange = (year) => {
        setSelectedAcademicYear(parseInt(year));
        setSelectedClass("all");
        setFilterGrade("all");
        setCurrentPage(1);
    };

    const handleDelete = async () => {
        if (!selectedStudent) return;
        setIsDeleting(true);
        try {
            const response = await userApi.deleteStudent(selectedStudent.id);
            if (response.success) {
                showAlert("success", "Thành công", "Đã xóa học sinh thành công");
                fetchStudents();
            } else {
                showAlert("error", "Lỗi", response.message || "Không thể xóa học sinh. Vui lòng thử lại.");
            }
        } catch (error) {
            showAlert("error", "Lỗi", "Không thể xóa học sinh. Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
            setShowConfirmModal(false);
            setSelectedStudent(null);
        }
    };

    const handleTemplateDownload = async () => {
        try {
            const response = await userApi.downloadStudentTemplate();
            if (response.success) {
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                // Lấy tên file từ Content-Disposition header
                const contentDisposition = response.headers['content-disposition'];
                const filenameMatch = contentDisposition.match(/filename=(.*?)(;|$)/);
                const fileName = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : 'student_template.xlsx';
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            showAlert("error", "Lỗi", `Không thể tải xuống mẫu. ${error.message || 'Vui lòng thử lại sau.'}`);
        }
    };

    const handleImport = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx';
        input.style.display = 'none';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setImportLoading(true);
            try {
                const response = await userApi.importStudentList(file);
                if (response.success) {
                    const resultData = response.data;
                    setImportResult({
                        totalRows: resultData.totalRows,
                        successRows: resultData.successRows,
                        errorRows: resultData.errorRows,
                        validData: resultData.validData,
                        invalidData: resultData.invalidData,
                        errors: resultData.errors
                    });
                    showAlert("success", "Thành công", "Nhập danh sách học sinh thành công!");
                    if (resultData.successRows > 0) { fetchStudents() }
                } else {
                    throw new Error(response.message || 'Có lỗi xảy ra khi nhập file');
                }
            } catch (error) {
                showAlert("error", "Lỗi", error.message || "Không thể nhập danh sách học sinh");
            } finally {
                setImportLoading(false);
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };

    const handleExport = async () => {
        try {
            const response = await userApi.exportStudentList();
            if (response.success) {
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                // Lấy tên file từ Content-Disposition header
                const contentDisposition = response.headers['content-disposition'];
                const filenameMatch = contentDisposition.match(/filename=(.*?)(;|$)/);
                const fileName = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : 'students.xlsx';
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            showAlert("error", "Lỗi", `Không thể xuất danh sách. ${error.message || 'Vui lòng thử lại sau.'}`);
        }
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
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleTemplateDownload}
                                className="inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{ backgroundColor: INFO[600], color: 'white', borderColor: INFO[600] }}
                            >
                                <FiFileText className="h-4 w-4 mr-2" />
                                Lấy mẫu
                            </button>

                            <button
                                onClick={handleImport}
                                className="inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{ backgroundColor: SUCCESS[600], color: 'white', borderColor: SUCCESS[600] }}
                                disabled={importLoading}
                            >
                                {importLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang nhập...
                                    </>
                                ) : (
                                    <>
                                        <FiUpload className="h-4 w-4 mr-2" />
                                        Tải lên danh sách
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleExport}
                                className="inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{ backgroundColor: WARNING[600], color: 'white', borderColor: WARNING[600] }}
                            >
                                <FiDownload className="h-4 w-4 mr-2" />
                                Tải xuống danh sách
                            </button>

                            <button
                                className="px-6 py-3 rounded-xl flex items-center font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, color: TEXT.INVERSE }}
                            >
                                <FiPlus className="mr-2 h-5 w-5" />
                                Thêm học sinh mới
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div
                        className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, borderColor: PRIMARY[200] }}
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
                        style={{ background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`, borderColor: SUCCESS[200] }}
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
                        style={{ background: `linear-gradient(135deg, ${WARNING[500]} 0%, ${WARNING[600]} 100%)`, borderColor: WARNING[200] }}
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
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}
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
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex gap-3">
                                <select
                                    className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
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
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
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
                                    style={{ color: PRIMARY[600], borderColor: PRIMARY[200], backgroundColor: PRIMARY[50] }}
                                >
                                    <FiRefreshCw className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Filters Section */}
                            <div className="lg:col-span-12">
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
                                                Tất cả
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
                                                    Khối {grade}
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
                                                {getClassesByGrade(filterGrade).map((cls) => (
                                                    <button
                                                        key={cls.id}
                                                        onClick={() => handleClassSelection(cls.id)}
                                                        className="w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                                                        style={{
                                                            backgroundColor: selectedClass === cls.id ? PRIMARY[500] : 'white',
                                                            color: selectedClass === cls.id ? 'white' : GRAY[700],
                                                            border: `2px solid ${selectedClass === cls.id ? PRIMARY[500] : GRAY[300]}`,
                                                            boxShadow: selectedClass === cls.id ? `0 4px 12px ${PRIMARY[200]}` : 'none'
                                                        }}
                                                    >
                                                        {cls.name}
                                                        <span className="ml-1">
                                                            ({cls.studentCount})
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
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
                                            className="py-4 px-6 text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200 whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("name")}
                                        >
                                            <div className="flex items-center">
                                                <span>HỌ TÊN</span>
                                                {sortBy === "name" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200 whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("dob")}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>MÃ HỌC SINH</span>
                                                {sortBy === "studentCode" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                        >
                                            NGÀY SINH
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200 whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                            onClick={() => handleSortChange("dob")}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>GIỚI TÍNH</span>
                                                {sortBy === "gender" && (
                                                    <span className="ml-2 text-xs">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                        >
                                            LỚP
                                        </th>
                                        <th
                                            className="py-4 px-6 text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                        >
                                            ĐỊA CHỈ
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                        >
                                            TRẠNG THÁI
                                        </th>
                                        <th
                                            className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
                                            style={{ color: TEXT.PRIMARY }}
                                        >
                                            THAO TÁC
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12">
                                                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách học sinh..." />
                                            </td>
                                        </tr>
                                    ) : students.length > 0 ? (
                                        students.map((student) => {
                                            const currentClass = getCurrentClass(student);
                                            return (
                                                <tr
                                                    key={student.id}
                                                    className="hover:bg-opacity-50 transition-all duration-200"
                                                    style={{ backgroundColor: 'transparent' }}
                                                >
                                                    <td className="py-4 px-6">
                                                        <span className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                                            {student.fullName}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center" style={{ color: TEXT.PRIMARY }}>
                                                        {student.studentCode || 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-6 text-center" style={{ color: TEXT.PRIMARY }}>
                                                        {formatDate(student.dateOfBirth)}
                                                    </td>
                                                    <td className="py-4 px-6 text-center" style={{ color: TEXT.PRIMARY }}>
                                                        {student.gender === 'Male' ? 'Nam' : 'Nữ'}
                                                    </td>
                                                    <td className="py-4 px-6 text-center" style={{ color: TEXT.PRIMARY }}>
                                                        {student.currentClassName || 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-6" style={{ color: TEXT.PRIMARY }}>
                                                        {student.address || 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span
                                                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium"
                                                            style={{
                                                                backgroundColor: currentClass?.isActive ? SUCCESS[50] : WARNING[50],
                                                                color: currentClass?.isActive ? SUCCESS[700] : WARNING[700],
                                                                border: `1px solid ${currentClass?.isActive ? SUCCESS[200] : WARNING[200]}`
                                                            }}
                                                        >
                                                            {currentClass?.isActive ? "Đang học" : "Đã nghỉ"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-80"
                                                                style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600], border: `1px solid ${PRIMARY[200]}` }}
                                                                onClick={() => navigate(`/manager/student-management/${student.id}`)}
                                                                title="Xem chi tiết"
                                                            >
                                                                <FiEye className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-80"
                                                                style={{ backgroundColor: ERROR[50], color: ERROR[600], border: `1px solid ${ERROR[200]}` }}
                                                                onClick={() => { setSelectedStudent(student); setShowConfirmModal(true) }}
                                                                title="Xóa"
                                                            >
                                                                <FiTrash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
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
                                                            style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}
                                                        >
                                                            <FiRefreshCw className="mr-2 h-4 w-4" />
                                                            Đặt lại bộ lọc
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setCurrentPage(1)}
                                                            className="px-6 py-3 rounded-xl flex items-center transition-all duration-300 font-medium"
                                                            style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}
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
                                    Hiển thị {(currentPage - 1) * studentsPerPage + 1}-{Math.min(currentPage * studentsPerPage, totalStudents)} trong tổng số {totalStudents} học sinh
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

                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => { setShowConfirmModal(false); setSelectedStudent(null) }}
                    onConfirm={handleDelete}
                    title="Xóa học sinh"
                    message={`Bạn có chắc chắn muốn xóa học sinh ${selectedStudent?.fullName || ''}?`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    type="error"
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
};

export default StudentManagement;