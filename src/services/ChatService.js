import localforage from 'localforage';

export const ChatService = {
  async searchUsers(query, currentUserId) {
    const users = (await localforage.getItem('users')) || [];
    console.log('Searching through users:', users.length, 'users found in database');
    
    const lowerQuery = query.toLowerCase();
    const results = users
      .filter(u => u.id !== currentUserId)
      .filter(u => 
        u.username.toLowerCase().includes(lowerQuery) || 
        u.email.toLowerCase().includes(lowerQuery) ||
        u.firstName.toLowerCase().includes(lowerQuery) ||
        u.lastName.toLowerCase().includes(lowerQuery)
      )
      .map(({ password, ...safeUser }) => safeUser);
    
    console.log(`Search results for "${query}":`, results);
    return results;
  },

  async createGroup(name, creatorId, participantIds) {
    const groups = (await localforage.getItem('groups')) || [];
    const newGroup = {
      id: crypto.randomUUID(),
      name,
      creatorId,
      participants: [...new Set([creatorId, ...participantIds])],
      createdAt: new Date(),
      isGroup: true
    };
    groups.push(newGroup);
    await localforage.setItem('groups', groups);
    return newGroup;
  },

  async markAsRead(userId, chatId) {
    const key = `lastRead_${userId}_${chatId}`;
    await localforage.setItem(key, new Date().toISOString());
  },

  async getConversations(userId) {
    const groups = (await localforage.getItem('groups')) || [];
    const userGroups = groups.filter(g => g.participants.includes(userId));
    
    const messages = (await localforage.getItem('messages')) || [];
    const privateChatUserIds = new Set();
    messages.forEach(m => {
      if (m.senderId === userId) privateChatUserIds.add(m.receiverId);
      else if (m.receiverId === userId) privateChatUserIds.add(m.senderId);
    });

    const users = (await localforage.getItem('users')) || [];
    const privateChats = users
      .filter(u => privateChatUserIds.has(u.id))
      .map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        username: u.username,
        profileImage: u.profileImage,
        isGroup: false
      }));

    const allConversations = [...userGroups, ...privateChats];

    // Check for unread messages
    const enhancedConversations = await Promise.all(allConversations.map(async chat => {
      const key = `lastRead_${userId}_${chat.id}`;
      const lastRead = await localforage.getItem(key);
      
      const chatMessages = chat.isGroup 
        ? messages.filter(m => m.groupId === chat.id)
        : messages.filter(m => 
            (m.senderId === userId && m.receiverId === chat.id) ||
            (m.senderId === chat.id && m.receiverId === userId)
          );

      const hasUnread = chatMessages.some(m => 
        m.senderId !== userId && (!lastRead || new Date(m.timestamp) > new Date(lastRead))
      );

      return { ...chat, hasUnread };
    }));

    return enhancedConversations;
  },

  async sendMessage(senderId, targetId, content, isGroup) {
    const messages = (await localforage.getItem('messages')) || [];
    const newMessage = {
      id: crypto.randomUUID(),
      senderId,
      [isGroup ? 'groupId' : 'receiverId']: targetId,
      content,
      timestamp: new Date()
    };
    messages.push(newMessage);
    await localforage.setItem('messages', messages);
    return newMessage;
  },

  async getMessages(userId, targetId, isGroup) {
    const messages = (await localforage.getItem('messages')) || [];
    const users = (await localforage.getItem('users')) || [];
    
    let filteredMessages = [];
    if (isGroup) {
      filteredMessages = messages.filter(m => m.groupId === targetId);
    } else {
      filteredMessages = messages.filter(m => 
        (m.senderId === userId && m.receiverId === targetId) ||
        (m.senderId === targetId && m.receiverId === userId)
      );
    }

    // Enhance messages with sender details
    return filteredMessages.map(m => {
      const sender = users.find(u => u.id === m.senderId);
      return {
        ...m,
        senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown User',
        senderColor: this.generateColor(m.senderId)
      };
    });
  },

  generateColor(id) {
    const colors = [
      '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
      '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
};
