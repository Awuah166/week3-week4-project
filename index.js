require("dotenv").config();

const express = require("express");
const connectDB = require("./database/db");
const movieRoutes = require("./routes/movieRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Favorite Movies API is running",
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

app.use("/api/movies", movieRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start server", error.message);
        process.exit(1);
    }
};

startServer();