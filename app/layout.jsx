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
  title: 'UniSpaces | Reserve your spot',
  description: 'Find and Reserve your Spaces',
};

export default function RootLayout({ children }) {
  return (
    <AuthWrapper>
      <html lang="en">
        <body className={inter.className}>
          <div
            className="min-h-screen bg-cover bg-center"
            style={{
              backgroundImage: "url(/images/backdrop.jpg)", 
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Header />
            
            {/* News Notification Section */}
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <NewsNotifPage />
            </section>
            
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </body>
      </html>
    </AuthWrapper>
  );
}
