const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    sakhiId: {
        type: String,
        unique: true
    }, // Generated Unified ID
    emergencyContacts: [{
        name: String,
        phone: String
    }],
    homeAddress: {
        lat: Number,
        lng: Number,
        address: String
    },
    language: {
        type: String,
        default: 'en'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
