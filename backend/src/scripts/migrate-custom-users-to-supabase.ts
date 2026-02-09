import dotenv from "dotenv";
import { supabaseAdmin } from "../config/supabase.js";

dotenv.config();

const PAGE_SIZE = 1000;

async function listAllAuthUsers() {
  const users: any[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });

    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (data.users.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return users;
}

async function migrateCustomUsers() {
  console.log("Starting migration of custom users to Supabase Auth...");

  const { data: legacyUsers, error: legacyError } = await supabaseAdmin
    .from("users")
    .select("id, email, username, first_name, last_name");

  if (legacyError) {
    console.error("Failed to read legacy users table:", legacyError.message);
    return;
  }

  if (!legacyUsers || legacyUsers.length === 0) {
    console.log("No legacy users found.");
    return;
  }

  const authUsers = await listAllAuthUsers();
  const authByEmail = new Map<string, any>();

  authUsers.forEach((authUser) => {
    if (authUser.email) {
      authByEmail.set(authUser.email.toLowerCase(), authUser);
    }
  });

  for (const legacyUser of legacyUsers) {
    if (!legacyUser.email) {
      console.warn("Skipping legacy user with missing email:", legacyUser.id);
      continue;
    }

    const email = legacyUser.email.toLowerCase();
    let authUser = authByEmail.get(email);

    if (!authUser) {
      const { data: created, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name:
              `${legacyUser.first_name || ""} ${legacyUser.last_name || ""}`.trim(),
            username: legacyUser.username,
          },
        });

      if (createError || !created?.user) {
        console.error(
          "Failed to create auth user for",
          email,
          createError?.message,
        );
        continue;
      }

      authUser = created.user;
      authByEmail.set(email, authUser);
      console.log("Created auth user:", email);
    }

    const { data: profileByUserId } = await supabaseAdmin
      .from("profiles")
      .select("id, auth_user_id")
      .eq("user_id", legacyUser.id)
      .maybeSingle();

    const { data: profileByEmail } = await supabaseAdmin
      .from("profiles")
      .select("id, auth_user_id")
      .eq("email", email)
      .maybeSingle();

    const profile = profileByUserId || profileByEmail;

    if (profile) {
      if (profile.auth_user_id !== authUser.id) {
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ auth_user_id: authUser.id })
          .eq("id", profile.id);

        if (updateError) {
          console.error(
            "Failed to update profile for",
            email,
            updateError.message,
          );
        } else {
          console.log("Linked profile to auth user:", email);
        }
      }
      continue;
    }

    const { error: insertError } = await supabaseAdmin.from("profiles").insert({
      auth_user_id: authUser.id,
      email,
      full_name:
        `${legacyUser.first_name || ""} ${legacyUser.last_name || ""}`.trim(),
    });

    if (insertError) {
      console.error("Failed to create profile for", email, insertError.message);
    } else {
      console.log("Created profile for", email);
    }
  }

  console.log("Migration complete.");
}

migrateCustomUsers().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
