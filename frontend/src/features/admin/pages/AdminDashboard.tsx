import { useCallback, useEffect, useState } from "react";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { useAuth } from "../../../features/auth/auth.context";
import * as adminService from "../services/admin.service";
import api from "../../../shared/utils/api";
import type {
  DashboardStats,
  AdminBusiness,
  AdminUser,
} from "../services/admin.service";

type Tab = "overview" | "businesses" | "users";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { role, isSuperAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; superOnly?: boolean }[] = [
    { key: "overview", label: "Overview" },
    { key: "businesses", label: "Businesses" },
    { key: "users", label: "Users", superOnly: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-red-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white hidden sm:block">
                {user?.email} ({role})
              </span>
              <button
                onClick={signOut}
                className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs
              .filter((t) => !t.superOnly || isSuperAdmin)
              .map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${
                    activeTab === t.key
                      ? "border-red-600 text-red-700"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "businesses" && <BusinessesTab />}
          {activeTab === "users" && isSuperAdmin && <UsersTab />}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────

function OverviewTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .fetchStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading stats...</p>;
  if (!stats) return <p className="text-red-500">Failed to load stats.</p>;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, color: "bg-blue-500" },
    {
      label: "Total Businesses",
      value: stats.totalBusinesses,
      color: "bg-green-500",
    },
    {
      label: "Active Businesses",
      value: stats.activeBusinesses,
      color: "bg-emerald-500",
    },
    {
      label: "Total Categories",
      value: stats.totalCategories,
      color: "bg-purple-500",
    },
    { label: "Total Items", value: stats.totalItems, color: "bg-orange-500" },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="overflow-hidden rounded-lg bg-white shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className={`shrink-0 rounded-md p-3 ${c.color}`}>
                <span className="text-white text-lg font-bold">{c.value}</span>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">{c.label}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Businesses Tab ─────────────────────────────────────────────────

function BusinessesTab() {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .fetchBusinesses()
      .then(setBusinesses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await adminService.toggleBusinessActive(id, !currentActive);
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, is_active: !currentActive } : b,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to toggle business status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete business "${name}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteBusiness(id);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete business");
    }
  };

  if (loading) return <p className="text-gray-500">Loading businesses...</p>;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          All Businesses ({businesses.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {businesses.map((biz) => (
              <tr key={biz.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {biz.name}
                  </div>
                  <div className="text-sm text-gray-500">{biz.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {biz.business_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {biz.owner_name || biz.owner_email || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      biz.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {biz.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(biz.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleToggle(biz.id, biz.is_active)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {biz.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(biz.id, biz.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {businesses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No businesses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Users Tab (Super Admin) ────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
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
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const confirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setUserToDelete(null); // Close modal on success
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || "Failed to delete user";
      const details = err.response?.data?.details;
      if (details) console.error("Error details:", details);
      
      alert(`Error: ${msg}`);
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
      load(); // refresh list
      
      if (result.tempPassword) {
         alert(`User created!\nEmail: ${result.email}\nTemp Password: ${result.tempPassword}\n\nPlease share this password with the user.`);
      } else {
         alert("Invitation sent successfully.");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || "Failed to invite user";
       const details = err.response?.data?.details;
      if (details) console.error("Error details:", details);
      alert(`Error: ${msg}`);
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading users...</p>;

  return (
    <div className="space-y-6">
      {/* Invite User Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invite User</h3>
        <form onSubmit={handleInvite} className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm border px-3 py-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
          >
            {inviting ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            All Users ({users.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Businesses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Sign-In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-white">
                          {u.email?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {u.full_name || u.email}
                        </div>
                        {u.full_name && (
                          <div className="text-sm text-gray-500">{u.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                        u.role === "super_admin"
                          ? "border-red-300 bg-red-50 text-red-700"
                          : u.role === "admin"
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-gray-50 text-gray-700"
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.businessCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setUserToDelete(u)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <DeleteConfirmationModal
          user={userToDelete}
          onCancel={() => setUserToDelete(null)}
          onConfirm={() => confirmDelete(userToDelete.id)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

function DeleteConfirmationModal({
  user,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  user: AdminUser;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Delete User & All Data?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete <strong>{user.email}</strong>?
        </p>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                This action is <strong>IRREVERSIBLE</strong>. It will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-1 ml-1">
                <li>The user account</li>
                <li>All <strong>{user.businessCount}</strong> owned businesses</li>
                <li>All associated categories and items</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete User & All Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
