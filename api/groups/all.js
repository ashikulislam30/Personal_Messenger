import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const client = await clientPromise;
    const db = client.db('messenger');

    // 1. Get Groups user is part of
    const groups = await db.collection('groups').find({
      participants: new ObjectId(userId)
    }).toArray();

    // 2. Get Private chats based on message history
    const userObjectId = new ObjectId(userId);
    const recentMessages = await db.collection('messages').find({
      $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
      groupId: { $exists: false }
    }).toArray();

    const otherUserIds = new Set();
    recentMessages.forEach(m => {
      if (m.senderId.toString() !== userId) otherUserIds.add(m.senderId.toString());
      if (m.receiverId && m.receiverId.toString() !== userId) otherUserIds.add(m.receiverId.toString());
    });

    const otherUsers = await db.collection('users').find({
      _id: { $in: Array.from(otherUserIds).map(id => new ObjectId(id)) }
    }).toArray();

    const privateChats = otherUsers.map(u => ({
      id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      username: u.username,
      profileImage: u.profileImage,
      isGroup: false
    }));

    const safeGroups = groups.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));

    res.status(200).json([...safeGroups, ...privateChats]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
