'use server';

import { createAdminClient } from '@/config/appwrite';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite';
import checkAuth from './checkAuth';

const getMenuReviews = async (spaceId, page = 1, limit = 10) => {
  try {
    const { databases } = await createAdminClient();
    const { user } = await checkAuth();

    if (!user) {
      console.error("User not authenticated");
      redirect('/login');
    }

    // Fetch orders related to the spaceId with pagination
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      [
        Query.equal('spaces', [spaceId]), // filter by spaceId
        Query.limit(limit),
        Query.offset((page - 1) * limit),
        Query.orderDesc('created_at'),
      ]
    );

    // Filter menu reviews locally because 'rated' is an array and can't be queried directly
    const menuReviews = [];
    response.documents.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach((itemString, index) => {
          try {
            const item = JSON.parse(itemString);
            // Only include items that are rated (rated[index] === true)
            if (order.rated?.[index]) {
              menuReviews.push({
                menuName: item.menuName,
                rating: order.rating?.[index],
                comment: order.comment?.[index],
              });
            }
          } catch (e) {
            console.error('Failed to parse item:', e);
          }
        });
      }
    });

    return {
      menuReviews,
      totalOrders: response.total,
      currentPage: page,
      totalPages: Math.ceil(response.total / limit),
    };
  } catch (error) {
    console.error('Failed to fetch menu reviews:', error);
    redirect('/error');
  }
};

export default getMenuReviews;
