const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
        },
        passwordHash: {
            type: String,
            select: false,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
            select: false,
        },
    },
    { timestamps: true }
);

userSchema.pre("validate", function () {
    if (!this.passwordHash && !this.googleId) {
        this.invalidate("passwordHash", "A password or Google account is required");
    }
});

module.exports = mongoose.model("User", userSchema);