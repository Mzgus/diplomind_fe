import React, { useState } from "react";
import SearchBar from "../components/molecules/SearchBar";
import Button from "../components/atoms/Button";

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Utilisateurs</h1>
      <div className="flex items-center justify-between mb-8">
        <div className="w-3/4 mr-4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un utilisateur..."
          />
        </div>
        <div className="w-1/4">
          <Button className="w-full">Ajouter un utilisateur</Button>
        </div>
      </div>
      {/* Le contenu de votre page (liste des utilisateurs, etc.) viendra ici */}
    </div>
  );
};

export default Users;
