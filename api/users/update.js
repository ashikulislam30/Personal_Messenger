import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, updates } = req.body;
    const client = await clientPromise;
    const db = client.db('messenger');

    // Only allow updating certain fields
    const safeUpdates = {};
    if (updates.firstName) safeUpdates.firstName = updates.firstName;
    if (updates.lastName) safeUpdates.lastName = updates.lastName;
    if (updates.profileImage) safeUpdates.profileImage = updates.profileImage;

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: safeUpdates }
    );

    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const { password, _id, ...safeUser } = updatedUser;
    safeUser.id = _id;

    res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
