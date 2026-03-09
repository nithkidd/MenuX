import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { businessService, type Business } from "../services/business.service";
import { menuService } from "../../menu/services/menu.service";
import { useToast } from "../../../shared/contexts/ToastContext";
import {
  Utensils,
  List,
  Eye,
  ArrowRight,
  Settings,
  Copy,
  Check,
  ExternalLink,
  Power,
  PowerOff,
} from "lucide-react";
import { useTour } from "../../../shared/contexts/tour.context";
import { businessOverviewTourSteps } from "../../../shared/config/tours";

export default function BusinessOverview() {
  const { businessId } = useParams<{ businessId: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState({ categories: 0, items: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const { startTour, isTourCompleted } = useTour();

  // Start business overview tour for first-time users after business creation
  useEffect(() => {
    if (
      !loading &&
      isTourCompleted("business-create") &&
      !isTourCompleted("business-overview")
    ) {
      setTimeout(() => {
        startTour("business-overview", businessOverviewTourSteps);
      }, 500);
    }
  }, [loading, isTourCompleted, startTour]);

  const loadData = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const [bizData, categories] = await Promise.all([
        businessService.getById(businessId),
        menuService.getCategories(businessId),
      ]);

      setBusiness(bizData);

      let itemCount = 0;
      categories.forEach((cat) => {
        if (cat.items) itemCount += cat.items.length;
      });
      setStats({ categories: categories.length, items: itemCount });
    } catch (error) {
      console.error("Failed to load overview data", error);
      showToast("Failed to load overview metrics", "error");
    } finally {
      setLoading(false);
    }
  }, [businessId, showToast]);

  useEffect(() => {
    if (businessId) loadData();
  }, [businessId, loadData]);

  const handleCopyUrl = () => {
    if (!business) return;
    const url = `${window.location.origin}/menu/${business.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      showToast("Menu URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
            Overview
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            Welcome to your business dashboard.
          </p>
        </div>
        {business && (
          <div className="flex items-center gap-3" data-tour="business-status">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                business.is_published
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${business.is_published ? "bg-emerald-500 animate-pulse" : "bg-stone-400"}`}
              />
              {business.is_published ? "Published" : "Draft"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                business.is_active
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              }`}
            >
              {business.is_active ? (
                <Power size={12} />
              ) : (
                <PowerOff size={12} />
              )}
              {business.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        )}
      </div>

      {/* Menu Status & Quick Share Card */}
      {business && (
        <div
          className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm mb-8 animate-fade-in-up"
          data-tour="menu-url-card"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                <ExternalLink size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  Live Menu Access
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                  Share your menu with customers using this URL.
                </p>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 rounded-lg text-xs text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700 font-mono truncate max-w-[200px] sm:max-w-xs">
                    {`${window.location.origin}/menu/${business.slug}`}
                  </code>
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all btn-press"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check size={18} className="text-emerald-500" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                  <a
                    href={`/menu/${business.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all btn-press"
                    title="Open live menu"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {!business.is_published && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  * Your menu is in draft mode and not visible to customers yet.
                </p>
              )}
              <Link
                to={`/dashboard/business/${businessId}/settings`}
                data-tour="settings-link"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-bold hover:bg-stone-800 dark:hover:bg-stone-100 transition-all btn-press"
              >
                <Settings size={16} />
                Business Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        data-tour="metrics-cards"
      >
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
              <List size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                Categories
              </p>
              {loading ? (
                <div className="h-8 w-16 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                  {stats.categories}
                </h3>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Utensils size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                Total Items
              </p>
              {loading ? (
                <div className="h-8 w-16 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                  {stats.items}
                </h3>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                Total Views
              </p>
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                0
              </h3>
            </div>
          </div>
          <p className="mt-2 text-xs text-stone-400">* Analytics coming soon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to={`/dashboard/business/${businessId}/menu`}
          data-tour="menu-editor-tab"
          className="group block p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-orange-200 dark:hover:border-orange-900 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
              <Utensils
                className="text-stone-600 dark:text-stone-400 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                size={24}
              />
            </div>
            <ArrowRight
              className="text-stone-400 group-hover:text-orange-500 transition-colors"
              size={20}
            />
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">
            Manage Menu
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Add categories, items, and organize your menu structure.
          </p>
        </Link>

        <Link
          to={`/dashboard/business/${businessId}/settings`}
          className="group block p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-orange-200 dark:hover:border-orange-900 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
              <Settings
                className="text-stone-600 dark:text-stone-400 group-hover:text-orange-600 dark:group-hover:text-orange-400"
                size={24}
              />
            </div>
            <ArrowRight
              className="text-stone-400 group-hover:text-orange-500 transition-colors"
              size={20}
            />
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">
            Business Settings
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Update business info, contact details, and appearance.
          </p>
        </Link>
      </div>
    </div>
  );
}
