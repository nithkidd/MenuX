import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useParams } from 'react-router-dom';
import { businessService, type Business } from '../../business/services/business.service';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function BusinessLayout() {
  const { businessId } = useParams<{ businessId: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadBusiness();
    }
  }, [businessId]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const data = await businessService.getById(businessId!);
      setBusiness(data);
    } catch (error) {
      console.error("Failed to load business", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
        <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-16 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-9 h-9 rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
                   <div>
                      <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded-md animate-pulse mb-2" />
                      <div className="h-3 w-32 bg-stone-100 dark:bg-stone-800 rounded-md animate-pulse" />
                   </div>
                </div>
                <div className="h-9 w-32 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
              </div>
              <div className="flex items-center gap-6 border-b border-stone-100 dark:border-stone-800 -mb-[17px] pb-2">
                  {[1, 2, 3].map(i => (
                      <div key={i} className="h-5 w-24 bg-stone-100 dark:bg-stone-800 rounded-md animate-pulse" />
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 animate-pulse" />
                ))}
             </div>
        </div>
      </div>
    );
  }
  if (!business) return <div className="p-8 text-center text-red-500">Business not found.</div>;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 py-4">
                {/* Top Row: Back, Title, Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            to="/dashboard" 
                            className="p-2 -ml-2 rounded-xl text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-stone-900 dark:text-white leading-none">
                                {business.name}
                            </h1>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                Business Dashboard
                            </p>
                        </div>
                    </div>
                    <a 
                        href={`/menu/${business.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors bg-stone-50 dark:bg-stone-800/50 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10"
                    >
                        <span>View Public Menu</span>
                        <ExternalLink size={14} />
                    </a>
                </div>

                {/* Bottom Row: Tabs */}
                <div className="flex items-center gap-1 border-b border-stone-100 dark:border-stone-800 -mb-[17px]">
                    <NavLink
                        to={`/dashboard/business/${businessId}/overview`}
                        className={({ isActive }) => `
                            px-4 py-2 text-sm font-medium border-b-2 transition-all
                            ${isActive 
                                ? 'border-orange-600 text-orange-600 dark:text-orange-500' 
                                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 hover:border-stone-200'
                            }
                        `}
                    >
                        Overview
                    </NavLink>
                    <NavLink
                        to={`/dashboard/business/${businessId}/menu`}
                        className={({ isActive }) => `
                            px-4 py-2 text-sm font-medium border-b-2 transition-all
                            ${isActive 
                                ? 'border-orange-600 text-orange-600 dark:text-orange-500' 
                                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 hover:border-stone-200'
                            }
                        `}
                    >
                        Menu Editor
                    </NavLink>
                    <NavLink
                        to={`/dashboard/business/${businessId}/settings`}
                        className={({ isActive }) => `
                            px-4 py-2 text-sm font-medium border-b-2 transition-all
                            ${isActive 
                                ? 'border-orange-600 text-orange-600 dark:text-orange-500' 
                                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 hover:border-stone-200'
                            }
                        `}
                    >
                        Settings
                    </NavLink>
                </div>
            </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        <Outlet />
      </div>
    </div>
  );
}
