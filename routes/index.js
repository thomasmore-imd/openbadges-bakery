var express = require('express');
var router = express.Router();
const pngitxt = require('png-itxt');
const https = require('https');
const fs = require("fs");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/unbake', function (req, res, next) {
  fs.createReadStream('output.png')
    .pipe(
      pngitxt.getitxt('openbadges', function (err, data) {
        if (!err && data) {
          console.log(data.openbadges, ":", data.value);
          res.json(data.value);
        }
      }))
});

router.post('/bake', function (req, res, next) {

  https.get('https://www.weareimd.be/openbadges/badges/mongodb.png',
    function (image) {

      image
        //.pipe(fs.createReadStream('badge.png'))
        // .pipe(res);
        .pipe(pngitxt.set({
          keyword: 'openbadges',
          value: 'this is my badge bro'
        }, true))
        .pipe(fs.createWriteStream('output.png'));
      res.send("done");
    });
});
module.exports = router;