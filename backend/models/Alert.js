const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    status: {
        type: String,
        enum: ['Active', 'Resolved', 'False Alarm'],
        default: 'Active'
    },
    type: {
        type: String,
        enum: ['SOS', 'Medical', 'Harassment'],
        default: 'SOS'
    },
    batteryLevel: Number,
    audioUrl: String, // Link to evidence
    imageUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
