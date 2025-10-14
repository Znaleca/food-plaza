'use client';

import { useEffect, useState, useMemo } from 'react';
import getSingleSpace from '@/app/actions/getSingleSpace';
import updateAvailability from '@/app/actions/updateAvailability';
import adjustIngredientStock from '@/app/actions/adjustIngredientStock';
// --- MODIFIED IMPORT: Use the combined function ---
import getMenuCapacityAndUpdateAvailability from '@/app/actions/getMenuCapacityAndUpdateAvailability';
// --- NEW IMPORT: For overall stall status ---
import updateOperatingStatus from '@/app/actions/updateOperatingStatus';
// --- END NEW IMPORT ---

import SalesCard from '@/components/SalesCard';
import CustomerRatingCard from '@/components/CustomerRatingCard';
import InventoryPreview from '@/components/InventoryPreview';
import Link from 'next/link';
import { FaChevronLeft, FaMinus, FaPlus } from 'react-icons/fa6';
import { toast } from 'react-toastify';

const categories = ['Drinks', 'Add-Ons', 'Meals', 'Snacks', 'Dessert'];

const PreviewStallPage = ({ params }) => {
  const { id } = params;
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuAvailability, setMenuAvailability] = useState([]);
  const [menuQuantity, setMenuQuantity] = useState([]); 
  const [saving, setSaving] = useState(false);
  // --- NEW STATE: Overall operating status ---
  const [stallOpen, setStallOpen] = useState(false); 

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  useEffect(() => {
    const fetchStallAndCapacity = async () => {
      try {
        const data = await getSingleSpace(id);
        setStall(data);
        // --- NEW LOGIC: Initialize stallOpen state ---
        // Default to true if the field is missing/null/undefined
        setStallOpen(data.operatingStatus !== false); 
        
        const menuCount = data.menuName?.length || 0;
        let initialAvailability = data.menuAvailability || new Array(menuCount).fill(true);
        let initialQuantity = [];

        if (menuCount > 0) {
            // --- NEW LOGIC: Use the combined action ---
            const capacityResult = await getMenuCapacityAndUpdateAvailability({ stallId: id });
            
            if (capacityResult.success) {
                // Use the calculated capacity as the initial menu quantity
                initialQuantity = capacityResult.data;
                
                // IMPORTANT: The server automatically updated menuAvailability. 
                // We must refetch or re-derive the latest boolean availability 
                // based on the calculated capacity, especially if the initial 
                // 'data' from getSingleSpace was stale.
                initialAvailability = capacityResult.data.map(capacity => capacity > 0);

                if(capacityResult.availabilityUpdated) {
                    toast.info("Menu availability automatically synced with current stock levels.");
                }

            } else {
                console.error('Failed to get menu capacity:', capacityResult.error);
                // Fallback: Default to a static quantity (e.g., 10) if the capacity call fails
                initialQuantity = new Array(menuCount).fill(10);
                initialAvailability = new Array(menuCount).fill(true);
            }
        }
        
        // Initialize states
        setMenuAvailability(initialAvailability);
        setMenuQuantity(initialQuantity);
        
      } catch (err) {
        console.error('Error loading stall:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStallAndCapacity();
  }, [id]);
  
  // Existing functions...
  const toURL = (fid) =>
    `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fid}/view?project=${projectId}`;

  const imageUrls = useMemo(() => (stall?.images || []).map(toURL), [stall]);
  const menuImageUrls = useMemo(() => (stall?.menuImages || []).map(toURL), [stall]);

  // Combined menu data
  const menuData =
    (stall?.menuName || []).map((name, idx) => ({
      name,
      price: stall.menuPrice?.[idx] ?? 0,
      description: stall.menuDescription?.[idx] ?? '',
      image: menuImageUrls[idx] || null,
      type: stall.menuType?.[idx] || 'Others',
      small: stall.menuSmall?.[idx] ?? 0,
      medium: stall.menuMedium?.[idx] ?? 0,
      large: stall.menuLarge?.[idx] ?? 0,
      index: idx,
    })) || [];

  const toggleAvailability = async (index) => {
    // Prevent manual toggle if the stall is currently closed
    if (!stallOpen) {
        toast.warn("The stall is currently Closed. Open the stall before toggling menu availability.");
        return;
    }

    const updated = [...menuAvailability];
    updated[index] = !updated[index];
    setMenuAvailability(updated);

    try {
      // NOTE: This remains an explicit manual toggle action, not capacity-driven.
      const result = await updateAvailability({
        id: stall.$id,
        menuAvailability: updated,
      });

      if (result.success) {
        toast.success(
          `"${menuData[index].name}" is now ${updated[index] ? 'Available' : 'Not Available'}`
        );
      } else {
        toast.error('Failed to update availability');
        // Rollback on error
        setMenuAvailability(menuAvailability); 
      }
    } catch (err) {
      console.error('Failed to update availability:', err);
      toast.error('Unexpected error occurred');
      // Rollback on error
      setMenuAvailability(menuAvailability);
    }
  };
  
  // Updated function to handle quantity updates and ingredient stock deduction
  const handleUpdateQuantity = async (index, change) => {
    if (saving) return; // Prevent double click

    const currentQuantity = menuQuantity[index] || 0;
    const newQuantity = Math.max(0, currentQuantity + change); // Quantity cannot go below zero
    const itemName = menuData[index].name;
    
    // Check if stock is 0 and user is trying to subtract
    if (newQuantity === currentQuantity && change < 0) {
        toast.info(`${itemName} stock is already 0.`);
        return;
    }

    // Optimistic UI Update for menu quantity
    const updatedQuantity = [...menuQuantity];
    updatedQuantity[index] = newQuantity;
    setMenuQuantity(updatedQuantity);
    setSaving(true);

    try {
      // Call the server action to update both menu quantity AND ingredients
      const result = await adjustIngredientStock({
        stallId: stall.$id,
        updatedMenuQuantities: updatedQuantity, // The full array of new menu quantities
        menuName: itemName,                     // The name of the menu item being changed
        quantityChange: change,                 // The delta (+1 or -1) to apply to linked ingredients
      });

      if (result.success) {
        toast.success(
          `${itemName} stock updated to ${newQuantity}. Linked ingredient stocks adjusted.`
        );
        
        // Update both stocks and menuQuantity from the server response
        setStall(prevStall => ({
            ...prevStall,
            stocks: result.data.stocks, // Update the stocks array
            menuQuantity: updatedQuantity
        }));
        
        // After any quantity change, the availability *might* change, so we must re-run capacity check.
        // NOTE: This check will also respect the overall stallOpen status, but the stallOpen status will also 
        // override this with the toggleOperatingStatus function below.
        const capacityResult = await getMenuCapacityAndUpdateAvailability({ stallId: stall.$id });

        if(capacityResult.success) {
            // Update client state with the very latest, capacity-driven availability
            setMenuAvailability(capacityResult.data.map(capacity => capacity > 0));
        }


      } else {
        // Rollback UI if update fails
        setMenuQuantity(menuQuantity);
        toast.error(result.error || 'Failed to update stock quantity or ingredients.');
      }
    } catch (err) {
      // Rollback UI if update fails
      setMenuQuantity(menuQuantity);
      console.error('Failed to update menu quantity and ingredient stock:', err);
      toast.error('Unexpected error occurred while updating stock');
    } finally {
        setSaving(false);
    }
  };
  
  // --- MODIFIED FUNCTION: To open/close the entire stall and restore menu availability on open ---
  const toggleOperatingStatus = async () => {
      if (saving) return;
      setSaving(true);
      
      const newStatus = !stallOpen;
      
      try {
          // 1. Update overall operating status
          const statusResult = await updateOperatingStatus({
              id: stall.$id,
              status: newStatus,
          });

          if (!statusResult.success) {
              toast.error(statusResult.error || 'Failed to update stall status.');
              setSaving(false);
              return;
          }
          
          let successMessage = `Stall is now ${newStatus ? 'Open' : 'Closed'}.`;


          // 2. Handle menu availability based on new status
          if (!newStatus) {
              // If CLOSING, set all menu items to unavailable
              const allUnavailable = new Array(menuData.length).fill(false);
              const availabilityResult = await updateAvailability({
                  id: stall.$id,
                  menuAvailability: allUnavailable,
              });

              if (availabilityResult.success) {
                  setMenuAvailability(allUnavailable);
                  successMessage += " All menu items are now unavailable.";
              } else {
                  // Log error but proceed with status change as it succeeded
                  console.error('Failed to update all menu availability on close:', availabilityResult.error);
                  toast.warn("Stall closed, but failed to mark all menu items as unavailable in the database.");
              }
          } else {
              // If OPENING, re-run the capacity check to set availability based on stock
              const capacityResult = await getMenuCapacityAndUpdateAvailability({ stallId: stall.$id });

              if(capacityResult.success) {
                  // Update client state with the very latest, capacity-driven availability
                  const newAvailability = capacityResult.data.map(capacity => capacity > 0);
                  setMenuAvailability(newAvailability);
                  
                  // NOTE: Availability in the database is updated by the server action
                  if (capacityResult.availabilityUpdated) {
                      successMessage += " Menu availability synced with stock levels.";
                  } else {
                      successMessage += " Menu availability retained prior stock-based settings.";
                  }

              } else {
                  console.error('Failed to restore menu capacity/availability on open:', capacityResult.error);
                  toast.warn("Stall opened, but failed to restore menu availability based on stock.");
                  // Fallback: If capacity check fails, default all to available
                  const allAvailable = new Array(menuData.length).fill(true);
                  setMenuAvailability(allAvailable);
              }
          }

          
          // 3. Update local state
          setStallOpen(newStatus);
          toast.success(successMessage);
          
          // 4. Update the local stall object to reflect the change
          setStall(prevStall => ({
              ...prevStall,
              operatingStatus: newStatus
          }));
          
      } catch (err) {
          console.error('Failed to toggle operating status:', err);
          toast.error('Unexpected error occurred while changing stall status.');
      } finally {
          setSaving(false);
      }
  };
  // --- END MODIFIED FUNCTION ---


  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400" />
      </div>
    );

  if (!stall)
    return (
      <div className="text-white text-center mt-20 text-xl">Food Stall Not Found</div>
    );

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white px-4 sm:px-8 pb-8">
      <Link
        href="/rooms/my"
        className="flex items-center text-white hover:text-cyan-400 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      {/* --- NEW UI: Open/Closed Toggle --- */}
      <div className="flex justify-between items-center bg-neutral-900 rounded-xl p-4 mb-8 border border-neutral-800">
        <h3 className="text-xl font-semibold">Stall Status</h3>
        <button
          onClick={toggleOperatingStatus}
          disabled={saving}
          className={`px-6 py-2 rounded-full font-bold transition-all duration-300 shadow-md ${
            stallOpen
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {saving ? 'Processing...' : stallOpen ? 'Open' : 'Closed'}
        </button>
      </div>
      {/* --- END NEW UI --- */}


      <div className="mt-12 sm:mt-16 text-center mb-8 px-4">
        <h2 
          className="text-lg sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-light tracking-widest uppercase"
        >
          Food Stall
        </h2>
        <p className="mt-4 text-2xl sm:text-5xl mb-28 font-extrabold leading-tight">
          {stall.name}
        </p>
      </div>

      <div 
        className="bg-neutral-900 rounded-xl p-6 border border-neutral-800"
      >
        <img
          src={imageUrls[0]}
          alt="Stall Cover"
          className="rounded-xl w-full h-80 object-cover mb-6"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 mb-20">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg mb-2 text-neutral-300">Stall #:</span>
            <div 
              className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex items-center justify-center shadow-lg"
            >
              <p className="text-xl font-bold">{stall.stallNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg text-neutral-300">Type:</span>
            <p className="text-neutral-300 mt-2">{stall.type?.join(' • ') || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div 
        className="bg-neutral-900 text-neutral-400 p-6 rounded-lg -mt-9 shadow-lg text-center mx-4 sm:mx-8 border border-neutral-800"
      >
        <p className="mt-2 italic text-lg">
          {stall.description || 'Delicious food available here!'}
        </p>
      </div>

      <div className="mt-20 bg-neutral-950 rounded-xl p-4">
        {categories.map((cat) => {
          const items = menuData.filter((m) => m.type === cat);
          if (!items.length) return null;

          return (
            <div key={cat} className="mb-10">
              <h3 
                className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 border-b border-neutral-700 pb-2"
              >
                {cat}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-7">
                {items.map((m) => {
                  const hasSizes = m.small > 0 || m.medium > 0 || m.large > 0;
                  // Use combined availability logic: item must be individually available AND the stall must be open
                  const isAvailable = menuAvailability[m.index] && stallOpen; 
                  const currentQuantity = menuQuantity[m.index] ?? 0;

                  return (
                    <div
                      key={m.index}
                      className={`relative border border-neutral-800 rounded-md bg-neutral-900 p-3 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                        !isAvailable ? 'grayscale opacity-60' : ''
                      }`}
                    >
                      {/* Availability Toggle */}
                      <button
                        onClick={() => toggleAvailability(m.index)}
                        className={`absolute top-2 left-2 text-white text-[10px] px-2 py-1 rounded font-bold z-10 transition-colors ${
                          menuAvailability[m.index] 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                        disabled={saving || !stallOpen} // Disable if saving OR if stall is closed
                      >
                        {menuAvailability[m.index] ? 'Available' : 'Not Available'}
                      </button>

                      {m.image && (
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-20 h-20 rounded-full object-cover mb-2 shadow-sm mt-8"
                        />
                      )}
                      <h4 className="text-sm font-medium">{m.name}</h4>
                      {m.description && (
                        <p className="text-xs italic text-neutral-400 text-center mb-1">
                          {m.description}
                        </p>
                      )}
                      
                      {/* Size Tags (Remains the same) */}
                      <div className="mt-2 flex gap-2 flex-wrap justify-center">
                        {hasSizes ? (
                          <>
                            {m.small > 0 && (
                              <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white text-xs px-2 py-1 rounded-full">S</span>
                            )}
                            {m.medium > 0 && (
                              <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white text-xs px-2 py-1 rounded-full">M</span>
                            )}
                            {m.large > 0 && (
                              <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white text-xs px-2 py-1 rounded-full">L</span>
                            )}
                          </>
                        ) : (
                          <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white text-xs px-2 py-1 rounded-full">One-size</span>
                        )}
                      </div>
                      
                      {/* Quantity Control */}
                      <div className="mt-3 flex items-center justify-center border-t border-neutral-700 pt-3 w-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card body click logic (if any)
                            handleUpdateQuantity(m.index, -1);
                          }}
                          className="p-1 bg-neutral-800 rounded-l-md hover:bg-neutral-700 transition disabled:opacity-50"
                          aria-label="Decrease quantity"
                          disabled={saving || currentQuantity === 0}
                        >
                          <FaMinus className="w-4 h-4 text-cyan-400" />
                        </button>
                        <span className={`px-4 py-1 font-bold w-12 text-center border-y border-neutral-700 ${currentQuantity === 0 ? 'text-red-500' : 'text-white'}`}>
                          {currentQuantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card body click logic (if any)
                            handleUpdateQuantity(m.index, 1);
                          }}
                          className="p-1 bg-neutral-800 rounded-r-md hover:bg-neutral-700 transition disabled:opacity-50"
                          aria-label="Increase quantity"
                          disabled={saving}
                        >
                          <FaPlus className="w-4 h-4 text-fuchsia-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-neutral-900 rounded-xl p-6 mt-6 border border-neutral-800 mx-4 sm:mx-0">
        <SalesCard roomName={stall.name} />
      </div>

      <div className="bg-neutral-900 rounded-xl p-6 mt-6 border border-neutral-800 mx-4 sm:mx-0">
        <CustomerRatingCard roomName={stall.name} />
      </div>

      <InventoryPreview stocks={stall?.stocks} />
    </div>
  );
};

export default PreviewStallPage;