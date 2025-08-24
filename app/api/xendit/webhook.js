import { createAdminClient } from "@/config/appwrite";

export async function POST(req) {
  try {
    // ✅ Verify webhook token from Xendit
    const callbackToken = req.headers.get("x-callback-token");
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return new Response("Unauthorized webhook", { status: 401 });
    }

    const body = await req.json();
    const { databases } = await createAdminClient();

    // ✅ external_id from Xendit == Appwrite orderId
    const orderId = body.external_id;
    if (!orderId) {
      return new Response("Missing orderId", { status: 400 });
    }

    // ✅ Normalize Xendit status → Appwrite enum
    let status = (body.status || "").toUpperCase();
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

    // ✅ Update Appwrite order doc
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      orderId,
      {
        payment_status: paymentStatus,
        payment_info: JSON.stringify(body),  // 👈 save raw Xendit webhook data
        updated_at: new Date().toISOString(),
      }
    );

    return new Response(`✅ Webhook processed: ${paymentStatus}`, { status: 200 });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}
