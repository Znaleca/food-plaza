'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaChevronLeft } from 'react-icons/fa6';

import { getDocumentById } from '@/app/actions/getSpace';
import updateSpace from '@/app/actions/updateSpace';

const foodTypes = [
  'Fried', 'Smoked', 'Sushi', 'BBQ', 'Rice Bowl', 'Dessert', 'Drinks', 'Egg', 'Vegan', 'Healthy', 'Coffee',
  'Samgyupsal', 'Hot Pot', 'Milk Tea', 'Milk Shake', 'Sweets', 'Pastry', 'Burger', 'Meat', 'Rice Cake',
  'Shake', 'Dish', 'Pasta', 'Fruits', 'Steamed', 'Spicy', 'Sour', 'Chocolate', 'Seafood', 'Steak',
  'Soup', 'Noodles', 'Sizzling'
];

const menuTypeOptions = ['Meals', 'Dessert', 'Snacks', 'Add-Ons', 'Drinks'];

export default function EditSpacePage({ params }) {
  const router = useRouter();
  const { id } = params;

  const [stall, setStall] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [otherCategory, setOtherCategory] = useState("");
  const [customCategories, setCustomCategories] = useState([]);


  // Load stall data
  useEffect(() => {
    const fetchStall = async () => {
      const data = await getDocumentById(id);
      if (!data) return toast.error('Food Stall not found.');

      setStall(data);
      setSelectedTypes(data.type || []);

      setMenuItems((data.menuName || []).map((name, index) => {
        const hasSizes = !!(data.menuSmall?.[index] || data.menuMedium?.[index] || data.menuLarge?.[index]);
        return {
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
          useSizes: hasSizes // New toggle state
        };
      }));
    };

    fetchStall();
  }, [id]);

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedTypes(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    );
  };

  const handleMenuChange = (index, field, value) => {
    setMenuItems(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleMenuImageChange = (index, file) => {
    setMenuItems(prev => {
      const updated = [...prev];
      updated[index].menuImage = file;
      return updated;
    });
  };

  const addMenuItem = () => {
    setMenuItems(prev => [
      ...prev,
      {
        name: '',
        price: '',
        description: '',
        menuType: '',
        smallFee: '',
        mediumFee: '',
        largeFee: '',
        smallChecked: false,
        mediumChecked: false,
        largeChecked: false,
        menuImage: null,
        existingImage: null,
        useSizes: false
      }
    ]);
  };

  const removeMenuItem = (index) => {
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('id', id);
    formData.append('name', e.target.name.value);
    formData.append('description', e.target.description.value);
    formData.append('stallNumber', e.target.stallNumber.value);
    formData.append('selectedTypes', JSON.stringify(selectedTypes));

    menuItems.forEach(item => {
      formData.append('menuNames[]', item.name);
      formData.append('menuPrices[]', item.useSizes ? '' : item.price);
      formData.append('menuDescriptions[]', item.description);
      formData.append('menuType[]', item.menuType);
      formData.append('menuSmall[]', item.useSizes && item.smallChecked ? item.smallFee : '');
      formData.append('menuMedium[]', item.useSizes && item.mediumChecked ? item.mediumFee : '');
      formData.append('menuLarge[]', item.useSizes && item.largeChecked ? item.largeFee : '');
      formData.append('menuImages[]', item.menuImage || new Blob([]));
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

  if (!stall) {
    return <div className="text-center mt-10 text-white">Loading...</div>;
  }

  return (
    <div className="bg-neutral-900 min-h-screen text-white p-6">
      {/* Back Link */}
      <Link href="/rooms/my" className="flex items-center text-white hover:text-pink-500 transition duration-300 py-6">
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      {/* Page Header */}
      <div className="text-center mb-8 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">Edit Stall</h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">Edit Food Stall</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">

        {/* Stall Name */}
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
  <label className="block font-semibold mb-2">Select Category</label>
  <div className="grid grid-cols-4 gap-4">
    {foodTypes.concat(customCategories).map(type => (
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

    {/* Add custom category input */}
    <div className="flex items-center space-x-2 text-sm col-span-4">
      <span>Other:</span>
      <input
        type="text"
        placeholder="Enter custom category"
        value={otherCategory}
        onChange={(e) => setOtherCategory(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && otherCategory.trim() !== "") {
            const newCategory = otherCategory.trim();
            if (!customCategories.includes(newCategory) && !foodTypes.includes(newCategory)) {
              setCustomCategories(prev => [...prev, newCategory]);
              setSelectedTypes(prev => [...prev, newCategory]);
            }
            setOtherCategory("");
            e.preventDefault();
          }
        }}
        className="border text-black rounded px-2 py-1 text-sm w-44"
      />
    </div>
  </div>
</div>


        {/* Stall Description */}
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
          <label className="block font-semibold mb-4 text-lg">Menu</label>

          {menuItems.map((item, index) => (
            <div
              key={index}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4 mb-6 shadow-md"
            >
              {/* Name */}
              <input
                type="text"
                placeholder="Item Name"
                required
                value={item.name}
                onChange={e => handleMenuChange(index, 'name', e.target.value)}
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg py-3 px-6 w-full"
              />

              {/* Description */}
              <textarea
                placeholder="Description"
                value={item.description}
                onChange={e => handleMenuChange(index, 'description', e.target.value)}
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg py-3 px-6 w-full"
              />

              {/* Menu Type */}
              <select
                value={item.menuType}
                onChange={e => handleMenuChange(index, 'menuType', e.target.value)}
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg py-3 px-6 w-full md:w-40"
              >
                <option value="">Select Type</option>
                {menuTypeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Toggle for size or one price */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`sizeOption-${index}`}
                    checked={!item.useSizes}
                    onChange={() => handleMenuChange(index, 'useSizes', false)}
                    className="accent-pink-500"
                  />
                  One-Sized Price
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`sizeOption-${index}`}
                    checked={item.useSizes}
                    onChange={() => handleMenuChange(index, 'useSizes', true)}
                    className="accent-pink-500"
                  />
                  Size Options
                </label>
              </div>

              {/* One-Sized Price */}
              {!item.useSizes && (
                <input
                  type="number"
                  placeholder="₱ Price"
                  value={item.price}
                  onChange={e => handleMenuChange(index, 'price', e.target.value)}
                  className="bg-neutral-800 text-white border border-neutral-700 rounded-lg py-3 px-6 w-32"
                />
              )}

              {/* Size Options */}
              {item.useSizes && (
                <div className="flex flex-wrap gap-6">
                  {['small', 'medium', 'large'].map(size => (
                    <div key={size} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item[`${size}Checked`]}
                        onChange={e => handleMenuChange(index, `${size}Checked`, e.target.checked)}
                        className="accent-pink-500"
                      />
                      <span className="text-xs capitalize">{size}</span>
                      <input
                        type="number"
                        placeholder="Price"
                        value={item[`${size}Fee`]}
                        disabled={!item[`${size}Checked`]}
                        onChange={e => handleMenuChange(index, `${size}Fee`, e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg py-2 px-3 w-20 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Image & Remove */}
              <div className="flex flex-wrap gap-4 items-center">
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
            </div>
          ))}

          {/* Add Menu Item */}
          <button
            type="button"
            onClick={addMenuItem}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg mt-2"
          >
            + Add Menu Item
          </button>
        </div>

       {/* Stall Number */}
<div>
  <label className="block font-semibold mb-2">Stall #</label>
  <input
    type="number"
    name="stallNumber"
    defaultValue={stall.stallNumber}
    readOnly
    className="bg-neutral-800 text-white border border-neutral-700 rounded-lg w-full py-3 px-6 cursor-not-allowed opacity-75"
  />
</div>



        {/* Upload Images */}
        <div>
          <label className="block font-semibold mb-2">Upload Food Stall Image/Logo</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setNewImages([...e.target.files])}
            className="bg-neutral-800 text-white border border-neutral-700 rounded-lg w-full py-3 px-6"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 bg-pink-600 hover:bg-pink-700 rounded-lg font-bold text-white text-xl tracking-widest"
        >
          Update Food Stall
        </button>
      </form>
    </div>
  );
}
