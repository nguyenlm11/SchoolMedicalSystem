import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiUser, FiHeart, FiActivity, FiFileText, FiCalendar, FiShield, FiArrowLeft } from "react-icons/fi";
import { TEXT, BACKGROUND, PRIMARY, SUCCESS, INFO } from "../../constants/colors";
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                        {error || "Không tìm thấy hồ sơ y tế"}
                    </h2>
                    <p style={{ color: TEXT.SECONDARY }}>
                        {error ? "Vui lòng thử lại sau" : "Hồ sơ y tế của học sinh này không tồn tại hoặc đã bị xóa"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                <div className="mb-8">
                    <div className="items-center mb-6 text-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                Hồ sơ sức khỏe
                            </h1>
                            <p className="mt-2 text-sm sm:text-base" style={{ color: TEXT.SECONDARY }}>
                                Thông tin sức khỏe chi tiết của học sinh
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 border shadow-sm" style={{ borderColor: PRIMARY[200] }}>
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

                        <div className="bg-white rounded-xl p-4 border shadow-sm" style={{ borderColor: SUCCESS[200] }}>
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: SUCCESS[50] }}>
                                    <FiHeart className="h-5 w-5" style={{ color: SUCCESS[600] }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Tình trạng y tế</p>
                                    <p className="text-lg font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {profileData.medicalConditions?.length || 0} tình trạng
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border shadow-sm" style={{ borderColor: INFO[200] }}>
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: INFO[50] }}>
                                    <FiActivity className="h-5 w-5" style={{ color: INFO[600] }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Khám sức khỏe</p>
                                    <p className="text-lg font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {profileData.physicalRecords?.length || 0} lần
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border shadow-sm" style={{ borderColor: SUCCESS[200] }}>
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: SUCCESS[50] }}>
                                    <FiShield className="h-5 w-5" style={{ color: SUCCESS[600] }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Tiêm chủng</p>
                                    <p className="text-lg font-bold" style={{ color: TEXT.PRIMARY }}>
                                        {profileData.vaccinationRecords?.length || 0} mũi
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <BasicInfo data={profileData} />
                    <PhysicalRecords records={profileData.physicalRecords} />
                    <VisionHearingRecords visionRecords={profileData.visionRecords} hearingRecords={profileData.hearingRecords} />
                    <MedicalConditions conditions={profileData.medicalConditions} medicalRecordId={profileData.id} onConditionAdded={fetchProfileData} />
                    <VaccinationRecords records={profileData.vaccinationRecords} />
                </div>
            </div>
        </div>
    );
};

export default StudentHealthProfile;