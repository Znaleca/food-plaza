'use client';

import { useEffect, useState, useMemo } from 'react';
import getAllMenu from '@/app/actions/getAllMenu';
import getOrdersQuantity from '@/app/actions/getOrdersQuantity';
import getOrdersDiscountData from '@/app/actions/getOrdersDiscountData'; 
import {
    FaMoneyBillTrendUp,
    FaBoxOpen,
    FaChartSimple,
    FaStar,
    FaArrowTrendDown,
    FaCalendarWeek,
    FaClock,
    FaBullseye,
    FaPercent
} from 'react-icons/fa6';

// Utility function to convert Appwrite file ID to a view URL
const toURL = (fid) => {
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    if (!fid || !bucketId || !projectId) return null;
    return `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fid}/view?project=${projectId}`;
};

// --- UTILITY TO EXTRACT ALL MENU ITEMS FROM ALL STALLS ---
const extractAllMenuItems = (stallDocuments) => {
  const allItems = [];

  stallDocuments.forEach(stall => {
    const menuNames = stall.menuName || [];
    const menuPrices = stall.menuPrice || [];
    const menuTypes = stall.menuType || [];
    const menuImages = stall.menuImages || [];

    for (let i = 0; i < menuNames.length; i++) {
      allItems.push({
        id: `${stall.$id}_${i}`,
        name: menuNames[i] || 'Unnamed Item',
        price: menuPrices[i] ?? 0,
        type: menuTypes[i] || 'Other',
        imageURL: toURL(menuImages[i]),
        stallName: stall.name,
      });
    }
  });

  return allItems;
};

// Utility function for currency formatting (Philippines Pesos)
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};


const SalesCard = ({ roomName }) => {
  const [stallDocuments, setStallDocuments] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [discountData, setDiscountData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE FOR FILTERING ---
  const [timeFilter, setTimeFilter] = useState('all-time'); // 'all-time', 'today', 'week', 'month'

  useEffect(() => {
    if (!roomName) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all three data sets concurrently
        const [menuRes, qtyRes, discountRes] = await Promise.all([
          getAllMenu(),
          getOrdersQuantity(),
          getOrdersDiscountData(), 
        ]);

        setStallDocuments(menuRes.documents || []);
        setQuantities(qtyRes || []);
        setDiscountData(discountRes || []); 

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roomName]);

  // --- BASE DATA PROCESSING ---
  const allMenuItems = useMemo(() => {
      return extractAllMenuItems(stallDocuments);
  }, [stallDocuments]);

  const currentStallMenuItems = useMemo(() => {
      if (!roomName) return [];
      return allMenuItems.filter(item => item.stallName === roomName);
  }, [allMenuItems, roomName]);
  
  const currentStallQuantities = useMemo(() => {
      if (!roomName) return [];
      return quantities.filter(qty => qty.roomName === roomName);
  }, [quantities, roomName]);

  const currentStallDiscountData = useMemo(() => {
    if (!roomName) return [];
    return discountData.filter(disc => disc.roomName === roomName);
  }, [discountData, roomName]);


  // Enhance menu items with sales data (ALL-TIME) - NOW INCLUDES DISCOUNT
  const allTimeEnhancedMenuItems = useMemo(() => {
      return currentStallMenuItems.map(item => {
          const matchingQty = currentStallQuantities.find(qty => qty.menuName === item.name);
          const matchingDiscount = currentStallDiscountData.find(disc => disc.menuName === item.name);
          
          const count = matchingQty ? matchingQty.count : 0;
          const totalDiscount = matchingDiscount ? matchingDiscount.totalDiscount : 0;
          
          // Calculate Base Revenue (Gross Sales)
          const baseRevenue = (item.price ?? 0) * count; 
          // Final Revenue (Net Sales) is base revenue minus the total discount
          const totalRevenue = baseRevenue - totalDiscount; 
          
          return {
              ...item,
              count,
              baseRevenue, // Gross Sales
              totalDiscount, 
              totalRevenue // Net Sales
          };
      }).sort((a, b) => b.count - a.count); // Sorted by ALL-TIME count descending
  }, [currentStallMenuItems, currentStallQuantities, currentStallDiscountData]);

  // Calculate ALL-TIME totals
  const totalItemsSold = useMemo(() => allTimeEnhancedMenuItems.reduce((sum, item) => sum + item.count, 0), [allTimeEnhancedMenuItems]);
  const totalBaseRevenue = useMemo(() => allTimeEnhancedMenuItems.reduce((sum, item) => sum + item.baseRevenue, 0), [allTimeEnhancedMenuItems]); // ALL-TIME Gross
  const totalDiscountApplied = useMemo(() => allTimeEnhancedMenuItems.reduce((sum, item) => sum + item.totalDiscount, 0), [allTimeEnhancedMenuItems]);
  const totalFinalRevenue = useMemo(() => allTimeEnhancedMenuItems.reduce((sum, item) => sum + item.totalRevenue, 0), [allTimeEnhancedMenuItems]); // ALL-TIME Net

  // Placeholder Calculations for filtering (based on ALL-TIME totals)
  const avgDailyRevenue = totalFinalRevenue / 30;
  const avgWeeklyRevenue = totalFinalRevenue / 4;
  const avgDailyDiscount = totalDiscountApplied / 30;
  const avgWeeklyDiscount = totalDiscountApplied / 4;
  
  // NEW: Placeholder for Gross Revenue filtering
  const avgDailyBaseRevenue = totalBaseRevenue / 30;
  const avgWeeklyBaseRevenue = totalBaseRevenue / 4;


  // --- FILTERED DATA FOR CHART & METRICS (SIMULATION) ---
  const filteredData = useMemo(() => {
    if (timeFilter === 'all-time') {
      return {
        items: allTimeEnhancedMenuItems,
        baseRevenueLabel: formatCurrency(totalBaseRevenue), // ALL-TIME Gross
        discountLabel: formatCurrency(totalDiscountApplied),
        finalRevenueLabel: formatCurrency(totalFinalRevenue),
      };
    }

    // SIMULATION LOGIC
    const baseCount = totalItemsSold;

    // Define the scaling factor for quantity based on the time filter.
    let countScaleFactor;
    let baseRevenueLabel; // NEW Label
    let discountLabel;
    let finalRevenueLabel;

    if (timeFilter === 'today') {
      countScaleFactor = baseCount > 0 ? (totalItemsSold / 30) / baseCount : 0;
      baseRevenueLabel = formatCurrency(avgDailyBaseRevenue); // Daily Gross
      discountLabel = formatCurrency(avgDailyDiscount);
      finalRevenueLabel = formatCurrency(avgDailyRevenue); // Daily Net
    } else if (timeFilter === 'week') {
      countScaleFactor = baseCount > 0 ? (totalItemsSold / 4) / baseCount : 0;
      baseRevenueLabel = formatCurrency(avgWeeklyBaseRevenue); // Weekly Gross
      discountLabel = formatCurrency(avgWeeklyDiscount);
      finalRevenueLabel = formatCurrency(avgWeeklyRevenue); // Weekly Net
    } else if (timeFilter === 'month') {
      countScaleFactor = 1;
      baseRevenueLabel = formatCurrency(totalBaseRevenue); // Monthly Gross
      discountLabel = formatCurrency(totalDiscountApplied);
      finalRevenueLabel = formatCurrency(totalFinalRevenue); // Monthly Net
    } else {
      countScaleFactor = 1;
      baseRevenueLabel = formatCurrency(totalBaseRevenue);
      discountLabel = formatCurrency(totalDiscountApplied);
      finalRevenueLabel = formatCurrency(totalFinalRevenue);
    }

    const simulatedItems = allTimeEnhancedMenuItems.map(item => {
      const simulatedCount = Math.max(0, Math.round(item.count * countScaleFactor));
      const simulatedDiscount = item.totalDiscount * countScaleFactor; 
      
      const simulatedBaseRevenue = item.price * simulatedCount; // SIMULATED GROSS
      const simulatedFinalRevenue = simulatedBaseRevenue - simulatedDiscount; // SIMULATED NET
      
      return {
        ...item,
        count: simulatedCount,
        baseRevenue: simulatedBaseRevenue,
        totalDiscount: simulatedDiscount,
        totalRevenue: simulatedFinalRevenue
      };
    }).sort((a, b) => b.count - a.count); 

    return {
      items: simulatedItems,
      baseRevenueLabel: baseRevenueLabel,
      discountLabel: discountLabel,
      finalRevenueLabel: finalRevenueLabel,
    };
  }, [timeFilter, allTimeEnhancedMenuItems, totalItemsSold, totalFinalRevenue, totalDiscountApplied, totalBaseRevenue, avgDailyRevenue, avgWeeklyRevenue, avgDailyDiscount, avgWeeklyDiscount, avgDailyBaseRevenue, avgWeeklyBaseRevenue]);


  // Data for Chart and Summaries
  const chartItems = useMemo(() => {
    if (timeFilter !== 'all-time') {
        return filteredData.items.filter(item => item.count > 0);
    }
    return filteredData.items;
  }, [filteredData.items, timeFilter]);

  const filteredTotalFinalRevenue = useMemo(() => {
    return filteredData.items.reduce((sum, item) => sum + item.totalRevenue, 0);
  }, [filteredData.items]);
  
  const filteredTotalDiscountApplied = useMemo(() => {
    return filteredData.items.reduce((sum, item) => sum + item.totalDiscount, 0);
  }, [filteredData.items]); 
  
  const filteredTotalBaseRevenue = useMemo(() => { // NEW FILTERED TOTAL
    return filteredData.items.reduce((sum, item) => sum + item.baseRevenue, 0);
  }, [filteredData.items]);

  const filteredTotalItemsSold = useMemo(() => {
      return filteredData.items.reduce((sum, item) => sum + item.count, 0);
  }, [filteredData.items]);

  const currentBestSeller = useMemo(() => {
    return filteredData.items.length > 0 ? filteredData.items[0] : null;
  }, [filteredData.items]);

  const currentLeastSeller = useMemo(() => {
    const soldItems = filteredData.items.filter(item => item.count > 0);
    if (soldItems.length > 0) {
        return soldItems[soldItems.length - 1];
    }
    return filteredData.items.length > 0 ? filteredData.items[filteredData.items.length - 1] : null;
  }, [filteredData.items]);

  const chartMaxCount = useMemo(() => {
      const max = chartItems.reduce((max, item) => Math.max(max, item.count), 0);
      return max * 1.1;
  }, [chartItems]);

  const getFilterTitle = (filter) => {
    switch(filter) {
        case 'today': return 'Today\'s Simulated Sales';
        case 'week': return 'This Week\'s Simulated Sales';
        case 'month': return 'This Month\'s Simulated Sales';
        default: return 'All-Time Sales';
    }
  };

  const getFilterIcon = (filter) => {
    switch(filter) {
        case 'today': return <FaClock className="w-5 h-5 mr-2" />;
        case 'week': return <FaCalendarWeek className="w-5 h-5 mr-2" />;
        case 'month': return <FaBullseye className="w-5 h-5 mr-2" />;
        default: return <FaChartSimple className="w-5 h-5 mr-2" />;
    }
  };


  // --- RENDER LOGIC ---

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-white bg-neutral-900">
      <svg className="animate-spin h-10 w-10 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-500 space-y-4 bg-neutral-900">
      <p>{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-pink-600 rounded hover:bg-pink-700 text-white transition duration-200"
      >
        Retry
      </button>
    </div>
  );


  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">

      {/* Sales Summary & Filtered Totals */}
      <div className="bg-neutral-900 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-center text-pink-500">{getFilterTitle(timeFilter)}</h2>
        
        {/* MODIFIED: Changed grid to display Gross Revenue next to Final Revenue. */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">

          {/* Filtered Items Sold */}
          <div className="bg-neutral-800 p-4 rounded-lg flex flex-col items-center justify-center col-span-2 md:col-span-1">
            <FaBoxOpen className="w-6 h-6 text-pink-500 mb-1" />
            <p className="text-xl font-semibold text-pink-400">{filteredTotalItemsSold}</p>
            <p className="text-xs text-neutral-400">Orders</p>
          </div>

          {/* Filtered Total Gross Revenue (NEW CARD) */}
          <div className="bg-neutral-800 p-4 rounded-lg flex flex-col items-center justify-center col-span-2 md:col-span-1">
            <FaMoneyBillTrendUp className="w-6 h-6 text-yellow-400 mb-1" />
            <p className="text-xl font-semibold text-yellow-400">{formatCurrency(filteredTotalBaseRevenue)}</p>
            <p className="text-xs text-neutral-400">Gross Revenue</p>
          </div>
          
          {/* Filtered Total Discount Applied */}
          <div className="bg-neutral-800 p-4 rounded-lg flex flex-col items-center justify-center col-span-2 md:col-span-1">
            <FaPercent className="w-6 h-6 text-orange-400 mb-1" />
            <p className="text-xl font-semibold text-orange-400">{formatCurrency(filteredTotalDiscountApplied)}</p>
            <p className="text-xs text-neutral-400">Total Discount</p>
          </div>

          {/* Filtered Total Final Revenue (Net) */}
          <div className="bg-neutral-800 p-4 rounded-lg flex flex-col items-center justify-center col-span-2 md:col-span-1">
            <FaMoneyBillTrendUp className="w-6 h-6 text-pink-500 mb-1" />
            <p className="text-xl font-semibold text-pink-400">{formatCurrency(filteredTotalFinalRevenue)}</p>
            <p className="text-xs text-neutral-400">Final Revenue (Net)</p>
          </div>

          {/* ALL-TIME Total Items Sold (Summary) */}
          <div className="bg-neutral-800 p-4 rounded-lg flex flex-col items-center justify-center col-span-2 md:col-span-1">
            <FaBoxOpen className="w-6 h-6 text-neutral-500 mb-1" />
            <p className="text-xl font-semibold text-neutral-400">{totalItemsSold}</p>
            <p className="text-xs text-neutral-500">All-Time Orders</p>
          </div>

          {/* ALL-TIME Total Revenue (Final) (Summary) */}
          <div className="bg-neutral-800 p-4 rounded-lg flex flex-col items-center justify-center col-span-2 md:col-span-1">
            <FaMoneyBillTrendUp className="w-6 h-6 text-neutral-500 mb-1" />
            <p className="text-xl font-semibold text-neutral-400">{formatCurrency(totalFinalRevenue)}</p>
            <p className="text-xs text-neutral-500">All-Time Net Rev.</p>
          </div>

        </div>
      </div>

      {/* Sales Chart Section with Filter Control (No change here) */}
      <div className="bg-neutral-900 rounded-xl p-6 mb-8">

        <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-pink-400 flex items-center mb-3 md:mb-0">
                {getFilterIcon(timeFilter)} Total Order Count per Menu Item
            </h3>

            {/* --- FILTER BUTTONS --- */}
            <div className="flex space-x-2 bg-neutral-800 p-1 rounded-lg">
                <button
                    onClick={() => setTimeFilter('all-time')}
                    className={`px-3 py-1 text-sm rounded-md transition duration-150 ${
                        timeFilter === 'all-time' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    All Time
                </button>
                <button
                    onClick={() => setTimeFilter('today')}
                    className={`px-3 py-1 text-sm rounded-md transition duration-150 ${
                        timeFilter === 'today' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    Today
                </button>
                <button
                    onClick={() => setTimeFilter('week')}
                    className={`px-3 py-1 text-sm rounded-md transition duration-150 ${
                        timeFilter === 'week' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    Week
                </button>
                <button
                    onClick={() => setTimeFilter('month')}
                    className={`px-3 py-1 text-sm rounded-md transition duration-150 ${
                        timeFilter === 'month' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:bg-neutral-700'
                    }`}
                >
                    Month
                </button>
            </div>
        </div>

        {/* --- CHART VISUALIZATION (All Items) --- */}
        {chartItems.length > 0 && chartMaxCount > 0 ? (
          // --- BEGIN SCROLLABLE CONTAINER ---
          <div className="w-full overflow-x-auto">
            <div className="h-64 flex flex-col justify-end p-2 bg-neutral-800 rounded-lg relative min-w-[1200px]">
                {/* Guide Lines */}
                <div className="absolute inset-0 p-2 border-l border-neutral-700">
                    <div className="absolute top-1/2 w-full h-px bg-neutral-700/50"></div>
                </div>

                <div className="flex justify-start items-end h-full pt-4 relative z-10 space-x-2">
                  {chartItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col items-center min-w-[50px] max-w-[100px] h-full relative group">
                      <div
                        style={{
                          height: `${(item.count / chartMaxCount) * 100}%`
                        }}
                        className="w-full rounded-t-lg bg-pink-600 hover:bg-pink-500 transition-all duration-300 ease-out flex items-start justify-center"
                      >
                         <div className="absolute top-0 transform -translate-y-full text-xs font-bold text-white bg-neutral-700/80 px-2 py-1 rounded-md whitespace-nowrap">
                            {item.count} orders
                        </div>
                      </div>
                      <div className="text-xs text-center mt-2 text-neutral-400 w-full line-clamp-2" title={item.name}>
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
                {/* X-Axis Base Line */}
                <div className="h-px bg-neutral-700 mt-2"></div>
            </div>
          </div>
          // --- END SCROLLABLE CONTAINER ---
        ) : (
          <p className="text-neutral-400 text-center py-8 bg-neutral-800 rounded-lg">No sales data available for this period.</p>
        )}
      </div>

      {/* Best/Least Seller Cards (No change here) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Best Seller Card */}
        <div className="bg-neutral-800 p-4 rounded-xl">
            <p className="text-md font-bold text-green-400 mb-2 flex items-center">
                <FaStar className="w-5 h-5 mr-2" /> BEST SELLER ({timeFilter.toUpperCase().replace('-', ' ')})
            </p>
            {currentBestSeller ? (
                <>
                    <p className="text-lg font-semibold text-white truncate">{currentBestSeller.name}</p>
                    <p className="text-sm text-neutral-400">Sold: <span className="text-green-300 font-bold">{currentBestSeller.count} orders</span></p>
                    <p className="text-sm text-neutral-400">Discount: <span className="text-orange-300 font-bold">{formatCurrency(currentBestSeller.totalDiscount)}</span></p>
                    <p className="text-sm text-neutral-400">Final Revenue: <span className="text-green-300 font-bold">{formatCurrency(currentBestSeller.totalRevenue)}</span></p>
                </>
            ) : (
                <p className="text-sm text-neutral-500">No items sold in this period.</p>
            )}
        </div>

        {/* Least Seller Card */}
        <div className="bg-neutral-800 p-4 rounded-xl">
            <p className="text-md font-bold text-red-400 mb-2 flex items-center">
                <FaArrowTrendDown className="w-5 h-5 mr-2" /> LEAST SELLER ({timeFilter.toUpperCase().replace('-', ' ')})
            </p>
            {currentLeastSeller ? (
                <>
                    <p className="text-lg font-semibold text-white truncate">{currentLeastSeller.name}</p>
                    <p className="text-sm text-neutral-400">Sold: <span className="text-red-300 font-bold">{currentLeastSeller.count} orders</span></p>
                    <p className="text-sm text-neutral-400">Discount: <span className="text-orange-300 font-bold">{formatCurrency(currentLeastSeller.totalDiscount)}</span></p>
                    <p className="text-sm text-neutral-400">Final Revenue: <span className="text-red-300 font-bold">{formatCurrency(currentLeastSeller.totalRevenue)}</span></p>
                </>
            ) : (
                <p className="text-sm text-neutral-500">No items with sales data in this period.</p>
            )}
        </div>
      </div>

      {/* All Menu Items List (Detail) - Shows filtered data */}
      <div className="bg-neutral-900 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-6 text-pink-400 border-b border-neutral-700 pb-2">
          Menu Item Sales Detail ({getFilterTitle(timeFilter)})
        </h3>

        {filteredData.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.items.map(item => (
              <div
                key={item.id}
                className="bg-neutral-800 p-5 rounded-xl shadow-lg hover:shadow-pink-500/20 transition duration-300 transform hover:scale-[1.02] border border-neutral-700"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative p-0.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                    <img
                      src={item.imageURL || '/placeholder-food.png'}
                      alt={item.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-neutral-800"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg text-white truncate">{item.name}</p>
                    <p className="text-xs text-neutral-400 font-medium bg-neutral-700/50 inline-block px-2 py-0.5 rounded-full mt-1">
                      {item.type}
                    </p>
                  </div>
                </div>

                {/* Sales Metrics Grid (FIXED LAYOUT) */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-700/50">
                    
                    {/* Units Sold (Orders) */}
                    <div className="flex flex-col items-start">
                        <p className="text-xs text-neutral-400">Orders</p>
                        <p className="text-sm font-bold text-green-400">{item.count}</p>
                    </div>
                    
                    {/* Price */}
                    <div className="flex flex-col items-end">
                        <p className="text-xs text-neutral-400">Price</p>
                        <p className="text-sm font-bold text-pink-400">{formatCurrency(item.price)}</p>
                    </div>

                    {/* Gross Revenue */}
                    <div className="flex flex-col items-start pt-2 border-t border-neutral-700/50">
                        <p className="text-xs text-neutral-400">Gross Rev.</p>
                        <p className="text-sm font-bold text-yellow-400">{formatCurrency(item.baseRevenue)}</p>
                    </div>
                    
                    {/* Total Discount */}
                    <div className="flex flex-col items-end pt-2 border-t border-neutral-700/50">
                        <p className="text-xs text-neutral-400">Discount</p>
                        <p className="text-sm font-bold text-orange-400">{formatCurrency(item.totalDiscount)}</p>
                    </div>
                </div>
                
                {/* Final Revenue (NET) - Separated and Prominent */}
                <div className="pt-4 mt-4 border-t border-neutral-700/50 flex flex-col items-center bg-neutral-700/30 p-2 rounded-lg">
                    <p className="text-sm text-neutral-300 font-semibold uppercase">Net Revenue</p>
                    <p className="text-xl font-extrabold text-blue-400">{formatCurrency(item.totalRevenue)}</p>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400 col-span-full text-center py-8 bg-neutral-800 rounded-lg">No menu items found for this stall.</p>
        )}
      </div>
    </div>
  );
};

export default SalesCard;
