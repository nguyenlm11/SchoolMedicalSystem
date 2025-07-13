import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiEye,
  FiMoreVertical,
  FiTrendingUp,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiPlus,
  FiActivity,
  FiInfo
} from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SUCCESS, ERROR, WARNING, INFO } from "../../constants/colors";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import medicationRequestApi from "../../api/medicationRequestApi";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AlertModal from "../../components/modal/AlertModal";
import { useAuth } from "../../utils/AuthContext";

const StudentMedication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [medicationRequests, setMedicationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
  const [openActionId, setOpenActionId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: "", message: "" });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Allowed statuses for student view
  const ALLOWED_STATUSES = ['Approved', 'Active', 'Completed', 'Discontinued'];

  // Status badge configurations
  const STATUS_CONFIG = {
    Approved: {
      icon: FiCheckCircle,
      label: "Đã duyệt",
      bgColor: SUCCESS[50],
      textColor: SUCCESS[700]
    },
    Active: {
      icon: FiActivity,
      label: "Đang sử dụng",
      bgColor: PRIMARY[50],
      textColor: PRIMARY[700]
    },
    Completed: {
      icon: FiCheckCircle,
      label: "Hoàn thành",
      bgColor: INFO[50],
      textColor: INFO[700]
    },
    Discontinued: {
      icon: FiAlertTriangle,
      label: "Đã ngừng sử dụng",
      bgColor: GRAY[50],
      textColor: GRAY[700]
    }
  };

  // Priority badge configurations
  const PRIORITY_CONFIG = {
    Critical: {
      label: "Khẩn cấp",
      bgColor: ERROR[50],
      textColor: ERROR[700]
    },
    High: {
      label: "Cao",
      bgColor: WARNING[50],
      textColor: WARNING[700]
    },
    Normal: {
      label: "Bình thường",
      bgColor: PRIMARY[50],
      textColor: PRIMARY[700]
    },
    Low: {
      label: "Thấp",
      bgColor: SUCCESS[50],
      textColor: SUCCESS[700]
    }
  };

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: 'Approved', label: 'Đã duyệt' },
    { value: 'Active', label: 'Đang sử dụng' },
    { value: 'Completed', label: 'Hoàn thành' },
    { value: 'Discontinued', label: 'Đã ngừng sử dụng' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data from API
  const fetchMedicationRequests = async (params = {}) => {
    if (!user?.id) {
      setShowAlert(true);
      setAlertInfo({ type: "error", message: "Không tìm thấy thông tin người dùng" });
      return;
    }

    setLoading(true);
    try {
      const apiParams = {
        pageIndex: params.pageIndex || pagination.pageIndex,
        pageSize: params.pageSize || pagination.pageSize,
      };
      if (filterStatus !== "all") apiParams.status = filterStatus;
      if (debouncedSearchTerm) apiParams.searchTerm = debouncedSearchTerm;

      const response = await medicationRequestApi.getStudentMedicationRequests(user.id, apiParams);
      if (response.success) {
        // Filter to show only allowed statuses
        const filteredData = (response.data || []).filter(request =>
          ALLOWED_STATUSES.includes(request.status)
        );

        setMedicationRequests(filteredData);
        setPagination({
          pageIndex: response.currentPage || apiParams.pageIndex,
          pageSize: response.pageSize || apiParams.pageSize,
          totalCount: filteredData.length,
          totalPages: Math.ceil(filteredData.length / (response.pageSize || apiParams.pageSize))
        });
      } else {
        setMedicationRequests([]);
        setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
        setShowAlert(true);
        setAlertInfo({ type: "error", message: response.message || "Không thể tải danh sách yêu cầu thuốc" });
      }
    } catch (err) {
      setMedicationRequests([]);
      setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
      setShowAlert(true);
      setAlertInfo({ type: "error", message: "Có lỗi xảy ra khi tải danh sách yêu cầu thuốc" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicationRequests();
  }, []);

  useEffect(() => {
    fetchMedicationRequests();
  }, [filterStatus, debouncedSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 750);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleRefresh = () => {
    setFilterStatus("all");
    setSearchTerm("");
    fetchMedicationRequests();
  };

  const handlePageChange = (newPageIndex) => {
    setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
    fetchMedicationRequests({ pageIndex: newPageIndex });
  };

  const toggleDropdown = (id) => {
    setOpenActionId(openActionId === id ? null : id);
  };

  const getStats = () => {
    const approvedCount = medicationRequests.filter(r => r.status === 'Approved').length;
    const activeCount = medicationRequests.filter(r => r.status === 'Active').length;
    const completedCount = medicationRequests.filter(r => r.status === 'Completed').length;
    const discontinuedCount = medicationRequests.filter(r => r.status === 'Discontinued').length;

    return {
      approved: approvedCount,
      active: activeCount,
      completed: completedCount,
      discontinued: discontinuedCount,
      total: medicationRequests.length
    };
  };

  const handleDeleteRequest = async () => {
    try {
      setShowDeleteModal(false);
      setSelectedRequestId(null);

      setShowAlert(true);
      setAlertInfo({ type: "success", message: "Xóa yêu cầu thuốc thành công" });
      fetchMedicationRequests();
    } catch (err) {
      setShowDeleteModal(false);
      setSelectedRequestId(null);
      setShowAlert(true);
      setAlertInfo({ type: "error", message: "Có lỗi xảy ra khi xóa yêu cầu thuốc" });
    }
  };

  const handleDeleteClick = (requestId) => {
    setSelectedRequestId(requestId);
    setShowDeleteModal(true);
    setOpenActionId(null);
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status];
    if (!config) return null;

    const IconComponent = config.icon;
    return (
      <span
        className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-lg"
        style={{ backgroundColor: config.bgColor, color: config.textColor }}
      >
        <IconComponent className="mr-1.5 h-4 w-4" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = PRIORITY_CONFIG[priority];
    if (!config) return null;

    return (
      <span
        className="px-3 py-1 text-sm font-medium rounded-lg inline-flex items-center"
        style={{ backgroundColor: config.bgColor, color: config.textColor, minWidth: 80, justifyContent: 'center' }}
      >
        {config.label}
      </span>
    );
  };

  const StatsCard = ({ title, count, icon: Icon, gradientColors, borderColor }) => (
    <div
      className="relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
      style={{ background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`, borderColor }}
    >
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90" style={{ color: TEXT.INVERSE }}>
              {title}
            </p>
            <p className="text-4xl font-bold mt-2" style={{ color: TEXT.INVERSE }}>
              {count}
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

  const PaginationButton = ({ onClick, disabled, children, isActive = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        borderColor: disabled ? BORDER.DEFAULT : isActive ? PRIMARY[500] : PRIMARY[300],
        backgroundColor: isActive ? PRIMARY[500] : BACKGROUND.DEFAULT,
        color: disabled ? TEXT.SECONDARY : isActive ? TEXT.INVERSE : PRIMARY[600]
      }}
    >
      {children}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
        <Loading type="medical" size="large" color="primary" text="Đang tải danh sách yêu cầu thuốc..." />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen">
      <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                Danh sách yêu cầu sử dụng thuốc
              </h1>
              <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                Theo dõi các yêu cầu sử dụng thuốc của bạn tại trường
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Đã duyệt"
            count={stats.approved}
            icon={FiCheckCircle}
            gradientColors={[SUCCESS[500], SUCCESS[600]]}
            borderColor={SUCCESS[200]}
          />
          <StatsCard
            title="Đang sử dụng"
            count={stats.active}
            icon={FiTrendingUp}
            gradientColors={[PRIMARY[500], PRIMARY[600]]}
            borderColor={PRIMARY[200]}
          />
          <StatsCard
            title="Hoàn thành"
            count={stats.completed}
            icon={FiCheckCircle}
            gradientColors={[INFO[500], INFO[600]]}
            borderColor={INFO[200]}
          />
          <StatsCard
            title="Tổng số"
            count={stats.total}
            icon={FiPackage}
            gradientColors={[GRAY[500], GRAY[600]]}
            borderColor={GRAY[200]}
          />
        </div>

        {/* Main Content */}
        <div className="rounded-2xl shadow-xl border backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: BORDER.LIGHT }}>
          {/* Search and Filter */}
          <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo mã yêu cầu, tên thuốc..."
                    className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: PRIMARY[50] }}>
                  <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '160px' }}>
                    MÃ YÊU CẦU
                  </th>
                  <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '130px' }}>
                    NGÀY GỬI
                  </th>
                  <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
                    TRẠNG THÁI
                  </th>
                  <th className="py-4 px-6 text-left text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
                    ĐỘ ƯU TIÊN
                  </th>
                  <th className="py-4 px-6 text-center text-lg font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '80px' }}>
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                {medicationRequests.map((request, index) => (
                  <tr
                    key={request.id}
                    className="hover:bg-opacity-50 transition-all duration-200 group"
                    style={{ backgroundColor: index % 2 === 0 ? 'transparent' : GRAY[25] }}
                  >
                    <td className="py-4 px-6 text-base font-medium whitespace-nowrap" style={{ width: '160px', color: TEXT.PRIMARY }}>
                      {request.code || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-base" style={{ width: '130px' }}>
                      <div className="flex flex-col">
                        <span className="text-base font-medium" style={{ color: TEXT.PRIMARY }}>
                          {new Date(request.submittedAt).toLocaleDateString("vi-VN", { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </span>
                        <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                          {new Date(request.submittedAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-base" style={{ width: '120px' }}>
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="py-4 px-6 text-lg font-bold" style={{ width: '120px' }}>
                      <span style={{ fontSize: '1.25rem', lineHeight: 1.5 }}>
                        {getPriorityBadge(request.priorityDisplayName)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-base" style={{ width: '80px' }}>
                      <div style={{ position: 'relative' }} className="dropdown-container">
                        <button
                          onClick={() => toggleDropdown(request.id)}
                          className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                          style={{ backgroundColor: GRAY[100], color: TEXT.PRIMARY }}
                        >
                          <FiMoreVertical className="w-4 h-4" />
                        </button>

                        {openActionId === request.id && (
                          <div
                            className="absolute py-2 w-48 bg-white rounded-lg shadow-xl border"
                            style={{ borderColor: BORDER.DEFAULT, backgroundColor: 'white', position: 'absolute', right: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
                          >
                            <button
                              className="w-full px-4 py-2 text-left text-base hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                              style={{ color: PRIMARY[600] }}
                              onClick={() => navigate(`/student/medication/history/${request.id}`)}
                            >
                              <FiEye className="w-4 h-4 flex-shrink-0" />
                              <span>Xem chi tiết</span>
                            </button>
                            {request.status === 'PendingApproval' && (
                              <button
                                className="w-full px-4 py-2 text-left text-base hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-150"
                                style={{ color: ERROR[600] }}
                                onClick={() => handleDeleteClick(request.id)}
                              >
                                <FiTrash2 className="w-4 h-4 flex-shrink-0" />
                                <span>Hủy yêu cầu</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                yêu cầu
              </div>

              <div className="flex items-center space-x-2">
                <PaginationButton
                  onClick={() => handlePageChange(pagination.pageIndex - 1)}
                  disabled={pagination.pageIndex === 1}
                >
                  <FiChevronLeft className="h-4 w-4" />
                </PaginationButton>

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
                    <PaginationButton
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={pagination.pageIndex === pageNumber}
                    >
                      {pageNumber}
                    </PaginationButton>
                  );
                })}

                <PaginationButton
                  onClick={() => handlePageChange(pagination.pageIndex + 1)}
                  disabled={pagination.pageIndex === pagination.totalPages}
                >
                  <FiChevronRight className="h-4 w-4" />
                </PaginationButton>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && medicationRequests.length === 0 && (
            <div className="px-6 py-12 text-center" style={{ borderTop: `1px solid ${BORDER.LIGHT}` }}>
              <FiPackage className="mx-auto h-12 w-12 mb-4" style={{ color: GRAY[400] }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                Chưa có yêu cầu sử dụng thuốc nào
              </h3>
              <p className="text-sm mb-4" style={{ color: TEXT.SECONDARY }}>
                {searchTerm || filterStatus !== "all"
                  ? "Không tìm thấy kết quả phù hợp với bộ lọc."
                  : "Bạn chưa có yêu cầu sử dụng thuốc nào."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Hủy yêu cầu thuốc"
        message="Bạn có chắc chắn muốn hủy yêu cầu thuốc này? Hành động này không thể hoàn tác."
        confirmText="Hủy yêu cầu"
        cancelText="Đóng"
        onConfirm={handleDeleteRequest}
        onClose={() => { setShowDeleteModal(false); setSelectedRequestId(null) }}
      />

      <AlertModal
        isOpen={showAlert}
        type={alertInfo.type}
        title={alertInfo.type === "success" ? "Thành công" : "Lỗi"}
        message={alertInfo.message}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
};

export default StudentMedication;
