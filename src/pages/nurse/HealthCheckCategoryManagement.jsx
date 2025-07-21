import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from '../../constants/colors';
import Loading from '../../components/Loading';
import healthCheckApi from '../../api/healthCheckApi';
import AddHealthCheckItemModal from '../../components/modal/AddHealthCheckItemModal';
import ConfirmModal from '../../components/modal/ConfirmModal';
import AlertModal from '../../components/modal/AlertModal';

const HealthCheckCategoryManagement = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [alert, setAlert] = useState({ open: false, type: 'info', message: '', title: '' });

    useEffect(() => {
        fetchCategories();
    }, [pageIndex, pageSize, debouncedSearchTerm]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const params = { pageIndex, pageSize, searchTerm: debouncedSearchTerm, orderBy: 'categories' };
            const response = await healthCheckApi.getHealthCheckItems(params);
            if (response.success) {
                setCategories(response.data);
                setTotalCount(response.totalCount);
                setTotalPages(response.totalPages);
            } else {
                setCategories(null);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (error) {
            setCategories(null);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 750);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageIndex(newPage);
        }
    };

    const getHealthCheckCategory = (categories) => {
        if (categories === 'Vision') { return 'Thị lực' }
        if (categories === 'Hearing') { return 'Thính lực' }
        if (categories === 'Weight') { return 'Cân nặng' }
        if (categories === 'Height') { return 'Chiều cao' }
        if (categories === 'Vital') { return 'Chỉ số sức khỏe' }
    }

    const handleDeleteHealthCheckItem = async (item) => {
        try {
            const res = await healthCheckApi.deleteHealthCheckItem(item.id);
            setDeleteItem(null);
            if (res.success) {
                fetchCategories();
                setAlert({ open: true, type: 'success', message: 'Xóa thành công!', title: 'Thành công' });
            } else {
                setAlert({ open: true, type: 'error', message: res.message || 'Xóa thất bại!', title: 'Lỗi' });
            }
        } catch (error) {
            setDeleteItem(null);
            setAlert({ open: true, type: 'error', message: error.message || 'Có lỗi xảy ra khi xóa!', title: 'Lỗi' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải danh sách sự kiện sức khỏe..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>Danh mục kiểm tra sức khỏe</h1>
                            <p className="mt-2 text-lg" style={{ color: TEXT.SECONDARY }}>
                                Quản lý các hạng mục kiểm tra sức khỏe học sinh
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 rounded-xl flex items-center transition-all duration-300 hover:opacity-80"
                            style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                            onClick={() => { setShowAddModal(true); setEditItem(null); }}
                        >
                            <FiPlus className="mr-2 h-5 w-5" />
                            Thêm hạng mục
                        </button>
                    </div>
                </div>
                <div className="rounded-2xl shadow-xl border backdrop-blur-sm mb-8" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: BORDER.LIGHT }}>
                    <div className="p-6 border-b" style={{ borderColor: BORDER.LIGHT }}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: GRAY[400] }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên hạng mục..."
                                        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                                        style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}
                                        value={searchTerm}
                                        onChange={e => { setSearchTerm(e.target.value); setPageIndex(1); }}
                                    />
                                </div>
                            </div>
                            <button
                                className="px-3 py-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-80"
                                style={{ backgroundColor: PRIMARY[500], color: TEXT.INVERSE }}
                                title="Làm mới"
                                onClick={() => { setSearchTerm(''); setPageIndex(1); fetchCategories(); }}
                            >
                                <FiRefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr style={{ backgroundColor: PRIMARY[50] }}>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '220px' }}>
                                        Tên hạng mục
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
                                        Loại
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '100px' }}>
                                        Đơn vị
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '100px' }}>
                                        Giá trị tối thiểu
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '100px' }}>
                                        Giá trị tối đa
                                    </th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: TEXT.PRIMARY, width: '120px' }}>
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {loading ? (
                                    <tr><td colSpan={6} className="py-12 text-center"><Loading type="spinner" size="large" color="primary" text="Đang tải..." /></td></tr>
                                ) : categories.length === 0 ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-gray-400">Không có hạng mục nào</td></tr>
                                ) : (
                                    categories.map(item => (
                                        <tr key={item.id} className="hover:bg-opacity-50 transition-all duration-200 group" style={{ backgroundColor: GRAY[25] }}>
                                            <td className="py-4 px-6 text-sm whitespace-nowrap font-bold truncate text-left" style={{ color: TEXT.PRIMARY, width: '220px', maxWidth: '220px' }}>
                                                {item.name}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-center whitespace-nowrap truncate" style={{ color: TEXT.SECONDARY, width: '120px', maxWidth: '120px' }}>
                                                {getHealthCheckCategory(item.categories)}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-center whitespace-nowrap truncate font-bold" style={{ color: TEXT.SECONDARY, width: '100px', maxWidth: '100px' }}>
                                                {item.unit.toUpperCase()}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-center whitespace-nowrap font-bold" style={{ color: TEXT.SECONDARY, width: '100px', maxWidth: '100px' }}>
                                                {item.minValue === null ? '-' : item.minValue}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-center whitespace-nowrap font-bold" style={{ color: TEXT.SECONDARY, width: '100px', maxWidth: '100px' }}>
                                                {item.maxValue === null ? '-' : item.maxValue}
                                            </td>
                                            <td className="py-4 px-6 text-center text-sm whitespace-nowrap" style={{ width: '120px', maxWidth: '120px' }}>
                                                <button
                                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                    title="Sửa"
                                                    onClick={() => { setEditItem(item); setShowAddModal(true) }}
                                                    style={{ color: PRIMARY[500], backgroundColor: PRIMARY[50] }}
                                                >
                                                    <FiEdit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-2"
                                                    title="Xóa"
                                                    onClick={() => setDeleteItem(item)}
                                                    style={{ color: ERROR[500], backgroundColor: ERROR[50] }}
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 0 && (
                        <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                            <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                Hiển thị{' '}
                                <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                    {categories.length === 0 ? 0 : ((pageIndex - 1) * pageSize) + 1}
                                </span>{' '}
                                -{' '}
                                <span className="font-bold" style={{ color: TEXT.PRIMARY }}>
                                    {Math.min(pageIndex * pageSize, totalCount)}
                                </span>{' '}
                                trong tổng số{' '}
                                <span className="font-bold" style={{ color: PRIMARY[600] }}>{totalCount}</span>{' '}
                                hạng mục
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(pageIndex - 1)}
                                    disabled={pageIndex === 1}
                                    className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ borderColor: pageIndex === 1 ? BORDER.DEFAULT : PRIMARY[300], color: pageIndex === 1 ? TEXT.SECONDARY : PRIMARY[600], backgroundColor: BACKGROUND.DEFAULT }}
                                >
                                    <FiChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (pageIndex <= 3) {
                                        pageNumber = i + 1;
                                    } else if (pageIndex >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = pageIndex - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200"
                                            style={{
                                                borderColor: pageIndex === pageNumber ? PRIMARY[500] : BORDER.DEFAULT,
                                                backgroundColor: pageIndex === pageNumber ? PRIMARY[500] : BACKGROUND.DEFAULT,
                                                color: pageIndex === pageNumber ? TEXT.INVERSE : TEXT.PRIMARY
                                            }}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => handlePageChange(pageIndex + 1)}
                                    disabled={pageIndex === totalPages}
                                    className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ borderColor: pageIndex === totalPages ? BORDER.DEFAULT : PRIMARY[300], color: pageIndex === totalPages ? TEXT.SECONDARY : PRIMARY[600], backgroundColor: BACKGROUND.DEFAULT }}
                                >
                                    <FiChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AddHealthCheckItemModal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); setEditItem(null); }}
                onSuccess={fetchCategories}
                item={editItem}
                onShowAlert={(type, message, title) => setAlert({ open: true, type, message, title })}
            />

            <ConfirmModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={() => handleDeleteHealthCheckItem(deleteItem)}
                title="Xác nhận xóa"
                message={deleteItem ? `Bạn có chắc chắn muốn xóa hạng mục \"${deleteItem.name}\"?` : ''}
                confirmText="Xóa"
                cancelText="Hủy"
                type="error"
            />

            <AlertModal
                isOpen={alert.open}
                onClose={() => setAlert({ ...alert, open: false })}
                type={alert.type}
                title={alert.title}
                message={alert.message}
            />
        </div>
    );
};

export default HealthCheckCategoryManagement; 