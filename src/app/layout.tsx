import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/auth/actions";
import { LogOut, Home, Settings, History, FileText, ShieldAlert } from "lucide-react";
import Link from 'next/link';
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Translate } from "@/components/Translate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Money Transfer Record System",
  description: "Responsive web-based money transfer record system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If we are not authenticated, just render children without navigation
  if (!user) {
    return (
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col md:flex-row pb-16 md:pb-0`}>
        <LanguageProvider>

          {/* Desktop Sidebar (hidden on mobile) */}
          <nav className="hidden md:flex bg-blue-700 text-white w-64 flex-shrink-0 min-h-screen z-10 sticky top-0 flex-col shadow-lg p-6">
            <div className="flex items-center mb-8 font-bold text-lg">
              <span><Translate tKey="nav.title" /></span>
            </div>

            <div className="flex flex-col space-y-2 items-start flex-1 w-full">
              <Link href="/" className="flex items-center space-x-3 w-full p-3 hover:bg-blue-600 rounded-lg transition-colors group">
                <Home className="w-5 h-5 text-blue-200 group-hover:text-white" />
                <span className="font-medium"><Translate tKey="nav.dashboard" /></span>
              </Link>
              <Link href="/transactions/history" className="flex items-center space-x-3 w-full p-3 hover:bg-blue-600 rounded-lg transition-colors group">
                <History className="w-5 h-5 text-blue-200 group-hover:text-white" />
                <span className="font-medium"><Translate tKey="nav.history" /></span>
              </Link>
              <Link href="/settings/categories" className="flex items-center space-x-3 w-full p-3 hover:bg-blue-600 rounded-lg transition-colors group">
                <Settings className="w-5 h-5 text-blue-200 group-hover:text-white" />
                <span className="font-medium"><Translate tKey="nav.settings" /></span>
              </Link>
            </div>

            <div className="mt-auto flex flex-col space-y-3 pt-6 w-full">
              <LanguageSwitcher />
              <form action={logout}>
                <button className="flex w-full items-center justify-center space-x-2 bg-blue-800 hover:bg-blue-900 p-3 rounded-lg transition-colors text-sm font-semibold text-blue-100">
                  <LogOut className="w-4 h-4" />
                  <span><Translate tKey="nav.logout" /></span>
                </button>
              </form>
            </div>
          </nav>

          {/* Mobile Header (hidden on desktop) */}
          <header className="md:hidden bg-blue-700 text-white w-full z-10 sticky top-0 h-16 shadow-md flex items-center justify-between px-4 flex-shrink-0">
            <div className="font-bold text-lg">
              <span><Translate tKey="nav.titleShort" /></span>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <form action={logout}>
                <button className="p-2 text-blue-200 hover:text-white hover:bg-blue-600 transition-colors rounded-full">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </header>

          {/* Mobile Bottom Tab Navigation (hidden on desktop) */}
          <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full z-50 h-16 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-700 active:bg-blue-50 transition-colors">
              <Home className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium"><Translate tKey="nav.dashboard" /></span>
            </Link>
            <Link href="/transactions/history" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-700 active:bg-blue-50 transition-colors">
              <History className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium"><Translate tKey="nav.history" /></span>
            </Link>
            <Link href="/settings/categories" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-700 active:bg-blue-50 transition-colors">
              <Settings className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium"><Translate tKey="nav.settings" /></span>
            </Link>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in-95 duration-200 overflow-x-hidden md:overflow-visible">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
