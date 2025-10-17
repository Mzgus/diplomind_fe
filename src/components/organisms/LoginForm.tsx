import React, { useState } from 'react';
import Button from '../atoms/Button';
import FormField from '../molecules/FormField';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Empêche le rechargement de la page
    // Ici, vous ajouteriez votre logique de connexion (ex: appel API)
    console.log('Tentative de connexion avec:', { email, password });
  };

  return (
    // Conteneur pour centrer le formulaire sur la page (repris de la v1)
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        // Style du formulaire (repris de la v2)
        className="w-full max-w-sm rounded-xl bg-[#2d3e4f] p-8 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Connexion</h2>
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe..."
          required
        />
        <Button
          type="submit"
          className="w-full rounded-lg bg-[#277da1] py-3 font-bold text-white transition-colors hover:bg-[#216b8a] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#2d3e4f]"
        >
          Se connecter
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;