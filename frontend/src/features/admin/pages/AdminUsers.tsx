import { useState, useEffect, useCallback } from 'react';
import * as adminService from '../services/admin.service';
import type { AdminUser } from '../services/admin.service';
import api from '../../../shared/utils/api';
import { Search, Loader2, Trash2, Mail, User, ShieldAlert, X } from 'lucide-react';
import { useToast } from '../../../shared/contexts/ToastContext';

// Using a simplified modal component here or reusing existing one if better.
// For now, inline modal for simplicity as per original file but styled better.

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  
  // Invite State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminUser['role']>("user");
  const [inviting, setInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Delete State
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .fetchUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await adminService.updateUserRole(id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole as AdminUser['role'] } : u)),
      );
      showToast('User role updated successfully');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const confirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setUserToDelete(null);
      showToast('User deleted successfully');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || 'Failed to delete user';
      showToast(`Error: ${msg}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const { data } = await api.post("/admin/users/invite", { email: inviteEmail, role: inviteRole || "user" });
      const result = data.data;
      
      setInviteEmail("");
      setInviteRole("user");
      setShowInviteModal(false);
      load(); 
      
      if (result.tempPassword) {
         showToast(`User created! Email: ${result.email} • Temp Password: ${result.tempPassword}. Please share this with the user.`);
      } else {
         showToast('Invitation sent successfully');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to invite user';
      showToast(`Error: ${msg}`, 'error');
    } finally {
      setInviting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Users</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Manage system users and access roles.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none w-full sm:w-64 transition-all"
              maxLength={100}
            />
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Mail size={18} />
            <span className="hidden sm:inline">Invite User</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            <span className="ml-2 text-stone-500">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 dark:divide-stone-800">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-stone-500 font-bold">{u.email?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-stone-900 dark:text-white">{u.full_name || 'No Name'}</div>
                          <div className="text-sm text-stone-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="relative inline-block">
                         <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={`appearance-none pl-8 pr-8 py-1.5 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                              u.role === "admin"
                                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30 ring-purple-500"
                                  : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30 ring-blue-500"
                            }`}
                          >
                            <option value="user">User (Business Owner)</option>
                            <option value="admin">Admin (Platform)</option>
                          </select>
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                              {u.role === 'admin' ? <ShieldAlert size={12} className="text-purple-600" /> : 
                               <User size={12} className="text-blue-600" />}
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-600 dark:text-stone-300">
                        {u.businessCount} <span className="text-stone-400 text-xs">businesses</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-red-100 dark:border-red-900/30 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-4 text-red-600">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold">Delete User?</h3>
                </div>
                
                <p className="text-stone-600 dark:text-stone-300 mb-6">
                    Are you sure you want to delete <strong>{userToDelete.email}</strong>? This will permanently delete the user account and <strong>{userToDelete.businessCount}</strong> businesses. This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setUserToDelete(null)}
                        className="px-4 py-2 font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => userToDelete && confirmDelete(userToDelete.id)}
                        className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 size={16} className="animate-spin" />}
                        Delete User
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white">Invite User</h3>
                    <button onClick={() => setShowInviteModal(false)} className="text-stone-400 hover:text-stone-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full rounded-xl border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            maxLength={255}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Role</label>
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as AdminUser['role'])}
                            className="w-full rounded-xl border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        >
                            <option value="user">User (Business Owner)</option>
                            <option value="admin">Admin (Platform)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowInviteModal(false)}
                            className="px-4 py-2 font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={inviting}
                            className="px-4 py-2 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {inviting && <Loader2 size={16} className="animate-spin" />}
                            Send Invite
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
