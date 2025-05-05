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
            const { user } = await checkAuth();
            setUser(user);

            const claimedVouchers = await getAllClaimedVouchers(user);
            setVouchers(claimedVouchers);
            setLoading(false);
        };

        fetchData();
    }, []);

    const refreshVouchers = async () => {
        if (user) {
            const claimedVouchers = await getAllClaimedVouchers(user);
            setVouchers(claimedVouchers);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
    };

    if (loading) return <p className="text-center text-gray-600">Loading vouchers...</p>;

    return (
        <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-white shadow-sm rounded-lg">
            <h2 className="text-2xl font-medium text-gray-900 text-center mb-6">Voucher Wallet</h2>

            {vouchers.length > 0 ? (
                <div className="space-y-6">
                    {vouchers.map((voucher) => {
                        const isActive = new Date(voucher.valid_to).setHours(23, 59, 59, 999) >= new Date();
                        const isUsed = voucher.used_voucher === true;

                        return (
                            <div
                                key={voucher.$id}
                                className={`relative w-full max-w-md mx-auto p-4 bg-white text-gray-900 rounded-lg transition-all duration-300 
                                ${!isActive ? 'opacity-60' : 'shadow-md hover:shadow-lg'} border-2 border-pink-600 
                                ${!isActive ? 'border-opacity-50' : ''} `}
                            >
                                {!isActive && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl font-semibold opacity-40 pointer-events-none">
                                        EXPIRED
                                    </div>
                                )}

                                <div className="flex items-center space-x-4">
                                    <div
                                        className="w-16 h-16 bg-cover bg-center rounded-full"
                                        style={{ backgroundImage: `url('/images/percentage.jpg')` }}
                                    ></div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800">{voucher.title || 'Voucher Title'}</h3>
                                        <p className="text-sm text-gray-600">{voucher.discount}% OFF</p>
                                        <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                                            <span><strong>Valid From:</strong> {formatDate(voucher.valid_from)}</span>
                                            <span><strong>Valid To:</strong> {formatDate(voucher.valid_to)}</span>
                                        </div>
                                    </div>
                                </div>

                                {voucher.description && (
                                    <p className="mt-2 text-gray-600 text-xs italic">{voucher.description}</p>
                                )}

                                <div className="mt-3 flex items-center space-x-3">
                                    {isActive ? (
                                        <FaCheckCircle className="text-green-500 text-lg" />
                                    ) : (
                                        <FaTimesCircle className="text-red-500 text-lg" />
                                    )}
                                    <span className={`text-sm ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {isActive ? 'Active' : 'Expired'}
                                    </span>
                                </div>

                                {isActive && (
                                    <div className="mt-4">
                                        <UseVoucherButton
                                            voucherId={voucher.$id}
                                            isUsed={isUsed}
                                            onUsed={async (voucherUpdated) => {
                                                await refreshVouchers();
                                                if (onVoucherUsed) {
                                                    onVoucherUsed(voucherUpdated);
                                                }
                                            }}
                                        />
                                    </div>
                                )}
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
