import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { senderId, targetId, content, isGroup } = req.body;
    const client = await clientPromise;
    const db = client.db('messenger');

    const newMessage = {
      senderId: new ObjectId(senderId),
      content,
      timestamp: new Date()
    };

    if (isGroup) {
      newMessage.groupId = new ObjectId(targetId);
    } else {
      newMessage.receiverId = new ObjectId(targetId);
    }

    const result = await db.collection('messages').insertOne(newMessage);
    newMessage.id = result.insertedId;

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
