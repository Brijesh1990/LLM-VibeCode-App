import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';
import Footer from './Footer';

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A]">
      <Sidebar />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children || <Outlet />}
        </main>
        <Footer />
      </div>
    </div>
  );
}
