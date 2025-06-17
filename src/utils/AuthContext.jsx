import React, { createContext, useState, useContext, useEffect } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

export const ROLES = { ADMIN: "admin", MANAGER: "manager", SCHOOLNURSE: "schoolnurse", PARENT: "parent", STUDENT: "student" };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tokenRefreshing, setTokenRefreshing] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Hàm làm mới token
    const refreshAuthToken = async () => {
        try {
            const accessToken = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!accessToken || !refreshToken) {
                throw new Error("No token or refresh token found");
            }

            setTokenRefreshing(true);
            const response = await authApi.refreshToken();

            if (response.success) {
                const { token, refreshToken: newRefreshToken } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', newRefreshToken);

                setUser(prevUser => ({ ...prevUser, token }));
                setTokenRefreshing(false);
                return true;
            } else {
                throw new Error(response.message || "Failed to refresh token");
            }
        } catch (error) {
            setTokenRefreshing(false);
            return false;
        }
    };

    // Đăng nhập
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Đăng xuất
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    };

    // Kiểm tra quyền của người dùng
    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role;
    };

    // Kiểm tra người dùng đã đăng nhập chưa
    const isAuthenticated = () => {
        return !!user;
    };

    // Đăng nhập với thông tin tài khoản
    const loginWithCredentials = async (credentials) => {
        const response = await authApi.login(credentials);

        if (response.success) {
            const responseData = response.data;
            const serverRole = responseData.role.toUpperCase();
            const selectedRole = credentials.role.toUpperCase();

            if (serverRole !== selectedRole) {
                return {
                    success: false,
                    message: `Bạn không có quyền truy cập với vai trò ${credentials.role}`
                };
            }

            const userData = {
                id: responseData.userId,
                name: responseData.fullName,
                email: responseData.email,
                username: responseData.username,
                role: serverRole.toLowerCase(),
                token: responseData.token,
                refreshToken: responseData.refreshToken,
            };
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('refreshToken', responseData.refreshToken);
            login(userData);
            return { success: true, data: userData, message: response.message };
        }
        return {
            success: false,
            message: response.message,
            errors: response.errors || []
        };
    };

    // Kiểm tra và làm mới token khi cần
    const checkAndRefreshToken = async () => {
        if (!user || tokenRefreshing) return;

        const currentTime = Math.floor(Date.now() / 1000); // Lấy thời gian hiện tại dưới dạng giây
        const tokenExp = JSON.parse(atob(user.token.split('.')[1])).exp; // Lấy thời gian hết hạn token từ payload

        if (tokenExp < currentTime) {
            console.log('Token đã hết hạn, đang làm mới...');
            await refreshAuthToken();
        }
    };

    // Kiểm tra và làm mới token mỗi khi yêu cầu
    useEffect(() => {
        checkAndRefreshToken();
    }, [user]);

    const value = {
        user,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated,
        loginWithCredentials,
        refreshAuthToken,
        ROLES,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
