import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import TopNavbar from "../organisms/TopNavbar";
import Sidebar from "../organisms/Sidebar";

import { AuthContext } from "../../context/AuthContext";

const MainLayout: React.FC = () => {
  const { user, availableProfiles, selectProfile } = useContext(AuthContext);

  // Fallback data if user is somehow null in a protected route (shouldn't happen with RequireAuth)
  const userData = {
    name: user ? `${user.user_firstname} ${user.user_lastname}` : "Utilisateur",
    profileType: user?.user_role || "User",
    avatar: user?.user_profilepicture || "",
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopNavbar
        userName={userData.name}
        avatarUrl={userData.avatar}
        profileType={userData.profileType}
        availableProfiles={availableProfiles}
        onSwitchProfile={selectProfile}
      />
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
