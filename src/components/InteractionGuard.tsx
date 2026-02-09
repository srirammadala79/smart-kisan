"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export function InteractionGuard() {
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        const handleInteraction = (e: Event) => {
            // Allow interaction if authenticated
            if (isAuthenticated) return;

            // Allow interaction on auth pages
            if (pathname?.startsWith("/auth")) return;

            // Allow interaction if the target is inside the modal (or is the modal itself)
            // We check for the modal by looking for elements with specific classes or IDs if needed,
            // but a more robust way is to check if the modal is currently open check.
            // However, since we are capturing events *before* they reach the modal if we are not careful,
            // we need to be careful.
            // Actually, if we use capture phase, we intercept everything.
            // But we want to allow clicking IN the modal.

            const target = e.target as HTMLElement;
            const closestModal = target.closest(".fixed.z-50"); // Helper to find our modal wrapper

            if (closestModal) {
                // Interaction is within the modal, allow it
                return;
            }

            // Prevent default action (like following a link)
            // e.preventDefault(); 
            // e.stopPropagation();
            // NOTE: preventDefault on 'click' might be too aggressive if we just want to show the modal
            // but blocking navigation is good.
            // 'touchstart' passive listeners cannot preventDefault, so strict blocking on touch might require 'touch-action: none' CSS
            // or just accept that we show the modal.
            // For now, let's just show the modal and rely on the overlay to block background clicks.
            // BUT the user asked to "ask... when touch anything".
            // If we just show modal, the click might still go through to the underlying element if not blocked.

            e.preventDefault();
            e.stopPropagation();
            setShowLoginModal(true);
        };

        // Use capture phase to intercept events before they bubble
        // We listen on window to catch everything
        window.addEventListener("click", handleInteraction, true);
        window.addEventListener("touchstart", handleInteraction, { capture: true, passive: false }); // passive: false needed for preventDefault

        return () => {
            window.removeEventListener("click", handleInteraction, true);
            window.removeEventListener("touchstart", handleInteraction, true);
        };
    }, [isAuthenticated, pathname, setShowLoginModal]);

    return null;
}
