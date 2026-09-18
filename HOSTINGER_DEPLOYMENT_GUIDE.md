# Teacher's Day Frontend — Hostinger Deployment Guide

Your frontend is now **100% configured and packaged** to deploy directly to **Hostinger Web Hosting** (or your custom domain `https://teachersday2026.bscs4b.com`), connected to your live Render backend (`https://td-server-6azz.onrender.com`).

---

## 📦 What Was Configured for Hostinger

1. **Live Backend Connected (`.env.production`)**:
   - Configured `VITE_API_BASE_URL=https://td-server-6azz.onrender.com`.
   - When building for production, the app automatically points to your live Render backend API.

2. **Apache `.htaccess` Configuration for Single Page Applications (SPA)**:
   - **Fixes 404 on page refresh**: In React Router, navigating directly to `/teachers/darrel-cardana`, `/wall`, or `/admin` previously caused a 404 error on Apache. The configured `.htaccess` redirects all route requests to `index.html` seamlessly.
   - **HTTPS Redirection**: Automatically forces secure HTTPS on Hostinger.
   - **Browser Caching**: 1-year immutable caching for static hashed assets (`/assets/*.js`, `/assets/*.css`, images); `index.html` is set to `no-cache` so users instantly see new updates.
   - **Gzip/Deflate Compression**: Speeds up load times on mobile and desktop.

3. **Pre-Built Deployment Bundle (`dist/hostinger-deploy.zip`)**:
   - Ready-to-upload ZIP package generated in `c:\Users\Kevin\Documents\TD\frontend\dist\hostinger-deploy.zip`.

---

## 🚀 Step-by-Step Hostinger Deployment (Takes ~2 Minutes)

### Step 1: Locate Your Deployment Package
Your ready-to-upload file is located at:
📁 **`c:\Users\Kevin\Documents\TD\frontend\dist\hostinger-deploy.zip`**

*(Note: Whenever you make frontend changes in the future, just run `npm run build:zip` to regenerate this file).*

---

### Step 2: Open Hostinger File Manager
1. Log into your **Hostinger hPanel** at [https://hpanel.hostinger.com](https://hpanel.hostinger.com).
2. Go to **Websites** and click **Manage** next to your domain (`bscs4b.com` or `teachersday2026.bscs4b.com`).
3. In the left search/menu, click **Files** ➔ **File Manager** (or **File Manager of this domain**).
4. Navigate to your website folder:
   - **Main domain**: `public_html/`
   - **Subdomain (`teachersday2026.bscs4b.com`)**: `public_html/teachersday2026/` or `domains/teachersday2026.bscs4b.com/public_html/` (depending on your subdomain configuration).

---

### Step 3: Upload and Extract `hostinger-deploy.zip`
1. If there are old default files (like a default `default.php` placeholder), delete or back them up.
2. In the top toolbar, click the **Upload** icon (arrow pointing up).
3. Select **File**, choose **`hostinger-deploy.zip`** from `TD/frontend/dist/`, and upload it.
4. Once uploaded, right-click **`hostinger-deploy.zip`** and select **Extract**.
5. When prompted for the extraction folder:
   - Type `.` (or extract directly into the current folder) so that `index.html`, `assets/`, and `.htaccess` sit directly inside `public_html`.
6. You can now delete the uploaded `hostinger-deploy.zip` file to keep the directory clean.

---

### Step 4: Verify Folder Structure in Hostinger
Make sure the root of your domain folder contains:
```
public_html/
├── .htaccess            <-- Crucial for SPA routing
├── index.html           <-- Main entry point
├── favicon.svg
├── icons.svg
└── assets/
    ├── index-*.js       <-- Contains https://td-server-6azz.onrender.com
    ├── index-*.css
    └── ...
```

> [!IMPORTANT]
> **Check Hidden Files in Hostinger**:
> In Hostinger File Manager, ensure **"Show Hidden Files"** is enabled so `.htaccess` is present. If `.htaccess` was not extracted, copy the text from `frontend/public/.htaccess` and create a new file named `.htaccess`.

---

### Step 5: Test and Verify Your Live Website

1. **Visit your live website**:
   - Open `https://teachersday2026.bscs4b.com` (or your domain).
   - Check that the landing page, starry background, and celebration animations load smoothly.

2. **Test Direct URL Navigation (SPA Routing Check)**:
   - Open a deep link: `https://teachersday2026.bscs4b.com/teachers`
   - Refresh the page (`F5`).
   - If the page reloads without a 404 error, `.htaccess` is working properly!

3. **Test Backend Integration**:
   - Teachers should load from your Render backend (`https://td-server-6azz.onrender.com/teachers`).
   - Open browser developer tools (`F12` ➔ **Network** tab) to verify API calls return HTTP 200 from `td-server-6azz.onrender.com`.

---

## 🔄 How to Deploy Future Updates

Whenever you make future updates to the frontend:
1. Open terminal in `c:\Users\Kevin\Documents\TD\frontend`.
2. Run:
   ```bash
   npm run build:zip
   ```
3. Upload and extract the new `dist/hostinger-deploy.zip` in Hostinger File Manager.
