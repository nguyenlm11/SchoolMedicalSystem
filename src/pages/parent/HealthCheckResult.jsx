import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiCheckCircle, FiXCircle, FiAlertCircle, FiEye, FiActivity, FiHeart, FiFileText } from 'react-icons/fi';
import { PRIMARY, GRAY, SUCCESS, WARNING, ERROR, TEXT, BACKGROUND } from '../../constants/colors';
import Loading from '../../components/Loading';
import healthCheckApi from '../../api/healthCheckApi';

const HealthCheckResult = () => {
    const { id: healthCheckId } = useParams();
    const location = useLocation();
    const studentId = location.state?.studentId;

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHealthCheckResults();
    }, [healthCheckId]);

    const fetchHealthCheckResults = async () => {
        if (!healthCheckId || !studentId) {
            setError('Không tìm thấy thông tin cần thiết');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await healthCheckApi.getHealthCheckResultsByStudent(healthCheckId, studentId);

            if (response?.success && Array.isArray(response.data)) {
                const uniqueResults = Object.values(
                    response.data.reduce((acc, item) => {
                        const existing = acc[item.healthCheckItemId];
                        if (!existing ||
                            item.resultStatus === 'Complete' ||
                            (item.resultItems?.length || 0) > (existing.resultItems?.length || 0)) {
                            acc[item.healthCheckItemId] = item;
                        }
                        return acc;
                    }, {})
                );

                const orderMap = {
                    'mắt trái': 1, 'mắt phải': 2, 'tai trái': 3, 'tai phải': 4,
                    'chiều cao': 5, 'cân nặng': 6, 'huyết áp': 7, 'nhịp tim': 8
                };

                uniqueResults.sort((a, b) => {
                    const nameA = a.healthCheckItemName?.toLowerCase() || '';
                    const nameB = b.healthCheckItemName?.toLowerCase() || '';
                    const orderA = Object.entries(orderMap).find(([key]) => nameA.includes(key))?.[1] || 999;
                    const orderB = Object.entries(orderMap).find(([key]) => nameB.includes(key))?.[1] || 999;
                    return orderA - orderB;
                });

                setResults(uniqueResults);

                if (uniqueResults.length > 0) {
                    const { studentName, userId } = uniqueResults[0];
                    if (studentName) {
                        setStudentInfo({ name: studentName, userId });
                    }
                }
            } else {
                setError('Không có dữ liệu kết quả kiểm tra sức khỏe');
            }
        } catch (error) {
            setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Complete':
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: SUCCESS[50], color: SUCCESS[700] }}>
                        <FiCheckCircle className="mr-1.5 h-4 w-4" />
                        Đã kiểm tra
                    </span>
                );
            case 'NotChecked':
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: GRAY[50], color: GRAY[700] }}>
                        <FiAlertCircle className="mr-1.5 h-4 w-4" />
                        Chưa kiểm tra
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
                        <FiXCircle className="mr-1.5 h-4 w-4" />
                        Lỗi
                    </span>
                );
        }
    };

    const iconMap = {
        'mắt': FiEye,
        'tai': FiActivity,
        'huyết áp': FiHeart,
        'tim': FiHeart
    };

    const getHealthCheckIcon = (itemName) => {
        const name = itemName.toLowerCase();
        return Object.entries(iconMap).find(([key]) => name.includes(key))?.[1] || FiFileText;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải kết quả kiểm tra sức khỏe..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: ERROR[50] }}>
                        <FiXCircle className="w-8 h-8" style={{ color: ERROR[500] }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                        Lỗi tải dữ liệu
                    </h3>
                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <section className="py-12 sm:py-16 relative overflow-hidden" style={{ backgroundColor: PRIMARY[500] }}>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center text-white max-w-5xl mx-auto">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4">
                            Kết quả kiểm tra sức khỏe
                        </h1>
                        <p className="text-base sm:text-lg opacity-90 leading-relaxed font-medium px-4">
                            Quản lý kết quả kiểm tra sức khỏe của {studentInfo?.name}
                        </p>
                    </div>
                </div>
            </section>

            <div className="py-8">
                <div className="w-full">
                    {!results || results.length === 0 ? (
                        <div className="px-6 lg:px-8">
                            <div className="bg-white rounded-3xl shadow-sm border p-16 text-center max-w-4xl mx-auto"
                                style={{ borderColor: GRAY[200] }}>
                                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                                    style={{ backgroundColor: GRAY[50] }}>
                                    <FiFileText className="w-12 h-12" style={{ color: GRAY[400] }} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                                    Không có mục kiểm tra
                                </h3>
                                <p className="text-lg mb-4" style={{ color: TEXT.SECONDARY }}>
                                    Chưa có mục kiểm tra sức khỏe nào được thiết lập cho kế hoạch này.
                                </p>

                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 lg:px-8">
                                <div className="max-w-7xl mx-auto">
                                    <div className="grid gap-6 lg:gap-8 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4">
                                        {results.map((result) => {
                                            const IconComponent = getHealthCheckIcon(result.healthCheckItemName);
                                            return (
                                                <div key={`${result.id}-${result.healthCheckItemId}`}
                                                    className="bg-white rounded-3xl shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                                                    style={{ borderColor: GRAY[200] }}>
                                                    <div className="p-6 pb-4">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center flex-1">
                                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                                                                    style={{ backgroundColor: PRIMARY[50] }}>
                                                                    <IconComponent className="w-7 h-7" style={{ color: PRIMARY[600] }} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className="text-xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                                                                        {result.healthCheckItemName}
                                                                    </h3>
                                                                    <div className="flex items-center">
                                                                        {getStatusBadge(result.resultStatus)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="px-6 pb-6">
                                                        {result.resultStatus === 'Complete' && result.resultItems?.length > 0 ? (
                                                            <div className="space-y-4">
                                                                {result.resultItems.map((item, index) => (
                                                                    <div key={index}
                                                                        className="p-5 rounded-2xl border"
                                                                        style={{ backgroundColor: SUCCESS[25], borderColor: SUCCESS[200] }}>
                                                                        <div className="items-center text-center mb-3">
                                                                            <div className="text-3xl font-black" style={{ color: TEXT.PRIMARY }}>
                                                                                {item?.value || 'N/A'}{result.unit}
                                                                            </div>
                                                                        </div>
                                                                        {item?.notes?.trim() && (
                                                                            <div className="mt-4 pt-4 border-t" style={{ borderColor: GRAY[200] }}>
                                                                                <div className="flex items-start space-x-2">
                                                                                    <FiFileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: TEXT.SECONDARY }} />
                                                                                    <p className="text-sm leading-relaxed" style={{ color: TEXT.SECONDARY }}>
                                                                                        <span className="font-semibold">Ghi chú:</span> {item.notes}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="py-10 text-center">
                                                                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                                                                    style={{ backgroundColor: result.resultStatus === 'NotChecked' ? WARNING[50] : GRAY[50] }}>
                                                                    <FiAlertCircle className="w-7 h-7" style={{ color: result.resultStatus === 'NotChecked' ? WARNING[600] : GRAY[400] }} />
                                                                </div>
                                                                <p className="text-lg font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                                                    {result.resultStatus === 'NotChecked' ? 'Chưa được kiểm tra' : 'Đang kiểm tra'}
                                                                </p>
                                                                <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                    {result.resultStatus === 'NotChecked'
                                                                        ? 'Mục này sẽ được kiểm tra trong buổi khám sức khỏe'
                                                                        : 'Vui lòng liên hệ nhân viên y tế để biết thêm chi tiết'
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default HealthCheckResult;