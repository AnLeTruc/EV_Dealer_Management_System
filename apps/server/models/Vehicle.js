const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    model :{
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    colorVariants: [{
        color: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        img: {
            type: String,
            required: true
        }
    }],
    engine:{
        type: String,
        enum: ['Electric', 'Gasoline', 'Diesel', 'Hybrid'],
        required: true
    },
    powerOutput: {
        type: Number,
        required: true
    },
    transmission:{
        type: String,
        enum: ['Automatic', 'Manual']
    },
    fuelConsumption: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        enum: ['Electric', 'Gasoline', 'Diesel', 'Hybrid', 'N/A']
    },
    img: {
        type: String,
        required: true
    }
}, { timestamp: true});

module.exports  = mongoose.model('Vehicle', VehicleSchema);