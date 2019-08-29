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
const dotenvAbsolutePath = path.join(process.cwd(), ".env");
require("dotenv").config({ silent: true, path: dotenvAbsolutePath });
const { User, BigRoom } = require('./models/index');
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
    console.log('a user connection!')
    var userId = socket.request.session.passport.user;
    let username = await User.findById({ _id: userId })
    username = username.name;
    console.log("Your User ID is", username);
    console.log(21)
    let userJoin = username + ' join in group chat!'
    socket.on('send-mess', async(data) => {
        let date = new Date;
        let dated = ("0" + date.getDate()).slice(-2);

        // current month
        let month = ("0" + (date.getMonth() + 1)).slice(-2);

        // current year
        let year = date.getFullYear();

        // current hours
        let hours = date.getHours();

        // current minutes
        let minutes = date.getMinutes();

        // current seconds
        let seconds = date.getSeconds();
        //console.log(date.addHours(7))
        // let gettime = date.format('h:mm:ss');
        // console.log(gettime);
        console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

        let hoursMinutes = hours + ":" + minutes
        console.log(username, data, hoursMinutes);
        let user = {
            name: username,
            mess: data,
            date: hoursMinutes
        }
        let newMess = new BigRoom();
        newMess.idUser = userId;
        newMess.message = data;
        newMess.date = date;
        //await newMess.save();
        io.emit('send-mess-client', user)
    });
    socket.on('disconnect', () => {
        console.log('user disconnection:' + username)
    });
});
http.listen(PORT, function() {
    console.log('listening on *:', PORT);
});

module.exports = io;