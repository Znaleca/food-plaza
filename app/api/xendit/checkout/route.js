import { NextResponse } from 'next/server';
import processCheckout from '@/app/actions/processCheckout';
import getOrCreateSubAccount from '@/app/actions/getOrCreateSubAccount';
import { groupBy } from 'lodash';

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, user, totalAmount, voucherMap } = body;

    // 1. Save the order in Appwrite
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
      const stallTotal = stallItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

      // Get or create Xendit sub-account
      const subAccountId = await getOrCreateSubAccount(roomId, roomName);

      splitTransfers.push({
        account: subAccountId,
        amount: Math.round(stallTotal), // Round to avoid decimal issues
      });
    }

    // 3. Create Xendit invoice with optional split payment
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
