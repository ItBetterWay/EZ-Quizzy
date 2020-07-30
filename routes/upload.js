var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('upload', { title: 'EZ-Quizzy', success: '' });
});

router.post('/submit', function (req, res, next) {
    console.log(req.body.testName);
    if (req.files){
        let file = req.files.myFile;
        let fileName = file.name;

        file.mv('./uploads/' + fileName, function (err) {
            if(err){
                return res.status(400).send(err);
            } else {
                //res.redirect('/upload');
                console.log('File uploaded!!!');
            }
        });
    } else {
        return res.status(400).send('No files were uploaded.');
    }
    res.render('upload', { title: 'EZ-Quizzy', success: 'File successfully uploaded!'});
});

module.exports = router;
