import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: true,
      deny: [".env", ".env.*", "*.{crt,pem}"],
    },
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:3000 https://*.supabase.co; object-src 'none'; base-uri 'self';",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Supabase and Axios
          "http-vendor": ["@supabase/supabase-js", "axios"],
          // UI utilities
          "ui-vendor": ["lucide-react", "clsx", "tailwind-merge"],
          // Drag and drop (used in menu editor)
          "dnd-vendor": [
            "@dnd-kit/core",
            "@dnd-kit/sortable",
            "@dnd-kit/utilities",
          ],
          // Image cropping (used in uploads)
          "image-vendor": ["react-easy-crop"],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit slightly since we're using gzip
  },
});
