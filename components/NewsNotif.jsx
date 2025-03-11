'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { updateNews } from '@/app/actions/newsUpdate';
import { createSessionClient } from '@/config/appwrite';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa'; // Import icons for better UI

const NewsNotifPage = () => {
  const [news, setNews] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const { roles } = useAuth();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { databases } = await createSessionClient();
        const response = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NEWS,
          'news' // Document ID
        );
        setNews(response.news || "No news available."); // Access `news` attribute
      } catch (error) {
        console.error("Failed to fetch news:", error);
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
      alert("Failed to update news.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 p-4 bg-gradient-to-r from-yellow-400 to-blue-400 shadow-lg rounded-lg border z-50">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">New Deals!</h1>
        <button
          className="text-white hover:text-gray-200"
          onClick={() => setVisible(false)}
        >
          <FaTimes size={20} />
        </button>
      </div>

      {editMode ? (
        <textarea
          className="w-full p-2 mt-2 border rounded bg-white text-gray-800"
          value={news}
          onChange={(e) => setNews(e.target.value)}
          disabled={loading}
        />
      ) : (
        <p className="mt-2 text-white">{news}</p>
      )}

      {roles.isAdmin || roles.isSuperAdmin ? (
        <div className="mt-4 flex space-x-2">
          {editMode ? (
            <>
              <button
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <span>Saving...</span> : <><FaSave className="mr-1" /> Save</>}
              </button>
              <button
                className="flex items-center px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                <FaTimes className="mr-1" /> Cancel
              </button>
            </>
          ) : (
            <button
              className="flex items-center px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
              onClick={() => setEditMode(true)}
            >
              <FaEdit className="mr-1" /> Edit News
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default NewsNotifPage;