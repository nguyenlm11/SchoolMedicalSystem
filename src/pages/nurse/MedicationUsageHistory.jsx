import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import medicationUsageApi from '../../api/medicationUsageApi';
import { FiSearch, FiRefreshCw, FiClock, FiCheckCircle, FiAlertTriangle, FiSkipForward, FiChevronLeft, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR, SUCCESS, WARNING } from '../../constants/colors';
import Loading from '../../components/Loading';

const PERIODS = [
    'Buổi sáng',
    'Buổi trưa',
    'Buổi chiều',
    'Buổi tối',
    'Khẩn cấp',
];
const STATUS_BUTTONS = [
    { value: 'Used', label: 'Đã uống', icon: <FiCheckCircle className="inline mr-1" /> },
    { value: 'Missed', label: 'Bỏ lỡ', icon: <FiAlertTriangle className="inline mr-1" /> },
    { value: 'Skipped', label: 'Bỏ qua', icon: <FiSkipForward className="inline mr-1" /> },
];

const PAGE_SIZE = 10;

const MedicationUsageHistory = () => {
    const { id: medicationId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [period, setPeriod] = useState('');
    const [status, setStatus] = useState('Used');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [medicationId, pageIndex, fromDate, toDate, period, status]);

    const fetchData = async () => {
        if (!medicationId) return;
        setError('');
        try {
            const params = {
                medicationId,
                pageIndex,
                pageSize: PAGE_SIZE,
                ...(fromDate ? { fromDate } : {}),
                ...(toDate ? { toDate } : {}),
                status,
            };
            const res = await medicationUsageApi.getMedicationUsageHistory(params);
            if (res && res.success) {
                let filtered = res.data || [];
                if (period) filtered = filtered.filter(item => item.administeredPeriod === period);
                setData(filtered);
                setTotalCount(res.totalCount || filtered.length);
                setTotalPages(res.totalPages || 1);
            } else {
                setError(res?.message || 'Không thể tải lịch sử dùng thuốc');
                setData([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (err) {
            setError('Lỗi khi tải dữ liệu');
            setData([]);
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterReset = () => {
        setFromDate('');
        setToDate('');
        setPeriod('');
        setStatus('Used');
        setPageIndex(1);
    };

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                style={{ backgroundColor: PRIMARY[50], color: PRIMARY[700], border: `1px solid ${PRIMARY[100]}` }}
            >
                <FiArrowLeft className="mr-2 h-5 w-5" /> Quay lại
            </button>
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>Lịch sử sử dụng thuốc {data[0]?.medicationName}</h1>
                    <p className="mt-1 text-lg" style={{ color: TEXT.SECONDARY }}> {data[0]?.studentName} - {data[0]?.className}</p>
                </div>
            </div>
            <div className="mb-6 flex justify-end">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Từ ngày</label>
                        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPageIndex(1); }} className="border rounded-lg px-3 py-2 text-sm w-full min-w-[140px]" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Đến ngày</label>
                        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPageIndex(1); }} className="border rounded-lg px-3 py-2 text-sm w-full min-w-[140px]" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: TEXT.PRIMARY }}>Buổi</label>
                        <select value={period} onChange={e => { setPeriod(e.target.value); setPageIndex(1); }} className="border rounded-lg px-3 py-2 text-sm w-full min-w-[120px]" style={{ borderColor: BORDER.DEFAULT, backgroundColor: BACKGROUND.DEFAULT, color: TEXT.PRIMARY }}>
                            <option value="">Tất cả</option>
                            {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2 items-end mt-6">
                        {STATUS_BUTTONS.map(btn => (
                            <button
                                key={btn.value}
                                onClick={() => { setStatus(btn.value); setPageIndex(1); }}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 border transition-all duration-200 ${status === btn.value ? 'bg-teal-600 text-white border-teal-600 shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-teal-400'}`}
                                style={{ minWidth: 90 }}
                                type="button"
                            >
                                {btn.icon}{btn.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleFilterReset} className="px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 font-semibold border" style={{ backgroundColor: PRIMARY[500], color: 'white', borderColor: PRIMARY[500], height: 40, marginTop: 24 }}>
                        <FiRefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="rounded-2xl shadow-xl border backdrop-blur-sm overflow-x-auto" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: BORDER.LIGHT }}>
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loading type="medical" size="large" color="primary" text="Đang tải lịch sử dùng thuốc..." />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-16">
                        <span className="text-lg font-semibold" style={{ color: ERROR[600] }}>{error}</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <FiClock className="h-12 w-12 mb-4" style={{ color: GRAY[400] }} />
                        <p className="text-xl font-semibold mb-2" style={{ color: TEXT.SECONDARY }}>
                            Không có lịch sử sử dụng thuốc.
                        </p>
                        <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                            Thử thay đổi bộ lọc hoặc kiểm tra lại dữ liệu.
                        </p>
                    </div>
                ) : (
                    <>
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr style={{ backgroundColor: PRIMARY[50] }}>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Ngày</th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Thời gian cho uống</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Liều dùng</th>
                                    <th className="py-4 px-6 text-center text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Trạng thái</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Người cho uống</th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: TEXT.PRIMARY }}>Lý do/Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ divideColor: BORDER.LIGHT }}>
                                {data.map((item, idx) => (
                                    <tr key={item.id || idx} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : GRAY[50] }}>
                                        <td className="py-4 px-6" style={{ color: TEXT.PRIMARY }}>{item.usageDate ? new Date(item.usageDate).toLocaleDateString('vi-VN') : '-'}</td>
                                        <td className="py-4 px-6 text-center" style={{ color: TEXT.PRIMARY }}>
                                            <div>{item.administeredPeriod || '-'}</div>
                                            <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                {item.administeredTime ? new Date(item.administeredTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6" style={{ color: TEXT.PRIMARY }}>{item.dosageUse || '-'}</td>
                                        <td className="py-4 px-6 text-center" style={{ color: item.status === 'Used' ? SUCCESS[700] : item.status === 'Missed' ? ERROR[700] : WARNING[700] }}>
                                            {item.status === 'Used' && <FiCheckCircle className="inline mr-1" />}
                                            {item.status === 'Missed' && <FiAlertTriangle className="inline mr-1" />}
                                            {item.status === 'Skipped' && <FiSkipForward className="inline mr-1" />}
                                            {item.statusDisplayName || item.status}
                                        </td>
                                        <td className="py-4 px-6" style={{ color: TEXT.PRIMARY }}>{item.administeredByName || '-'}</td>
                                        <td className="py-4 px-6" style={{ color: TEXT.SECONDARY }}>{item.reason || item.note || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalPages > 0 && (
                            <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: BORDER.LIGHT }}>
                                <div className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                    Hiển thị <span className="font-bold" style={{ color: TEXT.PRIMARY }}>{totalCount > 0 ? ((pageIndex - 1) * PAGE_SIZE) + 1 : 0}</span> - <span className="font-bold" style={{ color: TEXT.PRIMARY }}>{Math.min(pageIndex * PAGE_SIZE, totalCount)}</span> trong tổng số <span className="font-bold" style={{ color: PRIMARY[600] }}>{totalCount}</span> lần sử dụng thuốc
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setPageIndex(pageIndex - 1)}
                                        disabled={pageIndex === 1}
                                        className="px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ borderColor: pageIndex === 1 ? BORDER.DEFAULT : PRIMARY[300], color: pageIndex === 1 ? TEXT.SECONDARY : PRIMARY[600], backgroundColor: BACKGROUND.DEFAULT }}
                                    >
                                        <FiChevronLeft className="h-4 w-4" />
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
                                        <FiChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MedicationUsageHistory;
