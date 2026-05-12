'use client';

const Headline = ({ center = true, className = '' }) => {
  return (
    <div
      className={`flex flex-col ${
        center ? 'items-center text-center justify-center' : 'items-start text-left'
      } cursor-default ${className}`}
    >
      <h1 className="text-5xl sm:text-7xl font-black leading-[0.85] text-black uppercase tracking-tighter">
        BLITZ
      </h1>
      <p className="text-xs sm:text-sm font-bold tracking-[0.4em] text-red-600 uppercase mt-4">
        FOODCOURT
      </p>
    </div>
  );
};

export default Headline;