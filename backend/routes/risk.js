const express = require('express');
const router = express.Router();

// Get Safety Heatmap Data
router.get('/heatmap', (req, res) => {
    // Mock Data based on "Crime Sensing"
    const heatPoints = [
        { lat: 12.9716, lng: 77.5946, intensity: 0.9 }, // High risk area
        { lat: 12.9352, lng: 77.6245, intensity: 0.8 },
        { lat: 12.9250, lng: 77.5855, intensity: 0.3 }, // Safe area
        { lat: 12.9592, lng: 77.6974, intensity: 0.7 },
        { lat: 13.0285, lng: 77.5460, intensity: 0.6 }
    ];
    res.json(heatPoints);
});

module.exports = router;
