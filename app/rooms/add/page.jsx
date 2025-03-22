'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Heading from '@/components/Heading';
import createSpaces from '@/app/actions/createSpaces';

const foodTypes = [
  'Fries', 'Burger', 'Chicken', 'BBQ', 'Rice Bowls', 'Ice Cream',
  'Isaw', 'Egg Waffles', 'Calamares', 'Turo-Turo', 'Fish',  
  'Betamax', 'Taho', 'Banana Cue', 'Kamote Cue', 'Mango',  
  'Smoke', 'Egg', 'Cheese', 'Turon', 'Korean', 'Shakes', 'Hotdogs', 'Corn', 'Fruits',  
  'Halo-Halo', 'Sorbetes', 'Goto', 'Lugaw', 'Bibingka',  
  'Puto Bumbong', 'Fried', 'Puto', 'Kakanin', 'Coffee'
];

const AddSpacePage = () => {
  const [state, formAction] = useFormState(createSpaces, {});
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [menuItems, setMenuItems] = useState([{ name: '', price: '', menuImage: null }]);

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

  const handleMenuImageChange = (index, file) => {
    const updatedMenu = [...menuItems];
    updatedMenu[index].menuImage = file;
    setMenuItems(updatedMenu);
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: '', price: '', menuImage: null }]);
  };

  const removeMenuItem = (index) => {
    const updatedMenu = menuItems.filter((_, i) => i !== index);
    setMenuItems(updatedMenu);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    menuItems.forEach((item) => {
      if (item.menuImage) {
        formData.append('menuImages[]', item.menuImage);
      }
    });

    formAction(formData);
  };

  return (
    <>
      <Heading title="Add a Food Stall" className="text-center mb-8 text-3xl font-extrabold text-gray-900" />
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Food Stall Name</label>
            <input type="text" name="name" required className="border border-gray-300 rounded-lg w-full py-2 px-4" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Type</label>
            <div className="grid grid-cols-5 gap-3">
              {foodTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" name="type" value={type} onChange={handleTypeChange} className="accent-blue-500" />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <input type="hidden" name="selectedTypes" value={JSON.stringify(selectedTypes)} />

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea name="description" required className="border border-gray-300 rounded-lg w-full h-24 py-2 px-4" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Menu</label>
            {menuItems.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input type="text" name="menuNames" placeholder="Item Name" required value={item.name} onChange={(e) => handleMenuChange(index, 'name', e.target.value)} className="border border-gray-300 rounded-lg py-2 px-3 w-full" />
                <input type="number" name="menuPrices" placeholder="₱ Price" required value={item.price} onChange={(e) => handleMenuChange(index, 'price', e.target.value)} className="border border-gray-300 rounded-lg py-2 px-3 w-24" />
                <input type="file" accept="image/*" onChange={(e) => handleMenuImageChange(index, e.target.files[0])} className="border border-gray-300 rounded-lg py-2 px-3" />
                <button type="button" onClick={() => removeMenuItem(index)} className="bg-red-500 text-white px-3 py-2 rounded">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addMenuItem} className="bg-green-500 text-white px-4 py-2 rounded mt-2">+ Add Menu Item</button>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Stall #</label>
            <input type="number" name="stallNumber" className="border border-gray-300 rounded-lg w-full py-2 px-4" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Upload Food Stall Image</label>
            <input type="file" name="images" multiple accept="image/*" className="border border-gray-300 rounded-lg w-full py-2 px-4" />
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
