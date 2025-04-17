import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Modal } from 'react-bootstrap';
import { fetchPostComments, addComment, deleteComment, updateComment } from '../../client/comments';
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
  const [editingComment, setEditingComment] = useState<CommentType | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

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
      alert('请先登录后再发表评论');
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

  // 打开编辑模态框
  const handleEditClick = (comment: CommentType) => {
    setEditingComment(comment);
    setEditedCommentText(comment.comment);
    setShowEditModal(true);
  };

  // 确认编辑评论
  const handleEditSubmit = async () => {
    if (!editingComment || !editedCommentText.trim()) return;
    
    try {
      await updateComment(editingComment.id, editedCommentText);
      await loadComments(); // 重新加载评论
      setShowEditModal(false);
    } catch (error) {
      console.error('编辑评论失败:', error);
    }
  };

  // 打开删除确认模态框
  const handleDeleteClick = (commentId: number) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  // 确认删除评论
  const handleDeleteConfirm = async () => {
    if (commentToDelete === null) return;
    
    try {
      await deleteComment(commentToDelete);
      await loadComments(); // 重新加载评论
      setShowDeleteModal(false);
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
  };

  // 判断当前用户是否是评论作者
  const isCommentAuthor = (comment: CommentType) => {
    return currentUser && currentUser.id === comment.user.id;
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
                {isCommentAuthor(comment) && (
                  <div className="comment-actions">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleEditClick(comment)}
                      className="edit-btn"
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteClick(comment.id)}
                      className="delete-btn"
                    >
                      Delete
                    </Button>
                  </div>
                )}
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

      {/* 编辑评论模态框 */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={3}
            value={editedCommentText}
            onChange={(e) => setEditedCommentText(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEditSubmit}
            disabled={!editedCommentText.trim()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 删除评论确认模态框 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this comment? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Comments; 