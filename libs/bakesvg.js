const axios = require('axios');
const path = require('path');
const uniqueFilename = require('unique-filename');
const fs = require("fs");
const cheerio = require('cheerio')
const util = require('util');

async function bake(badgeImage, badgeAssertion) {
    // we generate a unique filename that starts with prefix "my-badge"
    let filename = uniqueFilename("", 'my-badge') + ".svg";
    let fullpath = path.resolve('./public/tempbadges');
    // grab the image
    return axios({
            method: 'get',
            url: badgeImage,
            responseType: 'text'
        })
        .then(function (response) {
            // based on https://github.com/mozilla/openbadges-bakery/blob/master/lib/svg.js

            let svg = response.data;

            // let's manipulate our image
            const $ = cheerio.load(svg, {
                xmlMode: true
            });

            // add namespace information
            $('svg').attr("xmlns:openbadges", "http://openbadges.org");

            // add the badge assertion
            let format = `
            <openbadges:assertion verify="%s">
            <![CDATA[
            %s
            ]]>
            </openbadges:assertion>`;

            let assertionUri = badgeAssertion.id;
            let assertionContents = JSON.stringify(badgeAssertion);
            const element = util.format(format, assertionUri, assertionContents);

            $('svg').prepend(element);

            // write the file
            fs.writeFile(fullpath + "/" + filename, $.xml(), function (err, data) {
                if (err) console.log(err);
                console.log("Successfully Written to File.");
            });

            return filename;
        }).catch(function (err) {
            console.log(err);
        });
}


module.exports = {
    bake: bake
}