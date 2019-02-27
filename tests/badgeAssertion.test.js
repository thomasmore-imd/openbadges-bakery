import test from 'ava';

// # load dependencies
const model_assertion = require('../models/assertion');

// # set up data structures to test with
let validBadge = `{
    "@context": "https://w3id.org/openbadges/v2",
    "type": "Assertion",
    "id": "https://weareimd.be/openbadges/assertions/u0077344_mongodb.json",
    "recipient": {
        "type": "email",
        "hashed": true,
        "salt": "deadsea",
        "identity": "sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5"
    },
    "issuedOn": "2019-02-01T23:59:59Z",
    "expires": "2020-02-30T23:59:59Z",
    "badge": "https://weareimd.be/openbadges/badges/mongodb.json",
    "verify": {
        "type": "hosted"
    }
}`;
validBadge = JSON.parse(validBadge);

// # test cases
test('version extraction is being tested', t => {
    // extract version number from badge assertion
    let version = model_assertion.extractVersion(validBadge);
    t.is(version, "2.0");
});

test('validation of badge assertion structure is being tested', t => {
    let result = model_assertion.hasValidStructure(validBadge);
    t.is(result, true);
});

test('validation type `hosted` is being tested', t => {
    let result = model_assertion.isHosted(validBadge);
    t.is(result, true);
});

test('validation type `signed` is being tested', t => {
    let result = model_assertion.isSigned(validBadge);
    t.is(result, true);
});