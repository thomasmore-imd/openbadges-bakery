import test from 'ava';

// load dependencies
const model_assertion = require('../models/assertion');

// test cases
test('version extraction is being tested', t => {
    let validBadge = `{
        "@context": "https://w3id.org/openbadges/v2",
        "type": "Assertion",
        "uid": "https://weareimd.be/openbadges/assertions/u0077344_mongodb.json",
        "id": "https://weareimd.be/openbadges/assertions/u0077344_mongodb.json",
        "recipient": {
            "type": "email",
            "hashed": true,
            "salt": "deadsea",
            "identity": "sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5"
        },
        "issuedOn": "2019-02-01T23:59:59Z",
        "badge": "https://weareimd.be/openbadges/badges/mongodb.json",
        "verify": {
            "type": "hosted",
            "url": "https://weareimd.be/openbadges/assertions/u0077344_mongodb.json"
        }
    }`;
    validBadge = JSON.parse(validBadge);

    let version = model_assertion.extractVersion(validBadge);
    t.is(version, "2.0");

});