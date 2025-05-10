'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Heading from '@/components/Heading';
import { getDocumentById } from '@/app/actions/getSpace';
import updateSpace from '@/app/actions/updateSpace';

const foodTypes = [
  'Fries', 'Burger', 'Chicken', 'BBQ', 'Rice Bowls', 'Ice Cream',
  'Isaw', 'Egg Waffles', 'Calamares', 'Turo-Turo', 'Fish',  
  'Betamax', 'Taho', 'Banana Cue', 'Kamote Cue', 'Mango',  
  'Smoke', 'Egg', 'Cheese', 'Turon', 'Korean', 'Shakes', 'Hotdogs', 'Corn', 'Fruits',  
  'Halo-Halo', 'Sorbetes', 'Goto', 'Lugaw', 'Bibingka',  
  'Puto Bumbong', 'Fried', 'Puto', 'Kakanin', 'Coffee'
];

const EditSpacePage = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const [stall, setStall] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    const fetchStall = async () => {
      const data = await getDocumentById(id);
      if (!data) return toast.error('Food Stall not found.');
      setStall(data);
      setSelectedTypes(data.type || []);
      setMenuItems(
        (data.menuName || []).map((name, index) => ({
          name,
          price: data.menuPrice?.[index] || '',
          menuImage: null,
          existingImage: data.menuImages?.[index] || null
        }))
      );
    };
    fetchStall();
  }, [id]);

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
    setMenuItems([...menuItems, { name: '', price: '', menuImage: null, existingImage: null }]);
  };

  const removeMenuItem = (index) => {
    const updatedMenu = menuItems.filter((_, i) => i !== index);
    setMenuItems(updatedMenu);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    formData.append('id', id);
    formData.append('selectedTypes', JSON.stringify(selectedTypes));

    menuItems.forEach((item, index) => {
      formData.append('menuNames', item.name);
      formData.append('menuPrices', item.price);
      if (item.menuImage) formData.append('menuImages[]', item.menuImage);
      else formData.append('menuImages[]', new Blob([], { type: 'text/plain' })); // Placeholder
      formData.append('existingMenuImages[]', item.existingImage || '');
    });

    newImages.forEach((img) => formData.append('images', img));

    const result = await updateSpace(null, formData);
    if (result.success) {
      toast.success('Food Stall updated!');
      router.push('/');
    } else {
      toast.error(result.error);
    }
  };

  if (!stall) return <div className="text-center mt-10">Loading...</div>;

  return (
    <>
      <Heading title="Edit Food Stall" className="text-center mb-8 text-3xl font-extrabold text-gray-900" />

      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Food Stall Name</label>
            <input type="text" name="name" defaultValue={stall.name} required className="border border-gray-300 rounded-lg w-full py-2 px-4" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Type</label>
            <div className="grid grid-cols-5 gap-3">
              {foodTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    name="type"
                    value={type}
                    checked={selectedTypes.includes(type)}
                    onChange={handleTypeChange}
                    className="accent-blue-500"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea name="description" defaultValue={stall.description} required className="border border-gray-300 rounded-lg w-full h-24 py-2 px-4" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Menu</label>
            {menuItems.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input type="text" placeholder="Item Name" required value={item.name} onChange={(e) => handleMenuChange(index, 'name', e.target.value)} className="border border-gray-300 rounded-lg py-2 px-3 w-full" />
                <input type="number" placeholder="₱ Price" required value={item.price} onChange={(e) => handleMenuChange(index, 'price', e.target.value)} className="border border-gray-300 rounded-lg py-2 px-3 w-24" />
                <input type="file" accept="image/*" onChange={(e) => handleMenuImageChange(index, e.target.files[0])} className="border border-gray-300 rounded-lg py-2 px-3" />
                <button type="button" onClick={() => removeMenuItem(index)} className="bg-black text-white px-3 py-2 rounded">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addMenuItem} className="bg-yellow-400 text-white px-4 py-2 rounded mt-2">+ Add Menu Item</button>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Stall #</label>
            <input type="number" name="stallNumber" defaultValue={stall.stallNumber} className="border border-gray-300 rounded-lg w-full py-2 px-4" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Upload New Food Stall Images (Optional)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setNewImages([...e.target.files])} className="border border-gray-300 rounded-lg w-full py-2 px-4" />
          </div>

          <div className="flex justify-center">
            <button type="submit" className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-pink-700 transition-all">
              Update Food Stall
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditSpacePage;
