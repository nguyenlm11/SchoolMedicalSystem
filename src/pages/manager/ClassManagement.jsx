import React, { useState, useEffect } from "react";
import { FiUsers, FiPlus, FiUserCheck, FiEdit, FiTrash2, FiEye, FiUpload, FiFileText, FiSearch } from "react-icons/fi";
import { PRIMARY, SUCCESS, INFO, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from "../../constants/colors";
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
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filterGrade, setFilterGrade] = useState("");
    const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
    const [availableGrades, setAvailableGrades] = useState([]);

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

    useEffect(() => {
        fetchClasses();
    }, [filterGrade, academicYear, debouncedSearchTerm, sortColumn, currentPage]);

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
        setLoading(true);
        setFilterStatus("all");
        setSearchTerm("");
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 800);
    };

    const currentClasses = classes;
    const totalPages = Math.ceil(stats.total / pageSize);

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Quản lý lớp học
                            </h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Quản lý danh sách lớp học trong trường
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{ 
                                    backgroundColor:  `linear-gradient(135deg, ${INFO[500]} 0%, ${INFO[600]} 100%)`, 
                                    color: 'black', 
                                    borderColor: INFO[600] }}
                                >
                                    <FiFileText className="h-4 w-4 mr-2" />
                                    Lấy mẫu
                                </button>
                            </div>
                            <div className="relative">
                                {/* Button to add class via file */}
                                <button
                                onClick={() => setShowAddFileClassModal(true)}
                                className="inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`,
                                    color: 'white',
                                    borderColor: SUCCESS[600] }}
                                >
                                    <FiUpload className="h-4 w-4 mr-2" />
                                    Nhập
                                </button>
                            </div>
                            <div className="relative">
                                <button
                                onClick={() => {
                                    setClassToEdit(null);
                                    setShowAddClassModal(true);
                                }}
                                className="inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                    color: 'white',
                                    borderColor: PRIMARY[600] }}
                                >
                                    <FiPlus className="h-4 w-4 mr-2" />
                                    Thêm lớp học mới
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
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
                                        Tổng Khối
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {Object.keys(stats.gradeStats).length}
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
                                        Tổng học sinh của tất cả các lớp
                                    </p>
                                    <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                                        {stats.totalStudents}
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
                </div>

                <div className=" mb-6" >
                    <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                        <div className="w-full relative">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        fetchClasses();
                                    }
                                }}
                                placeholder="Tìm kiếm theo tên lớp"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-offset-1"
                                style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 ml-4">
                            <select
                                value={filterGrade}
                                onChange={(e) => {
                                    setFilterGrade(e.target.value);
                                    fetchClasses();
                                }}
                                className="border rounded-lg px-3 py-2 text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[120px]"
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
                    </div>
                </div>
                
                {/* Class List Table */}
                <div 
                    className="rounded-xl shadow-sm border overflow-hidden"
                    style={{
                        backgroundColor: BACKGROUND.DEFAULT,
                        borderColor: BORDER.DEFAULT,
                        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr
                                    className="border-b"
                                    style={{ backgroundColor: '#f8fafc', borderColor: BORDER.DEFAULT }}
                                >
                                    <th scope="col" className="py-5 px-6 text-left text-sm font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80" style={{ color: TEXT.SECONDARY }}>
                                        <div className="flex items-center space-x-2">
                                            <span>Tên lớp</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="py-4 px-6 text-left text-sm font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80" style={{ color: TEXT.SECONDARY }}>
                                        <div className="flex items-center space-x-2">
                                            <span>Khối</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="py-4 px-6 text-left text-sm font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80" style={{ color: TEXT.SECONDARY }}>
                                        <div className="flex items-center space-x-2">
                                            <span>Năm học</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="py-4 px-6 text-left text-sm font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80" style={{ color: TEXT.SECONDARY }}>
                                        <div className="flex items-center space-x-2">
                                            <span>Số học sinh</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="py-4 px-6 text-left text-sm font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 hover:bg-gray-100/80" style={{ color: TEXT.SECONDARY }}>
                                        <div className="flex items-center space-x-2">
                                            <span>Thao tác</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody style={{ backgroundColor: BACKGROUND.DEFAULT }}>
                                {currentClasses.map((classItem) => (
                                    <tr key={classItem.id} className="border-b hover:bg-gray-50/70 transition-all duration-200" style={{ borderColor: BORDER.DEFAULT }}>
                                        <td className="py-6 px-6 pl-10">
                                            <div className="flex items-center">
                                                 <div className="flex-shrink-0 h-12 w-12">
                                                    <div
                                                        className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                                        style={{ backgroundColor: PRIMARY[500] }}
                                                    >
                                                        {classItem.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm">
                                                {classItem.grade}
                                            </span>
                                        </td>

                                        <td className="py-6 px-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm">
                                                {classItem.academicYear}
                                            </span>
                                        </td>
                                        <td className="py-6 px-6 pl-13">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm">
                                                {classItem.studentCount}
                                            </span>
                                        </td>
                                        <td className="py-6 px-6">
                                            <button className="p-2.5 rounded-lg transition-all duration-200 hover:bg-blue-50 border"
                                                style={{ color: PRIMARY[600], borderColor: PRIMARY[200] }}
                                                onClick={() => navigate(`/manager/class-details/${classItem.id}`)}
                                                title="Xem chi tiết"
                                            >
                                                <FiEye />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setClassToEdit(classItem);
                                                    setShowAddClassModal(true);
                                                }} 
                                                className="p-2.5 rounded-lg transition-all duration-200 hover:bg-red-50 border"
                                                style={{
                                                    color: INFO[600],
                                                    borderColor: INFO[200]
                                                }}
                                                title="Chỉnh sửa"
                                            >
                                                <FiEdit />
                                            </button>
                                            <button 
                                                className="p-2.5 rounded-lg transition-all duration-200 hover:bg-red-50 border"
                                                style={{
                                                    color: ERROR[600],
                                                    borderColor: ERROR[200]
                                                }}
                                                onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                                                title="Xóa lớp học"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                        <div>
                            <span>
                                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, stats.total)} trong tổng số {stats.total} lớp học
                            </span>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* AddClassModal */}
            <AddClassModal
                isOpen={showAddClassModal}
                onClose={() => setShowAddClassModal(false)}
                onSuccess={() => fetchClasses()}
                classToEdit={classToEdit}
                setClassToEdit={setClassToEdit}
            />
            {/* AddFileClassModal */}
            <AddFileClassModal
                isOpen={showAddFileClassModal}
                onClose={() => setShowAddFileClassModal(false)}
                onSuccess={() => fetchClasses()}
            />
            {/* Alert Modal */}
            <AlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
            />
            {/* ConfirmModal for class deletion */}
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
    );
};

export default ClassManagement;
