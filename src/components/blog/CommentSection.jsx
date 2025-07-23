import React, { useEffect, useState, useContext } from 'react';
import blogPostApi from '../../api/blogPostApi';
import AuthContext from '../../utils/AuthContext';

const CommentSection = ({ postId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    blogPostApi.getBlogPostById(postId)
      .then(res => {
        setComments((res.data?.comments || []).filter(c => c.isApproved));
        setError('');
      })
      .catch(() => setError('Lỗi tải bình luận'))
      .finally(() => setLoading(false));
  }, [postId, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await blogPostApi.createComment({ postId, userId: user?.id, content, authorName: user?.fullName || user?.username });
      setContent('');
      setSuccess('Bình luận của bạn đã gửi, chờ phê duyệt!');
    } catch {
      setError('Không gửi được bình luận');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Bình luận</h2>
      {loading ? <div>Đang tải bình luận...</div> :
        error ? <div style={{ color: 'red' }}>{error}</div> :
        <div style={{ marginBottom: 32 }}>
          {comments.length === 0 ? <div>Chưa có bình luận nào.</div> :
            comments.map(c => (
              <div key={c.id} style={{ background: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, color: '#1976d2' }}>{c.authorName}</div>
                <div style={{ color: '#333', marginTop: 4 }}>{c.content}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{new Date(c.createdAt).toLocaleString()}</div>
              </div>
            ))}
        </div>
      }
      {user && user.role !== 'guest' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Nhập bình luận..."
            rows={3}
            style={{ borderRadius: 8, border: '1px solid #ccc', padding: 12, fontSize: 16 }}
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !content.trim()} style={{ alignSelf: 'flex-end', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
          {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
        </form>
      )}
      {!user && <div style={{ color: '#888', marginTop: 16 }}>Đăng nhập để bình luận.</div>}
    </div>
  );
};
export default CommentSection; 