import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthWrapper from "@/components/AuthWrapper";
import NewsNotifPage from "@/components/NewsNotif";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Corner | Food Plaza",
  description: "Eat your Favorites",
};

export default function RootLayout({ children }) {
  return (
    <AuthWrapper>
      <html lang="en">
        <body className={`${inter.className} min-h-screen bg-neutral-900 text-white`}>
          {/* Highest z-index Header */}
          <div className="fixed top-0 left-0 w-full z-[9999] bg-white shadow-md">
            <Header />
          </div>

          {/* Main Content with padding for fixed header */}
          <div className="pt-16">
            {/* News Notification */}
            <section className="w-full py-8">
              <NewsNotifPage />
            </section>

            {/* Page Content */}
            <main className="w-full">{children}</main>
          </div>

          <Footer />
          <ToastContainer />
        </body>
      </html>
    </AuthWrapper>
  );
}
