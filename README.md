# 🎓 Teacher's Day Tribute Platform — Frontend (`TD`)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deployed_on-Hostinger-673DE6?style=flat&logo=hostinger&logoColor=white)](https://teachersday2026.bscs4b.com)
[![API](https://img.shields.io/badge/API_Backend-Render-46E3B7?style=flat&logo=render&logoColor=black)](https://td-server-6azz.onrender.com)

A high-performance, interactive, and beautifully designed web application built to celebrate faculty, educators, and mentors. Designed for the **Teacher's Day 2026** celebration at **BSCS 4B**, this client-side Single Page Application (SPA) features an interactive 3D orbiting tribute wall, dedicated teacher timelines, keepsake generation, and full administrative moderation.

- **Production URL**: [https://teachersday2026.bscs4b.com](https://teachersday2026.bscs4b.com)
- **Backend Repository**: [marijuane23/TD-Server](https://github.com/marijuane23/TD-Server)

---

## ✨ Key Features

### 🌐 1. Interactive 3D Orbiting Tribute Wall (`WallCanvas.jsx`)

- **Spherical Canvas Projection**: Tributes orbit gracefully in a dynamic 3D space with smooth physics and auto-rotation.
- **Split-Card Design for Media**: Cards with attached tribute photos feature a modern split layout (left: thumbnail photo; right: greeting text, author, and timestamp).
- **Interactive Raycasting**: Click on any floating card to smoothly zoom in, lock focus, and view full tribute details.
- **Search & Filter**: Instantly isolate tributes by keyword or filter by dedication.

### ✍️ 2. Open Wall Submission Panel (`WallSubmissionPanel.jsx`)

- **Photo Upload Support**: Students can attach an image directly alongside their heartfelt message.
- **Custom Dedicated Teacher Combobox**:
  - Replaces clunky native dropdowns with a sleek, searchable, scroll-capped modal-like combobox.
  - Allows attributing a tribute directly to a specific teacher or submitting generally to the Open Wall.
  - Search by teacher name or department with instant filtering and click-outside dismissal.

### 🔄 3. Bi-Directional Cross-Posting Integration

- **Teacher Timeline ➔ Open Wall**: Messages and photos posted on a teacher's personal timeline automatically cross-post to the Open Wall.
- **Open Wall ➔ Teacher Timeline**: Any tribute submitted on the Open Wall dedicated to a specific teacher is automatically reflected on that teacher's timeline.
- *(Note: YouTube video embeds remain exclusive to the teacher's timeline to preserve 3D wall performance).*

### 🏛️ 4. College & Faculty Directory (`TeacherDirectory.jsx`)

- **College-Based Filtering**: Easily navigate faculty categorized by departments/colleges:
  - **CTECH** — College of Technology
  - **CTE** — College of Teacher Education
  - **CBM** — College of Business & Management
  - **CFES** — College of Forestry & Environmental Studies
  - **COAS** — College of Arts & Sciences
  - **CADS** — College of Agriculture & Developmental Studies
- **Real-Time Search**: Search faculty by name, department, or specialization.

### 📜 5. Dedicated Teacher Timelines (`TeacherTimeline.jsx`)

- **Rich Tribute Form**: Students can post text greetings, attach image files, or link YouTube tribute videos.
- **Downloadable QR Code Keepsake**: Each teacher's page includes a custom, high-resolution downloadable QR code that links directly to their timeline for instant physical-to-digital event scanning.
- **Interactive Feed**: Chronological stream of verified student messages, heartfelt quotes, and media memories.

### 🎁 6. Keepsake Export Suite

- **Multi-Page PDF Keepsake Album** (`pdfGenerator.js`):
  - Generates a beautifully structured printable PDF souvenir for any teacher.
  - Includes custom title cover, college branding, summary metrics, sanitized messages, sender signatures, and photo galleries.
- **Heart & Cluster Photo Collages**:
  - Live preview modal rendering faculty photos in artistic arrangements (Heart shape or floating Cluster).
  - One-click high-resolution PNG export via `html2canvas`.

### 🛡️ 7. Administrative Portal (`AdminDashboard.jsx`)

- **Secure Authentication**: JWT-backed login for event organizers and moderators.
- **Faculty Management**: Add, update, archive, and manage faculty bios and profile photos.
- **Moderation Queue**: Real-time moderation pipeline to review, approve, reject, or feature student submissions.
- **Batch Excel Operations**: Import and export faculty rosters using standardized Excel spreadsheets.

---

## 🛠️ Tech Stack & Dependencies

| Category                    | Technology                             | Description                                                   |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| **Core Framework**    | React 19.2 + Vite 8.3                  | Ultra-fast build tool and modern component library            |
| **Routing**           | React Router DOM 7.18                  | Single Page Application client-side routing                   |
| **Styling**           | Tailwind CSS 3.4 + PostCSS             | Utility-first responsive design and custom color palettes     |
| **Animation**         | GSAP 3.15 +`@gsap/react`             | Smooth card entrances, transitions, and canvas dynamics       |
| **Icons**             | Lucide React                           | Modern, consistent SVG icon set                               |
| **Canvas & FX**       | `canvas-confetti`                    | Celebration animations during tribute submissions             |
| **Keepsake / Export** | `jspdf`, `html2canvas`, `qrcode` | Client-side PDF generation, canvas capture, and QR generation |
| **Linter**            | Oxlint                                 | High-speed JavaScript and JSX code quality checker            |

---

## 📁 Repository Structure

```
TD/
├── frontend/                          # React client application root
│   ├── public/                        # Static assets (favicons, icons)
│   ├── scripts/
│   │   └── package-hostinger.ps1      # Automated build & ZIP packaging for Hostinger
│   ├── src/
│   │   ├── api/                       # Axios / Fetch client configurations
│   │   │   └── client.js              # Centralized API communication layer
│   │   ├── assets/                    # Images, placeholders, and styling assets
│   │   ├── components/                # Reusable UI components
│   │   │   ├── WallCanvas.jsx         # 3D Orbiting Tribute Wall Canvas
│   │   │   ├── WallSubmissionPanel.jsx# Tribute posting form with searchable combobox
│   │   │   ├── KeepsakeExportModal.jsx# Keepsake PDF and collage download modal
│   │   │   ├── Navbar.jsx             # Site navigation and quick links
│   │   │   └── ...                    # Card components, modals, filters
│   │   ├── layouts/                   # Main page layout wrappers
│   │   ├── pages/                     # Routed view components
│   │   │   ├── Home.jsx               # Landing page with event overview
│   │   │   ├── OpenWall.jsx           # Full-screen 3D orbiting tribute wall
│   │   │   ├── TeacherDirectory.jsx   # Faculty directory with college filters
│   │   │   ├── TeacherTimeline.jsx    # Individual teacher timeline and tribute feed
│   │   │   ├── AdminLogin.jsx         # Organizer authentication page
│   │   │   └── AdminDashboard.jsx     # Moderation and faculty management portal
│   │   ├── utils/                     # Utility helpers
│   │   │   └── pdfGenerator.js        # jsPDF keepsake album rendering engine
│   │   ├── App.jsx                    # Route provider & core layout
│   │   ├── main.jsx                   # Application bootstrapping
│   │   └── index.css                  # Global Tailwind imports and canvas styles
│   ├── .env                           # Local development environment configuration
│   ├── .env.production                # Hostinger production configuration
│   ├── index.html                     # HTML5 entry template
│   ├── package.json                   # Dependencies and npm scripts
│   ├── tailwind.config.js             # Tailwind CSS tokens and themes
│   └── vite.config.js                 # Vite build settings and plugins
├── HOSTINGER_DEPLOYMENT_GUIDE.md      # Detailed step-by-step Hostinger guide
└── README.md                          # This documentation file
```

---

## ⚙️ Environment Configuration

The frontend dynamically points to the backend API via environment variables.

### Local Development (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Production (`frontend/.env.production`)

```env
VITE_API_BASE_URL=your_backend_url.com
```

*Vite automatically selects `.env.production` when building via `npm run build`.*

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (recommended: Node 20 LTS)
- **npm**: `v9.0.0` or higher
- **Backend API**: Running locally on port `5000` or connected to the Render live backend.

### 2. Installation

Navigate into the `frontend` directory and install dependencies:

```bash
cd frontend
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Production Build & Hostinger Deployment

### 1. Automated Build & Packaging

Run the packaged build script:

```bash
npm run build:zip
```

This single command executes:

1. `vite build` — Compiles and minifies JavaScript, CSS, and HTML into `frontend/dist/`.
2. Generates an Apache `.htaccess` file tailored for SPA routing (redirects all client-side paths like `/teachers/:slug` to `index.html`, enforces HTTPS, and sets optimal asset caching).
3. Packages everything into `frontend/dist/hostinger-deploy.zip`.

### 2. Deploying to Hostinger (hPanel)

1. Log into your [Hostinger hPanel](https://hpanel.hostinger.com).
2. Go to **Files** ➔ **File Manager** for `teachersday2026.bscs4b.com`.
3. Navigate to `public_html/`.
4. Upload `hostinger-deploy.zip` and extract its contents directly into `public_html/`.
5. Ensure the extracted directory contains `.htaccess`, `index.html`, and `assets/`.

For complete deployment troubleshooting, refer to [`HOSTINGER_DEPLOYMENT_GUIDE.md`](./HOSTINGER_DEPLOYMENT_GUIDE.md).

---

## 🔗 Related Repositories & Resources

- **Backend API Repository**: [marijuane23/TD-Server](https://github.com/marijuane23/TD-Server)
- **Live Tribute Portal**: [teachersday2026.bscs4b.com](https://teachersday2026.bscs4b.com)

---

## 📄 License

Created for the **Teacher's Day 2026** celebration by BSCS 4B. All rights reserved.
