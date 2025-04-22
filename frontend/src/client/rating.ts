import axios from 'axios';

export type ratingType = {
  userId: number;
  postId: number;
  rating: number;
};

export const sendRating = async (ratingData: ratingType) => {
    try {
      const response = await axios.post(
        'https://cs5500-group8-tourism-web-app.onrender.com/rating',
        ratingData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending rating:', error);
      throw error;  // so caller knows it failed
    }
  };
  