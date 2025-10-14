'use client';

import React, { useRef } from 'react';
// Import the X icon for the Close button
import { Printer, Download, X } from 'lucide-react'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const formatDateTime = (dateString) => {
  if (!dateString) return '__________';
  const date = new Date(dateString);
  // Formal date format for legal documents
  return date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
};

// --- HELPER FUNCTION TO CALCULATE DURATION ---
const calculateLeaseDuration = (startDateString, endDateString) => {
  if (!startDateString || !endDateString) return '__________';
  
  const start = new Date(startDateString);
  const end = new Date(endDateString);
  
  // Calculate the difference in months
  let months = (end.getFullYear() - start.getFullYear()) * 12;
  months -= start.getMonth();
  months += end.getMonth();

  // Adjust for day difference (if end date is earlier in the month than start date, subtract 1 month)
  if (end.getDate() < start.getDate()) {
      months -= 1;
  }
  
  // Clean up and format the output
  if (months <= 0) return 'SHORT-TERM';
  
  if (months === 1) return 'ONE (1) MONTH';
  if (months === 3) return 'THREE (3) MONTHS'; // Fixed typo: was missing return
  if (months === 6) return 'SIX (6) MONTHS';
  if (months === 12) return 'ONE (1) YEAR';
  if (months === 24) return 'TWO (2) YEARS';

  // For other durations, show the month count
  return `${months} MONTHS`;
};
// -------------------------------------------------


const Bold = ({ children }) => (
  <span style={{ fontWeight: 'bold' }}>{children}</span>
);

// Added onClose prop for the Close button functionality
const ContractPreview = ({ booking, onClose }) => {
  const contractRef = useRef(null);
  
  // --- RENTAL CONSTANT ---
  const RENT_AMOUNT_PESOS = '5,000.00'; 
  const RENT_AMOUNT_WORDS = 'FIVE THOUSAND PESOS ONLY';
  // -----------------------
  
  if (!booking) {
    return (
      <div className="text-center text-red-600 font-semibold p-6 bg-red-50 rounded-lg border border-red-200">
        Error: No booking data provided to generate the contract.
      </div>
    );
  }

  // --- Destructuring and Date Assignment (UPDATED to use residentialAddress and fname) ---
  const { 
    stallNumber, 
    fname, 
    check_in, 
    check_out, 
    residentialAddress, // Use the new field name
    id_number // Assuming this is still needed, though not in the form
  } = booking; 
  
  const leaseStartDate = check_in;
  const leaseEndDate = check_out;
  // ----------------------------------------
  
  const stallNumberDisplay = stallNumber || '__________';
  // Note: fname now contains the full name (First Middle Last Suffix)
  const tenantName = fname ? fname.toUpperCase() : '______________________________'; 
  const tenantAddress = residentialAddress || '______________________________'; // Use the new data here
  const tenantID = id_number || '______________________________'; 
  
  const lessorName = 'NORIEL JANE SANTOS ALBA';
  const foodPlazaName = 'THE CORNER FOOD PLAZA';
  const contractLocation = 'BRGY. APOLLO, ORANI, BATAAN';
  const contractLocationSimple = 'Orani, Bataan'; // Used for the date footer

  // --- Calculate Duration for Display ---
  const leaseDuration = calculateLeaseDuration(leaseStartDate, leaseEndDate);

  // --- PDF Generation Logic (Long Bond: 8.5in x 13in or 215.9mm x 330.2mm) ---
  const generatePDF = async (action = 'download') => {
    if (!contractRef.current) return;
    const element = contractRef.current;
    // Select the first two pages only
    const pages = element.querySelectorAll('.page:nth-child(-n+2)');
    
    // Custom size for Long Bond
    const pdf = new jsPDF('p', 'mm', [215.9, 330.2]); 

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      page.style.zIndex = 9999;
      page.style.position = 'relative';

      const canvas = await html2canvas(page, {
        scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false,
        scrollX: 0, scrollY: 0, windowWidth: page.offsetWidth, windowHeight: page.offsetHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeight);

      page.style.zIndex = '';
      page.style.position = '';
    }

    if (action === 'print') {
      window.open(pdf.output('bloburl'), '_blank');
    } else {
      pdf.save('Lease_Agreement.pdf');
    }
  };

  // --- Section 4 Content (Extracted for relocation) ---
  const lesseeObligationsSection = (
    <>
      <h2 className="font-bold uppercase text-sm mt-6 mb-2 text-gray-900">4. LESSEE'S OBLIGATIONS (FOOD COURT COVENANTS)</h2>
      <ol className="list-decimal pl-8 space-y-1 leading-tight text-justify">
        <li className="font-bold text-red-700">
          <Bold>4.1. Licenses & Health:</Bold> The LESSEE must, at its own expense, secure and maintain all required government permits, including but not limited to: 
          (a) **DTI or SEC Registration**; 
          (b) **Barangay Clearance** and **Mayor's Business Permit**; 
          (c) **Sanitary Permit** and **Health Certificates** for all food handlers; 
          (d) **BIR Registration** and compliance; 
          (e) **Fire Safety Inspection Certificate**; and 
          (f) Mandatory **SSS, PhilHealth, and Pag-IBIG Fund** registration for all employees. 
          Copies of all current licenses and permits must be provided to the LESSOR immediately upon renewal.
        </li>            
        <li><Bold>4.2. Cleanliness and Maintenance:</Bold> The LESSEE is solely responsible for the sanitation and cleanliness of the stall interior, including all grease traps, exhaust hoods, and plumbing within the unit.</li>
        <li><Bold>4.3. Waste Disposal:</Bold> Garbage must be segregated and disposed of according to the Food Plaza's strict schedule and rules. **No dumping of food waste, oil, or grease into common drains is permitted.**</li>
        <li><Bold>4.4. Stall Equipment:</Bold> The LESSEE shall provide all its own equipment (stoves, refrigerators, exhaust fans, counters, etc.) and is responsible for its maintenance and repair.</li>
      </ol>
    </>
  );
  // ----------------------------------------------------


  // --- Contract Markup (Food Court Focus) ---
  return (
    <div className="relative z-50 text-gray-800">
      
      {/* --- NEW: Close Button at the Top Right --- */}
      {onClose && (
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="p-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition duration-200 ease-in-out flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-red-300"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* -------------------------------------- */}


      <div
        ref={contractRef}
        className="relative z-50 bg-gray-200 p-4 sm:p-8 print-preview"
        // TIGHTER LINE SPACING, SMALLER FONT, AND LEGAL FONT
        style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: '10.5pt', color: '#1a1a1a', lineHeight: 1.25 }} 
      >

        {/* PAGE 1 - Long Bond Size (8.5in x 13in) */}
        <div className="page bg-white p-10 mx-auto shadow-xl mb-6 border print:page-break-after"
             style={{ width: '816px', height: '1248px' }}>
          
          <div className="border-b-4 border-gray-900 pb-3 mb-6 -mt-1 -mx-2 sm:-mx-6">
             <h1 className="font-bold uppercase tracking-widest text-3xl text-center text-gray-900">FOOD STALL LEASE AGREEMENT</h1>
             <p className="text-center text-gray-600 text-base mt-2">{foodPlazaName}</p>
          </div>
          
          {/* INTRODUCTORY SECTION */}
          <p className="mb-4 text-justify leading-snug indent-8">
            This <Bold>FOOD STALL LEASE AGREEMENT</Bold> ("Agreement") is made and entered into this <Bold>{formatDateTime(leaseStartDate)}</Bold>, at <Bold>{contractLocation}</Bold>, by and between:
          </p>

          <div className="ml-8 mb-4">
            <p className="mb-1">
                <Bold>{lessorName}</Bold>, of legal age, Filipino, and residing at {contractLocation}, operating the Food Plaza, hereinafter referred to as the <Bold>LESSOR</Bold> or **Food Court Owner**;
            </p>
            <p className="mb-4 text-center">
                – AND –
            </p>
            {/* UPDATED LESSEE INFORMATION */}
            <p>
                <Bold>{tenantName}</Bold>, of legal age, Filipino, with residence at <Bold>{tenantAddress}</Bold>, hereinafter referred to as the <Bold>LESSEE</Bold> or **Food Stall Owner**.
            </p>
          </div>
          
          <p className="mb-4 text-justify leading-snug indent-8">
            <Bold>WITNESSETH:</Bold> The LESSOR hereby leases unto the LESSEE the Premises described below, and the LESSEE accepts the same subject to the terms and conditions hereinafter set forth.
          </p>

          
          <h2 className="font-bold uppercase text-sm mt-8 mb-2 text-gray-900">1. PREMISES AND TERM</h2>
          <ul className="list-disc pl-8 space-y-1 leading-tight text-justify">
            <li><Bold>1.1. Premises Leased:</Bold> Food Stall No. <Bold>{stallNumberDisplay}</Bold> within <Bold>{foodPlazaName}</Bold>, located at <Bold>{contractLocation}</Bold> (the "Premises").</li>
            
            <li>
                <Bold>1.2. Lease Term:</Bold> The term of this Lease shall be for a duration of **{leaseDuration}**, commencing on <Bold>{formatDateTime(leaseStartDate)}</Bold> and shall expire on <Bold>{formatDateTime(leaseEndDate)}</Bold>.
            </li>
          </ul>
          
          <h2 className="font-bold uppercase text-sm mt-6 mb-2 text-gray-900">2. RENTAL, DEPOSIT, AND PAYMENT</h2>
          <ul className="list-disc pl-8 space-y-1 leading-tight text-justify">
            {/* --- UPDATED RENT AMOUNTS --- */}
            <li><Bold>2.1. Monthly Rent:</Bold> The total monthly rental fee, which includes the base stall rent and a common area maintenance fee, shall be <Bold>₱{RENT_AMOUNT_PESOS}</Bold> (Pesos: {RENT_AMOUNT_WORDS}), payable in advance on the <Bold>15th</Bold> day of each calendar month.</li>
            <li><Bold>2.2. Security Deposit:</Bold> The LESSEE shall pay a Security Deposit equivalent to **ONE (1) MONTH** Rent, amounting to <Bold>₱{RENT_AMOUNT_PESOS}</Bold>. This deposit secures compliance with all terms, including cleanliness and repair, and is not rent.</li>
            <li><Bold>2.3. Advance Rent:</Bold> The LESSEE shall pay Advance Rent equivalent to **ONE (1) MONTH** Rent, amounting to <Bold>₱{RENT_AMOUNT_PESOS}</Bold>. This shall cover the rental payment for the **FINAL MONTH** of the Lease Term.</li>
            {/* ---------------------------- */}
          </ul>

          <h2 className="font-bold uppercase text-sm mt-6 mb-2 text-gray-900">3. UTILITIES AND PERMITTED USE</h2>
          <ul className="list-disc pl-8 space-y-1 leading-tight text-justify">
            <li>
              <Bold>3.1. Utilities:</Bold> The **LESSEE shall be solely responsible** for paying all charges for Electricity and Water consumption connected to the Premises. These charges shall be billed separately by the LESSOR based on sub-metered usage, and the LESSEE must pay these charges immediately upon presentation of the bill.
            </li>
            <li><Bold>3.2. Permitted Use:</Bold> The Premises shall be used strictly and exclusively for the preparation and sale of the Permitted Goods listed in Section 3.3. **No cooking or food preparation outside the designated stall area is allowed.**</li>
            <li><Bold>3.3. Schedule of Permitted Goods/Menu Items:</Bold>
              {/* MIN-HEIGHT INCREASED HERE (from min-h-[80px] to min-h-[120px]) */}
              <div className="border border-gray-600 p-3 min-h-[120px] font-sans text-xs leading-5 whitespace-pre-wrap bg-gray-50 mt-1 mb-2">
                <p className="font-semibold text-gray-700 underline">Permitted Menu:</p>
              </div>
            </li>
            {/* *** NEW CLAUSE ADDED HERE *** */}
            <li>
              <Bold>3.4. Furniture Provision:</Bold> The LESSOR provides communal **tables and chairs** for customer use in the common areas of the Food Plaza. The LESSEE is permitted to bring additional tables and chairs, provided they remain **strictly within the designated confines of the leased Premises (Stall No. {stallNumberDisplay})** and do not obstruct common pathways.
            </li>
            {/* ***************************** */}
          </ul>
          
        </div>

        {/* PAGE 2 - Long Bond Size (8.5in x 13in) */}
        <div className="page bg-white p-10 mx-auto shadow-xl border" 
             style={{ width: '816px', height: '1248px' }}>
          
          {/* SECTION 4 - LESSEE'S OBLIGATIONS (MOVED HERE) */}
          {lesseeObligationsSection}

          <h2 className="font-bold uppercase text-sm mt-6 mb-2 text-gray-900">5. INDEMNITY AND MANAGEMENT'S ROLE</h2>
          <p className="mb-4 leading-tight text-justify indent-8">
            <Bold>5.1. Indemnity:</Bold> The LESSEE agrees to **indemnify and hold the LESSOR/Management harmless** from any claim, suit, liability, or damage arising from the LESSEE’s operations, including any injury or food contamination caused by the LESSEE or its staff.
          </p>
          <p className="mb-4 leading-tight text-justify indent-8">
            <Bold>5.2. Management Responsibility:</Bold> The LESSOR is responsible only for the security, cleanliness, and maintenance of the common areas of the Food Plaza (i.e., customer tables, restrooms, and general hallways). The LESSOR is **not responsible** for any damage, theft, or loss of the LESSEE's goods or equipment within the stall.
          </p>
          
          <h2 className="font-bold uppercase text-sm mt-6 mb-2 text-gray-900">6. TERMINATION AND RENEWAL</h2>
          <ul className="list-disc pl-8 space-y-1 leading-tight text-justify">
            <li><Bold>6.1. Immediate Termination (Default):</Bold> Any failure to pay rent/utilities on time, non-compliance with health codes, or breach of any other covenant herein shall entitle the LESSOR to **immediately terminate** this Agreement and repossess the Premises.</li>
            <li><Bold>6.2. Notice:</Bold> Either party may terminate this Agreement with **thirty (30) days’ written notice** for valid cause, provided all payments are current.</li>
            <li><Bold>6.3. Renewal:</Bold> Renewal is **not automatic**. The LESSEE must notify the LESSOR in writing at least **sixty (60) days** prior to expiration. Renewal is subject to a review of the LESSEE's performance and the execution of a new contract at prevailing market rates.</li>
          </ul>
          
          <h2 className="font-bold uppercase text-sm mt-6 mb-2 text-gray-900">7. GOVERNING LAW AND ENTIRE AGREEMENT</h2>
          <p className="mb-4 leading-tight text-justify indent-8">
            <Bold>7.1. Governing Law:</Bold> This Agreement shall be governed by and construed in accordance with the laws of the <Bold>Republic of the Philippines</Bold>.
          </p>
          <p className="mb-4 leading-tight text-justify indent-8">
            <Bold>7.2. Entire Agreement:</Bold> This document constitutes the entire agreement between the Parties and supersedes all prior discussions, representations, or understandings.
          </p>
          
          <p className="mt-10 text-center font-bold text-base uppercase">
            IN WITNESS WHEREOF, the parties have hereunto set their hands on the date and place first above written.
          </p>

          {/* Signatures - TIGHTENED FORMAT */}
          <div className="mt-16 grid grid-cols-2 gap-10 text-center">
            
            <div className="mx-auto w-full">
              <div className="border-t border-gray-900 w-4/5 mx-auto pt-10" />
              <p className="font-semibold text-base mt-1 text-gray-900">{lessorName}</p>
              <p className="text-xs pt-0.5 text-gray-600">LESSOR / Management</p>
            </div>
            
            <div className="mx-auto w-full">
              <div className="border-t border-gray-900 w-4/5 mx-auto pt-10" />
              <p className="font-semibold text-base mt-1 text-gray-900">{tenantName}</p>
              <p className="text-xs pt-0.5 text-gray-600">LESSEE / Food Stall Owner</p>
            </div>
          </div>
          
          {/* *** TWO WITNESSES SECTION (NEW) *** */}
          <div className="mt-12 grid grid-cols-2 gap-10 text-center col-span-2">
            
            <div className="mx-auto w-full">
              <div className="border-t border-gray-900 w-4/5 mx-auto pt-10" />
              <p className="font-semibold text-base mt-1 text-gray-900">______________________________</p>
              <p className="text-xs pt-0.5 text-gray-600">WITNESS 1</p>
            </div>
            
            <div className="mx-auto w-full">
              <div className="border-t border-gray-900 w-4/5 mx-auto pt-10" />
              <p className="font-semibold text-base mt-1 text-gray-900">______________________________</p>
              <p className="text-xs pt-0.5 text-gray-600">WITNESS 2</p>
            </div>
          </div>
          {/* *** END WITNESSES SECTION *** */}


          <p className="mt-12 text-xs italic text-center text-gray-500 border-t pt-2 border-gray-300 col-span-2">
            Page 2 of 2. Executed on <Bold>{formatDateTime(leaseStartDate)}</Bold> at {contractLocationSimple}.
          </p>
        </div>
      </div>
      
      {/* --- MOVED: Download and Print Buttons Below the Contract --- */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => generatePDF('print')}
          className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-200 ease-in-out flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Print Contract"
        >
          <Printer className="w-5 h-5" />
          <span className="hidden sm:inline">Print 2-Page Agreement</span>
        </button>
        <button
          onClick={() => generatePDF('download')}
          className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition duration-200 ease-in-out flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Download PDF"
        >
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Download 2-Page PDF</span>
        </button>
      </div>
      {/* ----------------------------------------------------------- */}
    </div>
  );
};

export default ContractPreview;