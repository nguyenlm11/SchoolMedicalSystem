import React from 'react';
import BlogCard from './BlogCard';
import { BACKGROUND } from '../../constants/colors';

const BlogList = ({ posts, onPostClick, isSchoolNurse, onEdit, onDelete }) => {
  return (
    <div style={{
      background: BACKGROUND?.NEUTRAL || '#f5f7fa',
      borderRadius: 32,
      padding: '32px 0',
      margin: '0 0 32px 0',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 36,
        padding: '0 36px',
      }}>
        {posts.map(post => (
          <BlogCard 
            key={post.id} 
            post={post} 
            onClick={() => onPostClick(post)} 
            isSchoolNurse={isSchoolNurse}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
export default BlogList; 