var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');

/* GET login page. */
router.get('/', function(req, res, next) {
    console.log(req.cookies);
    console.log('=======-------------');
    console.log(req.session);
    res.render('login', { message: 'Log in' });
});

// Refistration page
router.get('/signup', function(req, res, next) {
    res.locals.message = req.flash('signupMessage');
    res.render('signup');
});

// Implement registration
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/login',
    failureRedirect: '/login/signup',
    failureFlash: true
}));

module.exports = router;
