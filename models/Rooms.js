const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    nameRoom: {
        type: String,
        require: true,

    },
    idUser: {
        type: Array,

    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Rooms = mongoose.model('Rooms', RoomSchema);

module.exports = Rooms;