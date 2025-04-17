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

// 模拟数据
const mockPosts: Post[] = [
  {
    id: '1',
    postName: '东京之旅',
    location: '日本，东京',
    introduction: '探索日本首都的魅力',
    description: '东京是一座融合传统与现代的大都市，从庙宇到高楼大厦应有尽有。',
    policy: '请尊重当地文化，遵守规定。',
    pictureUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
    user: { id: 1, name: '张三', email: 'zhang@example.com' }
  },
  {
    id: '2',
    postName: '巴黎浪漫之旅',
    location: '法国，巴黎',
    introduction: '体验浪漫之都的魅力',
    description: '参观埃菲尔铁塔、卢浮宫等标志性景点，品尝正宗法式美食。',
    policy: '请提前预约热门景点，避开旅游旺季。',
    pictureUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    user: { id: 2, name: '李四', email: 'li@example.com' }
  },
  {
    id: '3',
    postName: '纽约城市体验',
    location: '美国，纽约',
    introduction: '探索不夜城的活力',
    description: '参观自由女神像、中央公园、时代广场等经典景点。',
    policy: '请注意安全，保管好个人财物。',
    pictureUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
    user: { id: 3, name: '王五', email: 'wang@example.com' }
  },
  {
    id: '4',
    postName: '京都文化之旅',
    location: '日本，京都',
    introduction: '体验日本传统文化',
    description: '游览金阁寺、清水寺等古老寺庙，感受日本传统文化。',
    policy: '请穿着得体，尊重宗教场所。',
    pictureUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    user: { id: 1, name: '张三', email: 'zhang@example.com' }
  },
  {
    id: '5',
    postName: '威尼斯水城',
    location: '意大利，威尼斯',
    introduction: '探索水上城市的魅力',
    description: '乘坐贡多拉游览水城，参观圣马可广场和大教堂。',
    policy: '请注意天气情况，避免涨潮期。',
    pictureUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
    user: { id: 2, name: '李四', email: 'li@example.com' }
  },
  {
    id: '6',
    postName: '悉尼海港风光',
    location: '澳大利亚，悉尼',
    introduction: '欣赏南半球的明珠',
    description: '参观悉尼歌剧院、海港大桥，体验澳式生活。',
    policy: '请做好防晒准备，遵守当地规定。',
    pictureUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
    user: { id: 3, name: '王五', email: 'wang@example.com' }
  },
  {
    id: '7',
    postName: '北京文化探索',
    location: '中国，北京',
    introduction: '探索中国首都的历史',
    description: '游览长城、故宫、天坛等历史遗迹，感受中华文化的博大精深。',
    policy: '请尊重文物古迹，不要乱涂乱画。',
    pictureUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d',
    user: { id: 1, name: '张三', email: 'zhang@example.com' }
  },
  {
    id: '8',
    postName: '马尔代夫度假',
    location: '马尔代夫',
    introduction: '享受热带天堂的放松时光',
    description: '在水上屋享受阳光沙滩，探索海底世界。',
    policy: '请保护海洋环境，不要伤害珊瑚和海洋生物。',
    pictureUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
    user: { id: 2, name: '李四', email: 'li@example.com' }
  },
  {
    id: '9',
    postName: '巴厘岛静心之旅',
    location: '印度尼西亚，巴厘岛',
    introduction: '寻找内心的平静',
    description: '参观乌布猴林、圣泉寺，学习瑜伽和冥想。',
    policy: '请尊重当地宗教习俗，着装得体。',
    pictureUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    user: { id: 3, name: '王五', email: 'wang@example.com' }
  },
  {
    id: '10',
    postName: '伦敦城市探险',
    location: '英国，伦敦',
    introduction: '探索英伦魅力',
    description: '参观大本钟、伦敦塔桥、大英博物馆等经典景点。',
    policy: '请注意天气变化，随身携带雨具。',
    pictureUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    user: { id: 1, name: '张三', email: 'zhang@example.com' }
  },
];

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
      // 如果需要测试，可以使用模拟数据
      // setPosts(mockPosts);
      
      const posts = await getPost();
      console.log('Fetched posts:', posts);
      setPosts(posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      // 出错时使用模拟数据
      setPosts(mockPosts);
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