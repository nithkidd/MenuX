import { useState, useRef, useEffect } from "react";
import { HelpCircle, Play, CheckCircle, XCircle } from "lucide-react";
import { useTour, type TourId } from "../contexts/tour.context";
import {
  dashboardTourSteps,
  businessCreateTourSteps,
  businessOverviewTourSteps,
  menuEditorTourSteps,
  itemCreateTourSteps,
} from "../config/tours";

interface Tour {
  id: TourId;
  name: string;
  description: string;
  steps: any[];
}

const AVAILABLE_TOURS: Tour[] = [
  {
    id: "dashboard-first-visit",
    name: "Dashboard Tour",
    description: "Learn how to navigate your dashboard",
    steps: dashboardTourSteps,
  },
  {
    id: "business-create",
    name: "Create Business",
    description: "Guide to creating your first business",
    steps: businessCreateTourSteps,
  },
  {
    id: "business-overview",
    name: "Business Overview",
    description: "Understand your business dashboard",
    steps: businessOverviewTourSteps,
  },
  {
    id: "menu-editor",
    name: "Menu Editor",
    description: "Learn to organize your menu",
    steps: menuEditorTourSteps,
  },
  {
    id: "item-create",
    name: "Add Menu Items",
    description: "How to add items to your menu",
    steps: itemCreateTourSteps,
  },
];

export default function TourButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    startTour,
    isTourCompleted,
    resetTour,
    skipAllTours,
    isOnboardingCompleted,
  } = useTour();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleTourStart = (tour: Tour) => {
    resetTour(tour.id); // Reset in case it was completed
    startTour(tour.id, tour.steps);
    setIsOpen(false);
  };

  const handleSkipAll = () => {
    if (
      confirm(
        "Are you sure you want to skip all tours? You can always restart them from this menu.",
      )
    ) {
      skipAllTours();
      setIsOpen(false);
    }
  };

  const completedCount = AVAILABLE_TOURS.filter((tour) =>
    isTourCompleted(tour.id),
  ).length;
  const totalCount = AVAILABLE_TOURS.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-stone-500 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/20 transition-colors relative"
        title="Help & Tours"
      >
        <HelpCircle size={20} />
        {completedCount < totalCount && !isOnboardingCompleted && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="fixed left-2 right-2 top-16 z-50 w-auto max-w-none bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 overflow-hidden animate-fade-in-up sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:max-w-[calc(100vw-1rem)]">
          {/* Header */}
          <div className="p-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <HelpCircle size={18} className="text-orange-600" />
              Interactive Tours
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {completedCount}/{totalCount} tours completed
            </p>
          </div>

          {/* Tours List */}
          <div className="max-h-[min(65vh,22rem)] overflow-y-auto overscroll-contain">
            {AVAILABLE_TOURS.map((tour) => {
              const isCompleted = isTourCompleted(tour.id);
              return (
                <button
                  key={tour.id}
                  onClick={() => handleTourStart(tour)}
                  className="w-full p-4 text-left hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b border-stone-100 dark:border-stone-800 last:border-b-0 flex items-start gap-3"
                >
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle size={18} className="text-emerald-500" />
                    ) : (
                      <Play size={18} className="text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-stone-900 dark:text-white">
                      {tour.name}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {tour.description}
                    </p>
                    {isCompleted && (
                      <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        Click to replay
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {!isOnboardingCompleted && (
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={handleSkipAll}
                className="w-full px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={14} />
                Skip All Tours
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
