import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiUsers, FiClipboard, FiCheckCircle, FiMessageCircle, FiEdit, FiSearch, FiBookmark, FiMapPin, FiXOctagon, FiAlertTriangle, FiMoreVertical, FiEye, FiRefreshCw, FiUserPlus, FiUserCheck, FiClock, FiShield } from "react-icons/fi";
import { PRIMARY, GRAY, SUCCESS, WARNING, ERROR, TEXT, BACKGROUND, BORDER, COMMON } from "../../constants/colors";
import vaccineSessionApi from '../../api/vaccineSessionApi';
import Loading from "../../components/Loading";
import AssignNurseModal from "../../components/modal/AssignNurseModal";
import ReassignNurseModal from "../../components/modal/ReassignNurseModal";
import ViewResultModal from "../../components/modal/ViewResultModal";

const VaccinationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [vaccination, setVaccination] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState("all");

    const [error, setError] = useState(null);
    const [isReassignNurseModalOpen, setReassignNurseModalOpen] = useState(false)
    const [studentConsentData, setStudentConsentData] = useState([]);

    const [isAssignNurseModalOpen, setAssignNurseModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [isViewResultModalOpen, setViewResultModalOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const userRole = user?.role;

    useEffect(() => {
        fetchVaccinationDetails();
    }, [id]);

    const fetchVaccinationDetails = async () => {
        try {
            setLoading(true);
            const response = await vaccineSessionApi.getVaccineSessionDetails(id);
            const session = response.data;
            setVaccination(session);

            const classNurseAssignments = response.data.classNurseAssignments || [];
            if (session?.classIds?.length > 0) {
                const classConsentResponses = await vaccineSessionApi.getAllClassStudentConsents(id, session.classIds);
                const validData = classConsentResponses
                    .filter(res => res.success && res.data?.length > 0)
                    .flatMap(res => res.data);

                const studentsWithNurse = validData.map((item) => {
                    item.students.forEach((student) => {
                        const nurseAssignment = classNurseAssignments.find(assignment => assignment.classId === item.classId);
                        student.classNurseAssignments = nurseAssignment ? nurseAssignment.nurseName : "Chưa có";
                    });
                    return item;
                });
                setStudentConsentData(studentsWithNurse);
            }
            setLoading(false);
        } catch (err) {
            setError("Không thể tải thông tin tiêm chủng.");
            setLoading(false);
        }
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

    const ConsentStatusBadge = ({ status }) => {
        let bgColor, text;
        switch (status) {
            case "Confirmed":
                bgColor = SUCCESS[500];
                text = "Đã đồng ý";
                break;
            case "Declined":
                bgColor = ERROR[500];
                text = "Từ chối tiêm";
                break;
            case "Pending":
            default:
                bgColor = WARNING[500];
                text = "Chưa phản hồi";
                break;
        }
        return (
            <div
                className="px-3 py-1 rounded-full inline-flex items-center"
                style={{ backgroundColor: bgColor, color: COMMON.WHITE }}
            >
                <span className="text-sm font-medium">{text}</span>
            </div>
        );
    };

    const filteredStudents = studentConsentData
        .filter(item => selectedClass === "all" || item.classId === selectedClass)
        .flatMap(item =>
            item.students.map(student => ({
                ...student,
                classId: item.classId,
                className: item.className
            }))
        )
        .filter(student =>
            student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    const uniqueClasses = studentConsentData.map(item => ({
        id: item.classId,
        name: item.className
    }));

    const handleNurseAssigned = (assignedNurseDataArray) => {
        const updatedClassAssignments = [...(vaccination.classNurseAssignments || [])];
        assignedNurseDataArray.forEach(assignedNurseData => {
            assignedNurseData.classIds.forEach(classId => {
                const existingIndex = updatedClassAssignments.findIndex(
                    assignment => assignment.classId === classId
                );
                if (existingIndex >= 0) {
                    updatedClassAssignments[existingIndex] = {
                        ...updatedClassAssignments[existingIndex],
                        nurseId: assignedNurseData.nurseId,
                        nurseName: assignedNurseData.nurseName
                    };
                } else {
                    updatedClassAssignments.push({
                        classId: classId,
                        nurseId: assignedNurseData.nurseId,
                        nurseName: assignedNurseData.nurseName
                    });
                }
            });
        });
        setVaccination(prevVaccination => ({
            ...prevVaccination,
            classNurseAssignments: updatedClassAssignments
        }));

        setStudentConsentData(prevData =>
            prevData.map(item => {
                const nurseAssignment = updatedClassAssignments.find(
                    assignment => assignment.classId === item.classId
                );
                return {
                    ...item,
                    students: item.students.map(student => ({
                        ...student,
                        classNurseAssignments: nurseAssignment ? nurseAssignment.nurseName : "Chưa có"
                    }))
                };
            })
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

        const isNurseAssigned = () => {
            if (userRole !== 'schoolnurse') { return true }
            const assignedClass = vaccination.classNurseAssignments.find(
                assignment => assignment.nurseId === user?.id && assignment.classId === student.classId
            );
            return assignedClass ? true : false;
        };

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
                        {(userRole === 'manager' || userRole === 'schoolnurse') && (
                            <Link
                                to={`/${userRole}/student-health-profile/${student.studentId}`}
                                onClick={() => setIsOpen(false)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                style={{ color: PRIMARY[600] }}
                            >
                                <FiEye className="w-4 h-4 flex-shrink-0" />
                                <span>Xem hồ sơ</span>
                            </Link>
                        )}
                        {userRole === 'schoolnurse' && isNurseAssigned() && (
                            <>
                                {student.vaccinationStatus !== "InProgress" && (
                                    <button
                                        onClick={() => { setSelectedStudentId(student.studentId); setViewResultModalOpen(true) }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                        style={{ color: ERROR[600] }}
                                    >
                                        <FiEye className="w-4 h-4 flex-shrink-0" />
                                        <span>Xem kết quả tiêm</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedClass("all");
    };

    const hasUnassignedClasses = () => {
        if (!vaccination?.classIds || !vaccination?.classNurseAssignments) return true;
        const assignedClassIds = vaccination.classNurseAssignments
            .filter(assignment => assignment.nurseId !== null)
            .map(assignment => assignment.classId);

        return vaccination.classIds.some(classId => !assignedClassIds.includes(classId));
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
                                    Chi tiết tiêm chủng
                                </h1>
                                <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                    {vaccination.sessionName}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            {userRole === "schoolnurse" && (
                                <>
                                    <Link
                                        to={`/schoolnurse/vaccination/${id}/edit`}
                                        className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                    >
                                        <FiEdit className="h-4 w-4 mr-2" />Chỉnh sửa
                                    </Link>

                                    {(vaccination?.classNurseAssignments?.some(assignment => assignment.nurseId === user?.id) && vaccination.status === "Scheduled") && (
                                        <Link
                                            to={`/schoolnurse/vaccination/${id}/process`}
                                            className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                                            style={{ backgroundColor: SUCCESS[500], color: TEXT.INVERSE }}
                                        >
                                            <FiCheckCircle className="h-4 w-4 mr-2" />Tiến hành tiêm
                                        </Link>
                                    )}
                                </>
                            )}
                            {userRole === "manager" && (
                                <>
                                    {hasUnassignedClasses() ? (
                                        <button
                                            onClick={() => setAssignNurseModalOpen(true)}
                                            className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                                            style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                        >
                                            <FiUserPlus className="w-4 h-4 mr-2" />Phân công
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setReassignNurseModalOpen(true)}
                                            className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                                            style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                        >
                                            <FiUserCheck className="w-4 h-4 mr-2" />Tái phân công
                                        </button>
                                    )}
                                </>
                            )}
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
                                        {vaccination.sessionName}
                                    </h2>
                                    <div className="flex items-center mt-1 space-x-4 text-sm" style={{ color: TEXT.SECONDARY }}>
                                        <div className="flex items-center">
                                            <FiCalendar className="mr-1 h-4 w-4" />
                                            {new Date(vaccination.startTime).toLocaleDateString("vi-VN")}
                                        </div>
                                        <div className="flex items-center">
                                            <FiClock className="mr-1 h-4 w-4" />
                                            {new Date(vaccination.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} - {new Date(vaccination.endTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {getStatusBadge(vaccination.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: GRAY[50] }}>
                                <FiBookmark className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Loại vắc-xin</p>
                                    <p className="font-semibold" style={{ color: TEXT.PRIMARY }}>{vaccination.vaccineTypeName}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: GRAY[50] }}>
                                <FiMapPin className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Địa điểm</p>
                                    <p className="font-semibold" style={{ color: TEXT.PRIMARY }}>{vaccination.location}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: GRAY[50] }}>
                                <FiShield className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Đơn vị thực hiện</p>
                                    <p className="font-semibold" style={{ color: TEXT.PRIMARY }}>{vaccination.responsibleOrganizationName}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg border" style={{ backgroundColor: GRAY[50], borderColor: BORDER.DEFAULT }}>
                                <div className="flex items-start space-x-2">
                                    <FiAlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: PRIMARY[600] }} />
                                    <div>
                                        <p className="text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Tác dụng phụ</p>
                                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>{vaccination.sideEffect}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg border" style={{ backgroundColor: GRAY[50], borderColor: BORDER.DEFAULT }}>
                                <div className="flex items-start space-x-2">
                                    <FiXOctagon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: PRIMARY[600] }} />
                                    <div>
                                        <p className="text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Chống chỉ định</p>
                                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>{vaccination.contraindication}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {vaccination.notes && (
                            <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: GRAY[50], borderColor: BORDER.DEFAULT }}>
                                <div className="flex items-start space-x-2">
                                    <FiMessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: PRIMARY[600] }} />
                                    <div>
                                        <p className="text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Ghi chú</p>
                                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>{vaccination.notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: BORDER.DEFAULT }}>
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Danh sách học sinh ({filteredStudents.length})
                            </h3>
                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
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

                                <div className="relative">
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
                    </div>

                    <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: PRIMARY[50] }}>
                                        {[
                                            { key: "index", label: "STT", width: "80px" },
                                            { key: "name", label: "Họ và tên", width: "300px" },
                                            { key: "class", label: "Lớp", width: "150px" },
                                            { key: "parentConfirmed", label: "Xác nhận PH", width: "180px" },
                                            { key: "classNurseAssignments", label: "Phân công NVYT", width: "200px" },
                                            { key: "action", label: "Thao tác", width: "100px" }
                                        ].map((col, idx) => (
                                            <th
                                                key={idx}
                                                className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: GRAY[700], width: col.width, minWidth: col.width }}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, index) => (
                                            <tr key={`${student.classId}-${student.studentId}-${index}`} className="hover:bg-gray-50 transition-all duration-200">
                                                <td className="py-3 px-4 text-sm" style={{ width: "80px", minWidth: "80px" }}>{index + 1}</td>
                                                <td className="py-3 px-4" style={{ width: "300px", minWidth: "300px" }}>
                                                    <div className="font-medium" style={{ color: TEXT.PRIMARY }}>{student.studentName}</div>
                                                </td>
                                                <td className="py-3 px-4 text-sm" style={{ color: TEXT.SECONDARY, width: "150px", minWidth: "150px" }}>
                                                    {student.className || "Không xác định"}
                                                </td>
                                                <td className="py-3 px-4" style={{ width: "180px", minWidth: "180px" }}>
                                                    <ConsentStatusBadge status={student.status} />
                                                </td>
                                                <td className="py-3 px-4 text-sm" style={{ color: TEXT.SECONDARY, width: "200px", minWidth: "200px" }}>
                                                    {student.classNurseAssignments ? student.classNurseAssignments : "Chưa có"}
                                                </td>
                                                <td className="py-3 px-4" style={{ width: "100px", minWidth: "100px" }}>
                                                    <ActionMenu student={student} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
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

            <ViewResultModal
                isOpen={isViewResultModalOpen}
                onClose={() => setViewResultModalOpen(false)}
                sessionId={id}
                studentId={selectedStudentId}
                studentData={filteredStudents.find(student => student.studentId === selectedStudentId)}
            />

            <AssignNurseModal
                isOpen={isAssignNurseModalOpen}
                onClose={() => setAssignNurseModalOpen(false)}
                sessionId={id}
                onNurseAssigned={handleNurseAssigned}
            />

            <ReassignNurseModal
                isOpen={isReassignNurseModalOpen}
                onClose={() => setReassignNurseModalOpen(false)}
                sessionId={id}
                onNurseReassigned={handleNurseAssigned}
            />
        </div>
    );
};

export default VaccinationDetail;