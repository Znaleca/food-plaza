'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getAllSpaces from '@/app/actions/getAllSpaces';
import Link from 'next/link';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1); // For keyboard navigation
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

    const filtered = rooms.reduce((acc, room) => {
      // Check if room name or any menu item contains the query
      if (room.name.toLowerCase().includes(query.toLowerCase())) {
        acc.push({ type: 'room', ...room });
      }

      room.menuName?.forEach((menu) => {
        if (menu.toLowerCase().includes(query.toLowerCase())) {
          acc.push({ type: 'menu', roomId: room.$id, roomName: room.name, menu });
        }
      });

      return acc;
    }, []);
    
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
      const selected = suggestions[activeIndex];
      if (selected.type === 'room') {
        router.push(`/rooms/${selected.$id}`);
      } else {
        // If it's a menu suggestion, go to the room's page using room ID
        router.push(`/rooms/${selected.roomId}`);
      }
      setQuery('');
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-8">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for a food stall or menu..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full px-6 py-3 text-lg border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </form>

      {/* Search Suggestions Popup */}
      {suggestions.length > 0 && (
        <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-50">
          {suggestions.map((suggestion, index) => (
            <Link
              key={suggestion.type === 'menu' ? suggestion.menu : suggestion.$id}
              href={suggestion.type === 'room' ? `/rooms/${suggestion.$id}` : `/rooms/${suggestion.roomId}`}
              passHref
            >
              <div
                className={`p-3 flex items-center cursor-pointer hover:bg-gray-200 ${
                  index === activeIndex ? 'bg-yellow-200' : ''
                }`}
              >
                <p className="text-lg">
                  {suggestion.type === 'room' ? (
                    suggestion.name
                  ) : (
                    <span>
                      <strong>{suggestion.menu}</strong> - {suggestion.roomName}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
