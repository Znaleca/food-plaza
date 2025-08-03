import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(process.env.NEXT_APPWRITE_KEY);

const databases = new Databases(client);

async function getOrCreateSubAccount(roomId, roomName) {
  try {
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SUB_ACCOUNTS;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;

    // 1. Check if sub-account already exists
    const result = await databases.listDocuments(databaseId, collectionId, [
      Query.equal('room_id', roomId),
    ]);

    if (result.documents.length > 0) {
      return result.documents[0].xendit_account_id;
    }

    const xenditKey = process.env.XENDIT_API_KEY;
    if (!xenditKey) throw new Error('Missing XENDIT_API_KEY');

    // 2. MOCK: Return fake account in test mode
    if (xenditKey.startsWith('xnd_development_')) {
      console.warn('⚠️ Skipping real sub-account creation in test mode');
      const mockId = `mock-subaccount-${roomId}`;
      await databases.createDocument(databaseId, collectionId, 'unique()', {
        room_id: roomId,
        xendit_account_id: mockId,
        stall_name: roomName,
      });
      return mockId;
    }

    // 3. REAL: Create new sub-account in Xendit (live mode only)
    const authHeader = `Basic ${Buffer.from(`${xenditKey}:`).toString('base64')}`;
    const xenditResponse = await fetch('https://api.xendit.co/v2/accounts', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `${roomId}@maproom.com`,
        type: 'MANAGED',
        business_name: roomName,
      }),
    });

    const data = await xenditResponse.json();

    if (!xenditResponse.ok) {
      console.error('Xendit sub-account creation failed:', data);
      throw new Error(data.message || 'Failed to create sub-account');
    }

    // 4. Save sub-account to Appwrite
    await databases.createDocument(databaseId, collectionId, 'unique()', {
      room_id: roomId,
      xendit_account_id: data.id,
      stall_name: roomName,
    });

    return data.id;
  } catch (err) {
    console.error('Sub-account error:', err);
    throw err;
  }
}

export default getOrCreateSubAccount;
