import React, { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiActivity,
  FiRefreshCw,
  FiEye,
  FiTrendingUp,
  FiPhone,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR } from "../../constants/colors";
import Loading from "../../components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import healthEventApi from "../../api/healtheventApi";

const eventTypeOptions = [
  { value: "all", label: "Tất cả loại" },
  { value: 'Injury', label: 'Chấn thương' },
  { value: 'Illness', label: 'Bệnh, ốm' },
  { value: 'AllergicReaction', label: 'Dị ứng' },
  { value: 'Fall', label: 'Té ngã' },
  { value: 'Emergency', label: 'Cấp cứu' },
  { value: 'Other', label: 'Khác' }
];

const StatCard = ({ title, value, icon: Icon, gradient, borderColor }) => (
  <div
    className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
    style={{ background: gradient, borderColor }}
  >
    <div className="p-6 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
            {title}
          </p>
          <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
            {value}
          </p>
        </div>
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Icon className="h-8 w-8" style={{ color: TEXT.INVERSE }} />
        </div>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ error, onClose }) => (
  <div className="mb-8">
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
        onClick={onClose}
        className="ml-auto bg-red-50 rounded-full p-1 hover:bg-red-100"
      >
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

const EmptyState = ({ searchActive }) => (
  <div className="px-6 py-12 text-center" style={{ borderTop: `1px solid ${BORDER.LIGHT}` }}>
    <FiActivity className="mx-auto h-12 w-12 mb-4" style={{ color: GRAY[400] }} />
    <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
      Không có sự kiện y tế nào
    </h3>
    <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
      {searchActive
        ? "Không tìm thấy kết quả phù hợp với bộ lọc."
        : "Chưa có sự kiện y tế nào được ghi nhận."}
    </p>
  </div>
);

const StudentHealthEvents = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState({ fromDate: "", toDate: "" });
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });

  const fetchData = async () => {
    if (!id) {
      setError("Không tìm thấy thông tin học sinh");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await healthEventApi.getStudentHealthEvents(id, {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        eventType: filterType !== "all" ? filterType : undefined
      });

      if (response.success) {
        setEvents(response.data);
        setPagination({
          pageIndex: response.currentPage,
          pageSize: response.pageSize,
          totalCount: response.totalCount,
          totalPages: response.totalPages
        });
      } else {
        setError(response.message || "Không thể tải danh sách sự kiện y tế");
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching data", error);
      setError("Đã xảy ra lỗi khi tải danh sách sự kiện y tế");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, filterType]);

  const handleFilter = () => {
    if (dateRange.fromDate && dateRange.toDate) {
      fetchData();
    }
  };

  const handleRefresh = () => {
    setDateRange({ fromDate: "", toDate: "" });
    setFilterType("all");
    fetchData();
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = (newPageIndex) => {
    setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
    fetchData();
  };

  const stats = useMemo(() => ({
    total: events.length,
    emergency: events.filter(e => e.isEmergency).length,
    normal: events.filter(e => !e.isEmergency).length
  }), [events]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
        <Loading type="medical" size="large" color="primary" text="Đang tải thông tin sự kiện..." />
      </div>
    );
  }

  const isSearchActive = filterType !== "all" || dateRange.fromDate || dateRange.toDate;

  return (
    <div className="min-h-screen">
      <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                Sự kiện y tế của {events[0]?.studentName}
              </h1>
              <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                Theo dõi lịch sử các sự kiện y tế tại trường
              </p>
            </div>
          </div>
        </div>

        {error && <ErrorMessage error={error} onClose={() => setError(null)} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Khẩn cấp"
            value={stats.emergency}
            icon={FiAlertTriangle}
            gradient={`linear-gradient(135deg, ${ERROR[500]} 0%, ${ERROR[600]} 100%)`}
            borderColor={ERROR[200]}
          />
          <StatCard
            title="Bình thường"
            value={stats.normal}
            icon={FiCheckCircle}
            gradient={`linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[600]} 100%)`}
            borderColor={SUCCESS[200]}
          />
          <StatCard
            title="Tổng số"
            value={stats.total}
            icon={FiTrendingUp}
            gradient={`linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`}
            borderColor={PRIMARY[200]}
          />
        </div>

        <div className="rounded-2xl shadow-xl border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
          {/* Search and Filter Section */}
          <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                >
                  {eventTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                    <input
                      type="date"
                      name="fromDate"
                      value={dateRange.fromDate}
                      onChange={handleDateChange}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                    />
                  </div>
                  <span style={{ color: TEXT.SECONDARY }}>-</span>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: GRAY[400] }} />
                    <input
                      type="date"
                      name="toDate"
                      value={dateRange.toDate}
                      onChange={handleDateChange}
                      min={dateRange.fromDate}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                    />
                  </div>
                  <button
                    onClick={handleFilter}
                    disabled={!dateRange.fromDate || !dateRange.toDate}
                    className="px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                  >
                    Lọc
                  </button>
                </div>

                <button
                  onClick={handleRefresh}
                  className="px-3 py-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-80"
                  style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                  title="Làm mới"
                >
                  <FiRefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: PRIMARY[50] }}>
                  <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '160px' }}>
                    MÃ SỰ KIỆN
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '200px' }}>
                    LOẠI SỰ KIỆN
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '180px' }}>
                    THỜI GIAN XẢY RA
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '200px' }}>
                    NGƯỜI XỬ LÝ
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '100px' }}>
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                {events.map((event, index) => (
                  <tr
                    key={event.id}
                    className="hover:bg-opacity-50 transition-all duration-200 group"
                    style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                  >
                    <td className="py-4 px-6 text-sm font-medium whitespace-nowrap" style={{ width: '160px', color: TEXT.PRIMARY }}>
                      {event.code}
                    </td>
                    <td className="py-4 px-6" style={{ width: '200px' }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 text-sm font-medium rounded-md"
                          style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700] }}
                        >
                          {event.eventTypeDisplayName}
                        </span>
                        {event.isEmergency && (
                          <span
                            className="p-1 text-xs font-medium rounded-md"
                            style={{ backgroundColor: ERROR[50], color: ERROR[700] }}
                            title={event.emergencyStatusText}
                          >
                            <FiAlertTriangle className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6" style={{ width: '180px' }}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                          {new Date(event.occurredAt).toLocaleDateString("vi-VN", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </span>
                        <span className="text-xs" style={{ color: TEXT.SECONDARY }}>
                          {new Date(event.occurredAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6" style={{ width: '200px' }}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                          {event.handledByName || "Chưa phân công"}
                        </span>
                        {event.parentNotice && (
                          <div className="flex items-center mt-1 text-xs" style={{ color: SUCCESS[600] }}>
                            <FiPhone className="mr-1 h-3 w-3" />
                            {event.parentNotice}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center" style={{ width: '100px' }}>
                      <button
                        onClick={() => navigate(`/parent/student-health-events-detail/${event.id}`)}
                        className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                        style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                        title="Xem chi tiết"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          {pagination.totalCount > 0 && (
            <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
              <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                Hiển thị{" "}
                <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                  {((pagination.pageIndex - 1) * pagination.pageSize) + 1}
                </span>{" "}
                -{" "}
                <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                  {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalCount)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-bold" style={{ color: PRIMARY[600] }}>{pagination.totalCount}</span>{" "}
                sự kiện
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.pageIndex - 1)}
                  disabled={pagination.pageIndex === 1}
                  className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: pagination.pageIndex === 1 ? BORDER.DEFAULT : PRIMARY[300],
                    color: pagination.pageIndex === 1 ? TEXT.SECONDARY : PRIMARY[600],
                    backgroundColor: BACKGROUND.DEFAULT
                  }}
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (pagination.pageIndex <= 3) {
                    pageNumber = i + 1;
                  } else if (pagination.pageIndex >= pagination.totalPages - 2) {
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = pagination.pageIndex - 2 + i;
                  }
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                      style={{
                        borderColor: pagination.pageIndex === pageNumber ? PRIMARY[500] : BORDER.DEFAULT,
                        backgroundColor: pagination.pageIndex === pageNumber ? PRIMARY[500] : BACKGROUND.DEFAULT,
                        color: pagination.pageIndex === pageNumber ? TEXT.INVERSE : TEXT.PRIMARY
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.pageIndex + 1)}
                  disabled={pagination.pageIndex === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: pagination.pageIndex === pagination.totalPages ? BORDER.DEFAULT : PRIMARY[300],
                    color: pagination.pageIndex === pagination.totalPages ? TEXT.SECONDARY : PRIMARY[600],
                    backgroundColor: BACKGROUND.DEFAULT
                  }}
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {!loading && events.length === 0 && (
            <EmptyState
              searchActive={isSearchActive}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHealthEvents;


