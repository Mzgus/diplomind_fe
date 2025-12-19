import { createContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import { Endpoints } from "../_services/endpoints.services";

interface CustomJwtPayload extends JwtPayload {
  isAdmin: boolean;
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
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      setUser(decodedToken);
      setIsAuthenticated(true);
      setIsAdmin(decodedToken.isAdmin);
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decodedToken = jwtDecode<CustomJwtPayload>(token);
    setUser(decodedToken);
    setIsAuthenticated(true);
    setIsAdmin(decodedToken.isAdmin);
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
