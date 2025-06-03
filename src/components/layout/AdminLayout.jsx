import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    FiHome,
    FiUsers,
    FiBarChart2,
    FiSettings,
    FiLogOut,
} from "react-icons/fi";

const AdminLayout = () => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

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

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`bg-indigo-900 text-white ${collapsed ? "w-20" : "w-64"
                    } flex flex-col transition-all duration-300 ease-in-out`}
            >
                {/* Logo */}
                <div className="p-4 flex items-center justify-between">
                    {!collapsed && <div className="text-xl font-bold">Medical Admin</div>}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 rounded-full hover:bg-indigo-800"
                    >
                        {collapsed ? (
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Menu */}
                <div className="flex-1 py-4">
                    <nav className="flex-1">
                        <ul>
                            {menuItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center px-4 py-3 ${location.pathname === item.path
                                                ? "bg-indigo-800 text-white"
                                                : "text-indigo-300 hover:bg-indigo-800 hover:text-white"
                                            } transition-colors duration-200`}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        {!collapsed && <span>{item.name}</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Logout */}
                <div className="p-4">
                    <Link
                        to="/login"
                        className="flex items-center text-indigo-300 hover:text-white transition-colors duration-200"
                    >
                        <FiLogOut className="w-5 h-5 mr-3" />
                        {!collapsed && <span>Đăng xuất</span>}
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">
                            {menuItems.find((item) => item.path === location.pathname)
                                ?.name || "Tổng quan"}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </button>
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">AD</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;