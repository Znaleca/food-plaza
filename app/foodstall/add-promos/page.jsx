'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import createPromos from '@/app/actions/createPromos';

const AddPromosPage = () => {
    const [state, formAction] = useFormState(createPromos, { success: false, error: null });
    const router = useRouter();
  
    useEffect(() => {
      if (state.error) toast.error(state.error);
      if (state.success) {
        toast.success('Promo added successfully!');
        router.push('/foodstall/promos');
      }
    }, [state, router]);
  
    const handleSubmit = (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);

      // Ensure claimed_users is included as an empty array in promo creation
      formData.append('claimed_users', JSON.stringify([]));
      
      formAction(formData);
    };

    return (
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add a New Promo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold">Title</label>
            <input
              type="text"
              name="title"
              required
              className="border border-gray-300 rounded-lg w-full py-2 px-4"
            />
          </div>
  
          <div>
            <label className="block text-gray-700 font-semibold">Description</label>
            <textarea
              name="description"
              required
              className="border border-gray-300 rounded-lg w-full py-2 px-4 h-24"
            />
          </div>
  
          <div>
            <label className="block text-gray-700 font-semibold">Discount (%)</label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              required
              className="border border-gray-300 rounded-lg w-full py-2 px-4"
            />
          </div>
  
          <div>
            <label className="block text-gray-700 font-semibold">Quantity (per user)</label>
            <input
              type="number"
              name="quantity"
              min="1"
              required
              className="border border-gray-300 rounded-lg w-full py-2 px-4"
            />
          </div>
  
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold">Valid From</label>
              <input
                type="date"
                name="valid_from"
                required
                className="border border-gray-300 rounded-lg w-full py-2 px-4"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">Valid To</label>
              <input
                type="date"
                name="valid_to"
                required
                className="border border-gray-300 rounded-lg w-full py-2 px-4"
              />
            </div>
          </div>
  
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 w-full"
          >
            Save Promo
          </button>
        </form>
      </div>
    );
};

export default AddPromosPage;
