var express = require('express');
var TestsData = require('../models/test');
var router = express.Router();

/* GET users listing. */
router.get('/', isLoggedIn, async function(req, res) {
  //console.log(req.user);
  let userName = req.user.local.userName;
  let userEmail = req.user.local.userEmail;
  let userPassword = req.user.local.userPassword;
  let userProgressObj = await getUserProgress(req.user);
  res.render('profile', {userName: userName, email: userEmail, userPassword: userPassword,
            user: userName, userProgress: userProgressObj});
});

//Check if user is loged In
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

//Get user progress from user analytics
async function getUserProgress(userProfile){
  let userAnalyticsArray = userProfile.local.userAnalytics;
  let resultArray = [];
  
  for(let i = 0; i < userAnalyticsArray.length; i++){
    let currentTest = userAnalyticsArray[i];
    let currentProgressObj = {
      testId: '',
      testName: '',
      percentage: ''
    }
    currentProgressObj.testId = currentTest.testId;
    await TestsData.findOne({"testId": currentTest.testId})
            .then(function (doc) {
              currentProgressObj.testName = doc.testName;
            });
    
    currentProgressObj.percentage = getTestScore(currentTest.passed, currentTest.failed);

    resultArray.push(currentProgressObj);
  }
  return resultArray;
}
//Calculate compleate percentage for each test
function getTestScore(pass, faile){
  let max = pass.length + faile.length;
  let percentage = Math.round((pass.length / max) * 100);
  return percentage;
}

module.exports = router;
