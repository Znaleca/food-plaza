"use server";

import { cookies } from "next/headers";
import { Client, Databases, Query, Users } from "node-appwrite";
import createAdminClient from "../appwrite-admin";
import xenditFetch from "../xenditFetch";
import { ID } from "node-appwrite";

export default async function checkout({ selectedItems, vouchers }) {
  try {
    const { database, account, users } = await createAdminClient();

    const sessionCookie = cookies().get("appwrite-session");
    if (!sessionCookie) throw new Error("No session found");

    const user = await account.get();

    // Group items by stall (roomId)
    const groupedItems = selectedItems.reduce((acc, item) => {
      if (!acc[item.roomId]) acc[item.roomId] = [];
      acc[item.roomId].push(item);
      return acc;
    }, {});

    let finalDiscountedTotal = 0;
    const splitRoutes = [];

    for (const [roomId, items] of Object.entries(groupedItems)) {
      const stallVoucher = vouchers[roomId];
      const stallTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      let discount = 0;
      if (stallVoucher) {
        discount = stallVoucher.discount || 0;
      }

      const discountedTotal = stallTotal - discount;

      const roundedTotal = parseFloat(discountedTotal.toFixed(2)); // ✅ keep 2 decimals
      finalDiscountedTotal += roundedTotal;

      // Fetch stall owner’s balance
      const stall = await database.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
        roomId
      );

      const ownerId = stall.ownerId;

      // Update balance
      const balanceDocId = `balance_${ownerId}`;
      let currentBalance = 0;
      try {
        const balanceDoc = await database.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
          "stall-balances",
          balanceDocId
        );
        currentBalance = parseFloat(balanceDoc.balance) || 0;
      } catch {
        // create balance doc if not exists
        await database.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
          "stall-balances",
          balanceDocId,
          { ownerId, balance: 0 }
        );
      }

      const newBalance = parseFloat((currentBalance + roundedTotal).toFixed(2));

      await database.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        "stall-balances",
        balanceDocId,
        { balance: newBalance }
      );

      splitRoutes.push({
        split_rule_id: ownerId, // use stall owner as split rule
        flat_amount: roundedTotal,
        currency: "PHP"
      });
    }

    // Create order document
    const orderId = ID.unique();
    const orderData = {
      userId: user.$id,
      items: selectedItems,
      vouchers,
      total: parseFloat(finalDiscountedTotal.toFixed(2)),
      status: "pending",
      createdAt: new Date().toISOString()
    };

    await database.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      "order-status",
      orderId,
      orderData
    );

    // Create invoice with Xendit
    const splitRule = await xenditFetch("/v2/split_rules", "POST", {
      description: `Split rule for order ${orderId}`,
      routes: splitRoutes
    });

    const invoice = await xenditFetch(
      "/v2/invoices",
      "POST",
      {
        external_id: `thecorner_${orderId}`,
        amount: parseFloat(finalDiscountedTotal.toFixed(2)), // ✅ float total
        payer_email: user?.email || "guest@example.com",
        description: "Food Order Payment",
        currency: "PHP",
        success_redirect_url: `${process.env.NEXT_PUBLIC_URL}/customer/order-status?orderId=${orderId}`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_URL}/customer/order-failed`
      },
      { "with-split-rule": splitRule.id }
    );

    return { checkoutUrl: invoice.invoice_url };
  } catch (error) {
    console.error("Checkout error:", error);
    throw error;
  }
}
