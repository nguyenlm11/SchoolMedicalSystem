import React, { useState, useEffect } from "react";
import { FiCheck, FiClock, FiAlertTriangle, FiX, FiCalendar } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW, COMMON, SUCCESS, ERROR } from "../../constants/colors";
import Loading from "../../components/Loading";

const StudentMedication = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const medicationsData = [
          {
            name: "Paracetamol",
            time: "Buổi sáng, Buổi tối",
            instructions: "Uống sau bữa ăn 30 phút. Không uống khi đói.",
            reason: "Sốt nhẹ, đau đầu",
            startDate: "06/07/2025",
            endDate: "11/07/2025",
            status: "upcoming",
          },
          {
            name: "Vitamin C",
            time: "Buổi sáng",
            instructions: "Uống trước bữa ăn sáng 15 phút",
            reason: "Tăng cường sức đề kháng",
            startDate: "01/07/2025",
            endDate: "15/07/2025",
            status: "ongoing",
          },
          {
            name: "Aspirin",
            time: "Buổi chiều",
            instructions: "Uống sau bữa ăn 30 phút",
            reason: "Giảm đau cơ",
            startDate: "01/06/2025",
            endDate: "05/06/2025",
            status: "completed",
          },
        ];

        setTimeout(() => {
          setMedications(medicationsData);
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const todayMedications = medications.filter((med) => med.status === "ongoing");
  const upcomingMedications = medications.filter((med) => med.status === "upcoming");
  const completedMedications = medications.filter((med) => med.status === "completed");

  const [activeTab, setActiveTab] = useState("today");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
        <Loading type="heart" size="xl" color="primary" text="Đang tải thông tin học sinh..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.DEFAULT }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
              <div className="flex items-center mb-4">
                  <div
                      className="p-3 rounded-full mr-4"
                      style={{ backgroundColor: PRIMARY[100] }}
                  >
                      <FiCalendar className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                  </div>
                  <div>
                      <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                          Xin chào, Nguyễn Văn An
                      </h1>
                      <p className="mt-2 text-sm sm:text-base" style={{ color: TEXT.SECONDARY }}>
                          Theo dõi lịch trình uống thuốc của bạn tại trường
                      </p>
                  </div>
              </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 mm:grid-cols-2 lg:grid-cols-3 sm:gap-6 gap-4 mb-8">
            {/* Đang uống */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all duration-200"
              style={{ borderLeftColor: PRIMARY[500], boxShadow: SHADOW.DEFAULT }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: SUCCESS[50] }}>
                    <FiClock className="h-5 w-5" style={{ color: SUCCESS[600] }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                      Đang uống
                    </h3>
                  </div>
                </div>
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{
                    backgroundColor: SUCCESS[50],
                    color: SUCCESS[800],
                  }}
                >
                  {todayMedications.length} thuốc
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                Các thuốc đang được sử dụng.
              </p>
            </div>

            {/* Hôm nay */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all duration-200"
              style={{ borderLeftColor: PRIMARY[500], boxShadow: SHADOW.DEFAULT }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[50] }}>
                    <FiCalendar className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                      Hôm nay
                    </h3>
                  </div>
                </div>
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{
                    backgroundColor: PRIMARY[50],
                    color: PRIMARY[800],
                  }}
                >
                  {todayMedications.length} thuốc
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                Thuốc cần uống hôm nay.
              </p>
            </div>

            {/* Đã hoàn thành */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all duration-200"
              style={{ borderLeftColor: PRIMARY[500], boxShadow: SHADOW.DEFAULT }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[50] }}>
                    <FiCheck className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                      Đã hoàn thành
                    </h3>
                  </div>
                </div>
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{
                    backgroundColor: PRIMARY[50],
                    color: PRIMARY[800],
                  }}
                >
                  {completedMedications.length} liệu trình
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                Liệu trình thuốc đã hoàn thành.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <button
              onClick={() => handleTabChange("today")}
              style={{
                backgroundColor: activeTab === "today" ? PRIMARY[500] : GRAY[200],
                color: activeTab === "today" ? COMMON.WHITE : TEXT.PRIMARY,
                padding: "10px 20px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                margin: "0 10px",
              }}
            >
              Hôm nay
            </button>
            <button
              onClick={() => handleTabChange("upcoming")}
              style={{
                backgroundColor: activeTab === "upcoming" ? PRIMARY[500] : GRAY[200],
                color: activeTab === "upcoming" ? COMMON.WHITE : TEXT.PRIMARY,
                padding: "10px 20px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                margin: "0 10px",
              }}
            >
              Sắp tới
            </button>
            <button
              onClick={() => handleTabChange("completed")}
              style={{
                backgroundColor: activeTab === "completed" ? PRIMARY[500] : GRAY[200],
                color: activeTab === "completed" ? COMMON.WHITE : TEXT.PRIMARY,
                padding: "10px 20px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                margin: "0 10px",
              }}
            >
              Đã hoàn thành
            </button>
          </div>

          {/* Display medications based on the active tab */}
          {activeTab === "today" && (
            <div>
              <h3 style={{ color: PRIMARY[500], marginBottom: "15px" }}>Thuốc cần uống hôm nay</h3>
              {todayMedications.length > 0 ? (
                todayMedications.map((med, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: GRAY[50],
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "12px",
                      boxShadow: SHADOW.LIGHT,
                      display: "flex",
                      flexDirection: "column",
                      borderLeft: `6px solid ${PRIMARY[500]}`,
                    }}
                  >
                    <h4 style={{ color: TEXT.PRIMARY, fontWeight: "bold" }}>{med.name}</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div style={{ color: TEXT.SECONDARY, fontSize: "14px" }}>
                        <FiClock className="inline-block mr-2" />
                        {med.time}
                      </div>
                      <div style={{ color: TEXT.SECONDARY, fontSize: "14px" }}>
                        <FiCalendar className="inline-block mr-2" />
                        {med.startDate} - {med.endDate}
                      </div>
                    </div>
                    <p style={{ color: TEXT.SECONDARY, fontSize: "14px", marginBottom: "10px" }}>
                      <strong>Hướng dẫn:</strong> {med.instructions}
                    </p>
                    <p style={{ color: TEXT.SECONDARY, fontSize: "14px", marginBottom: "10px" }}>
                      <strong>Lý do:</strong> {med.reason}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: TEXT.SECONDARY }}>Không có thuốc cần uống hôm nay.</p>
              )}
            </div>
          )}

          {activeTab === "upcoming" && (
            <div>
              <h3 style={{ color: PRIMARY[500], marginBottom: "15px" }}>Thuốc sắp tới</h3>
              {upcomingMedications.length > 0 ? (
                upcomingMedications.map((med, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: GRAY[50],
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "12px",
                      boxShadow: SHADOW.LIGHT,
                      display: "flex",
                      flexDirection: "column",
                      borderLeft: `6px solid ${PRIMARY[500]}`,
                    }}
                  >
                    <h4 style={{ color: TEXT.PRIMARY, fontWeight: "bold" }}>{med.name}</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div style={{ color: TEXT.SECONDARY, fontSize: "14px" }}>
                        <FiClock className="inline-block mr-2" />
                        {med.time}
                      </div>
                      <div style={{ color: TEXT.SECONDARY, fontSize: "14px" }}>
                        <FiCalendar className="inline-block mr-2" />
                        {med.startDate} - {med.endDate}
                      </div>
                    </div>
                    <p style={{ color: TEXT.SECONDARY, fontSize: "14px", marginBottom: "10px" }}>
                      <strong>Hướng dẫn:</strong> {med.instructions}
                    </p>
                    <p style={{ color: TEXT.SECONDARY, fontSize: "14px", marginBottom: "10px" }}>
                      <strong>Lý do:</strong> {med.reason}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: TEXT.SECONDARY }}>Không có thuốc sắp tới.</p>
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div>
              <h3 style={{ color: PRIMARY[500], marginBottom: "15px" }}>Thuốc đã hoàn thành</h3>
              {completedMedications.length > 0 ? (
                completedMedications.map((med, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: GRAY[50],
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "12px",
                      boxShadow: SHADOW.LIGHT,
                      display: "flex",
                      flexDirection: "column",
                      borderLeft: `6px solid ${PRIMARY[500]}`,
                    }}
                  >
                    <h4 style={{ color: TEXT.PRIMARY, fontWeight: "bold" }}>{med.name}</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div style={{ color: TEXT.SECONDARY, fontSize: "14px" }}>
                        <FiCheck className="inline-block mr-2" />
                        {med.time}
                      </div>
                      <div style={{ color: TEXT.SECONDARY, fontSize: "14px" }}>
                        <FiCalendar className="inline-block mr-2" />
                        {med.startDate} - {med.endDate}
                      </div>
                    </div>
                    <p style={{ color: TEXT.SECONDARY, fontSize: "14px", marginBottom: "10px" }}>
                      <strong>Hướng dẫn:</strong> {med.instructions}
                    </p>
                    <p style={{ color: TEXT.SECONDARY, fontSize: "14px", marginBottom: "10px" }}>
                      <strong>Lý do:</strong> {med.reason}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: TEXT.SECONDARY }}>Không có thuốc đã hoàn thành.</p>
              )}
            </div>
          )}
          {/* Continue similarly for "upcoming" and "completed" tabs */}

      </div>      
    </div>
  );
};

export default StudentMedication;
