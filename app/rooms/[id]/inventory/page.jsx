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
  FaSave,
  FaCube,
  FaCubes,
  FaRedo,
} from 'react-icons/fa';

const unitOptions = ['kg', 'g', 'L', 'mL', 'pcs'];

const MyInventoryPage = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [stall, setStall] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const doc = await getDocumentById(id);
      if (!doc) return toast.error('Stall not found.');
      setStall(doc);

      const parsedStocks = (doc.stocks || []).map((str) => {
        const [group, ingredient, quantity, batchDate, expiryDate] = str.split('|');
        const [amount, unit] = quantity?.split(' ') ?? ['', ''];
        return { group, ingredient, amount, unit, batchDate, expiryDate };
      });

      const grouped = parsedStocks.reduce((acc, curr) => {
        const existing = acc.find((g) => g.packageName === curr.group);
        const item = {
          ingredient: curr.ingredient,
          amount: curr.amount,
          unit: curr.unit,
          batchDate: curr.batchDate,
          expiryDate: curr.expiryDate,
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
  }, [id]);

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
      amount: '',
      unit: 'kg',
      batchDate: '',
      expiryDate: '',
    });
    setInventory(updated);
  };

  const updateIngredient = (pkgIndex, itemIndex, field, value) => {
    const updated = [...inventory];
    updated[pkgIndex].items[itemIndex][field] = value;
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
        item.amount &&
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
        const encoded = `${group.packageName}|${item.ingredient}|${quantity}|${item.batchDate}|${item.expiryDate}`;
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

      <div className="space-y-8 mb-10">
        {inventory.map((pkg, pkgIndex) => (
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
                const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();

                return (
                  <div
                    key={itemIndex}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-neutral-900 p-4 rounded-lg border border-neutral-700"
                  >
                    <input
                      type="text"
                      placeholder="Ingredient"
                      value={item.ingredient}
                      onChange={(e) =>
                        updateIngredient(pkgIndex, itemIndex, 'ingredient', e.target.value)
                      }
                      className={`bg-neutral-700 text-white px-4 py-2 rounded ${isExpired ? 'line-through text-red-400' : ''}`}
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) =>
                        updateIngredient(pkgIndex, itemIndex, 'amount', e.target.value)
                      }
                      className={`bg-neutral-700 text-white px-4 py-2 rounded ${isExpired ? 'line-through text-red-400' : ''}`}
                    />
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        updateIngredient(pkgIndex, itemIndex, 'unit', e.target.value)
                      }
                      className={`bg-neutral-700 text-white px-4 py-2 rounded ${isExpired ? 'line-through text-red-400' : ''}`}
                    >
                      {unitOptions.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={item.batchDate}
                      onChange={(e) =>
                        updateIngredient(pkgIndex, itemIndex, 'batchDate', e.target.value)
                      }
                      className={`bg-neutral-700 text-white px-4 py-2 rounded ${isExpired ? 'line-through text-red-400' : ''}`}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) =>
                          updateIngredient(pkgIndex, itemIndex, 'expiryDate', e.target.value)
                        }
                        className={`bg-neutral-700 text-white px-4 py-2 rounded w-full ${isExpired ? 'line-through text-red-400' : ''}`}
                      />
                      {isExpired && (
                        <button
                          onClick={() => {
                            const today = new Date().toISOString().slice(0, 10);
                            updateIngredient(pkgIndex, itemIndex, 'batchDate', today);
                            updateIngredient(pkgIndex, itemIndex, 'expiryDate', '');
                            toast.info('Ingredient renewed!');
                          }}
                          className="text-yellow-400 hover:text-yellow-500 text-xs"
                          title="Renew"
                        >
                          <FaRedo />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => removeIngredient(pkgIndex, itemIndex)}
                      className="text-red-400 hover:text-red-600 sm:col-span-5 text-left"
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
            >
              <FaPlus className="mr-2" />
              Add Ingredient
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addPackage}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg mb-6 flex items-center"
      >
        <FaPlus className="mr-2" />
        Add Package
      </button>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 rounded-lg text-white font-bold text-lg flex justify-center items-center disabled:opacity-50"
      >
        <FaSave className="mr-2" />
        {saving ? 'Saving...' : 'Save Inventory'}
      </button>
    </div>
  );
};

export default MyInventoryPage;
