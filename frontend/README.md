
# Frontend

Standalone React/Vite app for the cover letter generator UI.

## Run

```bash
npm install
npm run dev
```

## API config

Create `.env` from `.env.example`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

The frontend is separated from Laravel so it can talk to the backend app over HTTP, and the same backend can also be reused by a mobile client.
  
