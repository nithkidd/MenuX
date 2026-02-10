import React, { useState, useEffect } from 'react';
import { useAuth, type User } from '../auth.context';
import { Loader2, User as UserIcon, Lock, Mail, Check, X, Shield } from 'lucide-react';

export default function UserSettings() {
  const { user, updateProfile, updatePassword, unlinkProvider, reauthenticate } = useAuth();
  
  const hasPassword = user?.identities?.some(id => id.provider === 'email');
  const hasGoogle = user?.identities?.some(id => id.provider === 'google');
  
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({});
  const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      password: '',
      confirmPassword: ''
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
        setFormData({
            full_name: user.full_name || '',
            avatar_url: user.avatar_url || '',
            email: user.email,
            role: user.role
        });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleRemovePassword = async () => {
    if (!window.confirm("Are you sure you want to remove your password? You will only be able to log in with Google.")) return;
    
    setSaveStatus('saving');
    try {
        await unlinkProvider('email');
        setSaveStatus('success');
        setMessage("Password authentication removed.");
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
        setSaveStatus('error');
        setMessage(error.message);
        setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setMessage(null);

    try {
        // 1. Update Profile (if changed)
        if (activeTab === 'general') {
            await updateProfile({
                full_name: formData.full_name,
                avatar_url: formData.avatar_url,
            });
        }
        
        // 2. Update Password (if changed)
        if (activeTab === 'security') {
            if (passwordData.password) {
                if (passwordData.password !== passwordData.confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                if (passwordData.password.length < 6) {
                    throw new Error("Password must be at least 6 characters");
                }

                // If user has a password, they MUST reauthenticate
                if (hasPassword) {
                     if (!passwordData.currentPassword) {
                         throw new Error("Current password is required");
                     }
                     await reauthenticate(passwordData.currentPassword);
                }

                await updatePassword(passwordData.password);
                setPasswordData({ currentPassword: '', password: '', confirmPassword: '' });
            }
        }

        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
        console.error("Failed to save settings", error);
        setSaveStatus('error');
        setMessage(error.message || "Failed to save settings");
        setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (!user) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">User Settings</h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1">Manage your personal account preferences.</p>
        </div>
      </div>

      {message && (
          <div className={`mb-6 p-4 rounded-xl border ${saveStatus === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
              {message}
          </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-64 flex flex-col gap-2">
            {[
                { id: 'general', label: 'General Info', icon: UserIcon },
                { id: 'security', label: 'Security', icon: Lock },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                        activeTab === tab.id
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 shadow-sm ring-1 ring-orange-200 dark:ring-orange-900'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                >
                    <tab.icon size={18} />
                    {tab.label}
                </button>
            ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
                                <div className="h-20 w-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-2xl border-2 border-white dark:border-stone-800 shadow-sm overflow-hidden">
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <span>{formData.full_name ? formData.full_name[0].toUpperCase() : user.email?.[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-stone-900 dark:text-white">{formData.full_name || 'User'}</h3>
                                    <p className="text-sm text-stone-500 dark:text-stone-400">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 capitalize">
                                            <Shield size={10} className="mr-1" />
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email Helper</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={16} className="text-stone-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        disabled
                                        className="pl-10 w-full pr-4 py-2 rounded-xl border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-stone-500 dark:text-stone-500 cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-stone-400">Email cannot be changed directly.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Avatar URL</label>
                                <input
                                    type="text"
                                    name="avatar_url"
                                    value={formData.avatar_url || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl">
                            <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400 mb-1">
                                {hasPassword ? "Change Password" : "Set Password"}
                            </h3>
                            <p className="text-xs text-orange-700 dark:text-orange-500/80">
                                {hasPassword 
                                    ? "Ensure your account is using a strong password. You will need to verify your current password." 
                                    : "You are logged in with Google. You can set a password to enable email login."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {hasPassword && (
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Current Password"
                                    />
                                    <p className="mt-1 text-xs text-stone-400">Required to change your password.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{hasPassword ? "New Password" : "Set Password"}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={passwordData.password}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                    placeholder={hasPassword ? "New Password" : "Create a password"}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Confirm {hasPassword ? "New " : ""}Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2 rounded-xl border-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="••••••••"
                                />
                            </div>

                            {hasPassword && hasGoogle && (
                                <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
                                    <h4 className="text-sm font-medium text-stone-900 dark:text-white mb-2">Danger Zone</h4>
                                    <button
                                        type="button"
                                        onClick={handleRemovePassword}
                                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                                    >
                                        Remove Password
                                    </button>
                                    <p className="mt-1 text-xs text-stone-500">
                                        You will only be able to log in with Google.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="flex justify-end pt-6 border-t border-stone-100 dark:border-stone-800">
                    <button
                        type="submit"
                        disabled={saveStatus !== 'idle'}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95
                            ${saveStatus === 'success' 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : saveStatus === 'error'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-500/20'
                            }
                            disabled:opacity-70 disabled:cursor-not-allowed
                        `}
                    >
                        {saveStatus === 'saving' ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : saveStatus === 'success' ? (
                            <>
                                <Check size={18} />
                                <span>Saved!</span>
                            </>
                        ) : saveStatus === 'error' ? (
                            <>
                                <X size={18} />
                                <span>Failed</span>
                            </>
                        ) : (
                            <span>Save Changes</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
