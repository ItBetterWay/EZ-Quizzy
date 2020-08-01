var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', isLoggedIn, function(req, res) {
  console.log(req.user);
  let userId = req.user._id;
  let userName = req.user.local.userName;
  let userEmail = req.user.local.userEmail;
  let userPass = req.user.local.userPassword;
  res.render('profile', {userId, userName, email: userEmail, userPass, user: userName});
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
