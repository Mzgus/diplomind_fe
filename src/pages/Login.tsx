import { useNavigate } from "react-router-dom";
import React, { useState, useContext } from "react";
import { Endpoints } from "../_services/endpoints.services";
import LoginForm from "../components/organisms/LoginForm";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = (formData: any) => {
    Endpoints.login(formData)
      .then((res) => {
        login(res.data.token);
        navigate("/");
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          setError(err.response.data);
        } else {
          setError({
            message: "Une erreur s'est produite lors de la connexion.",
          });
        }
      });
  };

  return <LoginForm onSubmit={handleLogin} />;
}

export default Login;
