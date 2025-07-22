import { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertTriangle, FiSkipForward, FiSun, FiSunrise, FiSunset, FiMoon, FiZap } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, ERROR } from '../../constants/colors';
import { ButtonLoading } from '../Loading';
import AlertModal from './AlertModal';
import medicationUsageApi from '../../api/medicationUsageApi';

const TIME_OF_DAY_LABELS = {
    'Buổi sáng': { label: 'Buổi sáng', icon: <FiSun className="w-4 h-4 mr-1" /> },
    'Buổi trưa': { label: 'Buổi trưa', icon: <FiSunrise className="w-4 h-4 mr-1" /> },
    'Buổi chiều': { label: 'Buổi chiều', icon: <FiSunset className="w-4 h-4 mr-1" /> },
    'Buổi tối': { label: 'Buổi tối', icon: <FiMoon className="w-4 h-4 mr-1" /> },
    'Emergency': { label: 'Khẩn cấp', icon: <FiZap className="w-4 h-4 mr-1" /> },
};

const STATUS_TABS = [
    { key: 'Used', label: 'Đã uống', icon: <FiCheckCircle className="w-4 h-4 mr-1" /> },
    { key: 'Missed', label: 'Bỏ lỡ', icon: <FiAlertTriangle className="w-4 h-4 mr-1" /> },
    { key: 'Skipped', label: 'Bỏ qua', icon: <FiSkipForward className="w-4 h-4 mr-1" /> },
];

const TIME_OF_DAY_RANGES = {
    'Buổi sáng': { start: 6, end: 11 },
    'Buổi trưa': { start: 11, end: 14 },
    'Buổi chiều': { start: 14, end: 18 },
    'Buổi tối': { start: 18, end: 22 },
    'Emergency': { start: 0, end: 24 },
};

function getTimeTabs(timesOfDay = []) {
    const tabs = timesOfDay.map(t => ({ key: t, ...TIME_OF_DAY_LABELS[t] }));
    tabs.push({ key: 'Emergency', ...TIME_OF_DAY_LABELS['Emergency'] });
    return tabs;
}

const initialForm = {
    dosageUsed: '',
    note: '',
    administeredTime: '',
};

const StudentMedicationAdministerModal = ({ isOpen, onClose, medicationId, studentName, medicationName, defaultTime, timesOfDay = [], onSuccess, }) => {
    const timeTabs = getTimeTabs(timesOfDay);
    const [activeTimeTab, setActiveTimeTab] = useState(timeTabs[0]?.key || 'Morning');
    const [activeStatusTab, setActiveStatusTab] = useState('Used');
    const [formState, setFormState] = useState(() => {
        const obj = {};
        timeTabs.forEach(time => {
            obj[time.key] = {};
            STATUS_TABS.forEach(status => {
                obj[time.key][status.key] = { ...initialForm, administeredTime: defaultTime || '' };
            });
        });
        return obj;
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ open: false, type: 'info', title: '', message: '' });
    const [disabledTabs, setDisabledTabs] = useState({});

    // Helper: lấy ngày yyyy-MM-dd từ defaultTime hoặc hôm nay
    function getUsageDate() {
        if (defaultTime) {
            return new Date(defaultTime).toISOString().slice(0, 10);
        }
        const now = new Date();
        return now.toISOString().slice(0, 10);
    }

    // Fetch usage history khi mở modal
    useEffect(() => {
        async function fetchUsageHistory() {
            if (!isOpen || !medicationId) return;
            const usageDate = getUsageDate();
            const res = await medicationUsageApi.getMedicationUsageHistory({
                medicationId,
                pageIndex: 1,
                pageSize: 1000,
                fromDate: usageDate,
                toDate: usageDate
            });
            if (res && res.success && Array.isArray(res.data)) {
                // Tìm các administeredPeriod đã có Used/Skipped/Missed
                const periodsDone = {};
                res.data.forEach(item => {
                    if (['Used', 'Skipped', 'Missed'].includes(item.status) && item.administeredPeriod) {
                        periodsDone[item.administeredPeriod] = true;
                    }
                });
                // Disable các tab buổi đã khai báo
                const disabled = {};
                timeTabs.forEach(tab => {
                    if (tab.key !== 'Emergency' && periodsDone[tab.key]) {
                        disabled[tab.key] = true;
                    }
                });
                // Nếu tất cả các buổi (trừ Emergency) đã disable thì disable hết (trừ Emergency)
                const allDisabled = timeTabs.filter(t => t.key !== 'Emergency').every(t => disabled[t.key]);
                if (allDisabled) {
                    timeTabs.forEach(tab => {
                        if (tab.key !== 'Emergency') disabled[tab.key] = true;
                    });
                }
                setDisabledTabs(disabled);
                // Luôn chọn lại tab buổi đầu tiên chưa disable (trừ Emergency) cho mỗi thuốc
                const firstEnabled = timeTabs.find(t => !disabled[t.key] && t.key !== 'Emergency');
                setActiveTimeTab(firstEnabled?.key || 'Emergency');
            } else {
                setDisabledTabs({});
            }
        }
        fetchUsageHistory();
        // eslint-disable-next-line
    }, [isOpen, medicationId, defaultTime, timesOfDay]);

    // Reset lại state khi mở modal hoặc timesOfDay thay đổi
    useEffect(() => {
        if (isOpen) {
            // Luôn chọn tab buổi đầu tiên chưa disable (trừ Emergency)
            let firstTab = timeTabs.find(t => t.key !== 'Emergency');
            setActiveStatusTab('Used');
            setFormState(() => {
                const obj = {};
                timeTabs.forEach(time => {
                    obj[time.key] = {};
                    STATUS_TABS.forEach(status => {
                        obj[time.key][status.key] = { ...initialForm, administeredTime: defaultTime || '' };
                    });
                });
                return obj;
            });
            setFormErrors({});
            setAlert({ open: false, type: 'info', title: '', message: '' });
            setActiveTimeTab(firstTab?.key || 'Emergency');
        }
    }, [isOpen, defaultTime, timesOfDay]);

    const handleTimeTabChange = (tab) => {
        setActiveTimeTab(tab);
        setActiveStatusTab('Used');
        setFormErrors({});
    };

    const handleStatusTabChange = (tab) => {
        setActiveStatusTab(tab);
        setFormErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [activeTimeTab]: {
                ...prev[activeTimeTab],
                [activeStatusTab]: {
                    ...prev[activeTimeTab][activeStatusTab],
                    [name]: value,
                },
            },
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const form = formState[activeTimeTab][activeStatusTab];
        const errors = {};
        if (!form.administeredTime) {
            errors.administeredTime = 'Vui lòng chọn thời gian.';
        } else {
            const now = new Date();
            const inputTime = new Date(form.administeredTime);
            const timeRange = TIME_OF_DAY_RANGES[activeTimeTab];
            if (timeRange && activeTimeTab !== 'Emergency') {
                const inputHour = inputTime.getHours();
                if (inputHour < timeRange.start || inputHour >= timeRange.end) {
                    const tabLabel = TIME_OF_DAY_LABELS[activeTimeTab]?.label || activeTimeTab;
                    errors.administeredTime = `Thời gian cho uống phải nằm trong khung giờ ${tabLabel} (${timeRange.start}:00 - ${timeRange.end}:00).`;
                }
            }
            if (!errors.administeredTime && inputTime > now) {
                errors.administeredTime = 'Thời gian cho uống không được ở trong tương lai.';
            }
        }
        if (activeStatusTab === 'Used' && !form.dosageUsed.trim()) {
            errors.dosageUsed = 'Vui lòng nhập liều dùng.';
        }
        if ((activeStatusTab === 'Missed' || activeStatusTab === 'Skipped') && !form.note.trim()) {
            errors.note = 'Vui lòng nhập lý do.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const form = formState[activeTimeTab][activeStatusTab];
            const body = {
                status: activeStatusTab,
                dosageUsed: form.dosageUsed,
                note: form.note,
                isMakeupDose: activeTimeTab === 'Emergency',
                administeredTime: form.administeredTime,
            };
            const res = await medicationUsageApi.recordMedicationAdministration(medicationId, body);
            if (!res.success) throw new Error(res.message || 'Có lỗi xảy ra khi ghi nhận việc cho thuốc');
            setAlert({ open: true, type: 'success', title: 'Thành công', message: 'Khai báo uống thuốc thành công!' });
            setTimeout(() => { setAlert({ open: false }); onClose(); onSuccess() }, 1200);
        } catch (err) {
            setAlert({ open: true, type: 'error', title: 'Lỗi', message: err?.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    // Khi truy cập form, nếu không tồn tại thì trả về initialForm mặc định
    const form = (formState[activeTimeTab] && formState[activeTimeTab][activeStatusTab]) ? formState[activeTimeTab][activeStatusTab] : initialForm;

    return (
        <>
            <div
                className="fixed inset-0 flex items-center justify-center z-50 p-2"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
                onClick={onClose}
            >
                <div
                    className="rounded-xl shadow-xl max-w-3xl w-full transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto bg-white border border-gray-100 flex"
                    style={{ backgroundColor: BACKGROUND.DEFAULT, boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex flex-col border-r py-6 px-2 gap-2 bg-gray-50" style={{ width: '180px' }}>
                        {timeTabs.map(tab => {
                            const isDisabled = loading || (tab.key !== 'Emergency' && disabledTabs[tab.key]);
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`flex items-center w-full px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-sm focus:outline-none border ${activeTimeTab === tab.key ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-200'} ${isDisabled ? 'opacity-50 cursor-not-allowed hover:bg-gray-100 hover:border-teal-400' : ''}`}
                                    style={activeTimeTab === tab.key ? { boxShadow: '0 2px 8px 0 rgba(0,128,128,0.08)' } : {}}
                                    onClick={() => !isDisabled && handleTimeTabChange(tab.key)}
                                    disabled={isDisabled}
                                >
                                    {tab.icon}
                                    <span className="ml-2" style={{ whiteSpace: 'nowrap', overflow: 'visible' }}>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between px-14 pt-12 pb-8 border-b" style={{ borderColor: BORDER.LIGHT, background: `linear-gradient(90deg, ${PRIMARY[50]}, ${PRIMARY[100]})` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: PRIMARY[50] }}>
                                    <FiCheckCircle className="w-6 h-6" style={{ color: PRIMARY[500] }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-0.5" style={{ color: TEXT.PRIMARY }}>Khai báo uống thuốc</h3>
                                    <div className="flex flex-col gap-0.5">
                                        {studentName && <span className="text-xs font-medium" style={{ color: TEXT.SECONDARY }}>HS: <span className="font-bold" style={{ color: PRIMARY[600] }}>{studentName}</span></span>}
                                        {medicationName && <span className="text-xs font-medium" style={{ color: TEXT.SECONDARY }}>Thuốc: <span className="font-bold" style={{ color: PRIMARY[600] }}>{medicationName}</span></span>}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:scale-95"
                                style={{ color: GRAY[600] }}
                                disabled={loading}
                                title="Đóng"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex justify-between gap-6 mt-9 px-16">
                            {(activeTimeTab === 'Emergency' ? [STATUS_TABS[0]] : STATUS_TABS).map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-sm focus:outline-none border ${activeStatusTab === tab.key ? 'bg-teal-600 text-white border-teal-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-teal-400'}`}
                                    style={activeStatusTab === tab.key ? { boxShadow: '0 2px 8px 0 rgba(0,128,128,0.08)' } : {}}
                                    onClick={() => handleStatusTabChange(tab.key)}
                                    disabled={loading}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="px-16 pb-10 pt-8 flex flex-col gap-8 flex-1">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {activeStatusTab === 'Used' && (
                                    <div>
                                        <label className="block text-sm font-semibold mb-1" style={{ color: TEXT.PRIMARY }}>
                                            Liều dùng thực tế <span style={{ color: ERROR[500] }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="dosageUsed"
                                            value={form.dosageUsed}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="w-full p-3.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 text-sm shadow-sm"
                                            style={{ borderColor: formErrors.dosageUsed ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                            placeholder="Nhập liều dùng thực tế, VD: 1 viên..."
                                        />
                                        {formErrors.dosageUsed && (
                                            <p className="text-xs mt-1" style={{ color: ERROR[500] }}>{formErrors.dosageUsed}</p>
                                        )}
                                    </div>
                                )}
                                <div className={activeStatusTab === 'Used' ? '' : 'lg:col-span-2'}>
                                    <label className="block text-sm font-semibold mb-1" style={{ color: TEXT.PRIMARY }}>
                                        Thời gian cho uống <span style={{ color: ERROR[500] }}>*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="administeredTime"
                                        value={form.administeredTime}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-full p-3.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 text-sm shadow-sm"
                                        style={{ borderColor: formErrors.administeredTime ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    />
                                    {formErrors.administeredTime && (
                                        <p className="text-xs mt-1" style={{ color: ERROR[500] }}>{formErrors.administeredTime}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1" style={{ color: TEXT.PRIMARY }}>
                                    {activeStatusTab === 'Used' ? 'Ghi chú' : 'Lý do'} {activeStatusTab !== 'Used' && <span style={{ color: ERROR[500] }}>*</span>}
                                </label>
                                <textarea
                                    name="note"
                                    value={form.note}
                                    onChange={handleChange}
                                    disabled={loading}
                                    rows={3}
                                    className="w-full p-3.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 text-sm shadow-sm"
                                    style={{ borderColor: formErrors.note ? ERROR[500] : BORDER.DEFAULT, focusRingColor: PRIMARY[500] + '40' }}
                                    placeholder={activeTimeTab === 'Emergency' ? 'VD: Thuốc gây buồn ngủ nhưng học sinh phải làm kiểm tra' : 'Nhập ghi chú...'}
                                />
                                {formErrors.note && (
                                    <p className="text-xs mt-1" style={{ color: ERROR[500] }}>{formErrors.note}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-5 rounded-lg font-bold text-base transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                                style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, color: TEXT.INVERSE, letterSpacing: 0.5 }}
                            >
                                {loading ? <><ButtonLoading size="small" className="mr-2" /> Đang lưu...</> : 'Xác nhận'}
                            </button>
                        </form>
                    </div>
                </div>
            </div >

            <AlertModal
                isOpen={alert.open}
                onClose={() => setAlert({ ...alert, open: false })}
                title={alert.title}
                message={alert.message}
                type={alert.type}
            />
        </>
    );
};

export default StudentMedicationAdministerModal;