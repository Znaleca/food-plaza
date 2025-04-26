'use client';

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';
import checkAuth from '@/app/actions/checkAuth';
import UseVoucherButton from './UseVoucherButton';

const VoucherWallet = ({ onVoucherUsed }) => {
    const [vouchers, setVouchers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const claimedVouchers = await getAllClaimedVouchers();
            const { user } = await checkAuth();
            setVouchers(claimedVouchers);
            setUser(user);
            setLoading(false);
        };

        fetchData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
    };

    const refreshVouchers = async () => {
        const claimedVouchers = await getAllClaimedVouchers();
        setVouchers(claimedVouchers);
    };

    if (loading) return <p className="text-center text-gray-600">Loading vouchers...</p>;

    return (
        <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Voucher Wallet</h2>

            {vouchers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vouchers.map((voucher) => {
                        const isActive = new Date(voucher.valid_to).setHours(23, 59, 59, 999) >= new Date();
                        const imageSrc = '/images/percentage.jpg';
                        const isUsed = voucher.used_voucher === true;

                        return (
                            <div
                                key={voucher.$id}
                                className={`relative w-full max-w-md p-3 bg-white text-gray-900 border-2 border-yellow-400 rounded-lg shadow-lg flex items-center justify-between transform hover:scale-105 transition-all duration-300 
                                ${!isActive ? 'opacity-50' : ''}`}
                            >
                                {!isActive && (
                                    <>
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-5xl font-bold opacity-20 pointer-events-none">
                                            EXPIRED
                                        </div>
                                        <div className="absolute inset-0 w-full h-full border-t-4 border-b-4 border-gray-500 rotate-[-5deg] opacity-50 pointer-events-none"></div>
                                    </>
                                )}

                                <div className="w-24 h-24 bg-cover bg-center mr-4" style={{ backgroundImage: `url(${imageSrc})` }}></div>

                                <div className="flex flex-col flex-grow border-l-4 border-blue-400 pl-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-md font-bold text-gray-800">{voucher.title || 'Voucher Title'}</h3>
                                        <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-800 rounded-full">
                                            {voucher.discount || 'N/A'}% OFF
                                        </span>
                                    </div>

                                    <div className="text-xs text-gray-700">
                                        <p><span className="font-semibold">Valid From:</span> {formatDate(voucher.valid_from)}</p>
                                        <p><span className="font-semibold">Valid To:</span> {formatDate(voucher.valid_to)}</p>
                                    </div>

                                    {voucher.description && (
                                        <p className="mt-2 text-gray-600 text-xs italic">{voucher.description}</p>
                                    )}

                                    <div className="mt-2 flex items-center space-x-2 text-xs font-bold">
                                        {isActive ? (
                                            <FaCheckCircle className="text-green-400" />
                                        ) : (
                                            <FaTimesCircle className="text-red-400" />
                                        )}
                                        <span className={isActive ? 'text-green-600' : 'text-red-600'}>
                                            {isActive ? 'Active' : 'Expired'}
                                        </span>
                                    </div>
                                    {isActive && (
                                        <div className="mt-2">
                                            <UseVoucherButton
                                                voucherId={voucher.$id}
                                                isUsed={isUsed}
                                                onUsed={async (voucherUpdated) => {
                                                    // Update voucher list after use
                                                    await refreshVouchers();  // Refresh the vouchers list
                                                    if (onVoucherUsed) {
                                                        onVoucherUsed(voucherUpdated);  // Pass updated voucher info
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-600">No claimed vouchers found.</p>
            )}
        </div>
    );
};

export default VoucherWallet;
