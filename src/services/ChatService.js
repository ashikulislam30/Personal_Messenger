export const ChatService = {
  async searchUsers(query, currentUserId) {
    const res = await fetch(`/api/users/search?query=${query}&currentUserId=${currentUserId}`);
    return await res.json();
  },

  async createGroup(name, creatorId, participantIds) {
    const res = await fetch('/api/groups/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, creatorId, participantIds })
    });
    return await res.json();
  },

  async getConversations(userId) {
    const res = await fetch(`/api/groups/all?userId=${userId}`);
    return await res.json();
  },

  async sendMessage(senderId, targetId, content, isGroup) {
    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, targetId, content, isGroup })
    });
    return await res.json();
  },

  async getMessages(userId, targetId, isGroup) {
    const res = await fetch(`/api/messages/get?userId=${userId}&targetId=${targetId}&isGroup=${isGroup}`);
    return await res.json();
  }
};
