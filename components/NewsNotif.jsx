// Custom hook to handle fetching the news (Admin Client so it works on iOS too)
import { useState, useEffect } from "react";
import { createAdminClient } from "@/config/appwrite";
import { Query } from "node-appwrite";

const useFetchNews = () => {
  const [news, setNews] = useState("No news available.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const { databases } = await createAdminClient();
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NEWS;

        if (!databaseId || !collectionId) {
          console.error("Missing Appwrite environment variables.");
          throw new Error("Configuration error");
        }

        const response = await databases.listDocuments(
          databaseId,
          collectionId,
          [Query.orderDesc("$createdAt"), Query.limit(1)]
        );

        const latestNews = response.documents[0]?.news?.trim();
        setNews(latestNews || "No news available.");
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNews("No news available.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { news, setNews, loading };
};

export default useFetchNews;
