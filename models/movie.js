const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Movie title is required"],
            trim: true,
            minlength: [1, "Movie title cannot be empty"],
        },
        year: {
            type: Number,
            required: [true, "Released year is required"],
            min: [1888, "Release year must be 1888 or later"],
            max: [2100, " Release year must be 2100 or earlier"],
            validate: {
                validator: Number.isInteger,
                message: "Release year must be a whole number",
            },
        },
        genre: {
            type: String,
            required: [true, "Genre is required"],
            trim: true,
            minlength: [1, "Genre cannot be empty"],
        },
        director: {
            type: String,
            required: [true, "Director is required"],
            trim: true,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [0, "Rating cannot be below 0"],
            max: [10, "Rating cannot be above 10"],
        },
        favorite: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("movie", movieSchema);