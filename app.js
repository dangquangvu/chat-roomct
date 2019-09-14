const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
var morgan = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var cookieParser = require('cookie-parser')
const path = require('path')
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var moment = require('moment')
var redis = require("redis"),
    client = redis.createClient();
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const dotenvAbsolutePath = path.join(process.cwd(), ".env");
require("dotenv").config({ silent: true, path: dotenvAbsolutePath });
const { User, Messagerdb, Rooms } = require('./models/index');
const { getDataMongodb } = require('./controller/index')
require('./config/passport')(passport);
const db = require('./config/keys').mongoURI;
const PORT = process.env.PORT || 5000;
mongoose
    .connect(
        db, { useNewUrlParser: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + '../public'));
app.use(express.static(__dirname + "../views"));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
var sessionMiddleware = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 10000
    })
})
Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}
app.use(sessionMiddleware);
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
let arrUser = [];
var arrUsername = [];
let arrMessSendRedis = [];
var arrMess = [];
let getDataMg = async() => {
    const data = await getDataMongodb.getData(arrMessSendRedis);
    return data;
};
getDataMg().then((data) => {
    arrMess = data;
    client.set('mess', JSON.stringify(arrMess));
    console.log('redis up ok!')
});
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next)
})
io.on('connection', async socket => {
    let objectMessSendRedis = {};
    const idRooms = '5d6a393f5a6c9356d4f2757e';
    var userId = socket.request.session.passport.user;
    let username = await User.findById({ _id: userId })
    username = username.name;
    console.log("Your User ID is", username);
    console.log(21)
    let userJoin = username + ' join in group chat!'
        // sự kiện khi vào
    let dataRedis = await getAsync('mess');
    let messRedis = JSON.parse(dataRedis);
    let countRedis = messRedis.length;
    //let messOlder = messRedis.slice(Math.max(messRedis.length - 10, 1));
    //let arrMessLoad = messOlder;
    // socket.on('load_more', async() => {
    //     let idSocket = socket.id;
    //     arrMessLoad = messOlder;
    //     //let indexMess = await messRedis.findIndex((user) => user.userId === id)
    //     //console.log(arrMessLoad[0]);
    //     io.to(idSocket).emit('load_more_mess', arrMessLoad[0]);
    // })
    socket.on('join', async() => {
        let idSocket = socket.id;
        let count = 0;
        let numberUser = 1;
        let userIsActive = {
            username,
            userId,
            numberUser
        }
        await arrUsername.map(item => {
            if (item.username == userIsActive.username && item.userId == userIsActive.userId) {
                count = 1;
                item.numberUser++;
                return;
            }
        })
        if (count == 0) {
            arrUsername.push(userIsActive);
            console.log('adduser')
        }
        io.emit('user-active', arrUsername);
        //render data client
        messRedis.map(async item => {
            let dateConvert = item.date;
            let newDate = new Date(dateConvert);
            let dated = ("0" + newDate.getDate()).slice(-2);
            let month = ("0" + (newDate.getMonth() + 1)).slice(-2);
            let year = newDate.getFullYear();
            let hours = newDate.getHours();
            let minutes = newDate.getMinutes();
            let seconds = newDate.getSeconds();
            let hoursMinutes;
            if (minutes < 10) {
                hoursMinutes = hours + ":0" + minutes;
            } else {
                hoursMinutes = hours + ":" + minutes;
            }
            //console.log(hoursMinutes)
            let user = {
                name: item.nameUser,
                mess: item.message,
                date: hoursMinutes
            }
            io.to(idSocket).emit('send-mess-client', user);
        })

        let dataRoom = await Rooms.find({});
        await dataRoom.map(async item1 => {
            if (item1.idUser.length == 0) {
                arrUser = item1.idUser;
                arrUser.push(userId);
                let updateData = await Rooms.findByIdAndUpdate({ _id: idRooms }, {
                    $set: {
                        idUser: arrUser
                    }
                });
                let x = await Rooms.findById({ _id: idRooms })
                socket.emit('message-join', 'welcome ' + username + '!');
            }
            if (item1.idUser.length >= 1) {
                let counter = 0;
                arrUser = item1.idUser;
                await arrUser.map(item => {
                    if (item == userId) {
                        counter++;
                    }
                })
                if (counter == 0) {
                    arrUser.push(userId);
                    let updateData = await Rooms.findByIdAndUpdate({ _id: idRooms }, {
                        $set: {
                            idUser: arrUser
                        }
                    });
                    let x = await Rooms.findById({ _id: idRooms })
                    socket.emit('message-join', 'welcome ' + username + '!');
                    socket.broadcast.emit('message-join', userJoin)
                }
                if (counter !== 0) {
                    socket.emit('message-join', 'Welcome back ' + username + ' !');
                }
                await counter == 0;
            }
        })

    });
    socket.on('send-mess', async(data) => {
        let date = new Date;
        let dated = ("0" + date.getDate()).slice(-2);
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let hoursMinutes;
        if (minutes < 10) {
            hoursMinutes = hours + ":0" + minutes;
        } else {
            hoursMinutes = hours + ":" + minutes;
        }
        let user = {
            name: username,
            mess: data,
            date: hoursMinutes
        }
        let newMess = new Messagerdb();
        newMess.idUser = userId;
        newMess.nameUser = username;
        newMess.message = data;
        newMess.date = date;
        let idUser = userId;
        let message = data;
        let nameUser = username;
        let objectMessSendRedis = { idUser, message, date, nameUser }
        await newMess.save();
        let dataUpdateRedis = await getAsync('mess').then(async res => {
                let dataGet = JSON.parse(res);
                dataGet.push(objectMessSendRedis);
                let addMessRedis = client.set('mess', JSON.stringify(dataGet));
                //###########################  
            })
            .catch(console.log)
        io.emit('send-mess-client', user)
    });
    socket.on('disconnect', async() => {
        let counterUser = 0;
        console.log('user disconnection:' + username, userId)
        const removeUser = async(id) => {
            const index = await arrUsername.findIndex((user) => user.userId === id)
            if (index !== -1) {
                if (arrUsername[index].numberUser > 1) {
                    arrUsername[index].numberUser--;
                    console.log(arrUsername[index].numberUser)
                    return;
                }
                if (arrUsername[index].numberUser == 1) {
                    return arrUsername.splice(index, 1)[0]
                }
            }
        };
        let user = await removeUser(userId)
        if (user) {
            io.emit('user-active', arrUsername);
        }
    });
    //socket.emit('disconn', arrUsername)
});

http.listen(PORT, function() {
    console.log('listening on port:', PORT);
});

module.exports = io;