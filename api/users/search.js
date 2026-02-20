import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query, currentUserId } = req.query;
    const client = await clientPromise;
    const db = client.db('messenger');

    const lowerQuery = query.toLowerCase();
    
    // We search across all users except current
    const users = await db.collection('users').find({
      _id: { $ne: new ObjectId(currentUserId) },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ]
    }).limit(20).toArray();

    const safeUsers = users.map(({ password, _id, ...rest }) => ({
      ...rest,
      id: _id
    }));

    res.status(200).json(safeUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
