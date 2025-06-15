import React, { createContext, useState, useContext, useEffect } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

export const ROLES = { ADMIN: "admin", MANAGER: "manager", STAFF: "staff", PARENT: "parent", STUDENT: "student" };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    };

    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role;
    };

    const isAuthenticated = () => {
        return !!user;
    };

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

    const value = {
        user,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated,
        loginWithCredentials,
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