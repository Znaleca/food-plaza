import { createSessionClient } from "@/config/appwrite";

const addToCart = async (userId, menuName, menuPrice, quantity = 1, roomId) => {
  const { databases } = await createSessionClient();
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
  const ordersCollection = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CART;

  try {
    await databases.createDocument(databaseId, ordersCollection, 'unique()', {
      user_id: userId,
      menuName: menuName, 
      menuPrice: parseFloat(menuPrice),
      quantity,
      room_id: roomId
    });
    alert("Item added to cart!");
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Failed to add item to cart.");
  }
};

export default addToCart;