# Favorite Movies API

Base URL:

```text
http://localhost:3000
```

## Resource

`/api/movies`

## Routes

- `GET /api/movies` - get all favorite movies
- `GET /api/movies/:id` - get a single movie
- `POST /api/movies` - create a movie
- `PUT /api/movies/:id` - update a movie
- `DELETE /api/movies/:id` - delete a movie

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
3. Use the requests in `routes/test.rest` as your step-by-step test file.
4. Start your server with:

```bash
npm run dev
```

5. Test the endpoints in order:
   - health check
   - get all movies
   - create movie
   - get one movie
   - update movie
   - delete movie
6. Replace `@movieId` with the `_id` returned from the create request.

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

