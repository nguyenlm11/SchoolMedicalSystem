import React, { useState, useEffect } from "react";
import { FiUsers, FiPlus, FiUserCheck, FiEdit, FiTrash2, FiEye, FiUpload, FiFileText, FiSearch, FiRefreshCw } from "react-icons/fi";
import { PRIMARY, SUCCESS, INFO, GRAY, TEXT, BACKGROUND, BORDER, ERROR, WARNING } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import classApi from "../../api/classApi";
import AddClassModal from "../../components/modal/AddClassModal";
import AddFileClassModal from "../../components/modal/AddFileClassModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { useNavigate } from "react-router-dom";

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        totalStudents: 0,
        gradeStats: {},
    });
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: "info", title: "", message: "" });
    const [showAddClassModal, setShowAddClassModal] = useState(false);
    const [classToEdit, setClassToEdit] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [classToDelete, setClassToDelete] = useState(null);
    const [showAddFileClassModal, setShowAddFileClassModal] = useState(false);
    const navigate = useNavigate();
    const [sortColumn, setSortColumn] = useState("name");
    const [pageSize] = useState(10);
    const [filterGrade, setFilterGrade] = useState("");
    const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
    const [availableGrades, setAvailableGrades] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterGrade, academicYear]);

    useEffect(() => {
        fetchClasses();
    }, [filterGrade, academicYear, debouncedSearchTerm, sortColumn, currentPage]);
    const [grade, setGrade] = useState([]);

    // Fetch lớp học từ API
    const fetchClasses = async () => {
        setLoading(true);
        try {
            const orderBy = sortColumn;
            const params = {
                pageIndex: currentPage,
                pageSize: pageSize,
                searchTerm: debouncedSearchTerm,
                orderBy: orderBy,
                grade: filterGrade,
                academicYear: academicYear,
                timestamp: Date.now()
            }
            const response = await classApi.getSchoolClass(params);
            setClasses(response.data);

            const total = response.totalCount || 0;
            const totalStudents = response.data.reduce((acc, item) => acc + item.studentCount, 0);
            const gradeStats = response.data.reduce((acc, item) => {
                acc[item.grade] = (acc[item.grade] || 0) + 1;
                return acc;
            }, {});

            setStats({ total, totalStudents, gradeStats });
        } catch (error) {
            console.error("Error fetching classes:", error);
            showAlert("error", "Lỗi", "Không thể tải danh sách lớp học. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllGrades = async () => {
        try {
            const response = await classApi.getSchoolClass({ pageSize: 1000 });
            const allGrades = [...new Set(response.data.map(item => item.grade))].sort((a, b) => a - b);
            setAvailableGrades(allGrades);
        } catch (error) {
            console.error("Error fetching all grades:", error);
        }
    };

    useEffect(() => {
        fetchAllGrades();
    }, []);

    const handleDownloadTemplate = async () => {
        const result = await classApi.downloadClassTemplate();
        if (result.success) {
            const blob = new Blob([result.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = result.headers['content-disposition'];
            let filename = 'class_template.xlsx';
            if (contentDisposition && contentDisposition.includes('filename=')) {
                filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showAlert('success', 'Thành công', 'Tải file mẫu thành công.');
        } else {
            alert("Tải file thất bại: " + result.message);
        }
    };

    const handleExportClassList = async () => {
        if(!grade) {
            showAlert('error', 'Lỗi', 'Vui lòng nhập khối.');
            return;
        }
        if(!academicYear) {
            showAlert('error', 'Lỗi', 'Vui lòng nhập năm.');
        }

        setLoading(true);
        try{
            const formData = new FormData();
            formData.append('grade', grade);
            formData.append('academicYear', academicYear);

            const result = await classApi.exportClassList(formData);

            if (result.success) {
                
                const blob = new Blob([result.data]);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                const contentDisposition = result.headers['content-disposition'];
                let filename = 'class_template.xlsx';
                if (contentDisposition && contentDisposition.includes('filename=')) {
                    filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
                }

                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showAlert('success', 'Thành công', result.message);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            setLoading(false);
            showAlert('error', 'Lỗi', error.message);
        }
    };

    const handleDeleteClass = async (classId, className) => {
        setClassToDelete(classId);
        setAlertConfig({
            type: 'error',
            title: 'Xóa lớp học',
            message: `Bạn có chắc chắn muốn xóa lớp học ${className}?`
        });
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await classApi.deleteSchoolClass(classToDelete);
            setShowConfirmModal(false);
            fetchClasses();
            showAlert("success", "Thành công", "Lớp học đã được xóa thành công.");
        } catch (error) {
            showAlert("error", "Lỗi", "Không thể xoá lớp học. Vui lòng thử lại.");
        }
    };

    const showAlert = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlertModal(true);
        setShowConfirmModal(false);
    };

    const resetFilters = () => {
        setFilterGrade("");
        setSearchTerm("");
        setAcademicYear(new Date().getFullYear());
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách lớp học..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Quản lý lớp học
                            </h1>
                            <p className="mt-1 text-sm sm:text-base" style={{ color: TEXT.SECONDARY }}>
                                Quản lý danh sách lớp học trong trường
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div
                        className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                            borderColor: PRIMARY[200]
                        }}
                    >
                        <div className="p-4 sm:p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm sm:text-base font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Tổng số lớp
                                    </p>
                                    <p className="text-2xl sm:text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.total}
                                    </p>
                                </div>
                                <div
                                    className="h-12 sm:h-16 w-12 sm:w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUsers className="h-6 sm:h-8 w-6 sm:w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                        style={{
                            background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`,
                            borderColor: SUCCESS[200]
                        }}
                    >
                        <div className="p-4 sm:p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm sm:text-base font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Tổng số học sinh
                                    </p>
                                    <p className="text-2xl sm:text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.totalStudents}
                                    </p>
                                </div>
                                <div
                                    className="h-12 sm:h-16 w-12 sm:w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUserCheck className="h-6 sm:h-8 w-6 sm:w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 md:col-span-2 lg:col-span-1"
                        style={{
                            background: `linear-gradient(135deg, ${INFO[500]} 0%, ${INFO[600]} 100%)`,
                            borderColor: INFO[200]
                        }}
                    >
                        <div className="p-4 sm:p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm sm:text-base font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                                        Tổng số khối
                                    </p>
                                    <p className="text-2xl sm:text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {Object.keys(stats.gradeStats).length}
                                    </p>
                                </div>
                                <div
                                    className="h-12 sm:h-16 w-12 sm:w-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <FiUsers className="h-6 sm:h-8 w-6 sm:w-8" style={{ color: TEXT.INVERSE }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl sm:rounded-2xl shadow-xl border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
                    <div className="p-4 sm:p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên lớp..."
                                        className="w-full pl-10 sm:pl-12 pr-10 py-2 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm !== debouncedSearchTerm && (
                                        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: PRIMARY[500] }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={filterGrade}
                                        onChange={(e) => setFilterGrade(e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[160px] sm:min-w-[200px]"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                    >
                                        <option value="">Tất cả khối</option>
                                        {availableGrades.map((grade) => (
                                            <option key={grade} value={grade}>
                                                Khối {grade}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <select
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        className="border rounded-lg px-3 py-2 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[160px] sm:min-w-[200px]"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                    >
                                        {[...Array(5)].map((_, i) => {
                                            const year = new Date().getFullYear() - 2 + i;
                                            return (
                                                <option key={year} value={year}>
                                                    Năm học {year} - {year + 1}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 text-sm sm:text-base"
                                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                                >
                                    <FiRefreshCw className="mr-2 h-4 w-4" />
                                    Đặt lại bộ lọc
                                </button>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={handleDownloadTemplate}
                                        className="px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 text-sm sm:text-base border"
                                        style={{
                                            backgroundColor: INFO[500],
                                            color: 'white',
                                            borderColor: INFO[600]
                                        }}
                                    >
                                        <FiFileText className="mr-2 h-4 w-4" />
                                        Tải mẫu
                                    </button>

                                    <button
                                        onClick={() => setShowAddFileClassModal(true)}
                                        className="px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 text-sm sm:text-base border"
                                        style={{
                                            backgroundColor: SUCCESS[500],
                                            color: 'white',
                                            borderColor: SUCCESS[600]
                                        }}
                                    >
                                        <FiUpload className="mr-2 h-4 w-4" />
                                        Nhập
                                    </button>

                                    <button
                                        onClick={() => {
                                            setClassToEdit(null);
                                            setShowAddClassModal(true);
                                        }}
                                        className="px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 text-sm sm:text-base text-white"
                                        style={{ backgroundColor: PRIMARY[500], borderColor: PRIMARY[600] }}
                                    >
                                        <FiPlus className="mr-2 h-4 w-4" />
                                        Thêm lớp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: PRIMARY[50] }}>
                                    <th className="w-[35%] h-[60px] px-8" style={{ color: TEXT.PRIMARY }}>
                                        <div className="flex items-center h-full">
                                            <span className="text-sm font-semibold uppercase tracking-wider">Tên lớp</span>
                                        </div>
                                    </th>
                                    <th className="w-[15%] h-[60px] px-8" style={{ color: TEXT.PRIMARY }}>
                                        <div className="flex items-center justify-center h-full">
                                            <span className="text-sm font-semibold uppercase tracking-wider">Khối</span>
                                        </div>
                                    </th>
                                    <th className="w-[20%] h-[60px] px-8" style={{ color: TEXT.PRIMARY }}>
                                        <div className="flex items-center justify-center h-full">
                                            <span className="text-sm font-semibold uppercase tracking-wider">Năm học</span>
                                        </div>
                                    </th>
                                    <th className="w-[15%] h-[60px] px-8" style={{ color: TEXT.PRIMARY }}>
                                        <div className="flex items-center justify-center h-full">
                                            <span className="text-sm font-semibold uppercase tracking-wider">Số học sinh</span>
                                        </div>
                                    </th>
                                    <th className="w-[15%] h-[60px] px-8" style={{ color: TEXT.PRIMARY }}>
                                        <div className="flex items-center justify-center h-full">
                                            <span className="text-sm font-semibold uppercase tracking-wider">Thao tác</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {classes.length > 0 ? (
                                    classes.map((classItem, index) => (
                                        <tr
                                            key={classItem.id}
                                            className="hover:bg-opacity-50 transition-all duration-200 group"
                                            style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                                        >
                                            <td className="w-[35%] h-[60px] px-8">
                                                <div className="flex items-center h-full">
                                                    <div className="text-[15px] font-medium" style={{ color: TEXT.PRIMARY }}>
                                                        {classItem.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="w-[15%] h-[60px] px-8">
                                                <div className="flex items-center justify-center h-full">
                                                    <span
                                                        className="text-[15px] font-medium"
                                                        style={{ color: PRIMARY[700] }}
                                                    >
                                                        Khối {classItem.grade}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="w-[20%] h-[60px] px-8">
                                                <div className="flex items-center justify-center h-full">
                                                    <span
                                                        className="text-[15px] font-medium"
                                                        style={{ color: INFO[700] }}
                                                    >
                                                        {classItem.academicYear} - {classItem.academicYear + 1}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="w-[15%] h-[60px] px-8">
                                                <div className="flex items-center justify-center h-full">
                                                    <span
                                                        className="text-[15px] font-medium"
                                                        style={{ color: SUCCESS[700] }}
                                                    >
                                                        {classItem.studentCount} học sinh
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="w-[15%] h-[60px] px-8">
                                                <div className="flex items-center justify-center h-full space-x-3">
                                                    <button
                                                        onClick={() => navigate(`/manager/class-details/${classItem.id}`)}
                                                        className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90"
                                                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                                                        title="Xem chi tiết"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setClassToEdit(classItem);
                                                            setShowAddClassModal(true);
                                                        }}
                                                        className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90"
                                                        style={{ backgroundColor: INFO[50], color: INFO[600] }}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FiEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                                                        className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90"
                                                        style={{ backgroundColor: ERROR[50], color: ERROR[600] }}
                                                        title="Xóa"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8">
                                            <div className="flex flex-col items-center justify-center">
                                                <div
                                                    className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
                                                    style={{ backgroundColor: GRAY[100] }}
                                                >
                                                    <FiUsers className="h-8 w-8" style={{ color: GRAY[400] }} />
                                                </div>
                                                <p className="text-lg font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                    Không có lớp học nào
                                                </p>
                                                <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                                                    Hãy thêm lớp học mới hoặc thay đổi bộ lọc
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setClassToEdit(null);
                                                        setShowAddClassModal(true);
                                                    }}
                                                    className="px-4 py-2 rounded-lg flex items-center transition-all duration-300"
                                                    style={{ backgroundColor: PRIMARY[500], color: 'white' }}
                                                >
                                                    <FiPlus className="mr-2 h-4 w-4" />
                                                    Thêm lớp học mới
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals */}
                <AddClassModal
                    isOpen={showAddClassModal}
                    onClose={() => setShowAddClassModal(false)}
                    onSuccess={() => fetchClasses()}
                    classToEdit={classToEdit}
                    setClassToEdit={setClassToEdit}
                />

                <AddFileClassModal
                    isOpen={showAddFileClassModal}
                    onClose={() => setShowAddFileClassModal(false)}
                    onSuccess={() => fetchClasses()}
                />

                <AlertModal
                    isOpen={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                />

                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmDelete}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    confirmText="Xác nhận"
                    cancelText="Hủy"
                    type={alertConfig.type}
                />
            </div>
        </div>
    );
};

export default ClassManagement;
