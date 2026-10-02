const bcrypt = require("bcryptjs");
const User = require("../models/user");

const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
});

const completeLogin = (req, res, next, user, status = 200) => {
    req.login(user, (error) => {
        if (error) return next(error);
        req.session.save((saveError) => {
            if (saveError) return next(saveError);
            res.status(status).json({ user: publicUser(user) });
        });
    });
};

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const passwordBytes = Buffer.byteLength(password, "utf8");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ message: "A valid email address is required" });
        }
        if (passwordBytes < 12 || passwordBytes > 72) {
            return res.status(400).json({ message: "Password must be 12 to 72 bytes long" });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({ email: normalizedEmail, passwordHash });
        completeLogin(req, res, next, user, 201);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        completeLogin(req, res, next, user);
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = (req, res) => {
    res.status(200).json({ user: publicUser(req.user) });
};

const logout = (req, res, next) => {
    req.logout((logoutError) => {
        if (logoutError) return next(logoutError);
        req.session.destroy((destroyError) => {
            if (destroyError) return next(destroyError);
            res.clearCookie("movie.sid", {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
            });
            res.status(200).json({ message: "Logged out successfully" });
        });
    });
};

module.exports = { completeLogin, getCurrentUser, login, logout, register };