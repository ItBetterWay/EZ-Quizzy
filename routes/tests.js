var express = require('express');
var router = express.Router();
var TestsData = require('../models/test');
const User = require('../models/user');
const { find } = require('../models/test');
//const user = require('../models/user');
const url = require('url'); 
//const { use } = require('passport');
let CURRENT_QUIZZ = {};
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

router.post('/check', async function(req, res){
    let wrongMsg = '';
    let userCheckedData = req.body.checkbox;
    let userName = req.user.local.userName;
    if(userCheckedData !== undefined){
        //TODO: 1 Get checked answer from user
            // 2. Compair answers with try answer
            // 3. if answer TRY (all):
            // 3.1 Move quizzID from failer array to passed array
            // 3.2 go to next Quizz
            // 4. if answer FALSE:
            // 4.1 Show errer massage
            // 4.2 Give chance pass the quizz again

            //Check if user checked one or more answers or no one
            // Checked multiple answers
            if (typeof userCheckedData === "object"){
                console.log("MORE");
                console.log(CURRENT_QUIZZ);

            } 
            // Checked only one answer
            else if(typeof userCheckedData === "string") {
                console.log("ONE");
                let answers= CURRENT_QUIZZ.quizzObj.quizzAnswers;
                console.log(answers);
                for(let i = 0; i < answers.length; i++){
                    let {check, _id} = answers[i];
                    if(check && new String(_id).valueOf() === new String(userCheckedData).valueOf()){
                        console.log(userCheckedData + "  " + _id)
                        console.log("CHECKED TRY");
                        
                    }else{
                        console.log(userCheckedData + "  " + _id)
                        console.log("CHECKED FALSE")
                        wrongMsg = "CHECKED FALSE";
                    }
                }
            }

            res.render('get_tests', {user: userName, quizzQuestion: CURRENT_QUIZZ.quizzObj.quizzQuestion,
                quizzAnswers: CURRENT_QUIZZ.quizzObj.quizzAnswers, wrongAnswer: wrongMsg});
            // for (let key in userCheckedData){
            //     console.log(userCheckedData.length);
            // }
            
    }
    else{
        wrongMsg = "User doesn't select any answers!";
        res.render('get_tests', {user: userName, quizzQuestion: CURRENT_QUIZZ.quizzObj.quizzQuestion,
            quizzAnswers: CURRENT_QUIZZ.quizzObj.quizzAnswers, wrongAnswer: wrongMsg});
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
                CURRENT_QUIZZ = doc;
                //console.log(doc.quizzObj.quizzAnswers);
                let question = doc.quizzObj.quizzQuestion;
                //FIXME: figure out how to get each ansver and sei it up to html
                let answers = doc.quizzObj.quizzAnswers;
                //console.log(answers)
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
