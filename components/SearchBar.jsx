'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getAllSpaces from '@/app/actions/getAllSpaces';
import Link from 'next/link';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await getAllSpaces();
        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = rooms.filter((room) =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  }, [query, rooms]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      router.push(`/rooms/${suggestions[activeIndex].$id}`);
      setQuery('');
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-8">
      <form onSubmit={handleSearch}>
        <label htmlFor="search" className="sr-only">Search</label>
        <input
          id="search"
          name="search"
          type="text"
          placeholder="Search for a food stall..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full px-6 py-3 text-lg text-white bg-neutral-800 border border-neutral-700 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-pink-600 placeholder-gray-400"
        />
      </form>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute left-0 mt-2 w-full bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-auto z-50">
          {suggestions.map((room, index) => (
            <Link key={room.$id} href={`/rooms/${room.$id}`} passHref>
              <div
                className={`p-3 flex items-center cursor-pointer ${
                  index === activeIndex ? 'bg-pink-600 text-white' : 'hover:bg-neutral-700'
                }`}
              >
                <p className="text-white text-base">{room.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
