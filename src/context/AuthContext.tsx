import { createContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import { Endpoints } from "../_services/endpoints.services";

interface CustomJwtPayload extends JwtPayload {
  user_id: number;
  user_lastname: string;
  user_firstname: string;
  user_role: string;
  user_profilepicture: string;
  user_email: string;
}

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomJwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
              setLoading(false);
            })
            .catch(() => {
              // Cannot restore session, logout
              localStorage.removeItem("token");
              setUser(null);
              setIsAuthenticated(false);
              setIsAdmin(false);
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
  };

  const logout = () => {
    Endpoints.logout();
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};
