const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
var io = require('../app')

router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

router.get('/chat', ensureAuthenticated, (req, res) => {
    var ses = req.session.passport.user;
    console.log(ses, 1111111111111);
    res.render('chat', {
        user: req.user
    })
});

module.exports = router;