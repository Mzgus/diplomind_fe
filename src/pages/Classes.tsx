import React, { useState, useEffect, useContext } from "react";
import PageLayout from "../components/templates/PageLayout";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import ClassModal from "../components/organisms/ClassModal";
import { ClassesService } from "../_services/classes.service";
import { UsersService } from "../_services/users.service";
import type { Class, UserSheet } from "../types";
import { AuthContext } from "../context/AuthContext";

// Columns definition
const classColumns = [
  { key: "name", header: "Nom de la Classe" },
  { key: "year", header: "Année" },
  { key: "studentCount", header: "Nombre d'élèves" },
];

interface ClassWithCount extends Class {
    studentCount: number | string;
}

interface ClassData {
    id?: number;
    name: string;
    year: number;
    students: { id: number; name: string }[];
}

const Classes: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isTeacher = user?.user_role === "teacher";

  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Data for Modal
  const [allStudents, setAllStudents] = useState<{ id: number; name: string }[]>([]);

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ClassData | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Class | null>(null);

  const fetchData = async () => {
    try {
        setLoading(true);
        // GET /classes already returns own classes for teacher (handled by backend)
        // GET /users_sheets is now also allowed for teacher (read-only)
        const [classesRes, usersRes] = await Promise.all([
            ClassesService.getAllClasses(),
            UsersService.getAllUserSheets()
        ]);

        const rawClasses: Class[] = Array.isArray(classesRes.data) ? classesRes.data : [];
        const allSheets: UserSheet[] = Array.isArray(usersRes.data) ? usersRes.data : [];

        // Filter students only
        const studentSheets = allSheets.filter(u => u.type_user === 'student');
        const formattedStudents = studentSheets.map(s => ({
            id: s.id,
            name: `${s.last_name || ""} ${s.first_name || ""}`.trim() || `Student #${s.id}`
        }));
        setAllStudents(formattedStudents);

        // Fetch student counts for each class
        const classesWithCounts = await Promise.all(rawClasses.map(async (c) => {
            try {
                const usersRes = await ClassesService.getClassUsers(c.id);
                const count = Array.isArray(usersRes.data) ? usersRes.data.length : 0;
                return { ...c, studentCount: count };
            } catch (err) {
                console.warn(`Failed to fetch users for class ${c.id}`, err);
                return { ...c, studentCount: "?" };
            }
        }));

        setClasses(classesWithCounts);

    } catch (error) {
        console.error("Failed to fetch classes data", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDeleteModal = (row: Record<string, any>) => {
    // Row is from DataTable, which might be the Class object
    setItemToDelete(row as Class);
    setIsDeleteModalOpen(true);
  };

  const handleEditClass = async (row: Record<string, any>) => {
      const cls = row as Class;
      try {
          // Fetch current students for this class to populate modal
          const res = await ClassesService.getClassUsers(cls.id);
          const currentStudents: any[] = res.data; // Need to map to {id, name}

          // Backend probably returns User objects or joined UserSheets.
          // Adjust based on actual response structure. Assuming similar to UserSheet.
          // If response is just list of users, we map them.
          // Note: Backend might return "User" (auth) or "UserSheet"?
          // Service name: getClassUsers. Usually returns associated UserSheets or Users.
          // Let's assume it returns objects with {id, nom, prenom} or similar.
          
          const mappedStudents = currentStudents.map((s: any) => ({
              id: s.id, // Ensure this ID matches UserSheet ID used in allStudents
              name: (s.last_name || s.nom) && (s.first_name || s.prenom) 
                    ? `${s.last_name || s.nom} ${s.first_name || s.prenom}` 
                    : (s.name || `Student #${s.id}`)
          }));

          setClassToEdit({
              id: cls.id,
              name: cls.name,
              year: cls.year,
              students: mappedStudents
          });
          setIsCreateModalOpen(true);
      } catch (error) {
          console.error("Failed to fetch class details", error);
          alert("Erreur lors du chargement de la classe.");
      }
  };

  const handleConfirmDelete = async () => {
      if (itemToDelete) {
          try {
              await ClassesService.deleteClass(itemToDelete.id);
              fetchData();
          } catch (error) {
              console.error("Failed to delete class", error);
          }
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
  };

  const handleSaveClass = async (classData: any) => {
      try {
          let classId = classData.id;
          
          // 1. Create or Update Class
          if (classId) {
              await ClassesService.updateClass(classId, {
                  name: classData.name,
                  year: classData.year
              });
          } else {
              const res = await ClassesService.createClass({
                  name: classData.name,
                  year: classData.year
              });
              classId = res.data.id;
          }

          // 2. Manage Associations
          if (classId) {
              const newStudentIds: number[] = classData.studentIds;
              
              // We need current associations to calculate diff
              // If creating, current is empty.
              // If updating, we fetched them in handleEditClass but we don't have them here easily unless we refetch or pass them.
              // Logic: Fetch current again to be safe? Or use classToEdit if it matches classId?
              
              let currentStudentIds: number[] = [];
              if (classToEdit && classToEdit.id === classId) {
                  currentStudentIds = classToEdit.students.map(s => s.id);
              } else if (!classToEdit && classId) {
                    // Newly created class, current is empty
                    currentStudentIds = [];
              } else {
                   // Updating but logic mismatch? Fetch to be safe.
                   const res = await ClassesService.getClassUsers(classId);
                   currentStudentIds = res.data.map((u: any) => u.id);
              }

              const toAdd = newStudentIds.filter(id => !currentStudentIds.includes(id));
              const toRemove = currentStudentIds.filter(id => !newStudentIds.includes(id));

              // Parallelize ops
              const promises = [];
              for (const userId of toAdd) {
                  promises.push(ClassesService.assignUserToClass({ user_id: userId, class_id: classId }));
              }
              for (const userId of toRemove) {
                  promises.push(ClassesService.removeUserFromClass(userId, classId));
              }
              await Promise.all(promises);
          }

          fetchData();
          setIsCreateModalOpen(false);
          setClassToEdit(null);

      } catch (error) {
          console.error("Failed to save class", error);
      }
  };

  // Filter
  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.year.toString().includes(searchQuery)
  );

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <>
      <PageLayout
        title="Classes"
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Rechercher une classe..."
        buttonText={isTeacher ? undefined : "Ajouter une classe"}
        onButtonClick={isTeacher ? undefined : () => {
            setClassToEdit(null);
            setIsCreateModalOpen(true);
        }}
        columns={classColumns}
        data={filteredClasses}
        onEditRow={isTeacher ? undefined : handleEditClass}
        onDeleteRow={isTeacher ? undefined : handleOpenDeleteModal}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        itemType="la classe"
      />
      <ClassModal
        isOpen={isCreateModalOpen}
        onClose={() => {
            setIsCreateModalOpen(false);
            setClassToEdit(null);
        }}
        onSave={handleSaveClass}
        existingStudents={allStudents}
        initialData={classToEdit}
      />
    </>
  );
};

export default Classes;
