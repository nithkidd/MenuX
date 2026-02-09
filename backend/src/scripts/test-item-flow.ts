import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { supabaseAdmin } from "../config/supabase.js";

dotenv.config();

const API_URL = "http://localhost:3001/api/v1";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testItemFlow() {
  const email = `test_item_${Date.now()}@example.com`;
  const password = "password123";

  console.log(`Testing Item Flow with user: ${email}`);

  try {
    // 1. Create Supabase Auth user
    console.log("1. Creating Supabase user...");
    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: "Test Item",
        },
      });

    if (createError || !created?.user) {
      throw createError || new Error("Failed to create Supabase user");
    }

    console.log("User created:", created.user.id);

    // 2. Sign in to get access token
    console.log("2. Signing in...");
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData.session) {
      throw signInError || new Error("Failed to sign in");
    }

    const token = signInData.session.access_token;
    console.log("Sign-in success.");

    // 3. Create Business
    console.log("3. Creating Business...");
    const busRes = await axios.post(
      `${API_URL}/businesses`,
      {
        name: `Biz ${username}`,
        business_type: "restaurant",
        description: "Test Desc",
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const businessId = busRes.data.data.id;
    console.log("Business created:", businessId);

    // 4. Create Category
    console.log("4. Creating Category...");
    const catRes = await axios.post(
      `${API_URL}/businesses/${businessId}/categories`,
      {
        name: "Test Cat",
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const categoryId = catRes.data.data.id;
    console.log("Category created:", categoryId);

    // 5. Create Item
    console.log("5. Creating Item...");
    const itemRes = await axios.post(
      `${API_URL}/categories/${categoryId}/items`,
      {
        name: "Test Item",
        price: 10.99,
        description: "Yummy",
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    console.log("Item created:", itemRes.data.data.id);
    console.log("✅ ALL STEPS PASSED");
  } catch (error: any) {
    console.error("❌ Test Failed:", error.response?.data || error.message);
    if (error.response?.data) {
      console.error("Status:", error.response.status);
    }
    process.exit(1);
  }
}

testItemFlow();
