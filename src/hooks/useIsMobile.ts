import { useState, useEffect } from "react";

/**
 * Hook that detects if the viewport is below the `lg` breakpoint (1024px).
 * Uses `window.matchMedia` for a performant, event-driven approach
 * (no resize polling).
 *
 * @returns `true` when the viewport width is strictly below 1024px.
 */
const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(max-width: 1023px)").matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 1023px)");

        const handleChange = (event: MediaQueryListEvent) => {
            setIsMobile(event.matches);
        };

        // Set initial value in case SSR hydration differs
        setIsMobile(mediaQuery.matches);

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return isMobile;
};

export default useIsMobile;
