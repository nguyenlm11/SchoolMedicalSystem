import React, { useState, useContext } from 'react';
import AuthContext from '../../utils/AuthContext';
import { PRIMARY, ERROR, GRAY, TEXT, BACKGROUND } from '../../constants/colors';
import { FiImage, FiX, FiStar, FiCheck } from 'react-icons/fi';

const CATEGORY_OPTIONS = [
  { label: 'Sức khỏe học đường', value: 'Sức khỏe học đường' },
  { label: 'Dinh dưỡng', value: 'Dinh dưỡng' },
  { label: 'Phòng bệnh', value: 'Phòng bệnh' },
];

const BlogForm = ({ initialData = {}, onSubmit, loading, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [categoryName, setCategoryName] = useState(initialData?.categoryName || CATEGORY_OPTIONS[0].value);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
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
    // Include authorId from the logged-in user and set isPublished to true
    onSubmit({ 
      title, 
      content, 
      imageUrl, 
      categoryName, 
      isPublished: true, 
      isFeatured,
      authorId: user?.id
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-[85%] max-w-5xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex justify-between items-center px-8 py-6 border-b" style={{ borderColor: GRAY[100] }}>
          <h2 className="text-2xl font-bold" style={{ color: PRIMARY[700] }}>
            {initialData?.id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h2>
          <button 
            onClick={onCancel} 
            className="rounded-full p-2 hover:bg-gray-100"
            style={{ color: GRAY[500] }}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl flex items-center" style={{ backgroundColor: ERROR[50], color: ERROR[700] }}>
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>Tiêu đề bài viết</label>
            <input
              type="text"
              placeholder="Nhập tiêu đề bài viết"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-4 text-lg rounded-xl"
              style={{ 
                border: `1px solid ${GRAY[200]}`,
                backgroundColor: BACKGROUND.DEFAULT,
                color: TEXT.PRIMARY
              }}
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>Danh mục</label>
              <select
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full p-4 rounded-xl text-base"
                style={{ 
                  border: `1px solid ${GRAY[200]}`,
                  backgroundColor: BACKGROUND.DEFAULT,
                  color: TEXT.PRIMARY
                }}
                disabled={loading}
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>Ảnh bìa</label>
              <div className="flex items-center">
                <label className="cursor-pointer flex-1">
                  <div 
                    className="border rounded-xl flex items-center justify-center p-4 gap-2"
                    style={{ borderColor: PRIMARY[200], backgroundColor: PRIMARY[50] }}
                  >
                    <FiImage size={20} style={{ color: PRIMARY[500] }} />
                    <span style={{ color: PRIMARY[700] }}>Chọn ảnh</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                </label>
                {imageUrl && (
                  <div className="ml-4 h-16 w-16 rounded-lg overflow-hidden border">
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {imageUrl && (
            <div className="mb-6 relative">
              <div className="aspect-[16/5] rounded-xl overflow-hidden">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button 
                type="button" 
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md"
                onClick={() => setImageUrl('')}
                style={{ color: ERROR[500] }}
              >
                <FiX size={18} />
              </button>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: TEXT.PRIMARY }}>Nội dung bài viết</label>
            <textarea
              placeholder="Nhập nội dung bài viết... (bạn có thể sử dụng HTML để định dạng)"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={15}
              className="w-full p-4 text-base rounded-xl font-mono"
              style={{ 
                border: `1px solid ${GRAY[200]}`,
                backgroundColor: BACKGROUND.DEFAULT,
                color: TEXT.PRIMARY,
                lineHeight: 1.6
              }}
              disabled={loading}
            />
          </div>
          
          <div className="mb-8">
            <label 
              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer w-fit ${isFeatured ? 'bg-amber-50' : ''}`} 
              style={{ borderColor: isFeatured ? 'rgb(245, 158, 11)' : GRAY[200] }}
            >
              <div 
                className={`w-5 h-5 rounded flex items-center justify-center`} 
                style={{ 
                  backgroundColor: isFeatured ? 'rgb(245, 158, 11)' : 'white',
                  border: `1px solid ${isFeatured ? 'rgb(245, 158, 11)' : GRAY[300]}`
                }}
              >
                {isFeatured && <FiCheck size={14} style={{ color: 'white' }} />}
              </div>
              <input 
                type="checkbox" 
                checked={isFeatured} 
                onChange={e => setIsFeatured(e.target.checked)} 
                disabled={loading} 
                className="sr-only"
              />
              <div className="flex items-center gap-2">
                <FiStar style={{ color: isFeatured ? 'rgb(245, 158, 11)' : GRAY[500] }} />
                <span style={{ color: isFeatured ? 'rgb(245, 158, 11)' : TEXT.PRIMARY }}>Bài viết nổi bật</span>
              </div>
            </label>
          </div>
          
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl font-medium"
              style={{ 
                backgroundColor: GRAY[100],
                color: TEXT.PRIMARY
              }}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl font-medium text-white flex items-center gap-2"
              style={{ 
                backgroundColor: PRIMARY[500],
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{initialData?.id ? 'Lưu thay đổi' : 'Đăng bài viết'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default BlogForm; 