var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

const Schema = mongoose.Schema;

let testDataSchema = new Schema({
    question: String,
    answers: [
        {
            check: Boolean,
            answer: String
        }
    ]
});

let TestsData = mongoose.model('test', testDataSchema);

/* GET tests page. */
router.get('/', function(req, res, next) {
    TestsData.find()
        .then(function (doc) {
            let ID = '';
            doc.forEach(function (doc) {
                console.log(doc._id);
                ID = doc._id;
            });
            res.render('tests', { title: ID });
        });

});

/* GET tests from DB. */
router.get('/get-tests', function(req, res, next) {
    TestsData.find()
        .then(function (doc) {
            console.log(doc);
            res.send('respond with a resource' + doc);
        });
});

module.exports = router;
