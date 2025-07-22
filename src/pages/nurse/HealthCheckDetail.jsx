import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiClipboard, FiCheckCircle, FiEdit, FiBookmark, FiXOctagon, FiAlertTriangle, FiUserCheck, FiUserPlus, FiShield } from "react-icons/fi";
import { PRIMARY, GRAY, ERROR, TEXT, BACKGROUND, BORDER } from "../../constants/colors";
import healthCheckApi from '../../api/healthCheckApi';
import Loading from "../../components/Loading";
import AssignHealthCheckNurseModal from "../../components/modal/AssignHealthCheckNurseModal";

const HealthCheckDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [healthCheck, setHealthCheck] = useState(null);
    const [error, setError] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => {
        fetchHealthCheckDetails();
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
                        <div className="flex space-x-3">
                            <Link
                                to={`/schoolnurse/health-check/${id}/edit`}
                                className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                                style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                            >
                                <FiEdit className="h-4 w-4 mr-2" />Chỉnh sửa
                            </Link>
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

                {/* PHẦN MỚI: Hạng mục kiểm tra sức khỏe */}
                <div className="bg-white rounded-xl shadow-sm border mb-6" style={{ borderColor: BORDER.DEFAULT }}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                Hạng mục kiểm tra sức khỏe
                            </h3>
                            <button
                                className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                                style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700], border: `1px solid ${PRIMARY[200]}` }}
                                onClick={() => setShowAssignModal(true)}
                            >
                                <FiUserPlus className="h-4 w-4" />
                                Phân công y tá
                            </button>
                        </div>
                        {healthCheck.healthCheckItems && healthCheck.healthCheckItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                    Y tá phụ trách: {assignment?.nurseName || "Chưa phân công"}
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

                <AssignHealthCheckNurseModal
                    isOpen={showAssignModal}
                    onClose={() => setShowAssignModal(false)}
                    planId={id}
                    onNurseAssigned={() => { setShowAssignModal(false); fetchHealthCheckDetails(); }}
                />

                <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: BORDER.DEFAULT }}>
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: TEXT.PRIMARY }}>
                            Danh sách lớp và phân công y tá
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {healthCheck.classNurseAssignments && healthCheck.classNurseAssignments.length > 0 ? (
                                healthCheck.classNurseAssignments.map((assignment, idx) => (
                                    <div key={assignment.classId || idx} className="p-4 border rounded-lg flex flex-col space-y-2" style={{ borderColor: BORDER.DEFAULT, backgroundColor: GRAY[50] }}>
                                        <div className="flex items-center space-x-2">
                                            <FiClipboard className="h-4 w-4" style={{ color: PRIMARY[600] }} />
                                            <span className="font-medium" style={{ color: TEXT.PRIMARY }}>Lớp: {assignment.className}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FiUserCheck className="h-4 w-4" style={{ color: PRIMARY[600] }} />
                                            <span className="text-sm" style={{ color: TEXT.SECONDARY }}>Y tá: {assignment.nurseName || "Chưa phân công"}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-500 py-8">
                                    <FiUserPlus className="mx-auto h-8 w-8 mb-2" />
                                    Chưa có phân công y tá cho các lớp
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthCheckDetail;