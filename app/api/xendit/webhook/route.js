import { createAdminClient } from "@/config/appwrite";

export async function POST(req) {
  try {
    const callbackToken = req.headers.get("x-callback-token");
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return new Response("Unauthorized webhook", { status: 401 });
    }

    const body = await req.json();
    const { databases } = await createAdminClient();

    // ✅ Try to read external_id in multiple possible places
    const externalId =
      body.external_id ||
      body.data?.external_id || // some webhook types wrap in `data`
      body.invoice?.external_id || // fallback if invoice object exists
      null;

    if (!externalId) {
      console.error("❌ Webhook missing external_id:", body);
      return new Response("Missing external_id", { status: 400 });
    }

    // ✅ Strip prefix
    const orderId = externalId.replace("thecorner_", "");

    // Normalize payment status
    let status = (body.status || body.data?.status || "").toUpperCase();
    let paymentStatus;
    switch (status) {
      case "PAID":
      case "SETTLED":
      case "INVOICE_PAID":
        paymentStatus = "paid";
        break;
      case "EXPIRED":
        paymentStatus = "expired";
        break;
      case "FAILED":
        paymentStatus = "failed";
        break;
      case "PENDING":
      default:
        paymentStatus = "pending";
    }

    // ✅ Cap payment_info length
    let paymentInfoString = JSON.stringify(body);
    const maxLength = 5000;
    if (paymentInfoString.length > maxLength) {
      paymentInfoString = paymentInfoString.slice(0, maxLength - 3) + "...";
    }

    // ✅ Update order in Appwrite
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      orderId,
      {
        payment_status: paymentStatus,
        payment_info: paymentInfoString,
        updated_at: new Date().toISOString(),
      }
    );

    return new Response(`✅ Webhook processed: ${paymentStatus}`, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
