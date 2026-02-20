import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Camera, Save, User as UserIcon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/Components.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    profileImage: user.profileImage || ''
  });
  const [preview, setPreview] = useState(user.profileImage || '');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage
        alert('Image size should be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(formData);
    setLoading(false);
    onClose();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      setIsDeleting(true);
      const result = await deleteAccount();
      if (!result.success) {
        alert(result.message);
        setIsDeleting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-content glass-morphism settings-modal" 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Profile Settings</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="profile-image-section">
            <div className="image-preview-wrapper" onClick={() => fileInputRef.current.click()}>
              {preview ? (
                <img src={preview} alt="Profile" className="profile-preview-img" />
              ) : (
                <div className="placeholder-preview">
                  <UserIcon size={40} />
                </div>
              )}
              <div className="camera-overlay">
                <Camera size={20} />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="image-hint">Click to change profile picture</p>
          </div>

          <div className="row">
            <div className="input-group">
              <label>First Name</label>
              <input 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="input-group readonly">
            <label>Username (Cannot be changed)</label>
            <input value={user.username} readOnly />
          </div>

          <div className="input-group readonly">
            <label>Email (Cannot be changed)</label>
            <input value={user.email} readOnly />
          </div>

          <div className="modal-footer">
            <button type="button" className="delete-btn" onClick={handleDeleteAccount} disabled={isDeleting}>
              <Trash2 size={18} style={{ marginRight: 8 }} />
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              <Save size={18} style={{ marginRight: 8 }} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>

    </div>
  );
};

export default SettingsModal;
