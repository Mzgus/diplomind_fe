import React, { useState, useEffect } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import UserSheetModal from "../components/organisms/UserSheetModal";
import { UsersService } from "../_services/users.service";
import { ClassesService } from "../_services/classes.service";
import type { UserSheet, Class } from "../types";
import StatusBadge from "../components/atoms/StatusBadge";

// Columns definition
const userSheetColumns = [
  { key: "avatar", header: "Avatar" },
  { key: "lastName", header: "Nom" },
  { key: "firstName", header: "Prénom" },
  { key: "role_badge", header: "Rôle" },
  { key: "status", header: "Statut" },
];

interface UserSheetDisplay extends UserSheet {
    avatar: React.ReactNode;
    status: React.ReactNode;
    role_badge: React.ReactNode;
    lastName: string;
    firstName: string;
}

const UserSheets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sheets, setSheets] = useState<UserSheetDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Data for Modal
  const [allClasses, setAllClasses] = useState<{ id: number; name: string }[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: number; name: string }[]>([]); // Auths

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<UserSheet | null>(null);
  const [itemToEdit, setItemToEdit] = useState<UserSheet | null>(null);

  const fetchData = async () => {
    try {
        setLoading(true);
        // Fetch Sheets, Users (Auth), Classes
        const [sheetsRes, usersRes, classesRes] = await Promise.all([
            UsersService.getAllUserSheets(),
            UsersService.getAllUsers(),
            ClassesService.getAllClasses()
        ]);

        const rawSheets: UserSheet[] = Array.isArray(sheetsRes.data) ? sheetsRes.data : [];
        
        let usersList: any[] = [];
        if (usersRes.data && !Array.isArray(usersRes.data) && (usersRes.data as any).data) {
             usersList = (usersRes.data as any).data;
        } else if (Array.isArray(usersRes.data)) {
             usersList = usersRes.data;
        }
        const rawUsers = usersList;

        const rawClasses: Class[] = Array.isArray(classesRes.data) ? classesRes.data : [];

        // Build map from sheet_id (user_id in User object) to account_id
        const sheetToAccountMap: Record<number, number> = {};
        rawUsers.forEach((u: any) => {
            if (u.user_id && u.account_id) {
                sheetToAccountMap[u.user_id] = u.account_id;
            }
        });

        // Format Sheets with linked account_id
        const formattedSheets = rawSheets.map(s => ({
            ...s,
            account_id: sheetToAccountMap[s.id] || null, // Add linked account_id
            avatar: (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {s.profile_picture ? (
                      <img src={s.profile_picture} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                  )}
              </div>
            ),
            status: (
              <StatusBadge 
                  type="status" 
                  value={s.active !== false} 
                  onClick={() => handleToggleActive(s)}
              />
            ),
            role_badge: (
              <StatusBadge type="role" value={s.type_user} />
            ),
            lastName: s.last_name || "",
            firstName: s.first_name || ""
        }));
        setSheets(formattedSheets);

        // Format Users/Accounts for linking selection - DEDUPLICATE by account_id
        // Multiple sheets can link to the same account, we only need unique accounts
        const seenAccountIds = new Set<number>();
        const formattedUsers: { id: number; name: string }[] = [];
        rawUsers.forEach((u: any) => {
            if (u.account_id && !seenAccountIds.has(u.account_id)) {
                seenAccountIds.add(u.account_id);
                formattedUsers.push({
                    id: u.account_id,
                    name: u.user_email || u.email || `Compte #${u.account_id}`
                });
            }
        });
        setAllUsers(formattedUsers);

        // Format Classes
        const formattedClasses = rawClasses.map(c => ({
            id: c.id,
            name: c.name
        }));
        setAllClasses(formattedClasses);

    } catch (error) {
        console.error("Failed to fetch user sheets data", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDeleteModal = (row: Record<string, any>) => {
    setItemToDelete(row as UserSheet);
    setIsDeleteModalOpen(true);
  };

  const handleEditRow = async (row: Record<string, any>) => {
    // Fetch the user's classes to pre-fill the modal
    try {
        const classesRes = await ClassesService.getUserClasses(row.id);
        const userClasses = Array.isArray(classesRes.data) ? classesRes.data : [];
        const firstClassId = userClasses.length > 0 ? userClasses[0].id : null;
        
        setItemToEdit({
            ...row,
            class_id: firstClassId
        } as any); // class_id is added dynamically for modal pre-fill
    } catch (error) {
        // If fetch fails, just open without class pre-fill
        setItemToEdit(row as UserSheet);
    }
    setIsCreateModalOpen(true);
  };

  const handleToggleActive = async (sheet: UserSheet) => {
      try {
          const newStatus = !sheet.active;
          // Optimistic update? Or wait for refresh.
          // Let's wait for refresh for safety or partial update state.
          await UsersService.updateUserSheet(sheet.id, { active: newStatus });
          // Ideally we toggle local state to avoid full reload flicker
          setSheets(prev => prev.map(s => 
              s.id === sheet.id 
              ? { 
                  ...s, 
                  active: newStatus,
                  status: <StatusBadge type="status" value={newStatus} onClick={() => handleToggleActive({ ...s, active: newStatus })} />
              } 
              : s
          ));
      } catch (error) {
          console.error("Failed to toggle status", error);
      }
  };

  const handleConfirmDelete = async () => {
      if (itemToDelete) {
          try {
              await UsersService.deleteUserSheet(itemToDelete.id);
              fetchData();
          } catch (error) {
              console.error("Failed to delete sheet", error);
          }
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
  };

  const handleSaveNewSheet = async (sheetData: any, userData: any | null) => {
      try {
          // Logic for UPDATE
          if (itemToEdit) {
               // Update Sheet
               const updateData: any = {
                   last_name: sheetData.nom,
                   first_name: sheetData.prenom,
                   type_user: sheetData.type_user,
                   active: sheetData.active,
               };
               
               // If user selection in modal provided an account to link
               if (userData) {
                   if (userData.email) {
                       // Create new user auth (auto-creates account)
                       const authRes = await UsersService.createUserAuth({
                           email: userData.email,
                           pwd: userData.password
                       });
                       // Link to the newly created account
                       updateData.account_id = authRes.data.account_id;
                   } else if (userData.id) {
                       // Linked to existing account - userData.id is the account_id from Users list
                       updateData.account_id = userData.id;
                   }
               }

               await UsersService.updateUserSheet(itemToEdit.id, updateData);
               
               // Update Class Link?
               if (sheetData.classId) {
                   await ClassesService.assignUserToClass({
                       user_id: itemToEdit.id,
                       class_id: sheetData.classId
                   });
               }



          } else {
              // Logic for CREATE (Existing or New)
              let userId = userData ? userData.id : null;
              let accountId = null; // For linking new sheet to account

              if (userData && userData.email) {
                  // New User -> Create Auth (Backend auto-creates Account)
                  try {
                       // Create Auth (account_id optional)
                       const authRes = await UsersService.createUserAuth({
                           email: userData.email,
                           pwd: userData.password
                           // No account_id passed, backend handles it
                       });
                       userId = authRes.data.id;
                       accountId = authRes.data.account_id;

                  } catch (err: any) {
                      if (err.response && err.response.status === 409) {
                           alert("Cet email est déjà utilisé pour un compte.");
                           return;
                      }
                      throw err;
                  }
              }

              const finalSheetData = {
                  last_name: sheetData.nom,
                  first_name: sheetData.prenom,
                  type_user: sheetData.type_user,
                  user_id: userId,
                  account_id: accountId
              };

              const sheetRes = await UsersService.createUserSheet(finalSheetData);
              const newSheetId = sheetRes.data.id;

              if (sheetData.classId && newSheetId) {
                 await ClassesService.assignUserToClass({
                     user_id: newSheetId,
                     class_id: sheetData.classId
                 });
              }
          }

          fetchData();
          setIsCreateModalOpen(false);
          setItemToEdit(null);
      } catch (error) {
          console.error("Failed to save user sheet", error);
          alert("Erreur lors de la sauvegarde.");
      }
  };

  // Filter
  const filteredSheets = sheets.filter((s) =>
    s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type_user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <>
      <PageLayout
        title="Fiches Utilisateurs"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher une fiche..."
        buttonText="Ajouter une fiche"
        onButtonClick={() => {
            setItemToEdit(null);
            setIsCreateModalOpen(true);
        }}
        columns={userSheetColumns}
        data={filteredSheets}
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
        itemName={itemToDelete ? `${itemToDelete.last_name} ${itemToDelete.first_name}` : ""}
        itemType="la fiche utilisateur"
      />
      <UserSheetModal
        isOpen={isCreateModalOpen}
        onClose={() => {
            setIsCreateModalOpen(false);
            setItemToEdit(null);
        }}
        onSave={handleSaveNewSheet}
        existingClasses={allClasses}
        existingUsers={allUsers}
        initialData={itemToEdit}
      />
    </>
  );
};

export default UserSheets;
