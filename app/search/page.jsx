'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getAllSpaces from "../actions/getAllSpaces";
import BrowseCardStall from "@/components/BrowseCardStall";
import BrowseCardMenu from "@/components/BrowseCardMenu";
import BrowseFilter from "@/components/BrowseFilter";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const SearchResultPage = () => {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("All");
  const [displayType, setDisplayType] = useState("Menus"); 
  const [isFilterOpen, setIsFilterOpen] = useState(false); // mobile toggle

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
          const menuAvailability =
            Array.isArray(room.menuAvailability) &&
            room.menuAvailability.length === room.menuName?.length
              ? room.menuAvailability
              : new Array(room?.menuName?.length || 0).fill(true);

          const menuData =
            (room?.menuName || []).map((name, idx) => ({
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
            imageUrl:
              room.images?.length > 0 ? toURL(room.images[0]) : "/placeholder.jpg",
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
    // Reset category when display type changes
    setCategory('All');
  }, [displayType]);

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
        filtered = filtered.filter(room => 
          room.menuData.some(menuItem => menuItem.type === category)
        );
      } else {
        filtered = filtered.filter(room => 
          room.type.includes(category)
        );
      }
    }

    setFilteredRooms(filtered);

  }, [searchInput, rooms, category, displayType]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value) {
      router.push(`/search?query=${encodeURIComponent(value)}`, { scroll: false });
    } else {
      router.push("/search", { scroll: false });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-neutral-900">
        <p className="text-white text-xl font-semibold animate-pulse">
          Loading food stalls...
        </p>
      </div>
    );
  }

  const allMenus = rooms.flatMap((room) => room.menuData);
  const filteredMenus = allMenus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchInput.toLowerCase());
    const matchesCategory = category === "All" || menu.type === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-h-screen -mt-20 bg-neutral-900 text-white px-6 pt-28 pb-24">
      {/* Search Bar */}
      <div className="mb-12 flex justify-center">
        <input
          type="text"
          placeholder="Search food stalls or menus..."
          value={searchInput}
          onChange={handleSearch}
          className="w-full max-w-2xl p-4 text-lg bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl shadow-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
        />
      </div>

      {/* Main Layout */}
      <div className="flex gap-12">
        {/* Sidebar Filter */}
        <aside
          className={`
            bg-neutral-800 shadow-xl p-6 w-64 z-40 transition-transform duration-300
            fixed top-0 left-0 h-full overflow-y-auto scrollbar-thin
            md:relative md:translate-x-0
            ${isFilterOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <BrowseFilter
            activeCategory={category}
            onChange={setCategory}
            activeDisplayType={displayType} 
            onDisplayTypeChange={setDisplayType}
          />
        </aside>

        {/* Floating Toggle Button for Mobile */}
        <button
          className="fixed top-1/2 -translate-y-1/2 bg-neutral-700 text-white rounded-full p-2 shadow-lg md:hidden z-50 transition-all duration-300"
          style={{
            left: isFilterOpen ? '16rem' : '0.5rem',
          }}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* Content */}
        <main className="flex-1">
          {displayType === "Menus" ? (
            <section className="mb-16">
              <h3 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-2">
                {searchInput ? "Matching Menu Items" : "All Menu"}
              </h3>
              {filteredMenus.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                  {filteredMenus.map((m) => (
                    <BrowseCardMenu
                      key={m.menuId}
                      roomId={m.roomId || rooms.find((r) => r.menuData.includes(m))?.id}
                      menuItem={m}
                      roomName={rooms.find((r) => r.menuData.includes(m))?.name || ""}
                      allMenus={allMenus}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-lg text-gray-400">No menu items found.</p>
              )}
            </section>
          ) : (
            <section>
              <h2 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-2">
                {searchInput ? `Food Stalls for "${searchInput}"` : "All Food Stalls"}
              </h2>
              {filteredRooms.length === 0 ? (
                <p className="text-lg text-gray-400">No food stalls found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredRooms.map((room) => (
                    <BrowseCardStall key={room.id} room={room} />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResultPage;
