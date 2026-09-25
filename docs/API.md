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

## Render Deployment Check

In the Render service settings, use `npm install` as the build command and `npm start` as the start command. Set `MONGODB_URI` as a secret environment variable in Render; optionally set `MONGODB_DB`. Make sure MongoDB Atlas allows the deployed service to connect, then deploy the latest commit and verify `https://week3-week4-project.onrender.com/health` returns HTTP 200. Keep actual credentials out of source control and video recordings.

## Resources

`/api/movies`

`/api/reviews`

## Routes

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

5. Test the movie and review endpoints in `test.rest` in order:
  - health check
  - get all movies
  - create and retrieve a movie
  - update and delete a movie
  - create, retrieve, update, and delete a review
6. Replace `@movieId` and `@reviewId` with the IDs returned from each create request.

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

