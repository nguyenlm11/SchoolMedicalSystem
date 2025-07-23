import React from 'react';
import { PRIMARY, BACKGROUND, TEXT } from '../../constants/colors';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const BlogCard = ({ post, onClick, isSchoolNurse, onEdit, onDelete }) => {
  return (
    <div
      onClick={onClick}
      style={{
        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.10)',
        borderRadius: 24,
        overflow: 'hidden',
        background: BACKGROUND?.WHITE || '#fff',
        transition: 'transform 0.18s cubic-bezier(.4,2,.6,1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
      onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.025)')}
      onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{ position: 'relative', width: '100%', height: 210, overflow: 'hidden' }}>
        <img
          src={post.imageUrl || '/public/logo.jpg'}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.95)' }}
        />
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '60%',
          background: 'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(25,118,210,0.18) 100%)',
        }} />
        {post.categoryName && (
          <span style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: PRIMARY?.[100] || '#e3f2fd',
            color: PRIMARY?.[700] || '#1976d2',
            padding: '4px 14px',
            borderRadius: 16,
            fontWeight: 600,
            fontSize: 13,
            boxShadow: '0 2px 8px rgba(25,118,210,0.08)'
          }}>{post.categoryName}</span>
        )}
        {isSchoolNurse && (
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(post)} style={{ background: PRIMARY[100], color: PRIMARY[700], border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }} title="Sửa bài viết">
              <FiEdit size={18} />
            </button>
            <button onClick={() => onDelete(post)} style={{ background: '#fff0f0', color: PRIMARY[700], border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }} title="Xóa bài viết">
              <FiTrash2 size={18} />
            </button>
          </div>
        )}
      </div>
      <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', background: BACKGROUND?.WHITE || '#fff' }}>
        <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: PRIMARY?.[700] || '#1976d2', lineHeight: 1.25 }}>{post.title}</h3>
        <p style={{ color: TEXT?.SECONDARY || '#555', margin: '12px 0 0 0', flex: 1, fontSize: 16, lineHeight: 1.6 }}>{post.excerpt || (post.content?.slice(0, 120) + '...')}</p>
        <div style={{ marginTop: 18, fontSize: 15, color: PRIMARY?.[500] || '#2196f3', fontWeight: 600, letterSpacing: 0.2 }}>{new Date(post.createdDate).toLocaleDateString('vi-VN')}</div>
      </div>
    </div>
  );
};
export default BlogCard; 