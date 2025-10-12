'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { getDocumentById } from '@/app/actions/getSpace';
import updateInventory from '@/app/actions/updateInventory';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaChevronLeft,
  FaPlus,
  FaTrash,
  FaCube,
  FaCubes,
  FaRedo,
  FaBolt,
} from 'react-icons/fa';
import InventoryPreview from '@/components/InventoryPreview';

const unitOptions = ['kg', 'g', 'L', 'mL', 'pcs'];
// Define the separator for combining ingredient name and linked menu items
const DATA_SEPARATOR = '::'; 

// Function to get the current date in 'YYYY-MM-DD' format based on the Philippines time zone
const getPhilippinesDate = () => {
  const date = new Date();
  // Set time zone to Asia/Manila (Philippines)
  const options = { timeZone: 'Asia/Manila' };
  
  // Format the date parts manually to ensure YYYY-MM-DD format
  const year = date.toLocaleString('en-US', { year: 'numeric', ...options });
  const month = date.toLocaleString('en-US', { month: '2-digit', ...options });
  const day = date.toLocaleString('en-US', { day: '2-digit', ...options });
  
  return `${year}-${month}-${day}`;
};

// Component for the MULTI-SELECT menu dropdown checkbox
const MenuLinkDropdown = ({ menuItems, selectedItemsString, onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse the comma-separated string back into an array of selected names
  const selectedNames = useMemo(() => 
    selectedItemsString ? selectedItemsString.split(',').filter(s => s.trim() !== '') : [], 
    [selectedItemsString]
  );

  const handleToggle = (name) => {
    let newSelection;
    if (selectedNames.includes(name)) {
      // Remove item
      newSelection = selectedNames.filter(n => n !== name);
    } else {
      // Add item
      newSelection = [...selectedNames, name];
    }
    // Convert array back to a comma-separated string for storage
    onSelect(newSelection.join(','));
  };

  const displayText = selectedNames.length > 0 
    ? `${selectedNames.length} Menu Item${selectedNames.length > 1 ? 's' : ''} Linked`
    : 'Link to Menu Item(s)';

  return (
    <div className="relative w-full">
      <button
        type="button"
        className={`flex items-center justify-between w-full px-4 py-2 rounded ${
            disabled ? 'bg-neutral-700 text-gray-500 cursor-not-allowed' : 'bg-neutral-700 text-white hover:bg-neutral-600'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="truncate text-left">{displayText}</span>
        <FaBolt className={`ml-2 ${disabled ? 'text-gray-500' : 'text-pink-400'}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-neutral-600 rounded-md shadow-lg max-h-40 overflow-y-auto border border-pink-500">
          {menuItems.map((menu) => (
            <div
              key={menu.index}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-neutral-500"
              onClick={() => handleToggle(menu.name)}
            >
              <input
                type="checkbox"
                checked={selectedNames.includes(menu.name)}
                readOnly
                className="form-checkbox h-4 w-4 text-pink-600 bg-neutral-700 border-neutral-500 rounded"
              />
              <span className="ml-3 text-sm">{menu.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper to safely parse the stored string into its components
const parseStoredIngredient = (storedString) => {
    if (!storedString || typeof storedString !== 'string') {
        return { ingredientName: '', linkedMenus: '' };
    }
    const parts = storedString.split(DATA_SEPARATOR);
    if (parts.length > 1) {
        // Everything before the first separator is the ingredient name
        const ingredientName = parts[0];
        // Everything after the first separator is the linked menus string
        const linkedMenus = parts.slice(1).join(DATA_SEPARATOR); 
        return { ingredientName, linkedMenus };
    }
    // If no separator is found, assume the whole string is the ingredient name (for legacy/unlinked items)
    return { ingredientName: storedString, linkedMenus: '' };
};

// Helper to combine the components back into the stored string
const formatStoredIngredient = (ingredientName, linkedMenus) => {
    // If linkedMenus is empty, just return the ingredientName (for clean storage)
    if (!linkedMenus.trim()) {
        return ingredientName;
    }
    // Store both parts separated by the unique delimiter
    return `${ingredientName.trim()}${DATA_SEPARATOR}${linkedMenus}`;
};


const MyInventoryPage = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [stall, setStall] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [menuItems, setMenuItems] = useState([]); // State for menu items
  const [saving, setSaving] = useState(false);
  
  // Get the current date once on load
  const currentDate = getPhilippinesDate();

  useEffect(() => {
    const fetchData = async () => {
      const doc = await getDocumentById(id);
      if (!doc) return toast.error('Stall not found.');
      setStall(doc);

      // Parse and group inventory (existing logic)
      const parsedStocks = (doc.stocks || []).map((str) => {
        const [group, ingredient, quantity, batchDate, expiryDate] = str.split('|');
        const [amount, unit] = quantity?.split(' ') ?? ['', ''];
        
        // Use the helper function to separate the stored string
        const { ingredientName, linkedMenus } = parseStoredIngredient(ingredient);

        return {
          group,
          name: ingredientName, // The actual ingredient name
          linkedMenus, // The comma-separated string of linked menu items
          amount: parseFloat(amount || 0),
          unit,
          batchDate: batchDate === 'no expiration' ? currentDate : (batchDate || currentDate),
          expiryDate,
          hasExpiry: expiryDate !== 'no expiration'
        };
      });

      const grouped = parsedStocks.reduce((acc, curr) => {
        const existing = acc.find((g) => g.packageName === curr.group);
        const item = {
          name: curr.name, // Ingredient Name
          linkedMenus: curr.linkedMenus, // Linked Menu Items String
          amount: curr.amount,
          unit: curr.unit,
          batchDate: curr.batchDate,
          expiryDate: curr.expiryDate,
          hasExpiry: curr.hasExpiry
        };
        if (existing) {
          existing.items.push(item);
        } else {
          acc.push({ packageName: curr.group, items: [item] });
        }
        return acc;
      }, []);

      setInventory(grouped);

      // Extract menu data for linking
      const extractedMenu = (doc.menuName || []).map((name, idx) => ({
        name,
        index: idx,
      }));
      setMenuItems(extractedMenu);
    };

    fetchData();
  }, [id, currentDate]); 

  const addPackage = () => {
    setInventory([...inventory, { packageName: '', items: [] }]);
  };

  const updatePackageName = (index, value) => {
    const updated = [...inventory];
    updated[index].packageName = value;
    setInventory(updated);
  };

  const addIngredient = (pkgIndex) => {
    const updated = [...inventory];
    updated[pkgIndex].items.push({
      name: '', // Actual Ingredient Name
      linkedMenus: '', // Linked Menu Items String
      amount: 0,
      unit: 'kg',
      batchDate: currentDate, 
      expiryDate: '',
      hasExpiry: true
    });
    setInventory(updated);
  };

  // Dedicated update function for Ingredient Name and Linked Menus
  const updateItemField = (pkgIndex, itemIndex, field, value) => {
    const updated = [...inventory];
    
    // Constraint 1: Batch Date is always the current date
    if (field === 'batchDate' && value !== currentDate) {
        toast.info("The Batch Date is automatically set to today's date.");
        return; // Prevent manual change
    }

    updated[pkgIndex].items[itemIndex][field] = value;

    // Constraint 2: Expiration Date must be after Batch Date
    if (field === 'expiryDate' && updated[pkgIndex].items[itemIndex].hasExpiry) {
        const batchDate = updated[pkgIndex].items[itemIndex].batchDate;
        if (value && batchDate && new Date(value) < new Date(batchDate)) {
            toast.error("Expiration Date cannot be before the Batch Date.");
            updated[pkgIndex].items[itemIndex].expiryDate = ''; // Clear invalid date
        }
    }

    setInventory(updated);
  };

  const removeIngredient = (pkgIndex, itemIndex) => {
    if (!window.confirm('Are you sure you want to remove this ingredient?')) return;
    const updated = [...inventory];
    updated[pkgIndex].items.splice(itemIndex, 1);
    setInventory(updated);
  };

  const removePackage = (pkgIndex) => {
    if (!window.confirm('Are you sure you want to delete this entire package?')) return;
    const updated = [...inventory];
    updated.splice(pkgIndex, 1);
    setInventory(updated);
  };

  const handleSave = async () => {
    // Validation: Ensure the Ingredient Name is filled and at least one Menu Item is linked
    const isValid = inventory.every((group) =>
      group.packageName.trim() &&
      group.items.every((item) =>
        item.name.trim() &&          // Ingredient Name must be filled
        item.linkedMenus.trim() &&   // Linked Menu Items must be non-empty
        item.amount !== '' &&
        item.unit
      )
    );

    if (!isValid) {
      toast.error('Please fill in Package Name, Ingredient Name, Quantity, Unit, and link to at least one Menu Item for all items before saving.');
      return;
    }

    const formData = new FormData();
    formData.append('id', id);
    setSaving(true);

    inventory.forEach((group) => {
      group.items.forEach((item) => {
        const quantity = `${item.amount || ''} ${item.unit || 'kg'}`;
        const storedBatchDate = item.hasExpiry ? (item.batchDate || currentDate) : 'no expiration';
        const expiryDateValue = item.hasExpiry ? (item.expiryDate || '') : 'no expiration';
        
        // Combine Ingredient Name and Linked Menus for storage
        const storedIngredient = formatStoredIngredient(item.name, item.linkedMenus);
        
        const encoded = `${group.packageName}|${storedIngredient}|${quantity}|${storedBatchDate}|${expiryDateValue}`;
        formData.append('stocks[]', encoded);
      });
    });

    const result = await updateInventory(null, formData);
    setSaving(false);

    if (result.success) {
      toast.success('Inventory updated successfully!');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update inventory.');
    }
  };

  // Prepare stocks array for InventoryPreview (uses the combined stored string)
  const encodedStocks = inventory.flatMap(group =>
    group.items.map(item => {
      const quantity = `${item.amount || ''} ${item.unit || 'kg'}`;
      const storedIngredient = formatStoredIngredient(item.name, item.linkedMenus);
      const batchDateValue = item.hasExpiry ? (item.batchDate || currentDate) : 'no expiration';
      const expiryDateValue = item.hasExpiry ? (item.expiryDate || '') : 'no expiration';
      
      return `${group.packageName}|${storedIngredient}|${quantity}|${batchDateValue}|${expiryDateValue}`;
    })
  );

  const isExpired = (item) => item.hasExpiry && item.expiryDate && new Date(item.expiryDate) < new Date(currentDate);

  if (!stall)
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900 text-white text-lg">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 pb-12">
      <Link
        href="/rooms/my"
        className="flex items-center text-white hover:text-pink-500 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      <div className="text-center mb-10">
        <h2 className="text-lg text-pink-600 font-light tracking-widest uppercase">
          <FaCubes className="inline-block mr-2" /> Inventory Management
        </h2>
        <p className="mt-2 text-2xl sm:text-5xl font-extrabold leading-tight">{stall.name}</p>
        <p className="text-sm text-neutral-400 mt-2">
          Group your stocks by supplier, brand, or packaging
        </p>
      </div>

      {/* Inventory Packages */}
      <div className="space-y-8 my-10">
        {inventory.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400">
            <FaCube className="mx-auto text-4xl mb-4" />
            <p className="text-lg font-semibold">No inventory packages yet!</p>
            <p className="text-sm mt-1">Start by clicking "Add Package" below to track your stocks.</p>
          </div>
        ) : (
          inventory.map((pkg, pkgIndex) => (
            <div key={pkgIndex} className="bg-neutral-800 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center w-full">
                  <FaCube className="text-pink-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Package Name (e.g., Knorr)"
                    value={pkg.packageName}
                    onChange={(e) => updatePackageName(pkgIndex, e.target.value)}
                    className="bg-neutral-700 text-white px-4 py-2 rounded w-full"
                  />
                </div>
                <button
                  onClick={() => removePackage(pkgIndex)}
                  className="ml-4 text-red-400 hover:text-red-600 flex items-center"
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
                      className="grid grid-cols-1 sm:grid-cols-6 gap-4 bg-neutral-900 p-4 rounded-lg border border-neutral-700"
                    >
                      {/* Ingredient Name Input */}
                      <div className="flex flex-col sm:col-span-3">
                        <label className="text-xs text-neutral-400 mb-1 flex items-center">
                            Ingredient Name <span className="text-red-400 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="All-Purpose Flour"
                          value={item.name}
                          onChange={(e) =>
                            updateItemField(pkgIndex, itemIndex, 'name', e.target.value)
                          }
                          className={`bg-neutral-700 text-white px-4 py-2 rounded ${isItemExpired ? 'text-gray-500' : ''}`}
                          disabled={isItemExpired} 
                        />
                      </div>
                      
                      {/* Menu Link Dropdown - Multi-Select */}
                      <div className="flex flex-col sm:col-span-3">
                        <label className="text-xs text-neutral-400 mb-1 flex items-center">
                            Linked Menu Item(s) <span className="text-red-400 ml-1">*</span>
                        </label>
                        <MenuLinkDropdown
                            menuItems={menuItems}
                            selectedItemsString={item.linkedMenus}
                            onSelect={(str) => updateItemField(pkgIndex, itemIndex, 'linkedMenus', str)}
                            disabled={isItemExpired}
                        />
                      </div>
                      
                      {/* Quantity, Unit, Expiry Fields */}
                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">Quantity</label>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) =>
                            updateItemField(pkgIndex, itemIndex, 'amount', e.target.value)
                          }
                          className={`bg-neutral-700 text-white px-4 py-2 rounded ${isItemExpired ? 'text-gray-500' : ''}`}
                          disabled={isItemExpired}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">Type</label>
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            updateItemField(pkgIndex, itemIndex, 'unit', e.target.value)
                          }
                          className={`bg-neutral-700 text-white px-4 py-2 rounded ${isItemExpired ? 'text-gray-500' : ''}`}
                          disabled={isItemExpired}
                        >
                          {unitOptions.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">Expiration Option</label>
                        <select
                          value={item.hasExpiry ? 'yes' : 'no'}
                          onChange={(e) =>
                            updateItemField(pkgIndex, itemIndex, 'hasExpiry', e.target.value === 'yes')
                          }
                          className="bg-neutral-700 text-white px-4 py-2 rounded"
                          disabled={isItemExpired}
                        >
                          <option value="yes">Has Expiration</option>
                          <option value="no">No Expiration</option>
                        </select>
                      </div>

                      {item.hasExpiry && (
                        <>
                          <div className="flex flex-col">
                            <label className="text-xs text-neutral-400 mb-1">Batch Date</label>
                            <input
                              type="date"
                              value={item.batchDate}
                              // Constraint 1: Disabled to enforce current date
                              onChange={(e) =>
                                updateItemField(pkgIndex, itemIndex, 'batchDate', e.target.value)
                              }
                              className={`bg-neutral-700 text-white px-4 py-2 rounded ${isItemExpired ? 'text-gray-500' : ''}`}
                              disabled={true} 
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-xs text-neutral-400 mb-1">Expiration Date</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="date"
                                value={item.expiryDate}
                                onChange={(e) =>
                                  updateItemField(pkgIndex, itemIndex, 'expiryDate', e.target.value)
                                }
                                // Constraint 2: Min date is the Batch Date
                                min={item.batchDate}
                                className={`bg-neutral-700 text-white px-4 py-2 rounded w-full ${isItemExpired ? 'text-gray-500' : ''}`}
                                disabled={isItemExpired}
                              />
                              {isItemExpired && (
                                <button
                                  onClick={() => {
                                    // Renew automatically resets batchDate to currentDate
                                    updateItemField(pkgIndex, itemIndex, 'batchDate', currentDate); 
                                    updateItemField(pkgIndex, itemIndex, 'expiryDate', '');
                                    toast.info('Ingredient renewed! Set the new expiration date.');
                                  }}
                                  className="text-yellow-400 hover:text-yellow-500 text-xs"
                                  title="Renew"
                                >
                                  <FaRedo />
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      <button
                        onClick={() => removeIngredient(pkgIndex, itemIndex)}
                        className="text-red-400 hover:text-red-600 sm:col-span-6 text-left mt-2"
                        disabled={isItemExpired}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => addIngredient(pkgIndex)}
                className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg flex items-center"
                disabled={pkg.items.some(item => isExpired(item))}
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
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg mb-6 flex items-center"
      >
        <FaPlus className="mr-2" />
        Add Package
      </button>

      {/* Inventory Preview Chart */}
      <InventoryPreview stocks={encodedStocks} />

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 rounded-lg text-white font-bold text-lg flex justify-center items-center disabled:opacity-50 mt-6"
      >
        {saving ? 'Saving...' : 'Save Inventory'}
      </button>
    </div>
  );
};

export default MyInventoryPage;