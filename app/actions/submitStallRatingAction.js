// /app/actions/submitStallRatingAction.js
'use server';

import updateRating from './updateRating'; // Adjust path if necessary
import checkAuth from './checkAuth'; // Adjust path if necessary

// Helper function to safely parse a JSON string from the stallReviews array
const safeParseStallReview = (reviewStr) => {
    try {
        return JSON.parse(reviewStr);
    } catch (e) {
        return null;
    }
}

/**
 * Submits a stall review after verifying the user's authentication status and including user_id.
 *
 * @param {string} orderId - The ID of the order being reviewed.
 * @param {object} stallReviewData - The core stall review object (roomId, roomName, rating, comment).
 * @param {string[]} existingStallReviewsStrings - The current array of stallReview JSON strings from the order.
 * @returns {Promise<object>} An object containing the new updatedReviews string array.
 */
const submitStallRatingAction = async (orderId, stallReviewData, existingStallReviewsStrings) => {
  const auth = await checkAuth();

  if (!auth.isAuthenticated || !auth.user) {
    throw new Error("User must be logged in to submit a stall review.");
  }
  
  const userId = auth.user.id;
  
  // 1. Create the final stall review object with the user ID
  const newStallReviewObject = {
    ...stallReviewData,
    user_id: userId, // <<< USER ID ADDED HERE
    rated_at: new Date().toISOString(),
  };
  
  // 2. Parse existing reviews
  const parsedReviews = existingStallReviewsStrings
      .map(safeParseStallReview)
      .filter(r => r !== null);

  // 3. Update the main array of stall review OBJECTS (remove old review for this stall, add new one)
  const updatedStallReviewObjects = [
    ...parsedReviews.filter(r => r.roomId !== newStallReviewObject.roomId),
    newStallReviewObject, 
  ];
  
  // 4. Convert back to an array of JSON STRINGS for Appwrite
  const updatedStallReviewsStrings = updatedStallReviewObjects.map(obj => JSON.stringify(obj));

  // 5. Submit to the database using the existing updateRating action
  try {
    await updateRating(orderId, {
        stall: {
            reviews: updatedStallReviewsStrings // Send array of strings to Appwrite
        }
    });
    
    // Return the new string array for the client to update its state
    return { success: true, updatedReviews: updatedStallReviewsStrings };
  } catch (error) {
    console.error('Error submitting stall rating via action:', error);
    // Re-throw a friendlier error
    throw new Error('Failed to submit stall review to database.');
  }
};

export default submitStallRatingAction;