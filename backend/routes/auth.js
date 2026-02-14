const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
// const jwt = require('jsonwebtoken'); // Simulating JWT for prototype

// In-Memory Fallback
const mockUsers = [];

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, phoneNumber, password, emergencyContacts } = req.body;

        // Generate Unified Sakhi ID
        const sakhiId = `SAKHI-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

        // Check DB Connection
        if (mongoose.connection.readyState !== 1) {
            // Mock Mode
            if (mockUsers.find(u => u.phoneNumber === phoneNumber)) {
                return res.status(400).json({ msg: 'User already exists (Mock)' });
            }

            const newUser = {
                _id: Date.now().toString(),
                name, phoneNumber, password, sakhiId,
                emergencyContacts: emergencyContacts || []
            };
            mockUsers.push(newUser);
            console.log('Mock User Registered:', newUser);
            return res.json({ msg: 'User registered successfully (Mock)', sakhiId, user: newUser });
        }

        // MongoDB Mode
        let user = await User.findOne({ phoneNumber });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            phoneNumber,
            password,
            sakhiId,
            emergencyContacts
        });

        await user.save();
        res.json({ msg: 'User registered successfully', sakhiId, user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        // Check DB Connection
        if (mongoose.connection.readyState !== 1) {
            const user = mockUsers.find(u => u.phoneNumber === phoneNumber);
            if (!user) return res.status(400).json({ msg: 'Invalid Credentials (Mock)' });
            if (user.password !== password) return res.status(400).json({ msg: 'Invalid Credentials (Mock)' });
            return res.json({ msg: 'Login matched (Mock)', user });
        }

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (user.password !== password) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        res.json({ msg: 'Login matched', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
