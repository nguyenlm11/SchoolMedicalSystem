import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiUser, FiHeart, FiActivity, FiShield, FiArrowLeft } from "react-icons/fi";
import { TEXT, BACKGROUND, PRIMARY, SUCCESS, INFO, COMMON } from "../../constants/colors";
import Loading from "../../components/Loading";
import BasicInfo from "../../components/health-profile/BasicInfo";
import PhysicalRecords from "../../components/health-profile/PhysicalRecords";
import VisionHearingRecords from "../../components/health-profile/VisionHearingRecords";
import MedicalConditions from "../../components/health-profile/MedicalConditions";
import VaccinationRecords from "../../components/health-profile/VaccinationRecords";
import healthProfileApi from "../../api/healthProfileApi";
import { useAuth } from "../../utils/AuthContext";

const StudentHealthProfile = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const studentId = id || user.id;
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (studentId) {
            fetchProfileData();
        }
    }, [studentId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await healthProfileApi.getHealthProfile(studentId);
            if (response.success) {
                setProfileData(response.data);
            } else {
                setError(response.message || "Đã xảy ra lỗi khi tải hồ sơ y tế");
            }
        } catch (error) {
            setError("Đã xảy ra lỗi khi tải hồ sơ y tế");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải hồ sơ y tế..." />
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: ERROR[100] }}>
                            <FiActivity className="h-8 w-8" style={{ color: ERROR[600] }} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                            {error ? "Đã xảy ra lỗi" : "Không tìm thấy hồ sơ y tế"}
                        </h2>
                        <p className="mb-6" style={{ color: TEXT.SECONDARY }}>
                            {error || "Hồ sơ y tế của học sinh này không tồn tại hoặc đã bị xóa"}
                        </p>
                    </div>
                    {error && (
                        <button
                            onClick={fetchProfileData}
                            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                            style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE }}
                        >
                            Thử lại
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <section
                className="py-3 sm:py-16 lg:py-4 xl:py-6 relative overflow-hidden"
                style={{ backgroundColor: PRIMARY[500] }}
            >
                <div className="container flex text-center items-center justify-center mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex items-center justify-between mb-6 w-full">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
                            style={{ color: COMMON.WHITE }}
                        >
                            <FiArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </button>
                        <div className="flex items-center">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: COMMON.WHITE }}>
                                    Hồ sơ sức khỏe
                                </h1>
                                <p className="mt-2 text-sm sm:text-base" style={{ color: COMMON.WHITE }}>
                                    Thông tin sức khỏe chi tiết của học sinh
                                </p>
                            </div>
                        </div>
                        <div className="w-24"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: PRIMARY[200] }}>
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[50] }}>
                                    <FiUser className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Học sinh</p>
                                    <p className="text-lg font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {profileData.studentName || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: SUCCESS[200] }}>
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: SUCCESS[50] }}>
                                    <FiHeart className="h-5 w-5" style={{ color: SUCCESS[600] }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Tình trạng y tế</p>
                                    <p className="text-lg font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {profileData.medicalConditions?.length || 0} tình trạng
                                    </p>
                                    <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                        {profileData.medicalConditions?.length > 0 ? 'Cần theo dõi' : 'Bình thường'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: INFO[200] }}>
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: INFO[50] }}>
                                    <FiActivity className="h-5 w-5" style={{ color: INFO[600] }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Khám sức khỏe</p>
                                    <p className="text-lg font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {profileData.physicalRecords?.length || 0} lần
                                    </p>
                                    <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                        Lần cuối: {profileData.physicalRecords?.length > 0 ?
                                            new Date(profileData.physicalRecords[0].checkDate).toLocaleDateString('vi-VN') :
                                            'Chưa có'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: SUCCESS[200] }}>
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: SUCCESS[50] }}>
                                    <FiShield className="h-5 w-5" style={{ color: SUCCESS[600] }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Tiêm chủng</p>
                                    <p className="text-lg font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {profileData.vaccinationRecords?.length || 0} mũi
                                    </p>
                                    <p className="text-xs" style={{ color: TEXT.SECONDARY }}>
                                        {profileData.vaccinationRecords?.length > 0 ? 'Đã tiêm đủ' : 'Chưa tiêm'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <BasicInfo data={profileData} />
                    <PhysicalRecords records={profileData.physicalRecords} onRecordAdded={fetchProfileData} studentId={studentId} />
                    <VisionHearingRecords visionRecords={profileData.visionRecords} hearingRecords={profileData.hearingRecords} onRecordAdded={fetchProfileData} studentId={studentId} />
                    <MedicalConditions conditions={profileData.medicalConditions} medicalRecordId={profileData.id} onConditionAdded={fetchProfileData} />
                    <VaccinationRecords records={profileData.vaccinationRecords} onVaccinationAdded={fetchProfileData} medicalRecordId={profileData.id} />
                </div>
            </div>
        </div>
    );
};

export default StudentHealthProfile;