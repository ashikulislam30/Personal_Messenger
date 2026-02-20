import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatService } from '../services/ChatService';
import { Send, Phone, Video, Info, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Chat.css';

const ChatWindow = ({ chat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  const fetchMessages = async () => {
    if (chat) {
      const data = await ChatService.getMessages(user.id, chat.id, chat.isGroup);
      setMessages(data);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [chat, user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await ChatService.sendMessage(user.id, chat.id, newMessage, chat.isGroup);
    setNewMessage('');
    fetchMessages();
  };

  return (
    <div className="chat-window">
      <header className="chat-header glass-morphism">
        <div className="chat-header-info">
          <div className="header-avatar">
            {chat.isGroup ? (
              <Users size={20} />
            ) : chat.profileImage ? (
              <img src={chat.profileImage} alt="Profile" className="avatar-img" />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="header-text">
            <h3>{chat.name}</h3>
            <span>{chat.isGroup ? 'Group Conversation' : 'Last seen recently'}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn"><Phone size={20} /></button>
          <button className="icon-btn"><Video size={20} /></button>
          <button className="icon-btn"><Info size={20} /></button>
        </div>
      </header>

      <div className="messages-area" ref={scrollRef}>
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`message-wrapper ${m.senderId === user.id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{m.content}</p>
                <span className="timestamp">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <footer className="chat-input-area glass-morphism">
        <form onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="send-btn">
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
