const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const User = require('../models/User');

// In-Memory Fallback
const mockAlerts = [];

// Create SOS Alert
router.post('/', async (req, res) => {
    try {
        const { userId, location, type, batteryLevel } = req.body;

        if (mongoose.connection.readyState !== 1) {
            const newAlert = {
                _id: Date.now().toString(),
                user: userId,
                location,
                type,
                batteryLevel,
                status: 'Active',
                createdAt: new Date()
            };
            mockAlerts.push(newAlert);
            console.log(`[MOCK RELAY] Alert from User ${userId} sent via Mock Network`);
            return res.json({ msg: 'SOS Alert Triggered! (Mock)', alert: newAlert });
        }

        const newAlert = new Alert({
            user: userId,
            location,
            type,
            batteryLevel
        });

        await newAlert.save();

        // Simulate Cross-State Relay (Mock log)
        console.log(`[RELAY] Alert from User ${userId} sent to nearby volunteers and police stations in ${location.address}`);
        console.log(`[SMS] Sending SMS to emergency contacts...`);

        res.json({ msg: 'SOS Alert Triggered!', alert: newAlert });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all active alerts
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json(mockAlerts);
        }

        const alerts = await Alert.find({ status: 'Active' }).populate('user', 'name phoneNumber sakhiId');
        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
