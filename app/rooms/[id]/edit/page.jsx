'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaChevronLeft } from 'react-icons/fa6';
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";

import { getDocumentById } from '@/app/actions/getSpace';
import updateSpace from '@/app/actions/updateSpace';

const foodTypes = [
  'Fried', 'Smoked', 'Sushi', 'BBQ', 'Rice Bowl', 'Dessert', 'Drinks', 'Egg', 'Vegan', 'Healthy', 'Coffee',
  'Samgyupsal', 'Hot Pot', 'Milk Tea', 'Milk Shake', 'Sweets', 'Pastry', 'Burger', 'Meat', 'Rice Cake',
  'Shake', 'Dish', 'Pasta', 'Fruits', 'Steamed', 'Spicy', 'Sour', 'Chocolate', 'Seafood', 'Steak',
  'Soup', 'Noodles', 'Sizzling'
];

const menuTypeOptions = ['Meals', 'Dessert', 'Snacks', 'Add-Ons', 'Drinks'];

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

export default function EditSpacePage({ params }) {
  const router = useRouter();
  const { id } = params;

  const [stall, setStall] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [otherCategory, setOtherCategory] = useState("");
  const [customCategories, setCustomCategories] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const data = await getDocumentById(id);
        if (!data) {
          toast.error('Food Stall not found.');
          router.push('/rooms/my');
          return;
        }

        setStall(data);
        setSelectedTypes(data.type || []);

        const initialMenuItems = (data.menuName || []).map((name, index) => {
          const hasSizes = !!(data.menuSmall?.[index] || data.menuMedium?.[index] || data.menuLarge?.[index]);
          
          // Check if menuSubType exists to determine if useSubType should be checked
          const existingSubType = data.menuSubType?.[index];

          return {
            name,
            price: data.menuPrice?.[index] || '',
            description: data.menuDescription?.[index] || '',
            menuType: data.menuType?.[index] || '',
            // Initialize the new field and flag
            menuSubType: existingSubType || '',
            useSubType: !!existingSubType, // Checked if there is an existing sub-type
            smallFee: data.menuSmall?.[index] || '',
            mediumFee: data.menuMedium?.[index] || '',
            largeFee: data.menuLarge?.[index] || '',
            smallChecked: !!data.menuSmall?.[index],
            mediumChecked: !!data.menuMedium?.[index],
            largeChecked: !!data.menuLarge?.[index],
            menuImage: null,
            existingImage: data.menuImages?.[index] || null,
            useSizes: hasSizes
          };
        });
        setMenuItems(initialMenuItems);
      } catch (err) {
        console.error("Failed to fetch stall data:", err);
        toast.error("Failed to load stall data.");
      }
    };

    fetchStall();
  }, [id, router]);

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
      
      // If the user unchecks the useSubType box, clear the subType text
      if (field === 'useSubType' && value === false) {
        updated[index].menuSubType = '';
      }
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
        // Include the new fields
        menuSubType: '', 
        useSubType: false,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('id', id);
    formData.append('name', e.target.name.value);
    formData.append('description', e.target.description.value);
    formData.append('stallNumber', e.target.stallNumber.value);
    formData.append('selectedTypes', JSON.stringify(selectedTypes));

    menuItems.forEach((item, index) => {
      formData.append('menuNames[]', item.name);
      formData.append('menuPrices[]', item.useSizes ? '' : item.price);
      formData.append('menuDescriptions[]', item.description);
      formData.append('menuType[]', item.menuType);
      
      // Only append menuSubType if useSubType is checked, otherwise send empty string
      const subType = item.useSubType ? item.menuSubType : '';
      formData.append('menuSubType[]', subType); 

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
    return (
      <div className="bg-neutral-900 min-h-screen text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading stall data...</p>
        </div>
      </div>
    );
  }
  
  // Logic for the label text of the stall image button
  const stallImageButtonText = newImages.length > 0 || (stall.images && stall.images.length > 0) ? "Change Image" : "Choose File";

  return (
    <div className="bg-neutral-900 min-h-screen text-white py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/rooms/my" className="flex items-center text-white hover:text-pink-500 transition duration-300 py-6">
          <FaChevronLeft className="mr-2 text-lg" />
          <span className="font-medium text-lg">Back to My Stalls</span>
        </Link>

        {/* Page Header */}
        <header className="text-center mb-10">
          <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">Details</h2>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-white leading-tight">Edit Food Stall</p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">

          {/* Stall Name & Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block font-semibold mb-2">Food Stall Name</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={stall.name}
                required
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg w-full py-3 px-4 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
              />
            </div>
            <div>
              <label htmlFor="stallNumber" className="block font-semibold mb-2">Stall #</label>
              <input
                type="number"
                id="stallNumber"
                name="stallNumber"
                defaultValue={stall.stallNumber}
                readOnly
                className="bg-neutral-800 text-white border border-neutral-700 rounded-lg w-full py-3 px-4 cursor-not-allowed opacity-75"
              />
            </div>
          </div>

          {/* Stall Description */}
          <div>
            <label htmlFor="description" className="block font-semibold mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              defaultValue={stall.description}
              required
              rows="4"
              className="bg-neutral-800 text-white border border-neutral-700 rounded-lg w-full py-3 px-4 resize-none focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block font-semibold mb-3">Select Categories</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {foodTypes.concat(customCategories).map(type => (
                <label key={type} className="flex items-center space-x-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    value={type}
                    checked={selectedTypes.includes(type)}
                    onChange={handleTypeChange}
                    className="accent-pink-500 w-4 h-4"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            {/* Add custom category input */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-neutral-300">Add a custom category:</span>
              <input
                type="text"
                placeholder="e.g., Filipino Cuisine"
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
                className="border text-neutral-200 bg-neutral-800 rounded px-3 py-2 text-sm w-full sm:w-60 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Menu Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl sm:text-2xl text-pink-600">Menu</h3>
            </div>

            <div className="space-y-6">
              {menuItems.map((item, index) => (
                <div key={index} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <h4 className="text-lg font-semibold text-white">Item {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                      <CiCircleMinus className="w-5 h-5" /> Remove Item
                    </button>
                  </div>

                  {/* Name and Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item Name"
                      required
                      value={item.name}
                      onChange={e => handleMenuChange(index, 'name', e.target.value)}
                      className="bg-neutral-900 text-white border border-neutral-700 rounded-lg py-3 px-4 w-full"
                    />
                    <select
                      value={item.menuType}
                      onChange={e => handleMenuChange(index, 'menuType', e.target.value)}
                      className="bg-neutral-900 text-white border border-neutral-700 rounded-lg py-3 px-4 w-full"
                    >
                      <option value="">Select Type</option>
                      {menuTypeOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* --- NEW SUB-TYPE CHECKBOX AND INPUT --- */}
                  <div className="border border-neutral-700 rounded-lg p-3">
                    <label className="flex items-center space-x-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={item.useSubType}
                        onChange={e => handleMenuChange(index, 'useSubType', e.target.checked)}
                        className="accent-pink-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-neutral-300">Add Menu Sub-Type (e.g., Hot/Cold, Flavor, Style)</span>
                    </label>

                    {item.useSubType && (
                      <input
                        type="text"
                        placeholder="Enter Sub-Type (e.g., Spicy, Iced, Korean Style)"
                        value={item.menuSubType}
                        onChange={e => handleMenuChange(index, 'menuSubType', e.target.value)}
                        className="mt-2 bg-neutral-900 text-white border border-neutral-700 rounded-lg py-2 px-3 w-full"
                      />
                    )}
                  </div>
                  {/* --- END NEW SUB-TYPE SECTION --- */}


                  {/* Description */}
                  <textarea
                    placeholder="Description"
                    value={item.description}
                    onChange={e => handleMenuChange(index, 'description', e.target.value)}
                    rows="2"
                    className="bg-neutral-900 text-white border border-neutral-700 rounded-lg py-3 px-4 w-full resize-none"
                  />

                  {/* Price Options */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`sizeOption-${index}`}
                          checked={!item.useSizes}
                          onChange={() => handleMenuChange(index, 'useSizes', false)}
                          className="accent-pink-500"
                        />
                        <span className="text-sm">One-Sized Price</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`sizeOption-${index}`}
                          checked={item.useSizes}
                          onChange={() => handleMenuChange(index, 'useSizes', true)}
                          className="accent-pink-500"
                        />
                        <span className="text-sm">Size Options</span>
                      </label>
                    </div>
                    
                    {/* Price Input based on selection */}
                    {!item.useSizes ? (
                      <input
                        type="number"
                        placeholder="₱ Price"
                        value={item.price}
                        onChange={e => handleMenuChange(index, 'price', e.target.value)}
                        className="bg-neutral-900 text-white border border-neutral-700 rounded-lg py-2 px-3 w-full sm:w-32"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-4">
                        {['small', 'medium', 'large'].map(size => (
                          <div key={size} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={item[`${size}Checked`]}
                              onChange={e => handleMenuChange(index, `${size}Checked`, e.target.checked)}
                              className="accent-pink-500"
                            />
                            <span className="text-xs capitalize text-neutral-400">{size}</span>
                            <input
                              type="number"
                              placeholder="Price"
                              value={item[`${size}Fee`]}
                              disabled={!item[`${size}Checked`]}
                              onChange={e => handleMenuChange(index, `${size}Fee`, e.target.value)}
                              className="bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 w-20 text-xs disabled:opacity-50"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Image Preview and Upload */}
                  <div className="flex flex-col items-start gap-4 mt-4">
                    <span className="text-sm font-medium">Menu Item Image</span>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                      {/* Image Preview */}
                      <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-neutral-700 flex-shrink-0">
                        {(item.menuImage || item.existingImage) ? (
                          <img
                            src={item.menuImage ? URL.createObjectURL(item.menuImage) : `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${item.existingImage}/view?project=${PROJECT_ID}`}
                            alt={`Menu item ${index} preview`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-neutral-900 text-neutral-500 text-center text-xs p-2">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        {/* Hidden native file input */}
                        <input
                          type="file"
                          accept="image/*"
                          id={`menuImage-${index}`}
                          onChange={e => handleMenuImageChange(index, e.target.files[0])}
                          className="hidden"
                        />
                        {/* Custom button label */}
                        <label
                          htmlFor={`menuImage-${index}`}
                          className="cursor-pointer bg-neutral-700 text-white rounded-lg py-3 px-4 text-center hover:bg-neutral-600 transition-colors duration-300 w-full"
                        >
                          {item.menuImage ? "Change New Image" : (item.existingImage ? "Change Image" : "Choose Image")}
                        </label>
                        {item.menuImage && (
                          <button
                            type="button"
                            onClick={() => handleMenuImageChange(index, null)}
                            className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
                          >
                            Undo Change
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Menu Item Button - Moved outside the loop */}
            <div className="flex justify-end items-center mt-6">
              <button
                type="button"
                onClick={addMenuItem}
                className="flex items-center gap-1 text-pink-500 hover:text-pink-400 font-semibold"
              >
                <CiCirclePlus className="w-6 h-6" /> Add New Item
              </button>
            </div>
          </div>

          {/* Stall Image/Logo Upload Section */}
          <div>
            <label className="block font-semibold mb-3">Food Stall Image/Logo</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Image Preview Container */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-lg overflow-hidden border border-neutral-700 flex-shrink-0">
                {(newImages.length > 0) ? (
                  <img
                    src={URL.createObjectURL(newImages[0])}
                    alt="New Stall Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (stall.images && stall.images.length > 0) ? (
                  <img
                    src={`https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${stall.images[0]}/view?project=${PROJECT_ID}`}
                    alt="Existing Stall Image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-neutral-800 text-neutral-500 text-center p-2">
                    No Stall Image
                  </div>
                )}
              </div>
              
              {/* Upload controls */}
              <div className="flex-1 flex flex-col gap-2 w-full sm:w-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  id="stallImage"
                  onChange={e => setNewImages(e.target.files.length > 0 ? [e.target.files[0]] : [])}
                  className="hidden"
                />
                <label
                  htmlFor="stallImage"
                  className="cursor-pointer bg-neutral-700 text-white rounded-lg py-3 px-4 text-center hover:bg-neutral-600 transition-colors duration-300 w-full"
                >
                  {stallImageButtonText}
                </label>
                {newImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewImages([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
                  >
                    Remove New Image
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-pink-600 hover:bg-pink-700 rounded-lg font-bold text-white text-lg tracking-widest transition-colors duration-300"
          >
            Update Food Stall
          </button>
        </form>
      </div>
    </div>
  );
}