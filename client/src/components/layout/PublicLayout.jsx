import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar.jsx';
import { Footer } from '../common/Footer.jsx';

export const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-ivory-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
