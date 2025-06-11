import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FiPlus,
    FiFilter,
    FiSearch,
    FiRefreshCw,
    FiEdit,
    FiEye,
    FiTrash2,
    FiCheck,
    FiX,
    FiUser,
    FiAlertTriangle,
} from "react-icons/fi";
import { PRIMARY, SUCCESS, ERROR, WARNING, GRAY, TEXT, BACKGROUND, BORDER } from "../../constants/colors";
import Loading from "../../components/Loading";

const StudentManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get("filter") || "all";

    // Hardcoded parent data
    const initialParentsData = [
        {
            parentId: 1,
            firstName: "Nguyễn Thị",
            lastName: "Lan",
            fullName: "Nguyễn Thị Lan",
            email: "nguyenthilan@email.com",
            isActive: true
        },
        {
            parentId: 2,
            firstName: "Trần Văn",
            lastName: "Minh",
            fullName: "Trần Văn Minh",
            email: "tranvanminh@email.com",
            isActive: true
        },
        {
            parentId: 3,
            firstName: "Lê Thị",
            lastName: "Hương",
            fullName: "Lê Thị Hương",
            email: "lethihuong@email.com",
            isActive: true
        },
        {
            parentId: 4,
            firstName: "Phạm Văn",
            lastName: "Đức",
            fullName: "Phạm Văn Đức",
            email: "phamvanduc@email.com",
            isActive: true
        },
        {
            parentId: 5,
            firstName: "Võ Thị",
            lastName: "Mai",
            fullName: "Võ Thị Mai",
            email: "vothimai@email.com",
            isActive: true
        }
    ];

    // Hardcoded student data
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
        },
        {
            studentId: 7,
            studentCode: "HS007",
            firstName: "Trần Văn",
            lastName: "Đức",
            dateOfBirth: "2014-07-22T00:00:00",
            gender: "Nam",
            className: "2A",
            gradeLevel: 2,
            address: "456 Đường XYZ, Quận 2, TP.HCM",
            parentId: 2,
            isActive: true
        },
        {
            studentId: 8,
            studentCode: "HS008",
            firstName: "Lê Thị",
            lastName: "Hạnh",
            dateOfBirth: "2014-12-10T00:00:00",
            gender: "Nữ",
            className: "2B",
            gradeLevel: 2,
            address: "789 Đường DEF, Quận 3, TP.HCM",
            parentId: 3,
            isActive: true
        }
    ];

    // State for student accounts
    const [students, setStudents] = useState(initialStudentsData);
    const [parents, setParents] = useState(initialParentsData);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(initialFilter);
    const [filterGrade, setFilterGrade] = useState("all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [stats, setStats] = useState({
        total: 0,
        inactive: 0,
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 5;

    // State for student creation/editing
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentForm, setStudentForm] = useState({
        studentId: 0,
        studentCode: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "Nam",
        className: "",
        gradeLevel: "",
        address: "",
        parentId: 0,
        isActive: true,
    });
    const [formErrors, setFormErrors] = useState({});

    // Simulate initial data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Calculate stats when students change
    useEffect(() => {
        const total = students.length;
        const inactive = students.filter((item) => !item.isActive).length;

        setStats({
            total,
            inactive,
        });
    }, [students]);

    // Create new student
    const createStudent = () => {
        if (!validateForm()) return;

        const newStudent = {
            studentId: Math.max(...students.map(s => s.studentId)) + 1,
            studentCode: studentForm.studentCode || `HS${String(Math.max(...students.map(s => s.studentId)) + 1).padStart(3, '0')}`,
            firstName: studentForm.firstName,
            lastName: studentForm.lastName,
            dateOfBirth: studentForm.dateOfBirth + "T00:00:00",
            gender: studentForm.gender,
            className: studentForm.className,
            gradeLevel: parseInt(studentForm.gradeLevel) || 0,
            address: studentForm.address,
            parentId: parseInt(studentForm.parentId),
            isActive: true
        };

        setStudents([...students, newStudent]);
        setShowStudentModal(false);
        resetForm();
        alert("Thêm học sinh thành công");
    };

    // Update student
    const updateStudent = () => {
        if (!validateForm()) return;

        const updatedStudents = students.map(student =>
            student.studentId === studentForm.studentId
                ? {
                    ...student,
                    studentCode: studentForm.studentCode,
                    firstName: studentForm.firstName,
                    lastName: studentForm.lastName,
                    dateOfBirth: studentForm.dateOfBirth + "T00:00:00",
                    gender: studentForm.gender,
                    className: studentForm.className,
                    gradeLevel: parseInt(studentForm.gradeLevel) || 0,
                    address: studentForm.address,
                    parentId: parseInt(studentForm.parentId),
                }
                : student
        );

        setStudents(updatedStudents);
        setShowStudentModal(false);
        resetForm();
    };

    // Delete student
    const deleteStudent = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa học sinh này không?")) {
            const updatedStudents = students.filter(student => student.studentId !== id);
            setStudents(updatedStudents);
        }
    };

    // Toggle student active status
    const toggleStudentStatus = (item) => {
        const updatedStudents = students.map(student =>
            student.studentId === item.studentId
                ? { ...student, isActive: !student.isActive }
                : student
        );
        setStudents(updatedStudents);
    };

    // Handle filter change
    const handleFilterChange = (status) => {
        setLoading(true);
        setFilterStatus(status);

        // Update URL
        const params = new URLSearchParams(location.search);
        params.set("filter", status);
        navigate({ search: params.toString() });

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 600);
    };

    // Reset filters
    const resetFilters = () => {
        setLoading(true);
        setFilterStatus("all");
        setFilterGrade("all");
        setSelectedClass("all");
        setSearchTerm("");
        setSortBy("name");
        setSortOrder("asc");
        setCurrentPage(1);

        // Update URL
        const params = new URLSearchParams(location.search);
        params.delete("filter");
        navigate({ search: params.toString() });

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 800);
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

    // Handle add/edit student
    const handleAddEditStudent = (item = null) => {
        if (item) {
            setStudentForm({
                studentId: item.studentId,
                studentCode: item.studentCode || "",
                firstName: item.firstName || "",
                lastName: item.lastName || "",
                dateOfBirth: item.dateOfBirth ? item.dateOfBirth.split("T")[0] : "",
                gender: item.gender || "Nam",
                className: item.className || "",
                gradeLevel: item.gradeLevel ? item.gradeLevel.toString() : "",
                address: item.address || "",
                parentId: item.parentId ? item.parentId.toString() : "",
                isActive: item.isActive,
            });
            setSelectedStudent(item);
        } else {
            resetForm();
            setSelectedStudent(null);
        }
        setShowStudentModal(true);
    };

    // Reset form
    const resetForm = () => {
        setStudentForm({
            studentId: 0,
            studentCode: "",
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            gender: "Nam",
            className: "",
            gradeLevel: "",
            address: "",
            parentId: "",
            isActive: true,
        });
        setFormErrors({});
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!studentForm.firstName.trim()) {
            errors.firstName = "Họ không được để trống";
        }
        if (!studentForm.lastName.trim()) {
            errors.lastName = "Tên không được để trống";
        }
        if (!studentForm.dateOfBirth) {
            errors.dateOfBirth = "Ngày sinh không được để trống";
        }
        if (!studentForm.parentId) {
            errors.parentId = "Vui lòng chọn phụ huynh";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setStudentForm({
            ...studentForm,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedStudent) {
            updateStudent();
        } else {
            createStudent();
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    // Get parent name
    const getParentName = (parentId) => {
        const parent = parents.find((p) => p.parentId === parentId);
        return parent ? parent.fullName : "Không xác định";
    };

    // Get full name
    const getFullName = (student) => {
        return `${student.firstName || ""} ${student.lastName || ""}`.trim();
    };

    // Get unique classes by grade level
    const getClassesByGrade = (gradeLevel) => {
        if (gradeLevel === "all") return [];
        return [...new Set(students
            .filter(student => student.gradeLevel === parseInt(gradeLevel))
            .map(student => student.className)
            .filter(className => className && className.trim())
        )].sort();
    };

    // Handle grade selection
    const handleGradeSelection = (grade) => {
        setLoading(true);
        setFilterGrade(grade);
        setSelectedClass("all"); // Reset class selection when grade changes
        setCurrentPage(1);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 600);
    };

    // Handle class selection  
    const handleClassSelection = (className) => {
        setLoading(true);
        setSelectedClass(className);
        setCurrentPage(1);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 600);
    };
    return (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border-0 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col mb-6 sm:mb-8">
                <div className="mb-4 sm:mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: GRAY[800] }}>
                        Quản lý học sinh
                    </h2>
                    <p className="mt-1 sm:mt-2 text-base sm:text-lg" style={{ color: GRAY[600] }}>
                        Theo dõi và quản lý danh sách học sinh tại trường
                    </p>
                </div>
                <div className="flex justify-center sm:justify-end">
                    <button
                        onClick={() => handleAddEditStudent()}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        style={{
                            backgroundColor: PRIMARY[500],
                            boxShadow: `0 4px 14px 0 ${PRIMARY[200]}`
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                        onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[500]}
                    >
                        <FiPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base">Thêm học sinh mới</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl flex justify-between items-center transform transition-all duration-300 hover:scale-105"
                    style={{
                        backgroundColor: PRIMARY[50],
                        border: `2px solid ${PRIMARY[100]}`,
                        boxShadow: `0 8px 25px -5px ${PRIMARY[100]}`
                    }}>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base" style={{ color: GRAY[600] }}>
                            Tổng số học sinh
                        </p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2" style={{ color: PRIMARY[700] }}>
                            {stats.total}
                        </p>
                    </div>
                    <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center ml-3"
                        style={{ backgroundColor: PRIMARY[500] }}>
                        <FiUser className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                    </div>
                </div>

                <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl flex justify-between items-center transform transition-all duration-300 hover:scale-105"
                    style={{
                        backgroundColor: WARNING[50],
                        border: `2px solid ${WARNING[100]}`,
                        boxShadow: `0 8px 25px -5px ${WARNING[100]}`
                    }}>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base" style={{ color: GRAY[600] }}>
                            Ngừng hoạt động
                        </p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2" style={{ color: WARNING[700] }}>
                            {stats.inactive}
                        </p>
                    </div>
                    <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center ml-3"
                        style={{ backgroundColor: WARNING[500] }}>
                        <FiX className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
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
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
                                    className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
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

                        <div className="flex gap-4">
                            <select
                                className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 min-w-[180px]"
                                style={{
                                    borderColor: BORDER.DEFAULT,
                                    backgroundColor: BACKGROUND.DEFAULT,
                                    focusRingColor: PRIMARY[500] + '40'
                                }}
                                value={filterStatus}
                                onChange={(e) => handleFilterChange(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Ngừng hoạt động</option>
                            </select>

                            <button
                                onClick={resetFilters}
                                className="flex items-center px-6 py-3 rounded-xl transition-all duration-200 font-medium border"
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
                                <FiRefreshCw className="mr-2 h-4 w-4" />
                                Đặt lại
                            </button>
                        </div>
                    </div>

                    {/* Filter Status Indicator */}
                    {(filterGrade !== "all" || selectedClass !== "all") && (
                        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: PRIMARY[50], border: `1px solid ${PRIMARY[200]}` }}>
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
                                    className="ml-2 text-xs hover:underline"
                                    style={{ color: ERROR[600] }}
                                >
                                    (Xóa bộ lọc)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Grade Level Filter Chips */}
                    <div className="flex flex-col gap-3 mt-4">
                        <h4 className="font-semibold text-sm sm:text-base" style={{ color: GRAY[700] }}>
                            Lọc theo khối lớp:
                        </h4>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <button
                                onClick={() => handleGradeSelection("all")}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105"
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
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                                    style={{
                                        backgroundColor: filterGrade === grade.toString() ? PRIMARY[500] : 'white',
                                        color: filterGrade === grade.toString() ? 'white' : GRAY[700],
                                        border: `2px solid ${filterGrade === grade.toString() ? PRIMARY[500] : GRAY[300]}`,
                                        boxShadow: filterGrade === grade.toString() ? `0 4px 12px ${PRIMARY[200]}` : 'none'
                                    }}
                                >
                                    <span className="hidden sm:inline">Khối {grade}</span>
                                    <span className="sm:hidden">{grade}</span>
                                </button>
                            ))}
                        </div>

                        {/* Class Filter Chips - Show when a grade is selected */}
                        {filterGrade !== "all" && getClassesByGrade(filterGrade).length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-sm sm:text-base mb-3" style={{ color: GRAY[700] }}>
                                    Lọc theo lớp học (Khối {filterGrade}):
                                </h4>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    <button
                                        onClick={() => handleClassSelection("all")}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105"
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
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                                            style={{
                                                backgroundColor: selectedClass === className ? PRIMARY[500] : 'white',
                                                color: selectedClass === className ? 'white' : GRAY[700],
                                                border: `2px solid ${selectedClass === className ? PRIMARY[500] : GRAY[300]}`,
                                                boxShadow: selectedClass === className ? `0 4px 12px ${PRIMARY[200]}` : 'none'
                                            }}
                                        >
                                            Lớp {className}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: GRAY[50] }}>
                                    <th
                                        className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                        style={{ color: TEXT.SECONDARY }}
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
                                        style={{ color: TEXT.SECONDARY }}
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
                                    <th className="hidden md:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                        <span className="hidden lg:inline">Giới tính</span>
                                        <span className="lg:hidden">GT</span>
                                    </th>
                                    <th
                                        className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                                        style={{ color: TEXT.SECONDARY }}
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
                                    <th className="hidden lg:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                        Địa chỉ
                                    </th>
                                    <th className="hidden sm:table-cell py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                        <span className="hidden lg:inline">Phụ huynh</span>
                                        <span className="lg:hidden">PH</span>
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                        <span className="hidden sm:inline">Trạng thái</span>
                                        <span className="sm:hidden">TT</span>
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
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
                                                    <div
                                                        className="h-2 w-2 rounded-full mr-3"
                                                        style={{ backgroundColor: student.isActive ? SUCCESS[500] : GRAY[400] }}
                                                    ></div>
                                                    <div>
                                                        <span className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                                            {getFullName(student)}
                                                        </span>
                                                        <div className="sm:hidden text-xs mt-1" style={{ color: TEXT.SECONDARY }}>
                                                            {student.className} • {student.gender}
                                                        </div>
                                                    </div>
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
                                            <td className="hidden sm:table-cell py-4 px-6 text-center align-middle text-sm truncate max-w-[120px]" style={{ color: TEXT.PRIMARY }}>
                                                {getParentName(student.parentId)}
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
                                                        onClick={() => handleAddEditStudent(student)}
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
                                                        onClick={() => toggleStudentStatus(student)}
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
                                                        onClick={() => deleteStudent(student.studentId)}
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
            </div>

            {/* Add/Edit Student Modal */}
            {showStudentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg max-w-xs sm:max-w-md lg:max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 sm:mb-4">
                                {selectedStudent ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-neutral-700 font-medium mb-2">
                                        Mã học sinh
                                    </label>
                                    <input
                                        type="text"
                                        name="studentCode"
                                        value={studentForm.studentCode}
                                        onChange={handleInputChange}
                                        placeholder="Tự động tạo nếu để trống"
                                        className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="mb-3 sm:mb-4">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Họ
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={studentForm.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 ${formErrors.firstName
                                                ? "border-red-500"
                                                : "border-neutral-300"
                                                }`}
                                        />
                                        {formErrors.firstName && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.firstName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-neutral-700 font-medium mb-2">
                                            Tên
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={studentForm.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 ${formErrors.lastName
                                                ? "border-red-500"
                                                : "border-neutral-300"
                                                }`}
                                        />
                                        {formErrors.lastName && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formErrors.lastName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-neutral-700 font-medium mb-2">
                                        Ngày sinh
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={studentForm.dateOfBirth}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 ${formErrors.dateOfBirth
                                            ? "border-red-500"
                                            : "border-neutral-300"
                                            }`}
                                    />
                                    {formErrors.dateOfBirth && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {formErrors.dateOfBirth}
                                        </p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-neutral-700 font-medium mb-2">
                                        Giới tính
                                    </label>
                                    <select
                                        name="gender"
                                        value={studentForm.gender}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-neutral-700 font-medium mb-2">
                                            Lớp học
                                        </label>
                                        <input
                                            type="text"
                                            name="className"
                                            value={studentForm.className}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                            placeholder="VD: 1A, 2B, 3C..."
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-neutral-700 font-medium mb-2">
                                            Khối lớp
                                        </label>
                                        <select
                                            name="gradeLevel"
                                            value={studentForm.gradeLevel}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                        >
                                            <option value="">-- Chọn khối --</option>
                                            <option value="1">Khối 1</option>
                                            <option value="2">Khối 2</option>
                                            <option value="3">Khối 3</option>
                                            <option value="4">Khối 4</option>
                                            <option value="5">Khối 5</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-neutral-700 font-medium mb-2">
                                        Địa chỉ
                                    </label>
                                    <textarea
                                        name="address"
                                        value={studentForm.address}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                        rows="2"
                                        placeholder="Nhập địa chỉ học sinh"
                                    ></textarea>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-neutral-700 font-medium mb-2">
                                        Phụ huynh
                                    </label>
                                    <select
                                        name="parentId"
                                        value={studentForm.parentId}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 ${formErrors.parentId
                                            ? "border-red-500"
                                            : "border-neutral-300"
                                            }`}
                                    >
                                        <option value="">-- Chọn phụ huynh --</option>
                                        {parents.map((parent) => (
                                            <option key={parent.parentId} value={parent.parentId}>
                                                {parent.fullName || `${parent.firstName} ${parent.lastName}`} {parent.email ? `(${parent.email})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.parentId && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {formErrors.parentId}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 sm:mt-5 lg:mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowStudentModal(false)}
                                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 sm:px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 sm:px-4 py-2 bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                    >
                                        {selectedStudent ? "Cập nhật" : "Thêm mới"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;