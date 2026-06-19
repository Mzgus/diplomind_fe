import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { Endpoints } from "../_services/endpoints.services";
import LoginForm from "../components/organisms/LoginForm";
import { AuthContext } from "../context/AuthContext";
import { AuthService } from "../_services/auth.service";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (formData: any) => {
    setError(null);
    Endpoints.login(formData)
      .then(async (res) => {
        const token = res.data.token;
        login(token);

        try {
          const profilesRes = await AuthService.getMyProfiles();
          if (profilesRes.data.length > 1) {
            navigate("/select-profile");
          } else {
            navigate("/");
          }
        } catch {
          // If fetching profiles fails, default to home (or error)
          navigate("/");
        }
      })
      .catch((err) => {
        console.error("Login failed", err);
        setError("Identifiants invalides. Veuillez réessayer.");
      });
  };

  return <LoginForm onSubmit={handleLogin} error={error} />;
}

export default Login;
