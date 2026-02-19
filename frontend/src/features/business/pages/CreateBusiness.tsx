
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { businessService } from '../services/business.service';
import { ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react';
import PageTransition from '../../../shared/components/PageTransition';

export default function CreateBusiness() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState('restaurant');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 3) {
      setError('Business name must be at least 3 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await businessService.create({
        name,
        business_type: type,
        description
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create business');
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
            <Link to="/dashboard" className="hover:text-orange-600 transition-colors">Dashboard</Link>
            <ChevronRight size={14} />
            <span className="font-medium text-orange-600">Create Business</span>
        </div>

        <div className="flex items-center gap-4 mb-8">
            <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Create a new Business</h1>
        </div>

        <div className="flex flex-col justify-center">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <p className="text-center text-sm text-stone-600 dark:text-stone-400 mb-8">
                    Start managing your digital menu in seconds.
                </p>
            </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-stone-900 py-8 px-4 shadow-sm sm:rounded-3xl sm:px-10 border border-stone-200 dark:border-stone-800">
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-700 dark:text-red-400 text-sm animate-fade-in-up">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Business Name
                </label>
                <div className="mt-1">
                    <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:text-white px-3 py-2 placeholder-stone-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
                    placeholder="e.g. The Burger Joint"
                    maxLength={100}
                    />
                </div>
                </div>

                <div>
                <label htmlFor="type" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Business Type
                </label>
                <div className="mt-1">
                    <select
                    id="type"
                    name="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="block w-full rounded-xl border-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:text-white py-2 pl-3 pr-10 text-base focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
                    >
                    <option value="restaurant">Restaurant</option>
                    <option value="gaming_gear">Gaming Gear</option>
                    </select>
                </div>
                </div>

                <div>
                <label htmlFor="description" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Description
                </label>
                <div className="mt-1">
                    <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full rounded-xl border-stone-300 dark:border-stone-700 dark:bg-stone-950 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2"
                    placeholder="A short description of your business..."
                    maxLength={1000}
                    />
                </div>
                </div>

                {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-2 rounded-lg text-center">{error}</div>}

                <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-2xl border border-transparent bg-stone-900 dark:bg-orange-600 py-2.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-stone-800 dark:hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-70 btn-press"
                >
                    {loading ? 'Creating...' : 'Create Business'}
                </button>
                </div>
                
                <div className="text-center">
                    <button type="button" onClick={() => navigate('/dashboard')} className="text-stone-500 text-sm hover:text-orange-600 transition-colors btn-press">Cancel</button>
                </div>
            </form>
            </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
