import React from 'react';
import {
    FiUsers,
    FiActivity,
    FiCalendar,
    FiTrendingUp,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiSettings,
    FiHome,
    FiMail,
    FiPhone,
    FiSearch,
    FiEdit,
    FiTrash2,
    FiPlus,
    FiMinus,
    FiEye,
    FiEyeOff,
    FiLock,
    FiUnlock,
    FiDownload,
    FiUpload,
    FiX,
    FiCheck
} from "react-icons/fi";
import { PRIMARY, SUCCESS, WARNING, ERROR, INFO, TEXT } from "../constants/colors";

const IconExample = () => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT.PRIMARY }}>
                Cách sử dụng React Icons (Feather Icons)
            </h2>

            {/* Basic Usage */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                    1. Sử dụng cơ bản
                </h3>
                <div className="flex gap-4 items-center">
                    <FiUsers className="h-6 w-6" />
                    <FiActivity className="h-6 w-6" />
                    <FiCalendar className="h-6 w-6" />
                    <FiSettings className="h-6 w-6" />
                </div>
            </div>

            {/* With Colors */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                    2. Với màu sắc từ color system
                </h3>
                <div className="flex gap-4 items-center">
                    <FiUsers className="h-6 w-6" style={{ color: PRIMARY[500] }} />
                    <FiCheckCircle className="h-6 w-6" style={{ color: SUCCESS[500] }} />
                    <FiAlertCircle className="h-6 w-6" style={{ color: WARNING[500] }} />
                    <FiX className="h-6 w-6" style={{ color: ERROR[500] }} />
                    <FiClock className="h-6 w-6" style={{ color: INFO[500] }} />
                </div>
            </div>

            {/* Different Sizes */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                    3. Kích thước khác nhau
                </h3>
                <div className="flex gap-4 items-center">
                    <FiHome className="h-4 w-4" style={{ color: PRIMARY[500] }} />
                    <FiHome className="h-6 w-6" style={{ color: PRIMARY[500] }} />
                    <FiHome className="h-8 w-8" style={{ color: PRIMARY[500] }} />
                    <FiHome className="h-12 w-12" style={{ color: PRIMARY[500] }} />
                </div>
            </div>

            {/* In Buttons */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                    4. Trong buttons
                </h3>
                <div className="flex gap-4 flex-wrap">
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: PRIMARY[500] }}
                    >
                        <FiPlus className="h-4 w-4" />
                        Thêm mới
                    </button>

                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: SUCCESS[500] }}
                    >
                        <FiCheck className="h-4 w-4" />
                        Xác nhận
                    </button>

                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: ERROR[500] }}
                    >
                        <FiTrash2 className="h-4 w-4" />
                        Xóa
                    </button>

                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                        style={{ borderColor: PRIMARY[300], color: PRIMARY[600] }}
                    >
                        <FiEdit className="h-4 w-4" />
                        Chỉnh sửa
                    </button>
                </div>
            </div>

            {/* In Cards */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                    5. Trong cards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div
                                className="p-3 rounded-full mr-4"
                                style={{ backgroundColor: PRIMARY[50] }}
                            >
                                <FiUsers className="h-6 w-6" style={{ color: PRIMARY[500] }} />
                            </div>
                            <div>
                                <h4 className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                    Người dùng
                                </h4>
                                <p className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    1,248
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div
                                className="p-3 rounded-full mr-4"
                                style={{ backgroundColor: SUCCESS[50] }}
                            >
                                <FiTrendingUp className="h-6 w-6" style={{ color: SUCCESS[500] }} />
                            </div>
                            <div>
                                <h4 className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                    Doanh thu
                                </h4>
                                <p className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    $42.5K
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div
                                className="p-3 rounded-full mr-4"
                                style={{ backgroundColor: WARNING[50] }}
                            >
                                <FiActivity className="h-6 w-6" style={{ color: WARNING[500] }} />
                            </div>
                            <div>
                                <h4 className="font-semibold" style={{ color: TEXT.PRIMARY }}>
                                    Hoạt động
                                </h4>
                                <p className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                    85%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Icons */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                    6. Trong form
                </h3>
                <div className="space-y-4 max-w-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiPhone className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                        </div>
                        <input
                            type="tel"
                            placeholder="Số điện thoại"
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiLock className="h-4 w-4" style={{ color: PRIMARY[400] }} />
                        </div>
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Icon List */}
            <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                    7. Danh sách các icon phổ biến
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { icon: FiHome, name: "FiHome" },
                        { icon: FiUsers, name: "FiUsers" },
                        { icon: FiActivity, name: "FiActivity" },
                        { icon: FiCalendar, name: "FiCalendar" },
                        { icon: FiSettings, name: "FiSettings" },
                        { icon: FiMail, name: "FiMail" },
                        { icon: FiPhone, name: "FiPhone" },
                        { icon: FiSearch, name: "FiSearch" },
                        { icon: FiEdit, name: "FiEdit" },
                        { icon: FiTrash2, name: "FiTrash2" },
                        { icon: FiPlus, name: "FiPlus" },
                        { icon: FiMinus, name: "FiMinus" },
                        { icon: FiEye, name: "FiEye" },
                        { icon: FiEyeOff, name: "FiEyeOff" },
                        { icon: FiLock, name: "FiLock" },
                        { icon: FiUnlock, name: "FiUnlock" },
                        { icon: FiDownload, name: "FiDownload" },
                        { icon: FiUpload, name: "FiUpload" },
                        { icon: FiCheck, name: "FiCheck" },
                        { icon: FiX, name: "FiX" },
                        { icon: FiCheckCircle, name: "FiCheckCircle" },
                        { icon: FiAlertCircle, name: "FiAlertCircle" },
                        { icon: FiClock, name: "FiClock" },
                        { icon: FiTrendingUp, name: "FiTrendingUp" }
                    ].map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <div key={index} className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <IconComponent className="h-6 w-6 mb-2" style={{ color: PRIMARY[500] }} />
                                <span className="text-xs text-center" style={{ color: TEXT.SECONDARY }}>
                                    {item.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default IconExample; 