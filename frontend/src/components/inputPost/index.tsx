import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { sendPost } from '../../client/posts';
import { AuthContext } from '../../context/authContext.js';

interface ModalFormProps {
  show: boolean;
  onHide: () => void;
  onPostCreated?: (newPost: any) => void;
}

type postType = {
  userId: number;
  rating:number;
  postName: string;
  location: string;
  introduction: string;
  description: string;
  policy: string;
  pictureUrl: string;
};

const ModalForm: React.FC<ModalFormProps> = ({ show, onHide, onPostCreated }) => {
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    rating: 5,
    location: '',
    landmarkName: '',
    description: '',
    introduction: '',
    policy: '',
    pictureUrl: '', // Use this field for the image URL
  });

  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // 如果是评分字段，则将其转换为数字类型
    if (name === 'rating') {
      setFormData({
        ...formData,
        [name]: value ? Number(value) : 5, 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      alert('请先登录后再发布帖子');
      return;
    }

    const postData: postType = {
      userId: currentUser.id,
      rating: formData.rating, 
      postName: formData.landmarkName,
      location: formData.location,
      introduction: formData.introduction,
      description: formData.description,
      policy: formData.policy,
      pictureUrl: formData.pictureUrl,
    };

    console.log(postData); 
    try {
      const newPost = await sendPost(postData);
      // 清空表单
      setFormData({
        rating: 5,
        location: '',
        landmarkName: '',
        description: '',
        introduction: '',
        policy: '',
        pictureUrl: '',
      });
      // 通知父组件
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      onHide(); 
    } catch (error) {
      console.error('提交失败:', error);
    }
  };


  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Share Your Destinations!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formRating">
            <Form.Label>Rating</Form.Label>
            <Form.Control
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              placeholder="Enter rating (1-5)"
              min="1"
              max="5"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formLandmarkName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="landmarkName"
              value={formData.landmarkName}
              onChange={handleInputChange}
              placeholder="Enter destination name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formLocation">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter the location"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formIntroduction">
            <Form.Label>Introduction</Form.Label>
            <Form.Control
              as="textarea"
              name="introduction"
              value={formData.introduction}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter a brief Introduction"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter a brief description"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPolicy">
            <Form.Label>Policy</Form.Label>
            <Form.Control
              as="textarea"
              name="policy"
              value={formData.policy}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter related policies"
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
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalForm;