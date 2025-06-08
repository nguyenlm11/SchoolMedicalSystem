import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const ROLES = {
    ADMIN: "admin",
    MANAGER: "manager",
    STAFF: "staff",
    TEACHER: "teacher",
    PARENT: "parent",
    STUDENT: "student",
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role;
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const loginWithRole = (role) => {
        const mockUsers = {
            [ROLES.ADMIN]: {
                id: 1,
                name: "Admin User",
                email: "admin@medschool.edu.vn",
                role: ROLES.ADMIN,
                permissions: ["manage_users", "view_reports", "system_config"],
            },
            [ROLES.MANAGER]: {
                id: 2,
                name: "Manager User",
                email: "manager@medschool.edu.vn",
                role: ROLES.MANAGER,
                permissions: ["manage_parents", "manage_students", "manage_inventory", "view_reports"],
            },
            [ROLES.STAFF]: {
                id: 3,
                name: "Y tá trường",
                email: "nurse@medschool.edu.vn",
                role: ROLES.STAFF,
                permissions: [
                    "manage_medications",
                    "manage_health_records",
                    "manage_screenings",
                ],
            },
            [ROLES.TEACHER]: {
                id: 4,
                name: "Giáo viên Nguyễn Thị B",
                email: "teacher@medschool.edu.vn",
                role: ROLES.TEACHER,
                permissions: ["submit_health_reports", "view_student_health_info"],
            },
            [ROLES.PARENT]: {
                id: 5,
                name: "Phụ huynh Trần Văn C",
                email: "parent@medschool.edu.vn",
                role: ROLES.PARENT,
                permissions: ["view_child_health", "request_medication"],
                children: [{ id: 101, name: "Trần Văn An", class: "3A" }],
            },
            [ROLES.STUDENT]: {
                id: 101,
                name: "Trần Văn An",
                email: "student@medschool.edu.vn",
                role: ROLES.STUDENT,
                permissions: ["view_own_health"],
                class: "3A",
                parentId: 5,
            },
        };

        login(mockUsers[role]);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated,
        loginWithRole, // Chỉ dùng để demo, sẽ xóa sau khi đăng nhập thành công
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