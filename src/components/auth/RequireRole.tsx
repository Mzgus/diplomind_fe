import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

interface RequireRoleProps {
  allowedRoles: string[];
}

/**
 * Route guard that redirects to "/" if the current user's role
 * is not included in allowedRoles.
 */
const RequireRole = ({ allowedRoles }: RequireRoleProps) => {
  const { user } = useContext(AuthContext);

  if (!user || !allowedRoles.includes(user.user_role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireRole;
