import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiClipboard, FiCheckCircle, FiEdit, FiBookmark, FiXOctagon, FiAlertTriangle, FiUserCheck, FiUserPlus, FiShield, FiSearch, FiUsers, FiRefreshCw, FiMoreVertical, FiEye } from "react-icons/fi";
import { PRIMARY, GRAY, ERROR, TEXT, BACKGROUND, BORDER, SUCCESS, WARNING, COMMON } from "../../constants/colors";
import healthCheckApi from '../../api/healthCheckApi';
import Loading from "../../components/Loading";
import AssignHealthCheckNurseModal from "../../components/modal/AssignHealthCheckNurseModal";
import ReassignHealthCheckNurseModal from "../../components/modal/ReassignHealthCheckNurseModal";

const HealthCheckDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [loading, setLoading] = useState(true);
    const [healthCheck, setHealthCheck] = useState(null);
    const [error, setError] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [classStudentList, setClassStudentList] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [errorStudents, setErrorStudents] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState("all");

    useEffect(() => {
        fetchHealthCheckDetails();
        fetchClassStudentList();
    }, [id]);

    const fetchHealthCheckDetails = async () => {
        try {
            setLoading(true);
            const response = await healthCheckApi.getHealthCheckPlanDetails(id);
            setHealthCheck(response.data);
            setLoading(false);
        } catch (err) {
            setError("Không thể tải thông tin kế hoạch kiểm tra sức khỏe.");
            setLoading(false);
        }
    };

    const fetchClassStudentList = async () => {
        setLoadingStudents(true);
        setErrorStudents(null);
        try {
            const res = await healthCheckApi.getClassStudentList(id);
            if (res && res.success) {
                const data = res.data || [];
                const mapped = data.map(classItem => ({
                    ...classItem,
                    students: classItem.students.map(student => ({
                        ...student,
                        className: classItem.className,
                        classId: classItem.classId
                    }))
                }));
                setClassStudentList(mapped);
            } else {
                setClassStudentList([]);
                setErrorStudents(res?.message || "Không thể tải danh sách lớp và học sinh.");
            }
        } catch (err) {
            setClassStudentList([]);
            setErrorStudents("Không thể tải danh sách lớp và học sinh.");
        } finally {
            setLoadingStudents(false);
        }
    };

    const uniqueClasses = classStudentList.map(item => ({ id: item.classId, name: item.className }));
    const filteredStudents = classStudentList
        .filter(item => selectedClass === "all" || item.classId === selectedClass)
        .flatMap(item => item.students)
        .filter(student => student.studentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedClass("all");
    };

    const ConsentStatusBadge = ({ status }) => {
        let bgColor, text;
        switch (status) {
            case "Confirmed":
                bgColor = SUCCESS[500];
                text = "Đã đồng ý";
                break;
            case "Declined":
                bgColor = ERROR[500];
                text = "Từ chối";
                break;
            case "WaitingForParentConsent":
            default:
                bgColor = WARNING[500];
                text = "Chờ phụ huynh";
                break;
        }
        return (
            <div className="px-3 py-1 rounded-full inline-flex items-center" style={{ backgroundColor: bgColor, color: "#fff" }}>
                <span className="text-sm font-medium">{text}</span>
            </div>
        );
    };

    const ActionMenu = ({ student }) => {
        const [isOpen, setIsOpen] = useState(false);
        const menuRef = useRef(null);
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (menuRef.current && !menuRef.current.contains(event.target)) { setIsOpen(false) }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);
        return (
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90 hover:shadow-md"
                    style={{ backgroundColor: GRAY[100], color: TEXT.PRIMARY }}
                >
                    <FiMoreVertical className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
                {isOpen && (
                    <div
                        className="absolute py-2 w-48 bg-white rounded-lg shadow-xl border"
                        style={{ borderColor: BORDER.DEFAULT, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px', zIndex: 50 }}
                    >
                        <Link
                            to={`/schoolnurse/student-health-profile/${student.studentId}`}
                            onClick={() => setIsOpen(false)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                            style={{ color: PRIMARY[600] }}
                        >
                            <FiEye className="w-4 h-4 flex-shrink-0" />
                            <span>Xem hồ sơ</span>
                        </Link>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải thông tin..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: ERROR[600] }}>{error}</h3>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                    >
                        <FiArrowLeft className="mr-2" />Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "PendingApproval":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Lên kế hoạch
                    </span>
                );
            case "WaitingForParentConsent":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Chờ xác nhận phụ huynh
                    </span>
                );
            case "Scheduled":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Đã lên lịch
                    </span>
                );
            case "Declined":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Từ chối
                    </span>
                );
            case "Completed":
                return (
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-green-800">
                        Đã hoàn thành
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="bg-white border-b shadow-sm sticky top-0 z-10" style={{ borderColor: BORDER.DEFAULT }}>
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                                style={{ color: PRIMARY[600] }}
                            >
                                <FiArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    Chi tiết kế hoạch kiểm tra sức khỏe
                                </h1>
                                <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                    {healthCheck.title}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-sm border mb-6" style={{ borderColor: BORDER.DEFAULT }}>
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: PRIMARY[50] }}>
                                    <FiClipboard className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                        {healthCheck.sessionName}
                                    </h2>
                                    <div className="flex items-center mt-1 space-x-4 text-sm" style={{ color: TEXT.SECONDARY }}>
                                        <div className="flex items-center">
                                            <FiCalendar className="mr-1 h-4 w-4" />
                                            {new Date(healthCheck.startTime).toLocaleDateString("vi-VN")}
                                        </div>
                                        <div className="flex items-center">
                                            <FiCheckCircle className="mr-1 h-4 w-4" />
                                            {new Date(healthCheck.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} - {new Date(healthCheck.endTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {getStatusBadge(healthCheck.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: GRAY[50] }}>
                                <FiBookmark className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Địa điểm</p>
                                    <p className="font-semibold" style={{ color: TEXT.PRIMARY }}>{healthCheck.location}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: GRAY[50] }}>
                                <FiShield className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Đơn vị thực hiện</p>
                                    <p className="font-semibold" style={{ color: TEXT.PRIMARY }}>{healthCheck.responsibleOrganizationName}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: GRAY[50] }}>
                                <FiClipboard className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Tổng số lớp</p>
                                    <p className="font-semibold" style={{ color: TEXT.PRIMARY }}>{healthCheck.classIds?.length || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {healthCheck.sideEffect && (
                                <div className="p-3 rounded-lg border" style={{ backgroundColor: GRAY[50], borderColor: BORDER.DEFAULT }}>
                                    <div className="flex items-start space-x-2">
                                        <FiAlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: PRIMARY[600] }} />
                                        <div>
                                            <p className="text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Tác dụng phụ</p>
                                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>{healthCheck.sideEffect}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {healthCheck.contraindication && (
                                <div className="p-3 rounded-lg border" style={{ backgroundColor: GRAY[50], borderColor: BORDER.DEFAULT }}>
                                    <div className="flex items-start space-x-2">
                                        <FiXOctagon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: PRIMARY[600] }} />
                                        <div>
                                            <p className="text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Chống chỉ định</p>
                                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>{healthCheck.contraindication}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {healthCheck.notes && (
                            <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: GRAY[50], borderColor: BORDER.DEFAULT }}>
                                <div className="flex items-start space-x-2">
                                    <FiCheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: PRIMARY[600] }} />
                                    <div>
                                        <p className="text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Ghi chú</p>
                                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>{healthCheck.notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border mb-6" style={{ borderColor: BORDER.DEFAULT }}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Hạng mục kiểm tra sức khỏe
                            </h3>

                            {user?.role === 'schoolnurse' && (() => {
                                const assignments = healthCheck.itemNurseAssignments || [];
                                const assignedItems = assignments.filter(a => a.nurseId === user.id);
                                if (assignedItems.length > 0) {
                                    return (
                                        <button
                                            className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                                            style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE, border: `1px solid ${PRIMARY[500]}` }}
                                            onClick={() => { navigate(`/schoolnurse/health-check/${id}/process`) }}
                                        >
                                            <FiCheckCircle className="h-4 w-4" />
                                            Tiến hành khám
                                        </button>
                                    );
                                }
                                return null;
                            })()}

                            {user?.role === 'manager' && (() => {
                                const items = healthCheck.healthCheckItems || [];
                                const assignments = healthCheck.itemNurseAssignments || [];
                                const unassigned = items.filter(item => {
                                    const assignment = assignments.find(a => a.healthCheckItemId === item.id);
                                    return !assignment || assignment.nurseId === null;
                                });
                                if (unassigned.length > 0) {
                                    return (
                                        <button
                                            className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                                            style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE, border: `1px solid ${PRIMARY[500]}` }}
                                            onClick={() => setShowAssignModal(true)}
                                        >
                                            <FiUserPlus className="h-4 w-4" />
                                            Phân công y tá
                                        </button>
                                    );
                                } else {
                                    return (
                                        <button
                                            className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                                            style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE, border: `1px solid ${PRIMARY[500]}` }}
                                            onClick={() => setShowReassignModal(true)}
                                        >
                                            <FiUserCheck className="h-4 w-4" />
                                            Tái phân công
                                        </button>
                                    );
                                }
                            })()}
                        </div>

                        {healthCheck.healthCheckItems && healthCheck.healthCheckItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {healthCheck.healthCheckItems.map((item) => {
                                    const assignment = (healthCheck.itemNurseAssignments || []).find(a => a.healthCheckItemId === item.id);
                                    return (
                                        <div key={item.id} className="p-4 border rounded-lg flex flex-col space-y-2" style={{ borderColor: BORDER.DEFAULT, backgroundColor: GRAY[50] }}>
                                            <div className="flex items-center space-x-2">
                                                <FiClipboard className="h-4 w-4" style={{ color: PRIMARY[600] }} />
                                                <span className="font-medium" style={{ color: TEXT.PRIMARY }}>{item.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FiUserCheck className="h-4 w-4" style={{ color: PRIMARY[600] }} />
                                                <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    Phụ trách: {assignment?.nurseName || "Chưa phân công"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <FiClipboard className="mx-auto h-8 w-8 mb-2" />
                                Chưa có hạng mục kiểm tra sức khỏe
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border mt-6" style={{ borderColor: BORDER.DEFAULT }}>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
                            <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Danh sách học sinh ({filteredStudents.length})
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-auto">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedClass("all")}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200`}
                                        style={{
                                            backgroundColor: selectedClass === "all" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                            color: selectedClass === "all" ? TEXT.INVERSE : TEXT.PRIMARY,
                                            border: `1px solid ${selectedClass === "all" ? PRIMARY[500] : BORDER.DEFAULT}`
                                        }}
                                    >
                                        Tất cả
                                    </button>
                                    {uniqueClasses.map(({ id, name }) => (
                                        <button
                                            key={id}
                                            onClick={() => setSelectedClass(id)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200`}
                                            style={{
                                                backgroundColor: selectedClass === id ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                                color: selectedClass === id ? TEXT.INVERSE : TEXT.PRIMARY,
                                                border: `1px solid ${selectedClass === id ? PRIMARY[500] : BORDER.DEFAULT}`
                                            }}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        placeholder="Tìm kiếm học sinh..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: PRIMARY[50] }}>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: GRAY[700], width: 80, minWidth: 80 }}>STT</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: GRAY[700], width: 300, minWidth: 300 }}>Họ và tên</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: GRAY[700], width: 150, minWidth: 150 }}>Lớp</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: GRAY[700], width: 180, minWidth: 180 }}>Xác nhận PH</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: GRAY[700], width: 100, minWidth: 100 }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                    {loadingStudents ? (
                                        <tr><td colSpan="5" className="text-center py-12"><Loading type="spinner" size="medium" color="primary" text="Đang tải danh sách học sinh..." /></td></tr>
                                    ) : errorStudents ? (
                                        <tr><td colSpan="5" className="text-center text-red-500 py-12">{errorStudents}</td></tr>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, index) => (
                                            <tr key={`${student.classId}-${student.studentId}-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                                                <td className="py-3 px-4 text-sm" style={{ width: 80, minWidth: 80 }}>{index + 1}</td>
                                                <td className="py-3 px-4" style={{ width: 300, minWidth: 300 }}>
                                                    <div className="font-medium" style={{ color: TEXT.PRIMARY }}>{student.studentName}</div>
                                                </td>
                                                <td className="py-3 px-4 text-sm" style={{ color: TEXT.SECONDARY, width: 150, minWidth: 150 }}>
                                                    {student.className || "Không xác định"}
                                                </td>
                                                <td className="py-3 px-4" style={{ width: 180, minWidth: 180 }}>
                                                    <ConsentStatusBadge status={student.status} />
                                                </td>
                                                <td className="py-3 px-4" style={{ width: 100, minWidth: 100 }}>
                                                    <ActionMenu student={student} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div
                                                        className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: GRAY[100] }}
                                                    >
                                                        <FiUsers className="h-8 w-8" style={{ color: GRAY[400] }} />
                                                    </div>
                                                    <p className="text-lg font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                                                        Không có học sinh nào phù hợp
                                                    </p>
                                                    <p className="mb-4 text-sm" style={{ color: TEXT.SECONDARY }}>
                                                        Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                                                    </p>
                                                    <button
                                                        onClick={resetFilters}
                                                        className="px-4 py-2 rounded-lg flex items-center transition-all duration-300 font-medium text-sm"
                                                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                                                    >
                                                        <FiRefreshCw className="mr-2 h-4 w-4" />
                                                        Đặt lại bộ lọc
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <AssignHealthCheckNurseModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                planId={id}
                onNurseAssigned={() => { setShowAssignModal(false); fetchHealthCheckDetails(); }}
            />
            <ReassignHealthCheckNurseModal
                isOpen={showReassignModal}
                onClose={() => setShowReassignModal(false)}
                planId={id}
                onNurseReassigned={() => { setShowReassignModal(false); fetchHealthCheckDetails(); }}
            />
        </div>
    );
};

export default HealthCheckDetail;