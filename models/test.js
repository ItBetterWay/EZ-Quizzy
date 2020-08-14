const mongoose = require('mongoose');

let testSchema = mongoose.Schema({
    testId: String,
    testName: String,
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
    
});

module.exports = mongoose.model('Test', testSchema);