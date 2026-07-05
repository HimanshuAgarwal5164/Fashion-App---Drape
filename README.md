# DRAPE

DRAPE is a fashion recommendation prototype with a Next.js frontend and a FastAPI backend. The backend handles image analysis and recommendation scoring; the frontend provides the product UI for occasion-based outfit discovery and wardrobe building.

## Project Structure

```text
backend/
  app/
    main.py          FastAPI routes
    recommender.py   Outfit scoring and filtering
    skin_tone.py     MediaPipe face/hand skin-tone analysis
    body_type.py     MediaPipe pose body-type heuristic
  data/
    inventory.json
    occasion_tree.json
    colour_rules.json
  models/            MediaPipe task files
frontend/
  app/               Next.js app entry
  components/        UI and product-flow components
  lib/               API helpers and constants
```

## Requirements

- Python 3.10+
- Node.js 20+
- npm

## Backend Setup

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload --port 8000
```

The backend will run at:

```text
http://localhost:8000
```

API docs are available at:

```text
http://localhost:8000/docs
```

## Frontend Setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:3000
```

## Convenience Scripts

Mac/Linux:

```bash
bash setup.sh
bash start.sh
```

Windows:

```bat
SETUP.bat
START.bat
```

## Configuration

Frontend API URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend CORS origins:

```bash
ALLOWED_ORIGINS=http://localhost:3000
```

For multiple backend CORS origins, use a comma-separated value:

```bash
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.example
```

## Notes

- The `.bat` files are Windows convenience launchers and may need local path edits.
- The MediaPipe model files are already present under `backend/models`; the backend can also download missing models when needed.
- Recommendation logic is deterministic and data-driven. Update `backend/data/*.json` to change products, occasions, or colour compatibility rules.
