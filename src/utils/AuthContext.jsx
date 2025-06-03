import React, { createContext, useState, useContext, useEffect } from "react";

// Tạo context cho xác thực
const AuthContext = createContext(null);

// Role constants
export const ROLES = {
    ADMIN: "admin",
    STAFF: "staff",
    TEACHER: "teacher",
    PARENT: "parent",
    STUDENT: "student",
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra xem đã có thông tin đăng nhập được lưu trong localStorage chưa
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Hàm đăng nhập
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // Hàm đăng xuất
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    // Kiểm tra người dùng có vai trò cụ thể không
    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role;
    };

    // Kiểm tra đã đăng nhập chưa
    const isAuthenticated = () => {
        return !!user;
    };

    // Mock function để demo đăng nhập với các vai trò khác nhau
    const loginWithRole = (role) => {
        const mockUsers = {
            [ROLES.ADMIN]: {
                id: 1,
                name: "Admin User",
                email: "admin@medschool.edu.vn",
                role: ROLES.ADMIN,
                permissions: ["manage_users", "view_reports", "system_config"],
            },
            [ROLES.STAFF]: {
                id: 2,
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
                id: 3,
                name: "Giáo viên Nguyễn Thị B",
                email: "teacher@medschool.edu.vn",
                role: ROLES.TEACHER,
                permissions: ["submit_health_reports", "view_student_health_info"],
            },
            [ROLES.PARENT]: {
                id: 4,
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
                parentId: 4,
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
        loginWithRole, // Chỉ dùng cho demo
        ROLES,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;