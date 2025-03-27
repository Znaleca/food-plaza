import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthWrapper from "@/components/AuthWrapper";
import NewsNotifPage from "@/components/NewsNotif";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'The Corner | Food Plaza',
  description: 'Eat your Favorites',
};

export default function RootLayout({ children }) {
  return (
    <AuthWrapper>
      <html lang="en">
        <body className={`${inter.className} min-h-screen`}>
          <div
            className="min-h-screen bg-cover bg-center"
            style={{
              backgroundImage: "url(/images/menu.jpg)", 
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Fixed Header */}
            <Header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md" />

            {/* Removed Extra Space Above */}
            <div className="w-full max-w-screen-2xl mx-auto px-8">
              {/* News Notification Section */}
              <section className="w-full py-8">
                <NewsNotifPage />
              </section>

              {/* Main Content - Made Wider */}
              <main className="w-full py-10">
                {children}
              </main>
            </div>

            {/* Footer (Unchanged) */}
            <Footer />

            {/* Toast Notifications */}
            <ToastContainer />
          </div>
        </body>
      </html>
    </AuthWrapper>
  );
}
