import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { updatePost } from '../../client/posts';

interface EditModalFormProps {
  show: boolean;
  onHide: () => void;
  post: Post | null; // 用于接收要编辑的 post
  onUpdate?: (updatedPost: Post) => void;  // 添加新的回调属性
}

type Post = {
  id: string;
  postName: string;
  location: string;
  introduction: string;
  description: string;
  policy: string;
  pictureUrl: string;
};

const EditModalForm: React.FC<EditModalFormProps> = ({
  show,
  onHide,
  post,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    postName: '',
    location: '',
    introduction: '',
    description: '',
    policy: '',
    pictureUrl: '',
  });

  useEffect(() => {
    if (post) {
      setFormData({
        postName: post.postName,
        location: post.location,
        introduction: post.introduction,
        description: post.description,
        policy: post.policy,
        pictureUrl: post.pictureUrl,
      });
    }
  }, [post]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!post) return;

    try {
      const updatedPost = await updatePost(post.id, formData);
      if (onUpdate) {
        onUpdate(updatedPost);  // 调用回调函数更新父组件状态
      }
      onHide();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Destination</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="postName"
              value={formData.postName}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Introduction</Form.Label>
            <Form.Control
              as="textarea"
              name="introduction"
              value={formData.introduction}
              onChange={handleInputChange}
              rows={2}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Policy</Form.Label>
            <Form.Control
              as="textarea"
              name="policy"
              value={formData.policy}
              onChange={handleInputChange}
              rows={3}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPictureUrl">
                      <Form.Label>Picture URL</Form.Label>
                      <Form.Control
                        type="text"
                        name="pictureUrl"
                        value={formData.pictureUrl}
                        onChange={handleInputChange}
                        placeholder="Enter image URL"
                      />
                    </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditModalForm;