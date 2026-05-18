import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SkillValidationModal from "../components/organisms/SkillValidationModal";
import ValidationMatrix from "../components/organisms/ValidationMatrix";
import ValidationFilters from "../components/molecules/ValidationFilters";
import { ProjectsService } from "../_services/projects.service";
import { StepsService } from "../_services/steps.service";
import { ClassesService } from "../_services/classes.service";
import { CoursesService } from "../_services/courses.service";
import { ValidationsService } from "../_services/validations.service";

// --- Status Mapping (Frontend FR ↔ Backend EN) ---
const STATUS_TO_BACKEND: Record<string, string> = {
    "Validé": "validated",
    "Non validé": "rejected",
    "Partiellement validé": "partially_validated",
    "Non évalué": "pending",
};

const STATUS_TO_FRONTEND: Record<string, string> = {
    "validated": "Validé",
    "rejected": "Non validé",
    "partially_validated": "Partiellement validé",
    "pending": "Non évalué",
};

// --- Types ---
interface Project {
    id: number;
    name: string;
    course_id?: number;
}
interface Step {
    id: number;
    name: string;
    project_id?: number;
}
interface Skill {
    id: number;
    name: string;
    description?: string;
}
interface StepWithSkills extends Step {
    skills: Skill[];
}
interface Student {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
}
interface ClassItem {
    id: number;
    name: string;
}
interface CourseItem {
    id: number;
    name: string;
}

const ProjectSkillsValidation: React.FC = () => {
    const location = useLocation();
    const state = location.state as {
        preselectedCourseId?: number;
        preselectedProjectId?: number;
        preselectedSkillId?: number;
    } | null;

    // --- Data State ---
    const [projects, setProjects] = useState<Project[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [stepsWithSkills, setStepsWithSkills] = useState<StepWithSkills[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [validations, setValidations] = useState<Record<string, { status: string; comment: string }>>({});

    // --- Filter State ---
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    // --- UI State ---
    const [loading, setLoading] = useState(true);
    const [loadingMatrix, setLoadingMatrix] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ studentId: number; skillId: number } | null>(null);

    // --- 1. Fetch initial dropdown data ---
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                setLoading(true);
                const [classesRes, coursesRes] = await Promise.all([
                    ClassesService.getAllClasses(),
                    CoursesService.getAllCourses(),
                ]);
                const cl = Array.isArray(classesRes.data) ? classesRes.data : [];
                const co = Array.isArray(coursesRes.data) ? coursesRes.data : [];
                setClasses(cl);
                setCourses(co);

                if (cl.length > 0) setSelectedClassId(String(cl[0].id));
                if (state?.preselectedCourseId) {
                    setSelectedCourseId(String(state.preselectedCourseId));
                } else if (co.length > 0) {
                    setSelectedCourseId(String(co[0].id));
                }
            } catch (err) {
                console.error("Failed to fetch initial data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, [state]);

    // --- 2. Quand le cours change → fetch les projets du cours ---
    useEffect(() => {
        if (!selectedCourseId) return;
        const fetchProjects = async () => {
            try {
                const res = await ProjectsService.getProjectsByCourse(Number(selectedCourseId));
                const p: Project[] = Array.isArray(res.data) ? res.data : [];
                setProjects(p);
                if (p.length > 0) {
                    if (state?.preselectedProjectId && p.some((proj) => proj.id === state.preselectedProjectId)) {
                        setSelectedProjectId(String(state.preselectedProjectId));
                    } else {
                        setSelectedProjectId(String(p[0].id));
                    }
                } else {
                    setSelectedProjectId("");
                    setStepsWithSkills([]);
                }
            } catch (err) {
                console.error("Failed to fetch projects for course:", err);
                setProjects([]);
                setSelectedProjectId("");
            }
        };
        fetchProjects();
    }, [selectedCourseId, state]);

    // --- 3. Quand le projet change → fetch étapes + compétences ---
    useEffect(() => {
        if (!selectedProjectId) return;
        const fetchStepsAndSkills = async () => {
            try {
                setLoadingMatrix(true);
                const stepsRes = await StepsService.getStepsByProject(Number(selectedProjectId));
                const rawSteps: Step[] = Array.isArray(stepsRes.data) ? stepsRes.data : [];

                const stepsWithSkillsData: StepWithSkills[] = await Promise.all(
                    rawSteps.map(async (step) => {
                        try {
                            const skillsRes = await StepsService.getStepSkills(step.id);
                            const skills: Skill[] = Array.isArray(skillsRes.data) ? skillsRes.data : [];
                            return { ...step, skills };
                        } catch {
                            return { ...step, skills: [] };
                        }
                    })
                );
                setStepsWithSkills(stepsWithSkillsData);
            } catch (err) {
                console.error("Failed to fetch steps/skills:", err);
                setStepsWithSkills([]);
            } finally {
                setLoadingMatrix(false);
            }
        };
        fetchStepsAndSkills();
    }, [selectedProjectId]);

    // --- 4. Quand la classe change → fetch les étudiants ---
    useEffect(() => {
        if (!selectedClassId) return;
        const fetchStudents = async () => {
            try {
                const res = await ClassesService.getClassUsers(Number(selectedClassId));
                const rawStudents = Array.isArray(res.data) ? res.data : [];
                setStudents(rawStudents);
            } catch (err) {
                console.error("Failed to fetch students:", err);
                setStudents([]);
            }
        };
        fetchStudents();
    }, [selectedClassId]);

    // --- Build flat skills array with unique keys ---
    const allSkills = stepsWithSkills.flatMap((step) =>
        step.skills.map((skill) => ({ ...skill, uid: `${step.id}_${skill.id}` }))
    );

    // --- 5. Quand étudiants ou compétences changent → fetch validations ---
    useEffect(() => {
        if (students.length === 0 || allSkills.length === 0) {
            setValidations({});
            return;
        }

        let cancelled = false;

        const fetchAllValidations = async () => {
            try {
                const newValidations: Record<string, { status: string; comment: string }> = {};

                await Promise.all(
                    students.map(async (student) => {
                        try {
                            const res = await ValidationsService.getUserValidations(student.id);
                            const userValidations = Array.isArray(res.data) ? res.data : [];
                            userValidations.forEach((v: any) => {
                                const key = `${student.id}_${v.skill_id}`;
                                newValidations[key] = {
                                    status: STATUS_TO_FRONTEND[v.status] || v.status,
                                    comment: v.comment || "",
                                };
                            });
                        } catch {
                            // L'étudiant n'a pas encore de validations
                        }
                    })
                );

                if (!cancelled) {
                    setValidations(newValidations);
                }
            } catch (err) {
                console.error("Failed to fetch validations:", err);
            }
        };

        fetchAllValidations();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [students, stepsWithSkills]);

    // --- Handlers ---
    const handleCellClick = (studentId: number, skillId: number) => {
        setSelectedCell({ studentId, skillId });
    };

    const handleModalClose = () => {
        setSelectedCell(null);
    };

    const handleModalConfirm = async (status: string, comment: string) => {
        if (!selectedCell) return;

        const { studentId, skillId } = selectedCell;
        const backendStatus = STATUS_TO_BACKEND[status] || status;
        const key = `${studentId}_${skillId}`;

        try {
            const existing = validations[key];
            if (existing) {
                await ValidationsService.updateValidationStatus(studentId, skillId, {
                    status: backendStatus,
                    comment,
                });
            } else {
                await ValidationsService.createValidation({
                    user_id: studentId,
                    skill_id: skillId,
                    status: backendStatus,
                    comment,
                });
            }

            setValidations((prev) => ({
                ...prev,
                [key]: { status, comment },
            }));
        } catch (err) {
            console.error("Failed to save validation:", err);
            alert("Erreur lors de la sauvegarde de la validation.");
        }
    };

    // --- Derived Data ---
    const selectedSkill = selectedCell
        ? allSkills.find((s) => s.id === selectedCell.skillId)
        : null;
    const selectedStudent = selectedCell
        ? students.find((s) => s.id === selectedCell.studentId)
        : null;
    const currentValidation = selectedCell
        ? validations[`${selectedCell.studentId}_${selectedCell.skillId}`]
        : null;

    const filteredStudents = students.filter((student) => {
        const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    // --- Loading ---
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-text-muted">Chargement des données...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8 font-sans text-text-main">
            {/* Header */}
            <div className="max-w-full mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    {/* Titre + sélection projet */}
                    <div>
                        <h1 className="text-3xl font-bold text-text-main tracking-tight">
                            Validation des Compétences
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-text-muted">Projet :</span>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="bg-transparent font-medium text-text-main border-b border-border focus:border-primary focus:outline-none py-1 pr-8 cursor-pointer hover:border-text-muted transition-colors"
                            >
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filtres */}
                    <ValidationFilters
                        searchQuery={searchQuery}
                        onSearchChange={(e) => setSearchQuery(e.target.value)}
                        selectedClassId={selectedClassId}
                        onClassChange={(e) => setSelectedClassId(e.target.value)}
                        classes={classes}
                        selectedCourseId={selectedCourseId}
                        onCourseChange={(e) => setSelectedCourseId(e.target.value)}
                        courses={courses}
                    />
                </div>

                {/* Matrice */}
                <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    <ValidationMatrix
                        stepsWithSkills={stepsWithSkills}
                        allSkills={allSkills}
                        filteredStudents={filteredStudents}
                        validations={validations}
                        loadingMatrix={loadingMatrix}
                        onCellClick={handleCellClick}
                        preselectedSkillId={state?.preselectedSkillId}
                    />
                </div>
            </div>

            {/* Modal de validation */}
            <SkillValidationModal
                isOpen={!!selectedCell}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                studentName={selectedStudent ? `${selectedStudent.last_name} ${selectedStudent.first_name}` : ""}
                skillName={selectedSkill?.name || ""}
                skillDescription={selectedSkill?.description || ""}
                initialStatus={currentValidation?.status}
                initialComment={currentValidation?.comment}
            />

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
        </div>
    );
};

export default ProjectSkillsValidation;
