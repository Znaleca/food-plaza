'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import updateNews from '@/app/actions/newsUpdate';
import { createSessionClient } from '@/config/appwrite';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const NewsNotif = () => {
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
        setNews(response.news?.trim() ? response.news : 'No news available.');
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
    <div
      className="
        fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 
        w-[260px] sm:max-w-[480px] 
        bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl animate-fade-in overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center 
        px-3 py-2 sm:px-6 sm:py-4 
        bg-gradient-to-r from-black to-zinc-800 text-white">
        <div className="flex-1">
          <h2 className="text-sm sm:text-lg font-bold">Announcement</h2>
          <p className="text-[10px] sm:text-sm text-gray-300">Stay informed with real-time updates</p>
        </div>
        <button onClick={() => setVisible(false)} className="hover:text-pink-500 transition ml-2">
          <FaTimes size={14} className="sm:size-[18px]" />
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-2 sm:px-6 sm:py-4 text-gray-100 
        max-h-[30vh] sm:max-h-[60vh] overflow-y-auto 
        text-xs sm:text-base">
        {editMode ? (
          <textarea
            value={news}
            onChange={(e) => setNews(e.target.value)}
            disabled={loading}
            rows={4}
            className="w-full p-2 text-xs sm:text-base border border-zinc-700 bg-zinc-800 text-white rounded-md resize-none focus:ring-2 focus:ring-pink-500 outline-none"
          />
        ) : (
          <p className="whitespace-pre-line">{news}</p>
        )}

        {isAdmin && (
          <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row justify-end gap-1 sm:gap-4">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center justify-center gap-1 sm:gap-2 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition disabled:opacity-60 w-full sm:w-auto"
                >
                  {loading ? 'Saving...' : (<><FaSave size={12} className="sm:size-[16px]" /> Save</>)}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                  className="flex items-center justify-center gap-1 sm:gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition w-full sm:w-auto"
                >
                  <FaTimes size={12} className="sm:size-[16px]" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition w-full sm:w-auto"
              >
                <FaEdit size={12} className="sm:size-[16px]" /> Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsNotif;
