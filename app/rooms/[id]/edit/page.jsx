'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Heading from '@/components/Heading';
import { getDocumentById } from '@/app/actions/getSpace';
import updateSpace from '@/app/actions/updateSpace';

const foodTypes = [
  'Fried', 'Smoked', 'Sushi', 'BBQ', 'Rice Bowl', 'Dessert',
  'Drinks', 'Egg', 'Vegan', 'Healthy', 'Coffee',
  'Samgyupsal', 'Hot Pot', 'Milk Tea', 'Milk Shake', 'Sweets',
  'Pastry', 'Burger', 'Meat', 'Rice Cake', 'Shake', 'Dish', 'Pasta', 'Fruits',
  'Steamed', 'Spicy', 'Sour', 'Chocolate', 'Seafood',
  'Steak', 'Soup', 'Noodles', 'Sizzling'
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
          description: data.menuDescription?.[index] || '', // Add description here
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
    setMenuItems([...menuItems, { name: '', price: '', description: '', menuImage: null, existingImage: null }]);
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
      formData.append('menuDescriptions', item.description); // Add description to formData
      if (item.menuImage) formData.append('menuImages[]', item.menuImage);
      else formData.append('menuImages[]', new Blob([], { type: 'text/plain' })); // Placeholder
      formData.append('existingMenuImages[]', item.existingImage || '');
    });

    newImages.forEach((img) => formData.append('images', img));

    const result = await updateSpace(null, formData);
    if (result.success) {
      toast.success('Food Stall updated!');
      router.push('/rooms/my');
    } else {
      toast.error(result.error);
    }
  };

  if (!stall) return <div className="text-center mt-10">Loading...</div>;

  return (
    <>
      <Heading title="Edit Food Stall" className="text-center mb-8 text-3xl font-extrabold text-gray-900" />

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-5xl mx-auto"> {/* Increased max-width */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Food Stall Name</label>
            <input
              type="text"
              name="name"
              defaultValue={stall.name}
              required
              className="border border-gray-300 rounded-lg w-full py-3 px-6" // Increased padding
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Type</label>
            <div className="grid grid-cols-4 gap-4"> {/* Adjusted grid layout */}
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
            <textarea
              name="description"
              defaultValue={stall.description}
              required
              className="border border-gray-300 rounded-lg w-full h-32 py-3 px-6" // Increased height
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Menu</label>
            {menuItems.map((item, index) => (
              <div key={index} className="flex space-x-4 mb-4 items-center"> {/* Increased spacing */}
                <input
                  type="text"
                  placeholder="Item Name"
                  required
                  value={item.name}
                  onChange={(e) => handleMenuChange(index, 'name', e.target.value)}
                  className="border border-gray-300 rounded-lg py-3 px-6 w-full"
                />
                <input
                  type="number"
                  placeholder="₱ Price"
                  required
                  value={item.price}
                  onChange={(e) => handleMenuChange(index, 'price', e.target.value)}
                  className="border border-gray-300 rounded-lg py-3 px-6 w-32"
                />
                <textarea
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleMenuChange(index, 'description', e.target.value)}
                  className="border border-gray-300 rounded-lg py-3 px-6 w-full"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleMenuImageChange(index, e.target.files[0])}
                  className="border border-gray-300 rounded-lg py-3 px-6"
                />
                <button
                  type="button"
                  onClick={() => removeMenuItem(index)}
                  className="bg-black text-white px-6 py-3 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMenuItem}
              className="bg-yellow-400 text-white px-6 py-3 rounded-lg mt-4"
            >
              + Add Menu Item
            </button>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Stall #</label>
            <input
              type="number"
              name="stallNumber"
              defaultValue={stall.stallNumber}
              className="border border-gray-300 rounded-lg w-full py-3 px-6"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Upload New Food Stall Images (Optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setNewImages([...e.target.files])}
              className="border border-gray-300 rounded-lg w-full py-3 px-6"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-pink-600 text-white px-8 py-4 rounded-lg font-semibold shadow-md hover:bg-pink-700 transition-all"
            >
              Update Food Stall
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditSpacePage;
