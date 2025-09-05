import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header"; // <-- import Header directly
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthWrapper from "@/components/AuthWrapper";
import NewsNotif from "@/components/NewsNotif";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

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
          <ClientLayoutWrapper>
            {/* Header displayed on all pages */}
            <div className="fixed top-0 left-0 w-full z-[9999] bg-white shadow-md">
              <Header />
            </div>

            <div className="pt-16">
              <section className="w-full py-8">
                <NewsNotif />
              </section>

              <main className="w-full">{children}</main>
            </div>

            <Footer />
            <ToastContainer />
          </ClientLayoutWrapper>
        </body>
      </html>
    </AuthWrapper>
  );
}
