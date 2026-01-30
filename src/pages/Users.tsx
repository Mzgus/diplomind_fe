import React, { useState, useEffect } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import UserModal from "../components/organisms/UserModal";
import { UsersService } from "../_services/users.service";
import StatusBadge from "../components/atoms/StatusBadge";

// Colonnes pour l'affichage (Full User Info)
const userColumns = [
  { key: "avatar", header: "Avatar" },
  { key: "email", header: "Email" },
  { key: "lastName", header: "Nom" },
  { key: "firstName", header: "Prénom" },
  { key: "role", header: "Rôle" },
  { key: "active", header: "Statut" },
];

interface UserDisplay {
    id: number;
    email: string;
    avatar: React.ReactNode;
    lastName: string;
    firstName: string;
    role: any; // ReactNode
    active: any; // ReactNode
    sheetId?: number; // For editing association
}

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Data for Modal
  const [allSheets, setAllSheets] = useState<{ id: number; name: string }[]>([]);

  // States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<UserDisplay | null>(null);
  const [itemToEdit, setItemToEdit] = useState<UserDisplay | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, sheetsRes] = await Promise.all([
          UsersService.getAllUsers(),
          UsersService.getAllUserSheets()
      ]);

      // Handle PaginatedResponse (data.data) or direct Array
      const usersList = usersRes.data && Array.isArray(usersRes.data.data) 
          ? usersRes.data.data 
          : Array.isArray(usersRes.data) 
             ? usersRes.data 
             : [];

      setUserData(usersList.map((u: any) => ({
          id: u.account_id || u.id, // Use account_id as primary for list, or fallback
          email: u.email || u.user_email || "No Email",
          lastName: u.user_lastname || "",
          firstName: u.user_firstname || "",
          role: <StatusBadge type="role" value={u.user_role} />,
          avatar: (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {u.user_profilepicture ? (
                      <img src={u.user_profilepicture} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                  )}
              </div>
          ),
          active: <StatusBadge type="status" value={u.user_active} />,
          sheetId: u.user_id 
      })));
      
      const sheets = Array.isArray(sheetsRes.data) ? sheetsRes.data : [];
      setAllSheets(sheets.map((s: any) => ({
          id: s.id,
         name: `${s.last_name} ${s.first_name} (${s.type_user})`
      })));

    } catch (err: any) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDeleteModal = (user: Record<string, any>) => {
    setItemToDelete(user as UserDisplay);
    setIsDeleteModalOpen(true);
  };

  const handleEditRow = (row: Record<string, any>) => {
    setItemToEdit(row as UserDisplay);
    setIsCreateModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
        try {
            await UsersService.deleteUserAuth(itemToDelete.id);
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleSaveNewUser = async (userData: any, sheetData: any | null) => {
    try {
        if (itemToEdit) {
            // UPDATE LOGIC
            const authId = itemToEdit.id;

            // 1. Update Email if changed
            if (userData.email && userData.email !== itemToEdit.email) {
                await UsersService.updateUserAuthEmail(authId, userData.email);
            }

            // 2. Update Password if provided
            if (userData.password) {
                await UsersService.updateUserAuthPassword(authId, userData.password);
            }

            // 3. Update Sheet Association or Create Sheet
            if (sheetData) {
                if (sheetData.id) {
                    // Link existing sheet to this auth
                    await UsersService.updateUserSheet(sheetData.id, { user_id: authId });
                } else if (sheetData.lastName) {
                    // Create NEW sheet linked to this auth
                    await UsersService.createUserSheet({
                        nom: sheetData.lastName,
                        prenom: sheetData.firstName,
                        type_user: sheetData.type,
                        user_id: authId
                    });
                }
            }
        } else {
            // CREATE LOGIC
            let authId = null;

            // 1. Create Auth
            if (userData && userData.email) {
                const res = await UsersService.createUserAuth({
                    email: userData.email,
                    pwd: userData.password
                });
                authId = res.data.id;
            }

            // 2. Create/Link Sheet
            if (sheetData) {
                if (sheetData.id) {
                    if (authId) {
                         await UsersService.updateUserSheet(sheetData.id, { user_id: authId });
                    }
                } else if (sheetData.lastName) {
                     await UsersService.createUserSheet({
                         nom: sheetData.lastName,
                         prenom: sheetData.firstName,
                         type_user: sheetData.type,
                         user_id: authId
                     });
                }
            }
        }
        
        fetchUsers();
        setIsCreateModalOpen(false);
        setItemToEdit(null);

    } catch (error) {
        console.error("Failed to save user", error);
        alert("Erreur lors de la sauvegarde.");
    }
  };

  // Logique de filtrage
  const filteredUsers = userData.filter(
    (user) =>
      user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <>
      <PageLayout
        title="Utilisateurs (Comptes)"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher un utilisateur..."
        buttonText="Ajouter un utilisateur"
        onButtonClick={() => {
            setItemToEdit(null);
            setIsCreateModalOpen(true);
        }}
        columns={userColumns}
        data={filteredUsers}
        onEditRow={handleEditRow}
        onDeleteRow={handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.email || ""}
        itemType="l'utilisateur"
      />
      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
            setIsCreateModalOpen(false);
            setItemToEdit(null);
        }}
        onSave={handleSaveNewUser}
        existingSheets={allSheets}
        initialData={itemToEdit}
      />
    </>
  );
};

export default Users;
