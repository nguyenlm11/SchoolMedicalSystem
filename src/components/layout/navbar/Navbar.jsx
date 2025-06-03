import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Đóng dropdown
  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  // Menu items configuration
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
            { to: "/parent/health-profile", label: "Danh sách hồ sơ sức khỏe" },
            { to: "/parent/health-profile/new", label: "Khai báo hồ sơ sức khỏe" },
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
          d="M12 14l9-5-9-5-9 5 9 5m0 0l9-5-9-5-9 5 9 5m0 0v6"
        />
      ),
      subItems: [
        {
          category: "Phụ huynh",
          links: [
            { to: "/parent/vaccination/consent/new", label: "Phiếu đồng ý tiêm chủng" },
          ],
        },
        {
          category: "Nhân viên y tế",
          links: [
            { to: "/staff/vaccination", label: "Quản lý tiêm chủng" },
            { to: "/staff/vaccination/flow", label: "Quy trình tiêm chủng" },
          ],
        },
      ],
    },
    {
      name: "medication",
      label: "Thuốc",
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
            { to: "/parent/medication/request", label: "Gửi thuốc" },
            { to: "/parent/medication/history", label: "Lịch sử gửi thuốc" },
            { to: "/parent/dashboard", label: "Bảng điều khiển" },
          ],
        },
        {
          category: "Nhân viên y tế",
          links: [
            { to: "/staff/medication", label: "Quản lý thuốc" },
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
            { to: "/staff/health-events", label: "Danh sách sự kiện y tế" },
            { to: "/staff/health-events/new", label: "Thêm sự kiện mới" },
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
            { to: "/parent/health-check", label: "Xác nhận kiểm tra" },
            { to: "/parent/health-check/results", label: "Xem kết quả kiểm tra" },
          ],
        },
        {
          category: "Nhân viên y tế",
          links: [
            { to: "/staff/health-check", label: "Quản lý kiểm tra" },
            { to: "/staff/health-check/new", label: "Lên lịch kiểm tra mới" },
          ],
        },
      ],
    },
  ];

  return (
    <nav className="bg-white shadow-md w-full sticky top-0 z-50">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 mr-2 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-blue-600 font-bold text-xl tracking-tight">
                Med<span className="text-blue-800">School</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Trang chủ */}
            <Link
              to="/"
              className="text-blue-600 font-medium px-3 py-2 rounded-md hover:bg-blue-50 transition-all duration-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
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
              Trang chủ
            </Link>

            {/* Menu items with dropdowns */}
            {menuItems.map((item) => (
              <div key={item.name} className="relative" ref={dropdownRef}>
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md hover:bg-blue-50 transition-all duration-200 flex items-center group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {item.icon}
                  </svg>
                  {item.label}
                  <svg
                    className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                      activeDropdown === item.name ? "rotate-180" : ""
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

                {/* Dropdown Menu */}
                {activeDropdown === item.name && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {item.subItems.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                          {categoryIndex > 0 && (
                            <div className="border-t border-gray-100 my-1"></div>
                          )}
                          <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                            {category.category}
                          </div>
                          {category.links.map((link, linkIndex) => (
                            <Link
                              key={linkIndex}
                              to={link.to}
                              onClick={closeDropdown}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Links */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-md border border-blue-200 hover:border-blue-400 transition-all duration-200 font-medium bg-blue-50 hover:bg-blue-100 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {/* Trang chủ mobile */}
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-blue-600 font-medium block px-4 py-3 rounded-md hover:bg-blue-50 transition flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
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
                Trang chủ
              </Link>

              {/* Mobile menu items */}
              {menuItems.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => toggleDropdown(`mobile-${item.name}`)}
                    className="text-gray-600 hover:text-blue-600 w-full text-left px-4 py-3 rounded-md hover:bg-blue-50 transition flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {item.icon}
                      </svg>
                      {item.label}
                    </div>
                    <svg
                      className={`h-5 w-5 transition-transform duration-200 ${
                        activeDropdown === `mobile-${item.name}` ? "rotate-180" : ""
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

                  {activeDropdown === `mobile-${item.name}` && (
                    <div className="pl-8 pr-4 pb-2 space-y-1">
                      {item.subItems.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                          <p className="text-xs text-gray-500 px-3 py-2 uppercase font-semibold">
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
                              className="block text-gray-600 hover:text-blue-600 py-2 px-3 text-sm transition"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile auth links */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-blue-600 hover:text-blue-800 block px-4 py-3 rounded-md hover:bg-blue-50 transition flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-blue-600 hover:text-blue-800 block px-4 py-3 rounded-md hover:bg-blue-50 transition flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 