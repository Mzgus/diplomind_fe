import React, { useState } from "react";
import SearchBar from "../components/molecules/SearchBar";
import Button from "../components/atoms/Button";

const Steps: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Étapes</h1>
      <div className="flex items-center justify-between mb-8">
        <div className="w-3/4 mr-4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une étape..."
          />
        </div>
        <div className="w-1/4">
          <Button className="w-full">Ajouter une étape</Button>
        </div>
      </div>
      {/* Le contenu de votre page (liste des étapes, etc.) viendra ici */}
    </div>
  );
};

export default Steps;
