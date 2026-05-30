'use client';

import { useEffect, useState, useMemo } from 'react';
import getAllMenu from '@/app/actions/getAllMenu';
import getOrdersQuantity from '@/app/actions/getOrdersQuantity';
import getOrdersDiscountData from '@/app/actions/getOrdersDiscountData';
import getOrdersPaymentSummary from '@/app/actions/getOrdersPaymentSummary';
import getLatestOrderTransaction from '@/app/actions/getLatestOrderTransaction';
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
// --- IMPORT THE NEWLY CREATED CHART COMPONENT ---
import RevenueDoughnutChart from './RevenueDoughnutChart';

// Utility function to convert Appwrite file ID to a view URL
const toURL = (fid) => {
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    if (!fid || !bucketId || !projectId) return null;
    return `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fid}/view?project=${projectId}`;
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

const fallbackMenuImage = '/images/no-image.jpg';


// --- UTILITY TO EXTRACT ALL MENU ITEMS FROM ALL STALLS (MODIFIED) ---
const extractAllMenuItems = (stallDocuments) => {
  const allItems = [];
  stallDocuments.forEach(stall => {
    const menuNames = stall.menuName || [];
    const menuPrices = stall.menuPrice || [];
    const menuTypes = stall.menuType || [];
    const menuImages = stall.menuImages || [];
    // --- NEW: Extract Size Fees ---
    const menuSmall = stall.menuSmall || [];
    const menuMedium = stall.menuMedium || [];
    const menuLarge = stall.menuLarge || [];
    // --- END NEW ---

    for (let i = 0; i < menuNames.length; i++) {
    
      const basePrice = menuPrices[i] ?? 0;
      const smallFee = menuSmall[i] ?? 0;
      const mediumFee = menuMedium[i] ?? 0;
      const largeFee = menuLarge[i] ?? 0;
      
      // Calculate Max Fee for Gross Revenue estimation
      const maxExtraFee = Math.max(smallFee, mediumFee, largeFee, 0);

      allItems.push({
        id: `${stall.$id}_${i}`,
        name: menuNames[i] || 'Unnamed Item',
  
        price: basePrice, // Base Price
        type: menuTypes[i] || 'Other',
        imageURL: toURL(menuImages[i]),
        stallName: stall.name,
        // --- Store calculated prices for display ---
        smallPrice: basePrice + smallFee,
        mediumPrice: basePrice + mediumFee,
        largePrice: basePrice + largeFee,
        // --- Store the fees to check which fields are actually used ---
        smallFee: smallFee,
        mediumFee: mediumFee,
        largeFee: largeFee,
        // --- Max Fee for Revenue estimation ---
        maxExtraFee: maxExtraFee,
      });
    }
  });
  return allItems;
};

// --- SALES CARD COMPONENT ---
const SalesCard = ({ roomName }) => {
  const [stallDocuments, setStallDocuments] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [discountData, setDiscountData] = useState([]);
  // PAYMENT SUMMARY INITIAL STATE (used for stall-specific data)
  const [paymentSummary, setPaymentSummary] = useState({ paidRevenue: 0, failedRevenue: 0, ordersCount: 0 });
  // NEW STATE FOR LATEST TRANSACTION
  const [latestTransaction, setLatestTransaction] = useState(null); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE FOR FILTERING ---
  const [timeFilter, setTimeFilter] = useState('all-time');
  // 'all-time', 'today', 'week', 'month'

  useEffect(() => {
    if (!roomName) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all five data sets concurrently
        const [menuRes, qtyRes, discountRes, paymentSummaryRes, latestTxnRes] = await Promise.all([ 
          getAllMenu(),
          getOrdersQuantity(),
      
          getOrdersDiscountData(),
          // Pass roomName to fetch stall-specific payment data
          getOrdersPaymentSummary(roomName), 
          getLatestOrderTransaction(roomName),
        ]);

        setStallDocuments(menuRes.documents || []);
        setQuantities(qtyRes || []);
        setDiscountData(discountRes || []);
        setPaymentSummary(paymentSummaryRes); // Set stall-specific payment summary
 
        // Set new state
        setLatestTransaction(latestTxnRes); 

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // ADDED roomName to dependency array to refetch when the stall changes
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

  // Enhance menu items with sales data (ALL-TIME) - Includes ALL orders, successful or not
  const allTimeEnhancedMenuItems = useMemo(() => {
      return currentStallMenuItems.map(item => {
          const matchingQty = currentStallQuantities.find(qty => qty.menuName === item.name);
          const matchingDiscount = currentStallDiscountData.find(disc => disc.menuName === item.name);
          
          const count = matchingQty ? matchingQty.count : 0;
          const totalDiscount = matchingDiscount ? matchingDiscount.totalDiscount : 0;
          
          // --- CALCULATE BASE REVENUE (Gross Sales) using BasePrice + MaxExtraFee ---
          const priceWithMaxFee = (item.price ?? 0) + (item.maxExtraFee ?? 0);
          const baseRevenue = priceWithMaxFee * count; 
          // Final Revenue (Net Sales) is base revenue minus the total discount
          const totalRevenue = baseRevenue - totalDiscount; 
    
          
          return {
              ...item,
              count, // Total attempted orders count (item quantity)
              baseRevenue, // Gross Sales (ALL attempted orders)
              totalDiscount, 
              totalRevenue // Net Sales (ALL attempted orders)
          };
      }).sort((a, b) => b.count - a.count); // Sorted by ALL-TIME count descending
  }, [currentStallMenuItems, currentStallQuantities, currentStallDiscountData]);

  // Calculate TRUE ALL-TIME totals using paymentSummary
  const totalItemsSold = useMemo(() => allTimeEnhancedMenuItems.reduce((sum, item) => sum + item.count, 0), [allTimeEnhancedMenuItems]);
  const totalDiscountApplied = useMemo(() => allTimeEnhancedMenuItems.reduce((sum, item) => sum + item.totalDiscount, 0), [allTimeEnhancedMenuItems]);
  
  // TRUE ALL-TIME GROSS REVENUE (Only from successfully paid orders)
  const totalTrueGrossRevenue = useMemo(() => paymentSummary.paidRevenue, [paymentSummary.paidRevenue]);
  
  // TRUE ALL-TIME NET REVENUE (True Gross - Discount)
  const totalTrueFinalRevenue = useMemo(() => totalTrueGrossRevenue - totalDiscountApplied, [totalTrueGrossRevenue, totalDiscountApplied]);

  // Placeholder Calculations for filtering (based on TRUE ALL-TIME totals)
  const avgDailyRevenue = totalTrueFinalRevenue / 30;
  const avgWeeklyRevenue = totalTrueFinalRevenue / 4;
  const avgDailyDiscount = totalDiscountApplied / 30;
  const avgWeeklyDiscount = totalDiscountApplied / 4;
  
  // Placeholder for True Gross Revenue filtering
  const avgDailyBaseRevenue = totalTrueGrossRevenue / 30;
  const avgWeeklyBaseRevenue = totalTrueGrossRevenue / 4;

  // --- FILTERED DATA FOR CHART & METRICS (SIMULATION) ---
  const filteredData = useMemo(() => {
    if (timeFilter === 'all-time') {
      return {
        items: allTimeEnhancedMenuItems,
        baseRevenueLabel: formatCurrency(totalTrueGrossRevenue), // TRUE ALL-TIME Gross
        discountLabel: formatCurrency(totalDiscountApplied),
        finalRevenueLabel: formatCurrency(totalTrueFinalRevenue), // TRUE ALL-TIME Net
      };
    }

    // SIMULATION LOGIC
    const baseCount = totalItemsSold; // Use ALL-TIME item count as base

    // Define the scaling factor for quantity based on the time filter.
    let countScaleFactor;
    let baseRevenueLabel; 
    let discountLabel;
    let finalRevenueLabel;

    if (timeFilter === 'today') {
      // Scale based on 1/30th of items sold, but display the TRUE daily average revenue
      countScaleFactor = baseCount > 0 ? (totalItemsSold / 30) / baseCount : 0;
      baseRevenueLabel = formatCurrency(avgDailyBaseRevenue); // Daily True Gross
      discountLabel = formatCurrency(avgDailyDiscount);
      finalRevenueLabel = formatCurrency(avgDailyRevenue); // Daily True Net
    } else if (timeFilter === 'week') {
      // Scale based on 1/4th of items sold, but display the TRUE weekly average revenue
      countScaleFactor = baseCount > 0 ? (totalItemsSold / 4) / baseCount : 0;
      baseRevenueLabel = formatCurrency(avgWeeklyBaseRevenue); // Weekly True Gross
      discountLabel = formatCurrency(avgWeeklyDiscount);
      finalRevenueLabel = formatCurrency(avgWeeklyRevenue); // Weekly True Net
    } else if (timeFilter === 'month') {
      // Month simulates ALL-TIME data (assuming ALL-TIME = 1 month of full data)
      countScaleFactor = 1;
      baseRevenueLabel = formatCurrency(totalTrueGrossRevenue); // Monthly True Gross
      discountLabel = formatCurrency(totalDiscountApplied);
      finalRevenueLabel = formatCurrency(totalTrueFinalRevenue); // Monthly True Net
    } else {
      countScaleFactor = 1;
      baseRevenueLabel = formatCurrency(totalTrueGrossRevenue);
      discountLabel = formatCurrency(totalDiscountApplied);
      finalRevenueLabel = formatCurrency(totalTrueFinalRevenue);
    }

    const simulatedItems = allTimeEnhancedMenuItems.map(item => {
      const simulatedCount = Math.max(0, Math.round(item.count * countScaleFactor));
      const simulatedDiscount = item.totalDiscount * countScaleFactor; 
      
      // Use the calculated price (Base + Max Fee)
      const priceForSimulation = (item.price ?? 0) + (item.maxExtraFee ?? 0);
      
      const simulatedBaseRevenue = priceForSimulation * simulatedCount; // SIMULATED GROSS (before revenue adjustment)
      const simulatedFinalRevenue = simulatedBaseRevenue - simulatedDiscount; // SIMULATED NET (before revenue adjustment)
      
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
      // The labels are the true revenue averages, not the sum of simulated items
      baseRevenueLabel: baseRevenueLabel,
      discountLabel: discountLabel,
      finalRevenueLabel: finalRevenueLabel,
    };
  }, [
    timeFilter, 
    allTimeEnhancedMenuItems, 
    totalItemsSold, 
    totalTrueFinalRevenue, 
    totalDiscountApplied, 
    totalTrueGrossRevenue, 
    avgDailyRevenue, 
    avgWeeklyRevenue, 
    avgDailyDiscount, 
    avgWeeklyDiscount, 
    avgDailyBaseRevenue, 
    avgWeeklyBaseRevenue
  ]);

  // Data for Chart and Summaries
  const chartItems = useMemo(() => {
    if (timeFilter !== 'all-time') {
        return filteredData.items.filter(item => item.count > 0);
    }
    return filteredData.items;
  }, [filteredData.items, timeFilter]);

  // For the summary cards, we use the pre-calculated TRUE revenue labels
  const filteredTotalFinalRevenueDisplay = filteredData.finalRevenueLabel;
  const filteredTotalDiscountAppliedDisplay = filteredData.discountLabel; 
  const filteredTotalBaseRevenueDisplay = filteredData.baseRevenueLabel; // NEW FILTERED TOTAL

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
        case 'today': return 'Today\'s Sales';
        case 'week': return 'This Week\'s Sales';
        case 'month': return 'This Month\'s Sales';
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

  // --- REVISED: Dynamic Price Rendering Function ---
  const renderPriceDetails = (item) => {
    // Check if the item has any size variations based on non-zero fees.
    const hasSizeVariations = item.smallFee > 0 || item.mediumFee > 0 || item.largeFee > 0;

    // If there are no size variations (it's a one-size item), display a single price spanning the full width.
    if (!hasSizeVariations) {
        return (
            <div key="base-price" className="flex flex-col items-start col-span-2">
                <p className="text-xs text-neutral-400">Price</p>
                <p className="text-sm font-bold text-pink-400">{formatCurrency(item.price)}</p>
            </div>
        );
    }

    // If there are size variations, display them in their own encapsulated grid.
    // This container spans 2 columns to ensure the following elements (Gross Rev, etc.) start on a new row.
    return (
        <div className="col-span-2 grid grid-cols-2 gap-x-3 gap-y-2">
            {/* Always display Small price, as it's the base */}
            <div key="small" className="flex flex-col items-start">
                <p className="text-xs text-neutral-400">Small</p>
                <p className="text-sm font-bold text-pink-400">{formatCurrency(item.smallPrice)}</p>
            </div>
            
            {/* Conditionally display Medium price only if it has an additional fee */}
            {item.mediumFee > 0 && (
                 <div key="medium" className="flex flex-col items-end">
                    <p className="text-xs text-neutral-400">Medium</p>
                    <p className="text-sm font-bold text-pink-400">{formatCurrency(item.mediumPrice)}</p>
                </div>
            )}

            {/* Conditionally display Large price only if it has an additional fee */}
            {item.largeFee > 0 && (
                <div key="large" className="flex flex-col items-start">
                    <p className="text-xs text-neutral-400">Large</p>
                    <p className="text-sm font-bold text-pink-400">{formatCurrency(item.largePrice)}</p>
                </div>
            )}
        </div>
    );
  };
  // --- END REVISED FUNCTION ---

  // --- RENDER LOGIC ---

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-neutral-950 bg-white selection:bg-red-600 selection:text-white">
      <div className="border-4 border-neutral-950 bg-white px-6 py-5 shadow-[8px_8px_0px_#000]">
        <svg className="animate-spin h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-neutral-950 space-y-4 bg-white selection:bg-red-600 selection:text-white p-6">
      <div className="border-4 border-neutral-950 bg-white px-6 py-5 text-center shadow-[8px_8px_0px_#000] max-w-lg w-full">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600 mb-2">Sales Dashboard Error</p>
        <p className="text-sm font-semibold text-neutral-700">{error}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="border-4 border-neutral-950 bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0px_#000] transition hover:bg-black"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-neutral-950 p-4 sm:p-6 selection:bg-red-600 selection:text-white">

      {/* Sales Summary & Filtered Totals */}
      <div className="border-4 border-neutral-950 bg-white p-4 sm:p-6 mb-8 shadow-[8px_8px_0px_#000]">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-[0.14em] mb-5 text-center text-red-600">{getFilterTitle(timeFilter)}</h2>
        
        {/* Adjusted to six columns (md:grid-cols-6) for the new card placement */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">

          {/* Filtered Items Sold (based on item count scale) */}
          <div className="border-2 border-neutral-950 bg-neutral-50 p-4 flex flex-col items-center justify-center col-span-2 md:col-span-1 shadow-[4px_4px_0px_#000]">
            <FaBoxOpen className="w-6 h-6 text-red-600 mb-1" />
            <p className="text-xl font-black text-neutral-950">{filteredTotalItemsSold}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">Items Sold</p>
          </div>

          {/* Filtered Total Gross Revenue (TRUE Gross Revenue) */}
          <div className="border-2 border-neutral-950 bg-white p-4 flex flex-col items-center justify-center col-span-2 md:col-span-1 shadow-[4px_4px_0px_#000]">
            <FaMoneyBillTrendUp className="w-6 h-6 text-neutral-950 mb-1" />
            <p className="text-xl font-black text-neutral-950">{filteredTotalBaseRevenueDisplay}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">Gross Revenue</p>
          </div>
          
          {/* Filtered Total Discount Applied */}
          <div className="border-2 border-neutral-950 bg-white p-4 flex flex-col items-center justify-center col-span-2 md:col-span-1 shadow-[4px_4px_0px_#000]">
            <FaPercent className="w-6 h-6 text-red-600 mb-1" />
            <p className="text-xl font-black text-neutral-950">{filteredTotalDiscountAppliedDisplay}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">Total Discount</p>
          </div>

          {/* Filtered Total Final Revenue (True Net Revenue) */}
          <div className="border-2 border-neutral-950 bg-red-600 p-4 flex flex-col items-center justify-center col-span-2 md:col-span-1 shadow-[4px_4px_0px_#000]">
            <FaMoneyBillTrendUp className="w-6 h-6 text-white mb-1" />
            <p className="text-xl font-black text-white">{filteredTotalFinalRevenueDisplay}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/80">Final Revenue (Net)</p>
          </div>

          {/* 🟢 ALL-TIME Total Orders (Attempted) - CORRECTION */}
          <div className="border-2 border-neutral-950 bg-neutral-50 p-4 flex flex-col items-center justify-center col-span-2 md:col-span-1 shadow-[4px_4px_0px_#000]">
            <FaBoxOpen className="w-6 h-6 text-neutral-950 mb-1" />
            {/* CORRECT: Uses the actual count of attempted orders from paymentSummary */}
            <p className="text-xl font-black text-neutral-950">{paymentSummary.ordersCount}</p> 
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">All-Time Orders (Attempted)</p>
          </div>
          
          {/* 🟢 ALL-TIME Total Item Quantity Sold (Clarified Label) */}
          <div className="border-2 border-neutral-950 bg-white p-4 flex flex-col items-center justify-center col-span-2 md:col-span-1 shadow-[4px_4px_0px_#000]">
            <FaBoxOpen className="w-6 h-6 text-red-600 mb-1" />
            <p className="text-xl font-black text-neutral-950">{totalItemsSold}</p>
            {/* CLARIFIED LABEL */}
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">All-Time Item Quantity</p>
          </div>

        </div>
      </div>
      
      {/* ---------------------------------------------------------------- */}
      
      {/* CHART & BEST/LEAST SELLERS SECTION (New Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* DOUGHNUT CHART (Column 1) */}
        <div className="lg:col-span-1 h-full min-h-[400px] border-4 border-neutral-950 bg-white shadow-[8px_8px_0px_#000] p-3 sm:p-4">
            <RevenueDoughnutChart 
                items={chartItems} // Use the items array, which contains the 'baseRevenue' needed
                filterTitle={getFilterTitle(timeFilter)}
            />
        </div>
        
        {/* BEST/LEAST SELLER CARDS (Columns 2 & 3) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Best Seller Card */}
            <div className="border-4 border-neutral-950 bg-white p-4 flex flex-col justify-between h-full shadow-[8px_8px_0px_#000]">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-red-600 mb-4 flex items-center">
                <FaStar className="w-5 h-5 mr-2 text-neutral-950" /> Best Seller ({timeFilter.toUpperCase().replace('-', ' ')})
                </p>
                {currentBestSeller ?
                (
                    <>
                  <p className="text-2xl font-black text-neutral-950 truncate mb-2 uppercase tracking-tight">{currentBestSeller.name}</p>
                        <div className="space-y-1">
                    <p className="text-sm text-neutral-600">Items Sold: <span className="text-neutral-950 font-black">{currentBestSeller.count} items</span></p>
                    <p className="text-sm text-neutral-600">Gross Rev: <span className="text-neutral-950 font-black">{formatCurrency(currentBestSeller.baseRevenue)}</span></p>
                    <p className="text-sm text-neutral-600">Discount: <span className="text-red-600 font-black">{formatCurrency(currentBestSeller.totalDiscount)}</span></p>
                        </div>
                  <div className="pt-3 mt-4 border-t-2 border-neutral-950">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-600">Net Revenue</p>
                    <p className="text-xl font-black text-red-600">{formatCurrency(currentBestSeller.totalRevenue)}</p>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-neutral-500">No items sold in this period.</p>
                )}
            </div>

            {/* Least Seller Card */}
            <div className="border-4 border-neutral-950 bg-white p-4 flex flex-col justify-between h-full shadow-[8px_8px_0px_#000]">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-red-600 mb-4 flex items-center">
                <FaArrowTrendDown className="w-5 h-5 mr-2 text-neutral-950" /> Least Seller ({timeFilter.toUpperCase().replace('-', ' ')})
                </p>
                {currentLeastSeller ?
                (
                    <>
                  <p className="text-2xl font-black text-neutral-950 truncate mb-2 uppercase tracking-tight">{currentLeastSeller.name}</p>
                        <div className="space-y-1">
                    <p className="text-sm text-neutral-600">Items Sold: <span className="text-neutral-950 font-black">{currentLeastSeller.count} items</span></p>
                    <p className="text-sm text-neutral-600">Gross Rev: <span className="text-neutral-950 font-black">{formatCurrency(currentLeastSeller.baseRevenue)}</span></p>
                    <p className="text-sm text-neutral-600">Discount: <span className="text-red-600 font-black">{formatCurrency(currentLeastSeller.totalDiscount)}</span></p>
                        </div>
                  <div className="pt-3 mt-4 border-t-2 border-neutral-950">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-600">Net Revenue</p>
                    <p className="text-xl font-black text-red-600">{formatCurrency(currentLeastSeller.totalRevenue)}</p>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-neutral-500">No items with sales data in this period.</p>
                )}
            </div>
        </div>
      </div>
      
      {/* ---------------------------------------------------------------- */}


      {/* LATEST TRANSACTION SUMMARY */}
      <div className="border-4 border-neutral-950 bg-white p-4 sm:p-6 mb-8 shadow-[8px_8px_0px_#000]">
        <h3 className="text-lg font-black uppercase tracking-[0.14em] mb-4 text-center text-neutral-950 flex items-center justify-center">
            <FaClock className="w-5 h-5 mr-2 text-red-600" />
            Latest Successful Transaction <span className="text-red-600 ml-2">({roomName})</span>
        </h3>
        {latestTransaction ?
        (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            
            {/* Latest Final Amount */}
            <div className="border-2 border-neutral-950 bg-neutral-50 p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_#000]">
              <FaMoneyBillTrendUp className="w-6 h-6 text-red-600 mb-1" />
              <p className="text-xl font-black text-neutral-950">{formatCurrency(latestTransaction.finalAmount)}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">Latest Money Received (Net)</p>
            </div>
            
            {/* Latest Discount Applied */}
            <div className="border-2 border-neutral-950 bg-white p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_#000]">
              <FaPercent className="w-6 h-6 text-red-600 mb-1" />
              <p className="text-xl font-black text-neutral-950">{formatCurrency(latestTransaction.discountAmount)}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">Latest Discount Applied</p>
            </div>
            
            {/* Timestamp */}
              <div className="border-2 border-neutral-950 bg-white p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_#000]">
                <FaCalendarWeek className="w-6 h-6 text-neutral-950 mb-1" />
               <p className="text-sm font-black text-neutral-950">
                     {new Date(latestTransaction.timestamp).toLocaleDateString()}
                </p>
               <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">Transaction Date/Time</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-neutral-500 border-2 border-dashed border-neutral-300 bg-neutral-50 p-4">No latest successful transaction found for this stall.</p>
        )}
      </div>
      {/* ---------------------------------------------------------------- */}


      {/* PAYMENT STATUS REVENUE SUMMARY (Now stall-specific) */}
      <div className="border-4 border-neutral-950 bg-white p-4 sm:p-6 mb-8 shadow-[8px_8px_0px_#000]">
        <h3 className="text-lg font-black uppercase tracking-[0.14em] mb-4 text-center text-neutral-950 flex items-center justify-center">
          <FaMoneyBillTrendUp className="w-5 h-5 mr-2 text-red-600" />
          All-Time Payment Status Revenue Summary <span className="text-red-600 ml-2">({roomName})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* Total Orders Card */}
            <div className="border-2 border-neutral-950 bg-neutral-50 p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_#000]">
              <FaBoxOpen className="w-6 h-6 text-red-600 mb-1" />
              <p className="text-xl font-black text-neutral-950">{paymentSummary.ordersCount}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">Total Checkout Attempted</p>
            </div>
            
            {/* Paid Revenue Card (TRUE GROSS REVENUE) */}
            <div className="border-2 border-neutral-950 bg-white p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_#000]">
              <FaMoneyBillTrendUp className="w-6 h-6 text-red-600 mb-1" />
              <p className="text-xl font-black text-neutral-950">{formatCurrency(paymentSummary.paidRevenue)}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">Successfully Paid (True Gross)</p>
            </div>
            
            {/* Failed Revenue Card */}
            <div className="border-2 border-neutral-950 bg-red-600 p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_#000]">
              <FaArrowTrendDown className="w-6 h-6 text-white mb-1" />
              <p className="text-xl font-black text-white">{formatCurrency(paymentSummary.failedRevenue)}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/80">Payment Failed (Lost Gross)</p>
            </div>
        </div>
      </div>
      {/* ---------------------------------------------------------------- */}

      {/* Sales Chart Section with Filter Control (Bar Chart - kept the logic for items sold visualization) */}
        <div className="border-4 border-neutral-950 bg-white p-4 sm:p-6 mb-8 shadow-[8px_8px_0px_#000]">

        <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
       
          <h3 className="text-lg font-black uppercase tracking-[0.14em] text-neutral-950 flex items-center mb-0">
                {getFilterIcon(timeFilter)} Total Order Count per Menu Item
            </h3>

            {/* --- FILTER BUTTONS --- */}
          <div className="flex flex-wrap gap-2 bg-neutral-100 p-2 border-2 border-neutral-950 shadow-[4px_4px_0px_#000]">
                <button
                    onClick={() => setTimeFilter('all-time')}
              className={`px-3 py-1 text-sm font-black uppercase tracking-[0.12em] rounded-none border border-neutral-950 transition duration-150 ${
                        timeFilter === 'all-time' ? 'bg-red-600 text-white' : 'text-neutral-700 hover:bg-white'
                    }`}
                >
                    All Time
                </button>
                <button
                    onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 text-sm font-black uppercase tracking-[0.12em] rounded-none border border-neutral-950 transition duration-150 ${
                        timeFilter === 'today' ? 'bg-red-600 text-white' : 'text-neutral-700 hover:bg-white'
                    }`}
                >
                    Today
                </button>
                <button
                    onClick={() => setTimeFilter('week')}
              className={`px-3 py-1 text-sm font-black uppercase tracking-[0.12em] rounded-none border border-neutral-950 transition duration-150 ${
                        timeFilter === 'week' ? 'bg-red-600 text-white' : 'text-neutral-700 hover:bg-white'
                    }`}
                >
                    Week
                </button>
                <button
                    onClick={() => setTimeFilter('month')}
              className={`px-3 py-1 text-sm font-black uppercase tracking-[0.12em] rounded-none border border-neutral-950 transition duration-150 ${
                        timeFilter === 'month' ? 'bg-red-600 text-white' : 'text-neutral-700 hover:bg-white'
                    }`}
                >
                    Month
                </button>
            </div>
        </div>

        {/* --- CHART VISUALIZATION (All Items) --- */}
        {chartItems.length > 0 && chartMaxCount > 0 ?
        (
          // --- BEGIN SCROLLABLE CONTAINER ---
          <div className="w-full overflow-x-auto">
            <div className="h-64 flex flex-col justify-end p-4 bg-white border-2 border-neutral-950 relative min-w-[1200px] shadow-[4px_4px_0px_#000]">
                {/* Guide Lines */}
                <div className="absolute inset-0 p-2 border-l border-neutral-200">
                  <div className="absolute top-1/2 w-full h-px bg-neutral-200"></div>
                </div>

                <div className="flex justify-start items-end h-full pt-4 relative z-10 space-x-2">
                  {chartItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col items-center min-w-[50px] max-w-[100px] h-full relative group">
                      <div
                        style={{
                           height: `${(item.count / chartMaxCount) * 100}%`
                          }}
                        className="w-full rounded-t-none border-2 border-neutral-950 bg-red-600 hover:bg-black transition-all duration-300 ease-out flex items-start justify-center"
                      >
                         <div className="absolute top-0 transform -translate-y-full text-[10px] font-black uppercase tracking-[0.12em] text-white bg-neutral-950 px-2 py-1 whitespace-nowrap border border-white">
                            {item.count} items
                         </div>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-center mt-2 text-neutral-700 w-full line-clamp-2" 
                        title={item.name}>
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
  
                {/* X-Axis Base Line */}
                <div className="h-px bg-neutral-200 mt-2"></div>
            </div>
          </div>
          // --- END SCROLLABLE CONTAINER ---
        ) : (
          <p className="text-neutral-500 text-center py-8 bg-neutral-50 border-2 border-dashed border-neutral-300">No sales data available for this period.</p>
        )}
      </div>

      {/* All Menu Items List (Detail) - Shows filtered data */}
      <div className="border-4 border-neutral-950 bg-white p-4 sm:p-6 shadow-[8px_8px_0px_#000]">
        <h3 className="text-xl font-black uppercase tracking-[0.14em] mb-6 text-red-600 border-b-2 border-neutral-950 pb-2">
          Menu Item Sales Detail ({getFilterTitle(timeFilter)})
        </h3>

        {filteredData.items.length > 0 ?
        (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.items.map(item => (
              <div
                key={item.id}
                className="bg-white p-5 shadow-[6px_6px_0px_#000] hover:translate-y-[-2px] transition duration-300 border-2 border-neutral-950"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative p-0.5 bg-red-600">
                    <img
                       src={item.imageURL || fallbackMenuImage}
                      alt={item.name}
                      className="w-16 h-16 object-cover border-2 border-neutral-950 bg-neutral-100"
                      onError={(event) => {
                        if (event.currentTarget.src !== window.location.origin + fallbackMenuImage) {
                          event.currentTarget.src = fallbackMenuImage;
                        }
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg text-neutral-950 truncate uppercase tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-neutral-700 font-black bg-neutral-100 inline-block px-2 py-0.5 border border-neutral-300 mt-1 uppercase tracking-[0.14em]">
                      {item.type}
                    </p>
                  </div>
                </div>

                {/* Sales Metrics Grid (FIXED LAYOUT) */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-neutral-950">
          
                    {/* Units Sold (Items) */}
                    <div className="flex flex-col items-start">
                         <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Items Sold</p>
                        <p className="text-sm font-black text-neutral-950">{item.count}</p>
                    </div>
           
                    {/* Size Prices (DYNAMIC SECTION) */}
                    {renderPriceDetails(item)}
                    
                    {/* Gross Revenue (Max Estimate) */}
                    <div className="flex flex-col items-start pt-2 border-t border-neutral-300 col-span-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Gross Rev. (Max Est.)</p>
                      <p className="text-sm font-black text-neutral-950">{formatCurrency(item.baseRevenue)}</p>
                    </div>
       
                    {/* Total Discount */}
                    <div className="flex flex-col items-end pt-2 border-t border-neutral-300 col-span-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">Discount</p>
                      <p className="text-sm font-black text-red-600">{formatCurrency(item.totalDiscount)}</p>
                    </div>
                </div>
        
                {/* Final Revenue (NET) - Separated and Prominent */}
                  <div className="pt-4 mt-4 border-t-2 border-neutral-950 flex flex-col items-center bg-neutral-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">Net Revenue</p>
                    <p className="text-xl font-black text-red-600">{formatCurrency(item.totalRevenue)}</p>
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