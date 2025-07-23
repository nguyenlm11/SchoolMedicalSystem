import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import blogPostApi from '../../api/blogPostApi';
import { FiArrowLeft, FiCalendar, FiUser, FiTag, FiShare2, FiHeart, FiBookmark, FiClock, FiEye, FiMessageCircle, FiMail, FiPhone, FiMapPin, FiChevronLeft, FiChevronRight, FiEdit, FiTrash2 } from 'react-icons/fi';
import { PRIMARY, GRAY, TEXT, BACKGROUND } from '../../constants/colors';
import Loading from '../../components/Loading';
import CommentSection from '../../components/blog/CommentSection';
import CommentModeration from '../../components/blog/CommentModeration';
import AuthContext from '../../utils/AuthContext';
import BlogForm from '../../components/blog/BlogForm';
import ConfirmModal from '../../components/modal/ConfirmModal';
import AlertModal from '../../components/modal/AlertModal';

const BlogDetailPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const { user } = useContext(AuthContext);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const navigate = useNavigate();
    
    // Edit/Delete state
    const [showEditForm, setShowEditForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [alert, setAlert] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    const isSchoolNurse = user && user.role === 'schoolnurse';

    useEffect(() => {
        setLoading(true);
        blogPostApi.getBlogPostById(id)
            .then(res => {
                setPost(res.data);
                setError('');
            })
            .catch(() => setError('Không tìm thấy bài viết'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (post && post.categoryName) {
            blogPostApi.getBlogPosts({ category: post.categoryName, pageSize: 5 })
                .then(res => {
                    // Loại bỏ bài hiện tại khỏi danh sách liên quan
                    const filtered = (res.data || []).filter(p => p.id !== post.id);
                    setRelatedPosts(filtered);
                });
        }
    }, [post]);

    const handleShare = (platform) => {
        // Mock share functionality
        console.log(`Sharing to ${platform}`);
        setShowShareOptions(false);
    };
    
    // Edit/Delete handlers
    const handleEdit = () => {
        setShowEditForm(true);
    };
    
    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };
    
    const handleFormSubmit = async (data) => {
        setFormLoading(true);
        try {
            // Use a hardcoded authorId to work around backend issue
            const authorId = "98bf1b28-547e-4685-b402-98e0dc508468";
            const postData = { ...data, authorId };
            
            await blogPostApi.updateBlogPost(id, postData);
            setAlert({ isOpen: true, type: 'success', title: 'Thành công', message: 'Cập nhật bài viết thành công!' });
            setShowEditForm(false);
            // Refresh post data
            const response = await blogPostApi.getBlogPostById(id);
            setPost(response.data);
        } catch (err) {
            console.error('Update error:', err);
            setAlert({ isOpen: true, type: 'error', title: 'Thất bại', message: 'Có lỗi xảy ra khi lưu bài viết!' });
        } finally {
            setFormLoading(false);
        }
    };
    
    const handleConfirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await blogPostApi.deleteBlogPost(id);
            setAlert({ isOpen: true, type: 'success', title: 'Thành công', message: 'Xóa bài viết thành công!' });
            setTimeout(() => {
                navigate('/blog');
            }, 1500);
        } catch (err) {
            console.error('Delete error:', err);
            setAlert({ isOpen: true, type: 'error', title: 'Thất bại', message: 'Xóa bài viết thất bại!' });
            setShowDeleteConfirm(false);
        } finally {
            setDeleteLoading(false);
        }
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

    if (loading) {
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

    if (!post) {
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
                            {isSchoolNurse && (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
                                        title="Chỉnh sửa bài viết"
                                    >
                                        <FiEdit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
                                        title="Xóa bài viết"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </>
                            )}
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

            {/* Main Content + Related Sidebar */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 xl:col-span-9">
                    {/* Header Section */}
                    <header className="mb-12">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span
                                className="px-3 py-1 rounded-full text-sm font-medium text-white shadow-sm"
                                style={{ backgroundColor: PRIMARY[500] }}
                            >
                                {post.categoryName}
                            </span>
                            {post.isFeatured && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 shadow-sm">
                                    Bài viết nổi bật
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-3 shadow-md">
                                    <FiUser className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{post.authorName}</p>
                                    <p className="text-sm text-gray-600">Bác sĩ chuyên khoa</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                                    <FiCalendar className="w-4 h-4 mr-2 text-cyan-500" />
                                    <span>{new Date(post.createdDate).toLocaleDateString('vi-VN')}</span>
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
                    {post.imageUrl && (
                        <div className="mb-12">
                            <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-xl">
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
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
                            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
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

                    {/* Related Posts Sidebar */}
                    {/* This aside is now outside the main content div */}
                </div>
                {/* Related Posts Sidebar */}
                <aside className="lg:col-span-4 xl:col-span-3">
                    <div className="sticky top-24">
                        <h2 className="text-2xl font-bold mb-6" style={{ color: TEXT.PRIMARY }}>Bài viết liên quan</h2>
                        <div className="space-y-6">
                            {relatedPosts.length === 0 ? (
                                <div style={{ color: '#888', fontSize: 16 }}>Không có bài viết liên quan.</div>
                            ) : relatedPosts.map(post => (
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
            </div>
            {/* Bình luận và Bình luận chờ duyệt */}
            <div style={{
                marginTop: 48,
                marginBottom: 32,
                background: GRAY[50],
                borderRadius: 20,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                padding: '32px 24px',
                maxWidth: 1200,
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
            }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: PRIMARY[700], marginBottom: 24, textAlign: 'center', letterSpacing: -1 }}>Bình luận</h2>
                <CommentSection postId={post.id} />
                {user && user.role === 'schoolnurse' && (
                    <div style={{ marginTop: 40 }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, color: PRIMARY[700], marginBottom: 18, textAlign: 'center', letterSpacing: -0.5 }}>Bình luận chờ duyệt</h3>
                        <CommentModeration postId={post.id} />
                    </div>
                )}
            </div>
            
            {/* Edit Form Modal */}
            {showEditForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', overflow: 'hidden' }}
                    onClick={() => setShowEditForm(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4 transform transition-all duration-300 scale-100 relative"
                        style={{ 
                            boxShadow: '0 25px 50px -12px rgba(25,118,210,0.18), 0 0 0 1px #e5e7eb',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#f3f4f6' }}>
                            <h3 className="text-2xl font-bold" style={{ color: PRIMARY[700] }}>
                                Chỉnh sửa bài viết
                            </h3>
                            <button
                                onClick={() => setShowEditForm(false)}
                                disabled={formLoading}
                                className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
                                style={{ color: '#6b7280' }}
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto" style={{ flexGrow: 1 }}>
                            <BlogForm initialData={post} onSubmit={handleFormSubmit} loading={formLoading} />
                        </div>
                        <div className="flex items-center justify-end space-x-3 p-6 pt-4 border-t" style={{ borderColor: '#f3f4f6' }}>
                            <button
                                type="button"
                                onClick={() => setShowEditForm(false)}
                                disabled={formLoading}
                                className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50"
                                style={{ color: PRIMARY[700], border: '1px solid #e5e7eb', background: '#fff' }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Confirm Delete Modal */}
            {showDeleteConfirm && (
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleConfirmDelete}
                    title="Xác nhận xóa bài viết"
                    message={`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?`}
                    confirmText={deleteLoading ? 'Đang xóa...' : 'Xóa'}
                    cancelText="Hủy"
                    type="error"
                    isLoading={deleteLoading}
                />
            )}
            
            {/* Alert Modal */}
            <AlertModal
                isOpen={alert.isOpen}
                onClose={() => setAlert(a => ({ ...a, isOpen: false }))}
                type={alert.type}
                title={alert.title}
                message={alert.message}
            />
        </div>
    );
};

export default BlogDetailPage;
