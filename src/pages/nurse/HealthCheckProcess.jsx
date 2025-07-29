import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiUsers, FiCheckCircle, FiSearch, FiClock } from "react-icons/fi";
import { PRIMARY, GRAY, SUCCESS, ERROR, TEXT, BACKGROUND, BORDER, COMMON } from "../../constants/colors";
import healthCheckApi from '../../api/healthCheckApi';
import Loading from "../../components/Loading";
import AlertModal from "../../components/modal/AlertModal";

const HealthCheckProcess = () => {
    const { id, itemId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });

    const [healthCheck, setHealthCheck] = useState(null);
    const [students, setStudents] = useState([]);
    const [healthCheckResults, setHealthCheckResults] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedItem, setSelectedItem] = useState(itemId || "all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("NotChecked");

    useEffect(() => { setSelectedStudent(null); }, [selectedItem]);
    useEffect(() => {
        if (selectedItem === 'all' && students.length > 0) {
            const firstItem = students[0].healthCheckItemId;
            if (firstItem) setSelectedItem(firstItem);
        }
    }, [students]);

    useEffect(() => { fetchData(); }, [id, itemId, user?.id]);

    const getResultStatus = (studentId, healthCheckItemId) =>
        healthCheckResults.find(r => r.userId === studentId && r.healthCheckItemId === healthCheckItemId)?.resultStatus || "NotChecked";

    const fetchData = async () => {
        try {
            setLoading(true);
            const [planResponse, studentsRes, resultsRes] = await Promise.all([
                healthCheckApi.getHealthCheckPlanDetails(id),
                healthCheckApi.getClassStudentList(id),
                healthCheckApi.getHealthCheckResults(id)
            ]);
            const plan = planResponse.data;
            setHealthCheck(plan);
            setHealthCheckResults(resultsRes.success && Array.isArray(resultsRes.data) ? resultsRes.data : []);

            const assignedItems = plan.itemNurseAssignments?.filter(a => a.nurseId === user?.id) || [];
            if (assignedItems.length === 0 && user?.role === 'schoolnurse') {
                setError("Bạn không được phân công cho hạng mục nào trong buổi khám này");
                return;
            }

            const allStudents = studentsRes.success && studentsRes.data ?
                studentsRes.data.flatMap(classItem =>
                    classItem.students
                        .filter(student => student.status === 'Confirmed')
                        .flatMap(student =>
                            assignedItems.map(item => {
                                const resultItem = (resultsRes.success && Array.isArray(resultsRes.data)) ?
                                    resultsRes.data.find(r => r.userId === student.studentId && r.healthCheckItemId === item.healthCheckItemId) : null;
                                return {
                                    ...student,
                                    classId: classItem.classId,
                                    className: classItem.className,
                                    healthCheckItemId: item.healthCheckItemId,
                                    healthCheckItemName: item.healthCheckItemName,
                                    unit: resultItem?.unit || "",
                                    resultStatus: student.resultStatus || "NotChecked"
                                };
                            })
                        )
                ) : [];
            setStudents(allStudents);
        } catch (err) {
            setError("Không thể tải thông tin khám sức khỏe.");
        } finally {
            setLoading(false);
        }
    };

    const uniqueItems = useMemo(() =>
        [...new Set(students.map(s => s.healthCheckItemId))]
            .map(id => ({
                id,
                name: students.find(s => s.healthCheckItemId === id)?.healthCheckItemName || id
            }))
        , [students]);

    const uniqueClasses = useMemo(() =>
        [...new Set(students.map(s => s.classId))]
            .map(id => ({
                id,
                name: students.find(s => s.classId === id)?.className || id
            }))
        , [students]);

    const filteredStudents = useMemo(() => students
        .filter(student =>
            student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            getResultStatus(student.studentId, student.healthCheckItemId) === filterStatus &&
            (selectedItem === "all" || student.healthCheckItemId === selectedItem) &&
            (selectedClass === "all" || student.classId === selectedClass)
        )
        .sort((a, b) => a.studentName.localeCompare(b.studentName))
        , [students, searchTerm, filterStatus, selectedItem, selectedClass, healthCheckResults]);

    const handleResultSubmit = async (resultData) => {
        try {
            const name = (selectedStudent?.healthCheckItemName || '').toLowerCase();
            let response;

            const payload = {
                studentId: resultData.studentId,
                healthCheckItemId: resultData.healthCheckItemId,
                value: resultData.value,
                comments: resultData.comments
            };

            if (name.trim().includes('mắt trái')) {
                response = await healthCheckApi.submitLeftVisionResult(id, payload);
            } else if (name.trim().includes('mắt phải')) {
                response = await healthCheckApi.submitRightVisionResult(id, payload);
            } else if (name.trim().includes('tai trái')) {
                response = await healthCheckApi.submitLeftHearingResult(id, payload);
            } else if (name.trim().includes('tai phải')) {
                response = await healthCheckApi.submitRightHearingResult(id, payload);
            } else if (name.trim().includes('chiều cao')) {
                response = await healthCheckApi.submitHeightResult(id, payload);
            } else if (name.trim().includes('cân nặng')) {
                response = await healthCheckApi.submitWeightResult(id, payload);
            } else if (name.trim().includes('huyết áp')) {
                response = await healthCheckApi.submitBloodPressureResult(id, payload);
            } else if (name.trim().includes('nhịp tim')) {
                response = await healthCheckApi.submitHeartRateResult(id, payload);
            } else {
                throw new Error(`Không xác định được loại khám: "${name}"`);
            }

            if (!response?.success) {
                throw new Error(response?.message || 'Có lỗi xảy ra');
            }

            await fetchData();
            setAlertModal({ isOpen: true, type: 'success', message: 'Lưu kết quả khám thành công!' });
        } catch (error) {
            setAlertModal({
                isOpen: true,
                type: 'error',
                message: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu kết quả khám.'
            });
        }
    };

    const StatusBadge = ({ status }) => {
        const isComplete = status === "Complete";
        return (
            <div className="px-3 py-1 rounded-full inline-flex items-center space-x-1"
                style={{ backgroundColor: isComplete ? SUCCESS[500] : PRIMARY[400], color: COMMON.WHITE }}>
                {isComplete ? <FiCheckCircle className="w-4 h-4" /> : <FiClock className="w-4 h-4" />}
                <span className="text-sm font-medium">{isComplete ? "Đã khám" : "Chờ khám"}</span>
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
                        handleResultSubmit={handleResultSubmit}
                        uniqueItems={uniqueItems}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        resultStatus={getResultStatus(selectedStudent?.studentId, selectedStudent?.healthCheckItemId)}
                        healthCheckResults={healthCheckResults}
                        setAlertModal={setAlertModal}
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
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: BORDER.DEFAULT }}>
        <div className="px-6 py-4 border-b flex items-center" style={{ backgroundColor: PRIMARY[50], borderColor: PRIMARY[200] }}>
            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[100] }}>
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
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none"
                        style={{ borderColor: BORDER.DEFAULT }}
                        placeholder="Tìm kiếm học sinh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedClass("all")}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                            backgroundColor: selectedClass === "all" ? PRIMARY[500] : 'white',
                            color: selectedClass === "all" ? 'white' : TEXT.PRIMARY,
                            border: `1px solid ${selectedClass === "all" ? PRIMARY[500] : BORDER.DEFAULT}`
                        }}
                    >
                        Tất cả lớp
                    </button>
                    {uniqueClasses.map(cls => (
                        <button
                            key={cls.id}
                            onClick={() => setSelectedClass(cls.id)}
                            className="px-4 py-2 rounded-lg text-sm font-medium"
                            style={{
                                backgroundColor: selectedClass === cls.id ? PRIMARY[500] : 'white',
                                color: selectedClass === cls.id ? 'white' : TEXT.PRIMARY,
                                border: `1px solid ${selectedClass === cls.id ? PRIMARY[500] : BORDER.DEFAULT}`
                            }}
                        >
                            {cls.name}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {['NotChecked', 'Complete'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className="px-4 py-2 rounded-lg text-sm font-medium"
                            style={{
                                backgroundColor: filterStatus === status ? PRIMARY[500] : 'white',
                                color: filterStatus === status ? 'white' : TEXT.PRIMARY,
                                border: `1px solid ${filterStatus === status ? PRIMARY[500] : BORDER.DEFAULT}`
                            }}
                        >
                            {status === 'Complete' ? 'Đã khám' : 'Chờ khám'}
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
        className="p-4 rounded-xl border cursor-pointer"
        style={{ backgroundColor: isSelected ? PRIMARY[50] : 'white', borderColor: isSelected ? PRIMARY[400] : BORDER.DEFAULT }}
    >
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isSelected ? PRIMARY[200] : PRIMARY[100] }}
                >
                    <FiUser className="w-6 h-6" style={{ color: PRIMARY[600] }} />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate" style={{ color: TEXT.PRIMARY }}>
                        {student.studentName}
                    </h3>
                    <StatusBadge status={resultStatus} />
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4" style={{ color: GRAY[400] }} />
                        <span style={{ color: TEXT.SECONDARY }}>
                            Lớp {student.className}
                        </span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4" style={{ color: PRIMARY[400] }} />
                        <span style={{ color: TEXT.SECONDARY }}>{student.healthCheckItemName}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const HealthCheckPanel = ({ selectedStudent, uniqueItems, selectedItem, setSelectedItem, resultStatus, healthCheckResults, handleResultSubmit, setAlertModal }) => (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: BORDER.DEFAULT }}>
        <div className="px-6 py-4 border-b flex items-center" style={{ backgroundColor: PRIMARY[50], borderColor: PRIMARY[200] }}>
            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[100] }}>
                <FiUser className="h-6 w-6" style={{ color: PRIMARY[700] }} />
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
                resultStatus === "Complete" ? (
                    <HealthCheckResult student={selectedStudent} healthCheckResults={healthCheckResults} />
                ) : (
                    <HealthCheckForm student={selectedStudent} onSubmit={handleResultSubmit} setAlertModal={setAlertModal} />
                )
            ) : (
                <div className="text-center py-12">
                    <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: PRIMARY[100] }}>
                        <FiUser className="h-10 w-10" style={{ color: PRIMARY[500] }} />
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                        Chọn học sinh để xem kết quả khám
                    </p>
                    <p style={{ color: TEXT.SECONDARY }}>
                        Vui lòng chọn một học sinh từ danh sách bên trái
                    </p>
                </div>
            )}
        </div>
    </div>
);

const HealthCheckResult = ({ student, healthCheckResults }) => {
    const resultDetails = healthCheckResults.find(r =>
        r.userId === student.studentId && r.healthCheckItemId === student.healthCheckItemId
    );

    console.log(resultDetails);

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: PRIMARY[50], borderColor: PRIMARY[200] }}>
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: PRIMARY[100] }}>
                        <FiCheckCircle className="w-6 h-6" style={{ color: PRIMARY[600] }} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold" style={{ color: PRIMARY[700] }}>
                            {student.studentName}
                        </h3>
                        <p className="text-sm" style={{ color: PRIMARY[600] }}>
                            Lớp {student.className} - {student.healthCheckItemName}
                        </p>
                    </div>
                </div>
            </div>

            {resultDetails?.resultItems?.length > 0 && (
                <div className="p-4 rounded-xl border" style={{ borderColor: PRIMARY[200] }}>
                    <h4 className="font-semibold mb-4" style={{ color: PRIMARY[700] }}>
                        Kết quả khám:
                    </h4>
                    {resultDetails.resultItems.map((item, index) => (
                        <div key={index} className="mb-4 p-3 rounded-lg" style={{ backgroundColor: BACKGROUND.LIGHT }}>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                        Kết quả:
                                    </label>
                                    <p className="text-base font-semibold mt-1" style={{ color: TEXT.PRIMARY }}>
                                        {item.value} {resultDetails.unit}
                                    </p>
                                </div>
                                {item.notes && (
                                    <div>
                                        <label className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                            Ghi chú:
                                        </label>
                                        <p className="text-sm mt-1" style={{ color: TEXT.PRIMARY }}>
                                            {item.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const HealthCheckForm = ({ student, onSubmit, setAlertModal }) => {
    const [form, setForm] = useState({ value: '', comments: '' });
    const handleValueChange = e => setForm(f => ({ ...f, value: e.target.value }));
    const handleCommentsChange = e => setForm(f => ({ ...f, comments: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.value?.trim()) {
            setAlertModal({ isOpen: true, type: 'error', message: "Vui lòng nhập kết quả khám." });
            return;
        }
        try {
            await onSubmit({
                studentId: student.studentId,
                healthCheckItemId: student.healthCheckItemId,
                value: form.value,
                comments: form.comments
            });
            setForm({ value: '', comments: '' });
        } catch (error) {
            setAlertModal({ isOpen: true, type: 'error', message: error.message || 'Có lỗi xảy ra khi lưu kết quả khám.' });
        }
    };

    const name = (student.healthCheckItemName || '').toLowerCase();
    let label = "Kết quả khám *";
    let type = "text";
    let placeholder = "Nhập kết quả khám";
    let unit = student.unit || "";

    if (name.trim().includes('mắt trái')) {
        label = "Thị lực mắt trái *";
        placeholder = "Nhập kết quả thị lực";
    } else if (name.trim().includes('mắt phải')) {
        label = "Thị lực mắt phải *";
        placeholder = "Nhập kết quả thị lực";
    } else if (name.trim().includes('tai trái')) {
        label = "Thính lực tai trái *";
        placeholder = "Nhập kết quả nghe";
    } else if (name.trim().includes('tai phải')) {
        label = "Thính lực tai phải *";
        placeholder = "Nhập kết quả nghe";
    } else if (name.trim().includes('chiều cao')) {
        label = "Chiều cao *";
        type = "number";
        placeholder = "Nhập chiều cao";
    } else if (name.trim().includes('cân nặng')) {
        label = "Cân nặng *";
        type = "number";
        placeholder = "Nhập cân nặng";
    } else if (name.trim().includes('huyết áp')) {
        label = "Huyết áp *";
        placeholder = "Nhập kết quả đo huyết áp";
    } else if (name.trim().includes('nhịp tim')) {
        label = "Nhịp tim *";
        type = "number";
        placeholder = "Nhập kết quả đo nhịp tim";
    }

    return (
        <div className="space-y-6">
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
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>{label}</label>
                        {unit ? (
                            <div className="relative">
                                <input
                                    type={type}
                                    placeholder={placeholder}
                                    value={form.value}
                                    onChange={handleValueChange}
                                    className="w-full px-4 py-3 pr-16 border rounded-xl focus:outline-none"
                                    style={{ borderColor: BORDER.DEFAULT }}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <span className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                        {unit}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <input
                                type={type}
                                placeholder={placeholder}
                                value={form.value}
                                onChange={handleValueChange}
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none"
                                style={{ borderColor: BORDER.DEFAULT }}
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: TEXT.SECONDARY }}>Ghi chú</label>
                        <textarea
                            value={form.comments}
                            onChange={handleCommentsChange}
                            placeholder="Nhập ghi chú nếu có..."
                            rows="3"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none"
                            style={{ borderColor: BORDER.DEFAULT }}
                        />
                    </div>
                </div>
                <div className="pt-4">
                    <button type="submit" className="w-full px-6 py-3 rounded-xl font-medium" style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE }}>
                        <FiUser className="w-4 h-4 mr-2 inline" />
                        Lưu kết quả
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HealthCheckProcess; 