import { createSessionClient } from "@/config/appwrite";
import { Query } from "appwrite";

const getOrders = async (userId) => {
  const { databases } = await createSessionClient();
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
  const ordersCollection = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CART;

  try {
    const response = await databases.listDocuments(databaseId, ordersCollection, [
      Query.equal("user_id", userId),
    ]);
    return response.documents;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export default getOrders;