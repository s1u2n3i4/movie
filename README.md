# Reelhouse — Movie Catalog & Streaming Platform

A full-stack catalog and streaming site for **movies you legally own, have licensed, hold creator permission for, or that are public domain**. The admin panel is the only way to add content, and every title requires an explicit rights attestation before it can be published — there is no path for uploading or linking unauthorized content.

Built with Next.js (App Router), MongoDB/Mongoose, Tailwind CSS, and Cloudinary for image hosting.

## Legal & content policy (read first)

- The **Add/Edit Movie** form requires selecting a `rightsStatus` (owned / licensed / public-domain / creator-permission) and checking a rights-confirmation box. The API refuses to publish a title without both, regardless of what the client sends.
- The `videoUrl` field is meant for an authorized stream (your own hosting, a licensed CDN, an embeddable YouTube/Vimeo upload you control, etc.) — this project does not scrape, proxy, or link to third-party pirated sources, and you shouldn't point it at any.
- Keep your own records (`licenseNote` field, plus your actual license agreements) in case you need to demonstrate rights later.

## Tech stack

- **Frontend/Backend:** Next.js 14 (App Router), React 18, Next.js Route Handlers as the API
- **Database:** MongoDB via Mongoose
- **Auth:** bcrypt-hashed passwords, JWT session in an HTTP-only cookie, role-based access control (superadmin / admin / editor), rate-limited login, Edge middleware guarding `/admin/*` and admin APIs
- **Images:** Cloudinary (swap out `lib/cloudinary.js` for another provider if you prefer)
- **Styling:** Tailwind CSS, custom dark "cinema" theme

## Project structure

```
movie-catalog/
├── app/
│   ├── (site)/                 # Public site (shares navbar/footer layout)
│   │   ├── page.js             # Homepage
│   │   ├── movie/[slug]/       # Movie details page
│   │   ├── genre/[slug]/       # Genre listing
│   │   └── search/             # Search + filters
│   ├── admin/
│   │   ├── login/              # Admin login (no sidebar)
│   │   └── (panel)/            # Everything behind auth, with sidebar
│   │       ├── dashboard/
│   │       ├── movies/         # Table, add/, [slug]/edit/
│   │       ├── genres/
│   │       └── users/
│   ├── api/
│   │   ├── auth/                login, logout, me
│   │   ├── movies/               CRUD + [slug]/toggle (publish/feature)
│   │   ├── genres/                CRUD
│   │   ├── upload/                Cloudinary image upload
│   │   └── admin/                 dashboard stats, users, change-password
│   ├── sitemap.js / robots.js
│   └── layout.js / globals.css
├── components/                  # Public UI (Navbar, MovieCard, VideoPlayer, …)
│   └── admin/                   # Admin-only UI (MovieForm, AdminSidebar, …)
├── lib/                          db.js, auth.js, requireAdmin.js, validation.js,
│                                  slug.js, cloudinary.js, data.js, rateLimit.js
├── models/                       Admin.js, Movie.js, Genre.js, View.js, Settings.js
├── middleware.js                 Route protection for /admin and admin APIs
├── scripts/seedAdmin.js          Creates the first superadmin
└── .env.example
```

## MongoDB collections

`admins`, `movies`, `genres`, `views`, `settings` — schemas are defined in `models/`. Text search is indexed on `movies.title`, `description`, and `tags`.

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in MONGODB_URI, JWT_SECRET, Cloudinary keys, etc.

npm run seed:admin     # creates the first superadmin from SEED_ADMIN_* env vars
npm run dev            # http://localhost:3000
```

Log in at `/admin/login`. **Default seeded credentials are `admin` / `admin123` unless you override `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` in `.env.local` — change this password immediately after your first login** (via Admin → Users, or the `/api/admin/change-password` endpoint). Never leave these defaults in a deployed environment.

Then: **Admin → Add Movie** → fill in the form, upload a poster, add an authorized stream URL, confirm rights, and hit **Publish**. It's saved to MongoDB and appears on the homepage/genre/search pages immediately.

## Environment variables

See `.env.example` for the full list. At minimum you need:

- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — long random string (`openssl rand -base64 48`)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — for image uploads
- `NEXT_PUBLIC_SITE_URL` — used in metadata, Open Graph tags, and the sitemap

## Security notes

- Passwords are hashed with bcrypt (cost factor 12) — never stored in plain text.
- Sessions are signed JWTs in an `httpOnly`, `sameSite=lax` cookie (and `secure` in production).
- `middleware.js` blocks unauthenticated access to `/admin/*` pages and to write methods on admin APIs at the edge; each route handler double-checks the session and role server-side too (defense in depth).
- Login is rate-limited per IP (`lib/rateLimit.js`); tune `LOGIN_RATE_LIMIT_*` in your env.
- Only `superadmin` can manage other admin accounts (`/admin/users`, `/api/admin/users/*`).
- All admin input is validated with Zod (`lib/validation.js`) before touching the database.

## Deployment

1. **Database:** provision a MongoDB Atlas cluster (or self-hosted), get the connection string into `MONGODB_URI`.
2. **Images:** create a free Cloudinary account, put the three keys into your env.
3. **Host:** deploy to Vercel (recommended for Next.js), Render, or any Node host that supports Next.js 14 App Router + Edge middleware.
   - On Vercel: `vercel env add` for each variable in `.env.example`, then `vercel --prod`.
4. **Seed the first admin** against your production database: run `npm run seed:admin` locally with `MONGODB_URI` pointed at production (or run it once via a one-off script/job on your host), then log in and change the password immediately.
5. **Set `NEXT_PUBLIC_SITE_URL`** to your real domain so metadata, Open Graph tags, and the sitemap are correct.
6. Point your domain's DNS at your host and enable HTTPS (most hosts do this automatically) — required for secure cookies in production.

## Extending

- Swap `lib/cloudinary.js` for S3/another provider — every caller only depends on `uploadImage()`/`deleteImage()`.
- Add more roles/permissions by extending the `role` enum on `Admin` and the `allowedRoles` arrays passed to `requireAdmin()`.
- The `View` collection is ready for time-windowed analytics (views per day/week) if you want more than the running `Movie.views` counter.
