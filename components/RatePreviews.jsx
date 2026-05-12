'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';

const RatePreview = ({ average = 0 }) => {
  if (!average || average === 0) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-2">
      {/* The star is now red, the text will inherit the hover color */}
      <FontAwesomeIcon icon={solidStar} className="text-sm text-red-600" />
      <span className="text-sm font-medium">{average.toFixed(1)}</span>
    </div>
  );
};

export default RatePreview;