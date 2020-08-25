var express = require('express');
var router = express.Router();
var TestsData = require('../models/test');
const User = require('../models/user');
const { find } = require('../models/test');
const url = require('url'); 
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
            //Check if user checked one or more answers or no one
            // Checked multiple answers
            if (typeof userCheckedData === "object"){
                let tryAnswers = 0;
                let trySelectAnswers = 0;
                //Find how many try answers in current quizz
                //FIXME: first time error quizzAnswer undefind
                let answers= CURRENT_QUIZZ.quizzObj.quizzAnswers;
                for (let i = 0; i < answers.length; i++){
                    let {check} = answers[i];
                    if(check) tryAnswers++;
                }
                //Compare selected answers with try answer
                for (let i = 0; i < answers.length; i++){
                    let {check, _id} = answers[i];
                    for(let j = 0; j < userCheckedData.length; j++){
                        let currentSelectedAnswer = userCheckedData[j];
                        if(check && new String(_id).valueOf() === new String(currentSelectedAnswer).valueOf()){
                            trySelectAnswers++;
                        }
                    }
                }
                // If user answers OK go to next quizz else show current quizz again with error massage
                if(Number(tryAnswers) === Number(userCheckedData.length) &&  Number(tryAnswers) === Number(trySelectAnswers)){
                    console.log("SUCCESS");
                    let newUserAnalytics = [];
                    await User.findOne({"local.userEmail": req.user.local.userEmail})
                    .then(function (doc) {
                        for(let i = 0; i < doc.local.userAnalytics.length; i++){
                            let currentTestObj = doc.local.userAnalytics[i];
                            if(currentTestObj.testId === CURRENT_QUIZZ.testId){
                               let {passed, failed} = currentTestObj;
                               let fail = failed.shift();
                               passed.push(fail);
                            }
                        }
                        newUserAnalytics = doc.local.userAnalytics;
                    });
                    //Update user analytics
                    await User.findOneAndUpdate({"local.userEmail": req.user.local.userEmail},
                    {"local.userAnalytics": newUserAnalytics }, {new: true});

                    res.redirect(url.format({
                        //FIXME: encode and decode path and testId
                        pathname:"/tests/get-tests",
                        query: {
                           "testId": CURRENT_QUIZZ.testId
                         }
                      }));

                } else {
                    wrongMsg = "Wrong answer please try again";
                    res.render('get_tests', {user: userName, quizzQuestion: CURRENT_QUIZZ.quizzObj.quizzQuestion,
                        quizzAnswers: CURRENT_QUIZZ.quizzObj.quizzAnswers, wrongAnswer: wrongMsg, currentTestId: CURRENT_QUIZZ.testId});
                }
            } 

            // Checked only one answer
            else if(typeof userCheckedData === "string") {
                let oneOk = false;
                let curentTryAnswers = 0;
                let answers= CURRENT_QUIZZ.quizzObj.quizzAnswers;
                //Ceck how meny try answers in curent quizz
                for (let i = 0; i < answers.length; i++){
                    let {check} = answers[i];
                    if (check) curentTryAnswers++;
                }
                // Check if curent guizz has more than one try answer
                //Going throw all try answers and compaire try answer with user answer
                for(let i = 0; i < answers.length; i++){
                    let {check, _id} = answers[i];
                    if(check && new String(_id).valueOf() === new String(userCheckedData).valueOf()){
                        oneOk = check;
                        break;
                    }else{
                        wrongMsg = "Wrong answer please try again";
                    }
                }
                if (curentTryAnswers != 1){
                    wrongMsg = "Curent Quizz has more then one try ansvwer!";
                    oneOk = false;
                }

                // If user answer OK go to next quizz else show current quizz again with error massage
                if(oneOk){
                    let newUserAnalytics = [];
                    await User.findOne({"local.userEmail": req.user.local.userEmail})
                    .then(function (doc) {
                        for(let i = 0; i < doc.local.userAnalytics.length; i++){
                            let currentTestObj = doc.local.userAnalytics[i];
                            if(currentTestObj.testId === CURRENT_QUIZZ.testId){
                               let {passed, failed} = currentTestObj;
                               let fail = failed.shift();
                               passed.push(fail);
                            }
                        }
                        newUserAnalytics = doc.local.userAnalytics;
                    });
                    //Update user analytics
                    await User.findOneAndUpdate({"local.userEmail": req.user.local.userEmail},
                    {"local.userAnalytics": newUserAnalytics }, {new: true});

                    res.redirect(url.format({
                        //FIXME: encode and decode path and testId
                        pathname:"/tests/get-tests",
                        query: {
                           "testId": CURRENT_QUIZZ.testId
                         }
                      }));
                } else{
                    wrongMsg = "Wrong answer try again!!!";
                    res.render('get_tests', {user: userName, quizzQuestion: CURRENT_QUIZZ.quizzObj.quizzQuestion,
                        quizzAnswers: CURRENT_QUIZZ.quizzObj.quizzAnswers, wrongAnswer: wrongMsg, currentTestId: CURRENT_QUIZZ.testId});
                }
            }
    }
    else{
        wrongMsg = "User doesn't select any answers!";
        res.render('get_tests', {user: userName, quizzQuestion: CURRENT_QUIZZ.quizzObj.quizzQuestion,
            quizzAnswers: CURRENT_QUIZZ.quizzObj.quizzAnswers, wrongAnswer: wrongMsg, currentTestId: CURRENT_QUIZZ.testId});
    }
});

router.get('/get-tests', async function(req, res, next) {
    // Check if User is authorize if YES begin testing else go to login page
    if(req.user){
        let userName = req.user.local.userName;

        const queryObject = url.parse(req.url, true).query;
        console.log("QUERY IDD " + queryObject.testId);


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
                console.log("Arr " + failedArrayByTestId.length)
                console.log("TESTID " + req.query.testId);
                console.log("ANALYTICS " + userAnalytics);
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
                let question = doc.quizzObj.quizzQuestion;
                let answers = doc.quizzObj.quizzAnswers;
                res.render('get_tests', {user: userName, quizzQuestion: question, quizzAnswers: answers, currentTestId: req.query.testId});
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

            res.redirect(url.format({
                //FIXME: encode and decode path and testId
                pathname:"/tests/get-tests",
                query: {
                   "testId": choosedTestId
                 }
              }));
        }
    }
});

module.exports = router;
