import React, { useState } from 'react';
import { ChatService } from '../services/ChatService';
import { useAuth } from '../context/AuthContext';
import { X, CheckSquare, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/Components.css';

const CreateGroupModal = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.length > 0) {
      const data = await ChatService.searchUsers(val, user.id);
      setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  };

  const toggleUser = (uId) => {
    if (selectedUsers.includes(uId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== uId));
    } else {
      setSelectedUsers([...selectedUsers, uId]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    await ChatService.createGroup(groupName, user.id, selectedUsers);
    onCreated();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="modal-content glass-morphism" 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Create New Group</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="input-group">
          <label>Group Name</label>
          <input 
            type="text" 
            placeholder="Cool Squad" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <div className="participants-section">
          <label>Add Participants</label>
          <input 
            type="text" 
            placeholder="Search by name, username or email..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <div className="search-results">
            {searchResults.map(u => (
              <div key={u.id} className="user-select-item" onClick={() => toggleUser(u.id)}>
                <div className="item-profile">
                  <div className="result-avatar mini">
                    {u.profileImage ? (
                      <img src={u.profileImage} alt="Profile" className="avatar-img" />
                    ) : (
                      <Users size={16} />
                    )}
                  </div>
                  <div className="item-info">
                    <span className="item-name">{u.firstName} {u.lastName}</span>
                    <span className="item-username">@{u.username}</span>
                  </div>
                </div>
                {selectedUsers.includes(u.id) ? (
                  <CheckSquare size={20} className="checked" />
                ) : (
                  <Square size={20} className="unchecked" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="primary-btn" onClick={handleCreate} disabled={!groupName || selectedUsers.length === 0}>
            Create Group
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;
