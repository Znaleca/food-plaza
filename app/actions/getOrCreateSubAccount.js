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

    // sanitize and ensure we have a safe local-part for the account email
    let sanitizedRoomName = (roomName || `stall${roomId}`).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!sanitizedRoomName) sanitizedRoomName = `stall${roomId}`;
    const sanitizedRoomId = String(roomId).replace(/[^a-z0-9]/gi, '');

    // limit local part length to 50 chars to avoid provider rejections
    const localPart = `${sanitizedRoomName}_${sanitizedRoomId}`.slice(0, 50);
    const accountEmail = `${localPart}@example.com`;

    const authHeader = `Basic ${Buffer.from(`${xenditKey}:`).toString('base64')}`;

    // 2. Create new sub-account in Xendit with retry for 5xx errors and handling duplicate-email (409)
    const attemptRequest = async (emailToUse, attempt = 1) => {
      const res = await fetch('https://api.xendit.co/v2/accounts', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToUse,
          type: 'OWNED',
          public_profile: {
            business_name: roomName,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) return data;

      // If server error (5xx), retry a few times with backoff
      if (res.status >= 500 && attempt < 3) {
        const backoff = 500 * Math.pow(2, attempt - 1);
        console.warn(`⚠️ Xendit server error (status ${res.status}). Retrying in ${backoff}ms (attempt ${attempt})...`);
        await new Promise((r) => setTimeout(r, backoff));
        return attemptRequest(emailToUse, attempt + 1);
      }

      // For other errors, throw with the response body for inspection
      const validationDetails = Array.isArray(data?.errors) && data.errors.length
        ? ` | ${data.errors.map((item) => item?.message || item?.field || JSON.stringify(item)).join('; ')}`
        : '';
      const errMsg = `${data?.message || data?.error || `Xendit error ${res.status}`}${validationDetails}`;
      const err = new Error(errMsg);
      err.status = res.status;
      err.response = data;
      throw err;
    };

    // Try creating with unique emails if duplicate-email error occurs
    let data = null;
    const maxEmailAttempts = 5;
    for (let attempt = 0; attempt < maxEmailAttempts; attempt++) {
      // On subsequent attempts append a short random suffix to the local part
      const suffix = attempt === 0 ? '' : `_${Math.random().toString(36).slice(2, 6)}`;
      const candidateLocal = `${localPart}${suffix}`.slice(0, 50);
      const candidateEmail = `${candidateLocal}@example.com`;

      try {
        data = await attemptRequest(candidateEmail);
        // success
        console.log(`✅ Created sub-account for roomId: ${roomId} → Xendit ID: ${data.id} (email: ${candidateEmail})`);
        break;
      } catch (err) {
        // If duplicate email, try next candidate
        if (err.status === 409 && err.response?.error_code === 'BUSINESS_DUPLICATE_EMAIL_ERROR') {
          console.warn(`⚠️ Duplicate email detected for ${candidateEmail}. Trying another email... (attempt ${attempt + 1})`);
          continue;
        }
        // Otherwise rethrow
        throw err;
      }
    }

    if (!data) {
      throw new Error('Failed to create Xendit sub-account after multiple attempts');
    }

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
