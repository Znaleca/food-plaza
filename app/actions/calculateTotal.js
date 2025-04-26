'use server';

const calculateTotals = async (cart, voucherId, databases) => {
  const cleanedCart = cart.map((item) => ({
    ...item,
    menuPrice: Number(item.menuPrice) || 0,
    quantity: Number(item.quantity) || 1,
  }));

  const baseTotal = cleanedCart.reduce(
    (sum, item) => sum + item.menuPrice * item.quantity,
    0
  );

  const serviceCharge = parseFloat((baseTotal * 0.10).toFixed(2));
  let discountAmount = 0;

  if (voucherId) {
    const voucher = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
      voucherId
    );

    if (voucher.used_voucher) {
      throw new Error("This voucher has already been used.");
    }

    if (voucher.discount) {
      discountAmount = parseFloat(((baseTotal * (voucher.discount / 100))).toFixed(2));
    }

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
      voucherId,
      {
        used_voucher: true,
        used_at: new Date().toISOString(),
      }
    );
  }

  const finalTotal = parseFloat((baseTotal + serviceCharge - discountAmount).toFixed(2));

  return {
    cleanedCart,
    baseTotal,
    serviceCharge,
    discountAmount,
    finalTotal,
  };
};

export default calculateTotals;
