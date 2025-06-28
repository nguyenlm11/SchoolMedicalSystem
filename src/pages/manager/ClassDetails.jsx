import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUsers, FiUser, FiUserPlus, FiFileText, FiCheck, FiX, FiSearch, FiRefreshCw, FiEye } from "react-icons/fi";
import classApi from "../../api/classApi";
import { PRIMARY, SUCCESS, ERROR, GRAY, SECONDARY, BACKGROUND, TEXT, INFO, BORDER } from "../../constants/colors";
import Loading from "../../components/Loading";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (classData) {
      const filtered = classData.students.filter(student =>
        student.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        student.studentCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        student.classNames.some(className =>
          className.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      );
      setFilteredStudents(filtered);
    }
  }, [debouncedSearchTerm, classData]);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await classApi.getClassById(id);
        if (response.success) {
          setClassData(response.data);
          setFilteredStudents(response.data.students);
        } else {
          setError("Không thể tải thông tin lớp học.");
        }
      } catch (error) {
        setError("Đã xảy ra lỗi khi tải thông tin lớp học.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
        <Loading type="medical" size="large" color="primary" text="Đang tải thông tin lớp học..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2" style={{ color: ERROR[600] }}>{error}</h3>
          <button
            onClick={() => navigate('/manager/class-management')}
            className="mt-4 px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300"
            style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
          >
            <FiArrowLeft className="mr-2" />
            Quay lại danh sách lớp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {classData && (
        <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate('/manager/class-management')}
                    className="p-2 rounded-lg transition-all duration-300 hover:bg-opacity-90"
                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: TEXT.PRIMARY }}>
                        Lớp {classData.name}
                      </h1>
                      <div
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}
                      >
                        Khối {classData.grade}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base" style={{ color: TEXT.SECONDARY }}>
                          Năm học:
                        </span>
                        <span
                          className="text-base font-medium"
                          style={{ color: INFO[600] }}
                        >
                          {classData.academicYear} - {classData.academicYear + 1}
                        </span>
                      </div>
                      <span style={{ color: TEXT.SECONDARY }}>•</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base" style={{ color: TEXT.SECONDARY }}>
                          Sĩ số:
                        </span>
                        <span
                          className="text-base font-medium"
                          style={{ color: SUCCESS[600] }}
                        >
                          {classData.studentCount} học sinh
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div
              className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                borderColor: PRIMARY[200]
              }}
            >
              <div className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                      Tổng số học sinh
                    </p>
                    <p className="text-2xl sm:text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                      {classData.studentCount}
                    </p>
                  </div>
                  <div
                    className="h-12 sm:h-16 w-12 sm:w-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <FiUsers className="h-6 sm:h-8 w-6 sm:w-8" style={{ color: TEXT.INVERSE }} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`,
                borderColor: SUCCESS[200]
              }}
            >
              <div className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                      Học sinh nam
                    </p>
                    <p className="text-2xl sm:text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                      {classData.maleStudentCount}
                    </p>
                  </div>
                  <div
                    className="h-12 sm:h-16 w-12 sm:w-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <FiUser className="h-6 sm:h-8 w-6 sm:w-8" style={{ color: TEXT.INVERSE }} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 md:col-span-2 lg:col-span-1"
              style={{
                background: `linear-gradient(135deg, ${INFO[500]} 0%, ${INFO[600]} 100%)`,
                borderColor: INFO[200]
              }}
            >
              <div className="p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                      Học sinh nữ
                    </p>
                    <p className="text-2xl sm:text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                      {classData.femaleStudentCount}
                    </p>
                  </div>
                  <div
                    className="h-12 sm:h-16 w-12 sm:w-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <FiUserPlus className="h-6 sm:h-8 w-6 sm:w-8" style={{ color: TEXT.INVERSE }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl shadow-xl border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
            <div className="p-4 sm:p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold" style={{ color: TEXT.PRIMARY }}>Danh sách học sinh</h2>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 sm:min-w-[300px]">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên, mã học sinh..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg text-base border focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{
                        borderColor: BORDER.DEFAULT,
                        backgroundColor: BACKGROUND.DEFAULT,
                        color: TEXT.PRIMARY,
                      }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm !== debouncedSearchTerm && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: PRIMARY[500] }}></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                  >
                    <FiRefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: PRIMARY[50] }}>
                    <th className="w-[25%] h-[60px] px-8" style={{ color: TEXT.PRIMARY }}>
                      <div className="flex items-center h-full">
                        <span className="text-sm font-semibold uppercase tracking-wider">Mã học sinh</span>
                      </div>
                    </th>
                    <th className="w-[40%] h-[60px] px-8" style={{ color: TEXT.PRIMARY }}>
                      <div className="flex items-center h-full">
                        <span className="text-sm font-semibold uppercase tracking-wider">Tên học sinh</span>
                      </div>
                    </th>
                    <th className="w-[20%] h-[60px] px-8" style={{ color: TEXT.PRIMARY }}>
                      <div className="flex items-center justify-center h-full">
                        <span className="text-sm font-semibold uppercase tracking-wider">Hồ sơ y tế</span>
                      </div>
                    </th>
                    <th className="w-[15%] h-[60px] px-8" style={{ color: TEXT.PRIMARY }}>
                      <div className="flex items-center justify-center h-full">
                        <span className="text-sm font-semibold uppercase tracking-wider">Thao tác</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        className="hover:bg-opacity-50 transition-all duration-200 group"
                        style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                      >
                        <td className="w-[25%] h-[60px] px-8">
                          <div className="flex items-center h-full">
                            <div className="text-[15px] font-medium" style={{ color: TEXT.PRIMARY }}>
                              {student.studentCode}
                            </div>
                          </div>
                        </td>
                        <td className="w-[40%] h-[60px] px-8">
                          <div className="flex items-center h-full">
                            <div className="text-[15px] font-medium" style={{ color: TEXT.PRIMARY }}>
                              {student.fullName}
                            </div>
                          </div>
                        </td>
                        <td className="w-[20%] h-[60px] px-8">
                          <div className="flex items-center justify-center h-full">
                            {student.hasMedicalRecord ? (
                              <div className="flex items-center gap-2" style={{ color: SUCCESS[600] }}>
                                <FiCheck className="w-5 h-5" />
                                <span className="text-[15px] font-medium">Đã có</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2" style={{ color: ERROR[600] }}>
                                <FiX className="w-5 h-5" />
                                <span className="text-[15px] font-medium">Chưa có</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="w-[15%] h-[60px] px-8">
                          <div className="flex items-center justify-center h-full">
                            <button
                              onClick={() => navigate(`/manager/student-health-profile/${student.id}`)}
                              className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-90"
                              style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                              title="Xem chi tiết"
                            >
                              <FiEye className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8">
                        <div className="flex flex-col items-center justify-center">
                          <div
                            className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
                            style={{ backgroundColor: GRAY[100] }}
                          >
                            <FiUsers className="h-8 w-8" style={{ color: GRAY[400] }} />
                          </div>
                          <p className="text-lg font-semibold mb-1" style={{ color: TEXT.SECONDARY }}>
                            Không tìm thấy học sinh
                          </p>
                          <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                            Thử tìm kiếm với từ khóa khác
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetails;
