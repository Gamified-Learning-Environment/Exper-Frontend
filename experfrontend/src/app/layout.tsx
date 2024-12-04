import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { Poppins } from "next/font/google";
import { createUser } from "@/lib/actions/user.actions";
import { AuthProvider } from "@/contexts/auth.context";

const poppins = Poppins({ // Poppins font from Google Fonts
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});


export const metadata: Metadata = { // Metadata for the app
  title: "Exper",
  description: "Gamified Learning Environment",
  icons: {
    icon : "/assets/images/logo.svg",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode; }) { // Root Layout component
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <AuthProvider>
          <div className="flex h-screen flex-col"> 
            <Header />
                <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
