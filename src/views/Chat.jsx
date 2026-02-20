import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatService } from '../services/ChatService';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import SearchModal from '../components/SearchModal';
import CreateGroupModal from '../components/CreateGroupModal';
import { MessageSquare } from 'lucide-react';
import '../styles/Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      const data = await ChatService.getConversations(user.id);
      setConversations(data);
    };
    
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll list every 5 seconds
    
    return () => clearInterval(interval);
  }, [user.id]);

  return (
    <div className="chat-layout">
      <Sidebar 
        conversations={conversations} 
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        onSearchClick={() => setIsSearchOpen(true)}
        onCreateGroup={() => setIsGroupModalOpen(true)}
      />
      
      <main className="chat-main">
        {activeChat ? (
          <ChatWindow chat={activeChat} />
        ) : (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <MessageSquare size={64} />
            </div>
            <h2>Select a conversation to start messaging</h2>
            <p>Search for friends or create a group to get started</p>
            
            <div className="quick-search-hint">
              <span>Pro tip: Use search button in sidebar to find users by Name, Username or Email</span>
            </div>
          </div>
        )}
      </main>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onSelect={(chat) => {
          setActiveChat(chat);
          setIsSearchOpen(false);
        }}
      />

      <CreateGroupModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onCreated={() => {
          fetchConversations();
          setIsGroupModalOpen(false);
        }}
      />
    </div>
  );
};

export default Chat;
