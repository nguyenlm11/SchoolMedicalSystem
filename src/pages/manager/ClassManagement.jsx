import React, { useState, useEffect } from "react";
import { FiUsers, FiPlus, FiUserCheck, FiEdit, FiTrash2 } from "react-icons/fi";
import { PRIMARY, SUCCESS, ERROR, GRAY, TEXT, BACKGROUND, BORDER } from "../../constants/colors";
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";
import classApi from "../../api/classApi";
import AddClassModal from "../../components/modal/AddClassModal";
import ConfirmModal from "../../components/modal/ConfirmModal";

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

    useEffect(() => {
        fetchClasses();
    }, []);

    // Fetch lớp học từ API
    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await classApi.getSchoolClass();
            setClasses(response.data);

            const total = response.data.length;
            const totalStudents = response.data.reduce((acc, item) => acc + item.studentCount, 0);

            // Count number of classes per grade
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

    // Filter classes based on search term
    const filteredClasses = classes.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredClasses.length / 5);
    const indexOfLastClass = currentPage * 5;
    const indexOfFirstClass = indexOfLastClass - 5;
    const currentClasses = filteredClasses.slice(indexOfFirstClass, indexOfLastClass);

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
                        <button
                            onClick={() => {
                                setClassToEdit(null);
                                setShowAddClassModal(true);
                            }}
                            className="px-6 py-3 rounded-xl flex items-center font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            style={{
                                background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                color: TEXT.INVERSE
                            }}
                        >
                            <FiPlus className="mr-2 h-5 w-5" />
                            Thêm lớp học mới
                        </button>
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

                {/* Class List Table */}
                <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: GRAY[50] }}>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer" style={{ color: TEXT.SECONDARY }}>
                                        Tên lớp
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer" style={{ color: TEXT.SECONDARY }}>
                                        Khối
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer" style={{ color: TEXT.SECONDARY }}>
                                        Năm học
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer" style={{ color: TEXT.SECONDARY }}>
                                        Số học sinh
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer" style={{ color: TEXT.SECONDARY }}>
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentClasses.map((classItem) => (
                                    <tr key={classItem.id}>
                                        <td className="py-4 px-6 pl-10">{classItem.name}</td>
                                        <td className="py-4 px-6 pl-10">{classItem.grade}</td>
                                        <td className="py-4 px-6 pl-10">{classItem.academicYear}</td>
                                        <td className="py-4 px-6 pl-15">{classItem.studentCount}</td>
                                        <td className="py-4 px-6 pl-10">
                                            <button onClick={() => {
                                                    setClassToEdit(classItem);
                                                    setShowAddClassModal(true);
                                                }} className="mr-2">
                                                <FiEdit />
                                            </button>
                                            <button onClick={() => handleDeleteClass(classItem.id, classItem.name)}>
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
                                Hiển thị {indexOfFirstClass + 1} - {Math.min(indexOfLastClass, filteredClasses.length)} trong tổng số {filteredClasses.length} lớp học
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
