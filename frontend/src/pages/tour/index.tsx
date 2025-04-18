import React, { useEffect, useState, useContext } from 'react';
import './index.css';
import Header from '../home/components/header';
import { Link, useNavigate } from 'react-router-dom';
import ModalForm from '../../components/inputPost';
import EditModalForm from '../../components/editModal';
import { deletePosts, getPost } from '../../client/posts';
import { AuthContext } from '../../context/authContext';

interface Post {
  id: string;
  postName: string;
  location: string;
  introduction: string;
  description: string;
  policy: string;
  pictureUrl: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function Tour() {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const deletePost = async (postId: any) => {
    try {
      await deletePosts(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

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

  const handlePostUpdate = (updatedPost: any) => {
    const postWithUser = {
      ...updatedPost,
      user: selectedPost?.user
    };
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? postWithUser : post
      )
    );
  };

  const handlePostCreated = (newPost: any) => {
    const postWithUser = {
      ...newPost,
      user: {
        id: currentUser?.id,
        name: currentUser?.name,
        email: currentUser?.email
      }
    };
    
    setPosts(prevPosts => [postWithUser, ...prevPosts]);
  };

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
          Embark on a journey to explore the world's most breathtaking
          landscapes and iconic landmarks.
        </p>
        <button
          className="btn btn-primary bg-orange-300"
          onClick={handleShowModal}
        >
          Share your Destinations!
        </button>
        <ModalForm 
          show={showModal} 
          onHide={handleCloseModal} 
          onPostCreated={handlePostCreated}
        />

        <div
          className="row row-cols-1 row-cols-sm-2 row-cols-md-4"
          id="cards"
          style={{ marginLeft: '100px' }}
        >
          {paginatedDestinations.map((d) => (
            <div
              key={d.id}
              className="cardShadow border p-2 mb-4 rounded-4 m-3"
              style={{ width: '350px' }}
            >
              <Link to={`/tour/${d.id}`}>
                <img
                  src={d.pictureUrl}
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => {
                      toDestinationPage(d.id);
                    }}
                  >
                    Go Now!
                  </button>
                  {currentUser && currentUser.id === d.user?.id && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setSelectedPost(d);
                          setShowEditModal(true); 
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deletePost(d.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination-container">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <EditModalForm
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          post={selectedPost}
          onUpdate={handlePostUpdate}
        />
      </div>
    </div>
  );
}