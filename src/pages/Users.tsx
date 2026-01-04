import React, { useState, useEffect } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import UserModal from "../components/organisms/UserModal";
import { Endpoints } from "../_services/endpoints.services";

// Colonnes pour l'affichage
const userColumns = [
  { key: "name", header: "Nom" },
  { key: "email", header: "Email" },
  { key: "role", header: "Rôle" },
];

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await Endpoints.getUsers();
        // Transform API response to match our table format
        const transformedUsers = response.data.map((user: any) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.type_user,
        }));
        setUserData(transformedUsers);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setError("Erreur lors du chargement des utilisateurs");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Données fictives pour les fiches utilisateur existantes
  const existingUserSheets = [
    { id: "1", name: "Fiche de Alice Martin" },
    { id: "2", name: "Fiche de Bob Garcia" },
  ];

  // State pour la modale de création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State pour la modale de suppression
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Record<string, any> | null>(
    null
  );

  const handleOpenDeleteModal = (user: Record<string, any>) => {
    setItemToDelete(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = () => {
    console.log("Suppression confirmée pour:", itemToDelete?.name);
    handleCloseModal();
  };

  const handleSaveNewUser = (userData: any, sheetData: any | null) => {
    console.log("Sauvegarde du nouvel utilisateur:", {
      user: userData,
      sheet: sheetData,
    });
    // Ici, vous ajouteriez la logique pour sauvegarder via une API
    setIsCreateModalOpen(false);
  };

  // Logique de filtrage
  const filteredUsers = userData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <PageLayout
        title="Utilisateurs"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher un utilisateur..."
        buttonText="Ajouter un utilisateur"
        onButtonClick={() => setIsCreateModalOpen(true)}
        columns={userColumns}
        data={filteredUsers}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType="l'utilisateur"
      />
      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewUser}
        existingSheets={existingUserSheets}
      />
    </>
  );
};

export default Users;
