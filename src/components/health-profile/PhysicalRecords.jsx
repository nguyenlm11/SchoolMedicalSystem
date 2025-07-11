import React from 'react';
import { PRIMARY, TEXT, GRAY } from '../../constants/colors';
import { FiBarChart2, FiActivity, FiFileText } from 'react-icons/fi';

const BMIStatus = ({ bmi }) => {
    let status = '';
    let color = '';
    if (bmi < 18.5) {
        status = 'Thiếu cân';
        color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
    } else if (bmi >= 18.5 && bmi < 25) {
        status = 'Bình thường';
        color = 'text-green-600 bg-green-50 border-green-200';
    } else if (bmi >= 25 && bmi < 30) {
        status = 'Thừa cân';
        color = 'text-orange-600 bg-orange-50 border-orange-200';
    } else {
        status = 'Béo phì';
        color = 'text-red-600 bg-red-50 border-red-200';
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
            {status}
        </span>
    );
};

const PhysicalRecords = ({ records = [] }) => {
    const sortedRecords = Array.isArray(records) ? [...records].sort((a, b) =>
        new Date(b.checkDate) - new Date(a.checkDate)
    ) : [];

    const latestRecord = sortedRecords[0];
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                    <span className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
                        <FiBarChart2 className="h-6 w-6" />
                    </span>
                    Chỉ số thể chất
                </h2>
            </div>

            {!records || sortedRecords.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 border shadow-sm text-center" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
                    <p className="text-lg" style={{ color: TEXT.SECONDARY }}>Chưa có dữ liệu chỉ số thể chất</p>
                </div>
            ) : latestRecord && (
                <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                            Chỉ số mới nhất
                            <span className="ml-2 text-sm font-normal" style={{ color: TEXT.SECONDARY }}>
                                (Ngày kiểm tra: {new Date(latestRecord.checkDate).toLocaleDateString('vi-VN')})
                            </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Chiều cao</p>
                                    <FiBarChart2 className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                </div>
                                <p className="mt-2 text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>{latestRecord.height}</p>
                                <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Cm</p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Cân nặng</p>
                                    <FiActivity className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                </div>
                                <p className="mt-2 text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>{latestRecord.weight}</p>
                                <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Kg</p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>BMI</p>
                                    <FiBarChart2 className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                </div>
                                <p className="mt-2 text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>{latestRecord.bmi.toFixed(1)}</p>
                                <div className="mt-1">
                                    <BMIStatus bmi={latestRecord.bmi} />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium" style={{ color: TEXT.SECONDARY }}>Ghi chú</p>
                                    <FiFileText className="h-5 w-5" style={{ color: PRIMARY[500] }} />
                                </div>
                                <p className="mt-2 text-base font-medium" style={{ color: TEXT.PRIMARY }}>{latestRecord.comments || "Không có ghi chú"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t" style={{ borderColor: GRAY[200] }}>
                        <h3 className="text-lg font-semibold my-4" style={{ color: TEXT.PRIMARY }}>Lịch sử theo dõi</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y" style={{ borderColor: GRAY[200] }}>
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            Ngày kiểm tra
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            Chiều cao(cm)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            Cân nặng(kg)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: TEXT.SECONDARY }}>
                                            BMI
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y" style={{ borderColor: GRAY[200] }}>
                                    {sortedRecords.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {new Date(record.checkDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {record.height}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {record.weight}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold" style={{ color: TEXT.PRIMARY }}>
                                                <div className="flex items-center space-x-2 justify-center">
                                                    <span>{record.bmi.toFixed(1)}</span>
                                                    <BMIStatus bmi={record.bmi} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhysicalRecords; 