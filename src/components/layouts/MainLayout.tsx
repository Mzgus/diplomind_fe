import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../organisms/TopNavbar';
import Sidebar from '../organisms/Sidebar';

const MainLayout: React.FC = () => {
  // Les données utilisateur sont maintenant gérées dans le layout principal
  const userData = {
    name: 'Franchomme Maxime',
    avatar: 'https://i.imgur.com/L5nB0m8.jpeg',
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopNavbar userName={userData.name} avatarUrl={userData.avatar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Les routes enfants (comme Home, Dashboard, etc.) seront rendues ici */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;