'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import getAllSpaces from "../actions/getAllSpaces";
import BrowseCardStall from "@/components/BrowseCardStall";
import BrowseCardMenu from "@/components/BrowseCardMenu";
import BrowseFilter from "@/components/BrowseFilter";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const SearchResultPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("query") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [displayType, setDisplayType] = useState(searchParams.get("displayType") || "Menus");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const toURL = (fid) =>
    `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fid}/view?project=${projectId}`;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await getAllSpaces();
        const formattedRooms = fetchedRooms.map((room) => {
          const menuImageUrls = (room.menuImages || []).map(toURL);
          const menuAvailability = Array.isArray(room.menuAvailability) &&
            room.menuAvailability.length === room.menuName?.length
              ? room.menuAvailability
              : new Array(room?.menuName?.length || 0).fill(true);

          const menuData = (room?.menuName || []).map((name, idx) => ({
            menuId: `${room.$id}_${idx}`,
            name,
            price: room.menuPrice?.[idx] ?? 0,
            description: room.menuDescription?.[idx] ?? "",
            image: menuImageUrls[idx] || null,
            type: room.menuType?.[idx] || "Others",
            smallFee: room.menuSmall?.[idx] ?? 0,
            mediumFee: room.menuMedium?.[idx] ?? 0,
            largeFee: room.menuLarge?.[idx] ?? 0,
            isAvailable: menuAvailability[idx] ?? true,
            idx,
          })) || [];

          return {
            id: room.$id,
            name: room.name,
            menuData,
            imageUrl: room.images?.length > 0 ? toURL(room.images[0]) : "/placeholder.jpg",
            type: room.type || []
          };
        });
        setRooms(formattedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
    setDisplayType(searchParams.get("displayType") || "Menus");
    setSearchInput(searchParams.get("query") || "");
  }, [searchParams]);

  useEffect(() => {
    let filtered = [...rooms];
    if (searchInput) {
      filtered = rooms.filter(
        (room) =>
          room.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          room.menuData.some((menuItem) =>
            menuItem.name.toLowerCase().includes(searchInput.toLowerCase())
          )
      );
    }
    if (category !== "All") {
      if (displayType === "Menus") {
        filtered = filtered.filter((room) =>
          room.menuData.some((menuItem) => menuItem.type === category)
        );
      } else {
        filtered = filtered.filter((room) => room.type.includes(category));
      }
    }
    setFilteredRooms(filtered);
  }, [searchInput, rooms, category, displayType]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    router.push(
      value
        ? `/search?query=${encodeURIComponent(value)}&category=${encodeURIComponent(category)}&displayType=${encodeURIComponent(displayType)}`
        : `/search?category=${encodeURIComponent(category)}&displayType=${encodeURIComponent(displayType)}`,
      { scroll: false }
    );
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-white">
        <p className="text-neutral-950 text-xl font-bold uppercase tracking-tighter animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  const allMenus = rooms.flatMap((room) => room.menuData);
  const filteredMenus = allMenus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(searchInput.toLowerCase());
    const matchesCategory = category === "All" || menu.type === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white px-6 pt-32 pb-24">
      
      {/* Search Bar - Clean with sharp borders */}
      <div className="mb-16 flex justify-center">
        <input
          type="text"
          placeholder="SEARCH FOOD STALLS OR MENUS..."
          value={searchInput}
          onChange={handleSearch}
          className="w-full max-w-3xl p-5 text-lg bg-white text-neutral-950 border-4 border-neutral-950 uppercase font-black focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all placeholder:text-neutral-400"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filter - Following the Border-T-4 theme */}
        <aside
          className={`
            bg-white md:border-r-4 border-neutral-950 p-6 w-full md:w-64 z-40 transition-transform duration-300
            ${isFilterOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            fixed top-0 left-0 h-full overflow-y-auto md:relative md:h-auto md:block
          `}
        >
          <BrowseFilter
            activeCategory={category}
            onChange={(cat) =>
              router.push(`/search?query=${encodeURIComponent(searchInput)}&category=${encodeURIComponent(cat)}&displayType=${encodeURIComponent(displayType)}`)
            }
            activeDisplayType={displayType}
            onDisplayTypeChange={(type) =>
              router.push(`/search?query=${encodeURIComponent(searchInput)}&category=${encodeURIComponent(category)}&displayType=${encodeURIComponent(type)}`)
            }
          />
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <section className="mb-16">
            <h3 className="text-4xl font-black mb-8 border-b-4 border-neutral-950 pb-2 uppercase tracking-tighter">
              {displayType === "Menus" 
                ? (searchInput ? `Results: ${searchInput}` : "The Menu") 
                : "The Stalls"}
            </h3>
            
            {(displayType === "Menus" ? filteredMenus : filteredRooms).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {displayType === "Menus" 
                  ? filteredMenus.map((m) => (
                      <BrowseCardMenu
                        key={m.menuId}
                        roomId={rooms.find((r) => r.menuData.includes(m))?.id}
                        menuItem={m}
                        roomName={rooms.find((r) => r.menuData.includes(m))?.name || ""}
                        allMenus={allMenus}
                      />
                    ))
                  : filteredRooms.map((room) => (
                      <BrowseCardStall key={room.id} room={room} />
                    ))
                }
              </div>
            ) : (
              <p className="text-xl font-medium text-neutral-500 italic">No matches found in this category.</p>
            )}
          </section>
        </main>
      </div>

      {/* Floating Toggle for Mobile - Matches Brutalist vibe */}
      <button
        className="fixed bottom-8 right-8 bg-neutral-950 text-white w-14 h-14 flex items-center justify-center rounded-none border-2 border-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] md:hidden z-50 active:translate-y-1"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        {isFilterOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
    </div>
  );
};

export default SearchResultPage;