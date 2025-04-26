import { createAdminClient } from "@/config/appwrite";

export async function POST(req) {
  const body = await req.json();

  if (body.status === "PAID") {
    const { databases } = await createAdminClient();

    const orderId = body.external_id;

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
  }

  return new Response("Webhook received", { status: 200 });
}
