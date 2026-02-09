
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth.context';
import { businessService, type Business } from '../services/business.service';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await businessService.getAll();
      setBusinesses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">MenuBuilder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 hidden sm:block">{user?.email}</span>
              <button
                onClick={signOut}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Your Businesses
              </h2>
            </div>
            {/* TODO: Add Create Business Button */}
            <div className="mt-4 flex md:ml-4 md:mt-0">
               <Link
                 to="/dashboard/create-business"
                 className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
               >
                 Create Business
               </Link>
            </div>
          </div>

          {loading ? (
             <div className="text-center py-12">Loading...</div>
          ) : error ? (
             <div className="text-center py-12 text-red-600">{error}</div>
          ) : businesses.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg shadow">
               <h3 className="mt-2 text-sm font-semibold text-gray-900">No businesses</h3>
               <p className="mt-1 text-sm text-gray-500">Get started by creating a new business.</p>
               {/* 
                  Since we don't have the Create UI yet, 
                  user can use the verify script to create one or we add a simple button here.
               */}
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((biz) => (
                <div key={biz.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                  <div className="min-w-0 flex-1">
                    <Link to={`/dashboard/business/${biz.id}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">{biz.name}</p>
                      <p className="truncate text-sm text-gray-500">{biz.business_type} • /{biz.slug}</p>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
