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

    return [...userGroups, ...privateChats];
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
    if (isGroup) {
      return messages.filter(m => m.groupId === targetId);
    } else {
      return messages.filter(m => 
        (m.senderId === userId && m.receiverId === targetId) ||
        (m.senderId === targetId && m.receiverId === userId)
      );
    }
  }
};
