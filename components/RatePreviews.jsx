'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';

const RatePreview = ({ average = 0, count = 0 }) => {
  if (count === 0) return null;

  return (
    <div className="flex gap-1 justify-center mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesomeIcon
          key={star}
          icon={solidStar}
          className={average >= star ? 'text-yellow-400' : 'text-neutral-600'}
        />
      ))}
      <span className="text-xs text-gray-400 ml-2">({count})</span>
    </div>
  );
};

export default RatePreview;
