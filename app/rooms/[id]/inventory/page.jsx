'use client';

import { useEffect, useState } from 'react';
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
} from 'react-icons/fa';
import InventoryPreview from '@/components/InventoryPreview';
import InventoryUpdate from '@/components/InventoryUpdate';

const unitOptions = ['kg', 'g', 'L', 'mL', 'pcs'];

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

const MyInventoryPage = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [stall, setStall] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // Get the current date once on load
  const currentDate = getPhilippinesDate();

  useEffect(() => {
    const fetchData = async () => {
      const doc = await getDocumentById(id);
      if (!doc) return toast.error('Stall not found.');
      setStall(doc);

      const parsedStocks = (doc.stocks || []).map((str) => {
        const [group, ingredient, quantity, batchDate, expiryDate] = str.split('|');
        const [amount, unit] = quantity?.split(' ') ?? ['', ''];
        return {
          group,
          ingredient,
          amount: parseFloat(amount || 0),
          unit,
          // Use current date if batchDate is missing/invalid, or 'no expiration'
          batchDate: batchDate === 'no expiration' ? currentDate : (batchDate || currentDate),
          expiryDate,
          hasExpiry: expiryDate !== 'no expiration'
        };
      });

      const grouped = parsedStocks.reduce((acc, curr) => {
        const existing = acc.find((g) => g.packageName === curr.group);
        const item = {
          ingredient: curr.ingredient,
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
      ingredient: '',
      amount: 0,
      unit: 'kg',
      // Auto-set the batch date to the current date
      batchDate: currentDate, 
      expiryDate: '',
      hasExpiry: true
    });
    setInventory(updated);
  };

  const updateIngredient = (pkgIndex, itemIndex, field, value) => {
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
    const isValid = inventory.every((group) =>
      group.packageName.trim() &&
      group.items.every((item) =>
        item.ingredient.trim() &&
        item.amount !== '' &&
        item.unit
      )
    );

    if (!isValid) {
      toast.error('Please fill in all required fields before saving.');
      return;
    }

    const formData = new FormData();
    formData.append('id', id);
    setSaving(true);

    inventory.forEach((group) => {
      group.items.forEach((item) => {
        const quantity = `${item.amount || ''} ${item.unit || 'kg'}`;
        // Ensure that the batchDate used for storage is the correct one, or 'no expiration' if applicable
        const storedBatchDate = item.hasExpiry ? (item.batchDate || currentDate) : 'no expiration';
        const expiryDateValue = item.hasExpiry ? (item.expiryDate || '') : 'no expiration';
        
        const encoded = `${group.packageName}|${item.ingredient}|${quantity}|${storedBatchDate}|${expiryDateValue}`;
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

  // Prepare stocks array for InventoryPreview & InventoryUpdate
  const encodedStocksForPreview = inventory.flatMap(group =>
    group.items.map(item => {
      const quantity = `${item.amount || ''} ${item.unit || 'kg'}`;
      const batchDateValue = item.hasExpiry ? (item.batchDate || currentDate) : 'no expiration';
      const expiryDateValue = item.hasExpiry ? (item.expiryDate || '') : 'no expiration';
      return `${group.packageName}|${item.ingredient}|${quantity}|${batchDateValue}|${expiryDateValue}`;
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

      <div className="text-center mb-40">
        <h2 className="text-lg text-pink-600 font-light tracking-widest uppercase">
          <FaCubes className="inline-block mr-2" /> Inventory Management
        </h2>
        <p className="mt-2 text-2xl sm:text-5xl font-extrabold leading-tight">{stall.name}</p>
        <p className="text-sm text-neutral-400 mt-2">
          Group your stocks by supplier, brand, or packaging
        </p>
      </div>

      {/* Inventory Update Component */}
      <InventoryUpdate
        stocks={encodedStocksForPreview}
        onUpdate={(updatedStocks) => {
          const updatedInventory = [...inventory];
          updatedInventory.forEach((group) => {
            group.items.forEach((item) => {
              const updatedItem = updatedStocks.find((s) => s.ingredient === item.ingredient);
              if (updatedItem) item.amount = updatedItem.amount;
            });
          });
          setInventory(updatedInventory);
        }}
      />

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
                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">Name</label>
                        <input
                          type="text"
                          placeholder="Ingredient"
                          value={item.ingredient}
                          onChange={(e) =>
                            updateIngredient(pkgIndex, itemIndex, 'ingredient', e.target.value)
                          }
                          className={`bg-neutral-700 text-white px-4 py-2 rounded ${isItemExpired ? 'text-gray-500' : ''}`}
                          disabled={isItemExpired} // Disable input for expired items
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">Quantity</label>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) =>
                            updateIngredient(pkgIndex, itemIndex, 'amount', e.target.value)
                          }
                          className={`bg-neutral-700 text-white px-4 py-2 rounded ${isItemExpired ? 'text-gray-500' : ''}`}
                          disabled={isItemExpired} // Disable input for expired items
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-neutral-400 mb-1">Type</label>
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            updateIngredient(pkgIndex, itemIndex, 'unit', e.target.value)
                          }
                          className={`bg-neutral-700 text-white px-4 py-2 rounded ${isItemExpired ? 'text-gray-500' : ''}`}
                          disabled={isItemExpired} // Disable input for expired items
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
                            updateIngredient(pkgIndex, itemIndex, 'hasExpiry', e.target.value === 'yes')
                          }
                          className="bg-neutral-700 text-white px-4 py-2 rounded"
                          disabled={isItemExpired} // Disable input for expired items
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
                                updateIngredient(pkgIndex, itemIndex, 'batchDate', e.target.value)
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
                                  updateIngredient(pkgIndex, itemIndex, 'expiryDate', e.target.value)
                                }
                                // Constraint 2: Min date is the Batch Date
                                min={item.batchDate}
                                className={`bg-neutral-700 text-white px-4 py-2 rounded w-full ${isItemExpired ? 'text-gray-500' : ''}`}
                                disabled={isItemExpired} // Disable input for expired items
                              />
                              {isItemExpired && (
                                <button
                                  onClick={() => {
                                    // Renew automatically resets batchDate to currentDate
                                    updateIngredient(pkgIndex, itemIndex, 'batchDate', currentDate); 
                                    updateIngredient(pkgIndex, itemIndex, 'expiryDate', '');
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
                        disabled={isItemExpired} // Disable button for expired items
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
                disabled={pkg.items.some(item => isExpired(item))} // Disable button if any item is expired
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
      <InventoryPreview stocks={encodedStocksForPreview} />

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