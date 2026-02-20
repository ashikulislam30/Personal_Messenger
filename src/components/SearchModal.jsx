import React, { useState } from 'react';
import { ChatService } from '../services/ChatService';
import { useAuth } from '../context/AuthContext';
import { X, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/Components.css';

const SearchModal = ({ isOpen, onClose, onSelect }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0) {
      const data = await ChatService.searchUsers(val, user.id);
      setResults(data);
    } else {
      setResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="modal-content glass-morphism" 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Find Friends</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            autoFocus
            type="text" 
            placeholder="Search by name, username or email..." 
            value={query}
            onChange={handleSearch}
          />
        </div>

        <div className="results-list">
          {results.length === 0 && query.length > 0 ? (
            <p className="no-results">No users found</p>
          ) : (
            results.map(u => (
              <div 
                key={u.id} 
                className="result-item"
                onClick={() => onSelect({
                  id: u.id,
                  name: `${u.firstName} ${u.lastName}`,
                  username: u.username,
                  profileImage: u.profileImage,
                  isGroup: false
                })}
              >
                <div className="result-avatar">
                  {u.profileImage ? (
                    <img src={u.profileImage} alt="Profile" className="avatar-img" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="result-info">
                  <span className="result-name">{u.firstName} {u.lastName}</span>
                  <span className="result-username">@{u.username}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SearchModal;
