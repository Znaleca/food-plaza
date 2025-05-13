import { useState } from 'react';
import updateReviewReply from '@/app/actions/UpdateReviewReply';

const ReplyCardButton = ({ reviewId }) => {
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleReplyChange = (e) => {
    setReply(e.target.value);
  };

  const handleSubmit = async () => {
    if (!reply.trim()) {
      setError('Reply cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateReviewReply(reviewId, reply);
      setReply(''); // Clear input after submission
      setError(null); // Clear error message if any
    } catch (err) {
      setError('Failed to submit reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <textarea
        value={reply}
        onChange={handleReplyChange}
        placeholder="Type your reply..."
        rows={3}
        className="w-full p-2 border rounded-md"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Reply'}
      </button>
    </div>
  );
};

export default ReplyCardButton;
