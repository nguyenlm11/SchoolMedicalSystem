import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiUsers, FiCheckCircle, FiXCircle, FiSearch, FiCheck, FiClock, FiActivity, FiEdit } from "react-icons/fi";
import { PRIMARY, GRAY, SUCCESS, ERROR, TEXT, BACKGROUND, BORDER, SHADOW, COMMON } from "../../constants/colors";
import healthCheckApi from '../../api/healthCheckApi';
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";

const HealthCheckProcess = () => {
    const { id, itemId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [healthCheck, setHealthCheck] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedItem, setSelectedItem] = useState(itemId || "all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [healthCheckResults, setHealthCheckResults] = useState([]); // Danh sách kết quả khám từ BE
    useEffect(() => { setSelectedStudent(null); }, [selectedItem]);
    useEffect(() => {
        if (selectedItem === 'all' && students.length > 0) {
            const firstItem = students[0].healthCheckItemId;
            if (firstItem) setSelectedItem(firstItem);
        }
    }, [students]);
    const [error, setError] = useState(null);
    const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => { fetchData(); }, [id, itemId, user?.id]);

    // TODO: Khi có API BE, gọi API lấy kết quả khám ở đây
    // useEffect(() => {
    //   healthCheckApi.getHealthCheckResults(id).then(res => {
    //     if (res.success && Array.isArray(res.data)) setHealthCheckResults(res.data);
    //   });
    // }, [id]);

    // Hàm lấy trạng thái kết quả khám cho từng học sinh + mục
    function getResultStatus(studentId, healthCheckItemId) {
        const result = healthCheckResults.find(r => r.studentId === studentId && r.healthCheckItemId === healthCheckItemId);
        return result ? result.resultStatus : "InProgress"; // "Completed", "NotChecked", "InProgress"
    }

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await healthCheckApi.getHealthCheckPlanDetails(id);
            const plan = response.data;
            setHealthCheck(plan);
            const assignedItems = plan.itemNurseAssignments?.filter(a => a.nurseId === user?.id) || [];
            if (assignedItems.length === 0 && user?.role === 'schoolnurse') {
                setError("Bạn không được phân công cho hạng mục nào trong buổi khám này");
                setLoading(false);
                return;
            }
            const studentsRes = await healthCheckApi.getClassStudentList(id);
            let allStudents = [];
            if (studentsRes.success && studentsRes.data) {
                studentsRes.data.forEach(classItem => {
                    classItem.students.forEach(student => {
                        if (student.status === 'Confirmed') {
                            assignedItems.forEach(item => {
                                allStudents.push({
                                    ...student,
                                    classId: classItem.classId,
                                    className: classItem.className,
                                    healthCheckItemId: item.healthCheckItemId,
                                    healthCheckItemName: item.healthCheckItemName,
                                    resultStatus: student.resultStatus || "InProgress"
                                });
                            });
                        }
                    });
                });
            }
            setStudents(allStudents);
            setLoading(false);
        } catch (err) {
            setError("Không thể tải thông tin khám sức khỏe.");
            setLoading(false);
        }
    };

    const uniqueItems = [...new Set(students.map(student => student.healthCheckItemId))].map(itemId => {
        const student = students.find(s => s.healthCheckItemId === itemId);
        return { id: itemId, name: student?.healthCheckItemName || itemId };
    });
    const uniqueClasses = [...new Set(students.map(student => student.classId))].map(classId => {
        const student = students.find(s => s.classId === classId);
        return { id: classId, name: student?.className || classId };
    });

    const filteredStudents = students
        .filter(student => {
            const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "all" || getResultStatus(student.studentId, student.healthCheckItemId) === filterStatus;
            const matchesItem = selectedItem === "all" || student.healthCheckItemId === selectedItem;
            const matchesClass = selectedClass === "all" || student.classId === selectedClass;
            return matchesSearch && matchesStatus && matchesItem && matchesClass;
        })
        .sort((a, b) => a.studentName.localeCompare(b.studentName));

    const handleResultSubmit = async (resultData) => {
        try {
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.studentId === selectedStudent.studentId && student.healthCheckItemId === selectedStudent.healthCheckItemId
                        ? { ...student, resultStatus: resultData.resultStatus } : student
                ))
            setAlertModal({ isOpen: true, type: 'success', message: 'Cập nhật kết quả khám thành công!' });
            const currentIndex = filteredStudents.findIndex(s => s.studentId === selectedStudent.studentId && s.healthCheckItemId === selectedStudent.healthCheckItemId);
            const nextStudent = filteredStudents[currentIndex + 1];
            if (nextStudent) setSelectedStudent(nextStudent);
        } catch (err) {
            setAlertModal({ isOpen: true, type: 'error', message: 'Có lỗi xảy ra khi cập nhật kết quả khám.' });
        }
    };

    const StatusBadge = ({ status }) => {
        let bg, text, icon;
        if (status === "Completed") {
            bg = PRIMARY[500];
            text = "Đã khám";
            icon = <FiCheckCircle className="w-4 h-4" />;
        } else if (status === "NotChecked") {
            bg = ERROR[500];
            text = "Không khám";
            icon = <FiXCircle className="w-4 h-4" />;
        } else {
            bg = PRIMARY[300];
            text = "Chờ khám";
            icon = <FiClock className="w-4 h-4" />;
        }
        return (
            <div className="px-3 py-1 rounded-full inline-flex items-center space-x-1" style={{ backgroundColor: bg, color: COMMON.WHITE }}>
                {icon}
                <span className="text-sm font-medium">{text}</span>
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
                                    Tiến hành khám sức khỏe
                                </h1>
                                <p className="text-sm mt-1" style={{ color: TEXT.SECONDARY }}>
                                    {healthCheck?.sessionName} {selectedItem !== "all" ? `- ${uniqueItems.find(i => i.id === selectedItem)?.name || ''}` : ''}
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
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        selectedClass={selectedClass}
                        setSelectedClass={setSelectedClass}
                        uniqueClasses={uniqueClasses}
                        StatusBadge={StatusBadge}
                        getResultStatus={getResultStatus}
                    />
                    <HealthCheckPanel
                        selectedStudent={selectedStudent}
                        sessionId={id}
                        onEdit={handleResultSubmit}
                        uniqueItems={uniqueItems}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        resultStatus={getResultStatus(selectedStudent?.studentId, selectedStudent?.healthCheckItemId)}
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

const StudentList = ({ students, selectedStudent, setSelectedStudent, searchTerm, setSearchTerm, filterStatus, setFilterStatus, selectedClass, setSelectedClass, uniqueClasses, StatusBadge, getResultStatus }) => (
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
                    {uniqueClasses.map(cls => (
                        <button
                            key={cls.id}
                            onClick={() => setSelectedClass(cls.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
                            style={{
                                backgroundColor: selectedClass === cls.id ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                color: selectedClass === cls.id ? TEXT.INVERSE : TEXT.PRIMARY,
                                border: `1px solid ${selectedClass === cls.id ? PRIMARY[500] : BORDER.DEFAULT}`
                            }}
                        >
                            {cls.name}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'InProgress', 'Completed', 'NotChecked'].map(status => (
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
                            {status === 'all' ? 'Tất cả' : status === 'InProgress' ? 'Chờ khám' : status === 'Completed' ? 'Đã khám' : 'Không khám'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {students.length > 0 ? (
                    <div className="space-y-2">
                        {students.map((student) => (
                            <StudentCard
                                key={student.studentId + '-' + student.healthCheckItemId}
                                student={student}
                                isSelected={selectedStudent?.studentId === student.studentId && selectedStudent?.healthCheckItemId === student.healthCheckItemId}
                                onClick={() => setSelectedStudent(student)}
                                StatusBadge={StatusBadge}
                                resultStatus={getResultStatus(student.studentId, student.healthCheckItemId)}
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

const StudentCard = ({ student, isSelected, onClick, StatusBadge, resultStatus }) => (
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
                        <StatusBadge status={resultStatus} />
                    </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4" style={{ color: GRAY[400] }} />
                        <span style={{ color: TEXT.SECONDARY }}>
                            Lớp {student.className}
                        </span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <FiActivity className="w-4 h-4" style={{ color: PRIMARY[400] }} />
                        <span style={{ color: TEXT.SECONDARY }}>{student.healthCheckItemName}</span>
                    </div>
                </div>
            </div>
        </div>
        {resultStatus === "InProgress" && (
            <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: TEXT.SECONDARY }}>Trạng thái khám</span>
                    <span style={{ color: PRIMARY[600] }}>Chờ khám</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ backgroundColor: PRIMARY[500], width: '60%' }} />
                </div>
            </div>
        )}
    </div>
);

const HealthCheckPanel = ({ selectedStudent, sessionId, onEdit, uniqueItems, selectedItem, setSelectedItem, resultStatus }) => (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden" style={{ borderColor: BORDER.DEFAULT, boxShadow: `0 4px 6px -1px ${SHADOW.LIGHT}, 0 2px 4px -1px ${SHADOW.DEFAULT}` }}>
        <div className="px-6 py-4 border-b flex items-center" style={{ background: `linear-gradient(135deg, ${PRIMARY[50]} 0%, ${PRIMARY[100]} 100%)`, borderColor: PRIMARY[200] }}>
            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${PRIMARY[500]}20` }}>
                <FiActivity className="h-6 w-6" style={{ color: PRIMARY[700] }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: PRIMARY[700] }}>
                Thông tin khám sức khỏe
            </h2>
        </div>
        <div className="p-6">
            {uniqueItems.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {uniqueItems.map(({ id, name }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedItem(id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
                            style={{
                                backgroundColor: selectedItem === id ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                color: selectedItem === id ? TEXT.INVERSE : TEXT.PRIMARY,
                                border: `1px solid ${selectedItem === id ? PRIMARY[500] : BORDER.DEFAULT}`
                            }}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            )}
            {selectedStudent ? (
                (resultStatus === "Completed" || resultStatus === "NotChecked") ? (
                    <HealthCheckResult student={selectedStudent} sessionId={sessionId} onEdit={onEdit} />
                ) : (
                    <HealthCheckForm student={selectedStudent} onSubmit={onEdit} sessionId={sessionId} />
                )
            ) : (
                <div className="text-center py-12">
                    <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: PRIMARY[100] }}>
                        <FiUser className="h-10 w-10" style={{ color: PRIMARY[500] }} />
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                        Chọn học sinh để nhập kết quả khám
                    </p>
                    <p style={{ color: TEXT.SECONDARY }}>
                        Vui lòng chọn một học sinh từ danh sách bên trái
                    </p>
                </div>
            )}
        </div>
    </div>
);

const HealthCheckResult = ({ student, sessionId, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        selectedOption: student.resultStatus === "Completed" ? "checked" : "notChecked",
        result: '',
        note: '',
        reason: '',
        isSubmitting: false,
        error: null
    });
    const isCompleted = student.resultStatus === "Completed";
    const handleEdit = async (resultData) => {
        try {
            await onEdit(resultData);
            setIsEditing(false);
        } catch (error) {
            setForm(f => ({ ...f, error: error.message || "Có lỗi xảy ra khi cập nhật kết quả khám." }));
        }
    };
    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: isCompleted ? PRIMARY[50] : GRAY[50], borderColor: isCompleted ? PRIMARY[200] : GRAY[200] }}>
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: isCompleted ? PRIMARY[100] : GRAY[100] }}>
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
                            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: isCompleted ? PRIMARY[500] : GRAY[500], color: COMMON.WHITE }}>
                                {isCompleted ? "Đã khám" : "Không khám"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {form.error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm" style={{ color: ERROR[600] }}>{form.error}</p>
                </div>
            )}
            {!isEditing ? (
                <div className="space-y-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isCompleted ? PRIMARY[100] : GRAY[100] }}>
                            {isCompleted ? (
                                <FiCheckCircle className="w-8 h-8" style={{ color: PRIMARY[600] }} />
                            ) : (
                                <FiXCircle className="w-8 h-8" style={{ color: GRAY[600] }} />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                            {isCompleted ? "Đã khám" : "Không khám"}
                        </h3>
                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                            {isCompleted ? "Học sinh đã được khám thành công" : "Học sinh không được khám"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center"
                        style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE }}
                    >
                        <FiEdit className="w-4 h-4 mr-2" />
                        Xem và chỉnh sửa kết quả
                    </button>
                </div>
            ) : (
                <HealthCheckForm
                    student={student}
                    sessionId={sessionId}
                    onSubmit={handleEdit}
                    isEditing={true}
                    form={form}
                    setForm={setForm}
                    onCancel={() => setIsEditing(false)}
                />
            )}
        </div>
    );
};

function getResultInput(student, form, setForm) {
    const name = (student.healthCheckItemName || '').toLowerCase();
    const category = (student.category || '').toLowerCase();
    const handleChange = e => setForm(f => ({ ...f, result: e.target.value }));
    if (category === 'height' || name.includes('chiều cao')) {
        return (
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>Chiều cao (cm) *</label>
                <input type="number" name="result" value={form.result} onChange={handleChange} placeholder="Nhập chiều cao (cm)" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }} />
            </div>
        );
    }
    if (category === 'weight' || name.includes('cân nặng')) {
        return (
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>Cân nặng (kg) *</label>
                <input type="number" name="result" value={form.result} onChange={handleChange} placeholder="Nhập cân nặng (kg)" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }} />
            </div>
        );
    }
    if (category === 'vision' || name.includes('mắt')) {
        return (
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>Thị lực *</label>
                <input type="text" name="result" value={form.result} onChange={handleChange} placeholder="Nhập kết quả thị lực (VD: 10/10, 8/10, ... )" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }} />
            </div>
        );
    }
    if (category === 'hearing' || name.includes('tai')) {
        return (
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>Kết quả kiểm tra thính lực *</label>
                <input type="text" name="result" value={form.result} onChange={handleChange} placeholder="Nhập kết quả nghe (VD: Bình thường, Giảm nhẹ, ... )" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }} />
            </div>
        );
    }
    return (
        <div>
            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>Kết quả khám *</label>
            <textarea name="result" value={form.result} onChange={handleChange} placeholder="Nhập kết quả khám..." rows="3" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }} />
        </div>
    );
}

const HealthCheckForm = ({ student, sessionId, onSubmit, isEditing = false, form, setForm, onCancel }) => {
    const [localForm, setLocalForm] = useState({
        selectedOption: "checked",
        result: '',
        note: '',
        reason: '',
        isSubmitting: false,
        error: null
    });
    const f = isEditing ? form : localForm;
    const setF = isEditing ? setForm : setLocalForm;
    const handleInput = e => setF(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectOption = option => setF(prev => ({ ...prev, selectedOption: option, result: '', reason: '', error: null }));
    const handleSubmit = async e => {
        e.preventDefault();
        setF(prev => ({ ...prev, error: null }));
        if (f.selectedOption === "checked" && (!f.result || f.result.trim() === '')) {
            setF(prev => ({ ...prev, error: "Vui lòng nhập kết quả khám." }));
            return;
        }
        if (f.selectedOption === "notChecked" && (!f.reason || f.reason.trim() === '')) {
            setF(prev => ({ ...prev, error: "Vui lòng nhập lý do không khám." }));
            return;
        }
        setF(prev => ({ ...prev, isSubmitting: true }));
        try {
            await onSubmit({
                resultStatus: f.selectedOption === "checked" ? "Completed" : "NotChecked",
                studentId: student.studentId,
                result: f.result,
                note: f.note,
                reason: f.reason
            });
            if (!isEditing) setLocalForm({ selectedOption: "checked", result: '', note: '', reason: '', isSubmitting: false, error: null });
        } catch (error) {
            setF(prev => ({ ...prev, error: error.message || "Có lỗi xảy ra khi cập nhật kết quả khám." }));
        } finally {
            setF(prev => ({ ...prev, isSubmitting: false }));
        }
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
                            <h3 className="text-lg font-semibold" style={{ color: PRIMARY[700] }}>{student.studentName}</h3>
                            <p className="text-sm" style={{ color: PRIMARY[600] }}>Lớp {student.className}</p>
                            <p className="text-xs mt-1" style={{ color: TEXT.SECONDARY }}>Hạng mục: {student.healthCheckItemName}</p>
                        </div>
                    </div>
                </div>
            )}
            {f.error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm" style={{ color: ERROR[600] }}>{f.error}</p>
                </div>
            )}
            {isEditing && <h4 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>Chỉnh sửa kết quả khám</h4>}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-4" style={{ color: TEXT.SECONDARY }}>Chọn trạng thái khám</label>
                <div className="flex gap-4">
                    <button type="button" onClick={() => handleSelectOption("checked")} className={`py-3 rounded-xl text-sm font-medium transition-all text-center border-2 ${f.selectedOption === "checked" ? "text-white" : "text-gray-700 border-gray-400"}`} style={{ backgroundColor: f.selectedOption === "checked" ? SUCCESS[500] : GRAY[100], borderColor: f.selectedOption === "checked" ? SUCCESS[500] : BORDER.DEFAULT, flex: "1" }}>
                        <FiCheckCircle className="w-4 h-4 mr-2 inline" />Đã khám
                    </button>
                    {!(isEditing && student.resultStatus === "Completed") && (
                        <button type="button" onClick={() => handleSelectOption("notChecked")} className={`py-3 rounded-xl text-sm font-medium transition-all text-center border-2 ${f.selectedOption === "notChecked" ? "text-white" : "text-gray-700 border-gray-400"}`} style={{ backgroundColor: f.selectedOption === "notChecked" ? ERROR[500] : GRAY[100], borderColor: f.selectedOption === "notChecked" ? ERROR[500] : BORDER.DEFAULT, flex: "1" }}>
                            <FiXCircle className="w-4 h-4 mr-2 inline" /> Không khám
                        </button>
                    )}
                </div>
                <p className="text-xs mt-2" style={{ color: TEXT.SECONDARY }}>{f.selectedOption === "checked" ? "Chọn khi học sinh đã được khám thành công" : "Chọn khi học sinh chưa được khám (có lý do cụ thể)"}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {f.selectedOption === "checked" ? getResultInput(student, f, setF) : (
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>Lý do không khám *</label>
                        <textarea name="reason" value={f.reason} onChange={handleInput} placeholder="Nhập lý do không khám..." rows="3" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }} />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>Ghi chú</label>
                    <textarea name="note" value={f.note} onChange={handleInput} placeholder="Ghi chú bổ sung về quá trình khám..." rows="3" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: `${PRIMARY[500]}` }} />
                </div>
                <div className="pt-4">
                    {isEditing ? (
                        <div className="flex gap-4">
                            <button type="button" onClick={onCancel} disabled={f.isSubmitting} className="flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" style={{ backgroundColor: GRAY[500], color: COMMON.WHITE }}>Hủy</button>
                            <button type="submit" disabled={f.isSubmitting} className="flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE }}>{f.isSubmitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Đang lưu...</>) : (<><FiCheck className="w-4 h-4 mr-2" /> Lưu thay đổi</>)}</button>
                        </div>
                    ) : (
                        <button type="submit" disabled={f.isSubmitting} className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE }}>{f.isSubmitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Đang lưu...</>) : (<><FiCheck className="w-4 h-4 mr-2" /> Xác nhận</>)}</button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default HealthCheckProcess; 