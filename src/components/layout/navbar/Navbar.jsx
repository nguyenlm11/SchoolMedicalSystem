import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
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
            if (!event.target.closest('[data-dropdown]')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (dropdownName, event) => {
        event.stopPropagation();
        setActiveDropdown(prev => prev === dropdownName ? null : dropdownName);
    };

    const closeDropdown = () => {
        setActiveDropdown(null);
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
                        { to: "/staff/vaccination", label: "Quản lý tiêm chủng", desc: "Theo dõi lịch tiêm chủng" },
                        { to: "/staff/vaccination/flow", label: "Quy trình tiêm chủng", desc: "Hướng dẫn quy trình" },
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
                        { to: "/staff/medication", label: "Quản lý thuốc", desc: "Theo dõi thuốc trong trường" },
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
                        { to: "/staff/health-events", label: "Danh sách sự kiện y tế", desc: "Xem tất cả sự kiện" },
                        { to: "/staff/health-events/new", label: "Thêm sự kiện mới", desc: "Tạo sự kiện y tế mới" },
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
                        { to: "/staff/health-check", label: "Quản lý kiểm tra", desc: "Theo dõi lịch khám" },
                        { to: "/staff/health-check/new", label: "Lên lịch kiểm tra mới", desc: "Tạo lịch khám mới" },
                    ],
                },
            ],
        },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${isScrolled
                ? 'shadow-lg border-b border-teal-400'
                : 'shadow-md'
                } ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
            style={{
                background: 'linear-gradient(135deg, #008080 0%, #006666 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}
        >
            <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
                    {/* Logo - Enhanced for better responsive */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center group">
                            <div
                                className="relative h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 mr-2 sm:mr-3 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                style={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                                    boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                <span className="text-teal-700 font-bold text-lg sm:text-xl">M</span>
                                <div
                                    className="absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0,128,128,0.1) 0%, rgba(0,102,102,0.1) 100%)'
                                    }}
                                ></div>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="font-bold text-xl sm:text-2xl lg:text-2xl xl:text-3xl tracking-tight leading-none text-white group-hover:text-teal-100 transition-colors duration-300"
                                >
                                    Med<span className="text-teal-200">School</span>
                                </span>
                                <span className="text-xs sm:text-sm text-teal-100 font-medium hidden sm:block">Health Management System</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Better responsive breakpoints */}
                    <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
                        {/* Trang chủ */}
                        <Link
                            to="/"
                            className="group relative px-3 xl:px-4 py-2 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all duration-300 flex items-center text-sm xl:text-base text-white hover:text-teal-100"
                        >
                            <div className="absolute inset-0 rounded-lg xl:rounded-xl bg-gradient-to-r from-teal-600/50 to-cyan-600/50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"></div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 xl:h-5 xl:w-5 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            <span className="relative z-10">Trang chủ</span>
                        </Link>

                        {/* Menu items with enhanced dropdowns */}
                        {menuItems.map((item) => (
                            <div key={item.name} className="relative" data-dropdown>
                                <button
                                    onClick={(e) => toggleDropdown(item.name, e)}
                                    className="group relative px-3 xl:px-4 py-2 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all duration-300 flex items-center text-white hover:text-teal-100 text-sm xl:text-base"
                                >
                                    <div className="absolute inset-0 rounded-lg xl:rounded-xl bg-gradient-to-r from-teal-600/50 to-cyan-600/50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100"></div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 xl:h-5 xl:w-5 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        {item.icon}
                                    </svg>
                                    <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                                    <svg
                                        className={`ml-1 xl:ml-2 h-3 w-3 xl:h-4 xl:w-4 relative z-10 transition-all duration-300 ${activeDropdown === item.name ? "rotate-180 text-teal-100" : "group-hover:text-teal-100"
                                            }`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>

                                {/* Enhanced Dropdown Menu - TEAL THEME with Scroll */}
                                <div
                                    className={`absolute top-full left-0 mt-2 w-72 xl:w-80 transition-all duration-300 transform ${activeDropdown === item.name
                                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                        }`}
                                    style={{ zIndex: 9999 }}
                                    data-dropdown
                                >
                                    <div
                                        className="rounded-xl xl:rounded-2xl shadow-2xl border border-teal-300 overflow-hidden dropdown-scroll max-h-96 overflow-y-auto"
                                        style={{
                                            backgroundColor: '#006666',
                                            boxShadow: '0 25px 50px -12px rgba(0, 128, 128, 0.4)'
                                        }}
                                    >
                                        <div className="p-2 xl:p-3">
                                            {item.subItems.map((category, categoryIndex) => (
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
                                                                    className="group block p-3 rounded-lg xl:rounded-xl transition-all duration-300 hover:bg-teal-700/50"
                                                                >
                                                                    <div className="flex items-start">
                                                                        <div className="flex-1">
                                                                            <div className="text-sm font-medium text-white group-hover:text-teal-50 transition-colors duration-300">
                                                                                {link.label}
                                                                            </div>
                                                                            {link.desc && (
                                                                                <div className="text-xs text-teal-100 mt-1 group-hover:text-teal-50 transition-colors duration-300">
                                                                                    {link.desc}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <svg
                                                                            className="w-4 h-4 text-teal-200 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 ml-2 mt-0.5"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    </div>
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
                        ))}
                    </div>

                    {/* Auth Links - Better responsive */}
                    <div className="hidden xl:flex items-center space-x-3 xl:space-x-4">
                        <Link
                            to="/login"
                            className="group relative px-4 xl:px-6 py-2 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all duration-300 flex items-center overflow-hidden text-sm xl:text-base text-teal-700"
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                                boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-white to-teal-50 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            ></div>
                            <svg
                                className="w-4 h-4 xl:w-5 xl:h-5 mr-2 relative z-10 group-hover:text-teal-800 transition-colors duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                />
                            </svg>
                            <span className="relative z-10 group-hover:text-teal-800 transition-colors duration-300">Đăng nhập</span>
                        </Link>
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
                            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl border border-teal-300 mobile-dropdown-scroll max-h-80 overflow-y-auto"
                            style={{
                                backgroundColor: '#006666',
                                boxShadow: '0 20px 40px -12px rgba(0, 128, 128, 0.3)'
                            }}
                        >
                            {/* Mobile Home Link */}
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="group flex items-center px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 mb-2 text-white"
                            >
                                <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-700/50 to-cyan-700/50 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 sm:h-6 sm:w-6 mr-3 relative z-10"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                <span className="font-medium text-sm sm:text-base relative z-10">Trang chủ</span>
                            </Link>

                            {/* Mobile Menu Items */}
                            {menuItems.map((item) => (
                                <div key={item.name} className="mb-2">
                                    <button
                                        onClick={(e) => toggleDropdown(`mobile-${item.name}`, e)}
                                        className="group w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 text-white hover:text-teal-100"
                                    >
                                        <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-700/50 to-cyan-700/50 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                                        <div className="flex items-center relative z-10">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 sm:h-6 sm:w-6 mr-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                {item.icon}
                                            </svg>
                                            <span className="font-medium text-sm sm:text-base">{item.label}</span>
                                        </div>
                                        <svg
                                            className={`h-4 w-4 sm:h-5 sm:w-5 relative z-10 transition-transform duration-300 ${activeDropdown === `mobile-${item.name}` ? "rotate-180" : ""
                                                }`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>

                                    {/* Mobile Dropdown */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${activeDropdown === `mobile-${item.name}` ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="pl-4 sm:pl-6 pr-3 sm:pr-4 pb-2 space-y-2">
                                            {item.subItems.map((category, categoryIndex) => (
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
                                                            className="group block p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 hover:bg-teal-700/50"
                                                        >
                                                            <div className="text-sm font-medium text-white group-hover:text-teal-50 transition-colors duration-300">
                                                                {link.label}
                                                            </div>
                                                            {link.desc && (
                                                                <div className="text-xs text-teal-100 mt-1 group-hover:text-teal-50 transition-colors duration-300">
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
                            ))}

                            {/* Mobile Auth Links */}
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-teal-400/30">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="group w-full flex items-center justify-center px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base text-teal-700"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'
                                    }}
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Đăng nhập
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 