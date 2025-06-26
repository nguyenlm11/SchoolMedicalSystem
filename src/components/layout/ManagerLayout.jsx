import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiUserCheck, FiTablet, FiPackage, FiLogOut, FiMenu, FiX, FiBell } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW } from "../../constants/colors";
import { useAuth } from "../../utils/AuthContext";
import UnauthorizedPage from "../../pages/auth/UnauthorizedPage";

const ManagerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, hasRole, ROLES } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.height = '100vh';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        return () => {
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.body.style.height = '';
            document.body.style.overflow = '';
            document.documentElement.style.height = '';
            document.documentElement.style.margin = '';
            document.documentElement.style.padding = '';
        };
    }, []);


    if (!hasRole(ROLES.MANAGER)) {
        return <UnauthorizedPage currentRole={user?.role} />;
    }

    const menuItems = [
        {
            path: "/manager/dashboard",
            name: "Tổng quan",
            icon: <FiHome className="w-5 h-5" />,
        },
        {
            path: "/manager/class-management",
            name: "Quản lý lớp học",
            icon: <FiPackage className="w-5 h-5" />,
        },
        {
            path: "/manager/parent-management",
            name: "Quản lý phụ huynh",
            icon: <FiUsers className="w-5 h-5" />,
        },
        {
            path: "/manager/student-management",
            name: "Quản lý học sinh",
            icon: <FiUserCheck className="w-5 h-5" />,
        },
        {
            path: "/manager/vaccination-list-management",
            name: "Danh sách tiêm chủng",
            icon: <FiPackage className="w-5 h-5" />,
        },
        {
            path: "/manager/medicine-inventory",
            name: "Kho thuốc",
            icon: <FiTablet className="w-5 h-5" />,
        },
        {
            path: "/manager/supply-inventory",
            name: "Vật tư y tế",
            icon: <FiPackage className="w-5 h-5" />,
        },
    ];

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div
            className="flex overflow-hidden"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0, padding: 0 }}
        >
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <div
                className={`
                    fixed lg:relative inset-y-0 left-0 z-50 
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${collapsed ? 'lg:w-20' : 'lg:w-64'} 
                    w-64 flex flex-col
                    transition-all duration-300 ease-in-out
                    lg:transform-none transform`}
                style={{ backgroundColor: PRIMARY[600], color: TEXT.INVERSE, boxShadow: `4px 0 6px ${SHADOW.MEDIUM}`, height: '100vh', minHeight: '100vh', maxHeight: '100vh' }}
            >
                <div className="p-4 flex items-center justify-between border-b flex-shrink-0"
                    style={{ borderColor: PRIMARY[700] }}>
                    {!collapsed && (
                        <div className="text-xl font-bold" style={{ color: TEXT.INVERSE }}>
                            Medical Manager
                        </div>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:block p-2 rounded-lg transition-all duration-200"
                        style={{ backgroundColor: 'transparent', color: PRIMARY[100] }}
                    >
                        {collapsed ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 rounded-lg transition-all duration-200"
                        style={{ backgroundColor: 'transparent', color: PRIMARY[100] }}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 py-4 overflow-y-auto">
                    <nav className="flex-1">
                        <ul className="space-y-1 px-3">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path ||
                                    (location.pathname.startsWith(item.path) && item.path !== "/manager/dashboard");
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`
                                                flex items-center px-3 py-3 rounded-lg
                                                transition-all duration-200
                                                ${isActive
                                                    ? 'font-medium shadow-sm'
                                                    : 'font-normal hover:shadow-sm'
                                                }
                                                ${collapsed ? 'justify-center' : ''}
                                            `}
                                            style={{ backgroundColor: isActive ? PRIMARY[500] : 'transparent', color: isActive ? TEXT.INVERSE : PRIMARY[100] }}
                                        >
                                            <span className={collapsed ? '' : 'mr-3'}>{item.icon}</span>
                                            {!collapsed && <span>{item.name}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>

                <div className="p-4 border-t flex-shrink-0" style={{ borderColor: PRIMARY[700] }}>
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                        }}
                        className={`
                            w-full flex items-center px-3 py-3 rounded-lg
                            transition-all duration-200 font-normal hover:bg-red-600
                            ${collapsed ? 'justify-center' : ''}
                        `}
                        style={{ backgroundColor: 'transparent', color: PRIMARY[100] }}
                    >
                        <FiLogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                        {!collapsed && <span>Đăng xuất</span>}
                    </button>
                </div>
            </div>

            <div
                className="flex-1 flex flex-col min-w-0"
                style={{ backgroundColor: BACKGROUND.NEUTRAL, height: '100vh', maxHeight: '100vh' }}
            >
                <header
                    className="py-4 px-4 lg:px-6 flex items-center justify-between border-b flex-shrink-0 z-10"
                    style={{ backgroundColor: BACKGROUND.DEFAULT, borderColor: BORDER.DEFAULT, boxShadow: `0 1px 3px ${SHADOW.LIGHT}` }}
                >
                    <div className="flex items-center">
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden mr-3 p-2 rounded-lg transition-all duration-200"
                            style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}
                        >
                            <FiMenu className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            className="p-2 rounded-full transition-all duration-200 hidden sm:block"
                            style={{ backgroundColor: 'transparent', color: GRAY[500] }}
                        >
                            <FiBell className="w-6 h-6" />
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="hidden sm:block text-right">
                                <div className="text-sm font-medium" style={{ color: TEXT.PRIMARY }}>
                                    {user?.name || 'Manager'}
                                </div>
                                <div className="text-xs" style={{ color: GRAY[500] }}>
                                    {user?.email || ''}
                                </div>
                            </div>
                            <div
                                className="h-8 w-8 lg:h-10 lg:w-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
                                style={{ backgroundColor: PRIMARY[500] }}
                                onClick={() => navigate('/manager/profile')}
                            >
                                <span className="font-medium text-sm lg:text-base" style={{ color: TEXT.INVERSE }}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ManagerLayout; 