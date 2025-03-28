import axios from 'axios';

type postType = {
  userId: number;
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
