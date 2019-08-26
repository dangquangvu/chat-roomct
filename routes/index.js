const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
var io = require('../app')

router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

router.get('/chat', ensureAuthenticated, (req, res) => {
    res.render('chat')
});

module.exports = router;