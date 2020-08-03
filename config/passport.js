const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = function (passport) {
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'userEmail',
        passwordField: 'userPassword',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            process.nextTick(function () {
               User.findOne({'local.userEmail': email}, function (err, user) {
                   if (err)
                       return done(err);
                   if (user){
                       return done(null, false, req.flash('signupMessage', 'That email already taken'));
                   } else {
                       let newUser = User();
                       newUser.local.userName = req.body.userName;
                       newUser.local.userEmail = req.body.userEmail;
                       newUser.local.userPassword = req.body.userPassword;

                       newUser.save(function (err) {
                           if(err) throw err;
                           console.log("New user here " + newUser);
                           return done(null, newUser);
                       });
                   }
               });
            });
        }
    ));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'userEmail',
        passwordField: 'userPassword',
        passReqToCallback: true
    },
    function(req, email, password, done){
        process.nextTick(function(){
            User.findOne({'local.userEmail': email}, function(err, user){
                if(err) return done(err);

                if(!user) return done(null, false, req.flash('loginMessage', 'No user found'));

                if(user.local.userPassword != password) return done(null, false, req.flash('loginMessage', 'Invalid password'));

                return done(null, user);
            });
        });
    }
    ));

}