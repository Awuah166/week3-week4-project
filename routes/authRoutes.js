const express = require("express");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const requireAuth = require("../middleware/requireAuth");
const { isGoogleOAuthConfigured } = require("../config/passport");
const {
    completeLogin,
    getCurrentUser,
    login,
    logout,
    register,
} = require("../controllers/authController");

const router = express.Router();
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", requireAuth, logout);

router.get("/google", authRateLimit, (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
        return res.status(503).json({ message: "Google sign-in is not configured" });
    }
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: true,
    })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
        return res.status(503).json({ message: "Google sign-in is not configured" });
    }

    passport.authenticate("google", (error, user) => {
        if (error) return next(error);
        if (!user) return res.status(401).json({ message: "Google sign-in failed" });
        completeLogin(req, res, next, user);
    })(req, res, next);
});

module.exports = router;