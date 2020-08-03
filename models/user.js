const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    local: {
        userName: String,
        userEmail: String,
        userPassword: String,
        //TODO: figure out how to check and save analitics from each Test to User profile 
        userAnalytics: [
            {
                testId: String,
                passed: [{
                    passedId: String
                }],
                failed: [{
                    failedId: String 
                }]
            }
        ]
    }
});

module.exports = mongoose.model('User', userSchema);