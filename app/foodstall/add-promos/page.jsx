'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Heading from '@/components/Heading';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('claimed_users', JSON.stringify([]));
    formAction(formData);
  };

  return (
    <>
      <Heading title="Add a Promotion" className="text-center mb-8 text-3xl font-extrabold text-gray-900" />
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Title</label>
            <input
              type="text"
              name="title"
              required
              className="border border-gray-300 rounded-lg w-full py-2 px-4"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              name="description"
              required
              className="border border-gray-300 rounded-lg w-full h-24 py-2 px-4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Discount (%)</label>
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
              <label className="block text-gray-700 font-semibold mb-2">Quantity of Promos</label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                className="border border-gray-300 rounded-lg w-full py-2 px-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Valid From</label>
              <input
                type="date"
                name="valid_from"
                required
                className="border border-gray-300 rounded-lg w-full py-2 px-4"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Valid To</label>
              <input
                type="date"
                name="valid_to"
                required
                className="border border-gray-300 rounded-lg w-full py-2 px-4"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all"
            >
              Save Promotion
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddPromosPage;
