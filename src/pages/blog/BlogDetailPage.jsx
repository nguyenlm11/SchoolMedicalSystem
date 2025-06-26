import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiTag, FiShare2, FiHeart, FiBookmark, FiClock, FiEye, FiMessageCircle, FiMail, FiPhone, FiMapPin, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND } from '../../constants/colors';
import Loading from '../../components/Loading';

const BlogDetailPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);

    // Mock related posts
    const relatedPosts = [
        {
            id: "1",
            title: "Dinh Dưỡng Học Đường: Xây Dựng Thực Đơn Cân Bằng",
            imageUrl: "/images/blog/nutrition.jpg",
            categoryName: "Dinh dưỡng",
            authorName: "BS. Trần Thị Mai",
            createdDate: "2023-12-15"
        },
        {
            id: "2",
            title: "Phòng Ngừa Các Bệnh Thường Gặp Ở Trẻ Em",
            imageUrl: "/images/blog/prevention.jpg",
            categoryName: "Phòng bệnh",
            authorName: "BS. Nguyễn Văn Nam",
            createdDate: "2023-12-10"
        }
    ];

    useEffect(() => {
        const fetchBlogDetail = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock data according to API structure
                const mockResponse = {
                    success: true,
                    message: "Lấy chi tiết bài viết thành công",
                    data: {
                        id: "3fa85f64-5717-4562-b3fc-2c963f66afa1",
                        title: "Hướng Dẫn Toàn Diện Về Tiêm Chủng Cho Học Sinh",
                        content: `<div class="blog-content">
                            <p class="text-lg leading-relaxed mb-8">Tiêm chủng là một trong những biện pháp y tế dự phòng hiệu quả nhất, giúp bảo vệ trẻ em khỏi nhiều bệnh truyền nhiễm nguy hiểm. Bài viết này sẽ cung cấp thông tin chi tiết về lịch tiêm chủng, các loại vaccine quan trọng và cách chuẩn bị cho con em trước khi tiêm chủng tại trường học.</p>
                            
                            <h2 class="text-2xl font-bold mb-4 mt-8">1. Tầm Quan Trọng của Tiêm Chủng</h2>
                            <p class="text-lg leading-relaxed mb-6">Tiêm chủng không chỉ bảo vệ cá nhân mà còn tạo nên miễn dịch cộng đồng, giúp ngăn chặn sự lây lan của các bệnh truyền nhiễm. Đặc biệt trong môi trường học đường, nơi học sinh thường xuyên tiếp xúc gần, việc đảm bảo tỷ lệ tiêm chủng cao là vô cùng quan trọng.</p>
                            
                            <h2 class="text-2xl font-bold mb-4 mt-8">2. Lịch Tiêm Chủng Chuẩn cho Học Sinh</h2>
                            <p class="text-lg leading-relaxed mb-4">Theo khuyến cáo của Bộ Y tế, học sinh cần được tiêm đầy đủ các mũi vaccine sau:</p>
                            <ul class="list-disc list-inside space-y-2 mb-6 ml-4">
                                <li class="text-lg">Vaccine phòng bệnh Sởi - Quai bị - Rubella (MMR)</li>
                                <li class="text-lg">Vaccine phòng bệnh Bạch hầu - Ho gà - Uốn ván (DPT)</li>
                                <li class="text-lg">Vaccine phòng bệnh Viêm gan B</li>
                                <li class="text-lg">Vaccine phòng bệnh Cúm mùa</li>
                            </ul>
                            
                            <h2 class="text-2xl font-bold mb-4 mt-8">3. Chuẩn Bị Trước Khi Tiêm Chủng</h2>
                            <p class="text-lg leading-relaxed mb-4">Để đảm bảo an toàn và hiệu quả khi tiêm chủng, phụ huynh cần lưu ý:</p>
                            <ul class="list-disc list-inside space-y-2 mb-6 ml-4">
                                <li class="text-lg">Kiểm tra sức khỏe tổng quát của trẻ</li>
                                <li class="text-lg">Thông báo cho nhân viên y tế về tiền sử dị ứng (nếu có)</li>
                                <li class="text-lg">Chuẩn bị sổ tiêm chủng và các giấy tờ cần thiết</li>
                                <li class="text-lg">Cho trẻ ăn uống đầy đủ trước khi tiêm</li>
                            </ul>
                            
                            <h2 class="text-2xl font-bold mb-4 mt-8">4. Theo Dõi Sau Tiêm Chủng</h2>
                            <p class="text-lg leading-relaxed mb-4">Sau khi tiêm, cần theo dõi trẻ trong vòng 30 phút tại cơ sở y tế và tiếp tục theo dõi tại nhà trong 24-48 giờ. Các phản ứng thông thường có thể gặp:</p>
                            <ul class="list-disc list-inside space-y-2 mb-6 ml-4">
                                <li class="text-lg">Sốt nhẹ</li>
                                <li class="text-lg">Đau tại chỗ tiêm</li>
                                <li class="text-lg">Mệt mỏi, chán ăn</li>
                            </ul>
                            
                            <h2 class="text-2xl font-bold mb-4 mt-8">5. Kết Luận</h2>
                            <p class="text-lg leading-relaxed mb-8">Tiêm chủng là biện pháp quan trọng trong việc bảo vệ sức khỏe học sinh. Việc tuân thủ lịch tiêm chủng và thực hiện đúng quy trình sẽ giúp đảm bảo hiệu quả và an toàn cho trẻ.</p>
                        </div>`,
                        imageUrl: "/images/blog/vaccination-detail.jpg",
                        authorName: "BS. Nguyễn Minh Hạnh",
                        isPublished: true,
                        categoryName: "Tiêm chủng",
                        createdDate: "2023-12-20T08:28:04.268Z",
                        isFeatured: true
                    },
                    errors: []
                };

                if (mockResponse.success) {
                    setBlog(mockResponse.data);
                } else {
                    setError(mockResponse.message || "Có lỗi xảy ra khi tải bài viết");
                }
            } catch (err) {
                setError("Không thể tải bài viết. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlogDetail();
    }, [id]);

    const handleShare = (platform) => {
        // Mock share functionality
        console.log(`Sharing to ${platform}`);
        setShowShareOptions(false);
    };

    const ShareOptions = () => (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg p-2 w-48 z-50">
            <button
                onClick={() => handleShare('facebook')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center text-sm"
            >
                <img src="/images/social/facebook.png" alt="Facebook" className="w-5 h-5 mr-3" />
                Facebook
            </button>
            <button
                onClick={() => handleShare('twitter')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center text-sm"
            >
                <img src="/images/social/twitter.png" alt="Twitter" className="w-5 h-5 mr-3" />
                Twitter
            </button>
            <button
                onClick={() => handleShare('linkedin')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center text-sm"
            >
                <img src="/images/social/linkedin.png" alt="LinkedIn" className="w-5 h-5 mr-3" />
                LinkedIn
            </button>
        </div>
    );

    const formatContent = (content) => {
        return content.replace(
            /<h2/g,
            '<h2 class="text-3xl font-bold mb-6 mt-12 text-gray-900 scroll-mt-20"'
        ).replace(
            /<h3/g,
            '<h3 class="text-2xl font-bold mb-4 mt-8 text-gray-900"'
        ).replace(
            /<p>/g,
            '<p class="text-lg leading-relaxed mb-6 text-gray-700">'
        ).replace(
            /<ul>/g,
            '<ul class="space-y-4 mb-8 ml-6">'
        ).replace(
            /<li>/g,
            '<li class="flex items-start text-lg text-gray-700"><span class="inline-block w-2 h-2 rounded-full bg-cyan-500 mt-2.5 mr-4 flex-shrink-0"></span>'
        ).replace(
            /<blockquote>/g,
            '<blockquote class="border-l-4 border-cyan-500 pl-6 my-8 italic text-gray-700">'
        );
    };

    if (isLoading) {
        return <Loading type="medical" size="large" color="primary" text="Đang tải bài viết..." fullScreen={true} />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>{error}</h2>
                    <Link
                        to="/blog"
                        className="inline-flex items-center px-6 py-3 rounded-xl text-white font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                        style={{ backgroundColor: PRIMARY[500] }}
                    >
                        <FiArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại trang Blog
                    </Link>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: TEXT.PRIMARY }}>Không tìm thấy bài viết</h2>
                    <Link
                        to="/blog"
                        className="inline-flex items-center px-6 py-3 rounded-xl text-white font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                        style={{ backgroundColor: PRIMARY[500] }}
                    >
                        <FiArrowLeft className="w-5 h-5 mr-2" />
                        Quay lại trang Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <Link
                            to="/blog"
                            className="inline-flex items-center text-sm font-medium hover:text-cyan-600 transition-colors duration-200 group"
                            style={{ color: TEXT.SECONDARY }}
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                            Quay lại Blog
                        </Link>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={`p-2 rounded-lg transition-all duration-200 ${isLiked ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                title={isLiked ? 'Bỏ thích' : 'Thích bài viết'}
                            >
                                <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={() => setIsSaved(!isSaved)}
                                className={`p-2 rounded-lg transition-all duration-200 ${isSaved ? 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                title={isSaved ? 'Bỏ lưu' : 'Lưu bài viết'}
                            >
                                <FiBookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowShareOptions(!showShareOptions)}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
                                    title="Chia sẻ"
                                >
                                    <FiShare2 className="w-5 h-5" />
                                </button>
                                {showShareOptions && <ShareOptions />}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <article className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        {/* Header Section */}
                        <header className="mb-12">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span
                                    className="px-3 py-1 rounded-full text-sm font-medium text-white shadow-sm"
                                    style={{ backgroundColor: PRIMARY[500] }}
                                >
                                    {blog.categoryName}
                                </span>
                                {blog.isFeatured && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 shadow-sm">
                                        Bài viết nổi bật
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-black mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                {blog.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-3 shadow-md">
                                        <FiUser className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{blog.authorName}</p>
                                        <p className="text-sm text-gray-600">Bác sĩ chuyên khoa</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                                        <FiCalendar className="w-4 h-4 mr-2 text-cyan-500" />
                                        <span>{new Date(blog.createdDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                                        <FiClock className="w-4 h-4 mr-2 text-cyan-500" />
                                        <span>5 phút đọc</span>
                                    </div>
                                    <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                                        <FiEye className="w-4 h-4 mr-2 text-cyan-500" />
                                        <span>1.2k lượt xem</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {blog.imageUrl && (
                            <div className="mb-12">
                                <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-xl">
                                    <img
                                        src={blog.imageUrl}
                                        alt={blog.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p className="mt-4 text-sm text-center text-gray-500 italic">
                                    Hình ảnh minh họa cho bài viết
                                </p>
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg max-w-none mb-12">
                            <div
                                className="bg-white rounded-2xl shadow-sm p-8 lg:p-12"
                                dangerouslySetInnerHTML={{ __html: formatContent(blog.content) }}
                            />
                        </div>

                        {/* Tags */}
                        <div className="mb-12">
                            <div className="flex flex-wrap gap-2">
                                <span className="px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-gray-700 hover:text-cyan-600">
                                    #tiemchung
                                </span>
                                <span className="px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-gray-700 hover:text-cyan-600">
                                    #ytehocduong
                                </span>
                                <span className="px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-gray-700 hover:text-cyan-600">
                                    #vaccine
                                </span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex items-center justify-between py-6 border-t border-gray-200">
                            <Link
                                to="/blog/prev"
                                className="flex items-center text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors duration-200 group bg-white px-6 py-3 rounded-xl shadow-sm hover:shadow-md"
                            >
                                <FiChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                                Bài viết trước
                            </Link>
                            <Link
                                to="/blog/next"
                                className="flex items-center text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors duration-200 group bg-white px-6 py-3 rounded-xl shadow-sm hover:shadow-md"
                            >
                                Bài viết sau
                                <FiChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                            </Link>
                        </nav>
                    </div>

                    {/* Related Posts Sidebar */}
                    <aside className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24">
                            <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT.PRIMARY }}>Bài viết liên quan</h2>
                            <div className="space-y-6">
                                {relatedPosts.map(post => (
                                    <Link key={post.id} to={`/blog/${post.id}`} className="group block">
                                        <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                            <div className="aspect-w-16 aspect-h-9">
                                                <img
                                                    src={post.imageUrl}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <span className="text-xs font-medium px-2 py-1 rounded-full"
                                                    style={{ backgroundColor: PRIMARY[50], color: PRIMARY[600] }}>
                                                    {post.categoryName}
                                                </span>
                                                <h3 className="mt-3 text-base font-bold leading-snug group-hover:text-cyan-600 transition-colors duration-200"
                                                    style={{ color: TEXT.PRIMARY }}>
                                                    {post.title}
                                                </h3>
                                                <div className="mt-3 flex items-center text-sm" style={{ color: TEXT.SECONDARY }}>
                                                    <FiCalendar className="w-4 h-4 mr-2" />
                                                    <span>{new Date(post.createdDate).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </article>
            </main>
        </div>
    );
};

export default BlogDetailPage;
