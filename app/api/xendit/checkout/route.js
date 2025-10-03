import { NextResponse } from 'next/server';
import { groupBy } from 'lodash';
import getOrCreateSubAccount from '@/app/actions/getOrCreateSubAccount';
import processCheckout from '@/app/actions/processCheckout';
import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(process.env.NEXT_APPWRITE_KEY);

const databases = new Databases(client);

async function xenditFetch(endpoint, method, body, extraHeaders = {}) {
  const authHeader = `Basic ${Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString('base64')}`;

  const res = await fetch(`https://api.xendit.co${endpoint}`, {
    method,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('❌ Xendit API Error:', data);
    throw new Error(data.message || 'Xendit API request failed');
  }
  return data;
}

function sanitizeForXendit(str) {
  return str.replace(/[^a-zA-Z0-9 ]/g, '') || 'DefaultName';
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, user, voucherMap } = body;

    // 1. Save order in Appwrite
    const orderResult = await processCheckout(items, null, voucherMap);
    if (!orderResult.success) {
      return NextResponse.json({ success: false, message: orderResult.message });
    }
    const orderId = orderResult.orderId;

    // 2. Group items by stall and calculate totals (per-item discounts applied)
    const groupedItems = groupBy(items, 'room_id');
    const splitRoutes = [];
    let finalDiscountedTotal = 0;

    for (const roomId in groupedItems) {
      const stallItems = groupedItems[roomId];
      const roomName = stallItems[0]?.room_name || `Stall ${roomId}`;

      // ✅ Calculate subtotal and per-item discounts
      let stallSubtotal = 0;
      let stallDiscountedTotal = 0;

      stallItems.forEach((item) => {
        const quantity = Number(item.quantity || 1);
        const itemBase = Number(item.menuPrice) * quantity;
        const itemDiscount = Number(item.discountAmount || 0);

        stallSubtotal += itemBase;
        stallDiscountedTotal += itemBase - itemDiscount;
      });

      const roundedTotal = Math.round(stallDiscountedTotal);
      finalDiscountedTotal += roundedTotal;

      // ✅ Create or fetch sub-account for stall
      const subAccountId = await getOrCreateSubAccount(roomId, roomName);

      splitRoutes.push({
        flat_amount: roundedTotal,
        currency: 'PHP',
        destination_account_id: subAccountId,
        reference_id: sanitizeForXendit(roomId),
      });

      // ✅ Update stall balance in Appwrite
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
          balance_updated_at: new Date().toISOString(),
        });
      }
    }

    // 3. Create Split Rule
    const splitRule = await xenditFetch('/split_rules', 'POST', {
      name: sanitizeForXendit(`Order ${orderId} Split`),
      description: sanitizeForXendit(`Order ${orderId} Split`),
      routes: splitRoutes,
    });

    // 4. Create Invoice with prefixed external_id
    const invoice = await xenditFetch(
      '/v2/invoices',
      'POST',
      {
        external_id: `thecorner_${orderId}`,
        amount: finalDiscountedTotal,
        payer_email: user?.email || 'guest@example.com',
        description: 'Food Order Payment',
        currency: 'PHP',
        success_redirect_url: `${process.env.NEXT_PUBLIC_URL}/customer/order-status?orderId=${orderId}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_URL}/customer/order-failed`,
      },
      { 'with-split-rule': splitRule.id }
    );

    return NextResponse.json({ success: true, redirect_url: invoice.invoice_url });
  } catch (error) {
    console.error('❌ Checkout + Split Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
