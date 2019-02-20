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
                "required": ['verify']
            }
        ]
    };


    let options = {
        throwError: true
    }

    v.addSchema(recipientSchema, '/recipient');
    let result = v.validate(assertion, schema, options);
    console.log(result);
    return result;
}

module.exports.validate = validate;
module.exports.extractVersion = extractVersion;