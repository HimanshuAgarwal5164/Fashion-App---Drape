# DRAPE Frontend

Next.js frontend for the DRAPE fashion recommendation app.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Set the backend URL with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If unset, the frontend defaults to `http://localhost:8000`.

## Structure

```text
app/page.jsx             Page state and orchestration
components/              Product UI components
lib/api.js               Backend API calls
lib/constants.js         Shared UI constants
```

Run `npm run build` before deployment.
