import React, { useEffect, useState } from 'react';
import vaccineApi from '../../api/vaccineApi';
import Loading from '../../components/Loading';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { PRIMARY, TEXT, BORDER, BACKGROUND, GRAY, ERROR } from '../../constants/colors';
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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'create' | 'edit'
  const [modalData, setModalData] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  // Confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Alert
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('info');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPageIndex(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchVaccineTypes();
    // eslint-disable-next-line
  }, [debouncedSearchTerm, pageIndex]);

  const fetchVaccineTypes = async () => {
    setLoading(true);
    const params = {
      pageIndex,
      pageSize,
      searchTerm: debouncedSearchTerm,
    };
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

  // Modal handlers
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

  // CRUD handlers
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

  // Alert handler
  const showAlert = (type, title, message) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>Danh sách các loại vaccine</h1>
        <button
          className="flex items-center px-5 py-3 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 transition-all duration-200 shadow-lg"
          onClick={openCreateModal}
        >
          <FiPlus className="mr-2" /> Thêm loại vaccine
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
        </div>
      </div>
      <div className="rounded-2xl shadow-xl border backdrop-blur-sm overflow-x-auto" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: BORDER.LIGHT }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loading type="medical" size="large" color="primary" text="Đang tải danh sách loại vaccine..." />
          </div>
        ) : (
          <>
            <table className="w-full min-w-[700px]">
              <thead>
                <tr style={{ backgroundColor: PRIMARY[50] }}>
                  <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY, width: 60 }}>STT</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Tên loại vaccine</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Mô tả</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Tuổi khuyến nghị</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Số mũi tiêm</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                {vaccineTypes.length > 0 ? vaccineTypes.map((vaccine, idx) => (
                  <tr key={vaccine.id || idx} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : GRAY[25] }}>
                    <td className="py-4 px-6 font-semibold" style={{ color: TEXT.PRIMARY, textAlign: 'center' }}>{(pageIndex - 1) * pageSize + idx + 1}</td>
                    <td className="py-4 px-6 font-semibold" style={{ color: TEXT.PRIMARY }}>{vaccine.name || 'Không xác định'}</td>
                    <td className="py-4 px-6" style={{ color: TEXT.SECONDARY }}>{vaccine.description || '-'}</td>
                    <td className="py-4 px-6" style={{ color: TEXT.PRIMARY }}>{vaccine.recommendedAge ?? '-'}</td>
                    <td className="py-4 px-6" style={{ color: TEXT.PRIMARY }}>{vaccine.doseCount ?? '-'}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                          title="Xem chi tiết"
                          onClick={() => openViewModal(vaccine)}
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition"
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
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      Không có loại vaccine nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                  Hiển thị <span className="font-bold" style={{ color: TEXT.PRIMARY }}>{totalCount > 0 ? ((pageIndex - 1) * pageSize) + 1 : 0}</span> - <span className="font-bold" style={{ color: TEXT.PRIMARY }}>{Math.min(pageIndex * pageSize, totalCount)}</span> trong tổng số <span className="font-bold" style={{ color: PRIMARY[600] }}>{totalCount}</span> loại vaccine
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPageIndex(pageIndex - 1)}
                    disabled={pageIndex === 1}
                    className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: pageIndex === 1 ? BORDER.DEFAULT : PRIMARY[300], color: pageIndex === 1 ? TEXT.SECONDARY : PRIMARY[600] }}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Modal chi tiết/tạo/sửa */}
      <VaccineTypeDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialData={modalData}
        isLoading={modalLoading}
        onSubmit={modalMode === 'create' ? handleCreate : handleEdit}
      />
      {/* Modal xác nhận xóa */}
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
      {/* AlertModal */}
      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
    </div>
  );
};

export default VaccineTypes; 