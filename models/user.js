const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    local: {
        userName: String,
        userEmail: String,
        userPassword: String
    }
});

module.exports = mongoose.model('User', userSchema);