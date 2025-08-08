'use client';

const Headline = ({ center = true, className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center ${
        center ? 'justify-center' : ''
      } cursor-default ${className}`}
    >
      <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-[0.2em] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-fade-in">
        THE CORNER
      </h1>
      <p className="text-sm sm:text-lg font-medium text-gray-300 tracking-widest mt-2 uppercase">
        Food Plaza
      </p>
    </div>
  );
};

export default Headline;
