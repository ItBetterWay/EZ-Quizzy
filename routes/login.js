var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');

/* GET login page. */
router.get('/', function(req, res, next) {
    // console.log(req.user);
    // console.log('=======-------------');
    // console.log(req.session);
    //res.render('login', { message: 'Log in' });
    res.locals.message = req.flash('loginMessage');
    res.render('login');
});

// Implement login
router.post('/', passport.authenticate('local-login', {
    successRedirect: '/users',
    failureRedirect: '/login',
    failureFlash: true
}));

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

// Logout page
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
