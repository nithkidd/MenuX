import api from "../../../shared/utils/api";

// ─── Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  totalCategories: number;
  totalItems: number;
  activeBusinesses: number;
}

export interface AdminBusiness {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner_email?: string;
  owner_name?: string;
}

export interface AdminUser {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  businessCount: number;
}

// ─── API Calls ──────────────────────────────────────────────────────

export async function fetchStats(): Promise<DashboardStats> {
  const { data } = await api.get("/admin/stats");
  return data.data;
}

export async function fetchBusinesses(): Promise<AdminBusiness[]> {
  const { data } = await api.get("/admin/businesses");
  return data.data;
}

export async function toggleBusinessActive(
  id: string,
  is_active: boolean,
): Promise<void> {
  await api.patch(`/admin/businesses/${id}/toggle`, { is_active });
}

export async function deleteBusiness(id: string): Promise<void> {
  await api.delete(`/admin/businesses/${id}`);
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const { data } = await api.get("/admin/users");
  return data.data;
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  await api.patch(`/admin/users/${id}/role`, { role });
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export async function inviteUser(
  email: string,
  role: string = "user",
): Promise<void> {
  await api.post("/admin/users/invite", { email, role });
}
