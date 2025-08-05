import { NextResponse } from 'next/server';
import processCheckout from '@/app/actions/processCheckout';
import getOrCreateSubAccount from '@/app/actions/getOrCreateSubAccount';
import { groupBy } from 'lodash';
import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(process.env.NEXT_APPWRITE_KEY);

const databases = new Databases(client);

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, user, totalAmount, voucherMap } = body;

    // 1. Save order in Appwrite
    const orderResult = await processCheckout(items, null, voucherMap);
    if (!orderResult.success) {
      return NextResponse.json({ success: false, message: orderResult.message });
    }

    const orderId = orderResult.orderId;

    // 2. Group items by room_id and prepare split transfers
    const groupedItems = groupBy(items, 'room_id');
    const splitTransfers = [];

    for (const roomId in groupedItems) {
      const stallItems = groupedItems[roomId];
      const roomName = stallItems[0]?.room_name || `Stall ${roomId}`;

     // 🧮 Calculate discounted stall total if voucher exists
let stallTotal = stallItems.reduce(
  (acc, item) => acc + (Number(item.menuPrice) * Number(item.quantity || 1)),
  0
);

const voucher = voucherMap?.[roomId];
if (voucher?.discount) {
  const discountRate = Number(voucher.discount) / 100;
  stallTotal = stallTotal - stallTotal * discountRate;
}

const roundedTotal = Math.round(stallTotal);


      // Get or create sub-account
      const subAccountId = await getOrCreateSubAccount(roomId, roomName);

      // Add to splitTransfers
      splitTransfers.push({
        account: subAccountId,
        amount: roundedTotal,
      });

if (process.env.XENDIT_API_KEY.startsWith('xnd_development_')) {
  const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SUB_ACCOUNTS;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;

  const result = await databases.listDocuments(databaseId, collectionId, [
    Query.equal('room_id', roomId),
  ]);

  if (result.documents.length > 0) {
    const doc = result.documents[0];
    const currentBalance = doc.balance || 0;
    const newBalance = currentBalance + roundedTotal;

    await databases.updateDocument(databaseId, collectionId, doc.$id, {
      balance: newBalance,
      balance_updated_at: new Date().toISOString(), // ✅ store as string
    });
  }
}

    }

    // 3. Create Xendit invoice
    const invoicePayload = {
      external_id: orderId,
      amount: totalAmount,
      payer_email: user?.email || 'guest@example.com',
      description: 'Food Order Payment',
      currency: 'PHP',
      success_redirect_url: `${process.env.NEXT_PUBLIC_URL}/customer/order-status?orderId=${orderId}`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_URL}/customer/order-failed`,
      ...(splitTransfers.length > 0 && {
        split_payment: {
          type: 'FLAT',
          splits: splitTransfers,
        },
      }),
    };

    const invoiceRes = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoicePayload),
    });

    const invoice = await invoiceRes.json();
    if (!invoiceRes.ok) throw new Error(invoice.message || 'Failed to create invoice');

    return NextResponse.json({ success: true, redirect_url: invoice.invoice_url });
  } catch (error) {
    console.error('Xendit Invoice Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
