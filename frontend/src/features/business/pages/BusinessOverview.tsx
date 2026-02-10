import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { businessService, type Business } from '../services/business.service';
import { menuService } from '../../menu/services/menu.service';
import { Utensils, List, Eye, ArrowRight, Settings } from 'lucide-react';

export default function BusinessOverview() {
  const { businessId } = useParams<{ businessId: string }>();
  const [stats, setStats] = useState({ categories: 0, items: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) loadData();
  }, [businessId]);

  const loadData = async () => {
    try {
        setLoading(true);
        // Using getCategories to count items since we don't have a direct stats endpoint yet
        const categories = await menuService.getCategories(businessId!);
        let itemCount = 0;
        categories.forEach(cat => {
            if (cat.items) itemCount += cat.items.length;
        });
        setStats({ categories: categories.length, items: itemCount });
    } catch (error) {
        console.error("Failed to load overview data", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Overview</h1>
            <p className="text-stone-500 dark:text-stone-400">Welcome to your business dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                        <List size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Categories</p>
                        {loading ? (
                            <div className="h-8 w-16 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mt-1" />
                        ) : (
                            <h3 className="text-2xl font-bold text-stone-900 dark:text-white">{stats.categories}</h3>
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
                        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Total Items</p>
                        {loading ? (
                             <div className="h-8 w-16 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mt-1" />
                        ) : (
                            <h3 className="text-2xl font-bold text-stone-900 dark:text-white">{stats.items}</h3>
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
                        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Total Views</p>
                        <h3 className="text-2xl font-bold text-stone-900 dark:text-white">0</h3>
                    </div>
                </div>
                 <p className="mt-2 text-xs text-stone-400">* Analytics coming soon</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to={`/dashboard/business/${businessId}/menu`} className="group block p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-orange-200 dark:hover:border-orange-900 transition-all shadow-sm hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
                        <Utensils className="text-stone-600 dark:text-stone-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" size={24} />
                    </div>
                    <ArrowRight className="text-stone-400 group-hover:text-orange-500 transition-colors" size={20} />
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">Manage Menu</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">Add categories, items, and organize your menu structure.</p>
            </Link>

            <Link to={`/dashboard/business/${businessId}/settings`} className="group block p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-orange-200 dark:hover:border-orange-900 transition-all shadow-sm hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
                        <Settings className="text-stone-600 dark:text-stone-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" size={24} />
                    </div>
                    <ArrowRight className="text-stone-400 group-hover:text-orange-500 transition-colors" size={20} />
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">Business Settings</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">Update business info, contact details, and appearance.</p>
            </Link>
        </div>
    </div>
  );
}
