require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const helmet = require("helmet");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const mongoose = require("mongoose");
const connectDB = require("./database/db");
const swaggerDocument = require("./swagger.json");
const movieRoutes = require("./routes/movieRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const authRoutes = require("./routes/authRoutes");
const requireAuth = require("./middleware/requireAuth");
const passport = require("passport");
const { configurePassport } = require("./config/passport");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(helmet());

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

app.get("/swagger.json", (req, res) => {
    res.status(200).json(swaggerDocument);
});

app.use("/api-docs", (req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; frame-ancestors 'self'; base-uri 'self'"
    );
    next();
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const startServer = async () => {
    try {
        if (!process.env.SESSION_SECRET) {
            throw new Error("SESSION_SECRET is not defined");
        }

        await connectDB();
        configurePassport();

        if (process.env.NODE_ENV === "production") {
            app.set("trust proxy", 1);
        }

        app.use(session({
            name: "movie.sid",
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                client: mongoose.connection.getClient(),
                dbName: process.env.MONGODB_DB || "movies",
                collectionName: "sessions",
            }),
            cookie: {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            },
        }));
        app.use(passport.initialize());
        app.use(passport.session());

        app.use("/api/auth", authRoutes);
        app.use("/api/movies", requireAuth, movieRoutes);
        app.use("/api/reviews", requireAuth, reviewRoutes);
        app.use(notFound);
        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start server", error.message);
        process.exit(1);
    }
};

startServer();