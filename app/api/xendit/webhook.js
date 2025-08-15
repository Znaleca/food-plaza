import { createAdminClient } from "@/config/appwrite";

export async function POST(req) {
  try {
    // Parse the incoming request body
    const body = await req.json();

    // Check if the payment status is "PAID"
    if (body.status === "PAID") {
      // Initialize the Appwrite client
      const { databases } = await createAdminClient();

      // Get the orderId from the webhook payload
      const orderId = body.external_id;

      // Ensure orderId exists before updating the document
      if (!orderId) {
        return new Response("Missing orderId", { status: 400 });
      }

      // Update the order status to "paid" and save payment info
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
        orderId,
        {
          status: "paid",
          payment_info: JSON.stringify(body),
          updated_at: new Date().toISOString(),
        }
      );

      // Return a success response
      return new Response("Webhook processed successfully", { status: 200 });
    }

    // Return a response if status is not PAID
    return new Response("Webhook status is not PAID", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Return error response if something goes wrong
    return new Response("Error processing webhook", { status: 500 });
  }
}
