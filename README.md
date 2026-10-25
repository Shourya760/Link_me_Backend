# LinkMe server

Set `server/.env` using `.env.example`, then run `npm install` and `npm run dev` from this directory. The API starts on port 3000 by default; check `GET /api/health` for status.

Routes cover user registration, login/logout and deactivation, authenticated profile read/update, public profile lookup, and authenticated image upload. Passwords are bcrypt-hashed, JWTs are returned to the client, and images are sent to Cloudinary.
