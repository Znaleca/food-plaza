'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { updateNews } from '@/app/actions/newsUpdate';
import { createSessionClient } from '@/config/appwrite';
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
    <div className=" fixed bottom-4 right-4 w-96 p-4 bg-white shadow-lg rounded-lg border">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">News Notification</h1>
        <button
          className="text-gray-600 hover:text-gray-800"
          onClick={() => setVisible(false)}
        >
          ✕
        </button>
      </div>

      {editMode ? (
        <textarea
          className="w-full p-2 mt-2 border rounded"
          value={news}
          onChange={(e) => setNews(e.target.value)}
          disabled={loading}
        />
      ) : (
        <p className="mt-2 text-gray-800">{news}</p>
      )}

      {roles.isAdmin || roles.isSuperAdmin ? (
        <div className="mt-4 flex space-x-2">
          {editMode ? (
            <>
              <button
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
              onClick={() => setEditMode(true)}
            >
              Edit News
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default NewsNotifPage;
