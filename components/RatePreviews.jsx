'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';

const RatePreview = ({ average = 0 }) => {
  if (!average || average === 0) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-2">
      <FontAwesomeIcon icon={solidStar} className="text-pink-600 text-sm" />
      <span className="text-sm font-medium text-white">{average.toFixed(1)}</span>
    </div>
  );
};

export default RatePreview;
