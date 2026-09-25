require("dotenv").config();

const mongoose = require("mongoose");
const Movie = require("../models/movie");
const Review = require("../models/review");

const migrateReviewLinks = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB || "movies",
    });

    const unlinkedReviews = await Review.collection
        .find({ movie: { $exists: false } })
        .toArray();
    let linkedCount = 0;
    const unmatchedReviews = [];

    for (const review of unlinkedReviews) {
        if (!review.movieTitle) {
            unmatchedReviews.push(review._id);
            continue;
        }

        const movie = await Movie.findOne({ title: review.movieTitle }).select("_id");
        if (!movie) {
            unmatchedReviews.push(review._id);
            continue;
        }

        await Review.collection.updateOne(
            { _id: review._id, movie: { $exists: false } },
            {
                $set: { movie: movie._id },
                $unset: { movieTitle: "" },
            }
        );
        linkedCount += 1;
    }

    console.log(`Linked ${linkedCount} review(s) to movies.`);
    if (unmatchedReviews.length > 0) {
        console.warn(`${unmatchedReviews.length} review(s) could not be matched by movieTitle.`);
        process.exitCode = 1;
    }
};

migrateReviewLinks()
    .catch((error) => {
        console.error("Unable to migrate review links:", error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());