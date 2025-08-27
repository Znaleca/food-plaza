import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(process.env.NEXT_APPWRITE_KEY);

const databases = new Databases(client);

async function getOrCreateSubAccount(roomId, roomName) {
  try {
    if (!roomId || roomId === '') {
      throw new Error('Invalid roomId');
    }

    if (!roomName || roomName === '') {
      roomName = `Stall ${roomId}`;
    }

    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SUB_ACCOUNTS;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;

    // 1. Check if sub-account already exists
    const result = await databases.listDocuments(databaseId, collectionId, [
      Query.equal('room_id', roomId),
    ]);

    if (result.documents.length > 0) {
      console.log(`✅ Sub-account found for roomId: ${roomId}`);
      return result.documents[0].xendit_account_id;
    }

    const xenditKey = process.env.XENDIT_API_KEY;
    if (!xenditKey) throw new Error('Missing XENDIT_API_KEY');

    const sanitizedRoomName = roomName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedRoomId = roomId.replace(/[^a-z0-9]/g, '');

    const authHeader = `Basic ${Buffer.from(`${xenditKey}:`).toString('base64')}`;

    // 2. Create new sub-account in Xendit
    const xenditResponse = await fetch('https://api.xendit.co/v2/accounts', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `${sanitizedRoomName}_${sanitizedRoomId}@gmail.com`, // ✅ unique email
        type: 'MANAGED',
        business_name: roomName, // ✅ keep human-readable
      }),
    });

    const data = await xenditResponse.json();

    if (!xenditResponse.ok) {
      console.error('❌ Xendit sub-account creation failed:', data);
      throw new Error(data.message || 'Failed to create sub-account');
    }

    console.log(`✅ Created sub-account for roomId: ${roomId} → Xendit ID: ${data.id}`);

    // 3. Save sub-account to Appwrite
    await databases.createDocument(databaseId, collectionId, 'unique()', {
      room_id: roomId,
      xendit_account_id: data.id,
      stall_name: roomName,
      balance: 0, // ✅ optional but useful
    });

    return data.id;
  } catch (err) {
    console.error('❌ Sub-account error:', err);
    throw err;
  }
}

export default getOrCreateSubAccount;
