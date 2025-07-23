import React, { useState } from 'react';

const CATEGORY_OPTIONS = [
  { label: 'Sức khỏe học đường', value: 'Sức khỏe học đường' },
  { label: 'Dinh dưỡng', value: 'Dinh dưỡng' },
  { label: 'Phòng bệnh', value: 'Phòng bệnh' },
];

const BlogForm = ({ initialData = {}, onSubmit, loading }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || '');
  const [categoryName, setCategoryName] = useState(initialData.categoryName || CATEGORY_OPTIONS[0].value);
  const [isFeatured, setIsFeatured] = useState(initialData.isFeatured || false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Tiêu đề và nội dung không được để trống');
      return;
    }
    setError('');
    // Always set isPublished to true
    onSubmit({ title, content, imageUrl, categoryName, isPublished: true, isFeatured });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input
        type="text"
        placeholder="Tiêu đề bài viết"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }}
        disabled={loading}
      />
      <select
        value={categoryName}
        onChange={e => setCategoryName(e.target.value)}
        style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
        disabled={loading}
      >
        {CATEGORY_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
        disabled={loading}
      />
      {imageUrl && (
        <img src={imageUrl} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
      )}
      <textarea
        placeholder="Nội dung bài viết (có thể dùng HTML)"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={8}
        style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
        disabled={loading}
      />
      <div style={{ display: 'flex', gap: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} disabled={loading} />
          Bài viết nổi bật
        </label>
      </div>
      <button type="submit" disabled={loading} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>
        {loading ? 'Đang lưu...' : (initialData.id ? 'Lưu thay đổi' : 'Tạo bài viết')}
      </button>
    </form>
  );
};
export default BlogForm; 