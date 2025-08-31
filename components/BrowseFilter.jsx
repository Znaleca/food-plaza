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
    <div className="relative w-64">
      {/* Vertical lines (left + right) */}
      <div className="absolute left-0 top-0 h-full w-[2px] bg-neutral-700 rounded-full" />
      <div className="absolute right-0 top-0 h-full w-[2px] bg-neutral-700 rounded-full pointer-events-none" />

      <div className="flex flex-col items-start gap-6 px-6 py-4">
        
        {/* Display Type */}
        <div className="w-full">
          <h4 className="text-sm uppercase tracking-wide text-neutral-400 mb-3">View</h4>
          <div className="flex flex-col gap-2">
            {displayTypes.map((type) => (
              <button
                key={type}
                onClick={() => onDisplayTypeChange(type)}
                className={clsx(
                  "relative text-left transition-all duration-300 px-2 py-1 rounded-lg w-full",
                  "before:absolute before:left-[-22px] before:top-0 before:h-full before:rounded-full before:transition-all",
                  {
                    "text-white font-semibold bg-neutral-700/40 hover:bg-neutral-700/60 before:w-[6px] before:bg-pink-500":
                      activeDisplayType === type,
                    "text-neutral-400 hover:text-white hover:bg-neutral-800/50 before:w-[4px] before:bg-transparent hover:before:bg-neutral-600":
                      activeDisplayType !== type,
                  }
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-neutral-700 rounded-full" />

        {/* Categories */}
        <div className="w-full">
          <h4 className="text-sm uppercase tracking-wide text-neutral-400 mb-3">Categories</h4>

          {/* Combined list including "All" */}
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {categoriesToDisplay.map((cat) => (
              <button
                key={cat}
                onClick={() => onChange(cat)}
                className={clsx(
                  "relative text-left transition-all duration-300 px-2 py-1 rounded-lg w-full",
                  "before:absolute before:left-[-22px] before:top-0 before:h-full before:rounded-full before:transition-all",
                  {
                    "text-white font-semibold bg-neutral-700/40 hover:bg-neutral-700/60 before:w-[6px] before:bg-pink-500":
                      activeCategory === cat,
                    "text-neutral-400 hover:text-white hover:bg-neutral-800/50 before:w-[4px] before:bg-transparent hover:before:bg-neutral-600":
                      activeCategory !== cat,
                  }
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom scrollbar styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #404040; /* same as line (neutral-700) */
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #a3a3a3; /* neutral thumb */
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #d4d4d4;
        }
      `}</style>
    </div>
  );
};

export default BrowseFilter;