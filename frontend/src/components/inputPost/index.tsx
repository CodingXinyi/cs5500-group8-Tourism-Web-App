import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { sendPost } from '../../client/posts';

interface ModalFormProps {
  show: boolean;
  onHide: () => void;
}

type postType = {
  userId: number;
  postName: string;
  location: string;
  introduction: string;
  description: string;
  policy: string;
  pictureUrl: string;
};

const ModalForm: React.FC<ModalFormProps> = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    rating: '',
    location: '',
    landmarkName: '',
    description: '',
    introduction: '',
    policy: '',
    image1: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : null });
  };

  const handleSubmit = async () => {
    const postData: postType = {
      userId: 1, // You can dynamically set this based on the logged-in user
      postName: formData.landmarkName,
      location: formData.location,
      introduction: formData.introduction,
      description: formData.description,
      policy: formData.policy,
      pictureUrl: formData.image1 ? URL.createObjectURL(formData.image1) : '',
    };

    try {
      await sendPost(postData); // Assuming sendPost accepts postData as argument
      onHide(); // Close the modal after submission
    } catch (error) {
      console.error('Error while posting:', error);
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

          <Form.Group className="mb-3" controlId="formImage1">
            <Form.Label>Image 1</Form.Label>
            <Form.Control
              type="file"
              name="image1"
              onChange={handleFileChange}
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
