import React, { useState, useEffect } from "react";
import AccountsTable from "../components/organisms/AccountsTable";
import ProfilesSidebar from "../components/organisms/ProfilesSidebar";
import LinkProfileModal from "../components/organisms/LinkProfileModal";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import UnlinkConfirmationModal from "../components/organisms/UnlinkConfirmationModal";
import UserModal from "../components/organisms/UserModal";
import UserSheetModal from "../components/organisms/UserSheetModal";
import BottomSheet from "../components/organisms/BottomSheet";
import { UsersService } from "../_services/users.service";
import { ClassesService } from "../_services/classes.service";
import { CoursesService } from "../_services/courses.service";
import useIsMobile from "../hooks/useIsMobile";
import type { Class } from "../types";

interface AccountDisplay {
  id: number;
  email: string;
  lastName: string;
  firstName: string;
  roles: string[];
  active: boolean;
  profilePicture: string | null;
  sheets: {
    id: number;
    last_name: string;
    first_name: string;
    type_user: string;
    profile_picture: string | null;
    active: boolean;
  }[];
}

const Users: React.FC = () => {
  const isMobile = useIsMobile();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Raw data from APIs
  const [allAccounts, setAllAccounts] = useState<AccountDisplay[]>([]);
  const [rawSheets, setRawSheets] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<{ id: number; name: string }[]>([]);
  const [allCourses, setAllCourses] = useState<{ id: number; name: string }[]>([]);

  // Selection state
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [classesMap, setClassesMap] = useState<Record<number, Class[]>>({});
  const [coursesMap, setCoursesMap] = useState<Record<number, any[]>>({});

  // Modal Open states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);

  // Modal selection data
  const [itemToEditUser, setItemToEditUser] = useState<any>(null);
  const [itemToEditSheet, setItemToEditSheet] = useState<any>(null);
  const [itemToDeleteUser, setItemToDeleteUser] = useState<any>(null);
  const [itemToDeleteSheet, setItemToDeleteSheet] = useState<any>(null);
  const [itemToUnlinkSheet, setItemToUnlinkSheet] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, sheetsRes, classesRes, coursesRes] = await Promise.all([
        UsersService.getAllUsers(),
        UsersService.getAllUserSheets(),
        ClassesService.getAllClasses(),
        CoursesService.getAllCourses()
      ]);

      const usersList = usersRes.data && Array.isArray(usersRes.data.data)
        ? usersRes.data.data
        : Array.isArray(usersRes.data)
          ? usersRes.data
          : [];

      // Group accounts
      const accountsMap = new Map<number, AccountDisplay>();
      usersList.forEach((u: any) => {
        const accId = u.account_id || u.id;
        if (!accountsMap.has(accId)) {
          accountsMap.set(accId, {
            id: accId,
            email: u.email || u.user_email || "No Email",
            lastName: "",
            firstName: "",
            roles: [],
            active: false,
            profilePicture: null,
            sheets: [],
          });
        }
        const acc = accountsMap.get(accId)!;

        if (u.user_id && u.user_id !== -1) {
          const exists = acc.sheets.some((s) => s.id === u.user_id);
          if (!exists) {
            const sheet = {
              id: u.user_id,
              last_name: u.user_lastname,
              first_name: u.user_firstname,
              type_user: u.user_role,
              profile_picture: u.user_profilepicture,
              active: u.user_active,
            };
            acc.sheets.push(sheet);
          }

          if (u.user_role && u.user_role !== "non-assigné" && !acc.roles.includes(u.user_role)) {
            acc.roles.push(u.user_role);
          }
          if (u.user_active) {
            acc.active = true;
          }
        }
      });

      // Sort sheets using localStorage, and assign primary identity
      accountsMap.forEach((acc) => {
        const storedOrder = localStorage.getItem(`diplomind_profile_order_${acc.id}`);
        if (storedOrder) {
          try {
            const orderedIds: number[] = JSON.parse(storedOrder);
            acc.sheets.sort((a, b) => {
              const idxA = orderedIds.indexOf(a.id);
              const idxB = orderedIds.indexOf(b.id);
              if (idxA === -1 && idxB === -1) return 0;
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
            });
          } catch (e) {
            console.error("Failed to parse sheet order", e);
          }
        }

        // Apply primary sheet names/picture
        const primarySheet = acc.sheets[0];
        if (primarySheet) {
          acc.lastName = primarySheet.last_name;
          acc.firstName = primarySheet.first_name;
          acc.profilePicture = primarySheet.profile_picture;
        } else {
          // Default fallback names
          const parts = acc.email.split("@")[0].split(".");
          acc.firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "";
          acc.lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "";
        }

        if (acc.roles.length === 0) {
          acc.roles = ["non-assigné"];
        }
      });

      const list = Array.from(accountsMap.values());
      setAllAccounts(list);

      // Keep raw sheets for linking logic
      const sheetsList = Array.isArray(sheetsRes.data) ? sheetsRes.data : [];
      setRawSheets(sheetsList);

      // Classes and Courses formatters
      const rawClasses = Array.isArray(classesRes.data) ? classesRes.data : [];
      setAllClasses(rawClasses.map((c: any) => ({ id: c.id, name: c.name })));

      const rawCourses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      setAllCourses(rawCourses.map((c: any) => ({ id: c.id, name: c.name })));

    } catch (err: any) {
      console.error("Failed to fetch data in Users page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const selectedAccount = allAccounts.find(acc => acc.id === selectedAccountId) || null;

  // Fetch classes and courses for selected account sheets
  useEffect(() => {
    if (!selectedAccount) return;

    const fetchProfileDetails = async () => {
      const classPromises = selectedAccount.sheets.map(async (sheet) => {
        if (sheet.type_user === "student") {
          try {
            const res = await ClassesService.getUserClasses(sheet.id);
            return { id: sheet.id, type: "class", data: res.data || [] };
          } catch {
            return { id: sheet.id, type: "class", data: [] };
          }
        } else if (sheet.type_user === "teacher") {
          try {
            const res = await UsersService.getUserCourses(sheet.id);
            return { id: sheet.id, type: "course", data: res.data || [] };
          } catch {
            return { id: sheet.id, type: "course", data: [] };
          }
        }
        return { id: sheet.id, type: "none", data: [] };
      });

      const results = await Promise.all(classPromises);
      const newClasses: Record<number, Class[]> = {};
      const newCourses: Record<number, any[]> = {};

      results.forEach((r) => {
        if (r.type === "class") {
          newClasses[r.id] = r.data;
        } else if (r.type === "course") {
          newCourses[r.id] = r.data;
        }
      });

      setClassesMap(newClasses);
      setCoursesMap(newCourses);
    };

    fetchProfileDetails();
  }, [selectedAccountId, allAccounts]);

  // Set default selection to the first account if none selected
  useEffect(() => {
    if (allAccounts.length > 0 && selectedAccountId === null) {
      setSelectedAccountId(allAccounts[0].id);
    }
  }, [allAccounts, selectedAccountId]);

  // Accounts Operations (Left table)
  const handleEditUser = (acc: AccountDisplay) => {
    setItemToEditUser({
      id: acc.id,
      email: acc.email
    });
    setIsUserModalOpen(true);
  };

  const handleOpenDeleteUser = (acc: AccountDisplay) => {
    setItemToDeleteUser(acc);
    setIsDeleteUserOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (itemToDeleteUser) {
      try {
        await UsersService.deleteUserAuth(itemToDeleteUser.id);
        if (selectedAccountId === itemToDeleteUser.id) {
          setSelectedAccountId(null);
        }
        fetchUsers();
      } catch (err) {
        console.error("Failed to delete account auth:", err);
      }
    }
    setIsDeleteUserOpen(false);
    setItemToDeleteUser(null);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (itemToEditUser) {
        // Edit mode
        const authId = itemToEditUser.id;
        if (userData.email && userData.email !== itemToEditUser.email) {
          await UsersService.updateUserAuthEmail(authId, userData.email);
        }
        if (userData.password) {
          await UsersService.updateUserAuthPassword(authId, userData.password);
        }
      } else {
        // Create mode
        await UsersService.createUserAuth({
          email: userData.email,
          pwd: userData.password
        });
      }

      await fetchUsers();
      setIsUserModalOpen(false);
      setItemToEditUser(null);
    } catch (err) {
      console.error("Failed to save user account:", err);
      alert("Erreur lors de la sauvegarde du compte.");
    }
  };

  // Sheets/Profiles Operations (Right Sidebar)
  const handleToggleSheetActive = async (sheet: any) => {
    try {
      const newStatus = !sheet.active;
      await UsersService.updateUserSheet(sheet.id, { active: newStatus });
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle sheet status:", err);
    }
  };

  const handleEditSheet = async (sheet: any) => {
    try {
      let courseIds: number[] = [];
      let firstClassId = null;

      if (sheet.type_user === "teacher") {
        const coursesRes = await UsersService.getUserCourses(sheet.id);
        const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        courseIds = courses.map((c: any) => c.id);
      } else if (sheet.type_user === "student") {
        const classesRes = await ClassesService.getUserClasses(sheet.id);
        const userClasses = Array.isArray(classesRes.data) ? classesRes.data : [];
        firstClassId = userClasses.length > 0 ? userClasses[0].id : null;
      }

      setItemToEditSheet({
        ...sheet,
        class_id: firstClassId,
        course_ids: courseIds
      });
      setIsSheetModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch initial edit details:", err);
      setItemToEditSheet(sheet);
      setIsSheetModalOpen(true);
    }
  };

  const handleOpenDeleteSheet = (sheet: any) => {
    setItemToDeleteSheet(sheet);
    setIsDeleteSheetOpen(true);
  };

  const handleConfirmDeleteSheet = async () => {
    if (itemToDeleteSheet) {
      try {
        await UsersService.deleteUserSheet(itemToDeleteSheet.id);
        fetchUsers();
      } catch (err) {
        console.error("Failed to delete user profile sheet:", err);
      }
    }
    setIsDeleteSheetOpen(false);
    setItemToDeleteSheet(null);
  };

  const handleOpenUnlinkSheet = (sheet: any) => {
    setItemToUnlinkSheet(sheet);
    setIsUnlinkModalOpen(true);
  };

  const handleConfirmUnlinkSheet = async () => {
    if (itemToUnlinkSheet) {
      try {
        await UsersService.unlinkUserSheetAccount(itemToUnlinkSheet.id);
        await fetchUsers();
      } catch (err) {
        console.error("Failed to unlink user profile sheet:", err);
      }
    }
    setIsUnlinkModalOpen(false);
    setItemToUnlinkSheet(null);
  };

  const handleSaveSheet = async (sheetData: any, userData: any | null) => {
    try {
      if (itemToEditSheet) {
        // Edit mode
        const updateData: any = {
          last_name: sheetData.nom,
          first_name: sheetData.prenom,
          type_user: sheetData.type_user,
          active: sheetData.active,
          class_id: sheetData.classId
        };

        if (userData && userData.id) {
          updateData.account_id = userData.id;
        }

        await UsersService.updateUserSheet(itemToEditSheet.id, updateData);

        // Sync courses for teacher
        if (sheetData.type_user === "teacher") {
          const initialCourseIds = itemToEditSheet.course_ids || [];
          const toRemove = initialCourseIds.filter((id: number) => !sheetData.courseIds.includes(id));
          const toAdd = sheetData.courseIds.filter((id: number) => !initialCourseIds.includes(id));

          await Promise.all([
            ...toRemove.map((cId: number) => CoursesService.removeUserFromCourse(itemToEditSheet.id, cId)),
            ...toAdd.map((cId: number) => CoursesService.assignUserToCourse({ user_id: itemToEditSheet.id, course_id: cId }))
          ]);
        }

        // Sync class for student
        if (sheetData.type_user === "student") {
          const initialClassId = itemToEditSheet.class_id ? Number(itemToEditSheet.class_id) : null;
          const newClassId = sheetData.classId ? Number(sheetData.classId) : null;
          if (initialClassId !== newClassId) {
            if (initialClassId) {
              await ClassesService.removeUserFromClass(itemToEditSheet.id, initialClassId);
            }
            if (newClassId) {
              await ClassesService.assignUserToClass({ user_id: itemToEditSheet.id, class_id: newClassId });
            }
          }
        }
      } else {
        // Create mode (linked to selected account if selected)
        const finalSheetData = {
          last_name: sheetData.nom,
          first_name: sheetData.prenom,
          type_user: sheetData.type_user,
          account_id: selectedAccount?.id || (userData ? userData.id : null),
          active: sheetData.active
        };

        const res = await UsersService.createUserSheet(finalSheetData);
        const newSheetId = res.data.id;

        // Assign courses for teacher
        if (sheetData.type_user === "teacher" && newSheetId && sheetData.courseIds.length > 0) {
          await Promise.all(
            sheetData.courseIds.map((cId: number) =>
              CoursesService.assignUserToCourse({ user_id: newSheetId, course_id: cId })
            )
          );
        }

        // Assign class for student
        if (sheetData.type_user === "student" && newSheetId && sheetData.classId) {
          await ClassesService.assignUserToClass({
            user_id: newSheetId,
            class_id: Number(sheetData.classId)
          });
        }
      }

      await fetchUsers();
      setIsSheetModalOpen(false);
      setItemToEditSheet(null);
    } catch (err) {
      console.error("Failed to save user sheet profile:", err);
      alert("Erreur lors de la sauvegarde du profil.");
    }
  };

  // Link profile
  const handleLinkProfile = async (sheetId: number) => {
    if (selectedAccountId) {
      try {
        await UsersService.linkUserSheetToAccount(sheetId, selectedAccountId);
        await fetchUsers();
      } catch (err) {
        console.error("Failed to link profile:", err);
      }
    }
  };

  // Reorder profiles
  const handleReorderSheets = (accountId: number, orderedSheetIds: number[]) => {
    localStorage.setItem(`diplomind_profile_order_${accountId}`, JSON.stringify(orderedSheetIds));
    
    // Update local state to reflect the order and update the selected account name
    setAllAccounts((prevAccounts) => {
      return prevAccounts.map((acc) => {
        if (acc.id === accountId) {
          const sortedSheets = [...acc.sheets].sort((a, b) => {
            const idxA = orderedSheetIds.indexOf(a.id);
            const idxB = orderedSheetIds.indexOf(b.id);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });

          const primarySheet = sortedSheets[0];
          return {
            ...acc,
            sheets: sortedSheets,
            firstName: primarySheet ? primarySheet.first_name : acc.firstName,
            lastName: primarySheet ? primarySheet.last_name : acc.lastName,
            profilePicture: primarySheet ? primarySheet.profile_picture : acc.profilePicture,
          };
        }
        return acc;
      });
    });
  };

  // Filter unlinked sheets
  const unlinkedSheets = rawSheets.filter((s: any) => !s.account_id);

  // Accounts list formatted for dropdown
  const formattedUsersSelector = allAccounts.map(acc => ({
    id: acc.id,
    name: acc.email
  }));

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-64px)] lg:h-[calc(100vh-100px)] min-h-[400px] lg:min-h-[600px] flex flex-col overflow-hidden">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-text-main flex-shrink-0">Comptes Utilisateurs</h1>

      {/* Split Pane layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 flex-1 min-h-0">
        {/* Left Side: Accounts list — full width on mobile */}
        <div className="w-full lg:w-2/3 h-full flex flex-col min-h-0">
          <AccountsTable
            accounts={allAccounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={(id) => {
              setSelectedAccountId(id);
              if (isMobile) setIsBottomSheetOpen(true);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddAccount={() => {
              setItemToEditUser(null);
              setIsUserModalOpen(true);
            }}
            onEditAccount={handleEditUser}
            onDeleteAccount={handleOpenDeleteUser}
            loading={loading}
          />
        </div>

        {/* Right Side: Profiles sidebar — hidden on mobile, shown in BottomSheet instead */}
        <div className="hidden lg:flex w-full lg:w-1/3 h-full flex-col min-h-0">
          <ProfilesSidebar
            selectedAccount={selectedAccount}
            classesMap={classesMap}
            coursesMap={coursesMap}
            onEditSheet={handleEditSheet}
            onDeleteSheet={handleOpenDeleteSheet}
            onUnlinkSheet={handleOpenUnlinkSheet}
            onToggleSheetActive={handleToggleSheetActive}
            onCreateSheet={() => {
              setItemToEditSheet(null);
              setIsSheetModalOpen(true);
            }}
            onLinkSheet={() => {
              setIsLinkModalOpen(true);
            }}
            onReorderSheets={handleReorderSheets}
          />
        </div>
      </div>

      {/* Mobile BottomSheet for Profiles */}
      {isMobile && (
        <BottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          title="Profils Associés"
        >
          <ProfilesSidebar
            selectedAccount={selectedAccount}
            classesMap={classesMap}
            coursesMap={coursesMap}
            onEditSheet={(sheet) => { setIsBottomSheetOpen(false); handleEditSheet(sheet); }}
            onDeleteSheet={(sheet) => { setIsBottomSheetOpen(false); handleOpenDeleteSheet(sheet); }}
            onUnlinkSheet={(sheet) => { setIsBottomSheetOpen(false); handleOpenUnlinkSheet(sheet); }}
            onToggleSheetActive={handleToggleSheetActive}
            onCreateSheet={() => { setIsBottomSheetOpen(false); setItemToEditSheet(null); setIsSheetModalOpen(true); }}
            onLinkSheet={() => { setIsBottomSheetOpen(false); setIsLinkModalOpen(true); }}
            onReorderSheets={handleReorderSheets}
          />
        </BottomSheet>
      )}

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setItemToEditUser(null);
        }}
        onSave={handleSaveUser}
        initialData={itemToEditUser}
      />

      <UserSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => {
          setIsSheetModalOpen(false);
          setItemToEditSheet(null);
        }}
        onSave={handleSaveSheet}
        existingClasses={allClasses}
        existingCourses={allCourses}
        existingUsers={formattedUsersSelector}
        initialData={itemToEditSheet}
        preselectedAccountId={selectedAccount?.id}
      />

      <LinkProfileModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onLink={handleLinkProfile}
        unlinkedSheets={unlinkedSheets}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteUserOpen}
        onClose={() => {
          setIsDeleteUserOpen(false);
          setItemToDeleteUser(null);
        }}
        onConfirm={handleConfirmDeleteUser}
        itemName={itemToDeleteUser?.email || ""}
        itemType="le compte utilisateur"
      />

      <DeleteConfirmationModal
        isOpen={isDeleteSheetOpen}
        onClose={() => {
          setIsDeleteSheetOpen(false);
          setItemToDeleteSheet(null);
        }}
        onConfirm={handleConfirmDeleteSheet}
        itemName={itemToDeleteSheet ? `${itemToDeleteSheet.first_name} ${itemToDeleteSheet.last_name}` : ""}
        itemType="le profil"
      />

      <UnlinkConfirmationModal
        isOpen={isUnlinkModalOpen}
        onClose={() => {
          setIsUnlinkModalOpen(false);
          setItemToUnlinkSheet(null);
        }}
        onConfirm={handleConfirmUnlinkSheet}
        profileName={itemToUnlinkSheet ? `${itemToUnlinkSheet.first_name} ${itemToUnlinkSheet.last_name}` : ""}
        accountEmail={selectedAccount?.email || ""}
      />
    </div>
  );
};

export default Users;
