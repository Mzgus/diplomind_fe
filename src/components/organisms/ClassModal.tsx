import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "../atoms/Buttons/Button";
import InputGroup from "../molecules/InputGroup";

interface Student {
    id: number;
    name: string;
}

interface CourseItem {
    id: number;
    name: string;
}

interface ClassData {
    id?: number;
    name: string;
    year: number;
    students: Student[];
    courses: CourseItem[];
}

interface ClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (classData: {
        id?: number;
        name: string;
        year: number;
        studentIds: number[];
        courseIds: number[];
    }) => void;
    existingStudents: Student[];
    existingCourses: CourseItem[];
    initialData?: ClassData | null;
}

type TabType = "students" | "courses";

const ClassModal: React.FC<ClassModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingStudents,
    existingCourses,
    initialData,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>("students");
    const [className, setClassName] = useState("");
    const [year, setYear] = useState(new Date().getFullYear().toString());

    // Selection States
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);

    // Search queries
    const [studentSearch, setStudentSearch] = useState("");
    const [courseSearch, setCourseSearch] = useState("");

    // Reset state when modal opens/closes or initialData changes
    useEffect(() => {
        if (isOpen) {
            setActiveTab("students");
            setStudentSearch("");
            setCourseSearch("");
            if (initialData) {
                setClassName(initialData.name);
                setYear((initialData.year || new Date().getFullYear()).toString());
                setSelectedStudentIds((initialData.students || []).map((s) => s.id));
                setSelectedCourseIds((initialData.courses || []).map((c) => c.id));
            } else {
                setClassName("");
                setYear(new Date().getFullYear().toString());
                setSelectedStudentIds([]);
                setSelectedCourseIds([]);
            }
        }
    }, [isOpen, initialData]);

    const handleToggleStudent = (studentId: number) => {
        if (selectedStudentIds.includes(studentId)) {
            setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
        } else {
            setSelectedStudentIds([...selectedStudentIds, studentId]);
        }
    };

    const handleToggleCourse = (courseId: number) => {
        if (selectedCourseIds.includes(courseId)) {
            setSelectedCourseIds(selectedCourseIds.filter((id) => id !== courseId));
        } else {
            setSelectedCourseIds([...selectedCourseIds, courseId]);
        }
    };

    const handleSelectAllStudents = () => {
        const filtered = existingStudents.filter((s) =>
            s.name.toLowerCase().includes(studentSearch.toLowerCase())
        );
        const filteredIds = filtered.map((s) => s.id);
        const allAlreadySelected = filteredIds.every((id) => selectedStudentIds.includes(id));

        if (allAlreadySelected) {
            setSelectedStudentIds(selectedStudentIds.filter((id) => !filteredIds.includes(id)));
        } else {
            const newSelection = new Set([...selectedStudentIds, ...filteredIds]);
            setSelectedStudentIds(Array.from(newSelection));
        }
    };

    const handleSelectAllCourses = () => {
        const filtered = existingCourses.filter((c) =>
            c.name.toLowerCase().includes(courseSearch.toLowerCase())
        );
        const filteredIds = filtered.map((c) => c.id);
        const allAlreadySelected = filteredIds.every((id) => selectedCourseIds.includes(id));

        if (allAlreadySelected) {
            setSelectedCourseIds(selectedCourseIds.filter((id) => !filteredIds.includes(id)));
        } else {
            const newSelection = new Set([...selectedCourseIds, ...filteredIds]);
            setSelectedCourseIds(Array.from(newSelection));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialData?.id,
            name: className,
            year: parseInt(year) || new Date().getFullYear(),
            studentIds: selectedStudentIds,
            courseIds: selectedCourseIds,
        });
    };

    // Filter students
    const filteredStudents = existingStudents.filter((student) =>
        student.name.toLowerCase().includes(studentSearch.toLowerCase())
    );

    // Filter courses
    const filteredCourses = existingCourses.filter((course) =>
        course.name.toLowerCase().includes(courseSearch.toLowerCase())
    );

    const isAllStudentsSelected =
        filteredStudents.length > 0 &&
        filteredStudents.every((s) => selectedStudentIds.includes(s.id));

    const isAllCoursesSelected =
        filteredCourses.length > 0 &&
        filteredCourses.every((c) => selectedCourseIds.includes(c.id));

    // Get helper methods to map IDs to names for the preview column
    const getStudentName = (id: number) => {
        return existingStudents.find((s) => s.id === id)?.name || `Élève #${id}`;
    };

    const getCourseName = (id: number) => {
        return existingCourses.find((c) => c.id === id)?.name || `Cours #${id}`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-5xl rounded-xl bg-surface text-text-main shadow-2xl overflow-hidden flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-2xl font-bold">
                        {initialData ? "Éditer la classe" : "Créer une classe"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main focus:outline-none"
                        type="button"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Double-column layout */}
                    <div className="flex flex-col md:flex-row gap-6 p-6 overflow-hidden">
                        {/* LEFT COLUMN: Class Infos & Associations Preview */}
                        <div className="flex-1 flex flex-col gap-5 overflow-y-auto max-h-[500px] pr-2">
                            <div>
                                <h3 className="text-lg font-semibold text-text-main mb-3">Informations générales</h3>
                                <div className="space-y-4 bg-background p-4 rounded-lg border border-border">
                                    <InputGroup
                                        id="class-name"
                                        label="Nom de la classe"
                                        placeholder="ex: RUST - Promotion 2026"
                                        value={className}
                                        onChange={(e) => setClassName(e.target.value)}
                                        required
                                    />
                                    <InputGroup
                                        id="class-year"
                                        label="Année"
                                        type="number"
                                        placeholder="2026"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Selected Students Preview */}
                            <div className="flex-1 flex flex-col min-h-[150px]">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-text-main text-sm">
                                        Élèves associés ({selectedStudentIds.length})
                                    </h4>
                                    {selectedStudentIds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedStudentIds([])}
                                            className="text-xs text-danger-text hover:underline"
                                        >
                                            Tout retirer
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 border border-border rounded-lg p-3 bg-background overflow-y-auto max-h-[140px]">
                                    {selectedStudentIds.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStudentIds.map((id) => (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-1.5 bg-surface text-text-main border border-border pl-3 pr-2 py-1 rounded-full text-xs font-medium shadow-sm hover:border-danger-text transition-colors"
                                                >
                                                    <span className="truncate max-w-[120px]">{getStudentName(id)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStudent(id)}
                                                        className="text-text-muted hover:text-danger-text focus:outline-none"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-text-muted italic text-xs text-center py-4">
                                            Aucun élève sélectionné.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Selected Courses Preview */}
                            <div className="flex-1 flex flex-col min-h-[150px]">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-text-main text-sm">
                                        Cours associés ({selectedCourseIds.length})
                                    </h4>
                                    {selectedCourseIds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCourseIds([])}
                                            className="text-xs text-danger-text hover:underline"
                                        >
                                            Tout retirer
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 border border-border rounded-lg p-3 bg-background overflow-y-auto max-h-[140px]">
                                    {selectedCourseIds.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCourseIds.map((id) => (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-1.5 bg-primary/5 text-primary border border-primary/20 pl-3 pr-2 py-1 rounded-full text-xs font-medium shadow-sm hover:border-danger-text transition-colors"
                                                >
                                                    <span className="truncate max-w-[120px]">{getCourseName(id)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleCourse(id)}
                                                        className="text-primary hover:text-danger-text focus:outline-none"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-text-muted italic text-xs text-center py-4">
                                            Aucun cours sélectionné.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Search & Select Panels */}
                        <div className="flex-1 flex flex-col border border-border rounded-lg overflow-hidden h-[480px]">
                            {/* Tabs Navigation */}
                            <div className="flex bg-background border-b border-border">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("students")}
                                    className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                                        activeTab === "students"
                                            ? "border-primary text-primary bg-surface"
                                            : "border-transparent text-text-muted hover:text-text-main hover:bg-surface/50"
                                    }`}
                                >
                                    Élèves
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
                                        {filteredStudents.length}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("courses")}
                                    className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                                        activeTab === "courses"
                                            ? "border-primary text-primary bg-surface"
                                            : "border-transparent text-text-muted hover:text-text-main hover:bg-surface/50"
                                    }`}
                                >
                                    Cours
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
                                        {filteredCourses.length}
                                    </span>
                                </button>
                            </div>

                            {/* Search and List panels */}
                            <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden bg-surface/50">
                                {activeTab === "students" && (
                                    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un élève..."
                                                    value={studentSearch}
                                                    onChange={(e) => setStudentSearch(e.target.value)}
                                                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
                                                />
                                                <svg
                                                    className="absolute left-3 top-2.5 h-4 w-4 text-text-muted"
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
                                            <button
                                                type="button"
                                                onClick={handleSelectAllStudents}
                                                className="px-3 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-background transition-colors text-text-main whitespace-nowrap"
                                            >
                                                {isAllStudentsSelected ? "Désélectionner tout" : "Sélectionner tout"}
                                            </button>
                                        </div>

                                        <div className="flex-1 border border-border rounded-lg bg-background overflow-y-auto">
                                            {filteredStudents.length > 0 ? (
                                                <div className="divide-y divide-border">
                                                    {filteredStudents.map((student) => {
                                                        const isSelected = selectedStudentIds.includes(student.id);
                                                        return (
                                                            <label
                                                                key={student.id}
                                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface/40 transition-colors ${
                                                                    isSelected ? "bg-primary/5" : ""
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => handleToggleStudent(student.id)}
                                                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                                                                />
                                                                <span className="font-medium text-sm text-text-main">
                                                                    {student.name}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-text-muted italic text-xs">
                                                    Aucun élève trouvé.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === "courses" && (
                                    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un cours..."
                                                    value={courseSearch}
                                                    onChange={(e) => setCourseSearch(e.target.value)}
                                                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
                                                />
                                                <svg
                                                    className="absolute left-3 top-2.5 h-4 w-4 text-text-muted"
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
                                            <button
                                                type="button"
                                                onClick={handleSelectAllCourses}
                                                className="px-3 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-background transition-colors text-text-main whitespace-nowrap"
                                            >
                                                {isAllCoursesSelected ? "Désélectionner tout" : "Sélectionner tout"}
                                            </button>
                                        </div>

                                        <div className="flex-1 border border-border rounded-lg bg-background overflow-y-auto">
                                            {filteredCourses.length > 0 ? (
                                                <div className="divide-y divide-border">
                                                    {filteredCourses.map((course) => {
                                                        const isSelected = selectedCourseIds.includes(course.id);
                                                        return (
                                                            <label
                                                                key={course.id}
                                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface/40 transition-colors ${
                                                                    isSelected ? "bg-primary/5" : ""
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => handleToggleCourse(course.id)}
                                                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                                                                />
                                                                <span className="font-medium text-sm text-text-main">
                                                                    {course.name}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-text-muted italic text-xs">
                                                    Aucun cours trouvé.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-border bg-background/50">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-secondary hover:bg-secondary-hover px-6 py-2 rounded-full text-white"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-full text-white font-semibold shadow-md"
                            disabled={!className.trim()}
                        >
                            Confirmer
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ClassModal;
