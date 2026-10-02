# Favorite Movies API

Local base URL:

```text
http://localhost:3000
```

Published base URL:

```text
https://week3-week4-project.onrender.com
```

The deployed health check is `GET /health`. Confirm it returns HTTP 200 before recording the demo.

Interactive Swagger UI is available at `https://week3-week4-project.onrender.com/api-docs`. The OpenAPI document remains available at `/swagger.json`.

## Render Deployment Check

In the Render service settings, use `npm install` as the build command and `npm start` as the start command. Set `MONGODB_URI` and a long, random `SESSION_SECRET` as secret environment variables; optionally set `MONGODB_DB`. Configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to enable Google sign-in, then set `APP_BASE_URL` to the deployed origin (for example, `https://week3-week4-project.onrender.com`) or set `GOOGLE_CALLBACK_URL` directly. Register `{APP_BASE_URL}/api/auth/google/callback` as an authorized redirect URI in Google Cloud Console. Make sure MongoDB Atlas allows the deployed service to connect, then deploy and verify the health check. Keep credentials out of source control and recordings.

## Authentication

Create a local account with `POST /api/auth/register` or sign in with `POST /api/auth/login`. Passwords must be 12 to 72 UTF-8 bytes and are stored as bcrypt hashes, never as plaintext. Successful registration and login issue the `movie.sid` HTTP-only session cookie. Sessions are stored in MongoDB; logout destroys the server-side session and clears the cookie. The cookie uses `SameSite=Lax` and is marked `Secure` in production.

Google sign-in is available at `GET /api/auth/google` when the Google client credentials are configured. The OAuth callback only accepts a Google account with a verified email. Registration, password login, and Google sign-in initiation are rate-limited, and Helmet sets standard security headers. For local startup, add a unique random `SESSION_SECRET` to your untracked `.env` file; it is required even when Google sign-in is disabled.

All `/api/movies` and `/api/reviews` routes require an authenticated session, including reads. Requests without a valid session receive `401 Authentication required`. `GET /api/auth/me` returns the current account, and `POST /api/auth/logout` invalidates its session. Health and the registration, login, and Google sign-in initiation routes are public.

## Resources

`/api/movies`

`/api/reviews`

## Routes

- `POST /api/auth/register` - create a local account and sign in
- `POST /api/auth/login` - sign in with email and password
- `GET /api/auth/me` - get the current account (authenticated)
- `POST /api/auth/logout` - invalidate the current session (authenticated)
- `GET /api/auth/google` - begin Google sign-in (requires configured Google credentials)
- `GET /api/auth/google/callback` - complete Google sign-in
- `GET /api/movies` - get all favorite movies
- `GET /api/movies/:id` - get a single movie
- `POST /api/movies` - create a movie
- `PUT /api/movies/:id` - update a movie
- `DELETE /api/movies/:id` - delete a movie
- `GET /api/reviews` - get all reviews
- `GET /api/reviews/:id` - get a review
- `POST /api/reviews` - create a review
- `PUT /api/reviews/:id` - update a review
- `DELETE /api/reviews/:id` - delete a review
- `GET /api/movies/:movieId/reviews` - get reviews for a movie
- `POST /api/movies/:movieId/reviews` - create a review for a movie
- `GET /api/movies/:movieId/reviews/:id` - get one review scoped to a movie
- `PUT /api/movies/:movieId/reviews/:id` - update a review scoped to a movie
- `DELETE /api/movies/:movieId/reviews/:id` - delete a review scoped to a movie

Movie POST requests require `title`, `year` (1888-2100), `genre`, `director`, and `rating` (0-10). Review POST requests require an existing movie ID plus `reviewer`, `rating` (0-10), and `comment`. You can provide the movie ID in the nested route or as `movieId` when using `POST /api/reviews`. Review responses populate the linked movie. PUT requests validate submitted values and require a non-empty JSON object. Validation errors return HTTP 400.

## Example Movie Object

```json
{
  "title": "Inception",
  "year": 2010,
  "genre": "Sci-Fi",
  "director": "Christopher Nolan",
  "rating": 8.8,
  "favorite": true
}
```

## Thunder Client Testing Guide

1. Open Thunder Client in VS Code.
2. Create a new request collection called `Favorite Movies API`.
3. Use the requests in `test.rest` as your step-by-step test file.
4. Start your server with:

```bash
npm run dev
```

5. Register once using the first request in `test.rest`, then run the login request to establish a session. The REST Client retains the session cookie for later requests.
6. Test the movie and review endpoints in `test.rest` in order:
  - health check and current account
  - get all movies
  - create and retrieve a movie
  - update and delete a movie
  - create, retrieve, update, and delete a review
7. Replace `@movieId` and `@reviewId` with the IDs returned from each create request.

## Example Request

```http
POST http://localhost:3000/api/movies
Content-Type: application/json

{
  "title": "Inception",
  "year": 2010,
  "genre": "Sci-Fi",
  "director": "Christopher Nolan",
  "rating": 8.8,
  "favorite": true
}
```

## Expected Validation Errors

When sending invalid data, expect a `400 Bad Request` response like:

```json
{
  "message": "Validation failed",
  "errors": [
    "Movie title cannot be empty",
    "Release year must be 1888 or later",
    "Rating cannot be above 10"
  ]
}
```

