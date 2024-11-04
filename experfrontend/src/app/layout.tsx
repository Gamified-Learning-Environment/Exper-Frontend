import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider, SignedOut, SignedIn, SignInButton, UserButton } from "@clerk/nextjs";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Exper",
  description: "Gamified Learning Environment",
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Header />
          <SignedOut>
          <div className="bg-gray-50 min-h-screen flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <h1 className="text-4xl font-bold">Welcome to Exper!</h1>
                <p className="text-lg">Please sign in to begin your learning...</p>
                <SignInButton />
              </div>
            </div>
          </SignedOut>
          <SignedIn>
          <div className="flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
            </div>
          </SignedIn>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
