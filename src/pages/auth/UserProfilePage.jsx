import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiEdit3, FiCopy, FiAward, FiSave, FiX, FiBookmark, FiBook } from 'react-icons/fi';
import { PRIMARY, SECONDARY, SUCCESS, TEXT, BACKGROUND, SHADOW, BORDER } from '../../constants/colors';
import { useAuth } from '../../utils/AuthContext';
import authApi from '../../api/authApi';

const UserProfilePage = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
        fullName: "",
        phoneNumber: "",
        address: "",
        gender: "Female", // Default to Female as shown in the API example
        dateOfBirth: "",
        profileImage: null,
        profileImageUrl: null,
        licenseNumber: "",
        specialization: ""
    });

    const [profile, setProfile] = useState(null);

    const fetchProfile = async () => {
        try {
            if (!user?.id) return;
            const response = await authApi.getUserProfile(user.id);
            if (response.success) {
                setProfile(response.data);
                setEditedProfile({
                    fullName: response.data.fullName || '',
                    phoneNumber: response.data.phoneNumber || '',
                    address: response.data.address || '',
                    gender: response.data.gender === 'Male' ? 'Nam' : 'Nữ',
                    dateOfBirth: response.data.dateOfBirth || '',
                    profileImage: null,
                    profileImageUrl: response.data.profileImageUrl || '',
                    licenseNumber: response.data.licenseNumber || '',
                    specialization: response.data.specialization || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user?.id]);

    const handleInputChange = (field, value) => {
        setEditedProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        // Kiểm tra kích thước file (giới hạn 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('Kích thước ảnh không được vượt quá 5MB');
            e.target.value = ''; // Reset input file
            return;
        }

        // Kiểm tra định dạng file
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
            e.target.value = ''; // Reset input file
            return;
        }

        // Kiểm tra kích thước ảnh
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src); // Clean up
            if (img.width < 100 || img.height < 100) {
                alert('Kích thước ảnh quá nhỏ. Yêu cầu tối thiểu 100x100 pixels');
                e.target.value = '';
                return;
            }
            if (img.width > 2000 || img.height > 2000) {
                alert('Kích thước ảnh quá lớn. Yêu cầu tối đa 2000x2000 pixels');
                e.target.value = '';
                return;
            }
        };
        img.src = URL.createObjectURL(file);

        // Tạo URL để preview ảnh
        const previewUrl = URL.createObjectURL(file);

        setEditedProfile(prev => ({
            ...prev,
            profileImage: file,
            profileImageUrl: previewUrl
        }));
    };

    const handleSave = async () => {
        try {
            if (!user?.id) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            // Validate dữ liệu trước khi gửi
            if (!editedProfile.fullName?.trim()) {
                throw new Error('Họ tên không được để trống');
            }

            // Chuẩn bị dữ liệu để gửi lên server
            const formData = new FormData();

            // Luôn gửi các field bắt buộc
            formData.append('FullName', editedProfile.fullName.trim());

            // Gửi các field không bắt buộc với empty value nếu không có giá trị
            formData.append('PhoneNumber', editedProfile.phoneNumber?.trim() || '');
            formData.append('Address', editedProfile.address?.trim() || '');

            // Chuyển đổi giới tính và đảm bảo luôn gửi giá trị
            const apiGender = editedProfile.gender === 'Nam' ? 'Male' : 'Female';
            formData.append('Gender', apiGender);

            // Format date theo đúng ISO string và luôn gửi giá trị
            if (editedProfile.dateOfBirth) {
                const date = new Date(editedProfile.dateOfBirth);
                formData.append('DateOfBirth', date.toISOString());
            } else {
                formData.append('DateOfBirth', new Date().toISOString());
            }

            // Xử lý file ảnh
            if (editedProfile.profileImage instanceof File) {
                formData.append('ProfileImage', editedProfile.profileImage);
            }

            // Gọi API cập nhật
            const response = await authApi.updateProfile(user.id, formData);

            if (!response.success) {
                throw new Error(response.message || 'Cập nhật thất bại');
            }

            // Verify update ngay lập tức
            const verifyResponse = await authApi.getUserProfile(user.id);
            if (!verifyResponse.success) {
                throw new Error('Không thể xác minh dữ liệu sau khi cập nhật');
            }

            // Cập nhật state với dữ liệu mới từ verify response
            setProfile(verifyResponse.data);
            setEditedProfile({
                fullName: verifyResponse.data.fullName || '',
                phoneNumber: verifyResponse.data.phoneNumber || '',
                address: verifyResponse.data.address || '',
                gender: verifyResponse.data.gender === 'Male' ? 'Nam' : 'Nữ',
                dateOfBirth: verifyResponse.data.dateOfBirth || '',
                profileImage: null,
                profileImageUrl: verifyResponse.data.profileImageUrl || '',
                licenseNumber: verifyResponse.data.licenseNumber || '',
                specialization: verifyResponse.data.specialization || ''
            });

            // Hiển thị thông báo thành công
            alert('Cập nhật thông tin thành công!');
            setIsEditing(false);

        } catch (error) {
            alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        }
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

    const baseProfileFields = [
        {
            icon: FiMail,
            label: "Email",
            value: profile?.email,
            color: PRIMARY[500],
            copyable: true,
            description: "Địa chỉ email liên hệ",
            editable: false
        },
        {
            icon: FiPhone,
            label: "Số điện thoại",
            value: profile?.phoneNumber,
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
            value: profile?.address,
            color: SECONDARY[500],
            description: "Nơi cư trú hiện tại",
            editable: true,
            type: "text",
            field: "address"
        },
        {
            icon: FiUser,
            label: "Giới tính",
            value: profile?.gender === 'Male' ? 'Nam' : 'Nữ',
            displayValue: profile?.gender === 'Male' ? 'Nam' : 'Nữ',
            color: PRIMARY[600],
            description: "Thông tin giới tính",
            editable: true,
            type: "select",
            field: "gender",
            options: [
                { value: "Nam", label: "Nam" },
                { value: "Nữ", label: "Nữ" }
            ]
        },
        {
            icon: FiCalendar,
            label: "Ngày sinh",
            value: formatDate(profile?.dateOfBirth),
            displayValue: profile?.dateOfBirth,
            color: SUCCESS[600],
            description: "Ngày tháng năm sinh",
            editable: true,
            type: "date",
            field: "dateOfBirth"
        },
        {
            icon: FiAward,
            label: "Mã nhân viên",
            value: profile?.staffCode,
            color: SECONDARY[600],
            copyable: true,
            description: "Mã định danh nhân viên",
            editable: false
        }
    ];

    const nurseFields = profile?.role?.toLowerCase() === 'schoolnurse' ? [
        {
            icon: FiBookmark,
            label: "Số giấy phép",
            value: profile?.licenseNumber,
            color: SECONDARY[700],
            copyable: true,
            description: "Số giấy phép hành nghề",
            editable: true,
            type: "text",
            field: "licenseNumber"
        },
        {
            icon: FiBook,
            label: "Chuyên môn",
            value: profile?.specialization,
            color: PRIMARY[700],
            description: "Chuyên môn y tế",
            editable: true,
            type: "text",
            field: "specialization"
        }
    ] : [];

    const profileFields = [...baseProfileFields, ...nurseFields];

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

    // Style cho button thay đổi ảnh
    const changeImageButtonStyle = {
        position: 'absolute',
        bottom: '0',
        right: '0',
        backgroundColor: PRIMARY[600],
        color: 'white',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: '3px solid white',
        boxShadow: `0 2px 4px ${SHADOW.MEDIUM}`,
        transition: 'all 0.2s ease-in-out',
    };

    return (
        <div
            className="min-h-screen p-4"
            style={{
                backgroundColor: BACKGROUND.NEUTRAL,
                backgroundImage: `linear-gradient(135deg, ${PRIMARY[25] || '#f8fafc'} 0%, ${BACKGROUND.NEUTRAL} 50%, ${SUCCESS[25] || '#f0fdf4'} 100%)`
            }}
        >
            {!profile ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-xl">Đang tải...</div>
                </div>
            ) : (
                <div className="w-full">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1
                            className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
                            style={{
                                backgroundImage: `linear-gradient(135deg, ${PRIMARY[600]} 0%, ${PRIMARY[500]} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            Thông tin cá nhân
                        </h1>
                        <p
                            className="text-lg"
                            style={{ color: TEXT.SECONDARY }}
                        >
                            {isEditing ? 'Chỉnh sửa thông tin tài khoản của bạn' : 'Quản lý và xem thông tin tài khoản của bạn một cách dễ dàng'}
                        </p>
                    </div>

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
                                            src={editedProfile.profileImageUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                            alt="Profile"
                                            style={avatarStyle}
                                        />
                                        {isEditing && (
                                            <label htmlFor="profile-image" style={changeImageButtonStyle}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = PRIMARY[700];
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = PRIMARY[600];
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    id="profile-image"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    style={{ display: 'none' }}
                                                />
                                                <FiEdit3 size={20} />
                                            </label>
                                        )}
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
                                                Thông tin cá nhân
                                            </h3>
                                            <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                                                {isEditing ? 'Đang chỉnh sửa thông tin' : 'Thông tin chi tiết về tài khoản'}
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
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = PRIMARY[700];
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = PRIMARY[600];
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <FiSave className="mr-2" />
                                                Lưu thay đổi
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
            )}
        </div>
    );
};

export default UserProfilePage;
