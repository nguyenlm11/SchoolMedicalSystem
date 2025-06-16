import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiEdit3, FiCopy, FiAward, FiSave, FiX, FiHeart, FiBookmark } from 'react-icons/fi';
import { PRIMARY, SECONDARY, SUCCESS, TEXT, BACKGROUND, SHADOW, BORDER } from '../../constants/colors';
import Loading from '../../components/Loading';
import userApi from '../../api/userApi';
import AlertModal from '../../components/modal/AlertModal';

const StaffProfilePage = () => {
    const { id } = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("success");
    const [editedProfile, setEditedProfile] = useState({
        fullName: "",
        phoneNumber: "",
        address: "",
        gender: "",
        dateOfBirth: "",
        profileImageUrl: null,
        staffCode: "",
        licenseNumber: "",
        specialization: ""
    });

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchStaffProfile();
    }, [id]);

    const fetchStaffProfile = async () => {
        try {
            setLoading(true);
            const response = await userApi.getStaffProfile(id);

            if (response.success) {
                const staffData = response.data;
                setProfile(staffData);
                setEditedProfile({
                    fullName: staffData.fullName,
                    phoneNumber: staffData.phoneNumber,
                    address: staffData.address,
                    gender: staffData.gender,
                    dateOfBirth: staffData.dateOfBirth,
                    profileImageUrl: staffData.profileImageUrl,
                    staffCode: staffData.staffCode,
                    licenseNumber: staffData.licenseNumber || "",
                    specialization: staffData.specialization || ""
                });
            } else {
                console.error('Error fetching staff profile:', response.message);
            }
        } catch (error) {
            console.error('Error fetching staff profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditedProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Chuẩn bị dữ liệu cơ bản cho cả manager và nurse
            const updateData = {
                fullName: editedProfile.fullName,
                phoneNumber: editedProfile.phoneNumber,
                address: editedProfile.address,
                gender: editedProfile.gender,
                dateOfBirth: new Date(editedProfile.dateOfBirth).toISOString(), // Chuyển đổi sang định dạng ISO
                staffCode: editedProfile.staffCode
            };

            // Thêm các trường bổ sung cho y tá trường học
            if (profile.role === 'SCHOOLNURSE') {
                const nurseData = {
                    ...updateData,
                    licenseNumber: editedProfile.licenseNumber,
                    specialization: editedProfile.specialization
                };
                const response = await userApi.updateSchoolNurse(id, nurseData);
                handleUpdateResponse(response);
            } else {
                // Gọi API cập nhật cho manager
                const response = await userApi.updateManager(id, updateData);
                handleUpdateResponse(response);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setAlertType("error");
            setAlertMessage("Có lỗi xảy ra khi cập nhật thông tin!");
            setAlertModalOpen(true);
        } finally {
            setSaving(false);
        }
    };

    // Hàm xử lý response từ API
    const handleUpdateResponse = (response) => {
        if (response.success) {
            setAlertType("success");
            setAlertMessage("Cập nhật thông tin thành công!");
            setIsEditing(false);
            fetchStaffProfile(); // Refresh lại dữ liệu
        } else {
            setAlertType("error");
            setAlertMessage(response.message || "Có lỗi xảy ra khi cập nhật thông tin!");
        }
        setAlertModalOpen(true);
    };

    // Style cho các trường có thể edit
    const editableFieldStyle = isEditing ? {
        border: `1px solid ${PRIMARY[200]}`,
        borderRadius: '0.75rem',
        padding: '0.875rem 1rem',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        backgroundColor: 'white',
        width: '100%',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: `0 2px 4px ${SHADOW.LIGHT}`,
    } : {
        border: `1px solid ${PRIMARY[100]}`,
        borderRadius: '0.75rem',
        padding: '0.875rem 1rem',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        width: '100%',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        ':hover': {
            backgroundColor: PRIMARY[50],
            border: `1px solid ${PRIMARY[300]}`,
            boxShadow: `0 2px 4px ${SHADOW.LIGHT}`,
        }
    };

    // Style cho các trường không thể edit
    const nonEditableFieldStyle = {
        padding: '0.875rem 1rem',
        backgroundColor: BACKGROUND.NEUTRAL,
        borderRadius: '0.75rem',
        width: '100%',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${BORDER.DEFAULT}`,
        opacity: 0.85,
    };

    const inputStyle = {
        border: `1px solid ${PRIMARY[200]}`,
        borderRadius: '0.75rem',
        padding: '0.875rem 1rem',
        width: '100%',
        minHeight: '48px',
        outline: 'none',
        backgroundColor: 'white',
        fontSize: '0.95rem',
        color: TEXT.PRIMARY,
        transition: 'all 0.2s ease-in-out',
        boxShadow: `0 2px 4px ${SHADOW.LIGHT}`,
        '::placeholder': {
            color: TEXT.SECONDARY,
        },
        ':focus': {
            border: `1.5px solid ${PRIMARY[400]}`,
            boxShadow: `0 0 0 3px ${PRIMARY[100]}`,
        },
        ':hover': {
            border: `1px solid ${PRIMARY[300]}`,
        }
    };

    const labelStyle = {
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '0.5rem',
        color: TEXT.SECONDARY,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    const iconStyle = {
        color: PRIMARY[500],
        width: '18px',
        height: '18px',
    };

    const formatDate = (dateString) => {
        if (isEditing) return dateString.split('T')[0];
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading || !profile) {
        return (
            <div className="h-screen flex justify-center items-center">
                <Loading type="medical" size="large" color="primary" text="Đang tải thông tin nhân viên..." />
            </div>
        );
    }

    const profileFields = [
        {
            icon: FiMail,
            label: "Email",
            value: profile.email,
            color: PRIMARY[500],
            copyable: true,
            description: "Địa chỉ email liên hệ",
            editable: false
        },
        {
            icon: FiPhone,
            label: "Số điện thoại",
            value: profile.phoneNumber,
            color: SUCCESS[500],
            copyable: true,
            description: "Số điện thoại liên hệ",
            editable: true,
            type: "tel",
            field: "phoneNumber"
        },
        {
            icon: FiMapPin,
            label: "Địa chỉ",
            value: profile.address,
            color: SECONDARY[500],
            description: "Nơi cư trú hiện tại",
            editable: true,
            type: "text",
            field: "address"
        },
        {
            icon: FiUser,
            label: "Giới tính",
            value: profile.gender === 'Male' ? 'Nam' : 'Nữ',
            displayValue: profile.gender,
            color: PRIMARY[600],
            description: "Thông tin giới tính",
            editable: true,
            type: "select",
            field: "gender",
            options: [
                { value: "Male", label: "Nam" },
                { value: "Female", label: "Nữ" }
            ]
        },
        {
            icon: FiCalendar,
            label: "Ngày sinh",
            value: formatDate(profile.dateOfBirth),
            displayValue: profile.dateOfBirth,
            color: SUCCESS[600],
            description: "Ngày tháng năm sinh",
            editable: true,
            type: "date",
            field: "dateOfBirth"
        },
        {
            icon: FiAward,
            label: "Mã nhân viên",
            value: profile.staffCode,
            color: SECONDARY[600],
            copyable: true,
            description: "Mã định danh nhân viên",
            editable: true,
            type: "text",
            field: "staffCode"
        },
        ...(profile.role === 'SCHOOLNURSE' ? [
            {
                icon: FiHeart,
                label: "Số giấy phép",
                value: profile.licenseNumber,
                color: PRIMARY[500],
                copyable: true,
                description: "Số giấy phép hành nghề",
                editable: true,
                type: "text",
                field: "licenseNumber"
            },
            {
                icon: FiBookmark,
                label: "Chuyên môn",
                value: profile.specialization,
                color: SUCCESS[500],
                description: "Chuyên môn y tế",
                editable: true,
                type: "text",
                field: "specialization"
            }
        ] : [])
    ];

    const renderFieldValue = (field) => {
        if (!field.editable || !isEditing) {
            return (
                <p
                    className="text-lg font-bold break-all mb-2"
                    style={{ color: TEXT.PRIMARY }}
                >
                    {field.value}
                </p>
            );
        }

        switch (field.type) {
            case 'select':
                return (
                    <select
                        value={editedProfile[field.field]}
                        onChange={(e) => handleInputChange(field.field, e.target.value)}
                        style={inputStyle}
                        className="w-full"
                    >
                        {field.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={editedProfile[field.field].split('T')[0]}
                        onChange={(e) => handleInputChange(field.field, e.target.value)}
                        style={inputStyle}
                        className="w-full"
                    />
                );
            default:
                return (
                    <input
                        type={field.type}
                        value={editedProfile[field.field]}
                        onChange={(e) => handleInputChange(field.field, e.target.value)}
                        style={inputStyle}
                        className="w-full"
                    />
                );
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Có thể thêm toast notification ở đây
    };

    // Style cho avatar container
    const avatarContainerStyle = {
        position: 'relative',
        width: '150px',
        height: '150px',
        margin: '0 auto 2rem auto',
    };

    // Style cho avatar
    const avatarStyle = {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: `3px solid ${PRIMARY[100]}`,
        padding: '3px',
        backgroundColor: 'white',
    };

    return (
        <div
            className="min-h-screen p-4"
            style={{
                backgroundColor: BACKGROUND.NEUTRAL,
                backgroundImage: `linear-gradient(135deg, ${PRIMARY[25] || '#f8fafc'} 0%, ${BACKGROUND.NEUTRAL} 50%, ${SUCCESS[25] || '#f0fdf4'} 100%)`
            }}
        >
            <div className="w-full">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Profile Card */}
                    <div className="lg:col-span-3">
                        <div
                            className="bg-white rounded-3xl shadow-xl p-8 text-center relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full"
                            style={{
                                boxShadow: `0 25px 50px -12px ${SHADOW.MEDIUM}`,
                                background: `linear-gradient(135deg, white 0%, ${PRIMARY[25] || '#f8fafc'} 100%)`
                            }}
                        >

                            {/* Avatar */}
                            <div className="relative mb-8">
                                <div style={avatarContainerStyle}>
                                    <img
                                        src={profile.profileImageUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                        alt="Profile"
                                        style={avatarStyle}
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    style={inputStyle}
                                    className="w-full text-ellipsis"
                                />
                            ) : (
                                <h2
                                    className="text-3xl lg:text-4xl font-bold mb-3"
                                    style={{ color: TEXT.PRIMARY }}
                                >
                                    {profile.fullName}
                                </h2>
                            )}
                            <p
                                className="text-xl mb-8 font-medium"
                                style={{ color: TEXT.SECONDARY }}
                            >
                                @{profile.username}
                            </p>

                            {/* Role Badge */}
                            <div className="mb-8">
                                <div
                                    className="inline-flex items-center px-8 py-4 rounded-2xl shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                        color: 'white'
                                    }}
                                >
                                    <FiShield className="w-6 h-6 mr-3" />
                                    <span className="font-bold text-lg">{profile.role}</span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mb-8">
                                <div
                                    className="inline-flex items-center px-6 py-3 rounded-full"
                                    style={{
                                        backgroundColor: profile.isActive ? SUCCESS[50] : SECONDARY[50],
                                        color: profile.isActive ? SUCCESS[700] : SECONDARY[700],
                                        border: `2px solid ${profile.isActive ? SUCCESS[200] : SECONDARY[200]}`
                                    }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full mr-3"
                                        style={{ backgroundColor: profile.isActive ? SUCCESS[500] : SECONDARY[500] }}
                                    />
                                    <span className="font-semibold text-base">
                                        {profile.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="lg:col-span-9">
                        <div
                            className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500 h-full"
                            style={{
                                boxShadow: `0 25px 50px -12px ${SHADOW.MEDIUM}`,
                                background: `linear-gradient(135deg, white 0%, ${SUCCESS[25] || '#f0fdf4'} 100%)`
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100">
                                <div className="flex items-center">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shadow-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                            color: 'white'
                                        }}
                                    >
                                        <FiUser className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3
                                            className="text-3xl font-bold"
                                            style={{ color: TEXT.PRIMARY }}
                                        >
                                            Thông tin nhân viên
                                        </h3>
                                        <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                                            {isEditing ? 'Đang chỉnh sửa thông tin' : 'Thông tin chi tiết về nhân viên'}
                                        </p>
                                    </div>
                                </div>
                                {isEditing ? (
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="group flex items-center px-6 py-3 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 bg-white"
                                            style={{
                                                color: TEXT.SECONDARY,
                                                border: `2px solid ${TEXT.SECONDARY}`
                                            }}
                                            disabled={saving}
                                        >
                                            <FiX className="w-5 h-5 mr-2" />
                                            <span className="font-semibold">Hủy</span>
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex items-center px-5 py-2.5 rounded-xl text-white transition-all duration-200 font-medium"
                                            style={{
                                                backgroundColor: PRIMARY[600],
                                                boxShadow: `0 2px 4px ${SHADOW.LIGHT}`,
                                                opacity: saving ? 0.7 : 1,
                                                cursor: saving ? 'not-allowed' : 'pointer'
                                            }}
                                            disabled={saving}
                                            onMouseEnter={(e) => {
                                                if (!saving) {
                                                    e.currentTarget.style.backgroundColor = PRIMARY[700];
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!saving) {
                                                    e.currentTarget.style.backgroundColor = PRIMARY[600];
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }
                                            }}
                                        >
                                            <FiSave className="mr-2" />
                                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="group flex items-center px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                                        style={{
                                            background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`,
                                            color: 'white'
                                        }}
                                    >
                                        <FiEdit3 className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                                        <span className="font-semibold text-base">Chỉnh sửa</span>
                                    </button>
                                )}
                            </div>

                            {/* Profile Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
                                {profileFields.map((field, index) => {
                                    const IconComponent = field.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="group relative p-8 rounded-2xl border border-transparent hover:border-opacity-30 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                            style={{
                                                background: `linear-gradient(135deg, ${field.color}08 0%, ${field.color}05 100%)`,
                                                borderColor: `${field.color}20`
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = `${field.color}40`;
                                                e.currentTarget.style.background = `linear-gradient(135deg, ${field.color}15 0%, ${field.color}08 100%)`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = `${field.color}20`;
                                                e.currentTarget.style.background = `linear-gradient(135deg, ${field.color}08 0%, ${field.color}05 100%)`;
                                            }}
                                        >
                                            <div className="flex items-start space-x-5">
                                                <div
                                                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${field.color} 0%, ${field.color}CC 100%)`,
                                                        color: 'white'
                                                    }}
                                                >
                                                    <IconComponent className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p
                                                            className="text-sm font-bold uppercase tracking-wider mb-2"
                                                            style={{ color: field.color }}
                                                        >
                                                            {field.label}
                                                        </p>
                                                        {!isEditing && field.copyable && (
                                                            <button
                                                                onClick={() => copyToClipboard(field.value)}
                                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-110 ml-2"
                                                                style={{
                                                                    backgroundColor: 'white',
                                                                    color: field.color,
                                                                    boxShadow: `0 4px 12px ${field.color}20`
                                                                }}
                                                            >
                                                                <FiCopy className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {renderFieldValue(field)}
                                                    <p
                                                        className="text-sm"
                                                        style={{ color: TEXT.SECONDARY }}
                                                    >
                                                        {field.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModalOpen}
                onClose={() => setAlertModalOpen(false)}
                title={alertType === "success" ? "Thành công" : "Lỗi"}
                message={alertMessage}
                type={alertType}
            />
        </div>
    );
};

export default StaffProfilePage;
