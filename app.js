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
var connect = require('connect');
var sharedsession = require("express-socket.io-session");
// mongoose.connect("mongodb://localhost:27017/", {
//     useNewUrlParser: true
// });
// Passport Config
require('./config/passport')(passport);
//console.log(session)
// DB Config
const db = require('./config/keys').mongoURI;
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
    .connect(
        db, { useNewUrlParser: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + '../public'));
app.use(express.static(__dirname + "../views"));
app.use(morgan('dev'));
// Express body parser
app.use(express.urlencoded({ extended: true }));
var session_store = new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 10000
});
// Express session
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
        store: session_store
    })
);
app.use(cookieParser())
    // Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());
//io.use(sharedsession(session));
// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

io.on('connection', socket => {
    //console.log(socket.handshake.session)
    console.log('a user connection!')
        //console.log(socket)
    socket.on('message', data => { /* … */ });
    socket.on('disconnect', () => {
        console.log('user disconnection!')
    });
});
http.listen(PORT, function() {
    console.log('listening on *:', PORT);
});