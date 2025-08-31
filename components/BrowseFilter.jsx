'use client';

import clsx from 'clsx';

const menuCategories = ['All', 'Drinks', 'Add-Ons', 'Meals', 'Snacks', 'Dessert'];
const stallCategories = [
  'All','Fried','Smoked','Sushi','BBQ','Rice Bowl','Dessert','Drinks','Egg',
  'Vegan','Healthy','Coffee','Samgyupsal','Hot Pot','Milk Tea','Milk Shake',
  'Sweets','Pastry','Burger','Meat','Rice Cake','Shake','Dish','Pasta',
  'Fruits','Steamed','Spicy','Sour','Chocolate','Seafood','Steak','Soup',
  'Noodles','Sizzling',
];

const displayTypes = ['Menus', 'Stalls'];

const BrowseFilter = ({ activeCategory, onChange, activeDisplayType, onDisplayTypeChange }) => {
  const categoriesToDisplay = activeDisplayType === 'Menus' ? menuCategories : stallCategories;

  return (
    <div className="relative">
      {/* Main Vertical Line */}
      <div className="absolute left-0 top-0 h-full w-[2px] bg-neutral-700 rounded-full"></div>

      <div className="flex flex-col items-start gap-4 pl-4">

        {/* Display Type Section */}
        <h4 className="text-xl font-bold text-white mb-2 -ml-1">View</h4>
        {displayTypes.map((type) => (
          <div key={type}>
            <div
              onClick={() => onDisplayTypeChange(type)}
              className={clsx(
                "relative cursor-pointer transition-colors duration-300",
                "before:absolute before:h-full before:top-0 before:left-[-18px] before:rounded-full before:transition-all before:duration-300",
                {
                  "text-white font-semibold before:w-[6px] before:bg-pink-500": activeDisplayType === type,
                  "text-neutral-400 hover:text-white before:w-[4px] before:bg-transparent hover:before:bg-neutral-500": activeDisplayType !== type,
                }
              )}
            >
              {type}
            </div>
          </div>
        ))}

        <div className="w-16 h-[2px] bg-neutral-700 mt-4 rounded-full"></div>

        {/* Categories Section */}
        <h4 className="text-xl font-bold text-white mb-2 -ml-1">Categories</h4>
        {categoriesToDisplay.map((cat, index) => (
          <div key={cat}>
            <div
              onClick={() => onChange(cat)}
              className={clsx(
                "relative cursor-pointer transition-colors duration-300",
                "before:absolute before:h-full before:top-0 before:left-[-18px] before:rounded-full before:transition-all before:duration-300",
                {
                  "text-white font-semibold before:w-[6px] before:bg-pink-500": activeCategory === cat,
                  "text-neutral-400 hover:text-white before:w-[4px] before:bg-transparent hover:before:bg-neutral-500": activeCategory !== cat,
                }
              )}
            >
              {cat}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseFilter;