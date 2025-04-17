import axios from 'axios';

// API基础URL - 使用与其他API相同的baseURL
const API_BASE_URL = 'https://cs5500-group8-tourism-web-app.onrender.com';

// 获取特定帖子的所有评论
export const fetchPostComments = async (postId: string | undefined) => {
  try {
    if (!postId) return [];
    const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('获取评论失败:', error);
    return [];
  }
};

// 添加新评论
export const addComment = async (userId: number, postId: string | undefined, comment: string) => {
  try {
    if (!postId) throw new Error('帖子ID不能为空');
    
    const response = await axios.post(`${API_BASE_URL}/comments`, {
      userId,
      postId: parseInt(postId),
      comment
    });
    return response.data;
  } catch (error) {
    console.error('添加评论失败:', error);
    throw error;
  }
};

// 删除评论
export const deleteComment = async (commentId: number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('删除评论失败:', error);
    throw error;
  }
};

// 更新评论
export const updateComment = async (commentId: number, comment: string) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/comments/${commentId}`, { comment });
    return response.data;
  } catch (error) {
    console.error('更新评论失败:', error);
    throw error;
  }
}; 