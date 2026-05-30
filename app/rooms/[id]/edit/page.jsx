'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaChevronLeft, FaEdit } from 'react-icons/fa';
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

export default function EditSpacePage() {
  const router = useRouter();
  const { id } = useParams();

  const [stall, setStall] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [otherCategory, setOtherCategory] = useState("");
  const [customCategories, setCustomCategories] = useState([]);
  const [showImageControls, setShowImageControls] = useState(false);

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
        
        const initialCustomCategories = (data.type || []).filter(t => !foodTypes.includes(t));
        setCustomCategories(initialCustomCategories);

        const initialMenuItems = (data.menuName || []).map((name, index) => {
          const hasSizes = !!(data.menuSmall?.[index] || data.menuMedium?.[index] || data.menuLarge?.[index]);
          const existingSubType = data.menuSubType?.[index];

          return {
            name,
            price: data.menuPrice?.[index] || '',
            description: data.menuDescription?.[index] || '',
            menuType: data.menuType?.[index] || '',
            menuSubType: existingSubType || '',
            useSubType: !!existingSubType,
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

  const handleAddCustomCategory = () => {
    const newCategory = otherCategory.trim();
    if (newCategory !== "" && !customCategories.includes(newCategory) && !foodTypes.includes(newCategory)) {
      setCustomCategories(prev => [...prev, newCategory]);
      setSelectedTypes(prev => [...prev, newCategory]);
      setOtherCategory("");
    }
  };

  const handleRemoveCustomCategory = (categoryToRemove) => {
    setCustomCategories(prev => prev.filter(cat => cat !== categoryToRemove));
    setSelectedTypes(prev => prev.filter(t => t !== categoryToRemove));
  };

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
      <div className="flex min-h-screen items-center justify-center bg-white p-6 text-neutral-950">
        <div className="border-4 border-black bg-white px-8 py-6 text-center shadow-[8px_8px_0px_#000]">
          <p className="text-base font-black uppercase tracking-[0.14em] text-red-600">Loading Stall Data...</p>
        </div>
      </div>
    );
  }
  
  const stallImageButtonText = newImages.length > 0 || (stall.images && stall.images.length > 0) ? "Change Image" : "Choose File";

  const stallImageUrl = newImages.length > 0
    ? URL.createObjectURL(newImages[0])
    : (stall.images && stall.images.length > 0
      ? `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${stall.images[0]}/view?project=${PROJECT_ID}`
      : null
    );

  return (
    <div className="min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white px-0 py-4 md:py-6">
      <div className="w-full">
        {/* Back Link - Increased py to 4 for slightly less space */}
        <Link href="/rooms/my" className="inline-flex items-center border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-900 transition hover:bg-black hover:text-white">
          <FaChevronLeft className="mr-2 text-sm" />
          <span>Back to My Stalls</span>
        </Link>

        {/* Page Header - Increased mb for separation */}
        <header className="mt-5 border-4 border-black bg-white px-5 py-8 shadow-[10px_10px_0px_#000] md:px-8 md:py-10">
          <h2 className="text-xs font-black uppercase tracking-[0.35em] text-red-600">Stall Details</h2>
          <p className="mt-3 text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">Edit Food Stall</p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6 w-full">

          {/* Food Stall Banner/Logo Section */}
          <div className="relative overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0px_#000]">
            <label className="block border-b-2 border-black bg-neutral-100 p-4 text-xs font-black uppercase tracking-[0.14em] text-neutral-800">Food Stall Banner / Logo</label>
            
            {/* Edit Icon */}
            <button
              type="button"
              onClick={() => setShowImageControls(!showImageControls)}
              className="absolute right-4 top-4 z-10 border-2 border-black bg-red-600 p-2 text-white shadow-[3px_3px_0px_#000] transition hover:bg-black"
              aria-label="Edit banner image"
            >
              <FaEdit className="w-5 h-5" />
            </button>

            {/* Image Preview Container (Banner style) */}
            <div className="relative flex h-48 w-full items-center justify-center bg-neutral-100 sm:h-64">
              {stallImageUrl ? (
                <img
                  src={stallImageUrl}
                  alt="Stall Banner Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-4 text-center text-xs font-black uppercase tracking-[0.12em] text-neutral-600">
                  No Stall Image Selected (Recommended: wide banner image)
                </div>
              )}
              
              {/* Overlay with Controls (Conditional visibility) */}
              {showImageControls && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/65 p-4">
                  <div className="flex flex-col gap-3 w-full max-w-sm">
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
                      className="cursor-pointer border-2 border-black bg-red-600 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white shadow-[4px_4px_0px_#000] transition hover:bg-black hover:shadow-[2px_2px_0px_#000] hover:translate-y-[2px]"
                    >
                      {stallImageButtonText}
                    </label>
                    {(newImages.length > 0 || (stall.images && stall.images.length > 0)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewImages([]);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-red-600 transition hover:bg-black hover:text-white"
                      >
                        Remove Current Image
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* End Food Stall Banner/Logo Section */}

          {/* Stall Name & Number */}
          <div className="mb-8 grid grid-cols-1 gap-6 border-4 border-black bg-white p-5 shadow-[8px_8px_0px_#000] md:grid-cols-2 md:p-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-neutral-700">Food Stall Name</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={stall.name}
                required
                className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium text-neutral-950 outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label htmlFor="stallNumber" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-neutral-700">Stall #</label>
              <input
                type="number"
                id="stallNumber"
                name="stallNumber"
                defaultValue={stall.stallNumber}
                readOnly
                className="w-full cursor-not-allowed border-2 border-black bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700"
              />
            </div>
          </div>

          {/* Stall Description */}
          <div className="mb-8 border-4 border-black bg-white p-5 shadow-[8px_8px_0px_#000] md:p-6">
            <label htmlFor="description" className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-neutral-700">Description</label>
            <textarea
              id="description"
              name="description"
              defaultValue={stall.description}
              required
              rows="4"
              className="w-full resize-none border-2 border-black bg-white px-4 py-3 text-sm text-neutral-950 outline-none focus:border-red-600"
            />
          </div>

          {/* Categories */}
          <div className="mb-8 border-4 border-black bg-white p-5 shadow-[8px_8px_0px_#000] md:p-6">
            <label className="mb-3 block text-xs font-black uppercase tracking-[0.14em] text-neutral-700">Select Categories</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {foodTypes.concat(customCategories).map(type => (
                <label key={type} className="flex items-center gap-2 border-2 border-black bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-900">
                  <input
                    type="checkbox"
                    value={type}
                    checked={selectedTypes.includes(type)}
                    onChange={handleTypeChange}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 border-2 border-black bg-neutral-50 p-4">
              <label htmlFor="customCategoryInput" className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-neutral-700">Add Custom Category</label>
              <div className="flex gap-2">
                <input
                  id="customCategoryInput"
                  type="text"
                  placeholder="e.g., Filipino Cuisine, Comfort Food"
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomCategory();
                      e.preventDefault();
                    }
                  }}
                  className="flex-grow border-2 border-black bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-red-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="whitespace-nowrap border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[3px_3px_0px_#000] transition hover:bg-black hover:shadow-[1px_1px_0px_#000] hover:translate-y-[2px] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none disabled:translate-y-0"
                  disabled={otherCategory.trim() === "" || customCategories.includes(otherCategory.trim()) || foodTypes.includes(otherCategory.trim())}
                >
                  Add
                </button>
              </div>

              {customCategories.length > 0 && (
                <div className="mt-4 border-t-2 border-black pt-3">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-neutral-700">Current Custom Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {customCategories.map(category => (
                      <span key={category} className="flex items-center border-2 border-black bg-white px-3 py-1 text-xs font-bold text-neutral-900">
                        {category}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomCategory(category)}
                          className="ml-2 text-red-600 hover:text-black font-black leading-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Menu Items Section */}
          <div className="mb-10 border-4 border-black bg-white p-5 shadow-[8px_8px_0px_#000] md:p-6">
            <div className="flex justify-between items-center mb-6"> {/* Increased mb for section header */}
              <h3 className="text-2xl font-black uppercase tracking-[0.16em] text-red-600">Menu</h3>
            </div>

            <div className="space-y-8"> {/* Increased space-y for menu items */}
              {menuItems.map((item, index) => (
                <div key={index} className="space-y-4 border-3 border-black bg-neutral-50 p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <h4 className="text-base font-black uppercase tracking-[0.1em] text-neutral-950 md:text-lg">Item {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      className="flex items-center gap-1 border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-red-600 transition hover:bg-black hover:text-white"
                    >
                      <CiCircleMinus className="w-5 h-5" /> Remove Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item Name"
                      required
                      value={item.name}
                      onChange={e => handleMenuChange(index, 'name', e.target.value)}
                      className="w-full border-2 border-black bg-white px-4 py-3 text-sm text-neutral-950 outline-none focus:border-red-600"
                    />
                    <select
                      value={item.menuType}
                      onChange={e => handleMenuChange(index, 'menuType', e.target.value)}
                      className="w-full border-2 border-black bg-white px-4 py-3 text-sm text-neutral-950 outline-none focus:border-red-600"
                    >
                      <option value="">Select Type</option>
                      {menuTypeOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="border-2 border-black bg-white p-3">
                    <label className="flex items-center space-x-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={item.useSubType}
                        onChange={e => handleMenuChange(index, 'useSubType', e.target.checked)}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="text-sm font-semibold text-neutral-800">Add Menu Sub-Type (e.g., Hot/Cold, Flavor, Style)</span>
                    </label>

                    {item.useSubType && (
                      <input
                        type="text"
                        placeholder="Enter Sub-Type (e.g., Spicy, Iced, Korean Style)"
                        value={item.menuSubType}
                        onChange={e => handleMenuChange(index, 'menuSubType', e.target.value)}
                        className="mt-2 w-full border-2 border-black bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-red-600"
                      />
                    )}
                  </div>

                  <textarea
                    placeholder="Description"
                    value={item.description}
                    onChange={e => handleMenuChange(index, 'description', e.target.value)}
                    rows="2"
                    className="w-full resize-none border-2 border-black bg-white px-4 py-3 text-sm text-neutral-950 outline-none focus:border-red-600"
                  />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`sizeOption-${index}`}
                          checked={!item.useSizes}
                          onChange={() => handleMenuChange(index, 'useSizes', false)}
                          className="accent-red-600"
                        />
                        <span className="text-sm">One-Sized Price</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`sizeOption-${index}`}
                          checked={item.useSizes}
                          onChange={() => handleMenuChange(index, 'useSizes', true)}
                          className="accent-red-600"
                        />
                        <span className="text-sm">Size Options</span>
                      </label>
                    </div>
                    
                    {!item.useSizes ? (
                      <input
                        type="number"
                        placeholder="₱ Price"
                        value={item.price}
                        onChange={e => handleMenuChange(index, 'price', e.target.value)}
                        className="w-full border-2 border-black bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-red-600 sm:w-32"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-4">
                        {['small', 'medium', 'large'].map(size => (
                          <div key={size} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={item[`${size}Checked`]}
                              onChange={e => handleMenuChange(index, `${size}Checked`, e.target.checked)}
                              className="accent-red-600"
                            />
                            <span className="text-xs font-bold uppercase text-neutral-700">{size}</span>
                            <input
                              type="number"
                              placeholder="Price"
                              value={item[`${size}Fee`]}
                              disabled={!item[`${size}Checked`]}
                              onChange={e => handleMenuChange(index, `${size}Fee`, e.target.value)}
                              className="w-20 border-2 border-black bg-white px-3 py-2 text-xs text-neutral-950 outline-none focus:border-red-600 disabled:opacity-50"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-4 pt-2">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-neutral-700">Menu Item Image</span>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                      <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden border-2 border-black bg-white">
                        {(item.menuImage || item.existingImage) ? (
                          <img
                            src={item.menuImage ? URL.createObjectURL(item.menuImage) : `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${item.existingImage}/view?project=${PROJECT_ID}`}
                            alt={`Menu item ${index} preview`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral-100 p-2 text-center text-xs font-bold text-neutral-600">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          id={`menuImage-${index}`}
                          onChange={e => handleMenuImageChange(index, e.target.files[0])}
                          className="hidden"
                        />
                        <label
                          htmlFor={`menuImage-${index}`}
                          className="w-full cursor-pointer border-2 border-black bg-white px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-neutral-900 transition hover:bg-black hover:text-white"
                        >
                          {item.menuImage ? "Change New Image" : (item.existingImage ? "Change Image" : "Choose Image")}
                        </label>
                        {item.menuImage && (
                          <button
                            type="button"
                            onClick={() => handleMenuImageChange(index, null)}
                            className="border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-black"
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
            
            <div className="flex justify-end items-center mt-6">
              <button
                type="button"
                onClick={addMenuItem}
                className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-red-600 transition hover:bg-black hover:text-white"
              >
                <CiCirclePlus className="w-6 h-6" /> Add New Item
              </button>
            </div>
          </div>
          
          {/* Submit - Increased py for a larger button */}
          <button
            type="submit"
            className="w-full border-4 border-black bg-red-600 px-4 py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[8px_8px_0px_#000] transition hover:translate-y-[2px] hover:bg-black hover:shadow-[4px_4px_0px_#000]"
          >
            Update Food Stall
          </button>
        </form>
      </div>
    </div>
  );
}