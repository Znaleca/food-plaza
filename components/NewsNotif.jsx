'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import updateNews from '@/app/actions/newsUpdate';
import { createSessionClient } from '@/config/appwrite';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const NewsNotifPage = () => {
  const [news, setNews] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const { labels } = useAuth(); // Uses labels for access control

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { databases } = await createSessionClient();
        const response = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NEWS,
          'news'
        );
        setNews(response.news || 'No news available.');
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };

    fetchNews();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateNews(news);
      setEditMode(false);
    } catch (error) {
      alert('Failed to update news.');
      console.error('Error updating news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const isAdmin = labels?.includes('admin');

  return (
    <div className="fixed bottom-4 right-4 w-[500px] p-6 bg-white shadow-lg rounded-xl border z-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold text-black">New Deals!</h1>
        <button
          className="text-black hover:text-gray-400"
          onClick={() => setVisible(false)}
        >
          <FaTimes size={24} />
        </button>
      </div>

      {editMode ? (
        <textarea
          className="w-full p-4 mt-2 border-2 border-black rounded-lg bg-white text-gray-800"
          value={news}
          onChange={(e) => setNews(e.target.value)}
          disabled={loading}
          rows="6"
        />
      ) : (
        <p className="mt-2 text-black whitespace-pre-line">{news}</p>
      )}

      {isAdmin && (
        <div className="mt-4 flex space-x-4">
          {editMode ? (
            <>
              <button
                className="flex items-center px-6 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Save
                  </>
                )}
              </button>
              <button
                className="flex items-center px-6 py-3 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
            </>
          ) : (
            <button
              className="flex items-center px-6 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition"
              onClick={() => setEditMode(true)}
            >
              <FaEdit className="mr-2" /> Edit News
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsNotifPage;
