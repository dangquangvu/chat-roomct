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
const dotenvAbsolutePath = path.join(process.cwd(), ".env");
require("dotenv").config({ silent: true, path: dotenvAbsolutePath });

require('./config/passport')(passport);

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

app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
var username;

io.on('connection', socket => {
    console.log('a user connection!')
    console.log(21)
    socket.on('clickButtonLogin', (data) => {
        username = data.username;
        console.log(data.username)
    })
    socket.on('message', data => {});
    socket.on('disconnect', () => {
        console.log('user disconnection!', 11111111111111111111)
    });
});
http.listen(PORT, function() {
    console.log('listening on *:', PORT);
});

module.exports = io;