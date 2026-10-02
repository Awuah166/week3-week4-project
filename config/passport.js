const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

const isGoogleOAuthConfigured = () =>
    Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const configurePassport = () => {
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        User.findById(id).then((user) => done(null, user)).catch(done);
    });

    if (!isGoogleOAuthConfigured()) return;

    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || `${baseUrl}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value?.toLowerCase();
                const emailVerified = profile._json?.email_verified === true ||
                    profile._json?.verified_email === true;
                if (!email || !emailVerified) {
                    return done(null, false);
                }

                let user = await User.findOne({ googleId: profile.id }).select("+googleId");
                if (!user) {
                    user = await User.findOne({ email }).select("+googleId");
                    if (user?.googleId && user.googleId !== profile.id) {
                        return done(null, false);
                    }
                    if (!user) user = new User({ email });
                    user.googleId = profile.id;
                    user.name = profile.displayName;
                    await user.save();
                }

                done(null, user);
            } catch (error) {
                done(error);
            }
        }
    ));
};

module.exports = { configurePassport, isGoogleOAuthConfigured };