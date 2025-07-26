import React, { useEffect, useState } from 'react';
import vaccineApi from '../../api/vaccineApi';
import Loading from '../../components/Loading';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiPackage } from 'react-icons/fi';
import { PRIMARY, TEXT, BORDER, BACKGROUND, GRAY } from '../../constants/colors';
import VaccineTypeDetailModal from '../../components/modal/VaccineTypeDetailModal';
import ConfirmModal from '../../components/modal/ConfirmModal';
import AlertModal from '../../components/modal/AlertModal';

const VaccineTypes = () => {
  const [vaccineTypes, setVaccineTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [modalData, setModalData] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('info');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPageIndex(1);
    }, 750);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchVaccineTypes();
  }, [debouncedSearchTerm, pageIndex]);

  const fetchVaccineTypes = async () => {
    const params = { pageIndex, pageSize, searchTerm: debouncedSearchTerm, };
    const response = await vaccineApi.getVaccineTypes(params);
    if (response && response.data) {
      setVaccineTypes(response.data);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);
    } else {
      setVaccineTypes([]);
      setTotalCount(0);
      setTotalPages(0);
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setModalData({});
    setModalOpen(true);
  };

  const openEditModal = (data) => {
    setModalMode('edit');
    setModalData(data);
    setModalOpen(true);
  };

  const openViewModal = (data) => {
    setModalMode('view');
    setModalData(data);
    setModalOpen(true);
  };

  const handleCreate = async (formData) => {
    setModalLoading(true);
    const res = await vaccineApi.createVaccineType(formData);
    setModalLoading(false);
    if (res && res.success !== false) {
      setModalOpen(false);
      showAlert('success', 'Thành công', 'Đã tạo loại vaccine mới!');
      fetchVaccineTypes();
    } else {
      showAlert('error', 'Lỗi', res?.message || 'Không thể tạo loại vaccine.');
    }
  };
  const handleEdit = async (formData) => {
    setModalLoading(true);
    const res = await vaccineApi.updateVaccineType(modalData.id, formData);
    setModalLoading(false);
    if (res && res.success !== false) {
      setModalOpen(false);
      showAlert('success', 'Thành công', 'Đã cập nhật loại vaccine!');
      fetchVaccineTypes();
    } else {
      showAlert('error', 'Lỗi', res?.message || 'Không thể cập nhật loại vaccine.');
    }
  };
  const handleDelete = async () => {
    setDeleteLoading(true);
    const res = await vaccineApi.deleteVaccineType(deleteId);
    setDeleteLoading(false);
    setConfirmOpen(false);
    setDeleteId(null);
    if (res && res.success !== false) {
      showAlert('success', 'Thành công', 'Đã xóa loại vaccine!');
      fetchVaccineTypes();
    } else {
      showAlert('error', 'Lỗi', res?.message || 'Không thể xóa loại vaccine.');
    }
  };

  const showAlert = (type, title, message) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let pages = [];
    let maxPages = 5;
    let startPage = Math.max(1, pageIndex - 2);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={pageIndex === 1}
          className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: pageIndex === 1 ? BORDER.DEFAULT : PRIMARY[300], color: pageIndex === 1 ? TEXT.SECONDARY : PRIMARY[600], backgroundColor: BACKGROUND.DEFAULT }}
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>
        {pages.map(page => (
          <button
            key={page}
            onClick={() => setPageIndex(page)}
            className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
            style={{
              borderColor: pageIndex === page ? PRIMARY[500] : BORDER.DEFAULT,
              backgroundColor: pageIndex === page ? PRIMARY[500] : BACKGROUND.DEFAULT,
              color: pageIndex === page ? TEXT.INVERSE : TEXT.PRIMARY
            }}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={pageIndex === totalPages}
          className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: pageIndex === totalPages ? BORDER.DEFAULT : PRIMARY[300], color: pageIndex === totalPages ? TEXT.SECONDARY : PRIMARY[600], backgroundColor: BACKGROUND.DEFAULT }}
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
      <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>Quản lý loại vaccine</h1>
            <p className="mt-1 text-lg" style={{ color: TEXT.SECONDARY }}>Danh sách các loại vaccine trong hệ thống</p>
          </div>
          <button
            className="px-4 py-2 rounded-xl flex items-center transition-all duration-300 hover:opacity-80"
            style={{ backgroundColor: PRIMARY[500], color: 'white', borderColor: PRIMARY[600], boxShadow: `0 1px 2px ${PRIMARY[900]}20` }}
            onClick={openCreateModal}
          >
            <FiPlus className="mr-2 h-5 w-5" /> Thêm loại vaccine
          </button>
        </div>
        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
            <input
              type="text"
              placeholder="Tìm kiếm loại vaccine..."
              className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
              style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY, focusRingColor: PRIMARY[500] + '40' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: PRIMARY[500] }}></div>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl shadow-xl border backdrop-blur-sm overflow-x-auto" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: BORDER.LIGHT }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loading type="medical" size="large" color="primary" text="Đang tải danh sách loại vaccine..." />
            </div>
          ) : vaccineTypes.length > 0 ? (
            <>
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr style={{ backgroundColor: PRIMARY[50] }}>
                    <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: 60 }}>STT</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: 220 }}>Tên loại vaccine</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: 120 }}>Tuổi khuyến nghị</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: 120 }}>Số mũi tiêm</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: 160 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                  {vaccineTypes.map((vaccine, idx) => (
                    <tr key={vaccine.id || idx} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : GRAY[50] }}>
                      <td className="py-4 px-4 font-semibold text-center" style={{ color: TEXT.PRIMARY, width: 60 }}>{(pageIndex - 1) * pageSize + idx + 1}</td>
                      <td className="py-4 px-4 font-semibold" style={{ color: TEXT.PRIMARY, width: 220 }}>{vaccine.name || 'Không xác định'}</td>
                      <td className="py-4 px-4 text-center" style={{ color: TEXT.PRIMARY, width: 120 }}>{vaccine.recommendedAge ?? '-'}</td>
                      <td className="py-4 px-4 text-center" style={{ color: TEXT.PRIMARY, width: 120 }}>{vaccine.doseCount ?? '-'}</td>
                      <td className="py-4 px-4 text-center" style={{ width: 160 }}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                            title="Xem chi tiết"
                            onClick={() => openViewModal(vaccine)}
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 rounded-lg transition"
                            style={{ color: PRIMARY[700] }}
                            title="Chỉnh sửa"
                            onClick={() => openEditModal(vaccine)}
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                            title="Xóa"
                            onClick={() => { setDeleteId(vaccine.id); setConfirmOpen(true); }}
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination() && (
                <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                  <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                    Hiển thị <span className="font-bold" style={{ color: TEXT.PRIMARY }}>{totalCount > 0 ? ((pageIndex - 1) * pageSize) + 1 : 0}</span> - <span className="font-bold" style={{ color: TEXT.PRIMARY }}>{Math.min(pageIndex * pageSize, totalCount)}</span> trong tổng số <span className="font-bold" style={{ color: PRIMARY[600] }}>{totalCount}</span> loại vaccine
                  </div>
                  {renderPagination()}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-20 w-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: GRAY[100] }}>
                <FiPackage className="h-10 w-10" style={{ color: GRAY[400] }} />
              </div>
              <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                Không có loại vaccine nào.
              </p>
              <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                Thử thay đổi từ khóa tìm kiếm hoặc kiểm tra lại dữ liệu.
              </p>
            </div>
          )}
        </div>

        <VaccineTypeDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          mode={modalMode}
          initialData={modalData}
          isLoading={modalLoading}
          onSubmit={modalMode === 'create' ? handleCreate : handleEdit}
        />

        <ConfirmModal
          isOpen={confirmOpen}
          onClose={() => { if (!deleteLoading) setConfirmOpen(false); setDeleteId(null); }}
          onConfirm={handleDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa loại vaccine này?"
          confirmText="Xóa"
          cancelText="Hủy"
          type="error"
          isLoading={deleteLoading}
        />

        <AlertModal
          isOpen={alertOpen}
          onClose={() => setAlertOpen(false)}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
        />
      </div>
    </div>
  );
};

export default VaccineTypes; 