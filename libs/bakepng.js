const axios = require('axios');
const path = require('path');
const uniqueFilename = require('unique-filename');
const pngitxt = require('png-itxt');
const fs = require("fs");

module.exports.bake = async function (badgeImage, badgeAssertion) {
    // we generate a unique filename that starts with prefix "my-badge"
    let filename = uniqueFilename("", 'my-badge') + ".png";
    let fullpath = path.resolve('./public/tempbadges');

    // grab the image
    return axios({
            method: 'get',
            url: badgeImage,
            responseType: 'stream'
        })
        .then(function (response) {
            response.data
                .pipe(
                    // bake JSON into the PNG as a string
                    pngitxt.set({
                        keyword: 'openbadges',
                        value: JSON.stringify(badgeAssertion)
                    }, true))
                // write the output badge
                .pipe(fs.createWriteStream(fullpath + "/" + filename));
            return filename;
        }).catch(function (err) {
            console.log(err);
        });
}