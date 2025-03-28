import React, { useEffect, useState } from 'react';
import './index.css';
import Header from '../home/components/header';
import { IoLocationOutline } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import ModalForm from '../../components/inputPost';
import { getPost } from '../../client/posts';

type Post = {
  id: string;
  postName: string;
  location: string;
  introduction: string;
  description: string;
  policy: string;
  pictureUrl: string[];
};

export default function Tour() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const fetchPosts = async () => {
    try {
      const posts = await getPost();
      console.log('Fetched posts:', posts);
      setPosts(posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDestinations = posts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const toDestinationPage = (id: string) => {
    navigate(`/tour/${id}`);
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  //const [targetId, setTargetID] = useState<string>('');

  return (
    <div>
      <Header />
      <div id="tourContainer">
        <div style={{ color: 'rgb(249, 151, 104)', fontSize: '1.5rem' }}>
          Explore Iconic Locations!
          <img src="pictures/travelIcon.jpg" alt="icon" width={'70px'} />
        </div>
        <p
          style={{
            paddingLeft: '10vw',
            paddingRight: '10vw',
            textAlign: 'center',
            color: 'gray',
          }}
        >
          Embark on a journey to explore the world’s most breathtaking
          landscapes and iconic landmarks.
        </p>
        <button
          className="btn btn-primary bg-orange-300"
          onClick={handleShowModal}
        >
          Share your Destinations!
        </button>
        <ModalForm show={showModal} onHide={handleCloseModal} />
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4" id="cards">
          {paginatedDestinations.map((d) => (
            <div
              key={d.id}
              className="cardShadow border p-2 mb-4 rounded-4 m-3"
              style={{ width: '350px' }}
            >
              <Link to={`/tour/${d.id}`}>
                <img
                  src={d.pictureUrl[0]}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                  alt={d.postName}
                />
              </Link>
              <div className="card-body">
                <h6>
                  <b>{d.postName}</b>
                </h6>
                <p className="text-muted">{d.location}</p>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => {
                    toDestinationPage(d.id);
                  }}
                >
                  Go Now!
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}