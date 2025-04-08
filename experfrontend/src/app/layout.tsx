import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { Poppins } from "next/font/google";
import { createUser } from "@/lib/actions/user.actions";
import { AuthProvider } from "@/contexts/auth.context";
import { GamificationProvider } from '@/components/shared/GamificationNotification';
import { CustomizationProvider } from '@/contexts/customization.context';

// Poppins font from Google Fonts
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});


export const metadata: Metadata = { 
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
        <CustomizationProvider>
          <GamificationProvider>
            <AuthProvider>
              <div className="flex h-screen flex-col"> 
                <Header />
                    <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </GamificationProvider>
        </CustomizationProvider>
      </body>
    </html>
  );
}
