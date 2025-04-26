import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  const { booking, user } = body;

  const totalAmount = 500; 

  const invoicePayload = {
    external_id: `booking-${Date.now()}`,
    amount: totalAmount,
    payer_email: user?.email || 'guest@example.com',
    description: `Reservation for Room ${booking.room_id}`,
    currency: 'PHP',
    success_redirect_url: process.env.NEXT_PUBLIC_URL + '/foodstall/lease-status',
    failure_redirect_url: process.env.NEXT_PUBLIC_URL + '/customer/booking-failed',
  };

  try {
    const res = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.XENDIT_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoicePayload),
    });

    const invoice = await res.json();

    if (!res.ok) throw new Error(invoice.message || 'Failed to create invoice');

    return NextResponse.json({ success: true, redirect_url: invoice.invoice_url });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
