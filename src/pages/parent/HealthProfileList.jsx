import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiCalendar, FiUser } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND } from "../../constants/colors";
import Loading from "../../components/Loading";
import userApi from "../../api/userApi";
import { useAuth } from "../../utils/AuthContext";

const HealthProfileList = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStudentProfiles();
  }, [user.id]);

  const fetchStudentProfiles = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getParentStudents(user.id, { pageSize: 100 });
      if (response.success) {
        setStudentProfiles(response.data);
      } else {
        setError(response.message || "Không thể tải danh sách học sinh");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách học sinh");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
        <Loading type="medical" size="large" color="primary" text="Đang tải danh sách hồ sơ..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
      <section className="py-12 sm:py-16 relative overflow-hidden" style={{ backgroundColor: PRIMARY[500] }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white max-w-5xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4">
              Hồ Sơ Sức Khỏe Học Sinh
            </h1>
            <p className="text-base sm:text-lg opacity-90 leading-relaxed font-medium px-4">
              Quản lý thông tin sức khỏe toàn diện cho con em và theo dõi tình trạng phát triển một cách khoa học
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-16">
        {studentProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {studentProfiles.map((profile) => (
              <div
                key={profile.id}
                className="group bg-white rounded-2xl lg:rounded-3xl border-2 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                style={{ borderColor: GRAY[200] }}
              >
                <div className="p-6 lg:p-8 pb-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4 lg:mb-6 relative z-10">
                    <div className="flex items-center">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center font-bold text-white text-lg lg:text-xl mr-4 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
                        {profile.fullName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg lg:text-xl mb-1" style={{ color: TEXT.PRIMARY }}>
                          {profile.fullName}
                        </h3>
                        <p className="text-sm lg:text-base font-medium" style={{ color: GRAY[500] }}>
                          {profile.studentCode} • Lớp {profile.currentClassName || (profile.classes && profile.classes.length > 0 ? profile.classes[0].className : "Chưa phân lớp")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div className="text-center p-3 lg:p-4 rounded-xl" style={{ backgroundColor: GRAY[50] }}>
                      <div className="text-xs lg:text-sm font-medium mb-1" style={{ color: GRAY[500] }}>Tuổi</div>
                      <div className="text-lg lg:text-xl font-bold" style={{ color: PRIMARY[600] }}>
                        {(() => {
                          if (!profile.dateOfBirth) return "Chưa cập nhật";
                          const birthDate = new Date(profile.dateOfBirth);
                          const today = new Date();
                          const age = today.getFullYear() - birthDate.getFullYear();
                          const monthDiff = today.getMonth() - birthDate.getMonth();
                          return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
                        })()}
                      </div>
                    </div>
                    <div className="text-center p-3 lg:p-4 rounded-xl" style={{ backgroundColor: GRAY[50] }}>
                      <div className="text-xs lg:text-sm font-medium mb-1" style={{ color: GRAY[500] }}>Nhóm máu</div>
                      <div className="text-lg lg:text-xl font-bold" style={{ color: PRIMARY[600] }}>
                        {profile.bloodType === "Unknown" || !profile.bloodType ? "Chưa cập nhật" : profile.bloodType}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="text-center p-3 lg:p-4 rounded-xl" style={{ backgroundColor: GRAY[50] }}>
                      <div className="text-xs lg:text-sm font-medium mb-1" style={{ color: GRAY[500] }}>Cân nặng</div>
                      <div className="text-lg lg:text-xl font-bold" style={{ color: PRIMARY[600] }}>
                        {profile.weight ? `${profile.weight}kg` : "Chưa cập nhật"}
                      </div>
                    </div>

                    <div className="text-center p-3 lg:p-4 rounded-xl" style={{ backgroundColor: GRAY[50] }}>
                      <div className="text-xs lg:text-sm font-medium mb-1" style={{ color: GRAY[500] }}>Chiều cao</div>
                      <div className="text-lg lg:text-xl font-bold" style={{ color: PRIMARY[600] }}>
                        {profile.height ? `${profile.height}cm` : "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 lg:px-8 py-4 lg:py-5 flex justify-between items-center border-t"
                  style={{ borderColor: GRAY[100], backgroundColor: GRAY[25] || '#fafafa' }}>
                  <button
                    onClick={() => navigate(`/parent/health-profile/${profile.id}`)}
                    className="group flex items-center font-semibold text-sm lg:text-base transition-all duration-300 hover:scale-105"
                    style={{ color: PRIMARY[600] }}
                  >
                    <FiEye className="w-4 h-4 lg:w-5 lg:h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Xem chi tiết
                  </button>

                  <button
                    onClick={() => navigate(`/parent/student-health-events/${profile.id}`)}
                    className="group flex items-center font-semibold text-sm lg:text-base transition-all duration-300 hover:scale-105"
                    style={{ color: PRIMARY[600] }}
                  >
                    <FiCalendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Sự kiện y tế
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 lg:py-20 rounded-2xl lg:rounded-3xl" style={{ backgroundColor: GRAY[50] }}>
            <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6" style={{ backgroundColor: GRAY[300] }}>
              <FiUser className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4" style={{ color: TEXT.PRIMARY }}>
              Không có hồ sơ nào
            </h3>
            <p className="text-base lg:text-lg mb-4 lg:mb-6 px-4" style={{ color: TEXT.SECONDARY }}>
              Hiện tại chưa có hồ sơ sức khỏe nào được tạo
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthProfileList; 