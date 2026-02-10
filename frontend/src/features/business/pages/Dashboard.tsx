
import { useEffect, useState } from 'react';
import { businessService, type Business } from '../services/business.service';
import { Link } from 'react-router-dom';
import { Settings, Plus, Store, TrendingUp } from 'lucide-react';
import PageTransition from '../../../shared/components/PageTransition';

export default function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await businessService.getAll({ scope: 'own' });
      setBusinesses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
        {/* Header Section */}
        <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-3xl font-bold leading-7 text-stone-900 dark:text-white sm:truncate tracking-tight mb-2">
                            Dashboard
                        </h2>
                        <p className="text-base text-stone-500 dark:text-stone-400 max-w-2xl">
                            Manage your businesses, menus, and analyze performance all in one place.
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0 flex gap-4">
                        <Link
                            to="/dashboard/create-business"
                            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 hover:-translate-y-0.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 btn-press"
                        >
                            <Plus size={18} />
                            Create Business
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            {/* Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
                            <div className="h-32 bg-stone-200 dark:bg-stone-800 animate-pulse relative">
                                <div className="absolute -bottom-6 left-6 h-14 w-14 rounded-xl bg-stone-300 dark:bg-stone-700 border-2 border-white dark:border-stone-800" />
                            </div>
                            <div className="p-6 pt-10 flex-1">
                                <div className="h-6 w-3/4 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mb-3" />
                                <div className="h-4 w-full bg-stone-100 dark:bg-stone-800 rounded animate-pulse mb-2" />
                                <div className="h-4 w-2/3 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
                            </div>
                            <div className="px-6 py-4 bg-stone-50 dark:bg-stone-950/50 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                                <div className="h-5 w-20 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                                <div className="h-8 w-8 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                    <p className="font-medium">{error}</p>
                    <button 
                        onClick={loadBusinesses}
                        className="mt-2 text-sm text-red-700 underline"
                    >
                        Try again
                    </button>
                </div>
            ) : businesses.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 border-dashed">
                    <div className="mx-auto h-16 w-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-500 mb-4 animate-bounce-slow">
                        <Store size={32} />
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-stone-900 dark:text-white">No businesses yet</h3>
                    <p className="mt-1 text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                        Get started by creating your first business to manage menus and settings.
                    </p>
                    <div className="mt-8">
                        <Link
                            to="/dashboard/create-business"
                            className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 transition-all btn-press"
                        >
                            <Plus size={18} />
                            Create Business
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {businesses.map((biz, index) => (
                    <div 
                        key={biz.id} 
                        className="group relative flex flex-col justify-between rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Card Header & Cover */}
                        <div className="relative h-32 bg-stone-100 dark:bg-stone-800">
                             {biz.cover_image_url ? (
                                <img src={biz.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-stone-800 dark:to-stone-900" />
                             )}
                             <div className="absolute -bottom-6 left-6">
                                {biz.logo_url ? (
                                    <img src={biz.logo_url} alt={biz.name} className="h-14 w-14 rounded-xl object-cover bg-white dark:bg-stone-900 border-2 border-white dark:border-stone-700 shadow-md" />
                                ) : (
                                    <div className="h-14 w-14 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-xl border-2 border-white dark:border-stone-700 shadow-md">
                                        {biz.name.charAt(0)}
                                    </div>
                                )}
                             </div>
                             <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/10">
                                {biz.business_type}
                             </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 pt-10 flex-1">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-stone-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-1">
                                    <Link to={`/dashboard/business/${biz.id}/overview`} className="focus:outline-none">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        {biz.name}
                                    </Link>
                                </h3>
                                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 min-h-[40px]">
                                    {biz.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Mini Stats (Placeholder) */}
                            <div className="flex items-center gap-4 py-4 border-t border-stone-100 dark:border-stone-800">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                    <span>Active</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
                                    <span>Public</span>
                                </div>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-950/50 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center relative z-10">
                            <Link 
                                to={`/dashboard/business/${biz.id}/menu`}
                                className="text-sm font-bold text-stone-600 hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400 transition-colors flex items-center gap-1"
                            >
                                Edit Menu
                            </Link>
                            <Link 
                                to={`/dashboard/business/${biz.id}/settings`}
                                className="p-2 rounded-lg text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-white transition-colors"
                            >
                                <Settings size={18} />
                            </Link>
                        </div>
                    </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </PageTransition>
  );
}
