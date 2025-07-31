'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getDocumentById } from '@/app/actions/getSpace';
import updateSpace from '@/app/actions/updateSpace';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';

const foodTypes = [
  'Fried', 'Smoked', 'Sushi', 'BBQ', 'Rice Bowl', 'Dessert',
  'Drinks', 'Egg', 'Vegan', 'Healthy', 'Coffee',
  'Samgyupsal', 'Hot Pot', 'Milk Tea', 'Milk Shake', 'Sweets',
  'Pastry', 'Burger', 'Meat', 'Rice Cake', 'Shake', 'Dish', 'Pasta', 'Fruits',
  'Steamed', 'Spicy', 'Sour', 'Chocolate', 'Seafood',
  'Steak', 'Soup', 'Noodles', 'Sizzling'
];

const menuTypeOptions = ['Meals', 'Dessert', 'Snacks', 'Add-Ons', 'Drinks'];

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
      if (!data) {
        toast.error('Food Stall not found.');
        return;
      }
      setStall(data);
      setSelectedTypes(data.type || []);
      setMenuItems(
        (data.menuName || []).map((name, index) => ({
          name,
          price: data.menuPrice?.[index] || '',
          description: data.menuDescription?.[index] || '',
          menuType: data.menuType?.[index] || '',
          smallFee: data.menuSmall?.[index] || '',
          mediumFee: data.menuMedium?.[index] || '',
          largeFee: data.menuLarge?.[index] || '',
          smallChecked: !!data.menuSmall?.[index],
          mediumChecked: !!data.menuMedium?.[index],
          largeChecked: !!data.menuLarge?.[index],
          menuImage: null,
          existingImage: data.menuImages?.[index] || null,
        }))
      );
    };
    fetchStall();
  }, [id]);

  const handleTypeChange = (e) => {
    const { value, checked } = e.target;
    setSelectedTypes(prev =>
      checked ? [...prev, value] : prev.filter(type => type !== value)
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
    setMenuItems([...menuItems, {
      name: '', price: '', description: '', menuType: '',
      smallFee: '', mediumFee: '', largeFee: '',
      smallChecked: false, mediumChecked: false, largeChecked: false,
      menuImage: null, existingImage: null
    }]);
  };

  const removeMenuItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    formData.append('id', id);
    formData.append('selectedTypes', JSON.stringify(selectedTypes));

    menuItems.forEach(item => {
      formData.append('menuNames', item.name);
      formData.append('menuPrices', item.price);
      formData.append('menuDescriptions', item.description);
      formData.append('menuType[]', item.menuType);
      formData.append('menuSmall[]', item.smallChecked ? item.smallFee : '');
      formData.append('menuMedium[]', item.mediumChecked ? item.mediumFee : '');
      formData.append('menuLarge[]', item.largeChecked ? item.largeFee : '');
      if (item.menuImage) formData.append('menuImages[]', item.menuImage);
      else formData.append('menuImages[]', new Blob([]));
      formData.append('existingMenuImages[]', item.existingImage || '');
    });

    newImages.forEach(img => formData.append('images', img));

    const result = await updateSpace(null, formData);
    if (result.success) {
      toast.success('Food Stall updated!');
      router.push('/rooms/my');
    } else {
      toast.error(result.error);
    }
  };

  if (!stall) return <div className="text-center mt-10 text-white">Loading...</div>;

  return (
    <div className="bg-neutral-900 min-h-screen text-white p-6">
      <Link
        href="/rooms/my"
        className="flex items-center text-white hover:text-pink-500 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      <div className="text-center mb-8 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">Edit Stall</h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">Edit Food Stall</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
        <div>
          <label className="block font-semibold mb-2">Food Stall Name</label>
          <input
            type="text"
            name="name"
            defaultValue={stall.name}
            required
            className="bg-neutral-800 text-white border border-neutral-700 rounded-lg w-full py-3 px-6"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Type</label>
          <div className="grid grid-cols-4 gap-4">
            {foodTypes.map(type => (
              <label key={type} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  value={type}
                  checked={selectedTypes.includes(type)}
                  onChange={handleTypeChange}
                  className="accent-pink-500"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <input type="hidden" name="selectedTypes" value={JSON.stringify(selectedTypes)} />

        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            name="description"
            defaultValue={stall.description}
            required
            className="bg-neutral-800 text-white border border-neutral-700 rounded-lg w-full h-32 py-3 px-6"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Menu</label>
          {menuItems.map((item, index) => (
            <div key={index} className="flex flex-wrap gap-4 mb-4 items-center">
              <input
                type="text"
                name="menuNames"
                placeholder="Item Name"
                required
                value={item.name}
                onChange={e => handleMenuChange(index, 'name', e.target.value)}
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg py-3 px-6 flex-1 min-w-[150px]"
              />
              <input
                type="number"
                name="menuPrices"
                placeholder="₱ Price"
                required
                value={item.price}
                onChange={e => handleMenuChange(index, 'price', e.target.value)}
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg py-3 px-6 w-32"
              />
              <input
                type="text"
                name="menuDescriptions"
                placeholder="Description"
                value={item.description}
                onChange={e => handleMenuChange(index, 'description', e.target.value)}
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg py-3 px-6 flex-1 min-w-[150px]"
              />
              <select
                value={item.menuType}
                onChange={(e) => handleMenuChange(index, 'menuType', e.target.value)}
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg py-3 px-6 w-40"
              >
                <option value="">Select Type</option>
                {menuTypeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {['small', 'medium', 'large'].map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item[`${size}Checked`]}
                    onChange={(e) => handleMenuChange(index, `${size}Checked`, e.target.checked)}
                    className="accent-pink-500"
                  />
                  <span className="text-xs">{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                  <input
                    type="number"
                    placeholder="Price"
                    value={item[`${size}Fee`]}
                    disabled={!item[`${size}Checked`]}
                    onChange={(e) => handleMenuChange(index, `${size}Fee`, e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 rounded-lg py-2 px-3 w-20 text-xs"
                  />
                </div>
              ))}
              <input
                type="file"
                accept="image/*"
                onChange={e => handleMenuImageChange(index, e.target.files[0])}
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg py-3 px-6"
              />
              <button
                type="button"
                onClick={() => removeMenuItem(index)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMenuItem}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg mt-2"
          >
            + Add Menu Item
          </button>
        </div>

        <div>
          <label className="block font-semibold mb-2">Stall #</label>
          <input
            type="number"
            name="stallNumber"
            defaultValue={stall.stallNumber}
            className="bg-neutral-800 text-white border border-neutral-700 rounded-lg w-full py-3 px-6"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Upload New Food Stall Images (Optional)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setNewImages([...e.target.files])}
            className="bg-neutral-800 text-white border border-neutral-700 rounded-lg w-full py-3 px-6"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-pink-600 hover:bg-pink-700 rounded-lg font-bold text-white text-xl tracking-widest"
        >
          Update Food Stall
        </button>
      </form>
    </div>
  );
};

export default EditSpacePage;
