import React, { useEffect, useState, useContext } from 'react';
import blogPostApi from '../../api/blogPostApi';
import BlogList from '../../components/blog/BlogList';
import BlogForm from '../../components/blog/BlogForm';
import { PRIMARY, BACKGROUND, TEXT } from '../../constants/colors';
import { FiBookOpen, FiSearch, FiStar, FiPlus } from 'react-icons/fi';
import AuthContext from '../../utils/AuthContext';
import ConfirmModal from '../../components/modal/ConfirmModal';
import AlertModal from '../../components/modal/AlertModal';

const CATEGORY_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Sức khỏe học đường', value: 'Sức khỏe học đường' },
  { label: 'Dinh dưỡng', value: 'Dinh dưỡng' },
  { label: 'Phòng bệnh', value: 'Phòng bệnh' },
];
const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'desc' },
  { label: 'Cũ nhất', value: 'asc' },
];

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('desc');
  const [featured, setFeatured] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const pageSize = 6;
  const { user } = useContext(AuthContext);
  const isSchoolNurse = user && user.role === 'schoolnurse';

  const fetchPosts = () => {
    setLoading(true);
    const fetch = featured
      ? blogPostApi.getFeaturedBlogPosts({ pageIndex: page, pageSize })
      : blogPostApi.getBlogPosts({ pageIndex: page, pageSize, searchTerm, category, orderBy: sort === 'desc' ? 'createdDate desc' : 'createdDate asc' });
    fetch
      .then(res => {
        setPosts(res.data || []);
        setError('');
      })
      .catch(() => setError('Lỗi tải bài viết'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [page, searchTerm, category, sort, featured]);

  const handlePostClick = (post) => {
    window.location.href = `/blog/${post.id}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // CRUD handlers
  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };
  const handleEdit = (post) => {
    setEditData(post);
    setShowForm(true);
  };
  const handleDelete = (post) => {
    setConfirmDelete(post);
  };
  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      // Use a hardcoded authorId to work around backend issue
      const authorId = "98bf1b28-547e-4685-b402-98e0dc508468";
      const postData = { ...data, authorId };
      
      if (editData) {
        await blogPostApi.updateBlogPost(editData.id, postData);
        setAlert({ isOpen: true, type: 'success', title: 'Thành công', message: 'Cập nhật bài viết thành công!' });
      } else {
        await blogPostApi.createBlogPost(postData);
        setAlert({ isOpen: true, type: 'success', title: 'Thành công', message: 'Tạo bài viết thành công!' });
      }
      setShowForm(false);
      setEditData(null);
      fetchPosts();
    } catch {
      setAlert({ isOpen: true, type: 'error', title: 'Thất bại', message: 'Có lỗi xảy ra khi lưu bài viết!' });
    } finally {
      setFormLoading(false);
    }
  };
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      await blogPostApi.deleteBlogPost(confirmDelete.id);
      setConfirmDelete(null);
      setAlert({ isOpen: true, type: 'success', title: 'Thành công', message: 'Xóa bài viết thành công!' });
      fetchPosts();
    } catch {
      setAlert({ isOpen: true, type: 'error', title: 'Thất bại', message: 'Xóa bài viết thất bại!' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 0 32px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <FiBookOpen size={38} color={PRIMARY?.[700] || '#1976d2'} />
          <h1 style={{ fontSize: 44, fontWeight: 900, color: PRIMARY?.[700] || '#1976d2', margin: 0, letterSpacing: -1 }}>Bài viết Blog</h1>
        </div>
        <div style={{ color: TEXT?.SECONDARY || '#555', fontSize: 20, marginTop: 8, fontWeight: 500 }}>
          Khám phá các bài viết y tế học đường, sức khỏe, dinh dưỡng và nhiều chủ đề hữu ích khác!
        </div>
        {isSchoolNurse && (
          <button onClick={handleCreate} style={{ position: 'absolute', right: 0, top: 0, background: PRIMARY[500], color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25,118,210,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiPlus /> Tạo bài viết
          </button>
        )}
      </div>
      {/* Bộ lọc và tìm kiếm */}
      <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: BACKGROUND?.WHITE, borderRadius: 10, boxShadow: '0 2px 8px rgba(25,118,210,0.06)', padding: '0 12px' }}>
          <FiSearch size={20} color={PRIMARY?.[500]} />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 17, padding: 10, background: 'transparent', minWidth: 220 }}
          />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={{ padding: 10, borderRadius: 10, border: '1px solid #e0e0e0', fontSize: 16 }}>
          {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: 10, borderRadius: 10, border: '1px solid #e0e0e0', fontSize: 16 }}>
          {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <button type="button" onClick={() => { setFeatured(f => !f); setPage(1); }} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: featured ? PRIMARY?.[500] : BACKGROUND?.NEUTRAL,
          color: featured ? '#fff' : PRIMARY?.[700],
          border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
        }}>
          <FiStar /> {featured ? 'Bài nổi bật' : 'Tất cả bài'}
        </button>
        <button type="submit" style={{ background: PRIMARY?.[500], color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25,118,210,0.08)' }}>
          Tìm kiếm
        </button>
      </form>
      {loading ? <div style={{ textAlign: 'center', fontSize: 22, color: PRIMARY?.[500] || '#2196f3' }}>Đang tải...</div> :
        error ? <div style={{ color: 'red', textAlign: 'center', fontSize: 20 }}>{error}</div> :
        posts.length === 0 ? (
          <div style={{ textAlign: 'center', color: TEXT?.SECONDARY || '#888', fontSize: 22, margin: '48px 0' }}>
            Không có bài đăng theo yêu cầu.
          </div>
        ) :
        <BlogList posts={posts} onPostClick={handlePostClick} isSchoolNurse={isSchoolNurse} onEdit={handleEdit} onDelete={handleDelete} />
      }
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 16 }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          style={{
            background: page === 1 ? BACKGROUND?.NEUTRAL || '#f5f7fa' : PRIMARY?.[500] || '#2196f3',
            color: page === 1 ? '#aaa' : '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 28px',
            fontWeight: 700,
            fontSize: 18,
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
            transition: 'background 0.2s',
          }}
        >
          Trang trước
        </button>
        <span style={{ fontWeight: 700, fontSize: 20, color: PRIMARY?.[700] || '#1976d2', alignSelf: 'center' }}>Trang {page}</span>
        <button
          disabled={posts.length < pageSize}
          onClick={() => setPage(page + 1)}
          style={{
            background: posts.length < pageSize ? BACKGROUND?.NEUTRAL || '#f5f7fa' : PRIMARY?.[500] || '#2196f3',
            color: posts.length < pageSize ? '#aaa' : '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 28px',
            fontWeight: 700,
            fontSize: 18,
            cursor: posts.length < pageSize ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
            transition: 'background 0.2s',
          }}
        >
          Trang sau
        </button>
      </div>
      {/* Modal BlogForm */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', overflow: 'hidden' }}
          onClick={() => { setShowForm(false); setEditData(null); }}
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
                {editData ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </h3>
              <button
                onClick={() => { setShowForm(false); setEditData(null); }}
                disabled={formLoading}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
                style={{ color: '#6b7280' }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ flexGrow: 1 }}>
              <BlogForm initialData={editData || {}} onSubmit={handleFormSubmit} loading={formLoading} />
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 pt-4 border-t" style={{ borderColor: '#f3f4f6' }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditData(null); }}
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
      {/* Modal xác nhận xóa */}
      {confirmDelete && (
        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Xác nhận xóa bài viết"
          message={`Bạn có chắc chắn muốn xóa bài viết "${confirmDelete.title}"?`}
          confirmText={deleteLoading ? 'Đang xóa...' : 'Xóa'}
          cancelText="Hủy"
          type="error"
          isLoading={deleteLoading}
        />
      )}
      {/* AlertModal */}
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
export default BlogPage;
