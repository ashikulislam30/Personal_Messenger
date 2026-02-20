import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, creatorId, participantIds } = req.body;
    const client = await clientPromise;
    const db = client.db('messenger');

    const newGroup = {
      name,
      creatorId: new ObjectId(creatorId),
      participants: [...new Set([creatorId, ...participantIds])].map(id => new ObjectId(id)),
      createdAt: new Date(),
      isGroup: true
    };

    const result = await db.collection('groups').insertOne(newGroup);
    newGroup.id = result.insertedId;

    res.status(201).json(newGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
