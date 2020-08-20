var express = require('express');
var router = express.Router();
var TestsData = require('../models/test');
const User = require('../models/user');
const { find } = require('../models/test');
//const user = require('../models/user');
const url = require('url'); 
const { exit } = require('process');

/* GET tests page. */
router.get('/', function(req, res, next) {
    //Check if User is log In
    if(req.user){
        TestsData.find()
        .then(function (doc) {
            let arrayOfTestId = []
            doc.forEach(function (doc) {
                if(!arrayOfTestId.includes(doc.testId)){
                    arrayOfTestId.push(doc.testId);
                }
            });
            console.log(arrayOfTestId);
            let userName = req.user.local.userName;
            res.render('tests', { user: userName, testsId: arrayOfTestId });
        });
      } 
      //if not show all tests but start test after log In
      else {
        TestsData.find()
        .then(function (doc) {
            let arrayOfTestId = []
            doc.forEach(function (doc) {
                if(!arrayOfTestId.includes(doc.testName)){
                    arrayOfTestId.push(doc.testName);
                }
            });
            console.log(arrayOfTestId);
            res.render('tests', { testsId: arrayOfTestId });
        });
      }
});

/* TODO: 1. GET quizz by choosen testID. - DONE
    2. Check user profile failed and passed array - DONE
    3. Get first or randon quizz from failed array - DONE
    4. Thinking about how to check answer and what todo next*/
router.get('/get-tests', async function(req, res, next) {
    // Check if User is authorize if YES begin testing else go to login page
    if(req.user){
        let userName = req.user.local.userName;
        // Checking user profile and get first failed quizzId by testId
        async function getFailedQuizzId(){
            await User.findOne({"local.userEmail": req.user.local.userEmail})
            .then(function(userProfile){
             let userAnalytics = userProfile.local.userAnalytics;
             let failedArrayByTestId = [];
             for(let i = 0; i < userAnalytics.length; i++){
                 if(userAnalytics[i].testId === req.query.testId){
                     failedArrayByTestId = userAnalytics[i].failed;
                     break;
                 }
             }
             //Check is failer array empty or not
             if(failedArrayByTestId.length){
                // Taking first element from failed array and get getting quizz from DB
                getQuizzById(failedArrayByTestId[0]);
             }
             else{
                 //TODO: if its hepen after all successful compleate teest 
                 // show success mesage and offer try again
                 console.log("Failed array is empty for current test " + failedArrayByTestId);
             }
            });
        }
        await getFailedQuizzId();
        
        // Get quizz by quizzId frim DB
        async function getQuizzById (failedId){
            
            await TestsData.findOne({"testId": req.query.testId, "quizzObj.quizzId": failedId})
            .then(async function (doc) {
                console.log(doc.quizzObj.quizzAnswers);
                let question = doc.quizzObj.quizzQuestion;
                //FIXME: figure out how to get each ansver and sei it up to html
                let answers = doc.quizzObj.quizzAnswers;
                
                res.render('get_tests', {user: userName, quizzQuestion: question, quizzAnswers: answers});
                        
            });
        }
    } else{
        res.redirect('/login');
    } 
});

/* Begining choosen test */
router.post('/get-tests', async function(req, res, next) {
    if(!req.user){
        res.redirect('/login');
    } else {
        let choosedTestId = req.body.choosedTestId;
        let existId = false;
        let userAnalytics = req.user.local.userAnalytics;
        
        // Checking if user already exist current test
        for(let i = 0; i < userAnalytics.length; i++){
            let {testId} = userAnalytics[i];
            if (testId === choosedTestId) existId = true;
        }

        if(existId){
            console.log("Test already exist");
            res.redirect(url.format({
                //FIXME: encode and decode path and testId
                pathname:"/tests/get-tests",
                query: {
                   "testId": choosedTestId
                 }
              }));
        }
        else {
            //Going throw all test and find all test related to current test
            //Save all test to failed array (userAnalytics)
            let userName = req.user.local.userName;
            let question = ''

            let analyticsObj = {
                testId: choosedTestId,
                passed: [],
                failed: []
            };

            await TestsData.find({testId: choosedTestId})
            .then(function (doc) {
                doc.forEach(function (doc) {
                    analyticsObj.failed.push(doc.quizzObj.quizzId);
                });
            });

            //Update user profile
            await User.findOneAndUpdate({"local.userEmail": req.user.local.userEmail},
                     {'$push': {"local.userAnalytics": [analyticsObj]}}, {new: true});

            await TestsData.findOne({testId: choosedTestId})
            .then(function(currentTest){
                console.log("currentTest : "  + currentTest.quizzObj);
                question = currentTest.quizzObj.quizzQuestion;
            });
            
            res.render('get_tests', { user: userName, quizzQuestion: question});
        }
    }
});

module.exports = router;
