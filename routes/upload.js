var express = require('express');
const fs = require('fs');
const { exit } = require('process');
var TestsData = require('../models/test');
const { find } = require('../models/test');
var router = express.Router();

/* GET upload page. */
router.get('/', function(req, res, next) {
    //Check if User authorize
    if(req.user){
        let userName = req.user.local.userName;
        return res.render('upload', { title: 'EZ-Quizzy', success: '', user: userName });
      }
    res.render('upload', { title: 'EZ-Quizzy', success: ''});
});

//Upload new document
router.post('/submit', function (req, res, next) {
    //get Test name from form
    let testName = req.body.testName;

    if (req.files){
        let file = req.files.myFile;
        let fileName = file.name;
        
        //Save file to uploads folder
        //FIXME: Needs to check if uploads folder exists, if not create one
        file.mv('./uploads/' + fileName, function (err) {
            if(err){
                return res.status(400).send(err);
            } else {
                // If file successfuly uploaded begin read file
                //Defined function for reading each block (question and ansveers)
                function readBlock(callback) {
                    fs.readFile('./uploads/' + fileName, (err, data) => { 
                        if (err) throw callback(err);
                        callback(null, data);
                    });
                }
                //Implementation for reading each block QA
                readBlock(async function (err, data){
                    let testId;
                    //Check and Print error
                    if(err){
                        console.log(err.message);
                        exit(2);
                    }

                    //Parse data to string
                    let str = data.toString();

                    // Cleaning string
                    let clearStr = ""; 
                    for (let i = 0; i < str.length; i++ )  
                    if(!(str[i] == '\n' || str[i] == '\r')){
                        clearStr += str[i]; 
                    }

                    // Find how many test already hawe in DB
                    await TestsData.find()
                    .then(function (doc) {
                        let testArrayOfName = []
                        doc.forEach(function (doc) {
                            if(!testArrayOfName.includes(doc.testName)){
                                testArrayOfName.push(doc.testName);
                            }
                        });
                        testId = testArrayOfName.length + 1;
                    });

                    //Find all question witch start from *
                    let startIdx = 0;
                    let endIdx = null;
                    let arr = [];
                    for (let i = 0; i < clearStr.length; i++){
                        if (clearStr[i] === '*' && i != 0){
                            endIdx = i;
                            arr.push(clearStr.substring(startIdx, endIdx));
                            startIdx = i;
                        }
                        if (i === clearStr.length - 1){
                            arr.push(clearStr.substring(startIdx, i + 1));
                        }
                    }
                    quizParser(arr, testName, testId);
                });
            }
        });
    } else {
        return res.status(400).send('No files were uploaded.');
    }
    res.render('upload', { title: 'EZ-Quizzy', success: 'File successfully uploaded!'});
});

// Implement test parser
function quizParser(array, testName, testId){
    //Going throw all array and get data
    for (let i = 0; i < array.length; i++){
        //Add object to DB hiere 
        let ress = getQuestion(array[i]);
        // Create new Test object
        let newTest = TestsData();
        
        newTest.testId = testId;
        newTest.testName = testName;

        newTest.quizzObj.quizzId = i + 1;
        
        newTest.quizzObj.quizzQuestion = ress.question;
        newTest.quizzObj.quizzAnswers = ress.ansArr;
        // Save test to Mongo DB
        newTest.save(function(err){
            if(err) throw err;
        });
    }
}

// Find and get each question from document
function getQuestion (block){
    let endOfQuestion = null;
    let question = "";
    
    for (let j = 0; j < block.length; j++){
        if ((block[j] === ")" || block[j] === "@") && question === "" && endOfQuestion === null){
            endOfQuestion = j;
            break;
        }
    }

    question = block.slice(0, endOfQuestion);
    let answers = block.slice(endOfQuestion, block.length);
    let ansArr = getAnsver(answers);
    return {question, ansArr};
}

// Find all ansvers for each question
function getAnsver(str) {
    let answersArray = [];
    
    for (let i = 0; i < str.length; i++){
        let answerObj = {};
        if (str[i] === ")"){
            // Check if ansver is true or false
            if (str[i - 1] === "@"){
                let next = getNext(i, str);
                let ans = str.substring(i, next);
                i = next;
                answerObj.answer = ans;
                answerObj.check = true;
                answersArray.push(answerObj);
            } else {
                let next = getNext(i, str);
                let ans = str.substring(i, next);
                i = next;
                answerObj.answer = ans;
                answerObj.check = false;
                answersArray.push(answerObj);
            }
        }
    }
    return answersArray;
}

//Helper function for finding where starting next answer
function getNext(start, str){
    for (let i = start + 1; i < str.length; i++){
        if(str[i] === ")"){
            return i - 1;
        }
        if (i === str.length - 1){
            return str.length;
        }
    }
}

module.exports = router;
