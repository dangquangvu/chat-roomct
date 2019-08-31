const mongoose = require('mongoose');

const MessSchema = new mongoose.Schema({
    idUser: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date
    },
    idRoom: {
        type: String,
        default: 1
    }
});

const Messagerdb = mongoose.model('Messagerdb', MessSchema);

module.exports = Messagerdb;