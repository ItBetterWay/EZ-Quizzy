var express = require('express');
var router = express.Router();
var TestsData = require('../models/test');
const { find } = require('../models/test');

/* GET tests page. */
router.get('/', function(req, res, next) {
    //Check if User is log In
    if(req.user){
        TestsData.find()
        .then(function (doc) {
            let testArrayOfName = []
            doc.forEach(function (doc) {
                if(!testArrayOfName.includes(doc.testName)){
                    testArrayOfName.push(doc.testName);
                }
            });
            console.log(testArrayOfName);
            let userName = req.user.local.userName;
            res.render('tests', { user: userName, testsName: testArrayOfName });
        });
      } 
      //if not show all tests but start test after log In
      else {
        TestsData.find()
        .then(function (doc) {
            let testArray = []
            doc.forEach(function (doc) {
                if(!testArray.includes(doc.testName)){
                    testArray.push(doc.testName);
                }
            });
            console.log(testArray);
            res.render('tests', { testsName: testArray });
        });
      }
});

/* GET tests from DB. */
router.get('/get-tests', function(req, res, next) {
    // Check if User is authorize if YES begin testing else go to login page
    if(req.user){
        let userName = req.user.local.userName;
        
        //TODO: figure out how to show tests one by one which failed or if user just start show first one 
        TestsData.find()
        .then(function (doc) {
                    console.log(doc.length);
                    //res.send('respond with a resource' + doc);
                    res.render('get_tests', {user: userName});
                });
    } else{
        res.redirect('/login');
    } 
});

/* GET tests from DB. */
//TODO: Need to check answer then save answer to user profile and go to next test
router.post('/get-tests', function(req, res, next) {
    if(!req.user){
        res.redirect('/login');
    } else {
        console.log("My val " + req.body.btnVal);

        res.render('get_tests');
    }
});

module.exports = router;
