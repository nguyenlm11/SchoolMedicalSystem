import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import classApi from "../../api/classApi";
import { PRIMARY, SUCCESS, ERROR, GRAY, SECONDARY, BACKGROUND, TEXT, INFO, BORDER } from "../../constants/colors";
import Loading from "../../components/Loading";

const ClassDetails = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await classApi.getClassById(id);
        if (response.success) {
          setClassData(response.data);
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
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen">
      {classData && (
          <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                        Quản lý lớp học
                    </h1>
                    <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                        Quản lý danh sách lớp học trong trường
                    </p>
                </div>
              </div>
            </div>
           
            {/* State cards for class details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Card 4: Số học sinh */}
              <div
                className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                  borderColor: SUCCESS[200],
                }}
              >
                <div className="p-6 relative z-10">
                  <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                    Số học sinh
                  </p>
                  <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                    {classData.studentCount}
                  </p>
                </div>
              </div>

              {/* Card 5: Số nam */}
              <div
                className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${SECONDARY[500]} 0%, ${SECONDARY[600]} 100%)`,
                  borderColor: PRIMARY[200],
                }}
              >
                <div className="p-6 relative z-10">
                  <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                    Số học sinh nam
                  </p>
                  <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                    {classData.maleStudentCount}
                  </p>
                </div>
              </div>

              {/* Card 6: Số nữ */}
              <div
                className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${INFO[500]} 0%, ${INFO[600]} 100%)`,
                  borderColor: PRIMARY[200],
                }}
              >
                <div className="p-6 relative z-10">
                  <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
                    Số học sinh nữ
                  </p>
                  <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
                    {classData.femaleStudentCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Danh sách học sinh */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">Danh sách học sinh</h2>

            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Mã học sinh</th>
                  <th className="py-2 px-4 border">Tên học sinh</th>
                  <th className="py-2 px-4 border">Lớp học</th>
                  <th className="py-2 px-4 border">Tình trạng hồ sơ y tế</th>
                </tr>
              </thead>
              <tbody>
                {classData.students.map((student) => (
                  <tr key={student.id}>
                    <td className="py-2 px-4 border">{student.studentCode}</td>
                    <td className="py-2 px-4 border">{student.fullName}</td>
                    <td className="py-2 px-4 border">{student.classNames.join(", ")}</td>
                    <td className="py-2 px-4 border">{student.hasMedicalRecord ? "Có" : "Không"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}
    </div>
  );
};

export default ClassDetails;
