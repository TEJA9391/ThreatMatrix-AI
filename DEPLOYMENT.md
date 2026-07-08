# ThreatMatrix AI - Production Deployment Architecture

This document describes the unified, production-ready single-service architecture built for **ThreatMatrix AI**. 

---

## ⚡ Deployment Overview

To deliver a professional, secure, and production-grade deployment experience, the application is structured as a **single-service containerized/unified web app**:

1. **Self-Contained Frontend**: The React frontend is compiled down to static HTML, CSS, and JS (`dist` directory).
2. **Unified Backend Web Service**: The Flask backend serves **both** the REST API + real-time Socket.io endpoints *and* acts as the web server hosting the static React assets.
3. **Local Credentials Database**: User logins and registrations are securely validated and stored in a local SQLite file (`threatmatrix.db`), requiring no external database engines.

---

## 🚀 One-Click Execution (Windows)

In the root of the project, execute:
```bash
run_production.bat
```
*This batch file will automatically detect if the React frontend is compiled, run `npm run build` if missing, and boot the unified service on port `5001`.*

---

## ⚙️ Manual Build & Execution

If you prefer to run the deployment steps manually:

### 1. Compile the React Client
Navigate to the frontend directory, install dependencies, and build the minified assets:
```bash
cd frontend
npm install
npm run build
```
*This creates the `frontend/dist` directory.*

### 2. Boot the Production Server
Navigate to the backend directory and launch the Flask server:
```bash
cd ../backend
python app.py
```
*The server will detect `frontend/dist` and start serving the app on [http://localhost:5001](http://localhost:5001).*

---

## 🔒 Configuration & Mainnet URLs

The client utilizes a dynamic runtime environment check in `frontend/src/config.js`:
* **Development Mode**: Requests route to `http://localhost:5001`.
* **Production Mode**: Requests route to the same host that served the page (`window.location.origin`). This allows zero-configuration hosting on local networks, Docker, or public cloud servers (e.g. AWS, Heroku, Azure).
