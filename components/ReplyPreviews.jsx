import React from 'react';

const ReplyPreviews = ({ replies }) => {
  // Ensure replies is always an array
  const validReplies = Array.isArray(replies) ? replies : [];

  if (validReplies.length === 0) {
    return <p className="text-sm text-gray-500">No replies yet.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      {validReplies.map((reply, index) => (
        <div
          key={index}
          className="bg-gray-50 border rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <p className="text-gray-800 font-semibold">Reply {index + 1}</p>
          <p className="italic text-gray-700 mt-2">{reply}</p>
        </div>
      ))}
    </div>
  );
};

export default ReplyPreviews;
