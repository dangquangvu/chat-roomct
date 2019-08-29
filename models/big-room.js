const mongoose = require('mongoose');

const BigRoomSchema = new mongoose.Schema({
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
    }

});

const BigRoom = mongoose.model('BigRoom', BigRoomSchema);

module.exports = BigRoom;