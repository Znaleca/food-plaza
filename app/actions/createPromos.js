'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { ID } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

async function createPromos(previousState, formData) {
    const { databases } = await createAdminClient();
  
    try {
      const { user } = await checkAuth();
      if (!user) {
        return { error: 'You must be logged in to create a promo' };
      }
  
      const discount = parseFloat(formData.get('discount') || '0');
      const validFrom = formData.get('valid_from');
      const validTo = formData.get('valid_to');
      const quantity = parseInt(formData.get('quantity') || '1');
      const min_orders = parseInt(formData.get('min_orders') || '1'); // NEW: Get min_orders from formData
      const claim = formData.get('claim') === 'true'; 
      
      const currentDate = new Date().toISOString().split('T')[0];
      const status = new Date(validTo) >= new Date(currentDate);

      const promoData = {
        title: formData.get('title'),
        description: formData.get('description'),
        discount,
        min_orders, // NEW: Add min_orders to the promo data
        valid_from: validFrom,
        valid_to: validTo,
        status,
        user_id: user.id,
        quantity,
        claim,
        claimed_users: [],       
      };
  
      const newPromo = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
        ID.unique(),
        promoData
      );
  
      revalidatePath('/foodstall/promos', 'layout');
  
      return { success: true, promoId: newPromo.$id };
    } catch (error) {
      console.error('Error creating promo:', error);
      return { error: error.message || 'An unexpected error has occurred' };
    }
}

export default createPromos;