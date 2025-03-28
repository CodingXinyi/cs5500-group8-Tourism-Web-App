import React, { useEffect, useState } from 'react';
import './index.css';
import Header from '../home/components/header';
import { FaStar } from 'react-icons/fa6';
import { useParams } from 'react-router';
import { fetchPostDetails } from '../../client/posts';

export default function Destination() {
  interface DestinationDetail {
    pictureUrl: string;
    averageRating: number;
    postName: string;
    location: string;
    introduction: string;
    policy: string;
    description: string;
  }

  const { destinationId } = useParams();
  const [details, setDetails] = useState<DestinationDetail | null>(null);

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

  // Ensure using `imageUrl` for both background image and img source
  const imageUrl = details?.pictureUrl;

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
          <div>
            <FaStar
              style={{
                color: 'orange',
                fontSize: '2rem',
                marginBottom: '1rem',
              }}
            />
            <span
              style={{
                color: 'orange',
                fontSize: '1.5rem',
              }}
            >
              &nbsp;{details?.averageRating}
            </span>
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
        </div>
      </div>
    </div>
  );
}