import React, { useEffect, useState } from 'react';
import blogPostApi from '../../api/blogPostApi';
import ConfirmModal from '../modal/ConfirmModal';
import AlertModal from '../modal/AlertModal';
import { PRIMARY, WARNING, TEXT, GRAY } from '../../constants/colors';

const CommentModeration = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [selectedComment, setSelectedComment] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: 'success', message: '' });
  const [isApproving, setIsApproving] = useState(false);

  const fetchComments = () => {
    setLoading(true);
    blogPostApi.getCommentsByPostId(postId, { isApproved: false })
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
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const openConfirmModal = (comment) => {
    setSelectedComment(comment);
    setIsConfirmModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedComment) return;
    
    setIsApproving(true);
    try {
      const res = await blogPostApi.approveComment(selectedComment.id);
      setIsConfirmModalOpen(false);
      
      if (res && res.success) {
        setAlertInfo({
          type: 'success',
          message: 'Đã duyệt bình luận thành công!'
        });
        fetchComments(); // Refresh the comments list
      } else {
        setAlertInfo({
          type: 'error',
          message: res?.message || 'Không duyệt được bình luận'
        });
      }
    } catch {
      setAlertInfo({
        type: 'error',
        message: 'Không duyệt được bình luận'
      });
    } finally {
      setIsApproving(false);
      setIsAlertModalOpen(true);
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: TEXT.PRIMARY }}>Bình luận chờ duyệt</h3>
      {loading ? <div style={{ color: TEXT.SECONDARY }}>Đang tải...</div> :
        error ? <div style={{ color: 'red' }}>{error}</div> :
        <div>
          {comments.length === 0 ? <div style={{ color: TEXT.SECONDARY }}>Không có bình luận chờ duyệt.</div> :
            comments.map(c => (
              <div key={c.id} style={{ background: WARNING[50], borderRadius: 8, padding: 16, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: WARNING[700] }}>{c.userName}</div>
                  <div style={{ color: TEXT.PRIMARY, marginTop: 4 }}>{c.content}</div>
                  <div style={{ fontSize: 12, color: TEXT.SECONDARY, marginTop: 4 }}>{new Date(c.createdDate).toLocaleString()}</div>
                </div>
                <button 
                  onClick={() => openConfirmModal(c)} 
                  style={{ 
                    background: PRIMARY[500], 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 6, 
                    padding: '8px 16px', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                    ':hover': {
                      background: PRIMARY[600]
                    }
                  }}
                >
                  Duyệt
                </button>
              </div>
            ))}
        </div>
      }

      {/* Confirm Modal for Approval */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleApprove}
        title="Xác nhận duyệt bình luận"
        message={`Bạn có chắc chắn muốn duyệt bình luận này của "${selectedComment?.userName}"?`}
        confirmText="Duyệt"
        cancelText="Hủy"
        type="info"
        isLoading={isApproving}
      />

      {/* Alert Modal for Notifications */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={alertInfo.type === 'success' ? "Thành công" : "Lỗi"}
        message={alertInfo.message}
        type={alertInfo.type}
        okText="Đồng ý"
      />
    </div>
  );
};
export default CommentModeration; 