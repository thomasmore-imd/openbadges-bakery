const Validator = require('jsonschema').Validator;

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

function validate(assertion) {
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
        throwError: true
    }

    v.addSchema(recipientSchema, '/recipient');
    v.addSchema(verifySchema, '/verify');
    let result = v.validate(assertion, schema, options);
    return result;
}

module.exports.validate = validate;
module.exports.extractVersion = extractVersion;
module.exports.isHosted = isHosted;
module.exports.isSigned = isSigned;