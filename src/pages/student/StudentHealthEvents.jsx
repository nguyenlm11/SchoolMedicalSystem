import React, { useState, useEffect } from "react";
import { FiCalendar, FiCheck, FiPlus, FiAlertTriangle, FiUserCheck, FiInfo } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW, COMMON, SUCCESS, ERROR } from "../../constants/colors";
import Loading from "../../components/Loading";

const StudentHealthEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate data fetching
        const medicationsData = [
          {
            name: "Khám sức khoẻ tổng quát",
            type: "Khám sức khoẻ",
            date: "10/07/2025",
            status: "upcoming",
          },
          {
            name: "Tiêm vacxin phòng cúm",
            type: "Tiêm vacxin",
            date: "15/07/2025",
            status: "upcoming",
          },
          {
            name: "Khám mắt định kỳ",
            type: "Khám sức khoẻ",
            date: "01/07/2025",
            status: "completed",
          },
        ];

        // Simulate loading
        setTimeout(() => {
          setEvents(medicationsData);
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const upcomingEvents = events.filter((event) => event.status === "upcoming");
  const completedEvents = events.filter((event) => event.status === "completed");

  const [activeTab, setActiveTab] = useState("upcoming");
  const [filter, setFilter] = useState("");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
        <Loading type="heart" size="xl" color="primary" text="Đang tải thông tin sự kiện..." />
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
              <FiCheck className="h-8 w-8" style={{ color: PRIMARY[600] }} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                Xin chào, Nguyễn Văn An
              </h1>
              <p className="mt-2 text-sm sm:text-base" style={{ color: TEXT.SECONDARY }}>
                Theo dõi các sự kiện sức khoẻ của bạn tại trường
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          {/* Upcoming Events */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all duration-200"
            style={{ borderLeftColor: PRIMARY[500], boxShadow: SHADOW.DEFAULT }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: SUCCESS[50] }}>
                  <FiCalendar className="h-5 w-5" style={{ color: SUCCESS[600] }} />
                </div>
                <div>
                  <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                    Sự kiện sắp tới
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
                {upcomingEvents.length} sự kiện
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
              Các sự kiện sắp tới của bạn.
            </p>
          </div>

          {/* Recent Activities */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all duration-200"
            style={{ borderLeftColor: PRIMARY[500], boxShadow: SHADOW.DEFAULT }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: PRIMARY[50] }}>
                  <FiUserCheck className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                </div>
                <div>
                  <h3 className="text-lg font-medium" style={{ color: TEXT.PRIMARY }}>
                    Hoạt động gần đây
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
                {completedEvents.length} sự kiện
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
              Các sự kiện đã tham gia của bạn.
            </p>
          </div>
        </div>

        {/* Reminder Card */}
        <div
          className="bg-blue-50 p-6 rounded-xl shadow-sm mb-8"
          style={{
            backgroundColor: "#e1f5fe",
            boxShadow: SHADOW.DEFAULT,
          }}
        >
          <div className="flex items-start mb-4">
            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: "#81d4fa" }}>
              <FiInfo className="h-5 w-5" style={{ color: "#01579b" }} />
            </div>
            <div>
              <h3 className="text-lg font-medium" style={{ color: "#01579b" }}>
                Lưu ý quan trọng
              </h3>
            </div>
          </div>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", color: TEXT.SECONDARY }}>
            <li>Luôn đến đúng giờ cho các sự kiện y tế</li>
            <li>Mang theo sổ khám sức khoẻ cá nhân (nếu có)</li>
            <li>Thông báo cho y tá trường học nếu bạn không thể tham gia</li>
            <li>Các sự kiện được đánh dấu "Bắt buộc" cần phải tham gia</li>
          </ul>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
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
            Đã tham gia
          </button>
        </div>

        {/* Display Events Based on Active Tab */}
        {activeTab === "upcoming" && (
          <div>
            <h3 style={{ color: PRIMARY[500], marginBottom: "15px" }}>Sự kiện sắp tới</h3>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
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
                  <h4 style={{ color: TEXT.PRIMARY, fontWeight: "bold" }}>{event.name}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ color: TEXT.SECONDARY, fontSize: "14px" }}>
                      <FiCalendar className="inline-block mr-2" />
                      {event.date}
                    </div>
                  </div>
                  <p style={{ color: TEXT.SECONDARY, fontSize: "14px", marginBottom: "10px" }}>
                    <strong>Loại sự kiện:</strong> {event.type}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: TEXT.SECONDARY }}>Không có sự kiện sắp tới.</p>
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div>
            <h3 style={{ color: PRIMARY[500], marginBottom: "15px" }}>Sự kiện đã tham gia</h3>
            {completedEvents.length > 0 ? (
              completedEvents.map((event, index) => (
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
                  <h4 style={{ color: TEXT.PRIMARY, fontWeight: "bold" }}>{event.name}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ color: TEXT.SECONDARY, fontSize: "14px" }}>
                      <FiCheck className="inline-block mr-2" />
                      {event.date}
                    </div>
                  </div>
                  <p style={{ color: TEXT.SECONDARY, fontSize: "14px", marginBottom: "10px" }}>
                    <strong>Loại sự kiện:</strong> {event.type}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: TEXT.SECONDARY }}>Không có sự kiện đã tham gia.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHealthEvents;
