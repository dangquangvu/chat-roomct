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
const dotenvAbsolutePath = path.join(process.cwd(), ".env");
require("dotenv").config({ silent: true, path: dotenvAbsolutePath });
const { User, Messagerdb, Rooms } = require('./models/index');
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
var arrUsername = [];
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next)
})
io.on('connection', async socket => {
    let objectMessSendRedis = {};
    let arrMessSendRedis = [];
    const idRooms = '5d6a393f5a6c9356d4f2757e';
    var userId = socket.request.session.passport.user;
    let username = await User.findById({ _id: userId })
    username = username.name;
    console.log("Your User ID is", username);
    console.log(21)
    let userJoin = username + ' join in group chat!'
    let messInBigRoom = await Messagerdb.find();
    await messInBigRoom.map(async item => {
            let idUser = item.idUser;
            let message = item.message;
            let date = item.date;
            let nameUser = item.nameUser;
            objectMessSendRedis = { idUser, message, date, nameUser }
            await arrMessSendRedis.push(objectMessSendRedis);
        })
        //let a = arrMessSendRedis.reverse();
    client.set('mess', JSON.stringify(arrMessSendRedis));
    // sự kiện khi vào
    socket.on('join', async() => {
        let arrUser = [];
        await getAsync('mess').then(res => {
            let messOlder = JSON.parse(res);
            let idSocket = socket.id;
            //console.log()
            messOlder.map(async item => {
                let dateConvert = item.date;
                var newDate = new Date(dateConvert);
                let dated = ("0" + newDate.getDate()).slice(-2);
                //console.log(dated)
                let month = ("0" + (newDate.getMonth() + 1)).slice(-2);
                let year = newDate.getFullYear();
                let hours = newDate.getHours();
                let minutes = newDate.getMinutes();
                let seconds = newDate.getSeconds();
                let hoursMinutes = hours + ":" + minutes
                let user = {
                    name: item.nameUser,
                    mess: item.message,
                    date: hoursMinutes
                }
                io.to(idSocket).emit('send-mess-client', user);
                //io.emit('send-mess-client', user)
            })
        }).catch(err => {
            console.log(err)
        })
        let dataRoom = await Rooms.find({});
        await dataRoom.map(async item1 => {
            if (item1.idUser.length == 0) {
                arrUser = item1.idUser;
                arrUser.push(userId);
                console.log(arrUser, 1111111)
                let updateData = await Rooms.findByIdAndUpdate({ _id: idRooms }, {
                    $set: {
                        idUser: arrUser
                    }
                });
                let x = await Rooms.findById({ _id: idRooms })
                socket.emit('message-join', 'welcome ' + username + '!');
                console.log(x, 11111122222)
            }
            if (item1.idUser.length >= 1) {
                let counter = 0;
                console.log(222222222222)
                arrUser = item1.idUser;
                await arrUser.map(item => {
                    if (item == userId) {
                        counter++;
                    }
                })
                if (counter == 0) {
                    arrUser.push(userId);
                    console.log(arrUser, 1111111)
                    let updateData = await Rooms.findByIdAndUpdate({ _id: idRooms }, {
                        $set: {
                            idUser: arrUser
                        }
                    });
                    let x = await Rooms.findById({ _id: idRooms })
                        // sub ở đây
                    socket.emit('message-join', 'welcome ' + username + '!');
                    socket.broadcast.emit('message-join', userJoin)
                        //console.log(x, 11111122222)
                }
                if (counter !== 0) {
                    socket.emit('message-join', 'Welcome back ' + username + ' !');
                    socket.broadcast.emit('message-join', username + ' comeback!')
                }
                await counter == 0;
            }
        })

    });
    socket.on('send-mess', async(data) => {
        let date = new Date;
        console.log(typeof date)
        let dated = ("0" + date.getDate()).slice(-2);
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
        let hoursMinutes = hours + ":" + minutes
        console.log(username, data, hoursMinutes);
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
        await newMess.save();
        io.emit('send-mess-client', user)
    });
    socket.on('disconnect', () => {
        console.log('user disconnection:' + username)

    });
});
http.listen(PORT, function() {
    console.log('listening on port:', PORT);
});

module.exports = io;