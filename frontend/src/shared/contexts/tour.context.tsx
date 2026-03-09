import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import Joyride, { STATUS } from "react-joyride";
import type { CallBackProps, Step } from "react-joyride";
import { useAuth } from "../../features/auth/auth.context";
import api from "../utils/api";

export type TourId =
  | "dashboard-first-visit"
  | "business-create"
  | "business-overview"
  | "menu-editor"
  | "item-create";

interface TourContextType {
  activeTour: TourId | null;
  startTour: (tourId: TourId, steps: Step[]) => void;
  completeTour: (tourId: TourId) => void;
  skipAllTours: () => void;
  resetTour: (tourId: TourId) => void;
  isTourCompleted: (tourId: TourId) => boolean;
  isOnboardingCompleted: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const STORAGE_KEY = "menux_tours_completed";
const ONBOARDING_KEY = "menux_onboarding_completed";

export function TourProvider({ children }: { children: ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [activeTour, setActiveTour] = useState<TourId | null>(null);
  const [tourSteps, setTourSteps] = useState<Step[]>([]);
  const [runTour, setRunTour] = useState(false);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [tooltipWidth, setTooltipWidth] = useState(420);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize tour state from localStorage and user profile
  useEffect(() => {
    if (user) {
      // Priority: user profile > localStorage
      const storedTours = localStorage.getItem(STORAGE_KEY);
      const storedOnboarding = localStorage.getItem(ONBOARDING_KEY);

      const toursFromStorage = storedTours ? JSON.parse(storedTours) : [];
      const onboardingFromStorage = storedOnboarding === "true";

      // Use user profile data if available, otherwise use localStorage
      const tours = user.tours_completed || toursFromStorage;
      const onboarding = user.onboarding_completed ?? onboardingFromStorage;

      setCompletedTours(tours);
      setOnboardingCompleted(onboarding);

      // Sync to localStorage for immediate persistence
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
      localStorage.setItem(ONBOARDING_KEY, String(onboarding));
    }
  }, [user]);

  // Keep tooltip width readable on desktop and safe on small screens.
  useEffect(() => {
    const updateTooltipWidth = () => {
      const width = Math.min(420, Math.max(280, window.innerWidth - 24));
      setTooltipWidth(width);
    };

    updateTooltipWidth();
    window.addEventListener("resize", updateTooltipWidth);

    return () => {
      window.removeEventListener("resize", updateTooltipWidth);
    };
  }, []);

  // Match Joyride palette with app light/dark theme.
  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setIsDarkMode(root.classList.contains("dark"));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const startTour = (tourId: TourId, steps: Step[]) => {
    // Don't start if tour already completed or onboarding skipped
    if (onboardingCompleted || completedTours.includes(tourId)) {
      return;
    }

    setActiveTour(tourId);
    setTourSteps(steps);
    setRunTour(true);
  };

  const completeTour = async (tourId: TourId) => {
    const updatedTours = [...completedTours, tourId];
    setCompletedTours(updatedTours);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTours));

    // Sync to database
    try {
      await api.patch("/auth/profile", {
        tours_completed: updatedTours,
      });
    } catch (error) {
      console.error("Failed to sync tour completion to database:", error);
    }

    setActiveTour(null);
    setRunTour(false);
  };

  const skipAllTours = async () => {
    setOnboardingCompleted(true);
    localStorage.setItem(ONBOARDING_KEY, "true");

    // Sync to database
    try {
      await api.patch("/auth/profile", {
        onboarding_completed: true,
      });

      // Also update the auth context
      if (updateProfile) {
        await updateProfile({ onboarding_completed: true });
      }
    } catch (error) {
      console.error("Failed to skip tours in database:", error);
    }

    setActiveTour(null);
    setRunTour(false);
  };

  const resetTour = (tourId: TourId) => {
    const updatedTours = completedTours.filter((id) => id !== tourId);
    setCompletedTours(updatedTours);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTours));

    // Sync to database
    api
      .patch("/auth/profile", {
        tours_completed: updatedTours,
      })
      .catch((error) => {
        console.error("Failed to reset tour in database:", error);
      });
  };

  const isTourCompleted = (tourId: TourId) => {
    return completedTours.includes(tourId);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) && activeTour) {
      if (status === STATUS.FINISHED) {
        completeTour(activeTour);
      } else if (status === STATUS.SKIPPED) {
        // User skipped the tour
        setActiveTour(null);
        setRunTour(false);
      }
    }
  };

  return (
    <TourContext.Provider
      value={{
        activeTour,
        startTour,
        completeTour,
        skipAllTours,
        resetTour,
        isTourCompleted,
        isOnboardingCompleted: onboardingCompleted,
      }}
    >
      {children}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        spotlightPadding={8}
        scrollOffset={120}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#ea580c", // Tailwind orange-600
            backgroundColor: isDarkMode ? "#1c1917" : "#ffffff", // Stone palette
            textColor: isDarkMode ? "#f5f5f4" : "#1c1917",
            arrowColor: isDarkMode ? "#1c1917" : "#ffffff",
            overlayColor: "#00000088",
            zIndex: 10000,
            width: tooltipWidth,
          },
          tooltip: {
            borderRadius: "1rem",
            boxShadow: isDarkMode
              ? "0 20px 45px rgba(0, 0, 0, 0.5)"
              : "0 16px 38px rgba(28, 25, 23, 0.18)",
            padding:
              tooltipWidth < 340
                ? "0.875rem 0.875rem 0.75rem"
                : "1rem 1rem 0.75rem",
            border: isDarkMode ? "1px solid #44403c" : "1px solid #e7e5e4",
          },
          tooltipTitle: {
            fontSize: tooltipWidth < 340 ? 16 : 18,
            fontWeight: 700,
          },
          tooltipContent: {
            fontSize: tooltipWidth < 340 ? 13 : 14,
            lineHeight: 1.6,
          },
          buttonNext: {
            backgroundColor: "#ea580c",
            color: "#fff",
            fontSize: 14,
            borderRadius: "0.6rem",
            padding: tooltipWidth < 340 ? "9px 14px" : "10px 18px",
            fontWeight: 600,
          },
          buttonBack: {
            color: isDarkMode ? "#d6d3d1" : "#57534e",
            fontSize: 14,
            marginRight: 8,
          },
          buttonSkip: {
            color: isDarkMode ? "#a8a29e" : "#78716c",
            fontSize: 14,
          },
          spotlight: {
            borderRadius: "0.75rem",
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          nextLabelWithProgress: "Next ({step}/{steps})",
          skip: "Skip Tour",
        }}
      />
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
