import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiCalendar, FiUser, FiClock, FiEye, FiArrowRight, FiBookmark, FiTag, FiHeart, FiStar, FiAward } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND } from '../../constants/colors';
import Loading from '../../components/Loading';

export default function BlogPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                setIsSearching(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    const featuredPosts = [
        {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa1",
            title: "Hướng Dẫn Toàn Diện Về Tiêm Chủng Cho Học Sinh",
            content: "Tìm hiểu về lịch tiêm chủng, các loại vaccine quan trọng và cách chuẩn bị cho con em trước khi tiêm chủng tại trường học...",
            imageUrl: "/images/blog/vaccination.jpg",
            authorName: "BS. Nguyễn Minh Hạnh",
            isPublished: true,
            categoryName: "Sức khỏe học đường",
            createdDate: "2023-12-20T08:28:04.268Z",
            isFeatured: true
        },
        {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa2",
            title: "Dinh Dưỡng Học Đường: Xây Dựng Thực Đơn Cân Bằng",
            content: "Hướng dẫn chi tiết về cách xây dựng thực đơn dinh dưỡng cân bằng cho học sinh, đảm bảo phát triển toàn diện về thể chất và trí tuệ...",
            imageUrl: "/images/blog/nutrition.jpg",
            authorName: "CN. Lê Thị Minh Châu",
            isPublished: true,
            categoryName: "Dinh dưỡng",
            createdDate: "2023-12-18T08:28:04.268Z",
            isFeatured: true
        }
    ];

    const blogPosts = [
        {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa3",
            title: "5 Cách Phòng Ngừa Cảm Cúm Hiệu Quả Cho Học Sinh",
            content: "Hướng dẫn chi tiết về các biện pháp phòng ngừa cảm cúm hiệu quả cho học sinh trong mùa đông...",
            imageUrl: "/images/blog/flu-prevention.jpg",
            authorName: "BS. Nguyễn Thị Lan",
            isPublished: true,
            categoryName: "Phòng bệnh",
            createdDate: "2023-12-15T08:28:04.268Z",
            isFeatured: false
        },
        {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa4",
            title: "Tầm Quan Trọng Của Kiểm Tra Sức Khỏe Định Kỳ",
            content: "Tại sao việc kiểm tra sức khỏe định kỳ lại quan trọng đối với học sinh và cách thực hiện hiệu quả...",
            imageUrl: "/images/blog/eye-check.jpg",
            authorName: "BS. Trần Văn Minh",
            isPublished: true,
            categoryName: "Sức khỏe học đường",
            createdDate: "2023-12-12T08:28:04.268Z",
            isFeatured: false
        },
        {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa5",
            title: "Chế Độ Dinh Dưỡng Cho Học Sinh Mùa Thi",
            content: "Hướng dẫn xây dựng chế độ dinh dưỡng khoa học giúp học sinh duy trì sức khỏe và tập trung học tập trong mùa thi...",
            imageUrl: "/images/blog/nutrition-exam.jpg",
            authorName: "ThS. Phạm Minh Tuấn",
            isPublished: true,
            categoryName: "Dinh dưỡng",
            createdDate: "2023-12-08T08:28:04.268Z",
            isFeatured: false
        },
        {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            title: "Phòng Ngừa Các Bệnh Truyền Nhiễm Trong Trường Học",
            content: "Các biện pháp phòng ngừa hiệu quả các bệnh truyền nhiễm thường gặp trong môi trường học đường...",
            imageUrl: "/images/blog/prevention.jpg",
            authorName: "BS. Lê Thị Hương",
            isPublished: true,
            categoryName: "Phòng bệnh",
            createdDate: "2023-12-05T08:28:04.268Z",
            isFeatured: false
        },
        {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa7",
            title: "Dinh Dưỡng Cho Trẻ Biếng Ăn",
            content: "Giải pháp dinh dưỡng và thực đơn phù hợp cho trẻ biếng ăn, giúp cải thiện tình trạng dinh dưỡng...",
            imageUrl: "/images/blog/picky-eating.jpg",
            authorName: "CN. Nguyễn Văn Đức",
            isPublished: true,
            categoryName: "Dinh dưỡng",
            createdDate: "2023-12-02T08:28:04.268Z",
            isFeatured: false
        },
        {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa8",
            title: "Tăng Cường Sức Đề Kháng Cho Học Sinh",
            content: "Những phương pháp tự nhiên và hiệu quả giúp tăng cường hệ miễn dịch cho học sinh...",
            imageUrl: "/images/blog/immune-system.jpg",
            authorName: "BS. Trần Thị Mai",
            isPublished: true,
            categoryName: "Sức khỏe học đường",
            createdDate: "2023-11-28T08:28:04.268Z",
            isFeatured: false
        }
    ];

    const categories = [
        {
            id: 'all',
            title: 'Tất cả',
            content: 'Tất cả bài viết',
            isPublished: true,
            totalPosts: blogPosts.length + featuredPosts.length
        },
        {
            id: 'suc-khoe-hoc-duong',
            title: 'Sức khỏe học đường',
            content: 'Bài viết về sức khỏe học đường',
            isPublished: true,
            totalPosts: blogPosts.filter(post => post.categoryName === 'Sức khỏe học đường').length + featuredPosts.filter(post => post.categoryName === 'Sức khỏe học đường').length
        },
        {
            id: 'dinh-duong',
            title: 'Dinh dưỡng',
            content: 'Bài viết về dinh dưỡng',
            isPublished: true,
            totalPosts: blogPosts.filter(post => post.categoryName === 'Dinh dưỡng').length + featuredPosts.filter(post => post.categoryName === 'Dinh dưỡng').length
        },
        {
            id: 'phong-benh',
            title: 'Phòng bệnh',
            content: 'Bài viết về phòng bệnh',
            isPublished: true,
            totalPosts: blogPosts.filter(post => post.categoryName === 'Phòng bệnh').length + featuredPosts.filter(post => post.categoryName === 'Phòng bệnh').length
        }
    ];

    const recentPosts = blogPosts.slice(0, 4);

    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = selectedCategory === 'all' ||
            post.categoryName === categories.find(cat => cat.id === selectedCategory)?.title;
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (isLoading) {
        return <Loading type="medical" size="large" color="primary" text="Đang tải blog..." fullScreen={true} />;
    }

    const FeaturedCard = ({ post }) => (
        <article className="group relative bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl overflow-hidden hover:shadow-xl lg:hover:shadow-2xl transform hover:-translate-y-1 lg:hover:-translate-y-2 transition-all duration-300 lg:duration-500">
            <div
                className="h-40 sm:h-48 lg:h-52 relative overflow-hidden"
                style={{ backgroundColor: PRIMARY[500] }}
            >
                {post.imageUrl && (
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="absolute top-4 lg:top-6 left-4 lg:left-6">
                    <span className="inline-flex items-center px-3 py-1 lg:px-4 lg:py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white font-bold text-xs lg:text-sm">
                        <FiStar className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                        Bài viết nổi bật
                    </span>
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <span
                        className="px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-bold text-white shadow-lg"
                        style={{ backgroundColor: PRIMARY[500] }}
                    >
                        {post.categoryName}
                    </span>
                    <button className="p-1 lg:p-2 rounded-full hover:bg-gray-100 transition-colors duration-300">
                        <FiHeart className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 hover:text-red-500 transition-colors duration-300" />
                    </button>
                </div>

                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 lg:mb-4 leading-tight group-hover:text-current transition-colors duration-300" style={{ color: TEXT.PRIMARY }}>
                    <Link to={`/blog/${post.id}`} className="hover:underline" style={{ ':hover': { color: PRIMARY[600] } }}>
                        {post.title}
                    </Link>
                </h3>

                <p className="text-sm sm:text-base lg:text-lg leading-relaxed mb-4 lg:mb-6" style={{ color: TEXT.SECONDARY }}>
                    {post.content}
                </p>

                <div className="flex items-center justify-between mb-4 lg:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 lg:space-x-4 text-xs lg:text-sm" style={{ color: TEXT.SECONDARY }}>
                        <div className="flex items-center px-2 py-1 lg:px-3 lg:py-1 rounded-full mb-1 sm:mb-0" style={{ backgroundColor: GRAY[50] }}>
                            <FiUser className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                            <span className="truncate">{post.authorName}</span>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center px-2 py-1 lg:px-3 lg:py-1 rounded-full" style={{ backgroundColor: GRAY[50] }}>
                                <FiCalendar className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                {new Date(post.createdDate).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                    </div>
                </div>

                <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center mt-4 lg:mt-6 px-4 py-2 lg:px-6 lg:py-3 text-white font-bold rounded-xl lg:rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm lg:text-base"
                    style={{ backgroundColor: PRIMARY[500] }}
                >
                    Đọc ngay
                    <FiArrowRight className="w-4 h-4 lg:w-5 lg:h-5 ml-1 lg:ml-2" />
                </Link>
            </div>
        </article>
    );

    const BlogCard = ({ post }) => (
        <article className="group bg-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300" style={{ borderColor: GRAY[100], borderWidth: 1 }}>
            {post.imageUrl && (
                <div className="h-48 relative overflow-hidden">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <span
                        className="px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-bold text-white shadow-md"
                        style={{ backgroundColor: PRIMARY[500] }}
                    >
                        {post.categoryName}
                    </span>
                    <button className="p-1 lg:p-2 rounded-full hover:bg-gray-100 transition-colors duration-300">
                        <FiBookmark className="w-3 h-3 lg:w-4 lg:h-4 transition-colors duration-300" style={{ color: GRAY[400] }} />
                    </button>
                </div>

                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 lg:mb-3 leading-tight group-hover:text-current transition-colors duration-300" style={{ color: TEXT.PRIMARY }}>
                    <Link to={`/blog/${post.id}`} className="hover:underline">
                        {post.title}
                    </Link>
                </h3>

                <p className="text-sm lg:text-base leading-relaxed mb-3 lg:mb-4 line-clamp-3" style={{ color: TEXT.SECONDARY }}>
                    {post.content}
                </p>

                <div className="flex items-center justify-between pt-3 lg:pt-4" style={{ borderTopColor: GRAY[100], borderTopWidth: 1 }}>
                    <div className="flex items-center space-x-3 text-xs lg:text-sm" style={{ color: TEXT.SECONDARY }}>
                        <div className="flex items-center">
                            <FiUser className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                            <span className="truncate">{post.authorName}</span>
                        </div>
                        <div className="flex items-center">
                            <FiCalendar className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                            {new Date(post.createdDate).toLocaleDateString('vi-VN')}
                        </div>
                    </div>

                    <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center font-bold hover:opacity-80 transition-opacity duration-300 group text-sm lg:text-base"
                        style={{ color: PRIMARY[500] }}
                    >
                        Đọc thêm
                        <FiArrowRight className="w-3 h-3 lg:w-4 lg:h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </div>
            </div>
        </article>
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <section className="py-12 sm:py-16 lg:py-20 xl:py-28 relative overflow-hidden" style={{ backgroundColor: PRIMARY[500] }}>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center text-white max-w-5xl mx-auto">
                        <div className="flex items-center justify-center mb-6 lg:mb-8">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-black text-white">
                                Blog Sức Khỏe Học Đường
                            </h1>
                        </div>
                        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl opacity-90 leading-relaxed font-medium px-4">
                            Chia sẻ kiến thức, kinh nghiệm và hướng dẫn chăm sóc sức khỏe học sinh
                            từ các chuyên gia y tế hàng đầu
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 mt-6 lg:mt-8 text-white opacity-80 text-sm lg:text-base">
                            <div className="flex items-center">
                                <FiAward className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                                <span>Chuyên gia hàng đầu</span>
                            </div>
                            <div className="flex items-center">
                                <FiHeart className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                                <span>Nội dung chất lượng</span>
                            </div>
                            <div className="flex items-center">
                                <FiStar className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                                <span>Cập nhật mới nhất</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-8 lg:py-12 bg-white bg-opacity-50 backdrop-blur-sm" style={{ borderBottomColor: GRAY[200], borderBottomWidth: 1 }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center justify-between">
                            {/* Search */}
                            <div className="relative w-full lg:flex-1 lg:max-w-lg">
                                <FiSearch className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6" style={{ color: GRAY[400] }} />
                                {isSearching && (
                                    <div className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2">
                                        <Loading type="spinner" size="small" color="primary" />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bài viết..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 lg:pl-12 pr-10 lg:pr-16 py-3 lg:py-4 text-base lg:text-lg rounded-xl lg:rounded-2xl border-2 focus:outline-none focus:ring-3 focus:ring-cyan-800 transition-all duration-300 shadow-lg bg-white"
                                    style={{
                                        borderColor: GRAY[200],
                                        ':focus': {
                                            borderColor: PRIMARY[500],
                                            boxShadow: `0 0 0 4px ${PRIMARY[100]}`
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-4 w-full lg:w-auto">
                                <label className="text-base lg:text-lg font-bold flex items-center" style={{ color: TEXT.PRIMARY }}>
                                    <FiTag className="w-4 h-4 lg:w-5 lg:h-5 mr-2" style={{ color: PRIMARY[500] }} />
                                    Danh mục:
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 lg:px-6 py-3 lg:py-4 text-base lg:text-lg rounded-xl lg:rounded-2xl border-2 focus:outline-none focus:ring-3 focus:ring-cyan-800 transition-all duration-300 shadow-lg bg-white font-medium"
                                    style={{
                                        borderColor: GRAY[200],
                                        color: TEXT.PRIMARY,
                                        ':focus': {
                                            borderColor: PRIMARY[500],
                                            boxShadow: `0 0 0 4px ${PRIMARY[100]}`
                                        }
                                    }}
                                >
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.title} ({category.totalPosts})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8 lg:py-16">
                <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
                    <div className="lg:col-span-3">
                        {selectedCategory === 'all' && !searchTerm && (
                            <section className="mb-12 lg:mb-20">
                                <div className="flex items-center mb-6 lg:mb-10">
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: TEXT.PRIMARY }}>
                                        Bài viết nổi bật
                                    </h2>
                                </div>
                                <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
                                    {featuredPosts.map(post => (
                                        <FeaturedCard key={post.id} post={post} />
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-10">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black" style={{ color: TEXT.PRIMARY }}>
                                    {selectedCategory === 'all' ? 'Tất cả bài viết' :
                                        categories.find(c => c.id === selectedCategory)?.title}
                                    {searchTerm && (
                                        <span className="block sm:inline text-lg lg:text-xl ml-0 sm:ml-3 font-normal" style={{ color: TEXT.SECONDARY }}>
                                            - Kết quả cho "{searchTerm}"
                                        </span>
                                    )}
                                </h2>
                                <div className="px-3 py-2 lg:px-4 lg:py-2 rounded-full" style={{ backgroundColor: PRIMARY[100] }}>
                                    <span className="text-sm lg:text-lg font-bold" style={{ color: PRIMARY[700] }}>
                                        {filteredPosts.length} bài viết
                                    </span>
                                </div>
                            </div>

                            {filteredPosts.length > 0 ? (
                                <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                    {filteredPosts.map(post => (
                                        <BlogCard key={post.id} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 lg:py-20 rounded-2xl lg:rounded-3xl" style={{ backgroundColor: GRAY[50] }}>
                                    <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6" style={{ backgroundColor: GRAY[300] }}>
                                        <FiSearch className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
                                    </div>
                                    <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4" style={{ color: TEXT.PRIMARY }}>
                                        Không tìm thấy bài viết
                                    </h3>
                                    <p className="text-base lg:text-lg mb-4 lg:mb-6 px-4" style={{ color: TEXT.SECONDARY }}>
                                        Thử thay đổi từ khóa tìm kiếm hoặc danh mục khác nhé!
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedCategory('all');
                                        }}
                                        className="px-4 py-2 lg:px-6 lg:py-3 text-white font-bold rounded-xl lg:rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                        style={{ backgroundColor: PRIMARY[500] }}
                                    >
                                        Xem tất cả bài viết
                                    </button>
                                </div>
                            )}
                        </section>

                        <div className="flex justify-center mt-12 lg:mt-16">
                            <div className="flex items-center space-x-2 lg:space-x-3 bg-white rounded-xl lg:rounded-2xl shadow-lg p-2">
                                <button className="w-10 h-10 lg:w-12 lg:h-12 text-white font-bold rounded-lg lg:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: PRIMARY[500] }}>
                                    1
                                </button>
                                <button className="w-10 h-10 lg:w-12 lg:h-12 font-bold rounded-lg lg:rounded-xl hover:bg-gray-100 transition-all duration-300" style={{ color: TEXT.SECONDARY }}>
                                    2
                                </button>
                                <button className="w-10 h-10 lg:w-12 lg:h-12 font-bold rounded-lg lg:rounded-xl hover:bg-gray-100 transition-all duration-300" style={{ color: TEXT.SECONDARY }}>
                                    3
                                </button>
                                <span className="font-bold px-2" style={{ color: GRAY[400] }}>...</span>
                                <button className="w-10 h-10 lg:w-12 lg:h-12 font-bold rounded-lg lg:rounded-xl hover:bg-gray-100 transition-all duration-300" style={{ color: TEXT.SECONDARY }}>
                                    <FiArrowRight className="w-4 h-4 lg:w-5 lg:h-5 mx-auto" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6 lg:space-y-8">
                        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-6 lg:p-8" style={{ borderColor: GRAY[100], borderWidth: 1 }}>
                            <h3 className="text-xl lg:text-2xl font-black mb-6 lg:mb-8 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiTag className="w-5 h-5 lg:w-6 lg:h-6 mr-3" style={{ color: PRIMARY[500] }} />
                                Danh mục
                            </h3>
                            <div className="space-y-2 lg:space-y-3">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full text-left px-4 py-3 lg:px-5 lg:py-4 rounded-xl lg:rounded-2xl font-bold transition-all duration-300 ${selectedCategory === category.id
                                            ? 'shadow-lg transform scale-105'
                                            : 'hover:shadow-md'
                                            }`}
                                        style={{
                                            backgroundColor: selectedCategory === category.id ? PRIMARY[500] : 'transparent',
                                            color: selectedCategory === category.id ? 'white' : TEXT.PRIMARY,
                                            ':hover': { backgroundColor: selectedCategory === category.id ? PRIMARY[500] : GRAY[50] }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm lg:text-base">{category.title}</span>
                                            <span
                                                className="px-2 py-1 lg:px-3 lg:py-1 rounded-full text-xs lg:text-sm font-bold"
                                                style={{
                                                    backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : GRAY[100],
                                                    color: selectedCategory === category.id ? 'white' : TEXT.SECONDARY
                                                }}
                                            >
                                                {category.totalPosts}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-6 lg:p-8" style={{ borderColor: GRAY[100], borderWidth: 1 }}>
                            <h3 className="text-xl lg:text-2xl font-black mb-6 lg:mb-8 flex items-center" style={{ color: TEXT.PRIMARY }}>
                                <FiClock className="w-5 h-5 lg:w-6 lg:h-6 mr-3" style={{ color: PRIMARY[500] }} />
                                Bài viết gần đây
                            </h3>
                            <div className="space-y-4 lg:space-y-6">
                                {recentPosts.map(post => (
                                    <article key={post.id} className="group p-3 lg:p-4 rounded-xl lg:rounded-2xl hover:bg-gray-50 transition-all duration-300">
                                        <h4 className="font-bold text-sm lg:text-base mb-2 lg:mb-3 leading-tight group-hover:text-current transition-colors duration-300" style={{ color: TEXT.PRIMARY }}>
                                            <Link
                                                to={`/blog/${post.id}`}
                                                className="hover:underline"
                                                style={{ ':hover': { color: PRIMARY[600] } }}
                                            >
                                                {post.title}
                                            </Link>
                                        </h4>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 text-xs lg:text-sm" style={{ color: TEXT.SECONDARY }}>
                                            <div className="flex items-center px-2 py-1 rounded-full" style={{ backgroundColor: GRAY[100] }}>
                                                <FiCalendar className="w-3 h-3 mr-1" />
                                                <span>{post.createdDate}</span>
                                            </div>
                                            <div className="flex items-center px-2 py-1 rounded-full" style={{ backgroundColor: GRAY[100] }}>
                                                <FiClock className="w-3 h-3 mr-1" />
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <Link
                                to="/blog"
                                className="inline-flex items-center mt-4 lg:mt-6 px-4 py-2 lg:px-6 lg:py-3 text-white font-bold rounded-xl lg:rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 w-full justify-center text-sm lg:text-base"
                                style={{ backgroundColor: PRIMARY[500] }}
                            >
                                <FiArrowRight className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                                Xem tất cả
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
