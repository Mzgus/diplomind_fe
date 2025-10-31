import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";

// Données et colonnes fictives pour les projets
const projectColumns = [
  { key: "name", header: "Nom du Projet" },
  { key: "client", header: "Client" },
  { key: "deadline", header: "Échéance" },
  { key: "status", header: "Statut" },
];

const projectData = [
  {
    name: "Refonte Site E-commerce",
    client: "Client A",
    deadline: "31/12/2024",
    status: "En cours",
  },
  {
    name: "Application Mobile",
    client: "Client B",
    deadline: "15/11/2024",
    status: "En cours",
  },
  {
    name: "Outil de gestion interne",
    client: "Interne",
    deadline: "01/10/2024",
    status: "Terminé",
  },
  {
    name: "Campagne Marketing",
    client: "Client C",
    deadline: "20/12/2024",
    status: "Planifié",
  },
];

const Project: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Logique de filtrage pour les projets
  const filteredProjects = projectData.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout
      title="Projets"
      searchQuery={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      searchPlaceholder="Rechercher un projet..."
      buttonText="Ajouter un projet"
      onButtonClick={() => console.log("Ajouter un projet cliqué")}
      columns={projectColumns}
      data={filteredProjects}
    />
  );
};

export default Project;
