import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiHeart, FiUsers, FiShield, FiActivity, FiFileText, FiCalendar, FiCheckCircle, FiUserCheck, FiPieChart, FiBook, FiStar, FiArrowRight, FiPhone, FiMail, FiMapPin, FiClock, FiUser, FiEye, FiAward, FiTarget, FiBookOpen } from 'react-icons/fi';
import { PRIMARY, BACKGROUND, TEXT } from '../../constants/colors';
import { useAuth } from "../../utils/AuthContext";
import Loading from '../Loading';
import { Helmet } from 'react-helmet';

const HomePage = () => {
  const { user, isAuthenticated, hasRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);



  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isAuthenticated()) {
        setIsLoading(true);
        try {
          // Chỉ redirect admin và manager
          if (hasRole('admin')) {
            setRedirectPath('/admin/dashboard');
          } else if (hasRole('manager')) {
            setRedirectPath('/manager/dashboard');
          }
          // Student, parent và nurse có thể xem HomePage
        } catch (error) {
          console.error('Error checking authentication:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuthAndRedirect();
  }, [user, isAuthenticated, hasRole]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return <Loading />;
  }

  // Redirect if path is set (chỉ cho admin và manager)
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Cập nhật lại các nút và link dựa trên trạng thái đăng nhập
  const getActionButton = () => {
    if (!isAuthenticated()) {
      return (
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white shadow-lg"
          style={{ backgroundColor: PRIMARY[500] }}
        >
          <FiArrowRight className="w-5 h-5 mr-2" />
          Đăng nhập hệ thống
        </Link>
      );
    }

    // Nếu đã đăng nhập, hiển thị nút đến dashboard tương ứng
    let dashboardPath = '';
    let buttonText = 'Đến Dashboard';

    if (hasRole('nurse')) {
      dashboardPath = '/nurse/dashboard';
      buttonText = 'Đến Trang Y tế';
    } else if (hasRole('parent')) {
      dashboardPath = '/parent/health-profile';
      buttonText = 'Xem Hồ Sơ Con';
    } else if (hasRole('student')) {
      dashboardPath = '/student/health-profile';
      buttonText = 'Xem Hồ Sơ Y tế';
    } else {
      dashboardPath = '/blog';
      buttonText = 'Đến Blog';
    }

    return (
      <Link
        to={dashboardPath}
        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white shadow-lg"
        style={{ backgroundColor: PRIMARY[500] }}
      >
        <FiArrowRight className="w-5 h-5 mr-2" />
        {buttonText}
      </Link>
    );
  };

  const mainFeatures = [
    {
      icon: FiFileText,
      title: "Hồ sơ sức khỏe học sinh",
      description: "Quản lý toàn diện thông tin sức khỏe: dị ứng, bệnh mãn tính, tiền sử điều trị, thị lực, thính lực, tiêm chủng",
      color: PRIMARY[500],
      bgColor: PRIMARY[50]
    },
    {
      icon: FiActivity,
      title: "Xử lý sự kiện y tế",
      description: "Ghi nhận và xử lý nhanh chóng các sự kiện y tế: tai nạn, sốt, té ngã, dịch bệnh trong trường học",
      color: PRIMARY[600],
      bgColor: PRIMARY[50]
    },
    {
      icon: FiShield,
      title: "Quản lý thuốc & vật tư",
      description: "Theo dõi thuốc từ phụ huynh, quản lý kho thuốc và vật tư y tế cho các hoạt động chăm sóc sức khỏe",
      color: PRIMARY[700],
      bgColor: PRIMARY[50]
    },
    {
      icon: FiCheckCircle,
      title: "Tiêm chủng tại trường",
      description: "Quy trình hoàn chỉnh: thông báo phụ huynh → chuẩn bị danh sách → tiêm chủng → theo dõi sau tiêm",
      color: PRIMARY[500],
      bgColor: PRIMARY[50]
    },
    {
      icon: FiCalendar,
      title: "Kiểm tra y tế định kỳ",
      description: "Tổ chức kiểm tra định kỳ: thông báo → danh sách → thực hiện → báo cáo kết quả cho phụ huynh",
      color: PRIMARY[600],
      bgColor: PRIMARY[50]
    },
    {
      icon: FiPieChart,
      title: "Dashboard & Báo cáo",
      description: "Thống kê tổng quan, báo cáo chi tiết về tình hình sức khỏe học sinh và hoạt động y tế trường học",
      color: PRIMARY[700],
      bgColor: PRIMARY[50]
    }
  ];



  const blogPosts = [
    {
      id: 1,
      title: "5 Cách Phòng Ngừa Cảm Cúm Cho Học Sinh",
      excerpt: "Hướng dẫn chi tiết về các biện pháp phòng ngừa cảm cúm hiệu quả cho học sinh trong mùa đông...",
      author: "BS. Nguyễn Thị Lan",
      date: "15/12/2023",
      readTime: "5 phút",
      views: "1,234",
      category: "Phòng bệnh",
      color: PRIMARY[500]
    },
    {
      id: 2,
      title: "Tầm Quan Trọng Của Kiểm Tra Mắt Định Kỳ",
      excerpt: "Tại sao việc kiểm tra thị lực định kỳ lại quan trọng đối với học sinh và cách thực hiện hiệu quả...",
      author: "BS. Trần Văn Minh",
      date: "12/12/2023",
      readTime: "7 phút",
      views: "987",
      category: "Kiểm tra sức khỏe",
      color: PRIMARY[500]
    },
    {
      id: 3,
      title: "Dinh Dưỡng Cân Bằng Cho Học Sinh",
      excerpt: "Hướng dẫn xây dựng chế độ dinh dưỡng hợp lý giúp học sinh phát triển toàn diện về thể chất và trí tuệ...",
      author: "CN. Lê Thị Hoa",
      date: "10/12/2023",
      readTime: "8 phút",
      views: "1,567",
      category: "Dinh dưỡng",
      color: PRIMARY[500]
    },
    {
      id: 4,
      title: "Quản Lý Stress Học Tập Hiệu Quả",
      excerpt: "Các phương pháp giúp học sinh quản lý áp lực học tập và duy trì sức khỏe tinh thần tích cực...",
      author: "ThS. Phạm Minh Tuấn",
      date: "08/12/2023",
      readTime: "6 phút",
      views: "2,156",
      category: "Sức khỏe tinh thần",
      color: PRIMARY[500]
    }
  ];

  const schoolValues = [
    {
      icon: FiTarget,
      title: "Sứ mệnh",
      description: "Đảm bảo sức khỏe toàn diện cho mọi học sinh với các dịch vụ y tế chất lượng cao và chuyên nghiệp."
    },
    {
      icon: FiAward,
      title: "Tầm nhìn",
      description: "Trở thành hệ thống quản lý y tế học đường tiên phong, hiện đại và đáng tin cậy nhất Việt Nam."
    },
    {
      icon: FiHeart,
      title: "Giá trị cốt lõi",
      description: "Chăm sóc tận tâm, an toàn tuyệt đối, minh bạch thông tin và hợp tác chặt chẽ với phụ huynh."
    }
  ];

  return (
    <>
      <Helmet>
        <title>MeduCare - Hệ thống quản lý y tế học đường</title>
        <meta name="description" content="MeduCare - Hệ thống quản lý y tế học đường hiện đại nhất. Chúng tôi cung cấp giải pháp toàn diện cho việc chăm sóc sức khỏe học sinh, hỗ trợ phụ huynh, nhân viên y tế và ban quản lý trường học." />
        <meta name="keywords" content="y tế học đường, quản lý y tế, sức khỏe học sinh, tiêm chủng học đường, khám sức khỏe định kỳ" />
        <meta property="og:title" content="MeduCare - Hệ thống quản lý y tế học đường" />
        <meta property="og:description" content="Giải pháp toàn diện cho việc chăm sóc sức khỏe học sinh tại trường học" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Only render homepage content if user is not authenticated */}
      <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.DEFAULT }}>
        {/* Hero Section */}
        <section
          className="relative py-20 lg:py-32 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${PRIMARY[50]} 0%, ${BACKGROUND.DEFAULT} 50%, ${PRIMARY[25] || '#f0fffe'} 100%)`
          }}
        >
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 gap-4 h-full p-8">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center">
                  <FiHeart className="h-8 w-8" style={{ color: PRIMARY[300] }} />
                </div>
              ))}
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <div className="flex items-center justify-center mb-8">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mr-4 shadow-lg"
                  style={{ backgroundColor: PRIMARY[500] }}
                >
                  <FiHeart className="h-10 w-10 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl lg:text-5xl font-bold" style={{ color: TEXT.PRIMARY }}>
                    <span style={{ color: PRIMARY[500] }}>Medu</span>
                    <span style={{ color: PRIMARY[600] }}>Care</span>
                  </h1>
                  <p className="text-lg" style={{ color: PRIMARY[600] }}>
                    Hệ thống quản lý y tế học đường
                  </p>
                </div>
              </div>

              <h2 className="text-2xl lg:text-4xl font-bold mb-6" style={{ color: TEXT.PRIMARY }}>
                Chăm sóc sức khỏe học sinh
                <br />
                <span style={{ color: PRIMARY[500] }}>Chuyên nghiệp & Toàn diện</span>
              </h2>

              <p className="text-lg lg:text-xl mb-8 leading-relaxed max-w-4xl mx-auto" style={{ color: TEXT.SECONDARY }}>
                Chào mừng bạn đến với <strong>MeduCare</strong> - Hệ thống quản lý y tế học đường hiện đại nhất.
                Chúng tôi cung cấp giải pháp toàn diện cho việc chăm sóc sức khỏe học sinh,
                hỗ trợ phụ huynh, nhân viên y tế và ban quản lý trường học.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {getActionButton()}
                <a
                  href="#about"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl border-2"
                  style={{
                    borderColor: PRIMARY[500],
                    color: PRIMARY[500],
                    backgroundColor: 'white'
                  }}
                >
                  <FiBook className="w-5 h-5 mr-2" />
                  Tìm hiểu thêm
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                Về chúng tôi
              </h2>
              <p className="text-lg lg:text-xl max-w-4xl mx-auto" style={{ color: TEXT.SECONDARY }}>
                MeduCare được phát triển với mục tiêu mang lại hệ thống quản lý y tế học đường
                hiện đại, an toàn và hiệu quả nhất cho cộng đồng giáo dục Việt Nam
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {schoolValues.map((value, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-2xl border-2"
                  style={{ borderColor: PRIMARY[100] }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: PRIMARY[50] }}
                  >
                    <value.icon className="h-10 w-10" style={{ color: PRIMARY[500] }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                    {value.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: TEXT.SECONDARY }}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20" style={{ backgroundColor: BACKGROUND.DEFAULT }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                Tính năng chính
              </h2>
              <p className="text-lg lg:text-xl max-w-3xl mx-auto" style={{ color: TEXT.SECONDARY }}>
                Hệ thống tích hợp đầy đủ các chức năng cần thiết cho việc quản lý y tế học đường hiện đại
              </p>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {mainFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8"
                >
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <feature.icon className="h-8 w-8" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: TEXT.SECONDARY }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                Blog sức khỏe học đường
              </h2>
              <p className="text-lg lg:text-xl max-w-3xl mx-auto" style={{ color: TEXT.SECONDARY }}>
                Chia sẻ kiến thức, kinh nghiệm và hướng dẫn chăm sóc sức khỏe học sinh từ các chuyên gia
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {blogPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: post.color }}
                      >
                        {post.category}
                      </span>
                      <div className="text-6xl">{post.image}</div>
                    </div>

                    <h3 className="text-xl font-bold mb-3"
                      style={{ color: TEXT.PRIMARY }}>
                      {post.title}
                    </h3>

                    <p className="mb-4 leading-relaxed" style={{ color: TEXT.SECONDARY }}>
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm" style={{ color: TEXT.SECONDARY }}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FiUser className="h-4 w-4 mr-1" />
                          {post.author}
                        </div>
                        <div className="flex items-center">
                          <FiClock className="h-4 w-4 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <FiEye className="h-4 w-4 mr-1" />
                          {post.views}
                        </div>
                        <span>{post.date}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        className="inline-flex items-center font-medium"
                        style={{ color: post.color }}
                      >
                        Đọc thêm
                        <FiArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/blog"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl border-2"
                style={{
                  borderColor: PRIMARY[500],
                  color: PRIMARY[500],
                  backgroundColor: 'white'
                }}
              >
                <FiBookOpen className="w-5 h-5 mr-2" />
                Xem tất cả bài viết
              </Link>
            </div>
          </div>
        </section>



        {/* Process Section */}
        <section className="py-20" style={{ backgroundColor: BACKGROUND.DEFAULT }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                Quy trình hoạt động
              </h2>
              <p className="text-lg lg:text-xl max-w-3xl mx-auto" style={{ color: TEXT.SECONDARY }}>
                Quy trình được chuẩn hóa và tối ưu hóa cho hiệu quả cao nhất trong việc chăm sóc sức khỏe học sinh
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                    style={{ backgroundColor: PRIMARY[100] }}
                  >
                    <FiShield className="h-6 w-6" style={{ color: PRIMARY[600] }} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                    Quy trình tiêm chủng
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    "Gửi phiếu thông báo đồng ý tiêm chủng cho phụ huynh",
                    "Chuẩn bị danh sách học sinh tiêm chủng",
                    "Thực hiện tiêm chủng và ghi nhận kết quả",
                    "Theo dõi tình trạng sức khỏe sau tiêm"
                  ].map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 text-white font-bold text-sm"
                        style={{ backgroundColor: PRIMARY[600] }}
                      >
                        {index + 1}
                      </div>
                      <p style={{ color: TEXT.SECONDARY }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                    style={{ backgroundColor: PRIMARY[100] }}
                  >
                    <FiActivity className="h-6 w-6" style={{ color: PRIMARY[600] }} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: TEXT.PRIMARY }}>
                    Quy trình kiểm tra y tế
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    "Gửi phiếu thông báo kiểm tra y tế cho phụ huynh",
                    "Chuẩn bị danh sách học sinh kiểm tra",
                    "Thực hiện kiểm tra và ghi nhận kết quả",
                    "Gửi kết quả và lập lịch tư vấn nếu cần"
                  ].map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 text-white font-bold text-sm"
                        style={{ backgroundColor: PRIMARY[600] }}
                      >
                        {index + 1}
                      </div>
                      <p style={{ color: TEXT.SECONDARY }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20" style={{ backgroundColor: PRIMARY[50] }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>
                Liên hệ với chúng tôi
              </h2>
              <p className="text-lg lg:text-xl max-w-3xl mx-auto" style={{ color: TEXT.SECONDARY }}>
                Chúng tôi luôn sẵn sàng hỗ trợ bạn trong việc sử dụng hệ thống và giải đáp mọi thắc mắc
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: PRIMARY[50] }}
                >
                  <FiPhone className="h-8 w-8" style={{ color: PRIMARY[500] }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                  Hotline
                </h3>
                <p style={{ color: TEXT.SECONDARY }}>1900-1234</p>
                <p className="text-sm opacity-75" style={{ color: TEXT.SECONDARY }}>
                  24/7 hỗ trợ
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: PRIMARY[100] }}
                >
                  <FiMail className="h-8 w-8" style={{ color: PRIMARY[600] }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                  Email
                </h3>
                <p style={{ color: TEXT.SECONDARY }}>support@meducare.edu.vn</p>
                <p className="text-sm opacity-75" style={{ color: TEXT.SECONDARY }}>
                  Phản hồi trong 24h
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: PRIMARY[200] }}
                >
                  <FiMapPin className="h-8 w-8" style={{ color: PRIMARY[700] }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                  Địa chỉ
                </h3>
                <p style={{ color: TEXT.SECONDARY }}>123 Đường ABC, Quận XYZ</p>
                <p className="text-sm opacity-75" style={{ color: TEXT.SECONDARY }}>
                  TP. Hồ Chí Minh
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
