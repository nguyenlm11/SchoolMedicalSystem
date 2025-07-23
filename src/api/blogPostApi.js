import apiClient from '../config/config';

const blogPostApi = {
    // Lấy danh sách bài viết
    getBlogPosts: async (params = {}) => {
        try {
            const {
                pageIndex = 1,
                pageSize = 10,
                searchTerm = '',
                orderBy = '',
                category = '',
                isPublished = ''
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('pageIndex', pageIndex);
            queryParams.append('pageSize', pageSize);

            if (searchTerm) {
                queryParams.append('searchTerm', searchTerm);
            }

            if (orderBy) {
                queryParams.append('orderBy', orderBy);
            }

            if (category) {
                queryParams.append('category', category);
            }

            if (isPublished) {
                queryParams.append('isPublished', isPublished);
            }

            const response = await apiClient.get(`/blog-posts?${queryParams.toString()}`);
            return response.data;

        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    },

    // Lấy danh sách bài viết nổi bật (featured)
    getFeaturedBlogPosts: async (params = {}) => {
        try {
            const {
                pageIndex = 1,
                pageSize = 10
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('pageIndex', pageIndex);
            queryParams.append('pageSize', pageSize);

            const response = await apiClient.get(`/blog-posts/featured?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    },

    // Lấy chi tiết bài viết
    getBlogPostById: async (postId) => {
        try {
            const response = await apiClient.get(`/blog-posts/${postId}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: error.message,
                data: null,
                errors: []
            };
        }
    },

    // Tạo bài viết
    createBlogPost: async (postData) => {
        try {
            const response = await apiClient.post('/blog-posts', postData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Chỉnh sửa bài viết
    updateBlogPost: async (postId, postData) => {
        try {
            const response = await apiClient.put(`/blog-posts/${postId}`, postData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: error.message,
                data: null,
                errors: []
            };
        }
    },

    // Xóa bài viết
    deleteBlogPost: async (postId) => {
        try {
            const response = await apiClient.delete(`/blog-posts/${postId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Tạo bình luận cho bài viết
    createComment: async (commentData) => {
        try {
            const response = await apiClient.post('/blog-posts/comments', commentData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    },

    // Phê duyệt bình luận
    approveComment: async (commentId) => {
        try {
            const response = await apiClient.put(`/blog-posts/comments/${commentId}/approve`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }

}
export default blogPostApi; 