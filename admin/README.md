# NGO Admin Dashboard

## Run locally

Install dependencies and start the dashboard:

```bash
npm install
npm run dev
```

The dashboard runs on `http://localhost:3001` by default, alongside the public site. Configure the following server environment variables:

- `API_URL` (optional): backend API base URL; defaults to `http://localhost:8000/api/v1`. This is used only by the server-side admin-account registration proxy.
- `NEXT_PUBLIC_API_URL` (optional): backend API base URL used for authentication. Defaults to `http://localhost:8000/api/v1`; it may also include the `/admin` suffix.
- `ADMIN_SECRET_KEY`: configured on the backend and entered on the registration page, then sent in the `x-admin-secret-key` header. Do not prefix this value with `NEXT_PUBLIC_`.

The admin API is expected to expose `POST /api/v1/admin/login`, `/register`, `/refresh-token`, and `/logout`. All requests use Axios with credentials enabled; the access token and user are kept in Redux memory, and the bearer token is attached automatically. The refresh token is stored in an HttpOnly cookie and is used to automatically obtain a new access token after an API `401`. Set backend `DASHBOARD_URL` to the dashboard origin (for example, `http://localhost:3001`) so credentialed refresh-cookie requests are allowed.

The `/dashboard` route requires an active session and sends unauthenticated visitors to `/login?redirect=/dashboard`. After successful sign-in, the user is returned to the requested local route. Admin account creation is available at `/register`.
