import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiBarChart2, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { PRIMARY, GRAY, TEXT, BACKGROUND, BORDER, SHADOW } from "../../constants/colors";

const AdminLayout = () => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Reset body styles to ensure full screen
    useEffect(() => {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.height = '100vh';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';

        return () => {
            // Cleanup on unmount
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.body.style.height = '';
            document.body.style.overflow = '';
            document.documentElement.style.height = '';
            document.documentElement.style.margin = '';
            document.documentElement.style.padding = '';
        };
    }, []);

    const menuItems = [
        {
            path: "/admin/dashboard",
            name: "Tổng quan",
            icon: <FiHome className="w-5 h-5" />,
        },
        {
            path: "/admin/users",
            name: "Người dùng",
            icon: <FiUsers className="w-5 h-5" />,
        },
        {
            path: "/admin/reports",
            name: "Báo cáo",
            icon: <FiBarChart2 className="w-5 h-5" />,
        },
    ];

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div
            className="flex overflow-hidden"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0
            }}
        >
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Always Fixed */}
            <div
                className={`
                    fixed lg:relative inset-y-0 left-0 z-50 
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${collapsed ? 'lg:w-20' : 'lg:w-64'} 
                    w-64 flex flex-col
                    transition-all duration-300 ease-in-out
                    lg:transform-none transform
                `}
                style={{
                    backgroundColor: PRIMARY[600],
                    color: TEXT.INVERSE,
                    boxShadow: `4px 0 6px ${SHADOW.MEDIUM}`,
                    height: '100vh',
                    minHeight: '100vh',
                    maxHeight: '100vh'
                }}
            >
                {/* Logo */}
                <div className="p-4 flex items-center justify-between border-b flex-shrink-0"
                    style={{ borderColor: PRIMARY[700] }}>
                    {!collapsed && (
                        <div className="text-xl font-bold" style={{ color: TEXT.INVERSE }}>
                            Medical Admin
                        </div>
                    )}

                    {/* Desktop collapse button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:block p-2 rounded-lg transition-all duration-200"
                        style={{
                            backgroundColor: 'transparent',
                            color: PRIMARY[100]
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = PRIMARY[500];
                            e.target.style.color = TEXT.INVERSE;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = PRIMARY[100];
                        }}
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

                    {/* Mobile close button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 rounded-lg transition-all duration-200"
                        style={{
                            backgroundColor: 'transparent',
                            color: PRIMARY[100]
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = PRIMARY[500];
                            e.target.style.color = TEXT.INVERSE;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = PRIMARY[100];
                        }}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Menu - Scrollable if needed */}
                <div className="flex-1 py-4 overflow-y-auto">
                    <nav className="flex-1">
                        <ul className="space-y-1 px-3">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
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
                                            style={{
                                                backgroundColor: isActive ? PRIMARY[500] : 'transparent',
                                                color: isActive ? TEXT.INVERSE : PRIMARY[100],
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.target.style.backgroundColor = PRIMARY[500];
                                                    e.target.style.color = TEXT.INVERSE;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                    e.target.style.color = PRIMARY[100];
                                                }
                                            }}
                                        >
                                            <span className={collapsed ? '' : 'mr-3'}>
                                                {item.icon}
                                            </span>
                                            {!collapsed && <span>{item.name}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>

                {/* Logout - Fixed at bottom */}
                <div className="p-4 border-t flex-shrink-0" style={{ borderColor: PRIMARY[700] }}>
                    <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                            flex items-center px-3 py-3 rounded-lg
                            transition-all duration-200 font-normal
                            ${collapsed ? 'justify-center' : ''}
                        `}
                        style={{
                            backgroundColor: 'transparent',
                            color: PRIMARY[100]
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = PRIMARY[500];
                            e.target.style.color = TEXT.INVERSE;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = PRIMARY[100];
                        }}
                    >
                        <FiLogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                        {!collapsed && <span>Đăng xuất</span>}
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div
                className="flex-1 flex flex-col min-w-0"
                style={{
                    backgroundColor: BACKGROUND.NEUTRAL,
                    height: '100vh',
                    maxHeight: '100vh'
                }}
            >
                {/* Top Header - Fixed */}
                <header
                    className="py-4 px-4 lg:px-6 flex items-center justify-between border-b flex-shrink-0 z-10"
                    style={{
                        backgroundColor: BACKGROUND.DEFAULT,
                        borderColor: BORDER.DEFAULT,
                        boxShadow: `0 1px 3px ${SHADOW.LIGHT}`
                    }}
                >
                    <div className="flex items-center">
                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden mr-3 p-2 rounded-lg transition-all duration-200"
                            style={{
                                backgroundColor: PRIMARY[50],
                                color: PRIMARY[600]
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = PRIMARY[100];
                                e.target.style.color = PRIMARY[700];
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = PRIMARY[50];
                                e.target.style.color = PRIMARY[600];
                            }}
                        >
                            <FiMenu className="w-5 h-5" />
                        </button>

                        <h1
                            className="text-xl lg:text-2xl font-semibold"
                            style={{ color: TEXT.PRIMARY }}
                        >
                            {menuItems.find((item) => item.path === location.pathname)
                                ?.name || "Tổng quan"}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Notification button */}
                        <button
                            className="p-2 rounded-full transition-all duration-200 hidden sm:block"
                            style={{
                                backgroundColor: 'transparent',
                                color: GRAY[500]
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = PRIMARY[50];
                                e.target.style.color = PRIMARY[600];
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = GRAY[500];
                            }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* Profile avatar */}
                        <div
                            className="h-8 w-8 lg:h-10 lg:w-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
                            style={{ backgroundColor: PRIMARY[500] }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = PRIMARY[600];
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = PRIMARY[500];
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            <span
                                className="font-medium text-sm lg:text-base"
                                style={{ color: TEXT.INVERSE }}
                            >
                                AD
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content - Scrollable */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 lg:p-6">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;