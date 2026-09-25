const express = require("express");

const {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
} = require("../controllers/movieController");
const {
    getReviewsForMovie,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

router.get("/:movieId/reviews", getReviewsForMovie);
router.post("/:movieId/reviews", createReview);
router.get("/:movieId/reviews/:id", getReviewById);
router.put("/:movieId/reviews/:id", updateReview);
router.delete("/:movieId/reviews/:id", deleteReview);

router.get("/", getMovies);
router.get("/:id", getMovieById);
router.post("/", createMovie);
router.put("/:id", updateMovie);
router.delete("/:id", deleteMovie);

module.exports = router;