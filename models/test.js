const mongoose = require('mongoose');

let testSchema = mongoose.Schema({
    testId: String,
    testName: String,
    testsObj: {
        quizzObj: {
            quizzId: String,
            quizzQuestion: String,
            quizzAnswers: [
                {
                    answer: String,
                    check: Boolean
                }
            ]
        }
    }
    
});

module.exports = mongoose.model('Test', testSchema);