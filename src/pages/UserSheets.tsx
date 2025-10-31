import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";

  // Données et colonnes fictives pour les fiches utilisateur
const userSheetColumns = [
  { key: "userName", header: "Utilisateur" },
  { key: "className", header: "Classe" },
  { key: "completion", header: "Complétion" },
  { key: "lastUpdate", header: "Dernière MàJ" },
];

const userSheetData = [
  {
    userName: "Alice Martin",
    className: "Développeur Web - 2024",
    completion: "80%",
    lastUpdate: "10/07/2024",
  },
  {
    userName: "Bob Garcia",
    className: "Développeur Web - 2024",
    completion: "65%",
    lastUpdate: "08/07/2024",
  },
  {
    userName: "Charlie Brown",
    className: "Designer UI/UX - 2024",
    completion: "95%",
    lastUpdate: "11/07/2024",
  },
];

const UserSheets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Logique de filtrage pour les fiches
  const filteredUserSheets = userSheetData.filter((sheet) =>
    sheet.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout
      title="Fiches Utilisateur"
      searchQuery={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      searchPlaceholder="Rechercher une fiche..."
      buttonText="Ajouter une fiche"
      onButtonClick={() => console.log("Ajouter une fiche cliqué")}
      columns={userSheetColumns}
      data={filteredUserSheets}
    />
  );
};

export default UserSheets;
