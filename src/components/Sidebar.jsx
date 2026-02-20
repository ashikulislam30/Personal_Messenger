import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Search, Plus, Users, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import SettingsModal from './SettingsModal';
import '../styles/Chat.css';

const Sidebar = ({ conversations, activeChat, setActiveChat, onSearchClick, onCreateGroup }) => {
  const { user, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <aside className="sidebar glass-morphism">
      <div className="sidebar-header">
        <div className="user-profile" onClick={() => setIsSettingsOpen(true)} title="Profile Settings">
          <div className="avatar">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="avatar-img" />
            ) : (
              `${user.firstName[0]}${user.lastName[0]}`
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{user.firstName} {user.lastName}</span>
            <span className="user-status">Online</span>
          </div>
        </div>
        <div className="header-nav">
          <button onClick={() => setIsSettingsOpen(true)} className="icon-btn" title="Settings">
            <Settings size={20} />
          </button>
          <button onClick={logout} className="icon-btn logout-btn" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <div className="sidebar-actions">
        <button className="action-btn" onClick={onSearchClick}>
          <Search size={18} />
          <span>Search Friends</span>
        </button>
        <button className="action-btn" onClick={onCreateGroup}>
          <Plus size={18} />
          <span>New Group</span>
        </button>
      </div>

      <div className="conversations-list">
        <h3>Conversations</h3>
        {conversations.length === 0 ? (
          <p className="no-chats">No active chats yet</p>
        ) : (
          conversations.map(chat => (
            <motion.div 
              key={chat.id}
              whileHover={{ x: 4 }}
              className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChat(chat)}
            >
              <div className={`chat-avatar ${chat.isGroup ? 'group' : ''}`}>
                {chat.isGroup ? <Users size={20} /> : <User size={20} />}
              </div>
              <div className="chat-details">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-preview">
                  {chat.isGroup ? 'Group Chat' : `@${chat.username}`}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
