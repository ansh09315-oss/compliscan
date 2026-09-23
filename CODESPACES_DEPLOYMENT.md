# GitHub Codespaces Backend Deployment Guide — CompliScan (SIH 26034)

GitHub provides **120 free core-hours every month** for every account. In Codespaces, you get an **8GB RAM Linux machine (2-core or 4-core)**, which is ideal for running PaddleOCR and FastAPI without memory limits or slowdowns.

---

## ⚡ 1-Click Setup Architecture

We have automated the complete Codespace environment inside [`.devcontainer/devcontainer.json`](file:///c:/Users/ansh0/OneDrive/Desktop/compliscan/.devcontainer/devcontainer.json):
1. **Linux OS Base:** Python 3.10 on Debian Linux
2. **System Dependencies:** `libgl1`, `libgl1-mesa-glx`, `libglib2.0-0`, `libgomp1` (pre-installed for OpenCV and PaddleOCR)
3. **Automated Provisioning:** Runs [`.devcontainer/setup.sh`](file:///c:/Users/ansh0/OneDrive/Desktop/compliscan/.devcontainer/setup.sh) during container creation
4. **Auto-Public Port Forwarding:** Port `8000` is automatically configured with `"visibility": "public"`

---

## 📋 Step-by-Step Instructions

### Step 1: Commit and Push Changes to GitHub
Push the new `.devcontainer` configuration files to your GitHub repository:
```bash
git add .devcontainer start_backend.sh scripts/start_backend.sh package.json
git commit -m "feat: configure automated GitHub Codespaces for backend"
git push origin main
```

---

### Step 2: Launch GitHub Codespaces
1. Open your repository on **GitHub.com**.
2. Click the green **`<> Code`** button.
3. Switch to the **Codespaces** tab.
4. Click **"Create codespace on main"** (or click `...` and choose the 4-core 8GB RAM machine type).
5. A full browser-based VS Code environment will launch. The `.devcontainer/setup.sh` script will automatically install all Python and system dependencies in the background.

---

### Step 3: Set Your Environment Variables (Secrets)
In your Codespace terminal, create your `.env` file (or add them via **GitHub Settings -> Codespaces -> Secrets** so they persist automatically):
```bash
cat << 'EOF' > .env
GEMINI_API_KEY=your_actual_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
PORT=8000
HOST=0.0.0.0
EOF
```

---

### Step 4: Start the FastAPI Backend
In the Codespace terminal, run:
```bash
./start_backend.sh
```
*(Or run `npm run backend`)*

You will see:
```text
==========================================================
⚖️  CompliScan AI Legal Metrology Engine (SIH 26034)
📡 Binding to http://0.0.0.0:8000
==========================================================
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

### Step 5: Verify Port Visibility & Get the Public URL
1. In the bottom panel of Codespaces, click the **Ports** tab (next to Terminal / Output).
2. Locate **Port 8000 (CompliScan FastAPI Backend)**.
3. Check the **Visibility** column:
   - If it says **Private**, right-click on `Port 8000` -> **Port Visibility** -> Select **Public**.
   - *(Note: Our `.devcontainer/devcontainer.json` already sets `"visibility": "public"` by default)*
4. Hover over the **Forwarded Address** column and click the copy icon (e.g., `https://<codespace-name>-8000.app.github.dev`).

#### Test in your browser:
Open `https://<codespace-name>-8000.app.github.dev/health` in your browser. You should see:
```json
{
  "status": "healthy",
  "service": "CompliScan AI Legal Metrology Microservice — 4-Angle Split-Path Engine",
  "paths": {
    "pathA_vlm_gemini_3_6": "ACTIVE",
    "pathB_enhancer_ocr": "ACTIVE",
    "brainMD_judge": "ACTIVE"
  }
}
```

---

### Step 6: Connect to Netlify Frontend
1. Go to your **Netlify Dashboard** -> Select your CompliScan site.
2. Navigate to **Site configuration** -> **Environment variables**.
3. Add / Edit the variable:
   - **Key:** `NEXT_PUBLIC_BACKEND_URL`
   - **Value:** `https://<codespace-name>-8000.app.github.dev` *(without trailing slash)*
4. Go to the **Deploys** tab -> Click **Trigger deploy** -> **Clear cache and deploy site**.

🎉 **Your Netlify frontend is now connected live to your 8GB RAM Codespaces backend!**
