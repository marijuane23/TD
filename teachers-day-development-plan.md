# Teacher's Day Website — Development Plan

**Event:** BISU Bilar Teacher's Day Celebration
**Event Date:** October 7, 2026
**Today:** September 17, 2026 (≈3 weeks to launch)

**Repos:**

- Backend: `TD-Server/backend` → deployed on Render
- Frontend: `TD/frontend` → deployed on Hostinger
- Database: MySQL

---

## 1. Overview

One unified full-stack build, developed and delivered **Database → Backend → Frontend → Integration**, following an Agile (Scrum-lite) process with short sprints. All five confirmed features live inside a single React app (one SPA, one set of routes):

| #           | Feature (as specified)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Route(s)                                    | Access                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------- |
| **a** | **Hero Section** — the animated "Happy Teacher's Day" hero is the landing route of the same React app. **Browse Teachers** and **Login** live in a persistent site **header** (not inside the hero itself), so they're reachable from every public page, not just `/`                                                                                                                                                                                                                                        | `/` (hero content), header on every route | Public                       |
| **b** | **Teacher Directory** — all teachers, browsable publicly, shown in a **4-column × 3-row (12 per page) grid** with **search**, **sort**, and **pagination**                                                                                                                                                                                                                                                                                                                                              | `/teachers`                               | Public                       |
| **c** | **Teacher Timeline** — clicking a teacher opens their own timeline of videos, pictures, and messages from students, **posted directly with no admin approval needed** (anonymous allowed, no student login). Each video/image has **Download** and **Share to Facebook** controls                                                                                                                                                                                                                              | `/teachers/:slug`                         | Public                       |
| **d** | **Admin Dashboard** — a Teachers tab, also shown as a **4×3 grid with search/sort/pagination**; selecting a teacher shows all of that teacher's videos, images, and messages, with **Delete message** and **Remove media** controls; an **Add Teacher** button adds one teacher at a time, which also appears in the public Teacher Directory. Also supports **importing multiple teachers from an uploaded Excel file** in one action, and **exporting the current teacher list to Excel** | `/login`, `/admin`                      | Admin only (login-protected) |
| **e** | **Public Wall** — below the Hero, a **pannable, zoomable canvas** of greetings (click-and-drag to pan, scroll/pinch to zoom in and out like a map) instead of a vertical scroll — built to stay usable as the number of greetings grows. Anyone can post; **posted instantly with no admin approval needed**                                                                                                                                                                                                        | `/` (below Hero)                          | Public                       |

Mapped onto the stack: the Hero (a) and Public Wall (e) share one landing route; the Teacher Directory (b) and Teacher Timeline (c) are fully public with zero authentication anywhere in that flow, including for media/message submission; and the Admin Dashboard (d) is the only part of the site behind a login, handling teacher creation and post-hoc content cleanup (not pre-approval — see below). No student-facing feature anywhere in the app requires an account, password, or session of any kind — "anonymous" is a first-class, always-available option on every public submission form.

> **Moderation model: post-hoc, not pre-approval — for both (c) and (e).** Neither the Teacher Timeline nor the Public Wall holds anything back for review. A student's video, picture, or message shows up on the teacher's timeline the instant it's submitted; a greeting shows up on the wall the instant it's submitted. The Admin Dashboard (d) no longer has an "approve" workflow at all — its role is oversight and cleanup: browse everything that's live under a teacher (or on the wall) and delete anything inappropriate after the fact. Because nothing is gated before it's public, the automated safety nets in §8.1 (file-type/size limits, spam/profanity filtering, rate-limiting) carry more weight than they would in a pre-moderated system.

> **Cross-cutting requirement: mobile responsiveness.** Most visitors will land here from a QR code scanned on their phone, so every feature is designed mobile-first, not just checked at the end:
>
> - **Header (a):** collapses to a compact bar with a hamburger/menu on narrow screens; **Browse Teachers** and **Login** stay reachable in one tap.
> - **Teacher Directory & Admin grid (b, d):** the 4×3 grid is the desktop/tablet layout; it reflows to 2 columns on phones (search, sort, and pagination controls stack full-width and stay usable with on-screen keyboards).
> - **Teacher Timeline (c):** Download and Share buttons are touch-sized (no tiny tap targets), and media scales to the viewport instead of overflowing.
> - **Public Wall (e):** pan is a single-finger drag and zoom is pinch-to-zoom on touch devices, mirroring the desktop click-and-drag / scroll-to-zoom behavior — this needs its own testing pass since gesture libraries don't always behave identically on mobile vs. desktop (see §7.1 and §8.2).
> - **General:** all layouts use relative units and flexible containers rather than fixed desktop widths; every page is checked against actual phone screens (§8.2), not just a resized browser window.

QR code generation is already handled outside this plan; it will simply point at the one production URL once the full app is live.

---

## 2. Tech Stack

| Layer                          | Choice                                                              | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend framework**   | **React** (via Vite)                                          | Component-based SPA, fast dev server, large ecosystem for the interactive pieces (submission forms, admin dashboard, protected routes, client-side routing). Builds to a static`dist/` bundle that deploys cleanly to Hostinger.                                                                                                                                                                                                                               |
| **Routing**              | **React Router**                                              | Client-side routes for`/`, `/teachers`, `/teachers/:slug`, `/login`, `/admin`, all within one SPA build. `/admin` is a protected route that redirects to `/login` if there's no valid admin session. A shared layout route wraps the public pages with the persistent `Header.jsx` (Browse Teachers, Login), so it renders once and stays consistent across `/`, `/teachers`, and `/teachers/:slug` rather than being duplicated per page. |
| **Styling**              | **Tailwind CSS**                                              | Utility-first, fast to get a clean, cohesive, polished look without hand-written CSS files. Standard pairing with a Vite + React project.                                                                                                                                                                                                                                                                                                                        |
| **Animation**            | **GSAP** (GreenSock)                                          | High-quality "wow factor" motion for the hero section — text reveals, confetti bursts, scroll-triggered effects. Used inside React via refs +`useEffect` (or the `@gsap/react` `useGSAP` hook).                                                                                                                                                                                                                                                           |
| **Pan/zoom canvas**      | **`react-zoom-pan-pinch`**                                  | Powers the Public Wall's map-like interaction — click-and-drag (or single-finger touch drag) to pan, mouse-wheel/pinch to zoom in and out. Chosen over a hand-rolled canvas because it already handles the mouse/touch/trackpad gesture differences and gives pan/zoom bounds and controls out of the box.                                                                                                                                                      |
| **Excel import/export**  | **`exceljs`** (backend)                                     | Reads the admin's uploaded`.xlsx` file to bulk-create teachers (`POST /admin/teachers/import`, §6.1) and generates a `.xlsx` for the export button (`GET /admin/teachers/export`). This work happens entirely server-side — the admin's browser only ever uploads a file or downloads a result, never handles spreadsheet parsing itself.                                                                                                              |
| **Facebook sharing**     | Facebook's`sharer.php` dialog + a tiny server-rendered share page | Sharing just opens`https://www.facebook.com/sharer/sharer.php?u=<link>` — no Facebook Login/SDK needed. But Facebook's link-preview scraper doesn't run JavaScript, so it can't read an SPA's client-rendered Open Graph tags; the `<link>` it's given points at a small Express-rendered page (`GET /share/media/{media_id}`, §6.1) with real `<meta property="og:...">` tags, which then redirects a human visitor into the real SPA page.           |
| **Backend framework**    | **Node.js (Express)**                                         | JS end-to-end with the React frontend — one language across the stack, shared JSON handling, easy to reuse validation logic conventions. Fast to build REST endpoints, deploys straightforwardly to Render as a Node web service.                                                                                                                                                                                                                               |
| **Admin authentication** | **bcrypt + JWT**                                              | Admin passwords are hashed with`bcrypt` (never stored in plain text) in an `admins` table. `POST /admin/login` verifies credentials and issues a JWT (`jsonwebtoken`); the frontend attaches it as `Authorization: Bearer <token>` on every `/admin/*` request. Middleware on the backend rejects any `/admin/*` request without a valid token.                                                                                                    |
| **Database**             | **MySQL, hosted on Hostinger**                                | Hostinger's included MySQL hosting, with remote access enabled so the Render backend can connect. Access via`mysql2` with parameterized/prepared queries.                                                                                                                                                                                                                                                                                                      |
| **Media storage**        | **MySQL `LONGBLOB` columns**                                | Uploaded teacher-timeline images/videos are stored directly in the database as BLOBs — no third-party media host. Simpler ops (one system, one backup), at the cost of a bigger DB and no CDN/auto-thumbnailing, so file size limits matter more (see §6.2).                                                                                                                                                                                                   |
| **Database GUI**         | **SQLyog Ultimate v9.62**                                     | Managing the MySQL schema, running queries, and inspecting/exporting submitted data (including BLOBs) during development.                                                                                                                                                                                                                                                                                                                                        |
| **Hosting — frontend**  | Hostinger                                                           | React/Vite's static production build (`dist/`) drops in cleanly. Needs an SPA fallback rewrite (see §7) since it's client-side routed.                                                                                                                                                                                                                                                                                                                        |
| **Hosting — backend**   | Render                                                              | As planned.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

---

## 3. Agile Development Approach

Small team, ~3-week runway, hard launch date — so this uses a lightweight Scrum-style process rather than heavyweight ceremonies:

- **Sprint length:** ~4–6 calendar days (four sprints total, tuned to fit before Oct 7).
- **Backlog:** the checklist items under each section below (§5–§8) *are* the sprint backlog — pull items into the current sprint in order.
- **Sequencing constraint:** unlike a typical Agile project that builds thin vertical slices across all layers every sprint, this plan deliberately sequences **Database → Backend → Frontend**, because the frontend has nothing real to talk to until the API and schema exist, and building it against mocked data risks rework. Each sprint still ends with something concrete and demoable (a working schema, a working API tested via `curl`/Postman/Insomnia, a working UI wired to real data).
- **Daily/self check-in:** quick personal stand-up — what shipped yesterday, what's next, any blocker — cheap to do solo but keeps the short runway honest.
- **Sprint review:** at the end of each sprint, demo the working slice to yourself/co-organizers before moving to the next layer.
- **Definition of done** (per backlog item): works locally, uses parameterized queries where relevant, has basic error handling (e.g. Express error-handling middleware), and — from Sprint 2 onward — is deployed to the relevant staging environment (Render for backend), not just running on localhost.

---

## 4. Sprint Plan / Timeline

| Sprint                                          | Dates            | Goal                                                                                                  | Deliverable                                                                                                                            | Status                         |
| ----------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Sprint 1 — Database**                  | Sep 17 – Sep 20 | Schema designed, created, and seeded on Hostinger MySQL                                               | Live`teachers`, `messages`, `message_media`, `wall_messages`, and `admins` tables, reachable remotely, inspectable in SQLyog | ✅**Completed** (Sep 17) |
| **Sprint 2 — Backend**                   | Sep 21 – Sep 26 | Full REST API — public + admin (auth-protected) — built against the real schema, deployed to Render | All endpoints in §6 working against the live DB (testable via Postman/Insomnia)                                                       | ✅**Completed**          |
| **Sprint 3 — Frontend**                  | Sep 27 – Oct 2  | React + Tailwind SPA built against the real, deployed API (no mock data)                              | Hero + Public Wall, Teacher Directory, Teacher Timeline, admin Login + Dashboard, all wired to the live backend                        | ✅**Completed**          |
| **Sprint 4 — Integration & Launch Prep** | Oct 3 – Oct 6   | End-to-end testing, content spot-check dry run, cross-device QA, single production deploy             | Full app live on Hostinger + Render, warmed up, backed up, ready for Oct 7                                                             | 🟡**In Progress**        |
| **Event**                                 | **Oct 7**  | Go live                                                                                               | Monitor incoming submissions in real time; delete anything inappropriate from the Admin Dashboard as needed                            | ⏳ Pending                     |

---

## 5. Database (Sprint 1)

### 5.1 Schema (MySQL)

```sql
CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  photo_url VARCHAR(255),
  slug VARCHAR(120) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_teachers_name (name),             -- supports Teacher Directory / Admin grid search (b, d)
  INDEX idx_teachers_department (department)  -- supports filtering/sorting by department
);

-- Teacher Timeline entries (feature c): the text message part. No student
-- login required, and no approval gate — a message is live on the teacher's
-- timeline the instant it's submitted.
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  sender_name VARCHAR(100),          -- nullable, allow "Anonymous"
  message_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Media (photo/video) attached to a Teacher Timeline entry, kept in its own
-- table so an admin can delete just the media and leave the text message in
-- place, or delete the message (which cascades and takes its media with it).
-- One message currently has at most one attached media row (0 or 1), but
-- splitting it out this way also leaves room for multiple attachments later
-- without a schema change.
CREATE TABLE message_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  media_data LONGBLOB NOT NULL,      -- raw image/video bytes stored in-DB
  media_type ENUM('image', 'video') NOT NULL,
  media_mime VARCHAR(50) NOT NULL,   -- e.g. 'image/jpeg', 'video/mp4' — needed to serve with the right Content-Type
  media_size_bytes INT,              -- useful for quotas/monitoring DB growth
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Public Wall greetings (feature e): general messages, not tied to a teacher.
-- Anyone can post; no student login required. No approval gate — a post is
-- live the instant it's submitted. Admins can only delete after the fact
-- (post-hoc moderation), so there's no "approved" flag to gate visibility.
CREATE TABLE wall_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_name VARCHAR(100),          -- nullable, allow "Anonymous"
  message_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin accounts (feature d): the only login on the whole site.
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash — never store plain text
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> **Note:** `LONGBLOB` supports up to 4GB per row, but MySQL's `max_allowed_packet` setting (check/raise this in Hostinger's hPanel or via SQLyog) caps how large a single insert can be — confirm it's set comfortably above your largest allowed video upload (see limits in §6.2) or uploads will fail silently.

### 5.2 MySQL Hosting Decision

**Decided: Hostinger MySQL.** Render doesn't provide managed MySQL on its free tier (only Postgres is free-tier managed), so the database is hosted on Hostinger, with the Render backend connecting to it remotely.

**Connection details (Hostinger MySQL):**

| Field    | Value |
| -------- | ----- |
| Host     | ----- |
| Port     | ----- |
| Database | ----- |
| Username | ----- |
| Password | ----- |

> ⚠️ These are live credentials. Keep this file out of version control (or move this table to `.env` / Render's environment variable settings once the backend is scaffolded) — don't let it end up in the `TD-Server/backend` repo.

### 5.3 Sprint 1 Backlog

- [X] Enable remote MySQL access in Hostinger's hPanel (completed)
- [X] Whitelist Render's outbound IP (or allow remote access broadly, if Hostinger's plan requires it) in hPanel's Remote MySQL settings (completed)
- [X] Store connection details as environment variables (locally in `.env`, later on Render) — never commit them to the repo (completed)
- [X] Create schema (`teachers`, `messages`, `message_media`, `wall_messages`, `admins`) via migration script (`scripts/migrate.js` + `src/db/schema.sql`) (completed)
- [X] Check/raise `max_allowed_packet` so video BLOB inserts don't get truncated or rejected (verified at 1024 MB / 1 GB)
- [X] Seed `teachers` table with the actual faculty list + generated `slug` values (15 sample faculty seeded across colleges)
- [X] Create the first admin account: generate a `bcrypt` hash locally and insert it directly (`Admin23` seeded with bcrypt hash)
- [X] Confirm remote connectivity works from outside Hostinger (verified via `scripts/test-connection.js`)

---

## 6. Backend (Sprint 2)

**Stack:** Node.js + Express + `mysql2` (promise API) + `multer` (multipart/file upload handling) + `exceljs` (Excel import/export) + `bcrypt` + `jsonwebtoken`, on Render.

### 6.1 Endpoints

**Public (no login):**

| Method | Route                         | Purpose                                                                                                                                                                                                                                                                   |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/teachers`                 | Teacher Directory grid (b): supports`?q=` (search by name/department), `?sort=name_asc\|name_desc\|newest`, `?page=` and `?limit=12` (4×3 grid). Returns `{ items, page, totalPages, totalCount }`                                                               |
| GET    | `/teachers/{slug}`          | Teacher profile + all timeline entries, newest first — Teacher Timeline (c). No approval filter: everything that hasn't been deleted shows up                                                                                                                            |
| POST   | `/teachers/{slug}/messages` | Submit a timeline entry: message + optional image/video (stored as BLOB)                                                                                                                                                                                                  |
| GET    | `/media/{media_id}`         | Stream the stored image/video bytes for one`message_media` row, with correct `Content-Type`. `?download=1` adds a `Content-Disposition: attachment; filename=...` header so the browser saves it instead of opening it inline — powers the Download button (c)   |
| GET    | `/share/media/{media_id}`   | Tiny server-rendered HTML page (not the SPA) with real Open Graph`<meta>` tags (image/video, title, teacher name) for Facebook's link-preview scraper, then redirects a human visitor to `/teachers/{slug}` on the real site — powers Share to Facebook (c)          |
| GET    | `/wall`                     | Public Wall canvas data (e): cursor-paginated (`?after_id=`, `?limit=`, newest-first by default) rather than one big list, so the canvas can lazy-load more greetings as the visitor pans/zooms out. No approval filter: everything that hasn't been deleted shows up |
| POST   | `/wall`                     | Submit a greeting to the Public Wall (text only) — appears immediately, no approval step                                                                                                                                                                                 |

**Admin (JWT required, except login):**

| Method | Route                             | Purpose                                                                                                                                                                      |
| ------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/admin/login`                  | Verify username/password against`admins`, return a JWT                                                                                                                     |
| GET    | `/admin/teachers`               | Teachers tab grid (d): same`?q=`, `?sort=`, `?page=`, `?limit=12` support as the public `/teachers` grid                                                           |
| POST   | `/admin/teachers`               | Add a single new teacher — immediately visible in the public Teacher Directory                                                                                              |
| POST   | `/admin/teachers/import`        | Bulk-add teachers from an uploaded`.xlsx` file (multipart) — parses rows, creates a teacher per valid row, skips/flags invalid ones, returns a per-row result summary     |
| GET    | `/admin/teachers/export`        | Generate and download a`.xlsx` of the current teacher list (honors the same `?q=`/`?sort=` filters as the grid, so the admin can export a filtered subset or everyone) |
| GET    | `/admin/teachers/{id}/messages` | All of a teacher's timeline entries (they're all already live) — for admin oversight/browsing                                                                               |
| DELETE | `/admin/messages/{id}`          | Delete an entire Teacher Timeline entry — the text message, and its attached media if any (cascades) — after the fact                                                      |
| DELETE | `/admin/media/{id}`             | Delete just the attached media (image/video) from a`message_media` row, **leaving the text message in place** — after the fact                                      |
| DELETE | `/admin/wall/{id}`              | Remove a Public Wall greeting after the fact (post-hoc moderation only — there's no pending/approve step)                                                                   |

### 6.2 Submission Flows

**Teacher Timeline entry (images & videos), feature (c):**

1. Student opens a teacher's page (from the directory or a direct link) — no login needed.
2. Fills out the form: name (optional — allow "Anonymous"), a message, and an optional media attachment (image **or** short video).
3. Client-side validation before upload: file type (`image/*` or `video/mp4`, `video/webm`), file size limit, and — for video — a duration cap, so nobody accidentally uploads a 200MB clip over event WiFi.
4. On submit, the frontend sends a multipart form request to `POST /teachers/{slug}/messages`, with an upload progress indicator (video files are larger, and many people may be uploading at once).
5. Backend inserts a row into `messages` (`sender_name`, `message_text`, `teacher_id`) — no `approved` flag to wait on. If a file was attached, it then inserts a second row into `message_media` (`media_data`, `media_type`, `media_mime`, `media_size_bytes`) referencing that new `message.id`.
6. Student sees a "Thanks! Your message is now on the timeline" confirmation.
7. The entry appears on the teacher's Timeline immediately (the frontend can optimistically show it right away, then refetch to stay in sync with other visitors). `GET /teachers/{slug}` returns each message with a nested `media_url` (e.g. `/media/{media_id}`) when a `message_media` row exists, `null` otherwise; the frontend then requests `GET /media/{media_id}` to stream the actual bytes. For video, since there's no auto-generated thumbnail, either show a generic play icon over a placeholder, or generate a thumbnail server-side on upload (e.g. with `ffmpeg`) and store it as a second, smaller BLOB. If something inappropriate slips through, an admin can remove just the media (`DELETE /admin/media/{id}`, keeping the text) or the whole entry (`DELETE /admin/messages/{id}`) — this is cleanup after publication, not a gate before it.

**Approved limits** (enforced client-side and server-side):

- Images: JPG/PNG/WEBP, max 50MB
- Video: MP4/WEBM, 20–120 seconds, max 50MB
- Enforce both limits client-side (before upload starts) *and* server-side — server-side matters more here, since an oversized upload bloats your own DB directly
- Budget total storage roughly: expected submissions × max size, against your Hostinger MySQL plan's storage quota

**Download & Share a Timeline media item, feature (c):**

1. On a teacher's timeline, each photo/video shows a **Download** icon and a **Share to Facebook** icon alongside it (both public, no login).
2. **Download:** the button is a link to `GET /media/{media_id}?download=1`. The backend sets `Content-Disposition: attachment; filename="<teacher-slug>-<media_id>.<ext>"` so the browser saves the file with a sensible name instead of trying to open it inline — this matters especially on mobile, where opening a raw video/image URL doesn't always trigger a save.
3. **Share to Facebook:** clicking it opens `https://www.facebook.com/sharer/sharer.php?u=<encoded share URL>` in a new tab/window, where `<share URL>` is `{BACKEND_URL}/share/media/{media_id}` — **not** the SPA's own `/teachers/:slug` URL.
4. That share URL hits a small Express route (`GET /share/media/{media_id}`) that server-renders a minimal HTML page with real `<meta property="og:image">` / `og:video` / `og:title` tags describing that specific photo/video and message. This exists because Facebook's link-preview scraper reads only the initial HTML response and does not execute JavaScript, so it can never see tags rendered client-side by the React SPA.
5. A human who actually clicks the shared Facebook post is redirected (`<meta http-equiv="refresh">` or a tiny inline script) from that share page into the real SPA route (`/teachers/{slug}`), landing on the teacher's timeline — the share page itself is just a bridge for Facebook's crawler, not a page people are meant to browse.

**Public Wall greeting, feature (e):**

1. Anyone on the landing route (`/`) scrolls just past the Hero and arrives at the Public Wall — a fixed-height **canvas panel**, not a normal scrolling section of the page.
2. Inside that panel, greetings are laid out as cards scattered across a large 2D space. The visitor **clicks/taps-and-drags** to pan around that space, and **scrolls the wheel (desktop) or pinches (touch)** to zoom in for detail or out for an overview of many greetings at once — the same interaction model as panning/zooming a map. There's no vertical page-scroll involved at all; the wall's own gesture handling captures drag/scroll input inside its bounds.
3. Each card's position is computed **deterministically from its own `id`** (e.g. a seeded pseudo-random layout or a spiral/grid packing function) on the frontend — not stored in the database — so the same greeting always ends up in the same spot on the canvas and a page refresh doesn't reshuffle everything.
4. To submit, the visitor fills a short form (name optional — allow "Anonymous"; text-only greeting, no media, to keep the wall lightweight) surfaced via a button/panel over the canvas (not inline in the flow of cards).
5. Submits to `POST /wall` — the row is inserted and immediately visible; there's no `approved` flag and no waiting on an admin. The new card animates into its computed position on the canvas, ideally near the visitor's current view.
6. `GET /wall` is **cursor-paginated** (`?after_id=`, `?limit=`), not one big list: the frontend loads an initial batch, then fetches more only as the visitor pans/zooms out far enough to reach the edge of what's already loaded — this keeps the canvas responsive even once there are hundreds of greetings, instead of shipping the whole table to the browser on page load.
7. If a post turns out to be inappropriate, an admin can remove it later from the dashboard via `DELETE /admin/wall/{id}` — this is cleanup after publication, not a gate before it; the card disappears from the canvas the next time that region is loaded/refreshed.

**Admin deletes a Teacher Timeline entry (message, video, or image), feature (d):**

1. Admin opens `/admin`, selects a teacher from the Teachers tab. `GET /admin/teachers/{id}/messages` loads every entry for that teacher, each with its text and any attached media rendered together.
2. Because the text (`messages`) and the attachment (`message_media`) are now separate rows, each entry shows **two independent controls**: a **Delete message** action for the whole entry, and — only when media is attached — a smaller **Remove media** (×) control on the image/video itself.
   - **Delete message** removes the text and, if present, its attached media in one go (the `ON DELETE CASCADE` on `message_media.message_id` takes care of the media row automatically) — calls `DELETE /admin/messages/{id}`.
   - **Remove media** deletes only the `message_media` row — calls `DELETE /admin/media/{id}` — and the entry stays on the timeline as a text-only message.
3. Clicking either control shows a short confirm dialog ("Delete this message from [Teacher]'s timeline?" / "Remove this photo/video from this message?") to guard against misclicks, since there's no undo/trash.
4. On confirm, the frontend calls the matching endpoint with the admin's JWT attached.
5. Backend middleware verifies the token, then deletes the targeted row — no orphaned BLOBs either way, since `message_media` is only ever removed directly or via its parent's cascade.
6. On success, the frontend updates the dashboard list immediately (optimistic UI): the whole card disappears for a message delete, or just the media thumbnail disappears (leaving the text) for a media-only delete. The public `/teachers/:slug` timeline reflects the change on next load — no cache/CDN to bust, since media is always streamed live from `/media/{media_id}`.
7. If a delete fails (expired token, network error), show an inline error and leave the entry/media in place rather than silently removing it from the UI.

**Admin login, feature (d):**

1. Admin goes to `/login`, enters username + password.
2. Frontend posts to `POST /admin/login`. Backend looks up the `admins` row by username, compares the password with `bcrypt.compare`, and — if it matches — signs and returns a JWT (short expiry, e.g. a few hours).
3. Frontend stores the token (in memory / `sessionStorage`) and attaches it as `Authorization: Bearer <token>` on every subsequent `/admin/*` request.
4. Backend middleware verifies the JWT on every `/admin/*` route and rejects (401) anything missing or expired — the frontend then redirects back to `/login`.

**Browsing the Teacher grid (Directory (b) and Admin Dashboard (d)):**

1. Both the public `/teachers` Directory and the Admin Dashboard's Teachers tab render the same underlying grid component: **4 columns × 3 rows = 12 teacher cards per page**.
2. A search box filters by name/department (debounced, so it doesn't fire an API call on every keystroke) — calls `GET /teachers?q=...` (or `/admin/teachers?q=...`) and resets to page 1.
3. A sort dropdown (Name A–Z, Name Z–A, Newest added, by Department) maps to `?sort=name_asc|name_desc|newest|department` on the same endpoint.
4. Pagination controls (Prev/Next + page numbers, or a simple page indicator) read `page`/`totalPages` from the response and call the endpoint with the next `?page=`.
5. The two grids share one React component (`TeacherGrid.jsx`, §10) with different data sources (`GET /teachers` vs `GET /admin/teachers`) and different card actions (view timeline vs. select-for-moderation) — so the search/sort/pagination behavior only needs to be built and tested once.

**Bulk-import teachers from Excel, feature (d):**

1. Admin's Teachers tab has an **Import Teachers** button next to **Add Teacher**. Clicking it opens a file picker (`.xlsx` only) plus a link to download a template file with the expected headers.
2. **Expected columns:** `name` (required), `department` (optional), `photo_url` (optional). `slug` is *not* a column — it's always generated server-side from `name` (lowercased, hyphenated, de-duplicated against existing slugs), so two admins importing similar names never collide.
3. On upload, the frontend posts the file to `POST /admin/teachers/import` (multipart, admin JWT attached).
4. Backend parses the workbook with `exceljs`, reads the first sheet, validates each row (row must have a non-empty `name`; reject the row otherwise), generates a slug per teacher, and inserts valid rows into `teachers` in a single transaction — either all real inserts commit, or none do, if something goes wrong partway through (so a crash mid-import doesn't leave the table half-populated).
5. The response includes a per-row result: `{ createdCount, skipped: [{ row: 4, reason: "missing name" }, ...] }`. The frontend shows this as a short summary ("18 teachers added, 2 rows skipped — see details") rather than a silent success/failure.
6. Every successfully imported teacher appears immediately in both the public Teacher Directory grid and the Admin Dashboard grid — same as a single `Add Teacher` submission, just many at once.
7. **Duplicate handling:** if an imported `name` already matches an existing teacher (exact, case-insensitive match), that row is skipped and reported rather than silently creating a duplicate entry — the admin can still add legitimate duplicate names manually via `Add Teacher` if two teachers really do share a name, at which point a numeric suffix is appended to keep `slug` unique.

**Export the teacher list to Excel, feature (d):**

1. An **Export** button on the Teachers tab calls `GET /admin/teachers/export`, optionally carrying the grid's current `?q=`/`?sort=` values, so exporting *after* searching/sorting exports just that filtered view (with a "clear filters to export everyone" hint if a filter is active).
2. Backend queries `teachers` with the same filters used by the grid, builds an `.xlsx` workbook in memory with `exceljs` (columns: `name`, `department`, `slug`, `created_at` — no `photo_url` binary data, just the URL/path string), and streams it back with `Content-Disposition: attachment; filename="teachers-<date>.xlsx"`.
3. The browser downloads the file directly — no separate confirmation step needed, since this is a read-only export with no side effects.

### 6.3 Sprint 2 Backlog

- [X] Scaffold Express project, connect to MySQL using the Sprint 1 schema (`mysql2` connection pool); set up `.env`/`.env.example` per §11 and read all config from `process.env` (completed)
- [X] Implement `GET /teachers` with `?q=`, `?sort=`, `?page=`, `?limit=12` returning `{ items, page, totalPages, totalCount }` (completed)
- [X] Implement teacher detail endpoint (`GET /teachers/:slug`) with nested `media_url` and chronological timeline (completed)
- [X] Implement message submission endpoint (`POST /teachers/:slug/messages`) with `multer` multipart parsing and binary `LONGBLOB` storage (completed)
- [X] Implement `GET /media/{media_id}` to stream binary BLOB with `Content-Type` and `?download=1` `Content-Disposition: attachment` (completed)
- [X] Implement `GET /share/media/{media_id}` — server-rendered HTML with real Facebook Open Graph tags + instant redirect (completed)
- [X] Implement `GET /wall` (cursor-paginated via `?after_id=&limit=`) and `POST /wall` (instant public greeting) (completed)
- [X] Implement `POST /admin/login` (bcrypt compare + JWT sign) (completed)
- [X] Implement JWT-verification middleware (`requireAdmin.js`) applied to all `/admin/*` routes (completed)
- [X] Implement `GET /admin/teachers` (with search/sort/pagination) and `POST /admin/teachers` (Add Teacher) (completed)
- [X] Implement `POST /admin/teachers/import` — parse `.xlsx` via `exceljs`, transaction insert, slug generation, duplicate skipping (completed)
- [X] Implement `GET /admin/teachers/export` — query with search/sort filters, stream `.xlsx` workbook (completed)
- [X] Provide downloadable `.xlsx` **import template** (`templates/teacher-import-template.xlsx` and `GET /admin/teachers/template`) (completed)
- [X] Implement `GET /admin/teachers/{id}/messages` and `DELETE /admin/messages/{id}` (cascade deletion) (completed)
- [X] Implement `DELETE /admin/media/{id}` — removes media only, keeping text message intact (completed)
- [X] Implement `DELETE /admin/wall/{id}` — post-hoc removal of wall greeting (completed)
- [X] Enforce file type/size limits (50MB max, approved image/video mimes) server-side (completed)
- [X] Add honeypot bot trap to both public submission endpoints (completed)
- [X] Add server-side profanity/spam wordlist filtering on submissions (completed)
- [X] Rate-limit `/admin/login` (15/15min) and public submissions (100/15min) (completed)
- [X] Configure CORS (`cors` middleware) allowing frontend origins (completed)
- [X] Set up parameterized queries only for all database writes (completed)
- [ ] Deploy to Render, verify environment variables (DB creds + `JWT_SECRET` + `CORS_ORIGIN` + `BACKEND_PUBLIC_URL`, §11)
- [X] Sanity-check every endpoint via automated E2E test suite (`npm run test:api` — all 19 tests passed) (completed)

---

## 7. Frontend (Sprint 3)

**Stack:** React (Vite) + React Router + Tailwind CSS + GSAP, deployed as a static build to Hostinger (`TD/frontend`). Built against the live Render API from Sprint 2, not mock data.

### 7.1 Sprint 3 Backlog

- [x] Scaffold Vite + React project, install Tailwind CSS, React Router, GSAP, `react-zoom-pan-pinch`; set up `.env`/`.env.example` with `VITE_API_BASE_URL` (§11) and read it in `api/client.js` (completed)
- [x] Build a persistent **`Header.jsx`** rendered across every public route (`/`, `/teachers`, `/teachers/:slug`) with **Browse Teachers**, **Login**, and a **Dark/Light Mode switch**; collapses to a hamburger menu on narrow screens (completed)
- [x] Build the Hero (`/`) — greeting animation (text reveal, confetti) with GSAP, with smooth scroll to the canvas below (completed)
- [x] Build the Public Wall as a **pan/zoom canvas** directly below the Hero on the same `/` route, using `react-zoom-pan-pinch`: click/touch drag to pan, scroll/pinch to zoom; greetings render as cards at positions computed deterministically from each card's `id` (completed)
- [x] Wire the Wall canvas to `GET /wall`'s cursor pagination (`?after_id=`, `?limit=`) with smooth loading (completed)
- [x] A submission button/panel over the Wall canvas opens the greeting form (name optional, text only), posts to `POST /wall`, and animates the new card into the canvas on success (completed)
- [x] Build **`TeacherGrid.jsx`** — a reusable 4-column × 3-row (12-per-page) grid with a search box, sort dropdown, and pagination controls; reflows to 2 columns on narrow screens (completed)
- [x] Teacher Directory route (`/teachers`) — public, uses `TeacherGrid.jsx` against `GET /teachers` (search/sort/pagination via query params), links to individual teacher pages (completed)
- [x] Teacher Timeline route (`/teachers/:slug`) — photo, all videos/images/messages in timeline order (via `GET /teachers/{slug}` + `GET /media/{media_id}` for any attached media), submission form for new entries that appear immediately on success (completed)
- [x] Add **Download** and **Share to Facebook** controls to each media item on the Timeline: Download links to `GET /media/{media_id}?download=1`; Share opens `facebook.com/sharer/sharer.php?u=` pointed at the backend's `GET /share/media/{media_id}` page (completed)
- [x] Timeline submission form: name (optional), message, image/video upload with progress indicator, honeypot field, strictly enforced 50MB and 20s–120s video duration checks, posts to `POST /teachers/{slug}/messages` (completed)
- [x] Admin Login route (`/login`) — username/password form, posts to `POST /admin/login`, stores the JWT, redirects to `/admin` (completed)
- [x] Admin Dashboard route (`/admin`) — protected (redirects to `/login` if no valid token): **Teachers** tab reuses `TeacherGrid.jsx` against `GET /admin/teachers`; selecting a teacher card shows all messages with **Delete message** and **Remove media** (×) controls; plus dedicated **Public Wall Moderation** tab (completed)
- [x] Delete confirmation dialogs (`ConfirmDialog.jsx`) — used for deleting messages, removing media only, and removing public wall greetings (completed)
- [x] **Add Teacher** button/form in the Admin Dashboard — posts to `POST /admin/teachers`; new teacher immediately shows up in the public `/teachers` directory (completed)
- [x] **Import Teachers** button next to Add Teacher — file picker restricted to `.xlsx`, template download link, upload state, and detailed row summary (completed)
- [x] **Export** button on the Teachers tab — calls `GET /admin/teachers/export` and triggers browser download (completed)
- [x] `ProtectedRoute` wrapper component guarding `/admin`, checking stored JWT and token expiration (completed)
- [x] Loading/empty states across the app (completed)
- [x] Mobile-first responsive pass on every feature: Header collapses to hamburger drawer, `TeacherGrid.jsx` drops to 2 columns, touch controls, responsive timeline (completed)
- [x] Configure SPA fallback for Hostinger (Apache) — `.htaccess` rewrite in `public/` and `dist/` (completed)
- [x] Production build (`vite build`) successfully creates static bundle in `dist/` with `.htaccess` included (completed)

---

## 8. Integration, Security & Launch (Sprint 4 — Oct 3 to Oct 6 buffer)

### 8.1 Security & Moderation

- [ ] Parameterized queries everywhere (no string concatenation in SQL)
- [ ] Sanitize/escape message text on output to prevent stored XSS (applies to Teacher Timeline entries **and** Public Wall greetings — the wall matters *more* here since its content is never eyeballed before going live)
- [ ] `messages` and `wall_messages` have **no** `approved` column and **no** gate — both a Teacher Timeline entry and a Public Wall greeting are public the moment they're inserted, by design
- [ ] Because nothing is pre-reviewed anywhere on the site, lean harder on automated defenses on *every* public submission endpoint: basic profanity/spam wordlist filtering, a max length on `message_text`, and a honeypot/captcha check on both `POST /teachers/{slug}/messages` and `POST /wall`
- [ ] Rate-limit or throttle both public submission endpoints (`/teachers/{slug}/messages`, `/wall`) and the admin login endpoint — this is the main brake on spam/flooding since there's no approval queue behind either one
- [ ] Restrict uploaded image/video size/type strictly server-side (see §6.2 limits) — every accepted upload lands directly in the database and is visible the instant it's saved
- [ ] Validate the Teachers **import** upload strictly server-side too: reject non-`.xlsx` files and anything over a small size cap (a teacher list is a few KB–MB at most, not tens of MB), and cap the number of rows processed in one import so a malformed or huge file can't tie up the request
- [ ] Confirm admin passwords are bcrypt-hashed (never plain text), `JWT_SECRET` is a strong random value stored only as an env var, and tokens have a sane expiry
- [ ] Monitor DB storage usage as submissions come in (BLOBs can fill a hosting plan's storage quota faster than you'd expect)
- [ ] Keep a simple way (you or a co-organizer) to spot-check the live Teacher Timeline entries **and** the live Public Wall during the event, so anything inappropriate can be deleted (`DELETE /admin/messages/{id}`, `DELETE /admin/media/{id}`, `DELETE /admin/wall/{id}`) quickly after the fact — this replaces a pre-publish review queue, so treat it as an active, ongoing task during the event rather than a one-time check

### 8.2 End-to-End & Launch Checklist

- [ ] Full end-to-end test: Teacher Timeline — submit → appears on the teacher's page immediately, no approval step; separately confirm an admin can `DELETE /admin/media/{id}` to remove just the photo/video (text stays) and `DELETE /admin/messages/{id}` to remove the whole entry (both go, via cascade)
- [ ] Full end-to-end test: Timeline Download — clicking Download actually saves the file (not just opens it) on both desktop and a real phone browser
- [ ] Full end-to-end test: Timeline Share to Facebook — paste the `/share/media/{media_id}` URL into Facebook's [Sharing Debugger](https://developers.facebook.com/tools/debug/) to confirm the image/video and title preview correctly before relying on it live
- [ ] Full end-to-end test: Teacher Directory & Admin grid — search returns expected matches, each sort option changes order correctly, and pagination moves between pages without losing the current search/sort state
- [ ] Full end-to-end test: Public Wall canvas — pan and zoom work with mouse on desktop and touch (drag + pinch) on a real phone; panning/zooming out far enough triggers loading more greetings via `?after_id=`
- [ ] Full end-to-end test: Public Wall — submit → appears on the landing page immediately, no approval step; separately confirm an admin can still `DELETE /admin/wall/{id}` a post after the fact
- [ ] Full end-to-end test: Admin — log in, add a teacher, confirm it appears in the public Teacher Directory grid
- [ ] Full end-to-end test: Import — upload a valid `.xlsx` (including at least one intentionally bad row, e.g. missing `name`) and confirm the summary correctly reports created vs. skipped, and that only the valid rows show up in both grids; also try uploading a non-`.xlsx` file and confirm it's rejected with a clear message
- [ ] Full end-to-end test: Export — export with no filters (full list) and export after searching/sorting (filtered list), and confirm the downloaded `.xlsx` opens correctly and matches what was shown on screen
- [ ] Test on actual mobile devices (scan QR → load → submit): Header hamburger menu, grid at 2 columns, Wall canvas gestures, Timeline Download/Share buttons — all confirmed on real phones, not just a resized desktop browser
- [ ] Confirm CORS works in production (not just localhost)
- [ ] Confirm SPA routing/refresh works correctly on the deployed Hostinger build, including `/admin` and `/teachers/:slug`
- [ ] Confirm the admin session correctly expires/redirects to `/login`, and that `/admin` can't be reached without logging in
- [ ] Warm up the Render backend shortly before the event starts (cold start otherwise)
- [ ] Backup/export the full MySQL database — structure **and** data — before go-live (this includes all media BLOBs, so the backup will be larger than a schema-only export; do this via SQLyog)
- [ ] Confirm all teacher entries and slugs are correct and typo-free
- [ ] Single production deploy: frontend `dist/` to Hostinger, backend to Render, QR code confirmed pointing at the right URL

---

## 9. Stretch Goals (if time allows)

- [ ] Light animation/confetti when a message or greeting is successfully submitted
- [ ] Allow a short image attachment on Public Wall greetings (currently text-only by design, to keep the canvas lightweight)
- [ ] Multiple admin accounts / basic roles instead of one shared login
- [ ] Bulk download/export of *all* of a teacher's messages as a single keepsake (PDF or image collage) after the event — distinct from the per-item Download button on the Timeline (§6.2, §7.1), which is already a core feature, not a stretch goal
- [ ] Persist Wall card positions in the database (e.g. `pos_x`/`pos_y` columns on `wall_messages`) instead of computing them client-side, if the admin ever wants to manually curate/rearrange the canvas layout

---

## 10. Project Folder Structure

### `TD-Server/backend` (Node.js + Express)

```
TD-Server/backend/
├── src/
│   ├── server.js               # Express app entrypoint (listen, mount routes)
│   ├── app.js                  # Express app config (middleware, route mounting)
│   ├── config/
│   │   └── env.js              # loads/validates env vars (DB creds, JWT_SECRET)
│   ├── db/
│   │   └── pool.js             # mysql2 connection pool setup
│   ├── models/
│   │   ├── teacher.model.js
│   │   ├── message.model.js    # teacher timeline text entries
│   │   ├── messageMedia.model.js  # media attached to a message — separate table, deletable independently
│   │   ├── wallMessage.model.js
│   │   └── admin.model.js
│   ├── routes/
│   │   ├── teachers.routes.js  # GET /teachers (search/sort/pagination), GET /teachers/{slug}
│   │   ├── messages.routes.js  # POST /teachers/{slug}/messages
│   │   ├── media.routes.js     # GET /media/{media_id} — streams BLOB, ?download=1 for Content-Disposition
│   │   ├── share.routes.js     # GET /share/media/{media_id} — server-rendered OG tags for Facebook + redirect
│   │   ├── wall.routes.js      # GET /wall (cursor-paginated), POST /wall
│   │   └── admin.routes.js     # login, teachers CRUD + import/export (search/sort/pagination), content deletion (no approval workflow)
│   ├── controllers/
│   │   ├── teachers.controller.js
│   │   ├── messages.controller.js
│   │   ├── media.controller.js
│   │   ├── share.controller.js  # renders the tiny OG-tag HTML page for Facebook's scraper
│   │   ├── wall.controller.js
│   │   └── admin.controller.js
│   ├── services/
│   │   ├── media.service.js    # reads uploads, writes/reads BLOBs, streams /media responses, builds download filenames
│   │   ├── teacherExcel.service.js  # exceljs: parses import uploads (row validation, slug generation), builds export workbooks
│   │   ├── moderation.service.js  # post-hoc delete logic, spam/profanity checks (no approval workflow)
│   │   └── auth.service.js     # bcrypt hashing/compare, JWT sign/verify
│   ├── middleware/
│   │   ├── upload.js           # multer config (limits, fileFilter)
│   │   ├── requireAdmin.js     # verifies JWT on /admin/* routes
│   │   └── errorHandler.js
│   └── utils/
│       └── validators.js       # file type/size/duration checks
├── templates/
│   └── teacher-import-template.xlsx  # static file with the expected import columns, served as a download
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

### `TD/frontend` (React + Vite + Tailwind CSS)

```
TD/frontend/
├── src/
│   ├── main.jsx                   # app entrypoint, mounts <App />
│   ├── App.jsx                    # React Router route definitions
│   ├── layouts/
│   │   └── PublicLayout.jsx       # wraps "/", "/teachers", "/teachers/:slug" with the shared Header
│   ├── pages/
│   │   ├── Home.jsx               # Hero + Public Wall canvas ("/")
│   │   ├── TeacherDirectory.jsx   # Teacher Directory ("/teachers") — uses TeacherGrid.jsx
│   │   ├── TeacherTimeline.jsx    # Teacher Timeline ("/teachers/:slug")
│   │   ├── AdminLogin.jsx         # admin login ("/login")
│   │   └── AdminDashboard.jsx     # admin dashboard, protected ("/admin") — Teachers tab uses TeacherGrid.jsx
│   ├── components/
│   │   ├── Header.jsx             # persistent header: Browse Teachers + Login, collapses to a hamburger on mobile
│   │   ├── GreetingAnimation.jsx  # GSAP hero animation (no longer owns the nav buttons)
│   │   ├── WallCanvas.jsx         # pan/zoom canvas (react-zoom-pan-pinch) for the Public Wall
│   │   ├── WallCard.jsx           # a single greeting card, positioned via a deterministic id-based layout function
│   │   ├── WallSubmissionPanel.jsx  # button + form overlay for posting a new greeting to the canvas
│   │   ├── TeacherGrid.jsx        # shared 4×3 grid + search box + sort dropdown + pagination — used by both (b) and (d)
│   │   ├── TeacherCard.jsx
│   │   ├── TimelineEntryList.jsx  # renders timeline entries, newest first (image + video) — read-only, public view
│   │   ├── TimelineMediaActions.jsx  # Download + Share-to-Facebook controls for one media item
│   │   ├── AdminTimelineEntryList.jsx  # admin-only: same entries, plus "Delete message" and, per attached image/video, "Remove media"
│   │   ├── ConfirmDialog.jsx      # shared "are you sure?" modal, used before any delete action
│   │   ├── TimelineSubmissionForm.jsx  # handles upload + progress
│   │   ├── AddTeacherForm.jsx     # admin: add a new teacher
│   │   ├── ImportTeachersButton.jsx  # admin: upload .xlsx, show per-row result summary
│   │   ├── ExportTeachersButton.jsx  # admin: download the (optionally filtered) teacher list as .xlsx
│   │   └── ProtectedRoute.jsx     # guards /admin, checks stored JWT
│   ├── context/
│   │   └── AuthContext.jsx        # admin auth state (token, login/logout)
│   ├── api/
│   │   └── client.js              # fetch/axios calls to the backend (attaches JWT for /admin/*); base URL read from VITE_API_BASE_URL (§11)
│   ├── utils/
│   │   └── wallLayout.js          # deterministic id → {x, y} position function for Wall canvas cards
│   ├── styles/
│   │   └── index.css              # Tailwind entry point
│   └── assets/
│       └── images/
├── public/
│   ├── favicon.svg
│   └── .htaccess                  # SPA fallback rewrite for Hostinger (Apache)
├── .env.example                   # documents VITE_API_BASE_URL — see §11
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## 11. Environment Variables (`.env`) — Switching Between Local Development and Live

Both apps read their configuration from a `.env` file rather than hardcoding URLs or credentials, so the same codebase runs against **localhost** (day-to-day development) or **live** (Render + Hostinger) just by changing which values are active — no code changes needed either way.

**How the switch works:** each `.env` below has two clearly-labeled blocks — a `DEVELOPMENT (localhost)` block and a `PRODUCTION (live)` block. Only one block is active at a time; the other is commented out with `#`. To switch, comment out the block you're leaving and uncomment the block you want active, then restart the dev server (`npm run dev`) so the new values are picked up — neither Node nor Vite reload `.env` changes on their own while running.

> ⚠️ **Important distinction:** this local toggle only changes what *your own machine* talks to when you run `npm run dev` locally — it does **not** affect what's actually live on Render/Hostinger. The deployed backend on Render reads its own environment variables from Render's dashboard (Environment tab), and the deployed frontend on Hostinger is whatever was last built with `vite build` and uploaded — neither one reads your local `.env` file at all. So switching your local backend's `.env` to the "production" block means *your local machine* is now hitting the **live production database** directly — genuinely useful for debugging a live-only issue, but risky for everyday testing, since any test data you submit or delete locally happens for real. Keep day-to-day development on the `DEVELOPMENT` block, and only switch to `PRODUCTION` locally when you specifically mean to touch live data.

### 11.1 Backend — `TD-Server/backend/.env`

```dotenv
# ============================================================
# DEVELOPMENT (localhost) — ACTIVE
# ============================================================
PORT=5000
DB_HOST=your-hostinger-db-host.hostinger.com
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=teachers_day
JWT_SECRET=dev-only-secret-change-me
CORS_ORIGIN=http://localhost:5173
BACKEND_PUBLIC_URL=http://localhost:5000

# ============================================================
# PRODUCTION (live) — commented out; uncomment to point this
# machine at the live DB/domain, and comment out the block above
# ============================================================
# PORT=5000
# DB_HOST=your-hostinger-db-host.hostinger.com
# DB_PORT=3306
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password
# DB_NAME=teachers_day
# JWT_SECRET=<a-different-strong-random-value-for-production>
# CORS_ORIGIN=https://teachersday.yourschool.com
# BACKEND_PUBLIC_URL=https://td-backend.onrender.com
```

- `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` — since this project uses one Hostinger MySQL database for everything (§5.2), these are usually identical in both blocks; they're still written out in both so the file is self-contained and easy to point at a second/staging database later if you ever add one.
- `JWT_SECRET` — **use a different value in each block.** A dev secret leaking or being reused doesn't matter much locally, but the production one should be a long random string that's never committed anywhere, generated once (e.g. `openssl rand -hex 32`) and pasted in only here and in Render's dashboard.
- `CORS_ORIGIN` — must exactly match whatever origin the frontend is actually running on, or the browser blocks every request: `http://localhost:5173` for the Vite dev server, the real `https://` Hostinger domain in production.
- `BACKEND_PUBLIC_URL` — the backend's own public base URL, used to build absolute links: the `og:image`/`og:video` tags on the `/share/media/{media_id}` page (§6.1, §6.2) and the `media_url` field returned by `GET /teachers/{slug}` both need a full URL, not a relative path, since they're consumed outside the SPA's own origin (by Facebook's scraper, and by the frontend fetching from a different port/domain than the backend).
- **Render itself never reads this file.** When deploying, copy these same key/value pairs into Render's Environment tab (production values only) — that's the actual source of truth for the live backend, `.env` on your machine is just for local runs.
- `.env` is git-ignored (see the backend's `.gitignore`, §10); `.env.example` in the repo lists the same keys with placeholder values so a new machine can copy it to `.env` and fill in real ones without guessing what's needed.

### 11.2 Frontend — `TD/frontend/.env`

Vite only exposes environment variables to the browser bundle if they're prefixed `VITE_` — anything else in the file is silently ignored by the frontend build, which is a safe default (it stops secrets from accidentally being compiled into a public bundle).

```dotenv
# ============================================================
# DEVELOPMENT (localhost) — ACTIVE
# ============================================================
VITE_API_BASE_URL=http://localhost:5000

# ============================================================
# PRODUCTION (live) — commented out; uncomment when building
# for/testing against the live backend, and comment out the
# block above
# ============================================================
# VITE_API_BASE_URL=https://td-backend.onrender.com
```

- This is the **only** environment variable the frontend needs — every API call in `api/client.js` (§10) is built from `import.meta.env.VITE_API_BASE_URL`, so nothing else in the codebase hardcodes `localhost:5000` or the Render URL.
- Unlike the backend, this one genuinely matters at **build time**: whichever block is active when you run `npm run dev` (local dev server) or `npm run build` (the `dist/` bundle uploaded to Hostinger) is baked into that run/build. So before the real production deploy (§8.2, single production deploy), double-check the `PRODUCTION` block is active and re-run `vite build` — an old `dist/` built against the `DEVELOPMENT` block would have the live site quietly trying to call `localhost:5000`, which fails for every visitor.
- Like the backend, `.env` is git-ignored and `.env.example` documents the one key with a placeholder, so switching machines or re-cloning the repo doesn't require guessing the variable name.
