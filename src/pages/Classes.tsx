import React, { useState, useEffect, useContext } from "react";
import ClassPageHeader from "../components/molecules/ClassPageHeader";
import ClassAccordionItem from "../components/organisms/ClassAccordionItem";
import DeleteConfirmationModal from "../components/organisms/DeleteConfirmationModal";
import ClassModal from "../components/organisms/ClassModal";
import { ClassesService } from "../_services/classes.service";
import { UsersService } from "../_services/users.service";
import { CoursesService } from "../_services/courses.service";
import type { Class, UserSheet } from "../types";
import { AuthContext } from "../context/AuthContext";

interface Student {
    id: number;
    name: string;
}

interface CourseItem {
    id: number;
    name: string;
}

interface ClassWithDetails extends Class {
    studentCount: number | string;
    students: Student[];
    courses: CourseItem[];
}

interface ClassData {
    id?: number;
    name: string;
    year: number;
    students: Student[];
    courses: CourseItem[];
}

const Classes: React.FC = () => {
    const { user } = useContext(AuthContext);
    const isTeacher = user?.user_role === "teacher";
    const canEdit = !isTeacher;

    const [searchQuery, setSearchQuery] = useState("");
    const [classes, setClasses] = useState<ClassWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedClasses, setExpandedClasses] = useState<Set<number>>(new Set());

    // Data for Modal
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [allCourses, setAllCourses] = useState<CourseItem[]>([]);

    // Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<ClassData | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Class | null>(null);

    // Student removal
    const [isDeleteStudentModalOpen, setIsDeleteStudentModalOpen] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState<{ student: Student; classId: number } | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classesRes, usersRes, coursesRes] = await Promise.all([
                isTeacher && user
                    ? ClassesService.getTeacherClasses(user.user_id)
                    : ClassesService.getAllClasses(),
                UsersService.getAllUserSheets(),
                CoursesService.getAllCourses(),
            ]);

            const rawClasses: Class[] = Array.isArray(classesRes.data) ? classesRes.data : [];
            const allSheets: UserSheet[] = Array.isArray(usersRes.data) ? usersRes.data : [];
            const rawCourses: any[] = Array.isArray(coursesRes.data) ? coursesRes.data : [];

            // Filter students only
            const studentSheets = allSheets.filter((u) => u.type_user === "student");
            const formattedStudents: Student[] = studentSheets.map((s) => ({
                id: s.id,
                name: `${s.last_name || ""} ${s.first_name || ""}`.trim() || `Student #${s.id}`,
            }));
            setAllStudents(formattedStudents);

            // Format all available courses
            const formattedCourses: CourseItem[] = rawCourses.map((co) => ({
                id: co.id,
                name: co.name,
            }));
            setAllCourses(formattedCourses);

            // Fetch students and courses for each class
            const classesWithDetails = await Promise.all(
                rawClasses.map(async (c) => {
                    let students: Student[] = [];
                    let coursesList: CourseItem[] = [];
                    try {
                        const usersRes = await ClassesService.getClassUsers(c.id);
                        const classUsers: any[] = Array.isArray(usersRes.data) ? usersRes.data : [];
                        students = classUsers.map((s: any) => ({
                            id: s.id,
                            name:
                                (s.last_name || s.nom) && (s.first_name || s.prenom)
                                    ? `${s.last_name || s.nom} ${s.first_name || s.prenom}`
                                    : s.name || `Student #${s.id}`,
                        }));
                    } catch (err) {
                        console.warn(`Failed to fetch users for class ${c.id}`, err);
                    }

                    try {
                        const classCoursesRes = await CoursesService.getClassCourses(c.id);
                        const classCourses: any[] = Array.isArray(classCoursesRes.data) ? classCoursesRes.data : [];
                        coursesList = classCourses
                            .map((co: any) => {
                                const found = formattedCourses.find((course) => course.id === co.course_id);
                                return found ? { id: found.id, name: found.name } : null;
                            })
                            .filter(Boolean) as CourseItem[];
                    } catch (err) {
                        console.warn(`Failed to fetch courses for class ${c.id}`, err);
                    }

                    return {
                        ...c,
                        studentCount: students.length,
                        students,
                        courses: coursesList,
                    };
                })
            );

            setClasses(classesWithDetails);
        } catch (error) {
            console.error("Failed to fetch classes data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.user_id]);

    // --- Toggle accordion ---
    const toggleClass = (classId: number) => {
        const newExpanded = new Set(expandedClasses);
        if (newExpanded.has(classId)) {
            newExpanded.delete(classId);
        } else {
            newExpanded.add(classId);
        }
        setExpandedClasses(newExpanded);
    };

    // --- Handlers ---
    const handleOpenDeleteModal = (cls: Class) => {
        setItemToDelete(cls);
        setIsDeleteModalOpen(true);
    };

    const handleRemoveStudent = (student: Student, classId: number) => {
        setStudentToRemove({ student, classId });
        setIsDeleteStudentModalOpen(true);
    };

    const handleConfirmRemoveStudent = async () => {
        if (studentToRemove) {
            try {
                await ClassesService.removeUserFromClass(studentToRemove.student.id, studentToRemove.classId);
                fetchData();
            } catch (error) {
                console.error("Failed to remove student from class", error);
            }
        }
        setIsDeleteStudentModalOpen(false);
        setStudentToRemove(null);
    };

    const handleEditClass = async (cls: ClassWithDetails) => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                ClassesService.getClassUsers(cls.id),
                CoursesService.getClassCourses(cls.id),
            ]);
            const currentStudents: any[] = usersRes.data;
            const currentCourses: any[] = coursesRes.data;

            const mappedStudents: Student[] = currentStudents.map((s: any) => ({
                id: s.id,
                name:
                    (s.last_name || s.nom) && (s.first_name || s.prenom)
                        ? `${s.last_name || s.nom} ${s.first_name || s.prenom}`
                        : s.name || `Student #${s.id}`,
            }));

            const mappedCourses: CourseItem[] = currentCourses
                .map((co: any) => {
                    const found = allCourses.find((c) => c.id === co.course_id);
                    return found ? { id: found.id, name: found.name } : null;
                })
                .filter(Boolean) as CourseItem[];

            setClassToEdit({
                id: cls.id,
                name: cls.name,
                year: cls.year,
                students: mappedStudents,
                courses: mappedCourses,
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

            if (classId) {
                await ClassesService.updateClass(classId, {
                    name: classData.name,
                    year: classData.year,
                });
            } else {
                const res = await ClassesService.createClass({
                    name: classData.name,
                    year: classData.year,
                });
                classId = res.data.id;
            }

            if (classId) {
                const newStudentIds: number[] = classData.studentIds;

                let currentStudentIds: number[] = [];
                if (classToEdit && classToEdit.id === classId) {
                    currentStudentIds = classToEdit.students.map((s) => s.id);
                } else if (!classToEdit && classId) {
                    currentStudentIds = [];
                } else {
                    const res = await ClassesService.getClassUsers(classId);
                    currentStudentIds = res.data.map((u: any) => u.id);
                }

                const toAdd = newStudentIds.filter((id) => !currentStudentIds.includes(id));
                const toRemove = currentStudentIds.filter((id) => !newStudentIds.includes(id));

                const promises = [];
                for (const userId of toAdd) {
                    promises.push(ClassesService.assignUserToClass({ user_id: userId, class_id: classId }));
                }
                for (const userId of toRemove) {
                    promises.push(ClassesService.removeUserFromClass(userId, classId));
                }

                // Courses diffing
                const newCourseIds: number[] = classData.courseIds || [];
                let currentCourseIds: number[] = [];
                if (classToEdit && classToEdit.id === classId) {
                    currentCourseIds = classToEdit.courses.map((c) => c.id);
                } else if (!classToEdit && classId) {
                    currentCourseIds = [];
                } else {
                    const res = await CoursesService.getClassCourses(classId);
                    currentCourseIds = res.data.map((c: any) => c.id);
                }

                const coursesToAdd = newCourseIds.filter((id) => !currentCourseIds.includes(id));
                const coursesToRemove = currentCourseIds.filter((id) => !newCourseIds.includes(id));

                for (const courseId of coursesToAdd) {
                    promises.push(CoursesService.linkCourseToClass({ course_id: courseId, class_id: classId }));
                }
                for (const courseId of coursesToRemove) {
                    promises.push(CoursesService.unlinkCourseFromClass(courseId, classId));
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

    // --- Derived ---
    const filteredClasses = classes.filter(
        (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.year.toString().includes(searchQuery) ||
            c.students.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return <div className="p-6">Chargement...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-text-main">Gestion des Classes</h1>

            <ClassPageHeader
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                canEdit={canEdit}
                onAdd={() => {
                    setClassToEdit(null);
                    setIsCreateModalOpen(true);
                }}
            />

            {/* Liste accordéon */}
            <div className="space-y-4">
                {filteredClasses.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">Aucune classe trouvée</div>
                ) : (
                    filteredClasses.map((cls) => (
                        <ClassAccordionItem
                            key={cls.id}
                            cls={cls}
                            isExpanded={expandedClasses.has(cls.id)}
                            canEdit={canEdit}
                            onToggle={() => toggleClass(cls.id)}
                            onEdit={handleEditClass}
                            onDelete={handleOpenDeleteModal}
                            onDeleteStudent={handleRemoveStudent}
                        />
                    ))
                )}
            </div>

            {/* Modals */}
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

            <DeleteConfirmationModal
                isOpen={isDeleteStudentModalOpen}
                onClose={() => {
                    setIsDeleteStudentModalOpen(false);
                    setStudentToRemove(null);
                }}
                onConfirm={handleConfirmRemoveStudent}
                itemName={studentToRemove?.student.name || ""}
                itemType="l'élève"
            />

            <ClassModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setClassToEdit(null);
                }}
                onSave={handleSaveClass}
                existingStudents={allStudents}
                existingCourses={allCourses}
                initialData={classToEdit}
            />
        </div>
    );
};

export default Classes;
