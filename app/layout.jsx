import { Poppins } from "next/font/google"; // Import Poppins
import "@/assets/styles/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthWrapper from "@/components/AuthWrapper";
import NewsNotif from "@/components/NewsNotif";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

// Configure Poppins font with desired weights
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Specify weights you want to use
});

export const metadata = {
  title: "The Corner | Food Plaza",
  description: "Eat your Favorites",
};

export default function RootLayout({ children }) {
  return (
    <AuthWrapper>
      <html lang="en">
        {/* Use the Poppins font class on the body */}
        <body className={`${poppins.className} min-h-screen bg-neutral-900 text-white`}>
          <ClientLayoutWrapper>
            <Header />

            <div className="pt-20"> 
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