# MenuX

A full-stack SaaS platform that lets business owners create and manage digital menus — shareable via a unique public link. Built for restaurants, cafés, gaming gear shops, and more.

## What It Does

MenuX allows business owners to:

- **Create a business profile** with name, description, logo, and a unique slug
- **Build a structured menu** with categories, items, prices, images, and food type tags
- **Drag-and-drop reorder** categories and items for full control over menu layout
- **Choose from menu templates** to style the public-facing menu page
- **Share a public menu link** (e.g. `/menu/my-cafe`) — no login required for viewers
- **Upload images** for logos and menu items (stored in Supabase Storage)
- **Manage food types / dietary tags** (e.g. Halal, Vegan, Spicy) per business


## Tech Stack

### Frontend

| Technology          | Purpose                                  |
| ------------------- | ---------------------------------------- |
| **React 19**        | UI framework                             |
| **TypeScript**      | Type safety                              |
| **Vite 7**          | Build tool & dev server                  |
| **React Router v7** | Client-side routing                      |
| **Tailwind CSS 4**  | Utility-first styling                    |
| **@dnd-kit**        | Drag-and-drop (category/item reordering) |
| **Lucide React**    | Icon library                             |
| **Supabase JS**     | Auth (Google OAuth + email/password)     |
| **Axios**           | HTTP client for API calls                |

### Backend

| Technology                                       | Purpose                              |
| ------------------------------------------------ | ------------------------------------ |
| **Express 5**                                    | REST API framework                   |
| **TypeScript**                                   | Type safety                          |
| **Supabase**                                     | Database (PostgreSQL), Auth, Storage |
| **JWT (jsonwebtoken)**                           | Token verification                   |
| **bcryptjs**                                     | Password hashing                     |
| **Multer**                                       | File upload handling                 |
| **Swagger (swagger-jsdoc + swagger-ui-express)** | API documentation                    |
| **Morgan**                                       | HTTP request logging                 |
| **express-validator**                            | Request validation                   |

### Infrastructure

| Technology                       | Purpose                                       |
| -------------------------------- | --------------------------------------------- |
| **Supabase (hosted PostgreSQL)** | Database with Row Level Security              |
| **Supabase Auth**                | Authentication (Google OAuth, email/password) |
| **Supabase Storage**             | Image/file storage (logos, menu item images)  |

Ownership-scoped permissions (`:own`) ensure admins can only modify their own businesses, while super admins bypass ownership checks.


## Key Features

- **Public Menu Pages** — Shareable link per business, no auth needed for viewers
- **Drag-and-Drop Ordering** — Reorder categories and items visually
- **Menu Templates** — Choose how the public menu looks
- **Image Uploads** — Business logos and item images via Supabase Storage
- **Dark Mode** — System-aware theme toggle (light / dark / system)
- **Food Type Tags** — Label items with dietary/type tags
- **RBAC** — Granular role-based permissions on both frontend and backend
- **Swagger API Docs** — Auto-generated from route annotations
- **Security Middleware** — Request sanitization and protection
- **Error Boundaries** — Graceful error handling on the frontend

## License

MIT License

Copyright (c) 2026 Sophanith Kosal (nithkidd)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

**Author:** Sophanith Kosal (nithkidd)  
**Website:** [https://kosalsophanith.dev/](https://kosalsophanith.dev/)
