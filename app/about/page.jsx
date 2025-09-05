'use client';

import React, { useEffect, useState, useRef } from 'react';
import { FaUsers, FaLeaf, FaLightbulb } from 'react-icons/fa'; // Import icons

const AboutPage = () => {
  const team = [
    { name: "Russel", role: "Documenter", image: "/images/russel.jpg" },
    { name: "Maricon", role: "Programmer", image: "/images/maricon.jpg" },
    { name: "Jasper", role: "QA Tester", image: "/images/jasper.jpg" },
    { name: "Lanz", role: "Lead Programmer", image: "/images/lanz.jpg" },
    { name: "Chrisler", role: "Documenter", image: "/images/chrisler.jpg" },
  ];

  const [visibleIndexes, setVisibleIndexes] = useState([]);
  const refs = useRef([]);
  const valuesRefs = useRef([]); // Ref for values section for animation
  const [valuesVisible, setValuesVisible] = useState(false);

  useEffect(() => {
    // Observer for team members
    const teamObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setVisibleIndexes((prev) => [...new Set([...prev, index])]);
          } else {
            setVisibleIndexes((prev) => prev.filter((i) => i !== index));
          }
        });
      },
      { threshold: 0.3 }
    );

    refs.current.forEach((el) => {
      if (el) teamObserver.observe(el);
    });

    // Observer for values section
    const valuesObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setValuesVisible(true);
            valuesObserver.unobserve(entry.target); // Observe once
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    if (valuesRefs.current[0]) {
      valuesObserver.observe(valuesRefs.current[0].closest('.grid'));
    }

    return () => {
      refs.current.forEach((el) => {
        if (el) teamObserver.unobserve(el);
      });
      if (valuesRefs.current[0]) {
        valuesObserver.unobserve(valuesRefs.current[0].closest('.grid'));
      }
    };
  }, []);

  const renderTeamMember = (person, index) => {
    const isVisible = visibleIndexes.includes(index);
    return (
      <div
        key={index}
        ref={(el) => (refs.current[index] = el)}
        data-index={index}
        className={`flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border-2 border-transparent
          hover:border-pink-500/50 transform transition-all duration-700 ease-out hover:-translate-y-4 hover:scale-105
          ${
            isVisible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-50 translate-y-10"
          }`}
        style={{
          transitionDelay: isVisible ? `${index * 150}ms` : "0ms",
          minWidth: '220px', 
          maxWidth: '280px', 
        }}
      >
        <img
          src={person.image}
          alt={person.name}
          className="w-36 h-36 rounded-full object-cover mb-6 border-4 border-indigo-400
          shadow-xl shadow-indigo-400/30 group-hover:shadow-pink-500/50 transition-all duration-300"
        />
        <div className="text-center">
          <p className="text-xl font-semibold text-white">{person.name}</p>
          <p className="text-md text-gray-300">{person.role}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white p-8 overflow-hidden font-sans">
      {/* Header Section */}
      <div className="mt-12 sm:mt-16 text-center mb-8 px-4 relative">
        <p className="mt-4 text-3xl sm:text-8xl md:text-9xl font-extrabold text-white leading-tight tracking-tighter animate-fade-in-up">
          ABOUT US
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin-slow-reverse absolute -top-10 -left-10 w-48 h-48 bg-pink-600 opacity-15 rounded-full mix-blend-screen filter blur-3xl"></div>
          <div className="animate-spin-slow absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-500 opacity-15 rounded-full mix-blend-screen filter blur-3xl"></div>
        </div>
      </div>

      {/* Description Section */}
      <div className="text-center max-w-4xl mx-auto mb-20 px-4 animate-fade-in delay-200">
        <p className="text-xl sm:text-2xl font-light text-gray-300 leading-relaxed">
          The Corner is more than just a food plaza — it's a celebration of
          culinary diversity, creativity, and community. We bring together
          passionate food vendors who serve up fresh, flavorful dishes in a
          vibrant, inclusive atmosphere.
        </p>
      </div>

      {/* Values Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-6xl w-full text-center mx-auto mb-20">
        {[
          { icon: FaUsers, title: "Community", description: "We thrive on connection and shared experiences." },
          { icon: FaLeaf, title: "Quality", description: "Only the freshest ingredients and boldest flavors." },
          { icon: FaLightbulb, title: "Innovation", description: "We embrace creativity in every dish we serve." },
        ].map((value, index) => {
          const Icon = value.icon;
          return (
            <div
              key={index}
              ref={(el) => (valuesRefs.current[index] = el)}
              className={`flex flex-col items-center p-8 rounded-3xl transition-all duration-700 ease-out border border-transparent
                bg-white/5 backdrop-blur-sm
                ${valuesVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10"}`}
              style={{ transitionDelay: valuesVisible ? `${index * 150}ms` : "0ms" }}
            >
              <Icon className="text-6xl text-pink-500 mb-6 animate-spin-slow-on-hover" /> {/* Larger Spinning Icon */}
              <span className="font-bold text-2xl text-indigo-400 mb-2">{value.title}</span>
              <p className="text-sm text-gray-400">{value.description}</p>
            </div>
          );
        })}
      </div>

      {/* Team Section */}
      <div className="w-full max-w-7xl mx-auto mb-20">
        <h2 className="text-center text-4xl sm:text-5xl font-bold text-white mb-16 animate-fade-in delay-500">
          Meet the Team
        </h2>
        
        {/* First Row of Two Members */}
        <div className="flex flex-wrap justify-center gap-12 mb-12">
          {team.slice(0, 2).map((person, index) => renderTeamMember(person, index))}
        </div>

        {/* Separator Line */}
        <div className="h-1 bg-gray-700 w-full max-w-sm mx-auto my-12 opacity-50 rounded-full" />

        {/* Second Row of Three Members */}
        <div className="flex flex-wrap justify-center gap-12">
          {team.slice(2).map((person, index) => renderTeamMember(person, index + 2))}
        </div>
      </div>

      {/* Final Note */}
      <div className="text-center max-w-3xl mx-auto px-4 animate-fade-in delay-700">
        <p className="text-lg sm:text-xl font-light text-gray-400 leading-relaxed">
          Whether you're grabbing a quick bite or exploring new tastes, The
          Corner is your destination for unforgettable food and friendly vibes.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;