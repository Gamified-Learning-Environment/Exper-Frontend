import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignedOut, SignedIn, SignInButton, UserButton } from "@clerk/nextjs";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { Poppins } from "next/font/google";

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

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={poppins.variable}>
          <div className="flex h-screen flex-col"> 
            <Header />
                <main className="flex-1">{children}</main>
            <Footer />
          </div>
      </body>
    </html>
    </ClerkProvider>
  );
}
