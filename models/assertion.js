const Validator = require('jsonschema').Validator;
const axios = require('axios');
const moment = require('moment');

function extractVersion(assertion) {
    // extract the version of assertion
    let context = assertion['@context'] || null;
    if (context === "https://w3id.org/openbadges/v2") {
        version = "2.0";
    } else {
        throw new Error("Sorry, we currently only support v2 of the openbadges specification. Please include the correct @context in your badges to continue.")
    }

    return version;
}

function isHosted(assertion) {
    // extract the verification type and see if this is a hosted badge assertion
    let verificationType = assertion.verify.type || assertion.verification.type;
    return assertion.verify.type === 'hosted' || 'HostedBadge' ? true : false;
}

function isSigned(assertion) {
    // extract the verification type and see if this is a signed badge assertion
    let verificationType = assertion.verify.type || assertion.verification.type;
    return assertion.verify.type === 'signed' || 'SignedBadge' ? true : false;
}

function isAssertionUrlAvailable(assertion) {
    return axios.get(assertion.id)
        .then(function (response) {
            // handle success
            if (response.status == 200) {
                return true;
            } else {
                return false;
            }
        })
        .catch(function (error) {
            // handle error
            return false;
        });
}

function isExpired(assertion) {

    if (assertion.hasOwnProperty("expires")) {

        let now = moment();

        if (!moment(assertion.expires, moment.ISO_8601).isValid() || moment(assertion.expires).isBefore(now)) {
            return true;
        }
    }
    return false;
}

function getHostedAssertion(assertion) {
    // get the assertion from the online URL in order to verify its contents
    return axios.get(assertion.id)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            // handle error
            return false;
        });
}

async function isValid(assertion) {
    // first, validate the structure of the assertion JSON
    let isStructureValid = hasValidStructure(assertion);
    if (isStructureValid !== true) {
        return "The structure of this badge is badly formatted.";
    }

    if (isHosted(assertion)) {
        // first, we check if the validatin URL is available at all 
        let isAvailable = await isAssertionUrlAvailable(assertion);
        if (!isAvailable) {
            return "This is a hosted badge but the verification URL could not be reached.";
        }

        // again, revalidate structure, this time by using the online badge assertion json
        let hostedBadgeAssertion = await getHostedAssertion(assertion);
        let isStructureValid = hasValidStructure(hostedBadgeAssertion);
        if (isStructureValid !== true) {
            return "The structure of this badge is badly formatted.";
        }

        // if the badge contains an expiry date, validate it
        if (isExpired(hostedBadgeAssertion)) {
            return "This badge seems to be expired.";
        }

    }

    // if all checks pass, return true because the badge isValid
    return true;
}

function hasValidStructure(assertion) {
    let version = extractVersion(assertion);

    //console.log(assertion);
    const v = new Validator();

    var recipientSchema = {
        "type": "object",
        "properties": {
            "identity": {
                "type": "string"
            },
            "type": {
                "type": "string"
            },
            "hashed": {
                "type": "boolean"
            }
        },
        "required": ["identity", "type", "hashed"]
    };

    var verifySchema = {
        "type": "object",
        "properties": {
            "type": {
                "type": "string"
            }
        }
    };

    var schema = {
        "type": "object",
        "properties": {
            "id": {
                "type": "string"
            },
            "type": {
                "type": ["string", "array"]
            },
            "recipient": {
                "$ref": "/recipient"
            },
            "badge": {
                "type": ["string", "document"]
            },
            "issuedOn": {
                "type": "string",
                "format": "date-time"
            }
        },
        "required": ["id", "type", "recipient", "badge", "issuedOn"],
        "anyOf": [{
                "required": ['verification']
            },
            {
                // the verify alias is also valid to use
                "required": ['verify'],
                "properties": {
                    "verify": {
                        "$ref": "/verify"
                    }
                }
            }
        ]
    };


    let options = {
        throwError: false
    }

    v.addSchema(recipientSchema, '/recipient');
    v.addSchema(verifySchema, '/verify');
    let result = v.validate(assertion, schema, options);

    if (result.errors.length === 0) {
        return true;
    } else {
        return result;
    }

}

module.exports.isValid = isValid;
module.exports.extractVersion = extractVersion;
module.exports.isHosted = isHosted;
module.exports.isSigned = isSigned;
module.exports.hasValidStructure = hasValidStructure;