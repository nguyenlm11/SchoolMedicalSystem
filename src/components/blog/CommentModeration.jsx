import React, { useEffect, useState } from 'react';
import blogPostApi from '../../api/blogPostApi';

const CommentModeration = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    blogPostApi.getBlogPostById(postId)
      .then(res => {
        setComments((res.data?.comments || []).filter(c => !c.isApproved));
        setError('');
      })
      .catch(() => setError('Lỗi tải bình luận'))
      .finally(() => setLoading(false));
  }, [postId, success]);

  const handleApprove = async (commentId) => {
    try {
      await blogPostApi.approveComment(commentId);
      setSuccess('Đã duyệt bình luận!');
      setTimeout(() => setSuccess(''), 1500);
    } catch {
      setError('Không duyệt được bình luận');
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Bình luận chờ duyệt</h3>
      {loading ? <div>Đang tải...</div> :
        error ? <div style={{ color: 'red' }}>{error}</div> :
        <div>
          {comments.length === 0 ? <div>Không có bình luận chờ duyệt.</div> :
            comments.map(c => (
              <div key={c.id} style={{ background: '#fffbe7', borderRadius: 8, padding: 16, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#b28704' }}>{c.authorName}</div>
                  <div style={{ color: '#333', marginTop: 4 }}>{c.content}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={() => handleApprove(c.id)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>Duyệt</button>
              </div>
            ))}
        </div>
      }
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </div>
  );
};
export default CommentModeration; 