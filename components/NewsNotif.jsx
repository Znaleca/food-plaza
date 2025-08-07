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
  const { labels } = useAuth();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { databases } = await createSessionClient();
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NEWS;

        if (!databaseId || !collectionId) {
          console.error('Missing Appwrite environment variables.');
          return;
        }

        const response = await databases.getDocument(databaseId, collectionId, 'news');
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
    <div className="fixed bottom-4 right-0 left-0 sm:bottom-8 sm:right-8 sm:left-auto z-50 w-full max-w-[480px] mx-4 sm:mx-0 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-black to-zinc-800 text-white">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">Announcement</h2>
          <p className="text-sm text-gray-300">Stay informed with real-time updates</p>
        </div>
        <button onClick={() => setVisible(false)} className="hover:text-pink-500 transition">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 text-gray-100">
        {editMode ? (
          <textarea
            value={news}
            onChange={(e) => setNews(e.target.value)}
            disabled={loading}
            rows={6}
            className="w-full p-3 sm:p-4 text-base border border-zinc-700 bg-zinc-800 text-white rounded-md resize-none focus:ring-2 focus:ring-pink-500 outline-none"
          />
        ) : (
          <p className="text-base whitespace-pre-line">{news}</p>
        )}

        {isAdmin && (
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 text-sm font-medium rounded-lg transition disabled:opacity-60 w-full sm:w-auto"
                >
                  {loading ? 'Saving...' : (<><FaSave /> Save</>)}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 text-sm font-medium rounded-lg transition w-full sm:w-auto"
                >
                  <FaTimes /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 text-sm font-medium rounded-lg transition w-full sm:w-auto"
              >
                <FaEdit /> Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsNotifPage;
