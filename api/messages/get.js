import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, targetId, isGroup } = req.query;
    const client = await clientPromise;
    const db = client.db('messenger');

    let filter;
    if (isGroup === 'true') {
      filter = { groupId: new ObjectId(targetId) };
    } else {
      filter = {
        $or: [
          { senderId: new ObjectId(userId), receiverId: new ObjectId(targetId) },
          { senderId: new ObjectId(targetId), receiverId: new ObjectId(userId) }
        ]
      };
    }

    const messages = await db.collection('messages').find(filter).sort({ timestamp: 1 }).toArray();
    
    const safeMessages = messages.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));

    res.status(200).json(safeMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
