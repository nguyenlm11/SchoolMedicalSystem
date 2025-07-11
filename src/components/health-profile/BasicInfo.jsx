import React from 'react';
import { PRIMARY, TEXT, GRAY } from '../../constants/colors';
import { FiUser, FiMail, FiPhone, FiAlertTriangle } from 'react-icons/fi';

const InfoField = ({ label, value }) => (
    <div className="bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-md" style={{ borderColor: GRAY[200] }}>
        <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>{label}</p>
        <p className="text-lg font-semibold" style={{ color: TEXT.PRIMARY }}>{value || "Chưa cập nhật"}</p>
    </div>
);

const BasicInfo = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                    <span className="flex items-center justify-center rounded-full w-12 h-12 mr-4 text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${PRIMARY[400]} 0%, ${PRIMARY[600]} 100%)` }}>
                        <FiUser className="h-6 w-6" />
                    </span>
                    Thông tin cơ bản học sinh
                </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[25] }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoField label="Họ và tên học sinh" value={data.studentName} />
                    <InfoField label="Mã học sinh" value={data.studentCode} />
                    <InfoField label="Nhóm máu" value={data.bloodType} />
                </div>

                <div className="mt-6 p-4 rounded-xl bg-white border" style={{ borderColor: GRAY[200] }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>Thông tin liên hệ khẩn cấp</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>Email liên hệ</p>
                            <p className="text-base font-semibold flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiMail className="h-5 w-5 mr-2" style={{ color: PRIMARY[500] }} />
                                {data.emergencyContact}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1" style={{ color: TEXT.SECONDARY }}>Số điện thoại</p>
                            <p className="text-base font-semibold flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiPhone className="h-5 w-5 mr-2" style={{ color: PRIMARY[500] }} />
                                {data.emergencyContactPhone}
                            </p>
                        </div>
                    </div>
                </div>

                {data.needsUpdate && (
                    <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                        <div className="flex items-center">
                            <FiAlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                            <p className="text-sm font-medium text-yellow-800">
                                Hồ sơ cần được cập nhật thông tin mới
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BasicInfo; 