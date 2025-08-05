import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';

// Setup Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(process.env.NEXT_APPWRITE_KEY);

const databases = new Databases(client);

// GET API to fetch all sub-account balances
export async function GET() {
  try {
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SUB_ACCOUNTS;

    // Fetch documents from sub_accounts collection
    const result = await databases.listDocuments(databaseId, collectionId);

    // Map each document to return stall_name, room_id, and balance
    const balances = result.documents.map((doc) => ({
      stall_name: doc.stall_name,
      room_id: doc.room_id,
      balance: typeof doc.balance === 'number' ? doc.balance : 0, // Default to 0 if undefined
    }));

    // Respond with success and balances
    return NextResponse.json({ success: true, balances });
  } catch (err) {
    console.error('Fetch balances error:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
