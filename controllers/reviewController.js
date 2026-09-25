const mongoose = require("mongoose");
const Review = require("../models/review");
const Movie = require("../models/movie");

const reviewMovieFields = "title year genre director";

const getMovieFromRequest = async (movieId, res) => {
    if (!mongoose.isValidObjectId(movieId)) {
        res.status(400).json({ message: "Invalid movie ID" });
        return null;
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
        res.status(404).json({ message: "Movie not found" });
        return null;
    }

    return movie;
};

const isRequestBody = (body) => body && typeof body === "object" && !Array.isArray(body);

const getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find()
            .populate("movie", reviewMovieFields)
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        next(error);
    }
};

const getReviewsForMovie = async (req, res, next) => {
    try {
        const movie = await getMovieFromRequest(req.params.movieId, res);
        if (!movie) return;

        const reviews = await Review.find({ movie: movie._id })
            .populate("movie", reviewMovieFields)
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        next(error);
    }
};

const getReviewById = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const filter = { _id: req.params.id };
        if (req.params.movieId) {
            const movie = await getMovieFromRequest(req.params.movieId, res);
            if (!movie) return;
            filter.movie = movie._id;
        }

        const review = await Review.findOne(filter).populate("movie", reviewMovieFields);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json(review);
    } catch (error) {
        next(error);
    }
};

const createReview = async (req, res, next) => {
    try {
        if (!isRequestBody(req.body)) {
            return res.status(400).json({ message: "Request body must be a JSON object" });
        }

        const { movieId, ...reviewFields } = req.body;
        const requestedMovieId = req.params.movieId || movieId;
        const movie = await getMovieFromRequest(requestedMovieId, res);
        if (!movie) return;

        const review = await Review.create({ ...reviewFields, movie: movie._id });
        const populatedReview = await review.populate("movie", reviewMovieFields);
        res.status(201).json(populatedReview);
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    try {
        if (!isRequestBody(req.body) || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Update body must be a non-empty JSON object" });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const { movieId, movie: movieField, ...updates } = req.body;
        if (movieField !== undefined) {
            return res.status(400).json({ message: "Use movieId to change the linked movie" });
        }

        const filter = { _id: req.params.id };
        if (req.params.movieId) {
            const movie = await getMovieFromRequest(req.params.movieId, res);
            if (!movie) return;
            filter.movie = movie._id;
            if (movieId !== undefined) {
                return res.status(400).json({ message: "A movie-scoped review cannot be moved to another movie" });
            }
        } else if (movieId !== undefined) {
            const movie = await getMovieFromRequest(movieId, res);
            if (!movie) return;
            updates.movie = movie._id;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Update body must include review fields" });
        }

        const review = await Review.findOneAndUpdate(filter, updates, {
            returnDocument: "after",
            runValidators: true,
        }).populate("movie", reviewMovieFields);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json(review);
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const filter = { _id: req.params.id };
        if (req.params.movieId) {
            const movie = await getMovieFromRequest(req.params.movieId, res);
            if (!movie) return;
            filter.movie = movie._id;
        }

        const review = await Review.findOneAndDelete(filter);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json({ message: "Review deleted successfully", review });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getReviews,
    getReviewsForMovie,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
};