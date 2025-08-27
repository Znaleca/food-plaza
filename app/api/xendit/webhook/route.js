// app/api/xendit/webhook/route.js
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

    const externalId = body.external_id;
    if (!externalId) {
      return new Response("Missing external_id", { status: 400 });
    }

    // ✅ Always prefixed with maproom_, strip it
    const orderId = externalId.replace("maproom_", "");

    // ✅ Normalize payment status
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
      default:
        paymentStatus = "pending";
    }

    // ✅ Ensure payment_info is a string & capped
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

    // ✅ Only after successful payment, update balances
    if (paymentStatus === "paid") {
      try {
        // The split info is in body.routes (from Xendit split rule callback)
        if (Array.isArray(body.routes)) {
          for (const route of body.routes) {
            const { reference_id, flat_amount } = route;

            // Update corresponding sub-account balance
            const collectionId =
              process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SUB_ACCOUNTS;
            const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;

            const result = await databases.listDocuments(databaseId, collectionId, [
              Query.equal("room_id", reference_id),
            ]);

            if (result.documents.length > 0) {
              const doc = result.documents[0];
              const currentBalance = doc.balance || 0;
              const newBalance = currentBalance + Number(flat_amount || 0);

              await databases.updateDocument(databaseId, collectionId, doc.$id, {
                balance: newBalance,
                balance_updated_at: new Date().toISOString(),
              });
            }
          }
        }
      } catch (balanceError) {
        console.error("⚠️ Balance update failed:", balanceError);
      }
    }

    return new Response(`✅ Webhook processed: ${paymentStatus}`, {
      status: 200,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

// ✅ Reject non-POST requests
export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
