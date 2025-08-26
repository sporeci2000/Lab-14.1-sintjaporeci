const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// Define the shape of a User document
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required.'],
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: [true, 'Email is required.'],
            unique: true, // prevent duplicate emails
            lowercase: true,
            trim: true,
            match: [/.+@.+\..+/, "Must match an email address!"],
        },

        password: {
            type: String,
            required: [true, 'Password is required.'],
            minlength: [8, 'Password must be at least 8 characters long.'],
            select: false, // don’t return password by default
        },
    },
    { timestamps: true } // automatically add createdAt + updatedAt
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (this.isNew || this.isModified("password")) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});

// Compare entered password with stored hash
userSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Export User model
module.exports = model('User', userSchema);
