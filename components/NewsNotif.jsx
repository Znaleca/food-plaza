'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/authContext';
import updateNews from '@/app/actions/newsUpdate';
import { createSessionClient } from '@/config/appwrite';
import { Query } from 'node-appwrite';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

// Custom hook to handle fetching the news
const useFetchNews = () => {
  const [news, setNews] = useState('No news available.');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const { databases } = await createSessionClient();
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NEWS;

        if (!databaseId || !collectionId) {
          console.error('Missing Appwrite environment variables.');
          throw new Error('Configuration error');
        }

        const response = await databases.listDocuments(
          databaseId,
          collectionId,
          [Query.orderDesc('$createdAt'), Query.limit(1)]
        );

        const latestNews = response.documents[0]?.news?.trim();
        setNews(latestNews || 'No news available.');
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return { news, setNews, loading };
};

const NewsNotif = () => {
  const [editMode, setEditMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { labels } = useAuth();
  const { news, setNews, loading: isFetching } = useFetchNews();

  const isAdmin = labels?.includes('admin');

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateNews(news);
      setEditMode(false);
      alert('News updated successfully!');
    } catch (error) {
      alert('Failed to update news. Please try again.');
      console.error('Error updating news:', error);
    } finally {
      setIsSaving(false);
    }
  }, [news]);

  const handleEditClick = () => setEditMode(true);
  const handleCancelClick = () => setEditMode(false);
  const handleClose = () => setIsVisible(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-8 sm:right-8 sm:left-auto z-[9999] w-auto sm:max-w-[480px] bg-white border border-gray-300 shadow-2xl rounded-2xl animate-fade-in overflow-hidden text-gray-900">
      <div className="flex justify-end p-2">
        <button
          onClick={handleClose}
          aria-label="Close news notification"
          className="text-gray-500 hover:text-red-500 transition"
        >
          <FaTimes size={18} />
        </button>
      </div>

      <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-base sm:text-lg max-h-[70vh] overflow-y-auto">
        {isFetching ? (
          <p>Loading news...</p>
        ) : (
          editMode ? (
            <textarea
              value={news}
              onChange={(e) => setNews(e.target.value)}
              disabled={isSaving}
              rows={6}
              className="w-full p-3 sm:p-4 text-base border border-gray-300 bg-gray-50 text-gray-900 rounded-md resize-none focus:ring-2 focus:ring-pink-500 outline-none"
              aria-label="Edit news content"
            />
          ) : (
            <p className="whitespace-pre-line break-words">{news}</p>
          )
        )}
        
        {isAdmin && (
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 text-base font-medium rounded-lg transition disabled:opacity-60 w-full sm:w-auto"
                >
                  {isSaving ? 'Saving...' : (<><FaSave /> Save</>)}
                </button>
                <button
                  onClick={handleCancelClick}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-base font-medium rounded-lg transition w-full sm:w-auto"
                >
                  <FaTimes /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditClick}
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-base font-medium rounded-lg transition w-full sm:w-auto"
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

export default NewsNotif;