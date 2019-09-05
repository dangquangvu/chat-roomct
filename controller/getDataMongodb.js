const { User, Messagerdb, Rooms } = require('../models/index');
//var arrMessSendRedis = []
module.exports = {
    getData: async(arrMessSendRedis) => {
        let messInBigRoom = await Messagerdb.find();
        await messInBigRoom.map(async item => {
            let idUser = item.idUser;
            let message = item.message;
            let date = item.date;
            let nameUser = item.nameUser;
            objectMessSendRedis = { idUser, message, date, nameUser }
            await arrMessSendRedis.push(objectMessSendRedis);
        });
        return arrMessSendRedis;
    }
}