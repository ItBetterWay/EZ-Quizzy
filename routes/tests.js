var express = require('express');
var router = express.Router();

/* GET tests page. */
router.get('/', function(req, res, next) {
    res.render('tests', { title: 'EZ-Quizzy' });
});

module.exports = router;
