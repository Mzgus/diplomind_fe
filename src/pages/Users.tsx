import React, { useState } from "react";
import PageLayout from "../components/templates/PageLayout";
import DataTable from "../components/organisms/DataTable";

// Données et colonnes fictives pour l'exemple
const userColumns = [
  { key: "name", header: "Nom" },
  { key: "email", header: "Email" },
  { key: "role", header: "Rôle" },
  { key: "status", header: "Statut" },
];

const userData = [
  {
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    role: "Admin",
    status: "Actif",
  },
  {
    name: "Marie Curie",
    email: "marie.curie@example.com",
    role: "Utilisateur",
    status: "Actif",
  },
  {
    name: "Pierre Martin",
    email: "pierre.martin@example.com",
    role: "Utilisateur",
    status: "Inactif",
  },
  {
    name: "Sophie Lambert",
    email: "sophie.lambert@example.com",
    role: "Editeur",
    status: "Actif",
  },
    {
    name: "Sophie Lambert",
    email: "sophie.lambert@example.com",
    role: "Editeur",
    status: "Actif",
  },
    {
    name: "Sophie Lambert",
    email: "sophie.lambert@example.com",
    role: "Editeur",
    status: "Actif",
  },
    {
    name: "Sophie Lambert",
    email: "sophie.lambert@example.com",
    role: "Editeur",
    status: "Actif",
  },  {
    name: "Sophie Lambert",
    email: "sophie.lambert@example.com",
    role: "Editeur",
    status: "Actif",
  },  {
    name: "Sophie Lambert",
    email: "sophie.lambert@example.com",
    role: "Editeur",
    status: "Actif",
  },  {
    name: "Sophie Lambert",
    email: "sophie.lambert@example.com",
    role: "Editeur",
    status: "Actif",
  },
];

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Logique de filtrage (sera utile plus tard)
  const filteredUsers = userData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout
      title="Utilisateurs"
      searchQuery={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      searchPlaceholder="Rechercher un utilisateur..."
      buttonText="Ajouter un utilisateur"
      onButtonClick={() => console.log("Ajouter un utilisateur cliqué")}
      columns={userColumns}
      data={filteredUsers}
    />
  );
};

export default Users;
