import { createAdminClient } from "@/config/appwrite";

export async function POST(req) {
  try {
    // ✅ Verify webhook token
    const callbackToken = req.headers.get("x-callback-token");
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return new Response("Unauthorized webhook", { status: 401 });
    }

    const body = await req.json();
    const { databases } = await createAdminClient();

    // ✅ Extract orderId (strip "maproom_")
    const externalId = body.external_id;
    if (!externalId) {
      return new Response("Missing external_id", { status: 400 });
    }
    const orderId = externalId.replace("maproom_", "");

    // ✅ Normalize status
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

    // ✅ Update Appwrite order
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      orderId,
      {
        payment_status: paymentStatus,
        payment_info: body, // 👈 Save full raw JSON
        updated_at: new Date().toISOString(),
      }
    );

    return new Response(`✅ Webhook processed: ${paymentStatus}`, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}
