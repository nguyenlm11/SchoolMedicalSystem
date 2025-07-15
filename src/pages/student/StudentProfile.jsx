import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiAward, FiShield, FiHeart, FiBookOpen, FiEdit3, FiSave, FiX, FiAlertCircle } from 'react-icons/fi';
import { PRIMARY, SECONDARY, SUCCESS, ERROR, TEXT, BACKGROUND, SHADOW, COMMON } from '../../constants/colors';
import Loading from '../../components/Loading';
import authApi from '../../api/authApi';
import { useAuth } from '../../utils/AuthContext';
import AlertModal from '../../components/modal/AlertModal';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'info', title: '', message: '' });
    const [editedProfile, setEditedProfile] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        gender: 'Female',
        dateOfBirth: '',
        profileImage: null,
        profileImageUrl: null,
    });
    const { user } = useAuth();

    const fetchStudentProfile = async () => {
        try {
            setLoading(true);
            const response = await authApi.getStudentProfile(user.id);
            if (response.success && response.data) {
                setProfile(response.data);
                setEditedProfile({
                    fullName: response.data.fullName || '',
                    phoneNumber: response.data.phoneNumber || '',
                    address: response.data.address || '',
                    gender: response.data.gender === 'Male' ? 'Male' : 'Female',
                    dateOfBirth: response.data.dateOfBirth || '',
                    profileImage: null,
                    profileImageUrl: response.data.profileImageUrl || ''
                });
            } else {
                showAlertMessage('error', 'Lỗi', response.message || 'Không thể tải thông tin học sinh');
            }
        } catch (error) {
            showAlertMessage('error', 'Lỗi', 'Có lỗi xảy ra khi tải thông tin học sinh');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentProfile();
    }, []);

    const showAlertMessage = (type, title, message) => {
        setAlertConfig({ type, title, message });
        setShowAlert(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getGenderLabel = (gender) => {
        return gender === 'Male' ? 'Nam' : gender === 'Female' ? 'Nữ' : 'Chưa cập nhật';
    };

    const getRelationshipLabel = (relationship) => {
        const labels = {
            Mother: 'Mẹ',
            Father: 'Bố',
            Guardian: 'Người giám hộ',
            Other: 'Khác',
        };
        return labels[relationship] || relationship || 'Chưa cập nhật';
    };

    const handleInputChange = (field, value) => {
        setEditedProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('Kích thước ảnh không được vượt quá 5MB');
            e.target.value = '';
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
            e.target.value = '';
            return;
        }
        setEditedProfile(prev => ({
            ...prev,
            profileImage: file,
            profileImageUrl: URL.createObjectURL(file)
        }));
    };

    const handleSave = async () => {
        try {
            setSaveLoading(true);
            if (!profile?.id) throw new Error('Không tìm thấy thông tin học sinh');
            const formData = new FormData();
            formData.append('FullName', editedProfile.fullName.trim());
            formData.append('PhoneNumber', editedProfile.phoneNumber?.trim() || '');
            formData.append('Address', editedProfile.address?.trim() || '');
            formData.append('Gender', editedProfile.gender);
            formData.append('DateOfBirth', editedProfile.dateOfBirth ? new Date(editedProfile.dateOfBirth).toISOString() : new Date().toISOString());
            if (editedProfile.profileImage instanceof File) {
                formData.append('ProfileImage', editedProfile.profileImage);
            }
            const response = await authApi.updateProfile(profile.id, formData, 'student');
            if (!response.success) throw new Error(response.message || 'Cập nhật thất bại');
            const verifyResponse = await authApi.getStudentProfile(profile.id);
            if (!verifyResponse.success) throw new Error('Không thể xác minh dữ liệu sau khi cập nhật');
            setProfile(verifyResponse.data);
            setEditedProfile({
                fullName: verifyResponse.data.fullName || '',
                phoneNumber: verifyResponse.data.phoneNumber || '',
                address: verifyResponse.data.address || '',
                gender: verifyResponse.data.gender === 'Male' ? 'Male' : 'Female',
                dateOfBirth: verifyResponse.data.dateOfBirth?.split('T')[0] || '',
                profileImage: null,
                profileImageUrl: verifyResponse.data.profileImageUrl || ''
            });
            showAlertMessage('success', 'Thành công', 'Thông tin đã được cập nhật thành công!');
            setIsEditing(false);
        } catch (error) {
            showAlertMessage('error', 'Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setSaveLoading(false);
        }
    };

    const resetEditedProfile = () => ({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        gender: profile.gender === 'Male' ? 'Male' : 'Female',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        profileImage: null,
        profileImageUrl: profile.profileImageUrl || ''
    });

    const handleCancel = () => {
        setEditedProfile(resetEditedProfile());
        setIsEditing(false);
    };

    const handleStartEdit = () => {
        setEditedProfile(resetEditedProfile());
        setIsEditing(true);
    };

    const avatarContainerStyle = {
        position: 'relative',
        width: '150px',
        height: '150px',
        margin: '0 auto 2rem auto',
    };

    const avatarStyle = {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: `3px solid ${PRIMARY[100]}`,
        padding: '3px',
        backgroundColor: 'white',
    };

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
        boxShadow: `0 2px 4px ${SHADOW.LIGHT}`
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <Loading type="medical" size="large" color="primary" text="Đang tải thông tin..." />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <FiAlertCircle className="mx-auto h-12 w-12 mb-4" style={{ color: ERROR[500] }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: TEXT.PRIMARY }}>
                        Không tìm thấy thông tin
                    </h3>
                    <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                        Không thể tải thông tin học sinh
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen p-4"
            style={{
                backgroundColor: BACKGROUND.NEUTRAL,
                backgroundImage: `linear-gradient(135deg, ${PRIMARY[25] || '#f8fafc'} 0%, ${BACKGROUND.NEUTRAL} 50%, ${SUCCESS[25] || '#f0fdf4'} 100%)`,
            }}
        >
            <div className="w-full">
                <div className="text-center mb-10">
                    <h1
                        className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
                        style={{
                            backgroundImage: `linear-gradient(135deg, ${PRIMARY[600]} 0%, ${PRIMARY[500]} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Thông tin học sinh
                    </h1>
                    <p className="text-lg" style={{ color: TEXT.SECONDARY }}>
                        Quản lý và xem thông tin học sinh một cách dễ dàng
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-3">
                        <div
                            className="bg-white rounded-3xl shadow-xl p-8 text-center relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full"
                            style={{
                                boxShadow: `0 25px 50px -12px ${SHADOW.MEDIUM}`,
                                background: `linear-gradient(135deg, white 0%, ${PRIMARY[25] || '#f8fafc'} 100%)`,
                            }}
                        >
                            <div className="relative mb-8">
                                <div style={avatarContainerStyle}>
                                    <img
                                        src={
                                            isEditing
                                                ? (editedProfile.profileImageUrl || profile.profileImageUrl)
                                                : (profile.profileImageUrl)
                                        }
                                        alt="Profile"
                                        style={avatarStyle}
                                    />
                                    {isEditing && (
                                        <label htmlFor="profile-image" style={changeImageButtonStyle}>
                                            <input
                                                type="file"
                                                id="profile-image"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={handleImageChange}
                                            />
                                            <FiEdit3 size={20} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <h2 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: TEXT.PRIMARY }}>
                                {profile.fullName}
                            </h2>
                            <p className="text-xl mb-8 font-medium" style={{ color: TEXT.SECONDARY }}>
                                @{profile.username}
                            </p>

                            <div className="mb-8">
                                <div
                                    className="inline-flex items-center px-8 py-4 rounded-2xl shadow-lg"
                                    style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, color: COMMON.WHITE }}
                                >
                                    <FiShield className="w-6 h-6 mr-3" />
                                    <span className="font-bold text-lg">Học sinh</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: PRIMARY[50] }}>
                                    <div className="flex items-center">
                                        <FiAward className="h-5 w-5 mr-3" style={{ color: PRIMARY[500] }} />
                                        <span className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                            Mã học sinh
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold" style={{ color: PRIMARY[600] }}>
                                        {profile.studentCode}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: SUCCESS[50] }}>
                                    <div className="flex items-center">
                                        <FiBookOpen className="h-5 w-5 mr-3" style={{ color: SUCCESS[500] }} />
                                        <span className="font-medium" style={{ color: TEXT.PRIMARY }}>
                                            Lớp hiện tại
                                        </span>
                                    </div>
                                    <span className="text-base font-bold px-3 py-2 rounded-full" style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                        {profile.currentClassName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-9">
                        <div
                            className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500 h-full"
                            style={{
                                boxShadow: `0 25px 50px -12px ${SHADOW.MEDIUM}`,
                                background: `linear-gradient(135deg, white 0%, ${SUCCESS[25] || '#f0fdf4'} 100%)`,
                            }}
                        >
                            <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100">
                                <div className="flex items-center">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, color: COMMON.WHITE }}
                                    >
                                        <FiUser className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                            Thông tin cá nhân
                                        </h3>
                                        <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                                            {isEditing ? 'Đang chỉnh sửa thông tin' : 'Thông tin chi tiết về học sinh'}
                                        </p>
                                    </div>
                                </div>
                                {isEditing ? (
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={handleCancel}
                                            className="group flex items-center px-6 py-3 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 bg-white"
                                            style={{ color: TEXT.SECONDARY, border: `2px solid ${TEXT.SECONDARY}` }}
                                        >
                                            <FiX className="w-5 h-5 mr-2" />
                                            <span className="font-semibold">Hủy</span>
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saveLoading}
                                            className="flex items-center px-5 py-2.5 rounded-xl text-white transition-all duration-200 font-medium"
                                            style={{
                                                backgroundColor: saveLoading ? PRIMARY[400] : PRIMARY[600],
                                                boxShadow: `0 2px 4px ${SHADOW.LIGHT}`,
                                                opacity: saveLoading ? 0.7 : 1,
                                                cursor: saveLoading ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {saveLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <FiSave className="mr-2" /> Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={handleStartEdit}
                                            className="group flex items-center px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                                            style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, color: COMMON.WHITE }}
                                        >
                                            <FiEdit3 className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                                            <span className="font-semibold text-base">Chỉnh sửa</span>
                                        </button>
                                        <button
                                            onClick={() => navigate('/student/change-password')}
                                            className="group flex items-center px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                                            style={{ backgroundColor: PRIMARY[500], color: COMMON.WHITE }}
                                        >
                                            <FiShield className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                                            <span className="font-semibold text-base">Đổi mật khẩu</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
                                <div className="group relative p-8 rounded-2xl border border-transparent hover:border-opacity-30 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                    style={{ background: `linear-gradient(135deg, ${PRIMARY[500]}08 0%, ${PRIMARY[500]}05 100%)`, borderColor: `${PRIMARY[500]}20` }}>
                                    <div className="flex items-start space-x-5">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md"
                                            style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[500]}CC 100%)`, color: 'white' }}>
                                            <FiMail className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY[500] }}>
                                                Email
                                            </p>
                                            <p className="text-lg font-bold break-all mb-2" style={{ color: TEXT.PRIMARY }}>
                                                {profile.email}
                                            </p>
                                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                Địa chỉ email liên hệ
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative p-8 rounded-2xl border border-transparent hover:border-opacity-30 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                    style={{ background: `linear-gradient(135deg, ${SUCCESS[500]}08 0%, ${SUCCESS[500]}05 100%)`, borderColor: `${SUCCESS[500]}20` }}>
                                    <div className="flex items-start space-x-5">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md"
                                            style={{ background: `linear-gradient(135deg, ${SUCCESS[500]} 0%, ${SUCCESS[500]}CC 100%)`, color: 'white' }}>
                                            <FiPhone className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: SUCCESS[500] }}>
                                                Số điện thoại
                                            </p>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={editedProfile.phoneNumber}
                                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                                    style={inputStyle}
                                                    className="w-full"
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            ) : (
                                                <p className="text-lg font-bold break-all mb-2" style={{ color: TEXT.PRIMARY }}>
                                                    {profile.phoneNumber}
                                                </p>
                                            )}
                                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                Số điện thoại liên hệ
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative p-8 rounded-2xl border border-transparent hover:border-opacity-30 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                    style={{ background: `linear-gradient(135deg, ${SECONDARY[500]}08 0%, ${SECONDARY[500]}05 100%)`, borderColor: `${SECONDARY[500]}20` }}>
                                    <div className="flex items-start space-x-5">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md"
                                            style={{ background: `linear-gradient(135deg, ${SECONDARY[500]} 0%, ${SECONDARY[500]}CC 100%)`, color: 'white' }}>
                                            <FiMapPin className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: SECONDARY[500] }}>
                                                Địa chỉ
                                            </p>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={editedProfile.address}
                                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                                    style={inputStyle}
                                                    className="w-full"
                                                    placeholder="Nhập địa chỉ"
                                                />
                                            ) : (
                                                <p className="text-lg font-bold break-all mb-2" style={{ color: TEXT.PRIMARY }}>
                                                    {profile.address}
                                                </p>
                                            )}
                                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                Nơi cư trú hiện tại
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative p-8 rounded-2xl border border-transparent hover:border-opacity-30 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                    style={{ background: `linear-gradient(135deg, ${PRIMARY[600]}08 0%, ${PRIMARY[600]}05 100%)`, borderColor: `${PRIMARY[600]}20` }}>
                                    <div className="flex items-start space-x-5">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md"
                                            style={{ background: `linear-gradient(135deg, ${PRIMARY[600]} 0%, ${PRIMARY[600]}CC 100%)`, color: 'white' }}>
                                            <FiUser className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY[600] }}>
                                                Giới tính
                                            </p>
                                            <p className="text-lg font-bold break-all mb-2" style={{ color: TEXT.PRIMARY }}>
                                                {getGenderLabel(profile.gender)}
                                            </p>
                                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                Thông tin giới tính
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative p-8 rounded-2xl border border-transparent hover:border-opacity-30 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                    style={{ background: `linear-gradient(135deg, ${SUCCESS[600]}08 0%, ${SUCCESS[600]}05 100%)`, borderColor: `${SUCCESS[600]}20` }}>
                                    <div className="flex items-start space-x-5">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md"
                                            style={{ background: `linear-gradient(135deg, ${SUCCESS[600]} 0%, ${SUCCESS[600]}CC 100%)`, color: 'white' }}>
                                            <FiCalendar className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: SUCCESS[600] }}>
                                                Ngày sinh
                                            </p>
                                            <p className="text-lg font-bold break-all mb-2" style={{ color: TEXT.PRIMARY }}>
                                                {formatDate(profile.dateOfBirth)}
                                            </p>
                                            <p className="text-sm" style={{ color: TEXT.SECONDARY }}>
                                                Ngày tháng năm sinh
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {profile.hasParent && (
                                    <div className="group relative p-8 rounded-2xl border border-transparent transition-all duration-300 bg-yellow-50">
                                        <div className="flex items-start space-x-5">
                                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                                                style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #fde68a 100%)', color: 'white' }}>
                                                <FiHeart className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: '#f59e42' }}>
                                                    Phụ huynh
                                                </p>
                                                <p className="text-lg font-bold break-all mb-2" style={{ color: '#222' }}>
                                                    {profile.parentName} ({getRelationshipLabel(profile.parentRelationship)})
                                                </p>
                                                <p className="text-sm" style={{ color: '#888' }}>
                                                    {profile.parentPhone} | {profile.parentEmail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <div
                        className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500"
                        style={{
                            boxShadow: `0 25px 50px -12px ${SHADOW.MEDIUM}`,
                            background: `linear-gradient(135deg, white 0%, ${PRIMARY[25] || '#f8fafc'} 100%)`,
                        }}
                    >
                        <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100">
                            <div className="flex items-center">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shadow-lg"
                                    style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[600]} 100%)`, color: COMMON.WHITE }}
                                >
                                    <FiBookOpen className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold" style={{ color: TEXT.PRIMARY }}>
                                        Lịch sử lớp học
                                    </h3>
                                    <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                                        Danh sách các lớp học đã tham gia
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: PRIMARY[100], color: PRIMARY[700] }}>
                                    {profile.classCount} lớp
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                            {profile.classes.map((cls, idx) => (
                                <div
                                    key={cls.studentClassId}
                                    className="group relative p-8 rounded-2xl border border-transparent hover:border-opacity-30 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 w-full"
                                    style={{ background: `linear-gradient(135deg, ${PRIMARY[500]}08 0%, ${PRIMARY[500]}05 100%)`, borderColor: `${PRIMARY[500]}` }}
                                >
                                    <div className="flex items-center space-x-6 mb-6">
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md"
                                            style={{ background: `linear-gradient(135deg, ${PRIMARY[500]} 0%, ${PRIMARY[500]}CC 100%)`, color: 'white' }}
                                        >
                                            <FiBookOpen className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-xl mb-1" style={{ color: TEXT.PRIMARY }}>
                                                {cls.className}
                                            </h4>
                                            <p className="text-base" style={{ color: TEXT.SECONDARY }}>
                                                Khối {cls.grade} - Năm học {cls.academicYear}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Ngày nhập học:
                                            </span>
                                            <span className="text-base font-bold" style={{ color: TEXT.PRIMARY }}>
                                                {formatDate(cls.enrollmentDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-medium" style={{ color: TEXT.SECONDARY }}>
                                                Trạng thái:
                                            </span>
                                            <span className="text-base font-bold px-3 py-2 rounded-full" style={{ backgroundColor: cls.isActive ? SUCCESS[100] : ERROR[100], color: cls.isActive ? SUCCESS[700] : ERROR[700] }}>
                                                {cls.isActive ? 'Đang học' : 'Đã hoàn thành'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={showAlert}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setShowAlert(false)}
            />
        </div>
    );
};

export default StudentProfile;