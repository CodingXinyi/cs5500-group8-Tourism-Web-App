import axios from 'axios';

type postType = {
  userId: number;
  rating:number;
  postName: string;
  location: string;
  introduction: string;
  description: string;
  policy: string;
  pictureUrl: string;
};

export const getPost = async () => {
  try {
    const response = await axios.get('http://localhost:8000/posts');
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { error: 'Failed to fetch posts' };
  }
};

export const sendPost = async (postData: postType) => {
  try {
    const response = await axios.post('http://localhost:8000/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Error sending post:', error);
  }
};

export const fetchPostDetails = async (postId: any) => {
  try {
    const response = await axios.get(`http://localhost:8000/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post details:', error);
  }
};

export const deletePosts = async (postId: any) => {
  try {
    const response = await axios.delete(
      `http://localhost:8000/posts/${postId}`
    );
    console.log('Post deleted:', response.data); 
    return response.data; 
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error; 
  }
};


export const updatePost = async (id: string, data: any) => {
  const response = await axios.put(`http://localhost:8000/posts/${id}`, data);
  return response.data;
};