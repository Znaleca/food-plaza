// app/actions/getOrCreateSubAccount.js
import { Client, Databases, Query, ID } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(process.env.NEXT_APPWRITE_KEY);

const databases = new Databases(client);

async function getOrCreateSubAccount(roomId, roomName) {
  try {
    // ✅ Validate roomId
    if (!roomId || roomId.trim() === "") {
      throw new Error("Invalid roomId");
    }

    // ✅ Default roomName if missing
    if (!roomName || roomName.trim() === "") {
      roomName = `Stall ${roomId}`;
    }

    const collectionId =
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SUB_ACCOUNTS;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;

    // 1. ✅ Check if sub-account already exists
    const result = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("room_id", roomId),
    ]);

    if (result.documents.length > 0) {
      console.log(`✅ Sub-account found for roomId: ${roomId}`);
      return result.documents[0].xendit_account_id;
    }

    // 2. ✅ Sanitize values for Xendit
    const safeRoomName = roomName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") // letters + numbers only
      .slice(0, 12); // keep it short to avoid Xendit errors

    const safeRoomId = roomId.replace(/[^a-z0-9]/gi, "").slice(0, 16);

    // 3. ✅ Build unique but consistent email
    const email = `${safeRoomName || safeRoomId}@maproom.stalls.com`;

    const xenditKey = process.env.XENDIT_API_KEY;
    if (!xenditKey) throw new Error("Missing XENDIT_API_KEY");

    const authHeader = `Basic ${Buffer.from(`${xenditKey}:`).toString("base64")}`;

    // 4. ✅ Create new sub-account in Xendit
    const xenditResponse = await fetch("https://api.xendit.co/v2/accounts", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        type: "MANAGED",
        business_name: safeRoomId || `stall_${Date.now()}`,
      }),
    });

    const data = await xenditResponse.json();

    if (!xenditResponse.ok) {
      console.error("❌ Xendit sub-account creation failed:", data);
      throw new Error(data.message || "Failed to create sub-account");
    }

    console.log(
      `✅ Created sub-account for roomId: ${roomId} with Xendit account ID: ${data.id}`
    );

    // 5. ✅ Save sub-account in Appwrite
    await databases.createDocument(databaseId, collectionId, ID.unique(), {
      room_id: roomId,
      xendit_account_id: data.id,
      stall_name: roomName,
      balance: 0,
      balance_updated_at: new Date().toISOString(),
    });

    return data.id;
  } catch (err) {
    console.error("❌ Sub-account error:", err);
    throw err;
  }
}

export default getOrCreateSubAccount;
