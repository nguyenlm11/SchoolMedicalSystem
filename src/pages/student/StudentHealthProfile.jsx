import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TEXT, BACKGROUND } from "../../constants/colors";
import Loading from "../../components/Loading";
import BasicInfo from "../../components/health-profile/BasicInfo";
import PhysicalRecords from "../../components/health-profile/PhysicalRecords";
import VisionHearingRecords from "../../components/health-profile/VisionHearingRecords";
import MedicalConditions from "../../components/health-profile/MedicalConditions";
// import VaccinationRecords from "../../components/health-profile/VaccinationRecords";
import healthProfileApi from "../../api/healthProfileApi";

const StudentHealthProfile = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchProfileData();
        }
    }, [id]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await healthProfileApi.getHealthProfile(id);
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
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách vật tư..." />
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
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-6">
            <div className="space-y-6">
                <BasicInfo data={profileData} />
                <PhysicalRecords records={profileData.physicalRecords} />
                <VisionHearingRecords visionRecords={profileData.visionRecords} hearingRecords={profileData.hearingRecords} />
                <MedicalConditions conditions={profileData.medicalConditions} />
                {/* <VaccinationRecords records={profileData.vaccinationRecords} /> */}
            </div>
        </div>
    );
};

export default StudentHealthProfile;
