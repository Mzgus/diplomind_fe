import { createContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import { Endpoints } from "../_services/endpoints.services";
import { AuthService } from "../_services/auth.service";
import type { UserSheet } from "../types";

export interface CustomJwtPayload extends JwtPayload {
  user_id: number;
  user_lastname: string;
  user_firstname: string;
  user_role: string;
  user_profilepicture: string;
  user_email: string;
}

interface AuthContextType {
  user: CustomJwtPayload | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  availableProfiles: UserSheet[];
  selectProfile: (user_sheet_id: number) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomJwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<UserSheet[]>([]);

  const fetchProfiles = async () => {
    try {
      const res = await AuthService.getMyProfiles();
      setAvailableProfiles(res.data);
    } catch (e) {
      console.error("Failed to fetch profiles", e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token with backend
      Endpoints.verifyToken()
        .then((res) => {
          // Token is valid, set user from server response
          const userData = res.data;
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(userData.user_role === "admin");
          fetchProfiles(); // Fetch profiles on verify success
          setLoading(false);
        })
        .catch(() => {
          // Token invalid or expired, try to refresh
          Endpoints.refreshTokens()
            .then((res) => {
              // Successfully refreshed, login with new token
              const newToken = res.data.token;
              localStorage.setItem("token", newToken);
              const decodedToken = jwtDecode<CustomJwtPayload>(newToken);
              setUser(decodedToken);
              setIsAuthenticated(true);
              setIsAdmin(decodedToken.user_role === "admin");
              fetchProfiles(); // Fetch profiles on refresh success
              setLoading(false);
            })
            .catch(() => {
              // Cannot restore session, logout
              localStorage.removeItem("token");
              setUser(null);
              setIsAuthenticated(false);
              setIsAdmin(false);
              setAvailableProfiles([]);
              setLoading(false);
            });
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decodedToken = jwtDecode<CustomJwtPayload>(token);
    setUser(decodedToken);
    setIsAuthenticated(true);
    setIsAdmin(decodedToken.user_role === "admin");
    fetchProfiles(); // Fetch profiles on login
  };

  const selectProfile = async (user_sheet_id: number) => {
    try {
      const res = await AuthService.switchProfile(user_sheet_id);
      const newToken = res.data.token;
      login(newToken);
      // Optional: Force reload or just let state update
    } catch (e) {
      console.error("Failed to switch profile", e);
    }
  };

  const logout = () => {
    Endpoints.logout();
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAvailableProfiles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated,
        isAdmin,
        availableProfiles,
        selectProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import { useContext } from "react";
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
