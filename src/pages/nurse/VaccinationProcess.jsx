import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiUsers, FiCheckCircle, FiXCircle, FiSearch, FiCheck, FiClock, FiActivity, FiEdit } from "react-icons/fi";
import { PRIMARY, GRAY, SUCCESS, ERROR, TEXT, BACKGROUND, BORDER, SHADOW, COMMON } from "../../constants/colors";
import vaccineSessionApi from '../../api/vaccineSessionApi';
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";

const STATUS_CONFIG = {
    vaccination: {
        Completed: { bg: PRIMARY[500], text: "Đã tiêm", icon: <FiCheckCircle className="w-4 h-4" /> },
        NotVaccinated: { bg: GRAY[500], text: "Chưa tiêm", icon: <FiXCircle className="w-4 h-4" /> },
        default: { bg: PRIMARY[300], text: "Đang chờ tiêm", icon: <FiClock className="w-4 h-4" /> }
    },
    consent: {
        Confirmed: { bg: PRIMARY[500], text: "Đã đồng ý" },
        Declined: { bg: GRAY[500], text: "Từ chối tiêm" },
        default: { bg: PRIMARY[300], text: "Chưa phản hồi" }
    }
};
const STATUS_ORDER = { "InProgress": 1, "Completed": 2, "NotVaccinated": 3 };

const VaccinationProcess = () => {
    const { id, classId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [vaccination, setVaccination] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedClass, setSelectedClass] = useState(classId || "all");
    const [error, setError] = useState(null);
    const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetchData();
    }, [id, classId, user?.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const sessionResponse = await vaccineSessionApi.getVaccineSessionDetails(id);
            const session = sessionResponse.data;
            setVaccination(session);
            const assignedClasses = session.classNurseAssignments?.filter(assignment => assignment.nurseId === user?.id) || [];
            if (assignedClasses.length === 0 && user?.role === 'schoolnurse') {
                setError("Bạn không được phân công cho lớp nào trong buổi tiêm này");
                setLoading(false);
                return;
            }
            const classesToFetch = classId ? [classId] : assignedClasses.map(assignment => assignment.classId);
            const consentResponse = await vaccineSessionApi.getAllClassStudentConsents(id, classesToFetch);
            const validData = consentResponse.filter(res => res.success && res.data?.length > 0).flatMap(res => res.data);
            if (validData.length > 0) {
                const allStudents = validData.flatMap(classData => {
                    const nurseAssignment = assignedClasses.find(assignment => assignment.classId === classData.classId);
                    return classData.students.map(student => ({
                        ...student,
                        classId: classData.classId,
                        className: classData.className,
                        classNurseAssignments: nurseAssignment ? nurseAssignment.nurseName : "Chưa có",
                        sessionId: id
                    }));
                });
                setStudents(allStudents);
            }
            setLoading(false);
        } catch (err) {
            setError("Không thể tải thông tin tiêm chủng.");
            setLoading(false);
        }
    };

    const filteredStudents = students
        .filter(student => {
            if (student.status !== "Confirmed") return false;
            const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "all" || student.vaccinationStatus === filterStatus;
            const matchesClass = selectedClass === "all" || student.classId === selectedClass;
            return matchesSearch && matchesStatus && matchesClass;
        })
        .sort((a, b) => STATUS_ORDER[a.vaccinationStatus] - STATUS_ORDER[b.vaccinationStatus]);
    const uniqueClasses = [...new Set(students.map(student => student.classId))].map(classId => {
        const student = students.find(s => s.classId === classId);
        return { id: classId, name: student?.className || classId };
    });

    const handleVaccinationSubmit = async (vaccinationData) => {
        try {
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.studentId === selectedStudent.studentId ? { ...student, vaccinationStatus: vaccinationData.vaccinationStatus } : student
                ))
            setAlertModal({ isOpen: true, type: 'success', message: 'Cập nhật trạng thái tiêm chủng thành công!' });
            const currentIndex = filteredStudents.findIndex(s => s.studentId === selectedStudent.studentId);
            const nextStudent = filteredStudents[currentIndex + 1];
            if (nextStudent) setSelectedStudent(nextStudent);
        } catch (err) {
            setAlertModal({ isOpen: true, type: 'error', message: 'Có lỗi xảy ra khi cập nhật trạng thái tiêm chủng.' });
        }
    };

    const StatusBadge = ({ status, type }) => {
        const badgeConfig = STATUS_CONFIG[type][status] || STATUS_CONFIG[type].default;
        return (
            <div
                className={`px-3 py-1 rounded-full inline-flex items-center ${type === 'vaccination' ? 'space-x-1' : ''}`}
                style={{ backgroundColor: badgeConfig.bg, color: COMMON.WHITE }}
            >
                {badgeConfig.icon}
                <span className="text-sm font-medium">{badgeConfig.text}</span>
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
                        <FiArrowLeft className="mr-2" />
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10" style={{ borderColor: BORDER.DEFAULT }}>
                <div className="max-w-[1920px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-xl transition-all duration-200 hover:bg-primary-50"
                                style={{ color: PRIMARY[600] }}
                            >
                                <FiArrowLeft className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    Tiến hành tiêm chủng
                                </h1>
                                <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                    {vaccination?.sessionName} {classId ? `- ${students.find(s => s.classId === classId)?.className || ''}` : ''}
                                </p>
                            </div>
                        </div>
                        <div className="text-lg font-medium" style={{ color: TEXT.SECONDARY }}>
                            {user?.name}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1920px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <StudentList
                        students={filteredStudents}
                        selectedStudent={selectedStudent}
                        setSelectedStudent={setSelectedStudent}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedClass={selectedClass}
                        setSelectedClass={setSelectedClass}
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        uniqueClasses={uniqueClasses}
                        StatusBadge={StatusBadge}
                    />

                    <VaccinationPanel
                        selectedStudent={selectedStudent}
                        sessionId={id}
                        onEdit={handleVaccinationSubmit}
                    />
                </div>
            </div>

            <AlertModal
                isOpen={alertModal.isOpen}
                type={alertModal.type}
                message={alertModal.message}
                onClose={() => setAlertModal({ isOpen: false, type: '', message: '' })}
            />
        </div>
    );
};

const StudentList = ({ students, selectedStudent, setSelectedStudent, searchTerm, setSearchTerm, selectedClass, setSelectedClass, filterStatus, setFilterStatus, uniqueClasses, StatusBadge }) => (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden" style={{ borderColor: BORDER.DEFAULT, boxShadow: `0 4px 6px -1px ${SHADOW.LIGHT}, 0 2px 4px -1px ${SHADOW.DEFAULT}` }}>
        <div className="px-6 py-4 border-b flex items-center" style={{ background: `linear-gradient(135deg, ${PRIMARY[50]} 0%, ${PRIMARY[100]} 100%)`, borderColor: PRIMARY[200] }}>
            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${PRIMARY[500]}20` }}>
                <FiUsers className="h-6 w-6" style={{ color: PRIMARY[700] }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                Danh sách học sinh ({students.length})
            </h2>
        </div>

        <div className="p-6">
            <div className="space-y-4 mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }}
                        placeholder="Tìm kiếm học sinh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {uniqueClasses.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedClass("all")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
                            style={{
                                backgroundColor: selectedClass === "all" ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                color: selectedClass === "all" ? TEXT.INVERSE : TEXT.PRIMARY,
                                border: `1px solid ${selectedClass === "all" ? PRIMARY[500] : BORDER.DEFAULT}`
                            }}
                        >
                            Tất cả lớp
                        </button>
                        {uniqueClasses.map(({ id, name }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedClass(id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
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
                )}

                <div className="flex flex-wrap gap-2">
                    {["all", "InProgress", "Completed", "NotVaccinated"].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
                            style={{
                                backgroundColor: filterStatus === status ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                color: filterStatus === status ? TEXT.INVERSE : TEXT.PRIMARY,
                                border: `1px solid ${filterStatus === status ? PRIMARY[500] : BORDER.DEFAULT}`
                            }}
                        >
                            {status === "all" ? "Tất cả" :
                                status === "InProgress" ? "Đang tiến hành" :
                                    status === "Completed" ? "Đã tiêm" : "Chưa tiêm"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {students.length > 0 ? (
                    <div className="space-y-2">
                        {students.map((student) => (
                            <StudentCard
                                key={student.studentId}
                                student={student}
                                isSelected={selectedStudent?.studentId === student.studentId}
                                onClick={() => setSelectedStudent(student)}
                                StatusBadge={StatusBadge}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: GRAY[100] }}>
                            <FiUsers className="h-10 w-10" style={{ color: GRAY[400] }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                            Không có học sinh nào
                        </h3>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const StudentCard = ({ student, isSelected, onClick, StatusBadge }) => (
    <div
        onClick={onClick}
        className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-300`}
        style={{ backgroundColor: isSelected ? `${PRIMARY[50]}` : BACKGROUND.DEFAULT, borderColor: isSelected ? PRIMARY[400] : BORDER.DEFAULT }}
    >
        {isSelected && (
            <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: PRIMARY[500] }} />
        )}
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected ? 'ring-2 ring-primary-300' : 'group-hover:ring-2 group-hover:ring-primary-200'}`}
                    style={{ backgroundColor: isSelected ? PRIMARY[200] : PRIMARY[100] }}
                >
                    <FiUser
                        className={`w-6 h-6 transition-all duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                        style={{ color: PRIMARY[600] }}
                    />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate transition-all duration-200 ${isSelected ? 'text-lg' : 'text-base'}`}
                        style={{ color: TEXT.PRIMARY }}
                    >
                        {student.studentName}
                    </h3>
                    <div className="flex items-center space-x-2 ml-2">
                        <StatusBadge status={student.status} type="consent" />
                        <StatusBadge status={student.vaccinationStatus} type="vaccination" />
                    </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4" style={{ color: GRAY[400] }} />
                        <span style={{ color: TEXT.SECONDARY }}>
                            Lớp {student.className}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {student.vaccinationStatus === "InProgress" && (
            <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: TEXT.SECONDARY }}>Trạng thái tiêm</span>
                    <span style={{ color: PRIMARY[600] }}>Đang chờ tiêm</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ backgroundColor: PRIMARY[500], width: '60%' }} />
                </div>
            </div>
        )}
    </div>
);

const VaccinationPanel = ({ selectedStudent, sessionId, onEdit }) => (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden" style={{ borderColor: BORDER.DEFAULT, boxShadow: `0 4px 6px -1px ${SHADOW.LIGHT}, 0 2px 4px -1px ${SHADOW.DEFAULT}` }}>
        <div className="px-6 py-4 border-b flex items-center" style={{ background: `linear-gradient(135deg, ${PRIMARY[50]} 0%, ${PRIMARY[100]} 100%)`, borderColor: PRIMARY[200] }}>
            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${PRIMARY[500]}20` }}>
                <FiActivity className="h-6 w-6" style={{ color: PRIMARY[700] }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                Thông tin tiêm chủng
            </h2>
        </div>

        <div className="p-6">
            {selectedStudent ? (
                (selectedStudent.vaccinationStatus === "Completed" || selectedStudent.vaccinationStatus === "NotVaccinated") ? (
                    <VaccinationResult student={selectedStudent} sessionId={sessionId} onEdit={onEdit} />
                ) : (
                    <VaccinationForm student={selectedStudent} onSubmit={onEdit} sessionId={sessionId} />
                )
            ) : (
                <div className="text-center py-12">
                    <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: PRIMARY[100] }}>
                        <FiUser className="h-10 w-10" style={{ color: PRIMARY[500] }} />
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                        Chọn học sinh để tiêm chủng
                    </p>
                    <p style={{ color: TEXT.SECONDARY }}>
                        Vui lòng chọn một học sinh từ danh sách bên trái
                    </p>
                </div>
            )}
        </div>
    </div>
);

const VaccinationResult = ({ student, sessionId, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedOption, setSelectedOption] = useState(student.vaccinationStatus === "Completed" ? "vaccinated" : "notVaccinated");
    const [formData, setFormData] = useState({ symptoms: '', noteAfterSession: '', reason: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const isCompleted = student.vaccinationStatus === "Completed";

    useEffect(() => {
        if (isEditing && student && sessionId) {
            fetchVaccinationResult();
        }
    }, [isEditing, student, sessionId]);

    const fetchVaccinationResult = async () => {
        setLoading(true);
        try {
            const response = await vaccineSessionApi.getVaccinationResult(sessionId, student.studentId);
            if (response.success && response.data) {
                setFormData({
                    symptoms: response.data.symptoms || '',
                    noteAfterSession: response.data.noteAfterSession || '',
                    reason: response.data.reason || ''
                });
            } else {
                setFormData({
                    symptoms: student.symptoms || '',
                    noteAfterSession: student.noteAfterSession || '',
                    reason: student.reason || ''
                });
            }
        } catch (error) {
            setFormData({
                symptoms: student.symptoms || '',
                noteAfterSession: student.noteAfterSession || '',
                reason: student.reason || ''
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setError(null);
        if (selectedOption === "vaccinated" && !formData.symptoms) {
            return setError("Vui lòng nhập triệu chứng.");
        }
        if (selectedOption === "notVaccinated" && !formData.reason) {
            return setError("Vui lòng nhập lý do không tiêm.");
        }
        setIsSubmitting(true);
        try {
            let data, response;
            if (selectedOption === "vaccinated") {
                data = { studentId: student.studentId, symptoms: formData.symptoms, noteAfterSession: formData.noteAfterSession };
                response = await vaccineSessionApi.markStudentVaccinated(sessionId, data);
            } else {
                data = { studentId: student.studentId, reason: formData.reason, noteAfterSession: formData.noteAfterSession };
                response = await vaccineSessionApi.markStudentNotVaccinated(sessionId, data);
            }
            if (response.success) {
                await onEdit({ vaccinationStatus: selectedOption === "vaccinated" ? "Completed" : "NotVaccinated", ...data });
                setIsEditing(false);
            } else {
                setError(response.message || "Có lỗi xảy ra.");
            }
        } catch (error) {
            setError(error.message || "Có lỗi xảy ra.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl border" style={{
                backgroundColor: isCompleted ? PRIMARY[50] : GRAY[50],
                borderColor: isCompleted ? PRIMARY[200] : GRAY[200]
            }}>
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                        backgroundColor: isCompleted ? PRIMARY[100] : GRAY[100]
                    }}>
                        {isCompleted ? (
                            <FiCheckCircle className="w-6 h-6" style={{ color: PRIMARY[600] }} />
                        ) : (
                            <FiXCircle className="w-6 h-6" style={{ color: GRAY[600] }} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold" style={{ color: isCompleted ? PRIMARY[700] : GRAY[700] }}>
                            {student.studentName}
                        </h3>
                        <p className="text-sm" style={{ color: isCompleted ? PRIMARY[600] : GRAY[600] }}>
                            Lớp {student.className}
                        </p>
                        <div className="mt-1">
                            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{
                                backgroundColor: isCompleted ? PRIMARY[500] : GRAY[500],
                                color: COMMON.WHITE
                            }}>
                                {isCompleted ? "Đã tiêm chủng" : "Chưa tiêm chủng"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm" style={{ color: ERROR[600] }}>{error}</p>
                </div>
            )}

            {!isEditing ? (
                <div className="space-y-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                            backgroundColor: isCompleted ? PRIMARY[100] : GRAY[100]
                        }}>
                            {isCompleted ? (
                                <FiCheckCircle className="w-8 h-8" style={{ color: PRIMARY[600] }} />
                            ) : (
                                <FiXCircle className="w-8 h-8" style={{ color: GRAY[600] }} />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                            {isCompleted ? "Đã tiêm chủng" : "Chưa tiêm chủng"}
                        </h3>
                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                            {isCompleted ? "Học sinh đã được tiêm chủng thành công" : "Học sinh chưa được tiêm chủng"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center"
                        style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE }}
                    >
                        <FiEdit className="w-4 h-4 mr-2" />
                        Chỉnh sửa thông tin
                    </button>
                </div>
            ) : (
                <VaccinationForm
                    student={student}
                    sessionId={sessionId}
                    onSubmit={handleEdit}
                    isEditing={true}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    formData={formData}
                    setFormData={setFormData}
                    loading={loading}
                    isSubmitting={isSubmitting}
                    onCancel={() => setIsEditing(false)}
                />
            )}
        </div>
    );
};

const VaccinationForm = ({ student, sessionId, onSubmit, isEditing = false, selectedOption, setSelectedOption, formData, setFormData, loading, isSubmitting, onCancel }) => {
    const [error, setError] = useState(null);
    const [localFormData, setLocalFormData] = useState({ symptoms: 'Không có triệu chứng', noteAfterSession: '', reason: '' });
    const [localSelectedOption, setLocalSelectedOption] = useState("vaccinated");
    const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
    const currentFormData = formData || localFormData;
    const currentSelectedOption = selectedOption || localSelectedOption;
    const currentIsSubmitting = isSubmitting || localIsSubmitting;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (currentSelectedOption === "vaccinated" && !currentFormData.symptoms) {
            return setError("Vui lòng nhập triệu chứng.");
        }
        if (currentSelectedOption === "notVaccinated" && !currentFormData.reason) {
            return setError("Vui lòng nhập lý do không tiêm.");
        }
        if (isEditing) {
            await onSubmit(e);
        } else {
            setLocalIsSubmitting(true);
            try {
                const data = { studentId: student.studentId, symptoms: currentFormData.symptoms, noteAfterSession: currentFormData.noteAfterSession };
                let response;
                if (currentSelectedOption === "vaccinated") {
                    response = await vaccineSessionApi.markStudentVaccinated(sessionId, data);
                } else {
                    response = await vaccineSessionApi.markStudentNotVaccinated(sessionId, {
                        studentId: student.studentId,
                        reason: currentFormData.reason,
                        noteAfterSession: currentFormData.noteAfterSession
                    });
                }
                if (response.success) {
                    await onSubmit({
                        vaccinationStatus: currentSelectedOption === "vaccinated" ? "Completed" : "NotVaccinated",
                        ...data
                    });
                    setLocalFormData({ symptoms: '', noteAfterSession: '', reason: '' });
                    setLocalSelectedOption("vaccinated");
                } else {
                    setError(response.message || "Có lỗi xảy ra.");
                }
            } catch (error) {
                setError(error.message || "Có lỗi xảy ra.");
            } finally {
                setLocalIsSubmitting(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updateFormData = (prev) => ({ ...prev, [name]: value });
        if (isEditing) {
            setFormData(updateFormData);
        } else {
            setLocalFormData(updateFormData);
        }
    };

    const handleSelectOption = (option) => {
        if (isEditing) {
            setSelectedOption(option);
        } else {
            setLocalSelectedOption(option);
            setLocalFormData({ symptoms: '', noteAfterSession: '', reason: '' });
        }
        setError(null);
    };

    return (
        <div className="space-y-6">
            {!isEditing && (
                <div className="p-4 rounded-xl border" style={{ backgroundColor: PRIMARY[50], borderColor: PRIMARY[200] }}>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: PRIMARY[100] }}>
                            <FiUser className="w-6 h-6" style={{ color: PRIMARY[600] }} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold" style={{ color: PRIMARY[700] }}>
                                {student.studentName}
                            </h3>
                            <p className="text-sm" style={{ color: PRIMARY[600] }}>
                                Lớp {student.className}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm" style={{ color: ERROR[600] }}>{error}</p>
                </div>
            )}

            {isEditing && (
                <>
                    <h4 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                        Chỉnh sửa thông tin tiêm chủng
                    </h4>
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loading type="spinner" size="medium" color="primary" text="Đang tải thông tin..." />
                        </div>
                    )}
                </>
            )}

            {(!isEditing || !loading) && (
                <>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-4" style={{ color: TEXT.SECONDARY }}>
                            Chọn trạng thái tiêm
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => handleSelectOption("vaccinated")}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all text-center border-2 ${currentSelectedOption === "vaccinated"
                                    ? "text-white"
                                    : "text-gray-700 border-gray-400"
                                    }`}
                                style={{
                                    backgroundColor: currentSelectedOption === "vaccinated" ? SUCCESS[500] : GRAY[100],
                                    borderColor: currentSelectedOption === "vaccinated" ? SUCCESS[500] : BORDER.DEFAULT
                                }}
                            >
                                <FiCheckCircle className="w-4 h-4 mr-2 inline" />
                                Đã Tiêm
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSelectOption("notVaccinated")}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all text-center border-2 ${currentSelectedOption === "notVaccinated"
                                    ? "text-white"
                                    : "text-gray-700 border-gray-400"
                                    }`}
                                style={{
                                    backgroundColor: currentSelectedOption === "notVaccinated" ? ERROR[500] : GRAY[100],
                                    borderColor: currentSelectedOption === "notVaccinated" ? ERROR[500] : BORDER.DEFAULT
                                }}
                            >
                                <FiXCircle className="w-4 h-4 mr-2 inline" />
                                Chưa Tiêm
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {currentSelectedOption === "vaccinated" ? (
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                                    Triệu chứng sau tiêm *
                                </label>
                                <textarea
                                    name="symptoms"
                                    value={currentFormData.symptoms}
                                    onChange={handleInputChange}
                                    placeholder="Nhập triệu chứng sau tiêm..."
                                    rows="3"
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }}
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                                    Lý do không tiêm *
                                </label>
                                <textarea
                                    name="reason"
                                    value={currentFormData.reason}
                                    onChange={handleInputChange}
                                    placeholder="Nhập lý do không tiêm..."
                                    rows="3"
                                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>
                                Ghi chú sau buổi tiêm
                            </label>
                            <textarea
                                name="noteAfterSession"
                                value={currentFormData.noteAfterSession}
                                onChange={handleInputChange}
                                placeholder="Ghi chú bổ sung..."
                                rows="3"
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }}
                            />
                        </div>

                        <div className="pt-4">
                            {isEditing ? (
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        disabled={currentIsSubmitting}
                                        className="flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        style={{ backgroundColor: GRAY[500], color: COMMON.WHITE }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={currentIsSubmitting}
                                        className="flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE }}
                                    >
                                        {currentIsSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck className="w-4 h-4 mr-2" /> Lưu thay đổi
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={currentIsSubmitting}
                                    className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE }}
                                >
                                    {currentIsSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheck className="w-4 h-4 mr-2" /> Xác nhận
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default VaccinationProcess; 