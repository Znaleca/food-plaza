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
    <div className="relative selection:bg-red-600 selection:text-white">
      {/* Structural Vertical Line - Now 4px Black to match your section dividers */}
      <div className="absolute left-0 top-0 h-full w-[4px] bg-neutral-950"></div>

      <div className="flex flex-col items-start gap-3 pl-6">

        {/* Display Type Section */}
        <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">View By</h4>
        {displayTypes.map((type) => (
          <button
            key={type}
            onClick={() => onDisplayTypeChange(type)}
            className={clsx(
              "relative text-left text-lg font-black uppercase transition-all duration-200 tracking-tighter",
              "before:absolute before:h-full before:top-0 before:left-[-28px] before:transition-all before:duration-300",
              {
                "text-neutral-950 before:w-[8px] before:bg-red-600": activeDisplayType === type,
                "text-neutral-300 hover:text-neutral-950 before:w-[0px] before:bg-transparent": activeDisplayType !== type,
              }
            )}
          >
            {type}
          </button>
        ))}

        {/* Divider - Clean and Heavy */}
        <div className="w-full h-[4px] bg-neutral-950 my-6"></div>

        {/* Categories Section */}
        <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Categories</h4>
        <div className="flex flex-col gap-2 w-full">
          {categoriesToDisplay.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={clsx(
                "relative text-left text-md font-bold uppercase transition-all duration-200",
                "before:absolute before:h-[80%] before:top-[10%] before:left-[-28px] before:transition-all before:duration-300",
                {
                  "text-neutral-950 before:w-[8px] before:bg-neutral-950": activeCategory === cat,
                  "text-neutral-400 hover:text-neutral-950 hover:pl-1": activeCategory !== cat,
                }
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseFilter;