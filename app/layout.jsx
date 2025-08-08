import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";
import Footer from "@/components/Footer";
import HeaderWrapper from "@/components/HeaderWrapper";
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
          {/* Header hidden on /login and /register */}
          <HeaderWrapper />

          <div className="pt-16">
            <section className="w-full py-8">
              <NewsNotifPage />
            </section>

            <main className="w-full">{children}</main>
          </div>

          <Footer />
          <ToastContainer />
        </body>
      </html>
    </AuthWrapper>
  );
}
