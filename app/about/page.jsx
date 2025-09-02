'use client';

import React, { useEffect, useState, useRef } from 'react';

const AboutPage = () => {
  const team = [
    { name: "Russel", role: "Documenter", image: "/images/russel.jpg" },
    { name: "Maricon", role: "Front-End", image: "/images/maricon.jpg" },
    { name: "Lanz", role: "Main Developer", image: "/images/lanz.jpg" },
    { name: "Jasper", role: "Documenter", image: "/images/jasper.jpg" },
    { name: "Christler", role: "Documenter", image: "/images/christler.jpg" },
  ];

  const [visibleIndexes, setVisibleIndexes] = useState([]);
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          if (entry.isIntersecting) {
            // Show when visible
            setVisibleIndexes((prev) => [...new Set([...prev, index])]);
          } else {
            // Reset when out of view
            setVisibleIndexes((prev) => prev.filter((i) => i !== index));
          }
        });
      },
      { threshold: 0.3 }
    );

    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      refs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center">
      {/* Header Section */}
      <div className="mt-12 sm:mt-16 text-center mb-8 px-4">
        <p className="mt-4 text-2xl sm:text-7xl md:text-8xl font-extrabold text-white leading-tight tracking-tight">
          ABOUT US
        </p>
      </div>

      {/* Description Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 px-4">
        <p className="text-lg sm:text-xl font-light text-gray-400 leading-relaxed">
          The Corner is more than just a food plaza — it's a celebration of
          culinary diversity, creativity, and community. We bring together
          passionate food vendors who serve up fresh, flavorful dishes in a
          vibrant, inclusive atmosphere.
        </p>
      </div>

      {/* Values Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 max-w-5xl w-full text-center mb-16">
        <div className="flex flex-col items-center bg-neutral-800 p-6 rounded-2xl shadow-lg">
          <span className="font-bold text-xl text-pink-500 mb-2">Community</span>
          <p className="text-sm text-gray-400">
            We thrive on connection and shared experiences.
          </p>
        </div>
        <div className="flex flex-col items-center bg-neutral-800 p-6 rounded-2xl shadow-lg">
          <span className="font-bold text-xl text-pink-500 mb-2">Quality</span>
          <p className="text-sm text-gray-400">
            Only the freshest ingredients and boldest flavors.
          </p>
        </div>
        <div className="flex flex-col items-center bg-neutral-800 p-6 rounded-2xl shadow-lg">
          <span className="font-bold text-xl text-pink-500 mb-2">Innovation</span>
          <p className="text-sm text-gray-400">
            We embrace creativity in every dish we serve.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="w-full max-w-3xl mb-16">
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-white mb-12">
          Meet the Team
        </h2>
        <div className="flex flex-col gap-8">
          {team.map((person, index) => {
            const isVisible = visibleIndexes.includes(index);
            return (
              <div
                key={index}
                ref={(el) => (refs.current[index] = el)}
                data-index={index}
                className={`flex flex-col sm:flex-row items-center bg-neutral-800 p-6 rounded-2xl shadow-lg transform transition-all duration-700 ease-out
                  ${
                    isVisible
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-50 translate-y-10"
                  }`}
                style={{
                  transitionDelay: isVisible ? `${index * 150}ms` : "0ms", // staggered delay
                }}
              >
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-28 h-28 rounded-full object-cover mb-4 sm:mb-0 sm:mr-6 border-4 border-pink-500 shadow-md"
                />
                <div className="text-center sm:text-left">
                  <p className="text-lg font-semibold">{person.name}</p>
                  <p className="text-sm text-gray-400">{person.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Note */}
      <div className="text-center max-w-2xl mx-auto px-4">
        <p className="text-md sm:text-lg font-light text-gray-400 leading-relaxed">
          Whether you're grabbing a quick bite or exploring new tastes, The
          Corner is your destination for unforgettable food and friendly vibes.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
