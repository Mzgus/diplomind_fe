import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import type { UserSheet } from "../types";
import StatusBadge from "../components/atoms/StatusBadge";

const SelectProfile = () => {
  const { availableProfiles, selectProfile, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if no profiles (or already logged in seamlessly - though logic suggests we are here because >1)
  if (user && availableProfiles.length === 0) {
    return <Navigate to="/" />;
  }

  const handleSelect = async (profileId: number) => {
    await selectProfile(profileId);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-4xl p-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-text-main mb-2">
            Bienvenue, {user?.user_firstname}
          </h1>
          <p className="text-text-secondary text-lg">
            Séléctionnez un profil pour continuer
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {availableProfiles.map((profile: UserSheet) => (
            <button
              key={profile.id}
              onClick={() => handleSelect(profile.id)}
              className="group relative flex flex-col items-center bg-surface border border-border rounded-xl p-8 transition-all duration-300 hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 w-64"
            >
              <div className="mb-6 relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors duration-300">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      profile.profile_picture ||
                      `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=random`
                    }
                    alt={`${profile.first_name} ${profile.last_name}`}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <StatusBadge type="role" value={profile.type_user} />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-text-main mb-1 group-hover:text-primary transition-colors">
                {profile.first_name} {profile.last_name}
              </h3>              
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary/10 pointer-events-none"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectProfile;
