import React, { useRef, useState } from 'react';
import './CreatePostModal.scss';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../store/slices/postSlice';
import { message } from 'antd'; // Import Ant Design message

export default function CreatePostModal({ onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
  const fileInputRef = useRef();
  const router = useRouter();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage(); // Initialize message API
  // Fix: fallback to empty object if state.posts or state.auth is undefined
  const { loading, error } = useSelector(state => state.posts || {});
  const loggedInUser = useSelector(state => state.auth.user || {});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handlePost = async () => {
    if (!selectedImage || isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('caption', caption);
    try {
      const res = await dispatch(createPost(formData)).unwrap();
      if (res && res._id) {
        messageApi.success('Post created successfully!'); // Show success message
        handleClose();
        router.push(`/profile/${loggedInUser.userId}`);
      }
    } catch (err) {
      messageApi.error(err?.message || 'Failed to create post'); // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedImage(null);
    setCaption('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {contextHolder} {/* Add context holder for message API */}
      <div className="create-post-modal-backdrop" onClick={handleClose}>
        <div className="create-post-modal split" onClick={e => e.stopPropagation()}>
          <button className="close-btn" onClick={handleClose}>&times;</button>
          <div className="modal-content-row">
            <div className="modal-img-col">
              {!selectedImage ? (
                <div className="upload-area" onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current.click()}>
                  <div className="upload-icon">📷</div>
                  <div>Drag photo here</div>
                  <button type="button" className="select-btn" onClick={() => fileInputRef.current.click()}>Select from computer</button>
                  <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
                </div>
              ) : (
                <div className="preview-area">
                  <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="preview-img" />
                </div>
              )}
            </div>
            <div className="modal-form-col">
              <h2 className="heading-post-modal">Create new post</h2>
              <textarea
                className="post-desc-input"
                placeholder="Caption"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                maxLength={500}
                rows={5}
              />
              {!isSubmitting ? (
                <button className="post-btn" onClick={handlePost} disabled={!selectedImage}>
                  Post
                </button>
              ) : (
                <button className="post-btn" disabled style={{ opacity: 0.7 }}>
                  Posting...
                </button>
              )}
              {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}