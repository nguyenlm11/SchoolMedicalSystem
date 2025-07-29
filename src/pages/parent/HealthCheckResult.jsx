import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
    FiArrowLeft, FiUser,
    FiCalendar,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiEye,
    FiActivity,
    FiHeart,
    FiFileText
} from 'react-icons/fi';
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

    useEffect(() => {
        fetchHealthCheckResults();
    }, [healthCheckId]);

    const fetchHealthCheckResults = async () => {
        if (!healthCheckId) {
            setError('Không tìm thấy ID kế hoạch kiểm tra sức khỏe');
            setLoading(false);
            return;
        }

        if (!studentId) {
            setError('Không tìm thấy thông tin học sinh');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await healthCheckApi.getHealthCheckResults(healthCheckId, studentId);

            // Debug logging (development only)
            if (process.env.NODE_ENV === 'development') {
                console.log('🔍 API Response:', response);
                console.log('📊 Raw data:', response?.data);
            }

            if (response && response.success && response.data) {
                let processedResults = [];

                if (Array.isArray(response.data) && response.data.length > 0) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('🔄 Processing', response.data.length, 'items');
                    }

                    // Tạo Map để loại bỏ trùng lặp dựa trên healthCheckItemId
                    const uniqueItemsMap = new Map();

                    response.data.forEach((item, index) => {
                        if (process.env.NODE_ENV === 'development') {
                            console.log(`📋 Item ${index}:`, {
                                id: item.id,
                                itemId: item.healthCheckItemId,
                                itemName: item.healthCheckItemName,
                                status: item.resultStatus,
                                resultItemsCount: item.resultItems?.length || 0
                            });
                        }

                        const key = item.healthCheckItemId;
                        const existing = uniqueItemsMap.get(key);

                        if (!existing) {
                            // Chưa có item này, thêm vào
                            uniqueItemsMap.set(key, item);
                            if (process.env.NODE_ENV === 'development') {
                                console.log(`➕ Added new item: ${item.healthCheckItemName}`);
                            }
                        } else {
                            // Đã có item này, quyết định giữ item nào
                            let shouldReplace = false;

                            // Ưu tiên 1: Status "Complete" hơn "NotChecked"
                            if (item.resultStatus === 'Complete' && existing.resultStatus !== 'Complete') {
                                shouldReplace = true;
                                if (process.env.NODE_ENV === 'development') {
                                    console.log(`🔄 Replacing due to better status: ${item.healthCheckItemName}`);
                                }
                            }
                            // Ưu tiên 2: Nếu cùng status, ưu tiên có nhiều resultItems hơn
                            else if (item.resultStatus === existing.resultStatus) {
                                const itemCount = item.resultItems?.length || 0;
                                const existingCount = existing.resultItems?.length || 0;

                                if (itemCount > existingCount) {
                                    shouldReplace = true;
                                    if (process.env.NODE_ENV === 'development') {
                                        console.log(`🔄 Replacing due to more result items: ${item.healthCheckItemName} (${itemCount} vs ${existingCount})`);
                                    }
                                }
                            }

                            if (shouldReplace) {
                                uniqueItemsMap.set(key, item);
                            }
                        }
                    });

                    // Convert Map thành Array
                    processedResults = Array.from(uniqueItemsMap.values());
                    if (process.env.NODE_ENV === 'development') {
                        console.log('✅ After deduplication:', processedResults.length, 'unique items');
                    }

                    // Sắp xếp theo thứ tự logic
                    processedResults.sort((a, b) => {
                        const getOrder = (itemName) => {
                            if (!itemName) return 999;
                            const name = itemName.toLowerCase();
                            if (name.includes('mắt trái')) return 1;
                            if (name.includes('mắt phải')) return 2;
                            if (name.includes('tai trái')) return 3;
                            if (name.includes('tai phải')) return 4;
                            if (name.includes('chiều cao')) return 5;
                            if (name.includes('cân nặng')) return 6;
                            if (name.includes('huyết áp')) return 7;
                            if (name.includes('tim') || name.includes('nhịp')) return 8;
                            return 9;
                        };

                        return getOrder(a.healthCheckItemName) - getOrder(b.healthCheckItemName);
                    });

                    if (process.env.NODE_ENV === 'development') {
                        console.log('🎯 Final sorted results:', processedResults.map(r => r.healthCheckItemName));
                    }
                }

                setResults(processedResults);

                // Lấy thông tin học sinh từ result đầu tiên
                if (processedResults.length > 0) {
                    const firstResult = processedResults[0];
                    if (firstResult.studentName) {
                        setStudentInfo({
                            name: firstResult.studentName,
                            userId: firstResult.userId
                        });
                        if (process.env.NODE_ENV === 'development') {
                            console.log('👤 Set student info:', firstResult.studentName);
                        }
                    }
                }
            } else {
                if (process.env.NODE_ENV === 'development') {
                    console.error('❌ API Error or No Data:', response);
                }
                setError(response?.message || 'Không có dữ liệu kết quả kiểm tra sức khỏe');
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('💥 Error fetching health check results:', error);
            }
            setError(`Có lỗi xảy ra khi tải dữ liệu: ${error.message || 'Vui lòng thử lại.'}`);
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
            case 'InProgress':
                return (
                    <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
                        style={{ backgroundColor: WARNING[50], color: WARNING[700] }}>
                        <FiActivity className="mr-1.5 h-4 w-4" />
                        Đang kiểm tra
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

    const getHealthCheckIcon = (itemName) => {
        const name = itemName.toLowerCase();
        if (name.includes('mắt')) return FiEye;
        if (name.includes('tai')) return FiActivity;
        if (name.includes('huyết áp') || name.includes('tim')) return FiHeart;
        return FiFileText;
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
            {/* Header */}
            <section className="relative overflow-hidden" style={{
                background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
                            backgroundSize: '50px 50px'
                        }}>
                    </div>
                </div>

                <div className="relative z-10 px-6 lg:px-8 py-12 lg:py-16">
                    <div className="max-w-7xl mx-auto">
                        <Link
                            to="/parent/health-check"
                            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-all duration-300 group"
                        >
                            <div className="p-2 rounded-lg mr-3 group-hover:bg-white/10 transition-all duration-300">
                                <FiArrowLeft className="w-5 h-5" />
                            </div>
                            <span className="font-medium">Quay lại danh sách</span>
                        </Link>

                        <div className="text-white">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-6"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
                                    <FiFileText className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-black mb-2">
                                        Kết quả kiểm tra sức khỏe
                                    </h1>
                                    {studentInfo && (
                                        <div className="flex items-center text-lg opacity-90">
                                            <FiUser className="w-5 h-5 mr-2" />
                                            <span className="font-medium">Học sinh: {studentInfo.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                                        <p className="text-sm text-gray-600 mb-2"><strong>Debug info:</strong></p>
                                        <p className="text-xs text-gray-500">
                                            • Check console for API response details<br />
                                            • Verify healthCheckId: {healthCheckId}<br />
                                            • Verify studentId: {studentId}
                                        </p>
                                    </div>
                                )}
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
                                                <div key={result.id}
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
                                                        {result.resultStatus === 'Complete' && result.resultItems && Array.isArray(result.resultItems) && result.resultItems.length > 0 ? (
                                                            <div className="space-y-4">
                                                                {result.resultItems.map((item, index) => {
                                                                    const hasValue = item && (item.value !== null && item.value !== undefined);
                                                                    const displayValue = hasValue ? item.value : 'N/A';
                                                                    const isNormal = item?.isNormal;
                                                                    const notes = item?.notes;

                                                                    return (
                                                                        <div key={index}
                                                                            className="p-5 rounded-2xl border"
                                                                            style={{
                                                                                backgroundColor: isNormal === true ? SUCCESS[25] : isNormal === false ? ERROR[25] : GRAY[50],
                                                                                borderColor: isNormal === true ? SUCCESS[200] : isNormal === false ? ERROR[200] : GRAY[200]
                                                                            }}>
                                                                            <div className="flex items-center justify-between mb-3">
                                                                                <div className="flex items-center space-x-4">
                                                                                    <div className="text-3xl font-black" style={{ color: TEXT.PRIMARY }}>
                                                                                        {displayValue}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {notes && notes.trim() !== '' && (
                                                                                <div className="mt-4 pt-4 border-t" style={{ borderColor: GRAY[200] }}>
                                                                                    <div className="flex items-start space-x-2">
                                                                                        <FiFileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: TEXT.SECONDARY }} />
                                                                                        <p className="text-sm leading-relaxed" style={{ color: TEXT.SECONDARY }}>
                                                                                            <span className="font-semibold">Ghi chú:</span> {notes}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : result.resultStatus === 'NotChecked' ? (
                                                            <div className="py-10 text-center">
                                                                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                                                                    style={{ backgroundColor: WARNING[50] }}>
                                                                    <FiAlertCircle className="w-7 h-7" style={{ color: WARNING[600] }} />
                                                                </div>
                                                                <p className="text-lg font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                                                    Chưa được kiểm tra
                                                                </p>
                                                                <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                    Mục này sẽ được kiểm tra trong buổi khám sức khỏe
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="py-10 text-center">
                                                                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                                                                    style={{ backgroundColor: GRAY[50] }}>
                                                                    <FiAlertCircle className="w-7 h-7" style={{ color: GRAY[400] }} />
                                                                </div>
                                                                <p className="text-lg font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                                                                    {result.resultStatus === 'InProgress' ? 'Đang kiểm tra' : 'Trạng thái không xác định'}
                                                                </p>
                                                                <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                                    Vui lòng liên hệ nhân viên y tế để biết thêm chi tiết
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
