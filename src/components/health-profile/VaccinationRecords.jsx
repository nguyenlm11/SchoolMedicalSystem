import React, { useState } from 'react';
import { PRIMARY, TEXT, COMMON } from '../../constants/colors';
import { FiShield, FiCalendar, FiCheckCircle, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../utils/AuthContext';
import AddVaccinationModal from '../modal/AddVaccinationModal';

const VaccinationRecords = ({ records = [], onVaccinationAdded, medicalRecordId }) => {
    const { user } = useAuth();
    const canAddVaccination = user.role === 'parent';
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddVaccination = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleVaccinationAdded = () => {
        onVaccinationAdded && onVaccinationAdded();
    };

    const groupedVaccines = records.reduce((acc, record) => {
        const key = `${record.vaccinationTypeId}-${record.vaccinationTypeName}`;
        if (!acc[key]) {
            acc[key] = {
                vaccinationTypeId: record.vaccinationTypeId,
                vaccinationTypeName: record.vaccinationTypeName,
                totalDoses: 0,
                latestDate: null,
                records: []
            };
        }
        acc[key].totalDoses += 1;
        acc[key].records.push(record);

        const currentDate = new Date(record.administeredDate);
        if (!acc[key].latestDate || currentDate > new Date(acc[key].latestDate)) {
            acc[key].latestDate = record.administeredDate;
        }
        return acc;
    }, {});

    const vaccineList = Object.values(groupedVaccines).sort((a, b) =>
        new Date(b.latestDate) - new Date(a.latestDate)
    );

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                        <span className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
                            <FiShield className="h-6 w-6" />
                        </span>
                        Lịch sử tiêm chủng
                    </h2>
                    {canAddVaccination && (
                        <button
                            onClick={handleAddVaccination}
                            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                            style={{ backgroundColor: PRIMARY[600], color: COMMON.WHITE, border: `1px solid ${PRIMARY[600]}` }}
                        >
                            <FiPlus className="h-4 w-4 mr-1" /> Thêm
                        </button>
                    )}
                </div>

                {(!records || records.length === 0) ? (
                    <div className="bg-white rounded-2xl p-8 border shadow-sm text-center"
                        style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                style={{ backgroundColor: PRIMARY[100] }}>
                                <FiShield className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                            </div>
                            <p className="text-lg font-medium" style={{ color: TEXT.SECONDARY }}>
                                Chưa có thông tin tiêm chủng
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                        style={{ borderColor: PRIMARY[200] }}>
                        <div className="px-6 py-4 border-b" style={{ borderColor: PRIMARY[100], backgroundColor: PRIMARY[25] }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                                        style={{ backgroundColor: PRIMARY[100] }}>
                                        <FiShield className="h-5 w-5" style={{ color: PRIMARY[600] }} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>
                                            Danh sách vaccine đã tiêm
                                        </h3>
                                        <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                            Tổng cộng {vaccineList.length} loại vaccine
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {vaccineList.map((vaccine, index) => {
                                    const latestDate = new Date(vaccine.latestDate).toLocaleDateString('vi-VN');
                                    return (
                                        <div key={`${vaccine.vaccinationTypeId}-${index}`}
                                            className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                                            style={{ borderColor: PRIMARY[100], backgroundColor: PRIMARY[25] }}>
                                            <div className="flex items-center flex-1">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4"
                                                    style={{ backgroundColor: PRIMARY[100] }}>
                                                    <FiCheckCircle className="h-4 w-4" style={{ color: PRIMARY[600] }} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-base" style={{ color: TEXT.PRIMARY }}>
                                                        {vaccine.vaccinationTypeName}
                                                    </h4>
                                                    <div className="flex items-center mt-1">
                                                        <FiCalendar className="h-3 w-3 mr-1" style={{ color: PRIMARY[500] }} />
                                                        <span className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                            Mũi cuối: {latestDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="px-3 py-1 rounded-full text-sm font-medium"
                                                    style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                                    {vaccine.totalDoses} mũi
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AddVaccinationModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSave={handleVaccinationAdded}
                medicalRecordId={medicalRecordId}
            />
        </>
    );
};

export default VaccinationRecords;