import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { fetchPostComments, addComment } from '../../client/comments';
import { AuthContext } from '../../context/authContext';
import './styles.css';

interface CommentProps {
  postId: string | undefined;
}

interface CommentType {
  id: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const Comments: React.FC<CommentProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  // 获取评论
  const loadComments = async () => {
    if (!postId) return;
    
    try {
      const commentsData = await fetchPostComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('loading comments failed:', error);
    }
  };

  // 初始加载评论
  useEffect(() => {
    loadComments();
  }, [postId]);

  // 提交评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please login first to post a comment');
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      await addComment(currentUser.id, postId, newComment);
      setNewComment(''); // 清空输入框
      await loadComments(); // 重新加载评论
    } catch (error) {
      console.error('comment submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
  };

  return (
    <div className="comments-section">
      <h3>Comments</h3>
      
      {/* 评论列表 */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p>No comments yet, add your first comment!</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="comment-card">
              <Card.Body>
                <div className="comment-header">
                  <strong>{comment.user.name}</strong>
                  <small>{formatDate(comment.createdAt)}</small>
                </div>
                <Card.Text>{comment.comment}</Card.Text>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
      
      {/* 添加评论表单 */}
      <Form onSubmit={handleSubmitComment} className="comment-form">
        <Form.Group controlId="commentText">
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!currentUser || loading}
          />
        </Form.Group>
        <Button 
          variant="primary" 
          type="submit" 
          disabled={!currentUser || loading || !newComment.trim()}
          className="comment-submit-btn"
        >
          {loading ? 'Submitting...' : 'Post Comment'}
        </Button>
        {!currentUser && <p className="login-prompt">Please login first to post a comment</p>}
      </Form>
    </div>
  );
};

export default Comments; 