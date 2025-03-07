'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Heading from '@/components/Heading';
import createSpaces from '@/app/actions/createSpaces';

const foodTypes = ['Samgy', 'Cafe', 'Vegan', 'Fries', 'Burger', 'Chicken', 'Spicy', 'Kimchi'];

const AddSpacePage = () => {
  const [state, formAction] = useFormState(createSpaces, {});
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [menuItems, setMenuItems] = useState([{ name: '', price: '' }]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success('Food Stall added successfully!');
      router.push('/');
    }
  }, [state, router]);

  const handleTypeChange = (event) => {
    const { value, checked } = event.target;
    setSelectedTypes((prev) =>
      checked ? [...prev, value] : prev.filter((type) => type !== value)
    );
  };

  const handleMenuChange = (index, field, value) => {
    const updatedMenu = [...menuItems];
    updatedMenu[index][field] = value;
    setMenuItems(updatedMenu);
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: '', price: '' }]);
  };

  const removeMenuItem = (index) => {
    const updatedMenu = menuItems.filter((_, i) => i !== index);
    setMenuItems(updatedMenu);
  };

  return (
    <>
      <Heading title="Add a Food Stall" className="text-center mb-8 text-3xl font-extrabold text-gray-900" />
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl mx-auto">
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Food Stall Name</label>
            <input type="text" name="name" required className="border rounded-lg w-full py-2 px-3" />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {foodTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input type="checkbox" name="type" value={type} onChange={handleTypeChange} />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <input type="hidden" name="selectedTypes" value={JSON.stringify(selectedTypes)} />

          <div>
            <label className="block text-gray-700 font-bold mb-2">Description</label>
            <textarea name="description" required className="border rounded-lg w-full h-24 py-2 px-3" />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Menu</label>
            {menuItems.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input type="text" name="menuNames" placeholder="Item Name" required value={item.name} onChange={(e) => handleMenuChange(index, 'name', e.target.value)} className="border rounded-lg py-2 px-3 w-full" />
                <input type="number" name="menuPrices" placeholder="₱ Price" required value={item.price} onChange={(e) => handleMenuChange(index, 'price', e.target.value)} className="border rounded-lg py-2 px-3 w-24" />
                <button type="button" onClick={() => removeMenuItem(index)} className="bg-red-500 text-white px-3 py-2 rounded">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addMenuItem} className="bg-green-500 text-white px-4 py-2 rounded mt-2">+ Add Menu Item</button>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Stall #</label>
            <input type="number" name="stallNumber" className="border rounded-lg w-full py-2 px-3" />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Upload Food Stall Image</label>
            <input type="file" name="images" multiple accept="image/*" className="border rounded-lg w-full py-2 px-3" />
          </div>

          <div className="flex justify-center">
            <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all">
              Save Food Stall
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddSpacePage;
