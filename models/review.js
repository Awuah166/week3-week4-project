const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "movie",
            required: [true, "Movie reference is required"],
            index: true,
        },
        reviewer: {
            type: String,
            required: [true, "Reviewer name is required"],
            trim: true,
            minlength: [1, "Reviewer name cannot be empty"],
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [0, "Rating cannot be below 0"],
            max: [10, "Rating cannot be above 10"],
        },
        comment: {
            type: String,
            required: [true, "Review comment is required"],
            trim: true,
            minlength: [1, "Review comment cannot be empty"],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Review", reviewSchema);