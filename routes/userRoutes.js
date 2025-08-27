const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        // create new user
        const newUser = new User({ username, email, password });
        await newUser.save();

        // exclude password before sending back
        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
        };

        res.status(201).json(userResponse);
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: 'Incorrect email or password.' });
        }

        // check password
        const isMatch = await user.isCorrectPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect email or password.' });
        }

        // create token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
});

module.exports = router;