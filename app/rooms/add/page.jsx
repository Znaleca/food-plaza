'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import createSpaces from '@/app/actions/createSpaces';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';

const foodTypes = [
  'Fried','Smoked','Sushi','BBQ','Rice Bowl','Dessert','Drinks','Egg',
  'Vegan','Healthy','Coffee','Samgyupsal','Hot Pot','Milk Tea','Milk Shake',
  'Sweets','Pastry','Burger','Meat','Rice Cake','Shake','Dish','Pasta',
  'Fruits','Steamed','Spicy','Sour','Chocolate','Seafood','Steak','Soup',
  'Noodles','Sizzling',
];

const menuType = ['Meals','Dessert','Snacks','Add-ons','Drinks'];

function AddSpacePage() {
  const [state, formAction] = useFormState(createSpaces, {});
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState([]);

  const blankItem = {
    name: '', price: '', description: '', menuImage: null, menuType: '',
    smallChecked: false, smallFee: '',
    mediumChecked: false, mediumFee: '',
    largeChecked: false, largeFee: '',
  };
  const [menuItems, setMenuItems] = useState([blankItem]);

  /* ----- toast / redirect ----- */
  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success('Food Stall added successfully!');
      router.push('/rooms/my');
    }
  }, [state, router]);

  /* ---- handlers ---- */
  const handleTypeChange = ({ target:{ value, checked } }) =>
    setSelectedTypes((prev) => checked ? [...prev, value] : prev.filter((t)=>t!==value));

  const changeItem = (idx, changes) =>
    setMenuItems((prev) => prev.map((it,i)=>i===idx ? {...it, ...changes} : it));

  const addMenuItem    = () => setMenuItems((prev) => [...prev, blankItem]);
  const removeMenuItem = (idx)  => setMenuItems((prev) => prev.filter((_,i)=>i!==idx));

  /* ---- submit ---- */
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    menuItems.forEach((it) => {
      fd.append('menuDescriptions[]', it.description);
      fd.append('menuType[]',         it.menuType);

      // size fees
      fd.append('menuSmall[]',  it.smallChecked  ? it.smallFee  : '');
      fd.append('menuMedium[]', it.mediumChecked ? it.mediumFee : '');
      fd.append('menuLarge[]',  it.largeChecked  ? it.largeFee  : '');

      // image
      fd.append('menuImages[]',
        it.menuImage && it.menuImage.size > 0 ? it.menuImage : new Blob([]));
    });

    formAction(fd);
  };

  /* ---- UI ---- */
  return (
    <div className="bg-neutral-900 min-h-screen text-white p-6">
      <Link href="/foodstall"
        className="flex items-center text-white hover:text-pink-500 transition duration-300 py-6">
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      <div className="text-center mb-8 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">
          Add Stall
        </h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold leading-tight">
          Add a Food Stall
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
        {/* stall name */}
        <div>
          <label className="block font-semibold mb-2">Food Stall Name</label>
          <input type="text" name="name" required
            className="bg-neutral-800 border border-neutral-700 rounded-lg w-full py-3 px-6" />
        </div>

        {/* types */}
        <div>
          <label className="block font-semibold mb-2">Type</label>
          <div className="grid grid-cols-4 gap-4">
            {foodTypes.map((t)=>(
              <label key={t} className="flex items-center space-x-2 text-sm">
                <input type="checkbox" value={t} onChange={handleTypeChange}
                  className="accent-pink-500"/>
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>
        <input type="hidden" name="selectedTypes" value={JSON.stringify(selectedTypes)} />

        {/* description */}
        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea name="description" required
            className="bg-neutral-800 border border-neutral-700 rounded-lg w-full h-32 py-3 px-6" />
        </div>

        {/* menu items */}
        <div>
          <label className="block font-semibold mb-2">Menu</label>

          {menuItems.map((item, idx) => (
            <div key={idx} className="flex flex-wrap gap-4 mb-8 items-start">
              {/* name */}
              <input type="text" placeholder="Item Name" required value={item.name}
                onChange={(e)=>changeItem(idx,{name:e.target.value})}
                className="bg-neutral-800 border border-neutral-700 rounded-lg py-3 px-6 flex-1 min-w-[150px]"
                name="menuNames" />

              {/* base price */}
              <input type="number" placeholder="₱ Price" required value={item.price}
                onChange={(e)=>changeItem(idx,{price:e.target.value})}
                className="bg-neutral-800 border border-neutral-700 rounded-lg py-3 px-6 w-32"
                name="menuPrices" />

              {/* description */}
              <input type="text" placeholder="Description" value={item.description}
                onChange={(e)=>changeItem(idx,{description:e.target.value})}
                className="bg-neutral-800 border border-neutral-700 rounded-lg py-3 px-6 flex-1 min-w-[150px]"
                name="menuDescriptions" />

              {/* type */}
              <select value={item.menuType}
                onChange={(e)=>changeItem(idx,{menuType:e.target.value})}
                className="bg-neutral-800 border border-neutral-700 rounded-lg py-3 px-6 w-40"
                name="menuType">
                <option value="">Select Type</option>
                {menuType.map((t)=><option key={t} value={t}>{t}</option>)}
              </select>

              {/* size & fee block */}
              {['small','medium','large'].map((key) => {
                const label = key[0].toUpperCase() + key.slice(1); // Small/Medium/Large
                const checkedKey = `${key}Checked`;
                const feeKey = `${key}Fee`;
                return (
                  <div key={key} className="flex items-center space-x-2">
                    <input type="checkbox"
                      checked={item[checkedKey]}
                      onChange={(e)=>changeItem(idx,{[checkedKey]:e.target.checked})}
                      className="accent-pink-500" />
                    <span className="text-xs">{label}</span>
                    <input
                      type="number"
                      placeholder="Price"
                      value={item[feeKey]}
                      disabled={!item[checkedKey]}
                      onChange={(e)=>changeItem(idx,{[feeKey]:e.target.value})}
                      className="bg-neutral-800 border border-neutral-700 rounded-lg py-2 px-3 w-20 text-xs"
                    />
                  </div>
                );
              })}

              {/* image */}
              <input type="file" accept="image/*"
                onChange={(e)=>changeItem(idx,{menuImage:e.target.files[0]})}
                className="bg-neutral-800 border border-neutral-700 rounded-lg py-3 px-6" />

              {/* remove */}
              <button type="button" onClick={()=>removeMenuItem(idx)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg h-fit">
                Remove
              </button>
            </div>
          ))}

          {/* add item */}
          <button type="button" onClick={addMenuItem}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg mt-2">
            + Add Menu Item
          </button>
        </div>

        {/* stall # */}
        <div>
          <label className="block font-semibold mb-2">Stall #</label>
          <input type="number" name="stallNumber"
            className="bg-neutral-800 border border-neutral-700 rounded-lg w-full py-3 px-6" />
        </div>

        {/* stall images */}
        <div>
          <label className="block font-semibold mb-2">Upload Food Stall Image</label>
          <input type="file" name="images" multiple accept="image/*"
            className="bg-neutral-800 border border-neutral-700 rounded-lg w-full py-3 px-6" />
        </div>

        {/* submit */}
        <div className="flex justify-center">
          <button type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg font-semibold shadow-md transition-all">
            Save Food Stall
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddSpacePage;
