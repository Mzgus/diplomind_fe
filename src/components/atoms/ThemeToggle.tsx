import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle Dark Mode"
        >
            {theme === "light" ? (
                <MoonIcon className="w-6 h-6 text-text-muted" />
            ) : (
                <SunIcon className="w-6 h-6 text-yellow-400" />
            )}
        </button>
    );
};

export default ThemeToggle;
