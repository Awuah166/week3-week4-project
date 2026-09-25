const mongoose = require("mongoose");
const Movie = require("../models/movie");

const getMovies = async (req, res, next) => {
    try {
        const movies = await Movie.find().sort({ rating: -1 });
        res.status(200).json(movies);
    } catch (error) {
        next(error);
    }
};

const getMovieById = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid movie ID" });
        }

        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.status(200).json(movie);
    } catch (error) {
        next(error);
    }
};

const createMovie = async (req, res, next) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json(movie);
    } catch (error) {
        next(error);
    }
};

const updateMovie = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid movie ID" });
        }

        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.status(200).json(movie);
    } catch (error) {
        next(error);
    }
};

const deleteMovie = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid movie ID" });
        }

        const movie = await Movie.findByIdAndDelete(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.status(200).json({
            message: "Movie deleted successfully",
            movie,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};