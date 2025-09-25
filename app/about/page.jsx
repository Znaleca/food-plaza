'use client';

import React, { useEffect, useState, useRef } from 'react';
import { FaUsers, FaLeaf, FaLightbulb } from 'react-icons/fa';

const teamMembers = [
  { name: 'Russel', role: 'Documenter', image: '/images/russel.jpg' },
  { name: 'Maricon', role: 'Programmer', image: '/images/maricon.jpg' },
  { name: 'Lanz', role: 'Lead Programmer', image: '/images/lanz.jpg' },
  { name: 'Jasper', role: 'QA Tester', image: '/images/jasper.jpg' },
  { name: 'Chrisler', role: 'Documenter', image: '/images/chrisler.jpg' },
];

const coreValues = [
  { icon: FaUsers, title: 'Community', description: 'We thrive on connection and shared experiences.' },
  { icon: FaLeaf, title: 'Quality', description: 'Only the freshest ingredients and boldest flavors.' },
  { icon: FaLightbulb, title: 'Innovation', description: 'We embrace creativity in every dish we serve.' },
];

const AboutSection = () => {
  const [visibleTeamIndexes, setVisibleTeamIndexes] = useState([]);
  const teamRefs = useRef([]);
  const [visibleValueIndexes, setVisibleValueIndexes] = useState([]); 
  const valuesRefs = useRef([]);

  useEffect(() => {
    // --- Team Member Observer ---
    const teamObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setVisibleTeamIndexes((prev) => [...new Set([...prev, index])]);
          } else {
            setVisibleTeamIndexes((prev) => prev.filter((i) => i !== index));
          }
        });
      },
      { threshold: 0.3 }
    );
    teamRefs.current.forEach((el) => el && teamObserver.observe(el));

    // --- Core Values Observer ---
    const valuesObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          if (entry.isIntersecting) {
            // Add the index of the visible item
            setVisibleValueIndexes((prev) => [...new Set([...prev, index])]); 
          } else {
            // Remove the index of the non-visible item if you want the bounce to re-trigger on re-scroll
            // If you only want it to bounce once and stay, remove this 'else' block
            setVisibleValueIndexes((prev) => prev.filter((i) => i !== index));
          }
        });
      },
      { threshold: 0.5 }
    );
    // Observe each core value card individually
    valuesRefs.current.forEach((el) => el && valuesObserver.observe(el));

    // --- Cleanup ---
    return () => {
      teamRefs.current.forEach((el) => el && teamObserver.unobserve(el));
      valuesRefs.current.forEach((el) => el && valuesObserver.unobserve(el));
    };
  }, []);

  const renderTeamMember = (person, index) => {
    const isVisible = visibleTeamIndexes.includes(index);
    const delay = isVisible ? `${index * 150}ms` : '0ms';

    return (
      <div
        key={person.name}
        ref={(el) => (teamRefs.current[index] = el)}
        data-index={index}
        className={`flex flex-col items-center text-center p-8 rounded-3xl bg-neutral-950 border-2 border-transparent
      transform transition-all duration-700 ease-out hover:-translate-y-4 hover:scale-105
          ${
            isVisible
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-50 translate-y-10'
          }`}
        style={{ transitionDelay: delay }}
      >
        <img
          src={person.image}
          alt={`A portrait of ${person.name}`}
          className="w-36 h-36 rounded-full object-cover mb-6 border-4 border-indigo-700
          shadow-xl shadow-indigo-400/30 transition-all duration-300"
        />
        <div className="text-center">
          <p className="text-xl font-semibold text-white">{person.name}</p>
          <p className="text-md text-gray-300">{person.role}</p>
        </div>
      </div>
    );
  };

  const renderCoreValue = (value, index) => {
    const Icon = value.icon;
    const isVisible = visibleValueIndexes.includes(index);
    const delay = isVisible ? `${index * 200}ms` : '0ms';

    return (
      <div
        key={value.title}
        ref={(el) => (valuesRefs.current[index] = el)} // Attach ref and index
        data-index={index}
        // Removed opacity, scale, and translate classes from the parent div
        className={`flex flex-col items-center p-8 rounded-3xl transition-all duration-700 ease-out border border-transparent
                  bg-neutral-900 backdrop-blur-sm`}
        style={{ transitionDelay: delay }}
      >
        <Icon
          className={`text-6xl text-pink-500 mb-6 transform
                    ${isVisible ? 'animate-bounce-smooth' : ''} // Only apply bounce when visible
                    `}
          // Removed transitionDelay from Icon as it's now handled by the parent
        />
        <h3 className="font-bold text-2xl text-indigo-600 mb-2">{value.title}</h3>
        <p className="text-sm text-gray-400">{value.description}</p>
      </div>
    );
  };

  return (
    <div className="w-full -mt-20 min-h-screen bg-neutral-950 text-white p-8 font-sans relative overflow-hidden">
      
      {/* Hero Section */}
      <section className="mt-12 sm:mt-16 text-center mb-20 px-4 relative z-10">
      <header className="text-center mb-20">
        <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
          ABOUT US
        </h2>
        <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
          Meet our{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            Team & Values
          </span>
        </p>
        <p className="mt-6 max-w-3xl mx-auto text-gray-400 text-lg">
          The Corner is more than just a food plaza — it's a celebration of
          culinary diversity, creativity, and community. We bring together
          passionate food vendors who serve up fresh, flavorful dishes in a
          vibrant, inclusive atmosphere.
        </p>
      </header>
      </section>

      {/* Core Values Section */}
      <section className="mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {coreValues.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="rounded-2xl bg-neutral-950/60 backdrop-blur-md border border-neutral-800 hover:border-fuchsia-400 shadow-md hover:shadow-fuchsia-500/30 transition-all duration-500 p-8 flex flex-col items-center text-center"
              >
                <Icon className="text-6xl text-fuchsia-400 mb-4 group-hover:text-cyan-400 transition-colors duration-300" />
                <h3 className="text-2xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full max-w-7xl mx-auto mb-20 relative z-10">
      <h2 className="text-center text-3xl sm:text-5xl font-extrabold mb-16">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            Meet the Team
          </span>
        </h2>
        
        <div className="flex flex-wrap justify-center gap-12">
          {teamMembers.map((person, index) => renderTeamMember(person, index))}
        </div>
      </section>

      {/* Call to Action/Final Note */}
      <section className="text-center max-w-3xl mx-auto px-4 relative z-10">
        <p className="text-lg sm:text-xl font-light text-gray-400 leading-relaxed animate-fade-in delay-700">
          Whether you're grabbing a quick bite or exploring new tastes, The
          Corner is your destination for unforgettable food and friendly vibes.
        </p>
      </section>
    </div>
  );
};

export default AboutSection;