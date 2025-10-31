import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";

// Données et colonnes fictives pour les étapes
const stepColumns = [
  { key: "name", header: "Nom de l'étape" },
  { key: "project", header: "Projet Associé" },
  { key: "order", header: "Ordre" },
  { key: "status", header: "Statut" },
];

const stepData = [
  {
    name: "Maquettage",
    project: "Refonte Site E-commerce",
    order: 1,
    status: "Terminé",
  },
  {
    name: "Développement Front",
    project: "Refonte Site E-commerce",
    order: 2,
    status: "En cours",
  },
  {
    name: "Développement Back",
    project: "Refonte Site E-commerce",
    order: 3,
    status: "À faire",
  },
  {
    name: "Phase de test",
    project: "Application Mobile",
    order: 4,
    status: "À faire",
  },
];

const Steps: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Logique de filtrage pour les étapes
  const filteredSteps = stepData.filter((step) =>
    step.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout
      title="Étapes"
      searchQuery={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      searchPlaceholder="Rechercher une étape..."
      buttonText="Ajouter une étape"
      onButtonClick={() => console.log("Ajouter une étape cliqué")}
      columns={stepColumns}
      data={filteredSteps}
    />
  );
};

export default Steps;
