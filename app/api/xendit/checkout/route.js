import { NextResponse } from 'next/server';
import { groupBy } from 'lodash';
import getOrCreateSubAccount from '@/app/actions/getOrCreateSubAccount';
import processCheckout from '@/app/actions/processCheckout';

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
  return str.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 100) || 'DefaultName';
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, user, totalAmount, voucherMap } = body;

    // Save order in Appwrite first
    const orderResult = await processCheckout(items, null, voucherMap);
    if (!orderResult.success) {
      return NextResponse.json({ success: false, message: orderResult.message });
    }
    const orderId = orderResult.orderId;

    // Build split rules
    const groupedItems = groupBy(items, 'room_id');
    const splitRoutes = [];

    for (const roomId in groupedItems) {
      const stallItems = groupedItems[roomId];
      const roomName = stallItems[0]?.room_name || `Stall ${roomId}`;

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
      const subAccountId = await getOrCreateSubAccount(roomId, roomName);

      splitRoutes.push({
        flat_amount: roundedTotal,
        currency: 'PHP',
        destination_account_id: subAccountId,
        reference_id: sanitizeForXendit(roomId),
      });
    }

    // Create split rule
    const splitRule = await xenditFetch('/split_rules', 'POST', {
      name: sanitizeForXendit(`Order ${orderId} Split`),
      description: sanitizeForXendit(`Order ${orderId} Split`),
      routes: splitRoutes,
    });

    // Create invoice
    const invoice = await xenditFetch(
      '/v2/invoices',
      'POST',
      {
        external_id: `maproom_${orderId}`,
        amount: totalAmount,
        payer_email: user?.email || 'guest@example.com',
        description: `Food Order #${orderId}`,
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
