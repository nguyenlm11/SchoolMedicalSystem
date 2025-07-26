import React, { useEffect, useState, useContext } from 'react';
import blogPostApi from '../../api/blogPostApi';
import AuthContext from '../../utils/AuthContext';
import { PRIMARY, GRAY, TEXT, ERROR, SUCCESS } from '../../constants/colors';

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
    blogPostApi.getCommentsByPostId(postId, { isApproved: true })
      .then(res => {
        if (res.success) {
          setComments(res.data || []);
          setError('');
        } else {
          setError(res.message || 'Lỗi tải bình luận');
        }
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
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: TEXT.PRIMARY }}>Bình luận</h2>
      {loading ? <div style={{ color: TEXT.SECONDARY }}>Đang tải bình luận...</div> :
        error ? <div style={{ color: ERROR[500] }}>{error}</div> :
        <div style={{ marginBottom: 32 }}>
          {comments.length === 0 ? <div style={{ color: TEXT.SECONDARY }}>Chưa có bình luận nào.</div> :
            comments.map(c => (
              <div key={c.id} style={{ background: GRAY[50], borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, color: PRIMARY[500] }}>{c.userName}</div>
                <div style={{ color: TEXT.PRIMARY, marginTop: 4 }}>{c.content}</div>
                <div style={{ fontSize: 12, color: TEXT.SECONDARY, marginTop: 4 }}>{new Date(c.createdDate).toLocaleString()}</div>
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
            style={{ borderRadius: 8, border: `1px solid ${GRAY[200]}`, padding: 12, fontSize: 16 }}
            disabled={submitting}
          />
          <button 
            type="submit" 
            disabled={submitting || !content.trim()} 
            style={{ 
              alignSelf: 'flex-end', 
              background: PRIMARY[500], 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              padding: '8px 20px', 
              fontWeight: 700, 
              fontSize: 16, 
              cursor: 'pointer',
              opacity: submitting || !content.trim() ? 0.7 : 1,
              transition: 'opacity 0.2s ease'
            }}
          >
            {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
          {success && <div style={{ color: SUCCESS[600], marginTop: 8 }}>{success}</div>}
        </form>
      )}
      {!user && <div style={{ color: TEXT.SECONDARY, marginTop: 16 }}>Đăng nhập để bình luận.</div>}
    </div>
  );
};
export default CommentSection; 