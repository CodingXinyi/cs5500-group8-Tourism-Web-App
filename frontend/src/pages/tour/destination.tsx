import React, { useEffect, useState, useContext } from 'react';
import './index.css';
import Header from '../home/components/header';
import { FaStar } from 'react-icons/fa6';
import { useParams } from 'react-router';
import { fetchPostDetails } from '../../client/posts';
import Comments from '../../components/Comments';
import { sendRating } from '../../client/rating';
import { ListFormat } from 'typescript';
import { RatingDialog } from './rating-dialog';
import { AuthContext } from '../../context/authContext';


export default function Destination() {
  interface DestinationDetail {
    id : number; 
    user: {
      email: string;
      id: number;
      name: string;
    };
    pictureUrl: string;
    averageRating: number; 
    postName: string;
    location: string;
    introduction: string;
    policy: string;
    description: string;
    ratings: {
      rating: number;
      userId: number;
    }[];
  }

  interface ratingType {
    userId: number;
    postId: number;
    rating: number;
  }
  

  const { destinationId } = useParams();
  const [details, setDetails] = useState<DestinationDetail | null>(null);
  // Ensure using `imageUrl` for both background image and img source
  const imageUrl = details?.pictureUrl;
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(-1);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { currentUser } = useContext(AuthContext);
  

  const fetchDetails = async () => {
    try {
      const response = await fetchPostDetails(destinationId);
      console.log(response);
      setDetails(response);
      
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [destinationId]);


  const handleRatingSubmit = async () => {
    if (!details) return

    setIsSubmitting(true)

    const ratingData: ratingType = {
      userId: currentUser.id,
      postId: details.id,
      rating: parseFloat(userRating.toFixed(1)), // force float precision
    };    

    console.log(ratingData)

    try {
      await sendRating(ratingData)
      fetchDetails() // refresh details after submit
      setIsRatingDialogOpen(false)
    } catch (error) {
      console.error("Failed to submit rating:", error)
      alert("you already submitted rating before!")
      setIsRatingDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }  

  const calculateAverageRating = (ratings: { rating: number, userId: number }[]): number => {
    if (ratings.length === 0) return -1; // If no ratings, return 0
    const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return totalRating / ratings.length;
  };

  useEffect(() => {
    if (details) {
      const average = calculateAverageRating(details.ratings); // Calculate the average rating
      setAverageRating(average);
    }
  }, [details]); // Re-run when `details` changes  


  return (
    <div id="destinationContainer">
      <div
        id="background"
        style={{
          backgroundImage: `url(${imageUrl})`, // Using `imageUrl` here
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          width: '100vw',
        }}
      >
        <Header />
        <div id="info">
          <div className="rating-header">
          <h3>⭐ Average Rating: {averageRating === -1 ? 'No Rating' : averageRating}</h3>
            <button 
              onClick={() => setIsRatingDialogOpen(true)} 
              className="rate-button"
            >
              Rate This Destination
            </button>
          </div>

          <h1 className="text-black">{details?.postName}</h1>
          <p className="text-black">{details?.location}</p>
          <p className="text-black" style={{ fontSize: '2vh' }}>
            {details?.introduction}
          </p>
          <div className="text-black" style={{ fontSize: '2vh' }}>
            <p className="text-black">{details?.policy}</p>
            <p className="text-black">{details?.description}</p>
          </div>
          <img
            src={imageUrl} // Using `imageUrl` here
            alt="pics"
            width={'300px'}
            height={'200px'}
            style={{
              border: 'solid 4px orange',
              borderRadius: '20px',
              objectFit: 'cover',
              marginBottom: '2vh',
            }}
          />

          
          {/* 添加评论组件 */}
          <div className="destination-comments-container">
            <Comments postId={destinationId} />
          </div>

          <RatingDialog
            open={isRatingDialogOpen}
            onOpenChange={setIsRatingDialogOpen}
            rating={userRating}
            onRatingChange={setUserRating}
            onSubmit={handleRatingSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
