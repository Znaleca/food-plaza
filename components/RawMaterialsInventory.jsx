// components/RawMaterialsInventory.jsx

'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaTrash,
  FaCube,
  FaRedo,
  FaMinus,
  FaAngleDown,
} from 'react-icons/fa6';
import InventoryPreview from '@/components/InventoryPreview';

// --- Local Constants & Helpers ---

const unitOptions = ['kg', 'g', 'L', 'mL', 'pcs'];

const getPhilippinesDate = () => {
  const date = new Date();
  const options = { timeZone: 'Asia/Manila' };
  const year = date.toLocaleString('en-US', { year: 'numeric', ...options });
  const month = date.toLocaleString('en-US', { month: '2-digit', ...options });
  const day = date.toLocaleString('en-US', { day: '2-digit', ...options });
  return `${year}-${month}-${day}`;
};

const currentDate = getPhilippinesDate();

// --- Menu Association Component (Moved here as a dependency) ---

const MenuAssociationSelector = ({
  menuData,
  selectedMenuString,
  onUpdate,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Convert comma-separated string to array
  const selectedItems = useMemo(
    () =>
      selectedMenuString
        ? selectedMenuString.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    [selectedMenuString]
  );

  const toggleItem = (menuName) => {
    const isSelected = selectedItems.includes(menuName);
    let newSelectedItems;

    if (isSelected) {
      newSelectedItems = selectedItems.filter((name) => name !== menuName);
    } else {
      newSelectedItems = [...selectedItems, menuName];
    }

    // Convert back to comma-separated string and call the update function
    onUpdate(newSelectedItems.join(', '));
  };

  // Display string for the button
  const displayLabel =
    selectedItems.length > 0
      ? `${selectedItems.length} Item${
          selectedItems.length > 1 ? 's' : ''
        } Selected`
      : 'Select Menu Items';

  // Conditional class for the button
  const buttonClasses = `bg-neutral-700 text-white px-4 py-2 rounded w-full flex justify-between items-center transition-colors ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-600'
  }`;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        className={buttonClasses}
        disabled={disabled}
      >
        <span className="truncate">{displayLabel}</span>
        <FaAngleDown
          className={`ml-2 transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-neutral-700 border border-neutral-600 rounded-md shadow-2xl p-2">
          {menuData.map((menu) => (
            <div
              key={menu.name}
              className="flex items-center p-1 hover:bg-neutral-600 rounded"
            >
              <input
                type="checkbox"
                id={`menu-item-${menu.name}`}
                checked={selectedItems.includes(menu.name)}
                onChange={() => toggleItem(menu.name)}
                className="w-4 h-4 text-pink-500 bg-neutral-800 border-neutral-600 rounded focus:ring-pink-500"
              />
              <label
                htmlFor={`menu-item-${menu.name}`}
                className="ml-2 text-sm text-white cursor-pointer"
              >
                {menu.name}
              </label>
            </div>
          ))}
          {menuData.length === 0 && (
            <p className="text-sm text-neutral-400 p-2">
              No menu items found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Raw Materials Component ---

const RawMaterialsInventory = ({ inventory, setInventory, menuData }) => {

  const addPackage = () => {
    setInventory([...inventory, { packageName: '', items: [] }]);
  };

  const updatePackageName = (index, value) => {
    const updated = [...inventory];
    updated[index].packageName = value;
    setInventory(updated);
  };

  const addIngredient = (pkgIndex) => {
    setInventory((prev) => {
      const updated = [...prev];
      updated[pkgIndex].items.push({
        ingredient: '',
        amount: 0,
        unit: 'kg',
        batchDate: currentDate,
        expiryDate: '',
        hasExpiry: true,
        menuItemUsedIn: '', // CSV String default
      });
      return updated;
    });
  };

  // Optimized updateIngredient to handle all field updates
  const updateIngredient = useCallback(
    (pkgIndex, itemIndex, field, value) => {
      setInventory((prev) => {
        const updated = [...prev];
        const item = updated[pkgIndex].items[itemIndex];

        item[field] = value;

        if (field === 'expiryDate' && item.hasExpiry) {
          const batchDate = item.batchDate;
          if (value && batchDate && new Date(value) < new Date(batchDate)) {
            toast.error('Expiration Date cannot be before the Batch Date.');
            item.expiryDate = '';
          }
        }
        return updated;
      });
    },
    [setInventory]
  );

  const removeIngredient = (pkgIndex, itemIndex) => {
    if (!window.confirm('Are you sure you want to remove this ingredient?'))
      return;
    setInventory((prev) => {
      const updated = [...prev];
      updated[pkgIndex].items.splice(itemIndex, 1);
      return updated;
    });
  };

  const removePackage = (pkgIndex) => {
    if (
      !window.confirm('Are you sure you want to delete this entire package?')
    )
      return;
    setInventory((prev) => {
      const updated = [...prev];
      updated.splice(pkgIndex, 1);
      return updated;
    });
  };

  const isExpired = (item) =>
    item.hasExpiry &&
    item.expiryDate &&
    new Date(item.expiryDate) < new Date(currentDate);


  // For InventoryPreview
  const encodedInventoryForPreview = useMemo(() => 
    inventory.flatMap(group =>
      group.items.map(item => {
        const quantity = `${item.amount || ''} ${item.unit || 'kg'}`;
        const batchDateValue = item.hasExpiry ? (item.batchDate || currentDate) : 'no expiration';
        const expiryDateValue = item.hasExpiry ? (item.expiryDate || '') : 'no expiration';
        // Only include the 5 required parts for the preview component
        return `${group.packageName}|${item.ingredient}|${quantity}|${batchDateValue}|${expiryDateValue}`;
      })
    ), [inventory]);


  return (
    <>
      <h3 className="text-2xl font-bold text-pink-400 mb-6 border-b border-neutral-700 pb-2 mt-16">
        Raw Material Inventory
      </h3>
      <p className="text-neutral-400 mb-6">
        Track packages, ingredients, and their usage in menu items.
      </p>

      <div className="space-y-8">
        {inventory.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400">
            <FaCube className="mx-auto text-4xl mb-4" />
            <p className="text-lg font-semibold">
              No raw material packages yet!
            </p>
            <p className="text-sm mt-1">
              Add packages below to track ingredients and spoilage.
            </p>
          </div>
        ) : (
          inventory.map((pkg, pkgIndex) => (
            <div
              key={pkgIndex}
              className="bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-700"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center w-full">
                  <FaCube className="text-pink-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Package Name (e.g., Knorr)"
                    value={pkg.packageName}
                    onChange={(e) =>
                      updatePackageName(pkgIndex, e.target.value)
                    }
                    className="bg-neutral-700 text-white px-4 py-2 rounded w-full"
                  />
                </div>
                <button
                  onClick={() => removePackage(pkgIndex)}
                  className="ml-4 text-red-400 hover:text-red-600 flex items-center whitespace-nowrap text-sm"
                >
                  <FaTrash className="mr-1" />
                  Delete Package
                </button>
              </div>

              <div className="space-y-4">
                {pkg.items.map((item, itemIndex) => {
                  const isItemExpired = isExpired(item);
                  return (
                    <div
                      key={itemIndex}
                      // Use a responsive grid with 7 columns
                      className="grid grid-cols-1 gap-4 bg-neutral-900 p-4 rounded-lg border border-neutral-700 md:grid-cols-7"
                    >
                      {/* Ingredient Name (Col 1) */}
                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Ingredient"
                          value={item.ingredient}
                          onChange={(e) =>
                            updateIngredient(
                              pkgIndex,
                              itemIndex,
                              'ingredient',
                              e.target.value
                            )
                          }
                          className={`bg-neutral-700 text-white px-4 py-2 rounded ${
                            isItemExpired ? 'text-gray-500' : ''
                          }`}
                          disabled={isItemExpired}
                        />
                      </div>

                      {/* Quantity (Col 2) */}
                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) =>
                            updateIngredient(
                              pkgIndex,
                              itemIndex,
                              'amount',
                              e.target.value
                            )
                          }
                          className={`bg-neutral-700 text-white px-4 py-2 rounded ${
                            isItemExpired ? 'text-gray-500' : ''
                          }`}
                          disabled={isItemExpired}
                        />
                      </div>

                      {/* Unit Type (Col 3) */}
                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">
                          Unit
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            updateIngredient(
                              pkgIndex,
                              itemIndex,
                              'unit',
                              e.target.value
                            )
                          }
                          className={`bg-neutral-700 text-white px-4 py-2 rounded ${
                            isItemExpired ? 'text-gray-500' : ''
                          }`}
                          disabled={isItemExpired}
                        >
                          {unitOptions.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Menu Item Association (Col 4-5) */}
                      <div className="flex flex-col md:col-span-2">
                        <label className="text-xs text-neutral-400 mb-1">
                          Used in Menu Items
                        </label>
                        <MenuAssociationSelector
                          menuData={menuData}
                          selectedMenuString={item.menuItemUsedIn}
                          onUpdate={(newString) =>
                            updateIngredient(
                              pkgIndex,
                              itemIndex,
                              'menuItemUsedIn',
                              newString
                            )
                          }
                          disabled={isItemExpired}
                        />
                      </div>

                      {/* Expiration Option (Col 6 - Takes up the space of Batch/Exp. Date columns if not expiring) */}
                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">
                          Expiry
                        </label>
                        <select
                          value={item.hasExpiry ? 'yes' : 'no'}
                          onChange={(e) =>
                            updateIngredient(
                              pkgIndex,
                              itemIndex,
                              'hasExpiry',
                              e.target.value === 'yes'
                            )
                          }
                          className="bg-neutral-700 text-white px-4 py-2 rounded"
                          disabled={isItemExpired}
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      
                      {/* ----------------- EXPIRING FIELDS & REMOVE BUTTON ----------------- */}
                      {item.hasExpiry ? (
                        <>
                          {/* Batch Date (Col 7 - Part 1) */}
                          <div className="flex flex-col">
                            <label className="text-xs text-neutral-400 mb-1">
                              Batch
                            </label>
                            <input
                              type="date"
                              value={item.batchDate}
                              // Constraint: Disabled to enforce current date
                              className={`bg-neutral-700 text-white px-4 py-2 rounded ${
                                isItemExpired ? 'text-gray-500' : ''
                              }`}
                              disabled={true}
                            />
                          </div>
                          
                          {/* Exp. Date & Renew (Full New Row/Below for small screens, Col 7 - Part 2) */}
                          {/* We use md:col-span-full to reset grid context on small screens */}
                          <div className="flex flex-col relative md:col-span-2 md:col-start-6">
                            <label className="text-xs text-neutral-400 mb-1">
                              Exp. Date
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="date"
                                value={item.expiryDate}
                                onChange={(e) =>
                                  updateIngredient(
                                    pkgIndex,
                                    itemIndex,
                                    'expiryDate',
                                    e.target.value
                                  )
                                }
                                min={item.batchDate}
                                className={`bg-neutral-700 text-white px-2 py-2 rounded w-full ${
                                  isItemExpired ? 'text-gray-500' : ''
                                }`}
                                disabled={isItemExpired}
                              />
                              {isItemExpired && (
                                <button
                                  onClick={() => {
                                    updateIngredient(
                                      pkgIndex,
                                      itemIndex,
                                      'batchDate',
                                      currentDate
                                    );
                                    updateIngredient(
                                      pkgIndex,
                                      itemIndex,
                                      'expiryDate',
                                      ''
                                    );
                                    toast.info(
                                      'Ingredient renewed! Set the new expiration date.'
                                    );
                                  }}
                                  className="text-yellow-400 hover:text-yellow-500 text-xs p-1"
                                  title="Renew Stock"
                                >
                                  <FaRedo />
                                </button>
                              )}
                            </div>
                            
                            {/* --- FIX: Standardized Remove Button Position --- */}
                            <button
                              onClick={() => removeIngredient(pkgIndex, itemIndex)}
                              className="text-red-400 hover:text-red-600 text-sm mt-2 text-left"
                              disabled={isItemExpired}
                            >
                              Remove Ingredient
                            </button>
                            {/* ------------------------------------------------ */}

                          </div>
                          
                          {/* We need to re-adjust the grid layout so the remove button doesn't take up the full row on small screens, but the full row is needed for the original layout. Let's simplify and make the Exp Date/Remove group take up 2 columns starting at column 6, and adjust the number of columns in the grid. */}
                          
                        </>
                      ) : (
                        // If not expiring, the last two columns (Batch and Exp. Date) are unused.
                        // Add an empty div for layout consistency on larger screens (md:col-span-2)
                        <div className="md:col-span-2">
                           {/* Remove Button for non-expiring row, aligned with other remove buttons */}
                            <button
                              onClick={() => removeIngredient(pkgIndex, itemIndex)}
                              className="text-red-400 hover:text-red-600 text-sm mt-8 text-left"
                            >
                              Remove Ingredient
                            </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => addIngredient(pkgIndex)}
                className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg flex items-center"
                disabled={pkg.items.some((item) => isExpired(item))}
              >
                <FaPlus className="mr-2" />
                Add Ingredient
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={addPackage}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg my-8 flex items-center"
      >
        <FaPlus className="mr-2" />
        Add Raw Material Package
      </button>
      
      {/* Inventory Preview Chart for Raw Materials */}
      {inventory.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-pink-400 mb-6 border-b border-neutral-700 pb-2">
            Raw Material Stock Overview
          </h3>
          <InventoryPreview stocks={encodedInventoryForPreview} />
        </div>
      )}
    </>
  );
};

export default RawMaterialsInventory;