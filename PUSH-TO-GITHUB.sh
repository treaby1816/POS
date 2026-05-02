# ═══════════════════════════════════════════════════════════════
#  TREABYN POS — Full Project Setup & Push to GitHub
#  Repo: https://github.com/treaby1816/POS.git
# ═══════════════════════════════════════════════════════════════

# ── STEP 1: Create React App ─────────────────────────────────
npx create-react-app treabyn-pos
cd treabyn-pos

# ── STEP 2: Install all dependencies ─────────────────────────
npm install lucide-react recharts electron-is-dev
npm install --save-dev electron electron-builder concurrently wait-on

# ── STEP 3: Set up folder structure ──────────────────────────
mkdir electron
mkdir assets

# ── STEP 4: Copy your downloaded files into place ────────────
# treabyn-pos.jsx    →  src/App.jsx
# electron-main.js  →  electron/main.js
# electron-preload.js → electron/preload.js
# package.json      →  package.json  (replace the existing one)

# On Windows (Command Prompt):
# copy treabyn-pos.jsx src\App.jsx
# copy electron-main.js electron\main.js
# copy electron-preload.js electron\preload.js

# On Mac/Linux:
# cp treabyn-pos.jsx src/App.jsx
# cp electron-main.js electron/main.js
# cp electron-preload.js electron/preload.js

# ── STEP 5: Update src/index.js ──────────────────────────────
# Make sure src/index.js looks like this:
cat > src/index.js << 'INDEXEOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
INDEXEOF

# ── STEP 6: Update public/index.html title ───────────────────
# Change <title>React App</title> to <title>Treabyn POS</title>

# ── STEP 7: Add app icon (512x512 PNG) ───────────────────────
# Place your icon files:
# assets/icon.png   (512×512 PNG)
# assets/icon.ico   (Windows — use https://convertio.co)
# assets/icon.icns  (macOS — use https://cloudconvert.com)

# ── STEP 8: Test it runs ─────────────────────────────────────
npm run electron:dev
# Should open Treabyn POS as a desktop window!

# ── STEP 9: Connect to GitHub repo ───────────────────────────
git init
git remote add origin https://github.com/treaby1816/POS.git

# ── STEP 10: Create .gitignore ───────────────────────────────
cat > .gitignore << 'GITEOF'
node_modules/
build/
dist/
.env
.env.local
.DS_Store
Thumbs.db
*.log
GITEOF

# ── STEP 11: Add & push all files ────────────────────────────
git add .
git commit -m "feat: Treabyn POS v1.0.0 - Initial release

- Splash screen with animated loader
- Welcome carousel with 3 retail images
- Sign up & login screens
- Dashboard with colorful KPI cards
- POS Terminal with cart & checkout
- Sales module with filters
- Inventory management
- Accounting with charts
- Dark navy sidebar, white background
- Electron desktop wrapper (Win/Mac/Linux)"

git branch -M main
git push -u origin main

# ── STEP 12: Tag the first release ───────────────────────────
git tag v1.0.0
git push origin v1.0.0

# ══════════════════════════════════════════════════════════════
#  BUILD INSTALLERS
# ══════════════════════════════════════════════════════════════

# Windows .exe installer:
npm run electron:win
# Output: dist/Treabyn POS Setup 1.0.0.exe

# macOS .dmg:
npm run electron:mac
# Output: dist/Treabyn POS-1.0.0.dmg

# Linux .AppImage:
npm run electron:linux

# ── STEP 13: Upload to GitHub Release ────────────────────────
# 1. Go to: https://github.com/treaby1816/POS/releases/new
# 2. Tag: v1.0.0
# 3. Title: "Treabyn POS v1.0.0"
# 4. Upload: dist/Treabyn POS Setup 1.0.0.exe
# 5. Publish release

# ── DOWNLOAD LINK FOR USERS ──────────────────────────────────
# https://github.com/treaby1816/POS/releases/latest
# ══════════════════════════════════════════════════════════════
