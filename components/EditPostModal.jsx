import React, { useRef, useState, useEffect } from 'react';
import './CreatePostModal.scss';

export default function EditPostModal({ open, onClose, post, onSave, loading, error }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    if (post) {
      setCaption(post.caption || '');
      setSelectedImage(null); // No new image selected yet
    }
  }, [post, open]);

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

  const handleSave = () => {
    if (!selectedImage && caption === post.caption) return; // No changes
    onSave({
      postId: post._id,
      caption,
      image: selectedImage || undefined,
    });
  };

  const handleClose = () => {
    onClose();
    setSelectedImage(null);
    setCaption(post ? post.caption : '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!open) return null;

  return (
    <div className="create-post-modal-backdrop" onClick={handleClose}>
      <div className="create-post-modal split" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>&times;</button>
        <div className="modal-content-row">
          <div className="modal-img-col">
            {selectedImage ? (
              <div className="preview-area">
                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="preview-img" />
              </div>
            ) : post && post.image ? (
              <div className="preview-area">
                <img src={post.image} alt="Current" className="preview-img" />
              </div>
            ) : (
              <div className="upload-area" onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current.click()}>
                <div className="upload-icon">📷</div>
                <div>Drag photo here</div>
                <button type="button" className="select-btn" onClick={() => fileInputRef.current.click()}>Select from computer</button>
                <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
              </div>
            )}
          </div>
          <div className="modal-form-col">
            <h2 className='heading-post-modal'>Edit post</h2>
            <textarea
              className="post-desc-input"
              placeholder="Caption"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              maxLength={500}
              rows={5}
            />
            <button className="post-btn" onClick={handleSave} disabled={loading || (!selectedImage && caption === post.caption)}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
} 