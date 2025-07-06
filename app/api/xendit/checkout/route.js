import { NextResponse } from 'next/server';
import processCheckout from '@/app/actions/processCheckout';

export async function POST(req) {
  const body = await req.json();
  const { items, user, totalAmount, voucherMap } = body;

  const orderResult = await processCheckout(items, null, voucherMap);

  if (!orderResult.success) {
    return NextResponse.json({ success: false, message: orderResult.message });
  }

  const orderId = orderResult.orderId;
  const finalTotal = totalAmount;

  const invoicePayload = {
    external_id: orderId,
    amount: finalTotal,
    payer_email: user?.email || "guest@example.com",
    description: "Food Order Payment",
    currency: "PHP",
    success_redirect_url: process.env.NEXT_PUBLIC_URL + `/customer/order-status?orderId=${orderId}`,
    failure_redirect_url: process.env.NEXT_PUBLIC_URL + "/customer/order-failed",
  };

  try {
    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.XENDIT_API_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoicePayload),
    });

    const invoice = await res.json();

    if (!res.ok) throw new Error(invoice.message || "Failed to create invoice");

    return NextResponse.json({ success: true, redirect_url: invoice.invoice_url });
  } catch (error) {
    console.error("Xendit Invoice Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
