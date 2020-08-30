var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.user){
    let userName = req.user.local.userName;
    return res.render('index', { title: 'EZ-Quizzy', user: userName });
  }
  res.render('index', { title: 'EZ-Quizzy'});
});

module.exports = router;
