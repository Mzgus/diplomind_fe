import React, { useState } from "react";
import Button from "../atoms/Buttons/Button";
import FormField from "../molecules/FormField";

interface LoginFormProps {
  onSubmit: (formData: any) => void;
  error?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error }) => {
  const [email, setEmail] = useState("");
  const [pwd, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Empêche le rechargement de la page
    // Appel de la fonction onSubmit passée en props avec les données du formulaire
    onSubmit({ email, pwd });
  };

  return (
    // Conteneur pour centrer le formulaire sur la page (repris de la v1)
    <div className="flex  items-center justify-center min-h-screen bg-background">
      <form
        onSubmit={handleSubmit}
        // Style du formulaire (repris de la v2)
        className="w-full max-w-sm rounded-xl bg-surface p-8 shadow-lg border border-border"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-text-main">
          Connexion
        </h2>
        {error && (
          <p className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700 border border-red-300">
            {error}
          </p>
        )}
        <div className="space-y-5">
          <FormField
            label="Email :"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email..."
            required
          />
          <FormField
            label="Mot de passe :"
            type="password"
            id="password"
            value={pwd}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe..."
            required
          />
          <Button
            type="submit"
            className="mt-3 w-full rounded-lg bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Se connecter
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
