/**
 * Admin Service
 *
 * Handles admin operations:
 * - Dashboard stats
 * - Business management (admin+)
 * - User management via Supabase Admin SDK (super_admin)
 */

import { supabaseAdmin } from "../../config/supabase.js";

// ─── Dashboard Stats ────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  totalCategories: number;
  totalItems: number;
  activeBusinesses: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [users, businesses, categories, items, activeBusinesses] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("businesses")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("categories")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin.from("items").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

  return {
    totalUsers: users.count ?? 0,
    totalBusinesses: businesses.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalItems: items.count ?? 0,
    activeBusinesses: activeBusinesses.count ?? 0,
  };
}

// ─── Business Management ────────────────────────────────────────────

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

export async function listAllBusinesses(): Promise<AdminBusiness[]> {
  // Fetch businesses with owner profile info
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .select(
      `
      *,
      profiles!businesses_owner_id_fkey (
        full_name,
        auth_user_id
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Enrich with owner email from Supabase Auth
  const businesses: AdminBusiness[] = [];
  for (const biz of data || []) {
    const profile = (biz as any).profiles;
    let ownerEmail: string | undefined;

    if (profile?.auth_user_id) {
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
          profile.auth_user_id,
        );
        ownerEmail = authUser?.user?.email ?? undefined;
      } catch {
        /* ignore */
      }
    }

    businesses.push({
      id: biz.id,
      name: biz.name,
      slug: biz.slug,
      business_type: biz.business_type,
      description: biz.description,
      logo_url: biz.logo_url,
      is_active: biz.is_active,
      created_at: biz.created_at,
      updated_at: biz.updated_at,
      owner_id: biz.owner_id,
      owner_email: ownerEmail,
      owner_name: profile?.full_name ?? undefined,
    });
  }

  return businesses;
}

export async function toggleBusinessActive(id: string, isActive: boolean) {
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBusiness(id: string) {
  const { error } = await supabaseAdmin
    .from("businesses")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}

// ─── User Management (Super Admin) ─────────────────────────────────

export interface AdminUser {
  id: string; // profile id
  auth_user_id: string; // supabase auth user id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  businessCount: number;
}

export async function listAllUsers(): Promise<AdminUser[]> {
  // Get all profiles
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Get auth users for email/last_sign_in info
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.listUsers();
  if (authError) throw new Error(authError.message);

  const authUsersMap = new Map<string, (typeof authData.users)[0]>();
  for (const u of authData.users) {
    authUsersMap.set(u.id, u);
  }

  // Get business counts per owner
  const { data: bizCounts, error: bizError } = await supabaseAdmin
    .from("businesses")
    .select("owner_id");

  if (bizError) throw new Error(bizError.message);

  const countMap = new Map<string, number>();
  for (const row of bizCounts || []) {
    countMap.set(row.owner_id, (countMap.get(row.owner_id) || 0) + 1);
  }

  return (profiles || []).map((profile) => {
    const authUser = authUsersMap.get(profile.auth_user_id);
    return {
      id: profile.id,
      auth_user_id: profile.auth_user_id,
      email: authUser?.email || "unknown",
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: profile.role || "user",
      created_at: profile.created_at,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      businessCount: countMap.get(profile.id) || 0,
    };
  });
}

export async function updateUserRole(profileId: string, role: string) {
  // Validate role
  const validRoles = ["user", "admin", "super_admin"];
  if (!validRoles.includes(role)) {
    throw new Error(
      `Invalid role: ${role}. Must be one of: ${validRoles.join(", ")}`,
    );
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", profileId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUser(profileId: string) {
  // Get the auth_user_id first
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("auth_user_id")
    .eq("id", profileId)
    .single();

  if (profileError || !profile) throw new Error("Profile not found");

  // 1. Get all businesses owned by this user
  const { data: businesses, error: bizError } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("owner_id", profileId);

  if (bizError) throw new Error(`Failed to fetch user businesses: ${bizError.message}`);

  // 2. Delete each business (and its dependencies)
  console.log(`Deleting ${businesses?.length || 0} businesses for user ${profileId}`);
  for (const biz of businesses || []) {
    try {
      await deleteBusinessRecursively(biz.id);
    } catch (err: any) {
      console.error(`Failed to delete business ${biz.id}:`, err);
      throw new Error(`Failed to delete business ${biz.id}: ${err.message}`);
    }
  }

  // 3. Cleanup Storage (Logos and Menu Images)
  try {
    console.log(`Cleaning up storage for auth user ${profile.auth_user_id}`);
    await cleanupUserStorage(profile.auth_user_id);
  } catch (err: any) {
    console.error(`Failed to cleanup storage for user ${profile.auth_user_id}:`, err);
    // We log but maybe don't throw here? Or do we?
    // If we fail to delete files, the user deletion might still succeed if there is no strict FK.
    // However, if there IS a strict FK, we must succeed. Let's assume we should try our best but not block if it's just permission usage?
    // Actually, if the 500 is due to FK from storage.objects to auth.users, we MUST delete them.
    // So let's throw.
    throw new Error(`Failed to cleanup storage: ${err.message}`);
  }

  // 4. Delete profile row explicitly FIRST
  console.log(`Deleting profile ${profileId}`);
  const { error: profileDelError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", profileId);
  
  if (profileDelError) {
     console.error("Failed to delete profile row:", profileDelError);
     throw new Error(`Failed to delete profile: ${profileDelError.message}`);
  }

  // 5. Delete from Supabase Auth
  if (!profile.auth_user_id) {
    console.warn(`User ${profileId} has no auth_user_id, skipping auth deletion`);
  } else {
    console.log(`Deleting auth user ${profile.auth_user_id}`);
    
    // UUID basic validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profile.auth_user_id)) {
       console.error(`Invalid Auth UUID: ${profile.auth_user_id}`);
       // Don't throw here, just warn, because profile is already deleted.
       // The user is effectively gone from the app perspective.
    } else {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        profile.auth_user_id,
      );
      
      if (authError) {
        console.error("Failed to delete auth user:", authError);
        // If profile is already gone, allow success but log error
      }
    }
  }

  return true;
}

// Helper to cleanup storage
async function cleanupUserStorage(authUserId: string) {
  if (!authUserId) return; // guard against null
  const buckets = ['logos', 'menu-images'];
  
  for (const bucket of buckets) {
    // List files in the user's folder
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from(bucket)
      .list(authUserId);
      
    if (listError) {
      console.warn(`Failed to list files in bucket ${bucket} for user ${authUserId}:`, listError);
      continue;
    }
    
    if (files && files.length > 0) {
      const pathsToRemove = files.map(f => `${authUserId}/${f.name}`);
      console.log(`Removing ${pathsToRemove.length} files from ${bucket}`);
      
      const { error: removeError } = await supabaseAdmin.storage
        .from(bucket)
        .remove(pathsToRemove);
        
      if (removeError) {
        throw new Error(`Failed to remove files from ${bucket}: ${removeError.message}`);
      }
    }
  }
}

// Helper to delete a business and all its sub-resources
async function deleteBusinessRecursively(businessId: string) {
  // A. Delete Items
  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("id")
    .eq("business_id", businessId);

  if (categories && categories.length > 0) {
    const categoryIds = categories.map((c) => c.id);
    // Delete in chunks if needed, but for now simple in() is fine
    const { error: itemError } = await supabaseAdmin.from("items").delete().in("category_id", categoryIds);
    if (itemError) throw new Error(`Failed to delete items: ${itemError.message}`);
  }

  // B. Delete Categories
  const { error: catError } = await supabaseAdmin.from("categories").delete().eq("business_id", businessId);
  if (catError) throw new Error(`Failed to delete categories: ${catError.message}`);

  // C. Delete Business
  const { error: bizError } = await supabaseAdmin.from("businesses").delete().eq("id", businessId);
  if (bizError) throw new Error(`Failed to delete business: ${bizError.message}`);
}

export async function inviteUser(email: string, role: string = "user") {
  const validRoles = ["user", "admin", "super_admin"];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

  // Generate a random temp password
  const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

  // Create user directly via Supabase Admin (bypasses email rate limits)
  // We automatically confirm the email so they can login immediately (or reset password)
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError) throw new Error(authError.message);

  // Create profile with the specified role
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      auth_user_id: authUser.user.id,
      full_name: null,
      avatar_url: null,
      role,
    },
    { onConflict: "auth_user_id" },
  );

  if (profileError) {
    // Attempt rollback (delete auth user)
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    throw new Error(profileError.message);
  }

  return { 
    id: authUser.user.id, 
    email, 
    tempPassword, // Return this so admin can share it? Or just say "created"? 
    // Usually admin needs to know the password or sending a reset link is better. 
    // For now, let's return it.
    message: "User created with temporary password. Please advise user to change it."
  };
}
