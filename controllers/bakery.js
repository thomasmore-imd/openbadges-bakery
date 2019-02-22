const router = require("express").Router();
const pngitxt = require("png-itxt");
const fs = require("fs");
const isURL = require("is-url");
const axios = require("axios");
const bakepng = require("../libs/bakepng");
const bakesvg = require("../libs/bakesvg");
const modelAssertion = require("../models/assertion");

router.unbake = function (req, res, next) {
  let openbadge;

  var stream = fs.createReadStream(req.file.path).pipe(
    pngitxt.getitxt("openbadges", function (err, data) {
      if (!err && data) {
        openbadge = data.value;
      }
    })
  );

  stream.on("end", function () {
    if (openbadge) {

      let assertion = JSON.parse(openbadge);
      // let's try to validate the badge 
      try {
        modelAssertion.validate(assertion);
      } catch (err) {
        let friendlyErrorMessage = err.message;

        res.status(500).send({
          error: friendlyErrorMessage
        });

        return false;
      }


      res.json({
        status: "success",
        assertion: openbadge
      });

    } else {
      res.status(500).send({
        'error': "The uploaded image is not a valid open badge."
      });
    }
  });

  // console.log(req.file);
  let isSvg = req.file.mimetype.includes("svg");
  let isPng = req.file.mimetype.includes("png");
};

router.bake = async function (req, res, next) {
  // get badge JSON
  let badgeAssertion = req.body.badge;

  try {
    modelAssertion.validate(badgeAssertion);
  } catch (err) {
    let friendlyErrorMessage = err.message;

    res.status(500).send({
      error: friendlyErrorMessage
    });

    return false;
  }

  // parse badge assertion and grab the badge property/url
  let badge = req.body.badge.badge;

  // see if a badge URI or document was set
  if (!badge) {
    res.status(500).send({
      error: "Your badge assertion is missing the badge property (URI or BadgeClass document)"
    });
  }

  let badgeImage;
  // check if the badge set was a URI
  if (isURL(badge)) {
    // it's a URI, so we need to grab that first and look for the image there
    await axios
      .get(badge)
      .then(result => {
        badgeImage = result.data.image;
      })
      .catch(err => {
        // e.g. 404 errors on images get caught here
        res.status(500).send({
          error: "The image linked in your badge could not be reached. Please make sure it exists."
        });
      });
  } else {
    badgeImage = badge.image;
  }

  let extension = badgeImage.substring(
    badgeImage.length - 3,
    badgeImage.length
  );
  if (extension === "png") {
    var filename = await bakepng.bake(badgeImage, badgeAssertion);
  } else if (extension === "svg") {
    var filename = await bakesvg.bake(badgeImage, badgeAssertion);
  } else {
    res.status(500).send({
      error: "Only .png or .svg files can be baked."
    });
  }

  res.status(200).json({
    status: "success",
    downloadUrl: filename
  });
};

module.exports = router;