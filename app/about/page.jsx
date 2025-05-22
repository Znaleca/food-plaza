// components/AboutPage.tsx

const AboutPage = () => {
    return (
      <div className="w-full min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center">
  
        {/* Header Section */}
        <div className="mt-12 sm:mt-16 text-center mb-8 px-4">
          <p className="mt-4 text-2xl sm:text-9xl font-extrabold text-white leading-tight">ABOUT US</p>
        </div>
  
        {/* Description Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 px-4">
          <p className="text-lg sm:text-xl font-light text-gray-400">
            The Corner is more than just a food plaza — it's a celebration of culinary diversity, creativity, and community.
            We bring together passionate food vendors who serve up fresh, flavorful dishes in a vibrant, inclusive atmosphere.
          </p>
        </div>
  
        {/* Values Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl w-full text-center mb-8">
          <div className="flex flex-col items-center text-gray-200">
            <span className="font-semibold text-base sm:text-lg mb-2">Community</span>
            <p className="text-sm text-gray-400">We thrive on connection and shared experiences.</p>
          </div>
          <div className="flex flex-col items-center text-gray-200">
            <span className="font-semibold text-base sm:text-lg mb-2">Quality</span>
            <p className="text-sm text-gray-400">Only the freshest ingredients and boldest flavors.</p>
          </div>
          <div className="flex flex-col items-center text-gray-200">
            <span className="font-semibold text-base sm:text-lg mb-2">Innovation</span>
            <p className="text-sm text-gray-400">We embrace creativity in every dish we serve.</p>
          </div>
        </div>
  
        {/* Final Note */}
        <div className="text-center max-w-2xl mx-auto px-4">
          <p className="text-md sm:text-lg font-light text-gray-400">
            Whether you're grabbing a quick bite or exploring new tastes, The Corner is your destination for unforgettable food and friendly vibes.
          </p>
        </div>
      </div>
    );
  };
  
  export default AboutPage;
  