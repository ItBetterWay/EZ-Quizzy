const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    local: {
        userName: String,
        userEmail: String,
        userPassword: String,

        userAnalytics: [
            {
                testId: String,
                passed: Array,
                failed: Array
            }
        ]
    }
});

module.exports = mongoose.model('User', userSchema);