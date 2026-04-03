import React, { useState, useEffect } from "react";
import SkillValidationModal from "../components/organisms/SkillValidationModal";
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
    // --- Data State ---
    const [projects, setProjects] = useState<Project[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [stepsWithSkills, setStepsWithSkills] = useState<StepWithSkills[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    // validations: Record<"userId_skillId", { status: string; comment: string }>
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

                // Auto-select first items if available
                if (cl.length > 0) setSelectedClassId(String(cl[0].id));
                if (co.length > 0) setSelectedCourseId(String(co[0].id));
            } catch (err) {
                console.error("Failed to fetch initial data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    // --- 2. When course changes → fetch Projects for that course ---
    useEffect(() => {
        if (!selectedCourseId) return;
        const fetchProjects = async () => {
            try {
                const res = await ProjectsService.getProjectsByCourse(Number(selectedCourseId));
                const p: Project[] = Array.isArray(res.data) ? res.data : [];
                setProjects(p);
                // Auto-select first project
                if (p.length > 0) {
                    setSelectedProjectId(String(p[0].id));
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
    }, [selectedCourseId]);

    // --- 2. When project changes → fetch Steps → for each step fetch Skills ---
    useEffect(() => {
        if (!selectedProjectId) return;
        const fetchStepsAndSkills = async () => {
            try {
                setLoadingMatrix(true);
                const stepsRes = await StepsService.getStepsByProject(Number(selectedProjectId));
                const rawSteps: Step[] = Array.isArray(stepsRes.data) ? stepsRes.data : [];

                // For each step, fetch its skills
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

    // --- 3. When class changes → fetch Students ---
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

    // --- 4. Build flat skills array with unique keys ---
    const allSkills = stepsWithSkills.flatMap((step) =>
        step.skills.map((skill) => ({ ...skill, uid: `${step.id}_${skill.id}` }))
    );

    // --- 5. When students or skills change → fetch Validations ---
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
                            // Student has no validations yet
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
            // Check if validation already exists
            const existing = validations[key];
            if (existing) {
                // UPDATE existing validation
                await ValidationsService.updateValidationStatus(studentId, skillId, {
                    status: backendStatus,
                    comment,
                });
            } else {
                // CREATE new validation
                await ValidationsService.createValidation({
                    user_id: studentId,
                    skill_id: skillId,
                    status: backendStatus,
                    comment,
                });
            }

            // Update local state optimistically
            setValidations((prev) => ({
                ...prev,
                [key]: { status, comment },
            }));
        } catch (err) {
            console.error("Failed to save validation:", err);
            alert("Erreur lors de la sauvegarde de la validation.");
        }
    };

    // --- Style Helpers ---
    const getStatusStyle = (status?: string) => {
        switch (status) {
            case "Validé":
                return "bg-success-bg text-success-text border-success-border hover:bg-success-border";
            case "Non validé":
                return "bg-danger-bg text-danger-text border-danger-border hover:bg-danger-border";
            case "Partiellement validé":
                return "bg-warning-bg text-warning-text border-warning-border hover:bg-warning-border";
            default:
                return "bg-background text-text-muted border-border hover:bg-border";
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case "Validé":
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case "Non validé":
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case "Partiellement validé":
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return <div className="w-2 h-2 rounded-full bg-text-muted/30" />;
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
            {/* Header Section */}
            <div className="max-w-full mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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

                    {/* Filters & Search */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher un étudiant..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64 text-text-main"
                            />
                            <svg
                                className="w-5 h-5 text-text-muted absolute left-3 top-1/2 transform -translate-y-1/2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        <select 
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="px-4 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:bg-background transition-colors"
                        >
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    Classe: {cls.name}
                                </option>
                            ))}
                        </select>
                        <select 
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="px-4 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:bg-background transition-colors"
                        >
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    Cours: {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Matrix Container */}
                <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    {loadingMatrix ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-text-muted">Chargement de la matrice...</p>
                        </div>
                    ) : allSkills.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-text-muted">Aucune compétence trouvée pour ce projet. Vérifiez que des étapes et compétences sont associées.</p>
                        </div>
                    ) : (
                    <div className="overflow-auto flex-1 relative custom-scrollbar">
                        <table className="border-separate border-spacing-0">
                            <thead>
                                {/* Steps Header */}
                                <tr>
                                    <th className="sticky top-0 left-0 z-30 bg-surface p-4 border-b border-r border-border whitespace-nowrap h-16 min-w-[250px]">
                                        <div className="flex items-center justify-end h-full text-text-muted font-bold text-sm uppercase tracking-wider">
                                            Étapes &rarr;
                                        </div>
                                    </th>
                                    {stepsWithSkills.map((step) => (
                                        <th
                                            key={step.id}
                                            colSpan={step.skills.length || 1}
                                            className="sticky top-0 z-20 bg-background p-3 border-b border-r border-border text-center text-xs font-bold text-text-muted uppercase tracking-wider"
                                        >
                                            {step.name}
                                        </th>
                                    ))}
                                </tr>
                                {/* Skills Header */}
                                <tr>
                                    <th className="sticky top-16 left-0 z-30 bg-surface p-4 border-b border-r border-border shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                        <div className="flex flex-col justify-between h-full">
                                            <div className="flex items-center justify-end h-full text-text-muted font-bold text-sm uppercase tracking-wider">
                                                Compétences &rarr;
                                            </div>
                                        </div>
                                    </th>
                                    {allSkills.map((skill) => (
                                        <th
                                            key={skill.uid}
                                            className="sticky top-16 z-20 bg-surface border-b border-r border-border min-w-[60px] w-[60px] h-[180px] align-bottom hover:bg-background transition-colors group cursor-help pb-2"
                                            title={skill.description || ""}
                                        >
                                            <div className="flex items-center justify-center h-full">
                                                <div className="transform -rotate-45 w-[160px]  mb-2 text-left">
                                                    <span className="text-sm font-medium text-text-main group-hover:text-primary transition-colors block">
                                                        {skill.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={allSkills.length + 1} className="p-8 text-center text-text-muted">
                                            Aucun étudiant trouvé dans cette classe.
                                        </td>
                                    </tr>
                                ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="group">
                                        {/* Student Row Header */}
                                        <td className="sticky left-0 z-10 bg-surface p-4 border-b border-r border-border group-hover:bg-primary/10 transition-colors shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-background overflow-hidden border border-border">
                                                    {student.profile_picture ? (
                                                        <img
                                                            src={student.profile_picture}
                                                            alt={`${student.first_name} ${student.last_name}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                                                            {student.first_name?.[0]}{student.last_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-text-main text-sm group-hover:text-primary-hover transition-colors">
                                                    {student.last_name} {student.first_name}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Validation Cells */}
                                        {allSkills.map((skill) => {
                                            const key = `${student.id}_${skill.id}`;
                                            const validation = validations[key];
                                            return (
                                                <td
                                                    key={skill.uid}
                                                    onClick={() => handleCellClick(student.id, skill.id)}
                                                    className="p-2 border-b border-r border-border bg-surface hover:bg-background transition-all cursor-pointer text-center relative min-w-[60px]"
                                                >
                                                    <div
                                                        className={`w-full h-full min-h-[50px] rounded-md flex items-center justify-center border transition-all duration-200 ${getStatusStyle(
                                                            validation?.status
                                                        )}`}
                                                    >
                                                        {getStatusIcon(validation?.status)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>
            </div>

            {/* Validation Modal */}
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
