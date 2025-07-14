import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEye, FiCalendar, FiSearch } from "react-icons/fi";
import { PRIMARY, SUCCESS, WARNING, ERROR, GRAY, TEXT, BACKGROUND } from "../../constants/colors";
import Loading from "../../components/Loading";
import vaccinationScheduleApi from "../../api/VaccinationScheduleApi";
import { useAuth } from "../../utils/AuthContext";

const HealthProfileList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudentProfiles = async () => {
      try {
        setIsLoading(true);
        const response = await vaccinationScheduleApi.getParentStudents(user.id, {
          pageSize: 100,
          searchTerm: ""
        });
        if (response.success) {
          const transformedData = response.data.map(student => {
            const birthDate = new Date(student.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const calculatedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
            const currentClass = student.currentClassName || (student.classes && student.classes.length > 0 ? student.classes[0].className : "Chưa phân lớp");
            return {
              id: student.id,
              name: student.fullName,
              studentId: student.studentCode,
              class: currentClass,
              lastUpdated: new Date(student.lastUpdatedDate).toLocaleDateString("vi-VN"),
              avatar: student.fullName.charAt(0),
              age: calculatedAge,
              weight: student.weight ? `${student.weight}kg` : "Chưa cập nhật",
              height: student.height ? `${student.height}cm` : "Chưa cập nhật",
              bloodType: student.bloodType == "Unknown" ? "Chưa cập nhật" : student.bloodType
            };
          });
          setStudentProfiles(transformedData);
        } else {
          setError(response.message || "Không thể tải danh sách học sinh");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải danh sách học sinh");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentProfiles();
  }, [user.id]);

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const filteredProfiles = studentProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.class.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
        <Loading type="medical" size="large" color="primary" text="Đang tải hồ sơ y tế..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
      <section className="py-12 sm:py-16 lg:py-20 xl:py-28 relative overflow-hidden" style={{ backgroundColor: PRIMARY[500] }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white max-w-5xl mx-auto">
            <div className="flex items-center justify-center mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-black text-white">
                Hồ Sơ Sức Khỏe Học Sinh
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl opacity-90 leading-relaxed font-medium px-4">
              Quản lý thông tin sức khỏe toàn diện cho con em và theo dõi tình trạng phát triển một cách khoa học
            </p>
            <div className="grid grid-cols-3 gap-4 lg:gap-8 mt-8 lg:mt-12 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                <div className="text-2xl lg:text-3xl font-bold text-white">{studentProfiles.length}</div>
                <div className="text-sm lg:text-base text-teal-100 font-medium">Tổng hồ sơ</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                <div className="text-2xl lg:text-3xl font-bold text-white">{studentProfiles.filter(p => p.age >= 6 && p.age <= 10).length}</div>
                <div className="text-sm lg:text-base text-teal-100 font-medium">6-10 tuổi</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6">
                <div className="text-2xl lg:text-3xl font-bold text-white">{studentProfiles.filter(p => p.age > 10).length}</div>
                <div className="text-sm lg:text-base text-teal-100 font-medium">Trên 10 tuổi</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-red-800">Đã có lỗi xảy ra</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto bg-red-50 rounded-full p-1 hover:bg-red-100"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <section className="py-8 lg:py-12 bg-white bg-opacity-50 backdrop-blur-sm" style={{ borderBottomColor: GRAY[200], borderBottomWidth: 1 }}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                Tìm kiếm hồ sơ sức khỏe
              </h2>
              <p className="text-sm lg:text-base" style={{ color: TEXT.SECONDARY }}>
                Nhập tên học sinh, mã học sinh hoặc lớp để tìm kiếm
              </p>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center">
              <div className="relative flex-1 w-full">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <FiSearch className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: PRIMARY[400] }} />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, mã học sinh hoặc lớp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 lg:pl-14 pr-4 py-4 lg:py-5 text-base lg:text-lg rounded-xl lg:rounded-2xl border-2 focus:outline-none transition-all duration-300 font-medium shadow-sm"
                  style={{ borderColor: GRAY[200], backgroundColor: GRAY[25] || '#fafafa', color: TEXT.PRIMAR }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                    style={{ color: GRAY[400] }}
                  >
                    x
                  </button>
                )}
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => navigate("/parent/health-profile/new")}
                  className="inline-flex items-center px-6 lg:px-8 py-4 lg:py-5 text-base lg:text-lg text-white font-bold rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group whitespace-nowrap"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)` }}
                >
                  <FiPlus className="w-5 h-5 lg:w-6 lg:h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Thêm hồ sơ mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {isSearching ? (
          <div className="text-center py-12">
            <Loading type="medical" size="large" color="primary" text="Đang tìm kiếm hồ sơ..." />
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProfiles.map((profile) => (
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
                        {profile.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg lg:text-xl mb-1" style={{ color: TEXT.PRIMARY }}>
                          {profile.name}
                        </h3>
                        <p className="text-sm lg:text-base font-medium" style={{ color: GRAY[500] }}>
                          {profile.studentId} • Lớp {profile.class}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div className="text-center p-3 lg:p-4 rounded-xl" style={{ backgroundColor: GRAY[50] }}>
                      <div className="text-xs lg:text-sm font-medium mb-1" style={{ color: GRAY[500] }}>Tuổi</div>
                      <div className="text-lg lg:text-xl font-bold" style={{ color: PRIMARY[600] }}>{profile.age}</div>
                    </div>
                    <div className="text-center p-3 lg:p-4 rounded-xl" style={{ backgroundColor: GRAY[50] }}>
                      <div className="text-xs lg:text-sm font-medium mb-1" style={{ color: GRAY[500] }}>Nhóm máu</div>
                      <div className="text-lg lg:text-xl font-bold" style={{ color: PRIMARY[600] }}>{profile.bloodType}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div className="text-center p-3 lg:p-4 rounded-xl" style={{ backgroundColor: GRAY[50] }}>
                      <div className="text-xs lg:text-sm font-medium mb-1" style={{ color: GRAY[500] }}>Cân nặng</div>
                      <div className="text-lg lg:text-xl font-bold" style={{ color: PRIMARY[600] }}>{profile.weight}</div>
                    </div>
                    <div className="text-center p-3 lg:p-4 rounded-xl" style={{ backgroundColor: GRAY[50] }}>
                      <div className="text-xs lg:text-sm font-medium mb-1" style={{ color: GRAY[500] }}>Chiều cao</div>
                      <div className="text-lg lg:text-xl font-bold" style={{ color: PRIMARY[600] }}>{profile.height}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm lg:text-base" style={{ color: GRAY[500] }}>
                    <FiCalendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                    Cập nhật: {profile.lastUpdated}
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
                    Xem sự kiện y tế
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
              Không tìm thấy hồ sơ nào
            </h3>
            <p className="text-base lg:text-lg mb-4 lg:mb-6 px-4" style={{ color: TEXT.SECONDARY }}>
              Thử thay đổi từ khóa tìm kiếm khác nhé!
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 lg:px-6 lg:py-3 text-white font-bold rounded-xl lg:rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              style={{ backgroundColor: PRIMARY[500] }}
            >
              Xóa tìm kiếm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthProfileList; 