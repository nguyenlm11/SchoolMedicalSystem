import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../utils/AuthContext";
import { PRIMARY, SECONDARY, SUCCESS, WARNING, ERROR, INFO, GRAY, COMMON } from "../../../constants/colors";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated, hasRole, ROLES } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [userDropdown, setUserDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 10);

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsNavbarVisible(false);
            } else {
                setIsNavbarVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('[data-dropdown]') && !event.target.closest('[data-user-dropdown]')) {
                setActiveDropdown(null);
                setUserDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (dropdownName, event) => {
        event.stopPropagation();
        setActiveDropdown(prev => prev === dropdownName ? null : dropdownName);
        setUserDropdown(false); // Close user dropdown when opening other dropdowns
    };

    const toggleUserDropdown = (event) => {
        event.stopPropagation();
        setUserDropdown(prev => !prev);
        setActiveDropdown(null); // Close other dropdowns when opening user dropdown
    };

    const closeDropdown = () => {
        setActiveDropdown(null);
    };

    const closeUserDropdown = () => {
        setUserDropdown(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
        setIsMobileMenuOpen(false);
        setUserDropdown(false);
    };

    // Function to get role-based category mapping
    const getRoleCategories = () => {
        if (!isAuthenticated()) return [];

        const roleCategories = {
            [ROLES.PARENT]: ["Phụ huynh"],
            [ROLES.STUDENT]: ["Học sinh"],
            [ROLES.SCHOOLNURSE]: ["Nhân viên y tế"],
            [ROLES.MANAGER]: ["Phụ huynh", "Học sinh", "Nhân viên y tế"], // Manager có thể xem tất cả
            [ROLES.ADMIN]: ["Phụ huynh", "Học sinh", "Nhân viên y tế"]     // Admin có thể xem tất cả
        };

        return roleCategories[user?.role] || [];
    };

    // Function to check if a menu item should be visible for current user
    const isMenuItemVisible = (item) => {
        if (!isAuthenticated()) return false; // Guest không thấy menu items

        const allowedCategories = getRoleCategories();

        // Check if any subItem category is allowed for current user
        return item.subItems.some(subItem =>
            allowedCategories.includes(subItem.category)
        );
    };

    // Function to filter subItems based on user role
    const getFilteredSubItems = (subItems) => {
        if (!isAuthenticated()) return [];

        const allowedCategories = getRoleCategories();

        return subItems.filter(subItem =>
            allowedCategories.includes(subItem.category)
        );
    };

    const menuItems = [
        {
            name: "health-profile",
            label: "Hồ sơ sức khỏe",
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
            ),
            subItems: [
                {
                    category: "Phụ huynh",
                    links: [
                        { to: "/parent/health-profile", label: "Danh sách hồ sơ sức khỏe", desc: "Xem tất cả hồ sơ y tế" },
                        { to: "/parent/health-profile/new", label: "Khai báo hồ sơ sức khỏe", desc: "Tạo hồ sơ mới cho con em" },
                    ],
                },
                {
                    category: "Học sinh",
                    links: [
                        { to: "/student/health-profile", label: "Hồ sơ sức khỏe", desc: "Xem hồ sơ sức khỏe cá nhân" },
                    ],
                },
            ],
        },
        {
            name: "vaccination",
            label: "Tiêm chủng",
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
            ),
            subItems: [
                {
                    category: "Phụ huynh",
                    links: [
                        { to: "/parent/vaccination/schedule", label: "Lịch tiêm chủng", desc: "Xem lịch tiêm chủng" },
                    ],
                },
                {
                    category: "Nhân viên y tế",
                    links: [
                        { to: "/schoolnurse/vaccination", label: "Quản lý tiêm chủng", desc: "Theo dõi lịch tiêm chủng" },
                        { to: "/schoolnurse/vaccination/flow", label: "Quy trình tiêm chủng", desc: "Hướng dẫn quy trình" },
                    ],
                },
                {
                    category: "Học sinh",
                    links: [
                        { to: "/student/health-events", label: "Sự kiện tiêm chủng", desc: "Xem lịch tiêm chủng cá nhân" },
                    ],
                },
            ],
        },
        {
            name: "medication",
            label: "Quản lý thuốc",
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
            ),
            subItems: [
                {
                    category: "Phụ huynh",
                    links: [
                        { to: "/parent/medication/request", label: "Gửi thuốc", desc: "Yêu cầu thuốc cho con em" },
                        { to: "/parent/medication/history", label: "Lịch sử gửi thuốc", desc: "Xem lịch sử đã gửi" },
                        { to: "/parent/dashboard", label: "Bảng điều khiển", desc: "Tổng quan thông tin" },
                    ],
                },
                {
                    category: "Nhân viên y tế",
                    links: [
                        { to: "/schoolnurse/medication", label: "Quản lý thuốc", desc: "Theo dõi thuốc trong trường" },
                        { to: "/schoolnurse/supply", label: "Quản lý vật tư y tế", desc: "Theo dõi vật tư y tế trong trường" },
                    ],
                },
                {
                    category: "Học sinh",
                    links: [
                        { to: "/student/medication", label: "Lịch uống thuốc", desc: "Theo dõi và quản lý lịch trình uống thuốc của bạn" },
                    ],
                },
            ],
        },
        {
            name: "health-events",
            label: "Sự kiện y tế",
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            ),
            subItems: [
                {
                    category: "Nhân viên y tế",
                    links: [
                        { to: "/schoolnurse/health-events", label: "Danh sách sự kiện y tế", desc: "Xem tất cả sự kiện" },
                        { to: "/schoolnurse/health-events/new", label: "Thêm sự kiện mới", desc: "Tạo sự kiện y tế mới" },
                    ],
                },
                {
                    category: "Học sinh",
                    links: [
                        { to: "/student/health-events", label: "Sự kiện y tế", desc: "Lịch khám sức khỏe, tiêm chủng và các hoạt động y tế khác" },
                    ],
                },
            ],
        },
        {
            name: "health-check",
            label: "Kiểm tra định kỳ",
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
            ),
            subItems: [
                {
                    category: "Phụ huynh",
                    links: [
                        { to: "/parent/health-check", label: "Xác nhận kiểm tra", desc: "Xác nhận lịch khám" },
                        { to: "/parent/health-check/results", label: "Xem kết quả kiểm tra", desc: "Kết quả khám sức khỏe" },
                    ],
                },
                {
                    category: "Nhân viên y tế",
                    links: [
                        { to: "/schoolnurse/health-check", label: "Quản lý kiểm tra", desc: "Theo dõi lịch khám" },
                        { to: "/schoolnurse/health-check/new", label: "Lên lịch kiểm tra mới", desc: "Tạo lịch khám mới" },
                    ],
                },
                {
                    category: "Học sinh",
                    links: [
                        { to: "/student/health-events", label: "Lịch kiểm tra sức khỏe", desc: "Xem lịch kiểm tra sức khỏe cá nhân" },
                    ],
                },
            ],
        },
    ];

    // Filter menu items based on user role
    const visibleMenuItems = menuItems.filter(isMenuItemVisible);

    // Get dashboard link based on user role
    const getDashboardLink = () => {
        if (!isAuthenticated()) return "/";

        const dashboardLinks = {
            [ROLES.PARENT]: "/parent/dashboard",
            [ROLES.STUDENT]: "/student/dashboard",
            [ROLES.SCHOOLNURSE]: "/schoolnurse/dashboard",
            [ROLES.MANAGER]: "/manager/dashboard",
            [ROLES.ADMIN]: "/admin/dashboard"
        };

        return dashboardLinks[user?.role] || "/";
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${isScrolled
                ? 'shadow-lg'
                : 'shadow-md'
                } ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
            style={{
                backgroundColor: PRIMARY[500],
                borderBottom: isScrolled ? `1px solid ${PRIMARY[400]}` : 'none'
            }}
        >
            <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
                    {/* Logo - Simplified */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center group">
                            <div
                                className="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 mr-2 sm:mr-3 rounded-lg flex items-center justify-center transition-all duration-300"
                                style={{
                                    backgroundColor: COMMON.WHITE
                                }}
                            >
                                <span className="font-bold text-lg sm:text-xl" style={{ color: PRIMARY[600] }}>M</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="font-bold text-xl sm:text-2xl lg:text-2xl xl:text-3xl tracking-tight leading-none"
                                    style={{ color: COMMON.WHITE }}
                                >
                                    MedSchool
                                </span>
                                <span className="text-xs sm:text-sm font-medium hidden sm:block" style={{ color: PRIMARY[100] }}>Health Management System</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Better responsive breakpoints */}
                    <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
                        {/* Trang chủ - Chỉ hiển thị khi đã đăng nhập */}
                        {isAuthenticated() && (
                            <Link
                                to="/"
                                className="px-3 xl:px-4 py-2 xl:py-3 rounded-lg font-medium transition-all duration-300 text-sm xl:text-base hover:bg-opacity-20"
                                style={{
                                    color: COMMON.WHITE,
                                    backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                Trang chủ
                            </Link>
                        )}

                        {/* Menu items with enhanced dropdowns */}
                        {visibleMenuItems.map((item) => {
                            const filteredSubItems = getFilteredSubItems(item.subItems);

                            return (
                                <div key={item.name} className="relative" data-dropdown>
                                    <button
                                        onClick={(e) => toggleDropdown(item.name, e)}
                                        className="px-3 xl:px-4 py-2 xl:py-3 rounded-lg font-medium transition-all duration-300 flex items-center text-sm xl:text-base"
                                        style={{
                                            color: COMMON.WHITE,
                                            backgroundColor: 'transparent'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <span className="whitespace-nowrap mr-2">{item.label}</span>
                                        <span
                                            className={`transition-all duration-300 ${activeDropdown === item.name ? "rotate-180" : ""
                                                }`}
                                        >
                                            ▼
                                        </span>
                                    </button>

                                    {/* Dropdown Menu - Simplified */}
                                    <div
                                        className={`absolute top-full left-0 mt-2 w-72 xl:w-80 transition-all duration-300 transform ${activeDropdown === item.name
                                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                            }`}
                                        style={{ zIndex: 9999 }}
                                        data-dropdown
                                    >
                                        <div
                                            className="rounded-xl shadow-xl overflow-hidden max-h-96 overflow-y-auto"
                                            style={{
                                                backgroundColor: PRIMARY[700],
                                                border: `1px solid ${PRIMARY[500]}`
                                            }}
                                        >
                                            <div className="p-2 xl:p-3">
                                                {filteredSubItems.map((category, categoryIndex) => (
                                                    <div key={categoryIndex} className="mb-2 last:mb-0">
                                                        {categoryIndex > 0 && (
                                                            <div className="border-t border-teal-400/30 my-3"></div>
                                                        )}
                                                        <div className="px-3 xl:px-4 py-2">
                                                            <h4 className="text-xs font-semibold text-teal-100 uppercase tracking-wider mb-3">
                                                                {category.category}
                                                            </h4>
                                                            <div className="space-y-1">
                                                                {category.links.map((link, linkIndex) => (
                                                                    <Link
                                                                        key={linkIndex}
                                                                        to={link.to}
                                                                        onClick={closeDropdown}
                                                                        className="block p-3 rounded-lg transition-all duration-300"
                                                                        style={{
                                                                            color: COMMON.WHITE,
                                                                            backgroundColor: 'transparent'
                                                                        }}
                                                                        onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        <div className="text-sm font-medium">
                                                                            {link.label}
                                                                        </div>
                                                                        {link.desc && (
                                                                            <div className="text-xs mt-1 opacity-80">
                                                                                {link.desc}
                                                                            </div>
                                                                        )}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Auth Links - Better responsive */}
                    <div className="hidden xl:flex items-center space-x-3 xl:space-x-4">
                        {isAuthenticated() ? (
                            <div className="relative" data-user-dropdown>
                                {/* User Dropdown Button */}
                                <button
                                    onClick={toggleUserDropdown}
                                    className="px-4 xl:px-6 py-2.5 xl:py-3.5 rounded-lg font-semibold transition-all duration-300 flex items-center text-sm xl:text-base"
                                    style={{
                                        backgroundColor: PRIMARY[500],
                                        border: `1px solid ${PRIMARY[400]}`,
                                        color: COMMON.WHITE
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[500]}
                                >
                                    <div className="flex items-center">
                                        <div className="flex flex-col items-start mr-3">
                                            <span className="text-xs font-medium opacity-90">Xin chào</span>
                                            <span className="font-bold">
                                                {user?.name || user?.username}
                                            </span>
                                        </div>
                                        <span
                                            className={`transition-all duration-300 ${userDropdown ? "rotate-180" : ""
                                                }`}
                                        >
                                            ▼
                                        </span>
                                    </div>
                                </button>

                                {/* User Dropdown Menu */}
                                <div
                                    className={`absolute top-full right-0 mt-2 w-56 xl:w-64 transition-all duration-300 transform ${userDropdown
                                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                        }`}
                                    style={{ zIndex: 9999 }}
                                    data-user-dropdown
                                >
                                    <div
                                        className="rounded-xl shadow-xl overflow-hidden"
                                        style={{
                                            backgroundColor: PRIMARY[700],
                                            border: `1px solid ${PRIMARY[500]}`
                                        }}
                                    >
                                        <div className="p-3 xl:p-4 space-y-2">
                                            {/* Dashboard Link */}
                                            <Link
                                                to={getDashboardLink()}
                                                onClick={closeUserDropdown}
                                                className="block w-full p-4 xl:p-5 rounded-lg transition-all duration-300 font-bold text-base xl:text-lg"
                                                style={{
                                                    color: COMMON.WHITE,
                                                    backgroundColor: 'transparent'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                Tổng quan
                                            </Link>

                                            {/* Profile Link */}
                                            <Link
                                                to="/profile"
                                                onClick={closeUserDropdown}
                                                className="block w-full p-4 xl:p-5 rounded-lg transition-all duration-300 font-bold text-base xl:text-lg"
                                                style={{
                                                    color: COMMON.WHITE,
                                                    backgroundColor: 'transparent'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                Hồ sơ cá nhân
                                            </Link>

                                            {/* Divider */}
                                            <div
                                                className="my-3"
                                                style={{
                                                    borderTop: `1px solid ${PRIMARY[500]}`
                                                }}
                                            ></div>

                                            {/* Logout Button */}
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full p-4 xl:p-5 rounded-lg transition-all duration-300 font-bold text-base xl:text-lg text-left"
                                                style={{
                                                    color: ERROR[500],
                                                    backgroundColor: 'transparent'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = 'transparent'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 xl:px-6 py-2 xl:py-3 rounded-lg font-medium transition-all duration-300 text-sm xl:text-base"
                                style={{
                                    backgroundColor: COMMON.WHITE,
                                    color: PRIMARY[700]
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[50]}
                                onMouseLeave={(e) => e.target.style.backgroundColor = COMMON.WHITE}
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>

                    {/* Enhanced Mobile menu button with better breakpoint */}
                    <div className="xl:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="relative p-2 sm:p-3 rounded-lg xl:rounded-xl text-white hover:text-teal-100 transition-all duration-300 group"
                            style={{
                                background: isMobileMenuOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                            }}
                        >
                            <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                                <span className={`absolute block w-5 sm:w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-2 sm:top-3' : 'top-1'
                                    }`}></span>
                                <span className={`absolute block w-5 sm:w-6 h-0.5 bg-current transition-all duration-300 top-2 sm:top-3 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                                    }`}></span>
                                <span className={`absolute block w-5 sm:w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-2 sm:top-3' : 'top-3 sm:top-5'
                                    }`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Enhanced Mobile Menu with better responsive and scroll */}
                <div
                    className={`xl:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="pb-4 sm:pb-6 pt-2">
                        <div
                            className="rounded-xl p-3 sm:p-4 shadow-xl max-h-80 overflow-y-auto"
                            style={{
                                backgroundColor: PRIMARY[600],
                                border: `1px solid ${PRIMARY[400]}`
                            }}
                        >
                            {/* Mobile Home Link - Chỉ hiển thị khi đã đăng nhập */}
                            {isAuthenticated() && (
                                <Link
                                    to="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 sm:px-4 py-3 sm:py-4 rounded-lg transition-all duration-300 mb-2 font-medium text-sm sm:text-base"
                                    style={{
                                        color: COMMON.WHITE,
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Trang chủ
                                </Link>
                            )}

                            {/* Mobile Menu Items */}
                            {visibleMenuItems.map((item) => {
                                const filteredSubItems = getFilteredSubItems(item.subItems);

                                return (
                                    <div key={item.name} className="mb-2">
                                        <button
                                            onClick={(e) => toggleDropdown(`mobile-${item.name}`, e)}
                                            className="w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 rounded-lg transition-all duration-300 font-medium text-sm sm:text-base"
                                            style={{
                                                color: COMMON.WHITE,
                                                backgroundColor: 'transparent'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <span>{item.label}</span>
                                            <span
                                                className={`transition-transform duration-300 ${activeDropdown === `mobile-${item.name}` ? "rotate-180" : ""
                                                    }`}
                                            >
                                                ▼
                                            </span>
                                        </button>

                                        {/* Mobile Dropdown */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ${activeDropdown === `mobile-${item.name}` ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                        >
                                            <div className="pl-4 sm:pl-6 pr-3 sm:pr-4 pb-2 space-y-2">
                                                {filteredSubItems.map((category, categoryIndex) => (
                                                    <div key={categoryIndex}>
                                                        <p className="text-xs font-semibold text-teal-100 uppercase tracking-wider px-3 py-2">
                                                            {category.category}
                                                        </p>
                                                        {category.links.map((link, linkIndex) => (
                                                            <Link
                                                                key={linkIndex}
                                                                to={link.to}
                                                                onClick={() => {
                                                                    setIsMobileMenuOpen(false);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="block p-2 sm:p-3 rounded-lg transition-all duration-300"
                                                                style={{
                                                                    color: COMMON.WHITE,
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                            >
                                                                <div className="text-sm font-medium">
                                                                    {link.label}
                                                                </div>
                                                                {link.desc && (
                                                                    <div className="text-xs mt-1 opacity-80">
                                                                        {link.desc}
                                                                    </div>
                                                                )}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Mobile Auth Links */}
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-teal-400/30">
                                {isAuthenticated() ? (
                                    <div className="space-y-3">
                                        {/* Dashboard Link */}
                                        <Link
                                            to={getDashboardLink()}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block w-full px-4 py-4 rounded-xl font-bold transition-all duration-300 text-base mb-3 text-center"
                                            style={{
                                                backgroundColor: PRIMARY[500],
                                                color: COMMON.WHITE
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[600]}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[500]}
                                        >
                                            Tổng quan
                                        </Link>

                                        {/* Profile Link */}
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block w-full px-4 py-4 rounded-xl font-bold transition-all duration-300 text-base mb-3 text-center"
                                            style={{
                                                backgroundColor: PRIMARY[400],
                                                color: COMMON.WHITE
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[500]}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = PRIMARY[400]}
                                        >
                                            Hồ sơ cá nhân
                                        </Link>

                                        <div
                                            className="text-center p-4 rounded-xl mb-3"
                                            style={{
                                                backgroundColor: PRIMARY[600],
                                                border: `1px solid ${PRIMARY[500]}`
                                            }}
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-medium opacity-90" style={{ color: PRIMARY[200] }}>Xin chào</span>
                                                <span className="font-bold text-sm" style={{ color: COMMON.WHITE }}>
                                                    {user?.name || user?.username}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full px-4 py-4 rounded-xl font-bold transition-all duration-300 text-base text-center"
                                            style={{
                                                backgroundColor: ERROR[500],
                                                color: COMMON.WHITE
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = ERROR[600]}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = ERROR[500]}
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full text-center px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base"
                                        style={{
                                            backgroundColor: COMMON.WHITE,
                                            color: PRIMARY[700]
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY[50]}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = COMMON.WHITE}
                                    >
                                        Đăng nhập
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 