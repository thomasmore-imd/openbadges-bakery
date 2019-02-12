const router = require('express').Router();
const pngitxt = require('png-itxt');
const https = require('https');
const fs = require("fs");
const isURL = require('is-url');
const axios = require('axios');

router.unbake = function (req, res, next) {
    fs.createReadStream('output.png')
        .pipe(
            pngitxt.getitxt('openbadges', function (err, data) {
                if (!err && data) {
                    console.log(data.openbadges, ":", data.value);
                    res.json(data.value);
                }
            }))
}

router.bake = async function (req, res, next) {
    // get badge JSON
    let badgeAssertion = req.body.badge;

    // parse badge assertion and grab the badge property/url
    let badge = req.body.badge.badge;

    // see if a badge URI or document was set
    if (!badge) {
        throw new Error('Your badge assertion is missing the badge property (URI or BadgeClass document)');
    }

    let badgeImage;
    // check if the badge set was a URI
    if (isURL(badge)) {
        // it's a URI, so we need to grab that first and look for the image there
        await axios.get(badge).then(result => {
            badgeImage = result.data.image;
        }).catch(err => {
            console.log(err);
        });

    } else {
        badgeImage = badge.image;
    }

    // grab the image
    axios({
            method: 'get',
            url: badgeImage,
            responseType: 'stream'
        })
        .then(function (response) {
            // bake the data into the image

            response.data.pipe(pngitxt.set({
                    keyword: 'openbadges',
                    value: JSON.stringify(badgeAssertion)
                }, true))
                // write the output badge
                .pipe(fs.createWriteStream('output.png'));
            res.send("done")
        });
}

module.exports = router;