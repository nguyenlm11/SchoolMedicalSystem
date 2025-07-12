import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../utils/AuthContext";
import { PRIMARY, COMMON, ERROR } from "../../../constants/colors";
import { FiChevronDown, FiUser } from "react-icons/fi";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated, ROLES } = useAuth();
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
        setUserDropdown(false);
    };

    const toggleUserDropdown = (event) => {
        event.stopPropagation();
        setUserDropdown(prev => !prev);
        setActiveDropdown(null);
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

    const getRoleCategories = () => {
        if (!isAuthenticated()) return [];
        const roleCategories = {
            [ROLES.PARENT]: ["Phụ huynh"],
            [ROLES.STUDENT]: ["Học sinh"],
            [ROLES.SCHOOLNURSE]: ["Nhân viên y tế"],
            [ROLES.MANAGER]: ["Phụ huynh", "Học sinh", "Nhân viên y tế"],
            [ROLES.ADMIN]: ["Phụ huynh", "Học sinh", "Nhân viên y tế"]
        };
        return roleCategories[user?.role] || [];
    };

    const isMenuItemVisible = (item) => {
        if (!isAuthenticated()) return false;
        const allowedCategories = getRoleCategories();
        return item.subItems.some(subItem =>
            allowedCategories.includes(subItem.category)
        );
    };

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
                        { to: "/schoolnurse/vaccination/create", label: "Tạo buổi tiêm chủng", desc: "Tạo buổi tiêm chủng mới" },
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
                        { to: "/schoolnurse/medication-requests", label: "Danh sách yêu cầu thuốc", desc: "Xem danh sách yêu cầu thuốc" },
                        { to: "/schoolnurse/medication", label: "Danh sách thuốc", desc: "Theo dõi thuốc trong trường" },
                        { to: "/schoolnurse/supply", label: "Vật tư y tế", desc: "Theo dõi vật tư y tế trong trường" },
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
            subItems: [
                {
                    category: "Nhân viên y tế",
                    links: [
                        { to: "/schoolnurse/health-events", label: "Danh sách sự kiện y tế", desc: "Xem tất cả sự kiện" },
                        { to: "/schoolnurse/health-events/create", label: "Thêm sự kiện mới", desc: "Tạo sự kiện y tế mới" },
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

    const visibleMenuItems = menuItems.filter(isMenuItemVisible);

    const getProfileLink = () => {
        if (!isAuthenticated()) return "/";
        const profileLinks = {
            [ROLES.PARENT]: "/parent/profile",
            [ROLES.STUDENT]: "/student/profile",
            [ROLES.SCHOOLNURSE]: "/schoolnurse/profile",
            [ROLES.MANAGER]: "/manager/profile",
            [ROLES.ADMIN]: "/admin/profile"
        };
        return profileLinks[user?.role] || "/";
    };

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
            className={`fixed top-0 w-full z-50 transition-all duration-700 ease-in-out ${isScrolled
                ? 'shadow-2xl backdrop-blur-xl'
                : 'shadow-lg backdrop-blur-lg'
                } ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
            style={{
                background: isScrolled ? `linear-gradient(135deg, ${PRIMARY[600]}cc, ${PRIMARY[700]}cc)` : `linear-gradient(135deg, ${PRIMARY[500]}ee, ${PRIMARY[600]}ee)`,
                backdropFilter: 'blur(20px)',
                borderBottom: isScrolled ? `1px solid ${PRIMARY[400]}40` : 'none'
            }}
        >
            <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
                <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center group">
                            <div
                                className="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 mr-3 sm:mr-4 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-105"
                                style={{ backgroundColor: COMMON.WHITE, border: `2px solid ${PRIMARY[200]}` }}
                            >
                                <img src='/logo.jpg' alt="logo" className="w-10 h-10" />
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="font-bold text-xl sm:text-2xl lg:text-2xl 2xl:text-3xl tracking-tight leading-none transition-all duration-300 group-hover:text-opacity-90"
                                    style={{ color: COMMON.WHITE }}
                                >
                                    MedSchool
                                </span>
                                <span
                                    className="text-xs sm:text-sm font-medium hidden sm:block transition-all duration-300 group-hover:text-opacity-80"
                                    style={{ color: PRIMARY[100] }}
                                >
                                    Phần mềm quản lý sức khỏe
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center space-x-2 lg:space-x-4">
                        {isAuthenticated() && (
                            <Link
                                to="/"
                                className="px-4 2xl:px-6 py-3 2xl:py-4 rounded-xl font-medium transition-all duration-300 text-sm 2xl:text-base transform hover:scale-105"
                                style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                onMouseEnter={(e) => { e.target.style.backgroundColor = `${PRIMARY[600]}40` }}
                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}
                            >
                                Trang chủ
                            </Link>
                        )}

                        {visibleMenuItems.map((item) => {
                            const filteredSubItems = getFilteredSubItems(item.subItems);
                            return (
                                <div key={item.name} className="relative" data-dropdown>
                                    <button
                                        onClick={(e) => toggleDropdown(item.name, e)}
                                        className="px-4 2xl:px-6 py-3 2xl:py-4 rounded-xl font-medium transition-all duration-300 flex items-center text-sm 2xl:text-base transform hover:scale-105"
                                        style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => { e.target.style.backgroundColor = `${PRIMARY[600]}40` }}
                                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}
                                    >
                                        <span className="whitespace-nowrap mr-3">{item.label}</span>
                                        <FiChevronDown className={`w-4 h-4 transition-all duration-300 ${activeDropdown === item.name ? "rotate-180" : ""}`} />
                                    </button>

                                    <div
                                        className={`absolute top-full left-0 mt-3 w-72 2xl:w-80 transition-all duration-300 transform ${activeDropdown === item.name
                                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                            }`}
                                        style={{ zIndex: 9999 }}
                                        data-dropdown
                                    >
                                        <div
                                            className="rounded-2xl shadow-xl overflow-hidden max-h-96 overflow-y-auto border"
                                            style={{ backgroundColor: `${PRIMARY[700]}f8`, backdropFilter: 'blur(15px)', borderColor: `${PRIMARY[500]}60` }}
                                        >
                                            <div className="p-5 2xl:p-6">
                                                {filteredSubItems.map((category, categoryIndex) => (
                                                    <div key={categoryIndex} className="mb-5 last:mb-0">
                                                        {categoryIndex > 0 && (
                                                            <div className="border-t border-teal-400/20 my-5"></div>
                                                        )}
                                                        <div className="mb-4">
                                                            <h4 className="text-sm font-semibold text-teal-100 uppercase tracking-wider mb-4">
                                                                {category.category}
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {category.links.map((link, linkIndex) => (
                                                                    <Link
                                                                        key={linkIndex}
                                                                        to={link.to}
                                                                        onClick={closeDropdown}
                                                                        className="block p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                                                                        style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                                                        onMouseEnter={(e) => { e.target.style.backgroundColor = `${PRIMARY[600]}60` }}
                                                                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}
                                                                    >
                                                                        <div className="text-sm font-medium">
                                                                            {link.label}
                                                                        </div>
                                                                        {link.desc && (
                                                                            <div className="text-xs mt-1 opacity-75">
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

                    <div className="hidden lg:flex items-center space-x-3 lg:space-x-4">
                        {isAuthenticated() ? (
                            <div className="relative" data-user-dropdown>
                                <button
                                    onClick={toggleUserDropdown}
                                    className="px-5 lg:px-7 py-3 lg:py-4 rounded-xl font-medium transition-all duration-300 flex items-center text-sm lg:text-base transform hover:scale-105"
                                    style={{ backgroundColor: `${PRIMARY[600]}`, backdropFilter: 'blur(10px)', border: `1px solid ${PRIMARY[400]}40`, color: COMMON.WHITE }}
                                    onMouseEnter={(e) => { e.target.style.backgroundColor = `${PRIMARY[600]}cc` }}
                                    onMouseLeave={(e) => { e.target.style.backgroundColor = `${PRIMARY[600]}80` }}
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-4">
                                            <FiUser className="w-6 h-6 text-black" />
                                        </div>
                                        <div className="flex flex-col items-start mr-4">
                                            <span className="text-xs font-medium opacity-90">Xin chào</span>
                                            <span className="font-semibold">
                                                {user?.name || user?.username}
                                            </span>
                                        </div>
                                        <FiChevronDown className={`w-4 h-4 transition-all duration-300 ${userDropdown ? "rotate-180" : ""}`} />
                                    </div>
                                </button>

                                <div
                                    className={`absolute top-full right-0 mt-3 w-60 lg:w-64 transition-all duration-300 transform ${userDropdown
                                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                        }`}
                                    style={{ zIndex: 9999 }}
                                    data-user-dropdown
                                >
                                    <div
                                        className="rounded-2xl shadow-xl overflow-hidden border"
                                        style={{ backgroundColor: `${PRIMARY[700]}`, backdropFilter: 'blur(15px)', borderColor: `${PRIMARY[500]}` }}
                                    >
                                        <div className="p-5 lg:p-6 space-y-3">
                                            <Link
                                                to={getDashboardLink()}
                                                onClick={closeUserDropdown}
                                                className="block w-full p-2 rounded-xl transition-all duration-300 font-medium text-base transform hover:scale-[1.02]"
                                                style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = `${PRIMARY[600]}60` }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}
                                            >
                                                Tổng quan
                                            </Link>

                                            <Link
                                                to={getProfileLink()}
                                                onClick={closeUserDropdown}
                                                className="block w-full p-2 rounded-xl transition-all duration-300 font-medium text-base transform hover:scale-[1.02]"
                                                style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = `${PRIMARY[600]}60` }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}
                                            >
                                                Hồ sơ cá nhân
                                            </Link>

                                            <div className="my-4" style={{ borderTop: `1px solid ${PRIMARY[500]}60` }}></div>

                                            <button
                                                onClick={handleLogout}
                                                className="block w-full p-2 rounded-xl transition-all duration-300 font-medium text-base text-left transform hover:scale-[1.02]"
                                                style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => { e.target.style.backgroundColor = `${ERROR[700]}` }}
                                                onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}
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
                                className="px-5 lg:px-7 py-3 lg:py-4 rounded-xl font-medium transition-all duration-300 text-sm lg:text-base transform hover:scale-105"
                                style={{ backgroundColor: COMMON.WHITE, color: PRIMARY[700], border: `1px solid ${PRIMARY[200]}` }}
                                onMouseEnter={(e) => { e.target.style.backgroundColor = PRIMARY[50] }}
                                onMouseLeave={(e) => { e.target.style.backgroundColor = COMMON.WHITE }}
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>

                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="relative p-3 rounded-xl text-white transition-all duration-300 transform hover:scale-105"
                            style={{ backgroundColor: isMobileMenuOpen ? `${PRIMARY[600]}60` : 'transparent' }}
                        >
                            <div className="w-6 h-6 relative">
                                <span className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 rounded-full ${isMobileMenuOpen ? 'rotate-45 top-3' : 'top-1'}`}></span>
                                <span className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 top-3 rounded-full ${isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}></span>
                                <span className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 rounded-full ${isMobileMenuOpen ? '-rotate-45 top-3' : 'top-5'}`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pb-6 pt-4">
                        <div
                            className="rounded-2xl p-5 shadow-xl max-h-96 overflow-y-auto"
                            style={{ backgroundColor: `${PRIMARY[700]}`, backdropFilter: 'blur(15px)', border: `1px solid ${PRIMARY[500]}` }}
                        >
                            <div className="space-y-2">
                                {isAuthenticated() && (
                                    <Link
                                        to="/"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 rounded-xl font-medium text-base transition-all duration-300"
                                        style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = `${PRIMARY[600]}60`}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        Trang chủ
                                    </Link>
                                )}

                                {visibleMenuItems.map((item) => {
                                    const filteredSubItems = getFilteredSubItems(item.subItems);
                                    return filteredSubItems.map((category) =>
                                        category.links.map((link, linkIndex) => (
                                            <Link
                                                key={`${item.name}-${linkIndex}`}
                                                to={link.to}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block px-4 py-3 rounded-xl font-medium text-base transition-all duration-300"
                                                style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = `${PRIMARY[600]}60`}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                {link.label}
                                            </Link>
                                        ))
                                    );
                                })}

                                <div className="border-t border-teal-400/30 pt-3 mt-3">
                                    {isAuthenticated() ? (
                                        <>
                                            <Link
                                                to={getDashboardLink()}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block px-4 py-3 rounded-xl font-medium text-base transition-all duration-300"
                                                style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = `${PRIMARY[600]}60`}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                Tổng quan
                                            </Link>
                                            <Link
                                                to={getProfileLink()}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block px-4 py-3 rounded-xl font-medium text-base transition-all duration-300"
                                                style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = `${PRIMARY[600]}60`}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                Hồ sơ cá nhân
                                            </Link>
                                            <div className="text-center p-3 rounded-xl my-3" style={{ backgroundColor: `${PRIMARY[600]}80` }}>
                                                <span className="text-xs font-medium" style={{ color: COMMON.WHITE }}>
                                                    Xin chào {user?.name || user?.username}
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full px-4 py-3 rounded-xl font-medium text-base transition-all duration-300 text-center"
                                                style={{ color: COMMON.WHITE, backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = `${ERROR[700]}`}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                Đăng xuất
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block w-full text-center px-6 py-3 rounded-xl font-medium text-base transition-all duration-300"
                                            style={{ backgroundColor: COMMON.WHITE, color: PRIMARY[700] }}
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
            </div>
        </nav>
    );
};

export default Navbar; 